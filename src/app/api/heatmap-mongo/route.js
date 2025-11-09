import { NextResponse } from 'next/server';
import { connectMongoose, CrimeCsvIncidentModel } from '@/lib/mongoose';

export async function GET() {
  try {
    await connectMongoose();
    const points = await CrimeCsvIncidentModel.find({ 'loc.coordinates.0': { $ne: null }, 'loc.coordinates.1': { $ne: null } }, { _id: 0, loc: 1 })
      .limit(8000)
      .lean();
    const heatmapData = points
      .filter(p => Array.isArray(p.loc?.coordinates))
      .map(p => ({ lat: p.loc.coordinates[1], lng: p.loc.coordinates[0] }));
    return NextResponse.json(heatmapData);
  } catch (e) {
    console.error('Mongo heatmap fetch failed:', e);
    return NextResponse.json({ error: 'Failed to fetch heatmap (mongo)' }, { status: 500 });
  }
}
