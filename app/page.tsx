import Link from "next/link";
import { Flame, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { SessionHistory } from "@/components/session-history";
import { StatCard } from "@/components/stat-card";
import { dashboardSnapshot, getSpotById, studySpots } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function computeLevel(xp: number) {
  return Math.floor(xp / 200) + 1;
}

export default async function DashboardPage() {
  const featuredSpot = studySpots[0];

  let firstName = dashboardSnapshot.profile.fullName.split(" ")[0];
  let xp = dashboardSnapshot.profile.xp;
  let streak = dashboardSnapshot.profile.streak;
  let level = dashboardSnapshot.profile.level;
  let collectionCount = dashboardSnapshot.collection.length;
  let lastCaughtCode = getSpotById(dashboardSnapshot.recentSessions[0]?.studySpotId)?.buildingCode ?? featuredSpot.buildingCode;

  if (hasSupabaseEnv()) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || firstName;
      firstName = (fullName as string).split(" ")[0];

      const [profileRes, collectionRes, lastSessionRes] = await Promise.all([
        supabase.from("profiles").select("xp, streak").eq("id", user.id).single(),
        supabase.from("user_creatures").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase
          .from("study_sessions")
          .select("study_spots ( building_code )")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(1)
          .single()
      ]);

      if (profileRes.data) {
        xp = profileRes.data.xp;
        streak = profileRes.data.streak;
        level = computeLevel(xp);
      }

      collectionCount = collectionRes.count ?? 0;

      const lastSpot = (lastSessionRes.data as any)?.study_spots;
      if (lastSpot?.building_code) {
        lastCaughtCode = lastSpot.building_code;
      }
    }
  }

  return (
    <AppShell currentPath="/">
      <section className="panel bg-hero-grid p-6 sm:p-8">
        <SectionHeader
          eyebrow="Daily Dashboard"
          title={`Welcome back, ${firstName}`}
          description="Track your streak, keep momentum visible, and jump back into a focus session at one of UT Austin's best study spots."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Current XP"
            value={xp.toString()}
            detail={`Level ${level} explorer`}
            icon={<Sparkles className="h-5 w-5" />}
          />
          <StatCard
            label="Study Streak"
            value={`${streak} days`}
            detail="Keep the streak alive with one completed session today."
            icon={<Flame className="h-5 w-5" />}
          />
          <StatCard
            label="Collection"
            value={`${collectionCount} caught`}
            detail={`Last found at ${lastCaughtCode}`}
            icon={<Trophy className="h-5 w-5" />}
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SessionHistory sessions={dashboardSnapshot.recentSessions} />

        <div className="panel p-5">
          <p className="eyebrow">Featured Spot</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">{featuredSpot.name}</h3>
          <p className="mt-3 text-sm leading-6 text-ink/70">{featuredSpot.longDescription}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {featuredSpot.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-moss/8 px-3 py-1 text-xs font-medium text-moss">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/spots/${featuredSpot.slug}`}
              className="rounded-2xl bg-moss px-4 py-3 text-center text-sm font-semibold text-cream"
            >
              Open spot details
            </Link>
            <Link
              href={`/focus?spot=${featuredSpot.slug}`}
              className="rounded-2xl border border-moss/15 bg-white px-4 py-3 text-center text-sm font-semibold text-ink"
            >
              Start focus timer
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
