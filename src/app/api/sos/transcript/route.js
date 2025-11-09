import { NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongoose';
import mongoose from 'mongoose';
import { getUserIdFromRequest } from '@/lib/apiUser';

const SosTranscriptSchema = new mongoose.Schema({ userId: String, transcript: String, createdAt: Date });
const SosTranscriptModel = mongoose.models.SosTranscript || mongoose.model('SosTranscript', SosTranscriptSchema, 'sos_transcripts');

export async function POST(request) {
  try {
    const body = await request.json().catch(()=>({}));
    let { userId, transcript } = body;
    if (!transcript) return NextResponse.json({ ok: false, error: 'No transcript' }, { status: 400 });
    if (!userId) userId = await getUserIdFromRequest();
    await connectMongoose();
    await SosTranscriptModel.create({ userId, transcript, createdAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch(e) {
    console.error('Transcript save failed', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
