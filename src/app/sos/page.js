"use client";

import { useEffect, useRef, useState } from "react";
import { Siren, Phone, ChatCircle, X, Check, SpinnerGap } from "../components/PhosphorIcons";
import { useLocation } from "../components/LocationProvider";
import GMap from "../components/GMap";

export default function SosPage() {
  const [active, setActive] = useState(false);
  const [contactsAlerted, setContactsAlerted] = useState(false);
  const [authoritiesNotified, setAuthoritiesNotified] = useState(false);
  const [eta, setEta] = useState(7); // minutes remaining mock
  const [transcript, setTranscript] = useState([]);
  const [listening, setListening] = useState(false);
  const [panicWord, setPanicWord] = useState("help");
  const recognitionRef = useRef(null);
  const etaTimerRef = useRef(null);
  const { location: userLoc } = useLocation();

  // Load persisted panic word and toggle
  useEffect(() => {
    try {
      const pw = localStorage.getItem('panicWord');
      if (pw) setPanicWord(pw);
      const en = localStorage.getItem('voiceTriggerEnabled');
      if (en === 'true') setListening(true);
    } catch {}
  }, []);

  // Persist settings when changed
  useEffect(() => {
    try { localStorage.setItem('panicWord', panicWord || ''); } catch {}
  }, [panicWord]);
  useEffect(() => {
    try { localStorage.setItem('voiceTriggerEnabled', listening ? 'true' : 'false'); } catch {}
  }, [listening]);

  // Setup speech recognition for ambient transcript + panic word trigger
  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(" ").trim();
      if (!text) return;
      setTranscript(t => [...t.slice(-19), `[User]: ${text}`]);
      if (panicWord && text.toLowerCase().includes(panicWord.toLowerCase())) {
        if (!active) startSos();
      }
    };
    rec.onend = () => {
      if (listening) {
        try { rec.start(); } catch { /* ignore */ }
      }
    };
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [listening, panicWord, active]);

  function vibrate(pattern) {
    try { if (navigator?.vibrate) navigator.vibrate(pattern); } catch {}
  }

  async function startSos() {
    setActive(true);
    vibrate([150,70,250,70,300]);
  // Navigate feedback for external triggers
  try { if (window?.history?.pushState) window.history.replaceState(null, '', '/sos'); } catch {}
    // Trigger backend (stub AWS SNS)
    fetch("/api/sos/activate", { method: "POST" }).catch(() => {});
    // Simulate checklist progression
    setTimeout(() => setContactsAlerted(true), 1200);
    setTimeout(() => setAuthoritiesNotified(true), 2500);
    // Start ETA countdown
    etaTimerRef.current = setInterval(() => {
      setEta(m => {
        if (m <= 1) { clearInterval(etaTimerRef.current); return 0; }
        return m - 1;
      });
    }, 60000);
    // Begin ambient listening if supported
    if (recognitionRef.current && !listening) {
      setListening(true);
      try { recognitionRef.current.start(); } catch {}
    }
  }

  function cancelSos() {
    setActive(false);
    vibrate(80);
    setListening(false);
    try { recognitionRef.current?.stop(); } catch {}
  }

  function toggleListening() {
    if (!recognitionRef.current) return;
    setListening(l => !l);
    if (!listening) { try { recognitionRef.current.start(); } catch {} } else { try { recognitionRef.current.stop(); } catch {} }
  }

  return (
    <div className="min-h-screen bg-base-100 pb-24 pt-6">
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 lg:grid lg:grid-cols-12 lg:gap-10">
        {/* LEFT: Map + status */}
        <div className="lg:col-span-7 xl:col-span-8">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Siren className={`${active ? "text-error" : "text-base-content"} h-5 w-5`} /> {active ? "SOS ACTIVE" : "Emergency SOS"}
          </h1>
          <p className="text-xs text-base-content/60 mt-1">{active ? "Help is on the way." : "Trigger SOS to alert contacts and authorities."}</p>

          <div className="mt-4 relative rounded-xl overflow-hidden shadow border border-base-300 bg-base-100" style={{ height: 320 }}>
            <GMap
              zoom={15}
              center={userLoc || { lat: 28.6139, lng: 77.2090 }}
              markers={userLoc ? [{ position: userLoc, color: '#2563eb', label: 'You' }] : []}
              circles={[
                userLoc && { center: userLoc, radius: 120, strokeColor: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.15 },
                userLoc && { center: userLoc, radius: 250, strokeColor: '#f97316', fillColor: '#f97316', fillOpacity: 0.12 },
                userLoc && { center: userLoc, radius: 400, strokeColor: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.10 },
              ].filter(Boolean)}
            />
            {active && (
              <div className="absolute top-2 left-2 flex flex-col gap-2">
                <span className="badge badge-error">Distress</span>
              </div>
            )}
            {active && (
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
                <span className="font-medium">Response ETA</span>
                <span className="font-bold text-primary">{eta} min</span>
              </div>
            )}
          </div>

          <div className="mt-6 bg-base-100 border border-base-300 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
            <h2 className="text-sm font-bold">Status</h2>
            <ChecklistItem done={contactsAlerted} label="Contacts Alerted" detail="3/3" />
            <ChecklistItem done={authoritiesNotified} label="Authorities Notified" />
            <ChecklistItem done={eta === 0} label="Responder Arrival" detail={eta === 0 ? "Arrived" : "En route"} />
          </div>
        </div>

        {/* RIGHT: Settings + transcript + actions */}
        <aside className="mt-10 lg:mt-0 lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-base-100 border border-base-300 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Voice Trigger</h3>
                <p className="text-xs text-base-content/60">Hands-free activation using panic word</p>
              </div>
              {listening && <span className="badge badge-info">Listening</span>}
            </div>
            <div>
              <label htmlFor="panicWordInput" className="block mb-2 text-xs font-semibold">Panic Word</label>
              <input id="panicWordInput" className="input input-bordered w-full input-sm" value={panicWord} onChange={(e) => setPanicWord(e.target.value)} placeholder="e.g., help me" />
              <p className="text-[11px] text-base-content/50 mt-1">Say this word loudly to auto-trigger SOS.</p>
            </div>
            <label className="flex items-center justify-between cursor-pointer p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
              <span className="text-xs font-semibold">Enable Voice Trigger</span>
              <input type="checkbox" className="toggle toggle-primary" checked={listening} onChange={toggleListening} />
            </label>
          </div>

          <div className="bg-base-100 border border-base-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Live Transcript</h3>
              <span className="text-[10px] text-base-content/50">Gemini (mock)</span>
            </div>
            {transcript.length === 0 ? (
              <p className="text-xs text-base-content/50">No speech captured yet…</p>
            ) : (
              <ul className="space-y-1 max-h-40 overflow-y-auto text-xs leading-relaxed">
                {transcript.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {!active ? (
              <button className="btn btn-error w-full btn-lg text-lg font-bold shadow-2xl" onClick={startSos}>
                <Siren className="h-6 w-6" /> EMERGENCY SOS
              </button>
            ) : (
              <button className="btn btn-error w-full btn-lg text-lg font-bold" disabled>
                <Siren className="h-6 w-6" /> SOS ACTIVATED
              </button>
            )}
            <div className="flex gap-2 w-full">
              <button className="btn btn-outline flex-1" onClick={() => vibrate(40)}>
                <Phone className="h-5 w-5" /> Call
              </button>
              <button className="btn btn-outline flex-1" onClick={() => vibrate(40)}>
                <ChatCircle className="h-5 w-5" /> Message
              </button>
              {active && (
                <button className="btn btn-ghost flex-1" onClick={cancelSos}>
                  <X className="h-5 w-5" /> Cancel
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChecklistItem({ done, label, detail }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
  {done ? <Check className="text-success h-4 w-4" /> : <SpinnerGap className="text-base-content/40 h-4 w-4" />}
        <span className={done ? "font-semibold" : ""}>{label}{detail ? ` (${detail})` : ""}</span>
      </div>
      <span className="text-[10px] text-base-content/50">{done ? "Done" : "Pending"}</span>
    </div>
  );
}

function SimpleZoneMap({ active }) {
  const width = 360; const height = 240;
  const zones = [
    { x: 100, y: 120, r: 110, color: "#22c55e" },
    { x: 180, y: 130, r: 80, color: "#f59e0b" },
    { x: 220, y: 150, r: 60, color: "#ef4444" },
  ];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc" />
      {zones.map((z, i) => (
        <circle key={i} cx={z.x} cy={z.y} r={z.r} fill={z.color} fillOpacity={0.28} />
      ))}
      {active && <pulse-circle cx={180} cy={140} r={14} />}
      {/* User marker */}
      <circle cx={180} cy={140} r={10} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
    </svg>
  );
}

// Inline icon components replaced with Phosphor
