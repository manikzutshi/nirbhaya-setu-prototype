// File: src/app/api/score/route.js

import { NextResponse } from "next/server";
import { connectMongoose, CrimeIncidentModel } from "@/lib/mongoose";

// Mongo-only scoring (legacy endpoint path retained)
export async function POST(request) {
  try {
    const { lat, lng, radiusKm = 1.2 } = await request.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 });
    }
    await connectMongoose();
    const docs = await CrimeIncidentModel.aggregate([
      { $geoNear: { key: 'loc', near: { type: 'Point', coordinates: [lng, lat] }, distanceField: 'distance', spherical: true, maxDistance: radiusKm * 1000 } },
      { $project: { severityScore: 1, source: 1 } },
      { $limit: 2000 }
    ]).exec();
    let incidentCount = docs.length;
    let severitySum = 0;
    let recentIncidentCount = 0;
    for (const d of docs) {
      const sev = d.severityScore || 0;
      if (d.source === 'user_report') { recentIncidentCount++; severitySum += sev * 1.2; } else severitySum += sev;
    }
    // Normalize to 1-10: higher severity => lower score
    // Simple mapping: score = 10 - (alpha*severity + beta*incidents + gamma*recent)
    const alpha = 0.015, beta = 0.02, gamma = 0.6;
    let score = 10 - (alpha * severitySum + beta * incidentCount + gamma * recentIncidentCount);
    if (score < 1) score = 1; if (score > 10) score = 10;
    let level = 'Low Risk';
    if (score < 4) level = 'High Risk'; else if (score < 7) level = 'Medium Risk';
    return NextResponse.json({ score: score.toFixed(1), level, incidentCount, recentIncidentCount, severitySum, source: 'mongo' });
  } catch (e) {
    console.error('Score (mongo) failed:', e);
    return NextResponse.json({ error: 'Score failed' }, { status: 500 });
  }
}