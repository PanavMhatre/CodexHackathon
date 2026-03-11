import Link from "next/link";
import { Clock3, History, Sparkles } from "lucide-react";
import { getCreatureById, getSpotById } from "@/lib/mock-data";
import { StudySession } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";

export function SessionHistory({ sessions }: { sessions: StudySession[] }) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={<History className="h-7 w-7" />}
        title="No study sessions yet"
        description="Start a focus block and your latest study runs, XP gains, and creature drops will show up here."
        action={
          <Link href="/focus" className={buttonVariants({})}>
            <Clock3 className="h-4 w-4" />
            Start a session
          </Link>
        }
      />
    );
  }

  const totalXp = sessions.reduce((sum, s) => sum + s.xpEarned, 0);
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const creaturesFound = sessions.filter((s) => s.creatureGrantedId).length;

  return (
    <Card className="p-5">
      <div className="mb-4">
        <p className="eyebrow">Recent Sessions</p>
        <h3 className="mt-2 text-xl font-semibold text-ink">Your latest study runs</h3>
      </div>

      {/* Mini summary strip */}
      <div className="mb-4 flex flex-wrap gap-2.5 text-xs">
        <span className="rounded-full bg-moss/8 px-2.5 py-1 font-semibold text-moss">{sessions.length} sessions</span>
        <span className="rounded-full bg-fern/10 px-2.5 py-1 text-moss/70">{totalMinutes} min total</span>
        <span className="rounded-full bg-amber/15 px-2.5 py-1 text-amber-800">+{totalXp} XP</span>
        {creaturesFound > 0 && (
          <span className="rounded-full bg-lake/12 px-2.5 py-1 text-lake">{creaturesFound} creatures</span>
        )}
      </div>

      <div className="space-y-2">
        {sessions.map((session, index) => {
          const spot = getSpotById(session.studySpotId);
          const creature = session.creatureGrantedId ? getCreatureById(session.creatureGrantedId) : null;

          return (
            <Reveal
              key={session.id}
              delay={index * 40}
              className="rounded-2xl border border-moss/8 bg-cream/50 px-4 py-3 transition hover:border-moss/15 hover:bg-cream/70"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{spot?.name}</p>
                  <p className="text-sm text-ink/60">
                    {session.durationMinutes} min · {formatDateLabel(session.completedAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-moss">+{session.xpEarned} XP</p>
                  {creature ? (
                    <p className="flex items-center justify-end gap-1 text-sm text-ink/70">
                      <Sparkles className="h-3 w-3 text-amber-700" />
                      <span className="truncate">{creature.illustration} {creature.name}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-ink/40">No drop</p>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Card>
  );
}
