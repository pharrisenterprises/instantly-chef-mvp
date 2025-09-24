import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const profile = await req.json();
  // In production: save profile to DB
  return NextResponse.json({ ok: true });
}
