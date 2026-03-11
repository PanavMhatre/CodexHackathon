"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { Button, buttonVariants } from "@/components/ui/button";

interface UserInfo {
  fullName: string;
  email: string;
}

export function AuthHeader() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        setUser({
          fullName: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
          email: authUser.email || ""
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          fullName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || ""
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/sign-in");
    router.refresh();
  }

  if (loading) {
    return <div className="h-9 w-20 animate-pulse rounded-full bg-moss/10" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-semibold text-ink sm:inline">
          {user.fullName}
        </span>
        <Button onClick={handleSignOut} variant="secondary" size="sm" className="rounded-full px-4">
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Link
      href="/sign-in"
      className={buttonVariants({ variant: "secondary", size: "sm", className: "rounded-full px-4" })}
    >
      Sign in
    </Link>
  );
}
