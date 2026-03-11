import { getCreatureById, getSpotById } from "@/lib/mock-data";
import { StudySession } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";

export function SessionHistory({ sessions }: { sessions: StudySession[] }) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="eyebrow">Recent Sessions</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">Your latest study runs</h3>
        </div>
      </div>
      <div className="space-y-3">
        {sessions.map((session) => {
          const spot = getSpotById(session.studySpotId);
          const creature = session.creatureGrantedId
            ? getCreatureById(session.creatureGrantedId)
            : null;

          return (
            <div
              key={session.id}
              className="rounded-2xl border border-moss/10 bg-cream/70 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">{spot?.name}</p>
                  <p className="text-sm text-ink/60">
                    {session.durationMinutes} min on {formatDateLabel(session.completedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-moss">+{session.xpEarned} XP</p>
                  <p className="text-sm text-ink/60">
                    {creature ? `${creature.illustration} ${creature.name}` : "No creature drop"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
