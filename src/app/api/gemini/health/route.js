import { NextResponse } from "next/server";
import { getGemini, pickAvailableModel } from "@/lib/gemini";

export async function GET() {
  try {
    const ai = getGemini();
    const list = await (ai.models?.list?.() || []);
    const names = Array.isArray(list?.models) ? list.models.map((m) => m.name || m.model) : list;
    let testText = null;
    try {
      const modelId = await pickAvailableModel(ai, ["gemini-2.5-flash", "gemini-1.5-flash-latest"]);
      const resp = await ai.models.generateContent({ model: modelId, contents: "ping" });
      testText = resp?.text || null;
    } catch (e) {
      testText = `gen error: ${e?.status || e?.message || e}`;
    }
    return NextResponse.json({ ok: true, names, testText });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
