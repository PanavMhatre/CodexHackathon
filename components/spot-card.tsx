import Link from "next/link";
import { PlugZap, Volume2 } from "lucide-react";
import { StudySpot } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

export function SpotCard({ spot }: { spot: StudySpot }) {
  return (
    <Reveal className="h-full">
      <Link
        href={`/spots/${spot.slug}`}
        className="panel flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:bg-white"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{spot.buildingCode}</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{spot.name}</h3>
          </div>
          <Badge variant="cream">{spot.noiseLevel}</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-ink/80">{spot.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {spot.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3 pt-5 text-sm text-ink/80">
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
    </Reveal>
  );
}
