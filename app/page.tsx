import React, { useEffect, useMemo, useRef, useState } from "react";
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

/**
 * Instantly Chef – MVP UI
 * -------------------------------------------------------------
 * Frontend-only scaffold that mirrors the product flow:
 * 1) Register/Login → remembered through end-of-day without re-login
 * 2) Account Profile (permanent preferences)
 * 3) Weekly Planner (casual, conversational intake)
 * 4) Proposals Board (menu ideas → feedback modal → resubmit)
 * 5) Trigger JSON handoff to your n8n/LLM workflow endpoints
 *
 * Drop this in /app/page.tsx (Next.js App Router) or any route.
 * Replace the mock api calls with your real endpoints.
 */

// ------------------ Types ------------------
export type AccountProfile = {
  household_size: number;
  skill_level: "beginner" | "intermediate" | "advanced";
  time_preference_min: 15 | 30 | 45;
  equipment: string[]; // e.g. ["air_fryer","instant_pot","cast_iron"]
  restrictions: string[]; // e.g. ["nut_allergy","gluten_free"]
  dislikes: string[]; // e.g. ["cilantro"]
  cuisine_mode: "variety" | "theme" | "explorer" | "classics" | "custom";
  cuisine_preferences: string[]; // e.g. ["italian","mexican","thai"]
  adventurousness: number; // 1–10
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
  week_of: string; // YYYY-MM-DD
  dinners_requested: number; // 3–5 typical
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

// ------------------ Mock API Layer ------------------
// Replace these with real fetch calls to your backend/n8n
async function apiRegister(email: string, password: string) {
  await sleep(400);
  return { token: `mock_${Math.random().toString(36).slice(2)}` };
}
async function apiLogin(email: string, password: string) {
  await sleep(300);
  return { token: `mock_${Math.random().toString(36).slice(2)}` };
}
async function apiSaveProfile(profile: AccountProfile) {
  await sleep(350);
  return { ok: true };
}
async function apiGenerateDraft(profile: AccountProfile, weekly: WeeklyPlan) {
  // In production: POST /api/planner/draft → your n8n workflow → LLM → returns DraftMenu
  await sleep(800);
  const dinners = weekly.dinners_requested || 3;
  const sample: DraftMenu = {
    plan_id: "wp_" + Math.random().toString(36).slice(2),
    meals: Array.from({ length: dinners }).map((_, i) => ({
      slot: i + 1,
      source: "auto",
      name: demoNames[i % demoNames.length],
      summary: demoSummaries[i % demoSummaries.length],
      prep_time_min: [10, 15, 20, 25][i % 4],
      cook_time_min: [12, 18, 22, 30][i % 4],
      tags: ["family_friendly", weekly.mode],
    })),
    auto_approve_at: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
  };
  return sample;
}
async function apiResubmitFeedback(planId: string, slot: number, feedback: string) {
  // In production: POST /api/planner/feedback → n8n → regenerate 1 menu item
  await sleep(600);
  const replacement = {
    name: "Chef-Adjusted: " + (feedback?.slice(0, 22) || "New Idea"),
    summary: "Updated per your note: " + feedback,
    prep_time_min: 15,
    cook_time_min: 20,
    tags: ["updated"],
  };
  return replacement;
}
async function apiApprovePlan(planId: string, menu: DraftMenu) {
  await sleep(500);
  return { ok: true, checkoutUrl: "https://instacart.example/checkout/ABC123" };
}
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

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
function TopBar({ authed, onLogout }: { authed: boolean; onLogout: () => void }) {
  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-red-500" />
          <span className="font-semibold tracking-tight">Instantly Chef</span>
        </div>
        <div className="flex items-center gap-2">
          {authed ? (
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AuthGate({ onAuthed }: { onAuthed: (token: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = mode === "register" ? await apiRegister(email, password) : await apiLogin(email, password);
    setLoading(false);
    onAuthed(res.token);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="max-w-xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>{mode === "register" ? "Create your account" : "Welcome back"}</CardTitle>
          <CardDescription>
            You’ll stay signed in for the rest of today unless you log out.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-between">
            <Button onClick={submit} disabled={loading}>
              <LogIn className="w-4 h-4 mr-2" /> {mode === "register" ? "Create account" : "Sign in"}
            </Button>
            <Button variant="ghost" onClick={() => setMode(mode === "register" ? "login" : "register")}> 
              {mode === "register" ? "I already have an account" : "Create a new account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StepsNav({ stage, onStage, hasDraft }: { stage: "profile" | "weekly" | "proposals"; onStage: (s: any) => void; hasDraft: boolean }) {
  const tabs: { key: typeof stage; label: string }[] = [
    { key: "profile", label: "Account Profile" },
    { key: "weekly", label: "This Week" },
    { key: "proposals", label: "Menu Proposals" },
  ];
  return (
    <div className="flex gap-2">
      {tabs.map((t, idx) => (
        <Button
          key={t.key}
          variant={stage === t.key ? "default" : "outline"}
          onClick={() => {
            if (t.key === "proposals" && !hasDraft) return;
            onStage(t.key);
          }}
          className="rounded-2xl"
        >
          <span className="mr-2 text-xs px-2 py-1 rounded-full bg-slate-100">{idx + 1}</span>
          {t.label}
        </Button>
      ))}
    </div>
  );
}

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
  const diff = (day === 0 ? -6 : 1) - day; // days to Monday
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

function ProfileCard({ profile, onChange, onSave, loading }: { profile: AccountProfile; onChange: (p: AccountProfile) => void; onSave: () => Promise<void>; loading: boolean }) {
  const [local, setLocal] = useState<AccountProfile>(profile);
  useEffect(() => setLocal(profile), [profile]);

  function update<K extends keyof AccountProfile>(key: K, value: AccountProfile[K]) {
    setLocal({ ...local, [key]: value });
  }

  function toggleInArray(key: keyof AccountProfile, value: string) {
    const arr = (local as any)[key] as string[];
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    setLocal({ ...local, [key]: next } as any);
  }

  const equipmentOptions = ["stovetop","oven","cast_iron","air_fryer","instant_pot","slow_cooker","grill","smoker","sous_vide"];
  const cuisineOptions = ["italian","mexican","thai","korean","mediterranean","bbq","indian","japanese","american"];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Permanent Preferences</CardTitle>
        <CardDescription>We always consider these: equipment, allergies, store, dietary rules, and your style.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Household size</Label>
            <Input type="number" value={local.household_size} onChange={(e) => update("household_size", Number(e.target.value) || 1)} />
          </div>
          <div>
            <Label>Cooking skill</Label>
            <Select value={local.skill_level} onValueChange={(v: any) => update("skill_level", v)}>
              <SelectTrigger><SelectValue placeholder="Select skill" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Typical time per dinner</Label>
            <Select value={String(local.time_preference_min)} onValueChange={(v: any) => update("time_preference_min", Number(v) as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45+ min</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Preferred Store (primary)</Label>
            <Input
              placeholder="e.g., Publix (pub_987)"
              value={local.preferred_stores[0]?.storeName + " (" + local.preferred_stores[0]?.storeId + ")"}
              onChange={(e) => {
                const [name, idMatch] = e.target.value.split("(");
                const id = idMatch?.replace(")","")?.trim() || "";
                update("preferred_stores", [{ storeName: name.trim(), storeId: id, isPrimary: true }]);
              }}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Kitchen equipment</Label>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map(eq => (
              <TogglePill key={eq} active={local.equipment.includes(eq)} onClick={() => toggleInArray("equipment", eq)}>{eq}</TogglePill>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Cuisine mode</Label>
          <div className="flex flex-wrap gap-2">
            {(["variety","theme","explorer","classics","custom"] as const).map(m => (
              <TogglePill key={m} active={local.cuisine_mode === m} onClick={() => update("cuisine_mode", m)}>{m}</TogglePill>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Favorite cuisine styles</Label>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map(c => (
              <TogglePill key={c} active={local.cuisine_preferences.includes(c)} onClick={() => toggleInArray("cuisine_preferences", c)}>{c}</TogglePill>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Dietary restrictions (comma separated)</Label>
            <Input placeholder="gluten_free, nut_allergy" value={local.restrictions.join(", ")} onChange={(e) => update("restrictions", splitComma(e.target.value))} />
          </div>
          <div>
            <Label>Dislikes (comma separated)</Label>
            <Input placeholder="cilantro, olives" value={local.dislikes.join(", ")} onChange={(e) => update("dislikes", splitComma(e.target.value))} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <Label>Adventurousness</Label>
            <div className="flex items-center gap-3">
              <Slider defaultValue={[local.adventurousness]} max={10} min={1} step={1} onValueChange={(v) => update("adventurousness", v[0])} />
              <Badge variant="secondary">{local.adventurousness}/10</Badge>
            </div>
          </div>
          <div>
            <Label>Substitution policy</Label>
            <Select value={local.substitution_policy} onValueChange={(v: any) => update("substitution_policy", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No substitutions</SelectItem>
                <SelectItem value="brand_flexible">Any brand (same item)</SelectItem>
                <SelectItem value="close_match">Allow close matches</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => onChange(local)} variant="outline">
            <RefreshCw className="w-4 h-4 mr-1" /> Update draft (not saved)
          </Button>
          <Button onClick={async () => { onChange(local); await onSave(); }} disabled={loading}>
            <CheckCircle2 className="w-4 h-4 mr-1" /> Save & Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyConversational({ weekly, setWeekly, onGenerate, loading }: { weekly: WeeklyPlan; setWeekly: (w: WeeklyPlan) => void; onGenerate: () => Promise<void>; loading: boolean }) {
  const [w, setW] = useState<WeeklyPlan>(weekly);
  useEffect(() => setW(weekly), [weekly]);

  function update<K extends keyof WeeklyPlan>(key: K, value: WeeklyPlan[K]) {
    setW({ ...w, [key]: value });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>This Week’s Vibe</CardTitle>
        <CardDescription>
          Quick, friendly questions — like texting a chef friend who’s got your back.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>How many dinners?</Label>
            <Select value={String(w.dinners_requested)} onValueChange={(v: any) => update("dinners_requested", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Spend cap for groceries</Label>
            <Input type="number" value={w.budget_usd} onChange={(e) => update("budget_usd", Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Mode</Label>
            <Select value={w.mode} onValueChange={(v: any) => update("mode", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="gourmet">Gourmet</SelectItem>
                <SelectItem value="party">Party</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Got anything to use up?</Label>
            <Input placeholder='e.g., "2 lb chicken thighs; 1 bell pepper"' onBlur={(e) => update("leftover_proteins", parseLeftovers(e.target.value))} />
            <p className="text-xs text-slate-500 mt-1">We’ll bias recipes to use what you already have.</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={w.reuse_leftovers.breakfast} onCheckedChange={(v) => update("reuse_leftovers", { ...w.reuse_leftovers, breakfast: v })} />
              <Label>Use leftovers for breakfast</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={w.reuse_leftovers.lunch} onCheckedChange={(v) => update("reuse_leftovers", { ...w.reuse_leftovers, lunch: v })} />
              <Label>…and for lunch</Label>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Anything you’re craving or avoiding this week?</Label>
          <Textarea value={w.notes || ""} onChange={(e) => update("notes", e.target.value)} placeholder="Think: cozy soups, mild spice, extra veggies…" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setWeekly(w)}>Save changes</Button>
          <Button onClick={onGenerate} disabled={loading}>
            <span className="mr-2">✨</span> Generate menu ideas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProposalsBoard({ draft, setDraft, onBack, onApprove, loading }: { draft: DraftMenu; setDraft: (d: DraftMenu) => void; onBack: () => void; onApprove: () => Promise<void>; loading: boolean }) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  async function submitFeedback(slot: number) {
    const res = await apiResubmitFeedback(draft.plan_id, slot, feedback);
    const next = { ...draft, meals: draft.meals.map(m => m.slot === slot ? { ...m, ...res } : m) };
    setDraft(next);
    setActiveSlot(null);
    setFeedback("");
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Plan ID: <span className="font-mono">{draft.plan_id}</span></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={onApprove} disabled={loading}><CheckCircle2 className="w-4 h-4 mr-1"/> Approve & Build Cart</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {draft.meals.map(meal => (
          <Card key={meal.slot} className="overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{meal.name}</CardTitle>
              <CardDescription>{meal.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Badge variant="secondary">Prep {meal.prep_time_min}m</Badge>
                <Badge variant="secondary">Cook {meal.cook_time_min}m</Badge>
                {meal.tags?.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
              </div>

              <Dialog open={activeSlot === meal.slot} onOpenChange={(o) => !o && setActiveSlot(null)}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="justify-start" onClick={() => setActiveSlot(meal.slot)}>
                    <Edit3 className="w-4 h-4 mr-2"/> Replace or modify
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tell us what you want instead</DialogTitle>
                  </DialogHeader>
                  <Textarea autoFocus placeholder="E.g., swap shrimp → chicken; keep it 30 min; Italian vibes; dairy-free." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setActiveSlot(null)}>Cancel</Button>
                    <Button onClick={() => submitFeedback(meal.slot)}>Submit feedback</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {draft.auto_approve_at && (
        <p className="text-xs text-slate-500">Auto-approve at <span className="font-mono">{new Date(draft.auto_approve_at).toLocaleString()}</span> if you do nothing.</p>
      )}
    </div>
  );
}

// ------------------ Small UI helpers ------------------
function TogglePill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1 rounded-full text-sm capitalize",
        active ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function splitComma(s: string) {
  return s.split(",").map(v => v.trim()).filter(Boolean);
}

function parseLeftovers(s: string): WeeklyPlan["leftover_proteins"] {
  const items = s.split(";").map(x => x.trim()).filter(Boolean);
  return items.map(it => ({ ingredient: it.replace(/\d+\s*(lb|lbs|g|kg|oz)?/i, (m) => m).trim(), quantity: it.match(/\d+\s*(lb|lbs|g|kg|oz)?/i)?.[0] || "" }));
}
