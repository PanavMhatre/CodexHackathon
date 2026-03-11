import Link from "next/link";
import { Flame, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { SessionHistory } from "@/components/session-history";
import { StatCard } from "@/components/stat-card";
import { dashboardSnapshot, getSpotById, studySpots } from "@/lib/mock-data";

export default function DashboardPage() {
  const featuredSpot = studySpots[0];
  const lastSessionSpot = getSpotById(dashboardSnapshot.recentSessions[0].studySpotId);

  return (
    <AppShell currentPath="/">
      <section className="panel bg-hero-grid p-6 sm:p-8">
        <SectionHeader
          eyebrow="Daily Dashboard"
          title={`Welcome back, ${dashboardSnapshot.profile.fullName.split(" ")[0]}`}
          description="Track your streak, keep momentum visible, and jump back into a focus session at one of UT Austin's best study spots."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Current XP"
            value={dashboardSnapshot.profile.xp.toString()}
            detail={`Level ${dashboardSnapshot.profile.level} explorer`}
            icon={<Sparkles className="h-5 w-5" />}
          />
          <StatCard
            label="Study Streak"
            value={`${dashboardSnapshot.profile.streak} days`}
            detail="Keep the streak alive with one completed session today."
            icon={<Flame className="h-5 w-5" />}
          />
          <StatCard
            label="Collection"
            value={`${dashboardSnapshot.collection.length} caught`}
            detail={`Last found at ${lastSessionSpot?.buildingCode ?? featuredSpot.buildingCode}`}
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
