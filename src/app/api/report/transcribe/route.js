import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio");
    if (!file) return NextResponse.json({ error: "No audio" }, { status: 400 });
    // TODO: Integrate Google Gemini Audio API using GEMINI_API_KEY
    // For now we return a mocked transcript & summary
    return NextResponse.json({
      transcript: "[Mocked transcript] Female voice reports suspicious loitering near dimly lit alley at 9:15 PM.",
      summary: "Suspicious activity reported near poorly lit area around 9:15 PM.",
    });
  } catch (e) {
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
