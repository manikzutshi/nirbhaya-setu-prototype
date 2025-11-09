// File: src/app/api/heatmap/route.js

import { NextResponse } from "next/server";
import { connectMongoose, CrimeIncidentModel } from "@/lib/mongoose";

// Mongo-backed heatmap
export async function GET() {
  try {
    await connectMongoose();
    // Stream up to ~8k points for heatmap
    const cursor = CrimeIncidentModel.find({}, { loc: 1 }).limit(8000).lean();
    const points = [];
    for await (const d of cursor) {
      if (d.loc?.coordinates?.length === 2) {
        const [lng, lat] = d.loc.coordinates;
        if (typeof lat === 'number' && typeof lng === 'number') {
          points.push({ lat, lng });
        }
      }
    }
    return NextResponse.json(points);
  } catch (e) {
    console.error('Heatmap (mongo) failed:', e);
    return NextResponse.json({ error: 'Failed to fetch heatmap' }, { status: 500 });
  }
}