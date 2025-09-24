// app/page.tsx

"use client"

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Edit3,
  LogIn,
  LogOut,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

// ✅ Main page export that Next.js expects
export default function Page() {
  return <InstantlyChefMVP />;
}

// --------------------------------------------------
// The InstantlyChefMVP component (your app UI)
// --------------------------------------------------

function InstantlyChefMVP() {
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ic_auth_token");
    if (stored) {
      setAuthed(true);
      setToken(stored);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("ic_auth_token");
    setAuthed(false);
    setToken(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <TopBar authed={authed} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl p-4 md:p-8 grid gap-6">
        {!authed ? (
          <AuthGate
            onAuthed={(t) => {
              localStorage.setItem("ic_auth_token", t);
              setToken(t);
              setAuthed(true);
            }}
          />
        ) : (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Instantly Chef MVP</CardTitle>
                <CardDescription>
                  Your profile, weekly planning, and menu editing will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  ✅ Login works. Next steps: connect your profile, weekly
                  planning, and proposals components here.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// --------------------------------------------------
// Supporting Components
// --------------------------------------------------

function TopBar({ authed, onLogout }: { authed: boolean; onLogout: () => void }) {
  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-red-500" />
          <span className="font-semibold tracking-tight">Instantly Chef</span>
        </div>
        {authed && (
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        )}
      </div>
    </div>
  );
}

function AuthGate({ onAuthed }: { onAuthed: (token: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    // hitting your mock API
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    onAuthed(data.token);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="max-w-xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>
            {mode === "register" ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            You’ll stay signed in for the rest of today unless you log out.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button onClick={submit}>
              <LogIn className="w-4 h-4 mr-2" />{" "}
              {mode === "register" ? "Create account" : "Sign in"}
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                setMode(mode === "register" ? "login" : "register")
              }
            >
              {mode === "register"
                ? "I already have an account"
                : "Create a new account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
