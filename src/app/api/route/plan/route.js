import { NextResponse } from "next/server";

// Mock A* output. Real service would call backend (Arm EC2) for computation.
export async function POST(request) {
  try {
    const { origin = "Current Location", destination = "City Center" } = await request.json();
    // Coordinates normalized (0..1) for demo
    const fastest = {
      path: [
        [0.05, 0.1],
        [0.25, 0.3],
        [0.5, 0.35],
        [0.7, 0.2],
        [0.9, 0.15],
      ],
      meta: { eta: "12 min", distance: "3.4 km", risk: "High" },
    };

    const safest = {
      path: [
        [0.05, 0.1],
        [0.15, 0.25],
        [0.3, 0.5],
        [0.55, 0.55],
        [0.75, 0.4],
        [0.9, 0.15],
      ],
      meta: { eta: "15 min", distance: "3.8 km", risk: "Low" },
    };

    return NextResponse.json({ origin, destination, fastest, safest });
  } catch (e) {
    return NextResponse.json({ error: "Planning failed" }, { status: 500 });
  }
}
