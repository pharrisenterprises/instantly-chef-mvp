import { NextResponse } from "next/server";

const demoNames = [
  "Garlic Butter Shrimp with Zucchini",
  "Sheet-Pan Chicken Fajitas",
  "Creamy Tuscan Salmon",
  "Beef & Broccoli (30-min)",
  "Lemony Chickpea Orzo"
];
const demoSummaries = [
  "Light and fast, weeknight-friendly.",
  "Colorful peppers, warm spices, crowd-pleaser.",
  "Silky sauce, spinach & sun-dried tomatoes.",
  "Takeout favorite, quicker at home.",
  "Zippy, cozy, pantry-friendly."
];

export async function POST(req: Request) {
  const { profile, weekly } = await req.json();
  const dinners = weekly?.dinners_requested || 3;

  const plan = {
    plan_id: "wp_" + Math.random().toString(36).slice(2),
    meals: Array.from({ length: dinners }).map((_, i) => ({
      slot: i + 1,
      source: "auto",
      name: demoNames[i % demoNames.length],
      summary: demoSummaries[i % demoSummaries.length],
      prep_time_min: [10, 15, 20, 25][i % 4],
      cook_time_min: [12, 18, 22, 30][i % 4],
      tags: ["family_friendly", weekly?.mode || "standard"],
    })),
    auto_approve_at: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
  };

  return NextResponse.json(plan);
}
