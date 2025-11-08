import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

let client;
export function getGemini() {
  if (!client) {
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY env var");
  client = new GoogleGenAI({ apiKey });
  }
  return client;
}

let _modelsCache = { time: 0, list: null };
async function listModels(genAI) {
  const now = Date.now();
  if (_modelsCache.list && now - _modelsCache.time < 10 * 60 * 1000) return _modelsCache.list;
  try {
    const res = await genAI.models?.list?.();
    let models = [];
    if (Array.isArray(res)) {
      models = res;
    } else if (Array.isArray(res?.models)) {
      models = res.models;
    } else if (res?.models && typeof res.models[Symbol.iterator] === "function") {
      models = Array.from(res.models);
    } else if (res && typeof res[Symbol.iterator] === "function") {
      models = Array.from(res);
    } else {
      models = [];
    }
    _modelsCache = { time: now, list: models };
    return models;
  } catch {
    return [];
  }
}

function normalizeId(name) {
  if (!name) return name;
  return name.startsWith("models/") ? name.replace(/^models\//, "") : name;
}

function scoreModel(name) {
  const n = name || "";
  // Higher score is better
  if (/1\.5[-.]flash[-.]latest/i.test(n)) return 100;
  if (/1\.5[-.]pro[-.]latest/i.test(n)) return 95;
  if (/1\.5[-.]flash[-.]8b[-.]latest/i.test(n)) return 92;
  if (/1\.5[-.]flash[-.]8b/i.test(n)) return 90;
  if (/1\.5[-.]flash/i.test(n)) return 85;
  if (/1\.5[-.]pro/i.test(n)) return 80;
  if (/pro/i.test(n)) return 60;
  return 10;
}

export async function pickAvailableModel(genAI, preferredIds = []) {
  // Try preferred candidates first
  for (const m of preferredIds.filter(Boolean)) {
    try {
  await genAI.models.generateContent({ model: m, contents: "ping" });
      return m;
    } catch (e) {
      if (e?.status && e.status !== 404) return m; // non-404: likely auth/quota; accept and let caller handle
    }
  }
  // Then pick from listModels
  const all = await listModels(genAI);
  const candidates = (all || [])
    .filter((m) => {
      const methods = m?.supportedGenerationMethods || m?.capabilities || [];
      return Array.isArray(methods) ? methods.includes("generateContent") : true;
    })
    .map((m) => normalizeId(m.name || m.model || ""))
    .filter(Boolean)
    .sort((a, b) => scoreModel(b) - scoreModel(a));
  if (candidates.length) return candidates[0];
  // Last resorts
  return preferredIds.find(Boolean) || "gemini-1.5-flash-latest";
}

export async function generateSafetyAnswer(prompt, opts = {}) {
  const genAI = getGemini();
  const preferred = [
    opts.model,
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-8b-latest",
  ].filter(Boolean);
  let available = [];
  try {
    available = await listModels(genAI);
  } catch {
    available = [];
  }
  const availSorted = (Array.isArray(available) ? available : [])
    .map((m) => normalizeId(m?.name || m?.model || ""))
    .filter(Boolean)
    .sort((a, b) => scoreModel(b) - scoreModel(a));
  const fallbacks = [
    "gemini-1.5-flash-002",
    "gemini-1.5-pro-002",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-8b",
    "gemini-1.0-pro",
    "gemini-pro",
  ];
  const seen = new Set();
  const candidates = [...preferred, ...availSorted, ...fallbacks].filter((m) => {
    if (seen.has(m)) return false;
    seen.add(m);
    return true;
  });
  const system = `You are Safety Concierge for women's safety, named Nirbhaya Setu.
Always be concise, practical, and avoid fearmongering.
Prefer actionable advice: lighting, crowd density, safe alternatives, contacting help, and SOS usage.
If location context is provided, tailor guidance to time-of-day risks. Never fabricate stats.`;
  const final = `${system}\n\nUser: ${prompt}`;
  for (const m of candidates) {
    try {
      const resp = await genAI.models.generateContent({ model: m, contents: final });
      const text = resp?.text || resp?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text?.trim()) {
        console.info("Gemini concierge using model:", m);
        return cleanSafetyAnswer(text.trim());
      }
    } catch (e) {
      console.warn("Gemini concierge model failed:", m, e?.status || e?.message || e);
      continue; // try next model
    }
  }
  return "Model temporarily unavailable. Please retry in a moment.";
}

// Basic formatting cleanup: normalize bullets, collapse spaces, remove stray leading markers.
function cleanSafetyAnswer(raw) {
  if (!raw) return raw;
  // Replace asterisks used as bullets with hyphen bullets for consistency.
  const lines = raw.split(/\r?\n/).map(l => l.trim());
  const cleaned = lines.map(l => {
    // Convert "*" or "•" bullet starts to "-"
    if (/^[*•]\s+/.test(l)) l = l.replace(/^[*•]\s+/, '- ');
    // Remove accidental double bullet markers like "- - "
    l = l.replace(/^(-)\s+[-*•]\s+/, '$1 ');
    // Normalize bold heading pattern: **Title:** to **Title:** (already) but remove extra spaces
    l = l.replace(/\*\*\s+([^*]+?)\s+\*\*/g, '**$1**');
    return l;
  });
  // Remove consecutive blank lines
  const compact = [];
  for (const l of cleaned) {
    if (l === '' && compact[compact.length - 1] === '') continue;
    compact.push(l);
  }
  const joined = compact.join('\n').trim();
  // If content has no list markers, keep as is; else ensure a summary first line separate from bullets
  return joined;
}
