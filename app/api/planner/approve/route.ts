import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { plan_id, menu } = await req.json();
  return NextResponse.json({
    ok: true,
    checkoutUrl: "https://instacart.example/checkout/ABC123"
  });
}
