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
  // Log dampening for severity, linear for counts
  const adjSeverity = Math.log10(1 + severitySum);
  const raw = adjSeverity + incidentCount * 0.005 + recentIncidentCount * 0.08;
  // Scale raw (typically small) into 1-10 range via piecewise
  // Assume raw in [0, ~15]; map using sigmoid-like transform
  const scaled = 10 / (1 + Math.exp(-(raw - 4) / 2)); // logistic centered near 4
  let score = (10 - scaled); // invert: higher raw risk -> lower score
  if (score < 1) score = 1; if (score > 10) score = 10;
  let level = 'Low Risk';
  if (score < 4) level = 'High Risk'; else if (score < 7) level = 'Medium Risk';
  return NextResponse.json({ score: score.toFixed(1), level, incidentCount, recentIncidentCount, severitySum, adjSeverity: adjSeverity.toFixed(3), source: 'mongo' });
  } catch (e) {
    console.error('Score (mongo) failed:', e);
    return NextResponse.json({ error: 'Score failed' }, { status: 500 });
  }
}