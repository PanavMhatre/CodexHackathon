import Link from "next/link";
import { ArrowRight, PlugZap, Volume2 } from "lucide-react";
import { getCreatureById } from "@/lib/mock-data";
import { StudySpot } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

const noiseMeta: Record<string, { color: string }> = {
  Quiet: { color: "text-moss" },
  Moderate: { color: "text-amber-700" },
  Buzzing: { color: "text-coral" }
};

const bestForMap: Record<string, string> = {
  Quiet: "Deep focus, reading, exam prep",
  Moderate: "Problem sets, group study, projects",
  Buzzing: "Light work, planning, social study"
};

export function SpotCard({ spot }: { spot: StudySpot }) {
  const creature = getCreatureById(spot.featuredCreatureId);
  const noise = noiseMeta[spot.noiseLevel] ?? noiseMeta.Moderate;

  return (
    <Reveal className="h-full">
      <Link
        href={`/spots/${spot.slug}`}
        className="panel group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
      >
        {/* Header strip with code + creature */}
        <div className="flex items-center justify-between border-b border-moss/[0.06] bg-gradient-to-r from-cream/80 to-white/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-moss/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-moss">
              {spot.buildingCode}
            </span>
            {creature && (
              <span className="text-lg" title={creature.name}>{creature.illustration}</span>
            )}
          </div>
          <ArrowRight className="h-4 w-4 text-ink/20 transition-transform group-hover:translate-x-0.5 group-hover:text-ink/40" />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-semibold text-ink">{spot.name}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/70">{spot.description}</p>

          <p className="mt-3 text-xs text-ink/50">
            <span className="font-semibold text-ink/60">Best for:</span>{" "}
            {bestForMap[spot.noiseLevel] ?? "General study"}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {spot.tags.map((tag) => (
              <Badge key={tag} className="text-[11px]">{tag}</Badge>
            ))}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3 border-t border-moss/[0.06] pt-4 text-sm">
            <div className="flex items-center gap-2">
              <Volume2 className={`h-4 w-4 ${noise.color}`} />
              <span className="text-ink/70">{spot.noiseLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-lake" />
              <span className="text-ink/70">{spot.outletAvailability}</span>
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
