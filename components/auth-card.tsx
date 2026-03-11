"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <p className="mt-3 text-sm leading-6 text-ink/80">{message}</p>

      <div className="mt-6 space-y-4">
        {mode === "sign-up" ? (
          <>
            <Input type="text" placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            <Input type="text" placeholder="Major (e.g. Computer Science)" value={major} onChange={(event) => setMajor(event.target.value)} />
          </>
        ) : null}
        <Input type="email" placeholder="you@utexas.edu" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>

      <div className="mt-6">
        <Button onClick={handleSubmit} disabled={isPending} className="w-full">
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </Button>
      </div>

      <p className="mt-4 text-center text-sm text-ink/70">
        {mode === "sign-in" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("sign-up");
                setMessage("Create your StudyMon account.");
              }}
              className="font-semibold text-moss hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("sign-in");
                setMessage("Use your UT email to sign in or create an account.");
              }}
              className="font-semibold text-moss hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
