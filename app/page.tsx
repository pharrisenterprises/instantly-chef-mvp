// app/page.tsx
"use client";

import { useState } from "react";

export default function HomePage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          {mode === "login" ? "Login" : "Register"}
        </h1>

        <form className="flex flex-col space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              className="rounded-lg border px-4 py-2"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="rounded-lg border px-4 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded-lg border px-4 py-2"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === "login" ? (
            <p className="text-gray-600">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="font-medium text-indigo-600 hover:underline"
              >
                Register
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-medium text-indigo-600 hover:underline"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

