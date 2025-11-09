import { NextResponse } from 'next/server';
import { connectMongoose, CrimeIncidentModel } from '@/lib/mongoose';

export async function GET() {
  try {
    await connectMongoose();
    const cursor = CrimeIncidentModel.find({}, { loc: 1 }).limit(8000).lean();
    const points = [];
    for await (const d of cursor) {
      if (d.loc?.coordinates?.length === 2) {
        const [lng, lat] = d.loc.coordinates;
        points.push({ lat, lng });
      }
    }
    return NextResponse.json(points);
  } catch (e) {
    console.error('Mongo heatmap failed:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
