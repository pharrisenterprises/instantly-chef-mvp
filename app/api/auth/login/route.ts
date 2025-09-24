import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  // In production: check credentials
  return NextResponse.json({ token: `mock_${Math.random().toString(36).slice(2)}` });
}
