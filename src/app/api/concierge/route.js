import { NextResponse } from "next/server";
import { generateSafetyAnswer } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { query, location, hour } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    const locHint = location && typeof location.lat === 'number' && typeof location.lng === 'number'
      ? `\nLocation hint: lat ${location.lat.toFixed(4)}, lng ${location.lng.toFixed(4)}.`
      : '';
    const timeHint = typeof hour === 'number' ? `\nLocal hour: ${hour}.` : '';
    const prompt = `${query}${locHint}${timeHint}`;
  const answer = await generateSafetyAnswer(prompt, { model: "gemini-2.5-flash" });
    return NextResponse.json({ answer });
  } catch (e) {
    console.error("concierge error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
