import Link from "next/link";
import { PlugZap, Volume2 } from "lucide-react";
import { StudySpot } from "@/lib/types";

export function SpotCard({ spot }: { spot: StudySpot }) {
  return (
    <Link
      href={`/spots/${spot.slug}`}
      className="panel block p-5 transition hover:-translate-y-0.5 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{spot.buildingCode}</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">{spot.name}</h3>
        </div>
        <div className="rounded-full border border-moss/15 px-3 py-1 text-xs font-semibold text-moss">
          {spot.noiseLevel}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink/70">{spot.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {spot.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-moss/8 px-3 py-1 text-xs font-medium text-moss">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-ink/70">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-coral" />
          {spot.noiseLevel}
        </div>
        <div className="flex items-center gap-2">
          <PlugZap className="h-4 w-4 text-lake" />
          {spot.outletAvailability}
        </div>
      </div>
    </Link>
  );
}
