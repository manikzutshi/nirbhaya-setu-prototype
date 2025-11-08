import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { pickAvailableModel } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio");
    if (!file) return NextResponse.json({ error: "No audio" }, { status: 400 });
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

  const genAI = new GoogleGenAI({ apiKey });
  const modelId = await pickAvailableModel(genAI, ["gemini-2.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest"]);

    const prompt = `You will receive an audio recording of an incident report. 
Transcribe concisely and then provide a one-sentence safety summary starting with 'Summary:'.`;

    const mimeType = file.type || "audio/webm";
    const resp = await genAI.models.generateContent({
      model: modelId,
      contents: [
        { parts: [{ text: prompt }] },
        { parts: [{ inlineData: { data: Buffer.from(bytes).toString("base64"), mimeType } }] },
      ],
    });
    const full = resp?.text || "";
    const transcript = full.replace(/Summary:[\s\S]*/i, "").trim() || full.trim();
    const summaryMatch = full.match(/Summary:\s*([\s\S]*)/i);
    const summary = summaryMatch ? summaryMatch[1].trim() : undefined;

    return NextResponse.json({ transcript, summary });
  } catch (e) {
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
