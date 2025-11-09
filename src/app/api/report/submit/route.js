import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { connectMongoose, ReportModel, CrimeIncidentModel } from "@/lib/mongoose";
import { getUserIdFromRequest } from "@/lib/apiUser";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
  let { summary = '', description = '', category = '', location, meta = {}, userId, anonymous } = body;
    // Derive summary if not provided
    if (!summary.trim()) {
      const prefix = category ? `[${category}] ` : '';
      const desc = (description || '').toString().trim();
      if (desc) summary = prefix + (desc.length > 140 ? desc.slice(0, 140) + '…' : desc);
    }
    if (!summary.trim()) {
      return NextResponse.json({ ok: false, error: 'Summary required' }, { status: 400 });
    }
  const autoUser = await getUserIdFromRequest();
  if (anonymous === true) userId = 'anonymous';
  if (!userId) userId = autoUser;
    await connectMongoose();
    const payload = { userId, summary, location, meta: { ...meta, category, description }, createdAt: new Date() };
  const json = JSON.stringify({ summary: payload.summary, location: payload.location, userId: payload.userId, meta: payload.meta, createdAt: payload.createdAt });
    const hash = crypto.createHash('sha256').update(json).digest('hex');
    payload.hash = hash;
    // Persist
    await ReportModel.create(payload);
    // Derive crime incident doc (user_report) for mongo scoring improvement
    try {
      const severityMap = { Theft: 1, Harassment: 2, 'Suspicious Activity': 1, 'Poor Lighting': 0.5, 'Sexual Harassment': 3 };
      const sev = severityMap[category] || 1;
      const locPoint = location && typeof location.lat === 'number' && typeof location.lng === 'number'
        ? { type: 'Point', coordinates: [location.lng, location.lat] }
        : null;
      await CrimeIncidentModel.create({
        source: 'user_report',
        originalCaseNumber: null,
        crimeTypes: category ? [category] : [],
        counts: {},
        totalCrime: 1,
        areaName: null,
        areaSqKm: null,
        crimePerArea: null,
        status: 'Reported',
        date: new Date(),
        comments: description || summary,
        loc: locPoint,
        severityScore: sev,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (e) {
      console.error('Failed to derive crime incident from report:', e.message);
    }
    // TODO future: write hash to chain
    return NextResponse.json({ ok: true, hash });
  } catch (e) {
    console.error('Report submit failed:', e);
    return NextResponse.json({ ok: false, error: 'Submit failed' }, { status: 500 });
  }
}
