import { NextResponse } from 'next/server';
import { connectMongoose, PassModel } from '@/lib/mongoose';

// GET: list pending + recent decisions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    await connectMongoose();
    const query = status ? { status } : {};
    const passes = await PassModel.find(query, { _id: 0, __v: 0 }).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ passes });
  } catch (e) {
    console.error('Pass list failed:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST: create or update
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, action, student, until, reason } = body || {};
    if (!id) {
      // create
      if (!student || !until) return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
      const doc = { passId: 'req-' + Math.random().toString(36).slice(2, 10), student, until, reason, status: 'PENDING', createdAt: new Date() };
      await PassModel.create(doc);
      return NextResponse.json({ ok: true, pass: doc });
    }
    if (!['approve', 'deny'].includes(action)) {
      return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
    }
    const newStatus = action === 'approve' ? 'APPROVED' : 'DENIED';
    const updated = await PassModel.findOneAndUpdate({ passId: id }, { status: newStatus, decidedAt: new Date() }, { new: true, projection: { _id: 0, __v: 0 } }).lean();
    if (!updated) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, pass: updated });
  } catch (e) {
    console.error('Pass update failed:', e);
    return NextResponse.json({ ok: false, error: 'Failed' }, { status: 500 });
  }
}
