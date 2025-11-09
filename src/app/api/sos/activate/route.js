import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import mongoose from 'mongoose';
import { getUserIdFromRequest } from '@/lib/apiUser';

const SosSchema = new mongoose.Schema({ userId: String, location: mongoose.Schema.Types.Mixed, createdAt: Date });
const SosModel = mongoose.models.SosEvent || mongoose.model('SosEvent', SosSchema, 'sos_events');

export async function POST(request) {
  try {
  const body = await request.json().catch(() => ({}));
  let { userId, location } = body;
  if (!userId) userId = await getUserIdFromRequest();
    await connectMongoose();
    await SosModel.create({ userId, location, createdAt: new Date() });
    // TODO: integrate notification fan-out (SNS/WebPush)
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('SOS activate failed:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
