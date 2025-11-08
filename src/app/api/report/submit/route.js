import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const json = JSON.stringify(body);
    const hash = crypto.createHash("sha256").update(json).digest("hex");
    // TODO:
    // 1) Save to DynamoDB
    // 2) Write hash to Solana devnet
    return NextResponse.json({ ok: true, hash });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Submit failed" }, { status: 500 });
  }
}
