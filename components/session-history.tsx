import { History, Sparkles } from "lucide-react";
import { getCreatureById, getSpotById } from "@/lib/mock-data";
import { StudySession } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";
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
      />
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="eyebrow">Recent Sessions</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">Your latest study runs</h3>
        </div>
      </div>
      <div className="space-y-3">
        {sessions.map((session, index) => {
          const spot = getSpotById(session.studySpotId);
          const creature = session.creatureGrantedId ? getCreatureById(session.creatureGrantedId) : null;

          return (
            <Reveal
              key={session.id}
              delay={index * 45}
              className="rounded-2xl border border-moss/10 bg-cream/70 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">{spot?.name}</p>
                  <p className="text-sm text-ink/80">
                    {session.durationMinutes} min on {formatDateLabel(session.completedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-moss">+{session.xpEarned} XP</p>
                  <p className="flex items-center justify-end gap-1 text-sm text-ink/80">
                    {creature ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-amber-800" />
                        {`${creature.illustration} ${creature.name}`}
                      </>
                    ) : (
                      "No creature drop"
                    )}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Card>
  );
}
