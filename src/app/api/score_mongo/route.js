import { NextResponse } from 'next/server';
import { connectMongoose, CrimeIncidentModel } from '@/lib/mongoose';

export async function POST(request) {
  try {
    const { lat, lng, radiusKm = 1.5 } = await request.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 });
    }
    await connectMongoose();
    // Geo query using $geoNear via aggregation for severity sum
    const pipeline = [
      { $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radiusKm * 1000,
        }
      },
      { $project: { severityScore: 1, source: 1 } }
    ];
    const docs = await CrimeIncidentModel.aggregate(pipeline).exec();
    let incidentCount = docs.length;
    let severitySum = 0;
    let recentIncidentCount = 0; // user reports considered recent
    for (const d of docs) {
      severitySum += d.severityScore || 0;
      if (d.source === 'user_report') recentIncidentCount++;
    }
    // Simple normalization: severity to penalty (tune later)
    let score = 10 - (severitySum * 0.02) - (recentIncidentCount * 0.5) - (incidentCount * 0.01);
    if (score < 1) score = 1;
    let level = 'Low Risk';
    if (score < 4) level = 'High Risk'; else if (score < 7) level = 'Medium Risk';
    return NextResponse.json({
      score: score.toFixed(1),
      level,
      incidentCount,
      recentIncidentCount,
      severitySum,
      source: 'mongo'
    });
  } catch (e) {
    console.error('Mongo score failed:', e);
    return NextResponse.json({ error: 'Score failed' }, { status: 500 });
  }
}
