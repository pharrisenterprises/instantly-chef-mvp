import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { plan_id, slot, feedback } = await req.json();
  const replacement = {
    name: "Chef-Adjusted: " + (feedback?.slice(0, 22) || "New Idea"),
    summary: "Updated per your note: " + feedback,
    prep_time_min: 15,
    cook_time_min: 20,
    tags: ["updated"],
  };
  return NextResponse.json(replacement);
}
