import { NextResponse } from "next/server";

export async function POST() {
  // TODO: integrate AWS SNS publish here to notify trusted contacts
  return NextResponse.json({ ok: true });
}
