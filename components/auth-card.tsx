"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function AuthCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Use your UT email to sign in or create an account.");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(mode: "sign-in" | "sign-up") {
    if (!hasSupabaseEnv()) {
      setMessage("Add Supabase environment variables to enable authentication.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const action =
        mode === "sign-in"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password });

      const { error } = await action;
      setMessage(error ? error.message : mode === "sign-in" ? "Signed in." : "Check your email to confirm sign-up.");
    });
  }

  return (
    <div className="panel mx-auto max-w-md p-6 sm:p-8">
      <p className="eyebrow">Supabase Auth</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">Sign in to StudyMon</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">{message}</p>

      <div className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="you@utexas.edu"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 w-full rounded-2xl border border-moss/15 bg-white px-4 text-sm outline-none placeholder:text-ink/35 focus:border-moss"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 w-full rounded-2xl border border-moss/15 bg-white px-4 text-sm outline-none placeholder:text-ink/35 focus:border-moss"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleSubmit("sign-in")}
          className="flex-1 rounded-2xl bg-moss px-5 py-3 text-sm font-semibold text-cream"
        >
          Sign in
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleSubmit("sign-up")}
          className="flex-1 rounded-2xl border border-moss/15 bg-white px-5 py-3 text-sm font-semibold text-ink"
        >
          Create account
        </button>
      </div>
    </div>
  );
}
