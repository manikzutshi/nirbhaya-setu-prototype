import { NextResponse } from "next/server";
import { generateSafetyAnswer } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { origin, destination, hour } = await request.json();
    if (!origin || !destination) return NextResponse.json({ error: "Missing origin/destination" }, { status: 400 });
    const prompt = `Suggest the safest walking route and 3 concrete tips between these two points.
Origin: ${typeof origin === 'string' ? origin : JSON.stringify(origin)}
Destination: ${typeof destination === 'string' ? destination : JSON.stringify(destination)}
Local hour: ${hour ?? 'unknown'}
Focus on lighting, crowd flow, and landmarks. Keep it under 120 words.`;
  const text = await generateSafetyAnswer(prompt, { model: "gemini-2.5-flash" });
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
