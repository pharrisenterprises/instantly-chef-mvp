import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  // In production: save user in DB
  return NextResponse.json({ token: `mock_${Math.random().toString(36).slice(2)}` });
}
