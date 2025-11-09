import { NextResponse } from 'next/server';
import { connectMongoose, FeedbackModel } from '@/lib/mongoose';
import { getUserIdFromRequest } from '@/lib/apiUser';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = Math.min(parseInt(searchParams.get('radius') || '2000', 10), 10000); // meters
    await connectMongoose();
    // Simple nearby: limit by bounding box (since 2d index)
    const latDeg = radius / 111320;
    const lngDeg = radius / (111320 * Math.cos((lat * Math.PI) / 180) || 1);
    const minLat = lat - latDeg;
    const maxLat = lat + latDeg;
    const minLng = lng - lngDeg;
    const maxLng = lng + lngDeg;
    const list = await FeedbackModel.find({
      'location.0': { $gte: minLat, $lte: maxLat },
      'location.1': { $gte: minLng, $lte: maxLng },
    }, { _id: 0, __v: 0 }).sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({ feedback: list });
  } catch (e) {
    console.error('Feedback GET failed:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
  const body = await request.json();
  let { userId, comment = '', location } = body || {};
    if (!comment.trim() || !Array.isArray(location) || location.length !== 2) {
      return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 });
    }
  if (!userId) userId = await getUserIdFromRequest();
    await connectMongoose();
    const doc = { userId, comment: comment.trim(), location, likes: 0, dislikes: 0, createdAt: new Date() };
    await FeedbackModel.create(doc);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Feedback POST failed:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, action } = body || {};
    if (!id || !['like', 'dislike', 'unlike', 'undislike'].includes(action)) {
      return NextResponse.json({ ok: false, error: 'Invalid' }, { status: 400 });
    }
    await connectMongoose();
    const inc = action === 'like' ? { likes: 1 } : action === 'dislike' ? { dislikes: 1 } : action === 'unlike' ? { likes: -1 } : { dislikes: -1 };
    const res = await FeedbackModel.findOneAndUpdate({ _id: id }, { $inc: inc }, { new: true, projection: { _id: 0, __v: 0 } }).lean();
    if (!res) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, feedback: res });
  } catch (e) {
    console.error('Feedback PATCH failed:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
