import { NextResponse } from 'next/server';
import { connectMongoose, ReportModel } from '@/lib/mongoose';
import { getUserIdFromRequest } from '@/lib/apiUser';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
  const explicit = searchParams.get('userId');
  const autoUserId = await getUserIdFromRequest();
  const userId = explicit || autoUserId;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 50);
    const skip = (page - 1) * pageSize;
    await connectMongoose();
    const [reports, total] = await Promise.all([
      ReportModel.find({ userId }, { _id: 0, __v: 0 }).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      ReportModel.countDocuments({ userId }),
    ]);
    return NextResponse.json({ reports, page, pageSize, total });
  } catch (e) {
    console.error('Profile reports fetch failed:', e);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}