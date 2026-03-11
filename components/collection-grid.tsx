import { getCreatureById, getSpotById } from "@/lib/mock-data";
import { CollectionEntry } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";

export function CollectionGrid({ entries }: { entries: CollectionEntry[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => {
        const creature = getCreatureById(entry.creatureId);
        const spot = getSpotById(entry.originSpotId);

        if (!creature) return null;

        return (
          <div key={entry.id} className="panel overflow-hidden">
            <div className={`bg-gradient-to-br ${creature.accent} p-6 text-white`}>
              <div className="text-5xl">{creature.illustration}</div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
                {creature.rarity}
              </p>
              <h3 className="mt-2 font-serif text-3xl">{creature.name}</h3>
            </div>
            <div className="p-5">
              <p className="text-sm leading-6 text-ink/70">{creature.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-ink/60">
                <span>Caught at {spot?.buildingCode}</span>
                <span>{formatDateLabel(entry.acquiredAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
