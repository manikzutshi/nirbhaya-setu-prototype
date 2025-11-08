import { NextResponse } from "next/server";

// Stubbed Gemini concierge endpoint. Replace with real API call later.
export async function POST(request) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // Basic mock logic: categorize safety intent
    const lower = query.toLowerCase();
    let answer;
    if (/(safe|safety score|secure)/.test(lower)) {
      answer = "Current average safety score near your location is 8.2/10 (Very Safe). Lighting and community presence are strong right now.";
    } else if (/market|bazaar|crowd/.test(lower)) {
      answer = "The market area sees moderate crowd density at this hour. Stay aware of surroundings; pick well-lit routes and avoid isolated alleys after 9 PM.";
    } else if (/night|late|dark/.test(lower)) {
      answer = "Risk increases after 10 PM. Prefer main roads with lighting, share trip status, and keep SOS accessible.";
    } else if (/route|path|way/.test(lower)) {
      answer = "Safest route: Choose arterial roads with CCTV coverage and steady pedestrian flow. Avoid the narrow lane behind the old depot after dusk.";
    } else if (/help|tips|advice/.test(lower)) {
      answer = "General safety tips: Share live location, trust instincts, avoid poorly lit shortcuts, and keep emergency contacts pinned.";
    } else {
      answer = "I don't have a direct answer yet. Try asking about safety scores, routes, markets, or night travel advice.";
    }

    return NextResponse.json({ answer });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
