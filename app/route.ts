// app/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Root route responding — Instantly Chef is deployed!",
  });
}
