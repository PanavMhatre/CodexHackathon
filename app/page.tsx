import Link from "next/link";
import { Flame, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { SessionHistory } from "@/components/session-history";
import { StudyCalendar } from "@/components/study-calendar";
import { StatCard } from "@/components/stat-card";
import { XpStatCard } from "@/components/xp-stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { dashboardSnapshot, getSpotById, studySpots } from "@/lib/mock-data";
import { StudySession } from "@/lib/types";
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
  let sessions: StudySession[] = dashboardSnapshot.recentSessions;

  if (hasSupabaseEnv()) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || firstName;
      firstName = (fullName as string).split(" ")[0];

      const [profileRes, collectionRes, sessionsRes] = await Promise.all([
        supabase.from("profiles").select("xp, streak").eq("id", user.id).single(),
        supabase.from("user_creatures").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase
          .from("study_sessions")
          .select("id, study_spot_id, duration_minutes, xp_earned, creature_granted_id, completed_at")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
      ]);

      if (profileRes.data) {
        xp = profileRes.data.xp;
        streak = profileRes.data.streak;
        level = computeLevel(xp);
      }

      collectionCount = collectionRes.count ?? 0;

      if (sessionsRes.data && sessionsRes.data.length > 0) {
        sessions = sessionsRes.data.map((row: any) => ({
          id: row.id,
          studySpotId: row.study_spot_id,
          durationMinutes: row.duration_minutes,
          xpEarned: row.xp_earned,
          creatureGrantedId: row.creature_granted_id,
          completedAt: row.completed_at
        }));
        const firstSpot = getSpotById(sessions[0].studySpotId);
        if (firstSpot) lastCaughtCode = firstSpot.buildingCode;
      }
    }
  }

  return (
    <AppShell currentPath="/">
      <Reveal>
        <Card className="bg-hero-grid p-6 sm:p-8">
          <SectionHeader
            eyebrow="Daily Dashboard"
            title={`Welcome back, ${firstName}`}
            description="Track your streak, keep momentum visible, and jump back into a focus session at one of UT Austin's best study spots."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <XpStatCard
              value={xp}
              detail={`Level ${level} explorer`}
              icon={<Sparkles className="h-5 w-5" />}
              progress={{
                current: xp % 200,
                max: 200,
                label: `${200 - (xp % 200)} XP to Level ${level + 1}`
              }}
            />
            <StatCard
              label="Study Streak"
              value={`${streak} days`}
              detail="Keep the streak alive with one completed session today."
              icon={<Flame className="h-5 w-5" />}
              accent="amber"
            />
            <StatCard
              label="Collection"
              value={`${collectionCount} caught`}
              detail={`Last found at ${lastCaughtCode}`}
              icon={<Trophy className="h-5 w-5" />}
              accent="lake"
              progress={{
                current: collectionCount,
                max: 10,
                label: `${10 - collectionCount} creatures remaining`
              }}
            />
          </div>
        </Card>
      </Reveal>

      <div className="my-10 h-px bg-moss/10" />

      <section className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr]">
        <Reveal delay={70}>
          <SessionHistory sessions={sessions} />
        </Reveal>

        <div className="flex flex-col gap-10">
          <Reveal delay={120}>
            <Card className="p-5">
              <p className="eyebrow">Featured Spot</p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{featuredSpot.name}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/80">{featuredSpot.longDescription}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featuredSpot.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href={`/spots/${featuredSpot.slug}`} className={buttonVariants({ className: "w-full" })}>
                  Open spot details
                </Link>
                <Link
                  href={`/focus?spot=${featuredSpot.slug}`}
                  className={buttonVariants({ variant: "secondary", className: "w-full" })}
                >
                  Start focus timer
                </Link>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={180}>
            <StudyCalendar sessions={sessions} />
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}
