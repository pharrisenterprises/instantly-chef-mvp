import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { X, Edit3, LogIn, LogOut, Settings, CheckCircle2, RefreshCw } from "lucide-react";

// ------------------ Types ------------------
export type AccountProfile = {
  household_size: number;
  skill_level: "beginner" | "intermediate" | "advanced";
  time_preference_min: 15 | 30 | 45;
  equipment: string[];
  restrictions: string[];
  dislikes: string[];
  cuisine_mode: "variety" | "theme" | "explorer" | "classics" | "custom";
  cuisine_preferences: string[];
  adventurousness: number;
  favorite_foods: string[];
  preferred_stores: { storeName: string; storeId: string; isPrimary: boolean }[];
  staples_on_hand: {
    salt: boolean;
    pepper: boolean;
    oils: string[];
    sugar: boolean;
    flour: boolean;
    notes: string[];
  };
  substitution_policy: "none" | "brand_flexible" | "close_match";
};

export type WeeklyPlan = {
  week_of: string;
  dinners_requested: number;
  budget_usd: number;
  mode: "standard" | "gourmet" | "party";
  leftover_proteins?: { ingredient: string; quantity: string }[];
  reuse_leftovers: { breakfast: boolean; lunch: boolean };
  extra_items: string[];
  notes?: string;
};

export type DraftMeal = {
  slot: number;
  source: "auto" | "library";
  recipe_id?: string | null;
  name: string;
  thumbnail?: string;
  summary?: string;
  prep_time_min?: number;
  cook_time_min?: number;
  tags?: string[];
};

export type DraftMenu = {
  plan_id: string;
  meals: DraftMeal[];
  auto_approve_at?: string;
};

// ------------------ Utilities ------------------
function endOfTodayISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

const LOCAL_KEY = {
  token: "ic_auth_token",
  tokenExp: "ic_auth_exp",
  profile: "ic_profile",
  lastPlan: "ic_last_plan",
};

function saveTokenForToday(token: string) {
  localStorage.setItem(LOCAL_KEY.token, token);
  localStorage.setItem(LOCAL_KEY.tokenExp, endOfTodayISO());
}

function isTokenValid() {
  const t = localStorage.getItem(LOCAL_KEY.token);
  const exp = localStorage.getItem(LOCAL_KEY.tokenExp);
  if (!t || !exp) return false;
  return new Date(exp) > new Date();
}

// ------------------ API Layer ------------------
async function apiRegister(email: string, password: string) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
async function apiLogin(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
async function apiSaveProfile(profile: AccountProfile) {
  const res = await fetch("/api/profile/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  return res.json();
}
async function apiGenerateDraft(profile: AccountProfile, weekly: WeeklyPlan) {
  const res = await fetch("/api/planner/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, weekly }),
  });
  return res.json();
}
async function apiResubmitFeedback(planId: string, slot: number, feedback: string) {
  const res = await fetch("/api/planner/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan_id: planId, slot, feedback }),
  });
  return res.json();
}
async function apiApprovePlan(planId: string, menu: DraftMenu) {
  const res = await fetch("/api/planner/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan_id: planId, menu }),
  });
  return res.json();
}

// ------------------ Root Component ------------------
export default function InstantlyChefMVP() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [stage, setStage] = useState<"profile" | "weekly" | "proposals">("profile");
  const [profile, setProfile] = useState<AccountProfile>(() =>
    JSON.parse(localStorage.getItem(LOCAL_KEY.profile) || "null") || defaultProfile()
  );
  const [weekly, setWeekly] = useState<WeeklyPlan>(() => defaultWeekly());
  const [draft, setDraft] = useState<DraftMenu | null>(() =>
    JSON.parse(localStorage.getItem(LOCAL_KEY.lastPlan) || "null")
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTokenValid()) {
      setAuthed(true);
      setToken(localStorage.getItem(LOCAL_KEY.token));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY.profile, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (draft) localStorage.setItem(LOCAL_KEY.lastPlan, JSON.stringify(draft));
  }, [draft]);

  function handleLogout() {
    localStorage.removeItem(LOCAL_KEY.token);
    localStorage.removeItem(LOCAL_KEY.tokenExp);
    setAuthed(false);
    setToken(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <TopBar authed={authed} onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl p-4 md:p-8 grid gap-6">
        {!authed ? (
          <AuthGate onAuthed={(t) => { saveTokenForToday(t); setToken(t); setAuthed(true); }} />
        ) : (
          <>
            <StepsNav stage={stage} onStage={setStage} hasDraft={!!draft} />

            {stage === "profile" && (
              <ProfileCard
                profile={profile}
                onChange={setProfile}
                onSave={async () => {
                  setLoading(true);
                  await apiSaveProfile(profile);
                  setLoading(false);
                  setStage("weekly");
                }}
                loading={loading}
              />
            )}

            {stage === "weekly" && (
              <WeeklyConversational
                weekly={weekly}
                setWeekly={setWeekly}
                onGenerate={async () => {
                  setLoading(true);
                  const d = await apiGenerateDraft(profile, weekly);
                  setDraft(d);
                  setLoading(false);
                  setStage("proposals");
                }}
                loading={loading}
              />
            )}

            {stage === "proposals" && draft && (
              <ProposalsBoard
                draft={draft}
                setDraft={setDraft}
                onBack={() => setStage("weekly")}
                onApprove={async () => {
                  setLoading(true);
                  const res = await apiApprovePlan(draft.plan_id, draft);
                  setLoading(false);
                  if (res?.checkoutUrl) {
                    window.open(res.checkoutUrl, "_blank");
                  }
                }}
                loading={loading}
              />)
            }
          </>
        )}
      </main>
    </div>
  );
}

// ------------------ Components ------------------
// (Keep the same component definitions as before: TopBar, AuthGate, StepsNav, ProfileCard, WeeklyConversational, ProposalsBoard, TogglePill, splitComma, parseLeftovers, etc.)

// ------------------ Defaults ------------------
function defaultProfile(): AccountProfile {
  return {
    household_size: 2,
    skill_level: "intermediate",
    time_preference_min: 30,
    equipment: ["stovetop", "oven", "cast_iron"],
    restrictions: [],
    dislikes: [],
    cuisine_mode: "variety",
    cuisine_preferences: ["italian", "mexican"],
    adventurousness: 6,
    favorite_foods: ["bbq", "pasta"],
    preferred_stores: [ { storeName: "Publix", storeId: "pub_987", isPrimary: true } ],
    staples_on_hand: { salt: true, pepper: true, oils: ["olive"], sugar: true, flour: false, notes: [] },
    substitution_policy: "brand_flexible",
  };
}

function defaultWeekly(): WeeklyPlan {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  monday.setDate(today.getDate() + diff);
  const weekStr = monday.toISOString().slice(0, 10);
  return {
    week_of: weekStr,
    dinners_requested: 3,
    budget_usd: 75,
    mode: "standard",
    leftover_proteins: [],
    reuse_leftovers: { breakfast: true, lunch: false },
    extra_items: [],
    notes: "mild spice please",
  };
}
