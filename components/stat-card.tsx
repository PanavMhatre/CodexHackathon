import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon,
  accent = "moss",
  progress,
  valueClassName
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  accent?: "moss" | "amber" | "lake";
  progress?: { current: number; max: number; label: string };
  valueClassName?: string;
}) {
  const accentMap = {
    moss: {
      bg: "bg-gradient-to-br from-moss/[0.06] to-fern/[0.08]",
      iconBg: "bg-moss/12 text-moss",
      bar: "bg-moss",
      barTrack: "bg-moss/10"
    },
    amber: {
      bg: "bg-gradient-to-br from-amber/[0.08] to-coral/[0.05]",
      iconBg: "bg-amber/15 text-amber-800",
      bar: "bg-amber",
      barTrack: "bg-amber/10"
    },
    lake: {
      bg: "bg-gradient-to-br from-lake/[0.07] to-fern/[0.05]",
      iconBg: "bg-lake/12 text-lake",
      bar: "bg-lake",
      barTrack: "bg-lake/10"
    }
  };

  const a = accentMap[accent];

  return (
    <Card className={`overflow-hidden border-white/50 p-5 ${a.bg} transition-shadow hover:shadow-lg`}>
      <div className="mb-4 flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        <div className={`rounded-2xl p-2.5 ${a.iconBg}`}>{icon}</div>
      </div>
      <div>
        <p className={cn("text-3xl font-bold tracking-tight text-ink", valueClassName)}>{value}</p>
        <p className="mt-1.5 text-sm text-ink/80">{detail}</p>
      </div>
      {progress ? (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-medium text-ink/50">{progress.label}</span>
            <span className="text-[11px] font-semibold text-ink/60">
              {progress.current}/{progress.max}
            </span>
          </div>
          <div className={`h-1.5 w-full overflow-hidden rounded-full ${a.barTrack}`}>
            <div
              className={`h-full rounded-full ${a.bar} transition-all duration-500`}
              style={{ width: `${Math.min((progress.current / progress.max) * 100, 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
