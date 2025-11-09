import { NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongoose';
import mongoose from 'mongoose';

const SosSchema = new mongoose.Schema({ userId: String, location: mongoose.Schema.Types.Mixed, createdAt: Date });
const BreachSchema = new mongoose.Schema({ breachId: String, userId: String, location: mongoose.Schema.Types.Mixed, meta: mongoose.Schema.Types.Mixed, createdAt: Date });
const SosModel = mongoose.models.SosEvent || mongoose.model('SosEvent', SosSchema, 'sos_events');
const BreachModel = mongoose.models.Breach || mongoose.model('Breach', BreachSchema, 'breaches');

export async function GET() {
  try {
    await connectMongoose();
    const [sos, breaches] = await Promise.all([
      SosModel.find({}, { _id: 0, __v: 0 }).sort({ createdAt: -1 }).limit(50).lean(),
      BreachModel.find({}, { _id: 0, __v: 0 }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    return NextResponse.json({ sos, breaches });
  } catch (e) {
    console.error('Alerts fetch failed:', e);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, location, userId = 'system', meta = {} } = body || {};
    if (!['BREACH','SOS'].includes(type)) {
      return NextResponse.json({ ok: false, error: 'Invalid type' }, { status: 400 });
    }
    await connectMongoose();
    if (type === 'BREACH') {
      const doc = { breachId: 'br-' + Math.random().toString(36).slice(2,9), location, meta, userId, createdAt: new Date() };
      await BreachModel.create(doc);
    }
    // SOS events already stored via sos/activate endpoint
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Alert create failed:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
