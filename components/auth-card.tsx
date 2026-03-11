"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [major, setMajor] = useState("");
  const [message, setMessage] = useState("Use your UT email to sign in or create an account.");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit() {
    if (!hasSupabaseEnv()) {
      setMessage("Add Supabase environment variables to enable authentication.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(error.message);
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split("@")[0],
              major: major || undefined
            }
          }
        });
        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Check your email to confirm sign-up, or sign in if email confirmation is disabled.");
        }
      }
    });
  }

  return (
    <div className="panel mx-auto max-w-md p-6 sm:p-8">
      <p className="eyebrow">Supabase Auth</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">
        {mode === "sign-in" ? "Sign in to StudyMon" : "Create your account"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">{message}</p>

      <div className="mt-6 space-y-4">
        {mode === "sign-up" && (
          <>
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 w-full rounded-2xl border border-moss/15 bg-white px-4 text-sm outline-none placeholder:text-ink/35 focus:border-moss"
            />
            <input
              type="text"
              placeholder="Major (e.g. Computer Science)"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="h-12 w-full rounded-2xl border border-moss/15 bg-white px-4 text-sm outline-none placeholder:text-ink/35 focus:border-moss"
            />
          </>
        )}
        <input
          type="email"
          placeholder="you@utexas.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-2xl border border-moss/15 bg-white px-4 text-sm outline-none placeholder:text-ink/35 focus:border-moss"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full rounded-2xl border border-moss/15 bg-white px-4 text-sm outline-none placeholder:text-ink/35 focus:border-moss"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSubmit}
          className="flex-1 rounded-2xl bg-moss px-5 py-3 text-sm font-semibold text-cream"
        >
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-ink/60">
        {mode === "sign-in" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => { setMode("sign-up"); setMessage("Create your StudyMon account."); }}
              className="font-semibold text-moss hover:underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => { setMode("sign-in"); setMessage("Use your UT email to sign in or create an account."); }}
              className="font-semibold text-moss hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
