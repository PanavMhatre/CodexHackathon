"use client";

import Link from "next/link";
import { useState } from "react";
import { Compass, Lock, MapPin, Sparkles } from "lucide-react";
import { creatures, getSpotById, studySpots } from "@/lib/mock-data";
import { CollectionEntry, Creature } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";

type RarityFilter = "All" | "Common" | "Rare" | "Epic";

const rarityOrder: Record<Creature["rarity"], number> = { Epic: 0, Rare: 1, Common: 2 };

function rarityBadgeClasses(rarity: Creature["rarity"]) {
  switch (rarity) {
    case "Epic":
      return "bg-purple-600 text-white border border-purple-700";
    case "Rare":
      return "bg-orange-500 text-white border border-orange-600";
    default:
      return "bg-yellow-400 text-yellow-900 border border-yellow-500";
  }
}

function rarityGlowClass(rarity: Creature["rarity"]) {
  switch (rarity) {
    case "Epic":
      return "holographic-epic";
    case "Rare":
      return "holographic-rare";
    default:
      return "";
  }
}

export function CollectionGrid({ entries }: { entries: CollectionEntry[] }) {
  const [filter, setFilter] = useState<RarityFilter>("All");

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-7 w-7" />}
        title="Your collection is still empty"
        description="Finish focus sessions after checking into a study spot to start catching campus creatures."
        action={
          <Link href="/focus" className={buttonVariants({})}>
            <Compass className="h-4 w-4" />
            Start your first session
          </Link>
        }
      />
    );
  }

  const caughtIds = new Set(entries.map((entry) => entry.creatureId));
  const allCreatures = [...creatures].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
  const filtered = filter === "All" ? allCreatures : allCreatures.filter((creature) => creature.rarity === filter);
  const caughtCount = entries.length;
  const totalCount = creatures.length;
  const progressPct = Math.round((caughtCount / totalCount) * 100);
  const filters: RarityFilter[] = ["All", "Common", "Rare", "Epic"];

  const rarityCounts = {
    Common: creatures.filter((creature) => creature.rarity === "Common").length,
    Rare: creatures.filter((creature) => creature.rarity === "Rare").length,
    Epic: creatures.filter((creature) => creature.rarity === "Epic").length
  };

  const caughtByRarity = {
    Common: entries.filter((entry) => creatures.find((creature) => creature.id === entry.creatureId)?.rarity === "Common").length,
    Rare: entries.filter((entry) => creatures.find((creature) => creature.id === entry.creatureId)?.rarity === "Rare").length,
    Epic: entries.filter((entry) => creatures.find((creature) => creature.id === entry.creatureId)?.rarity === "Epic").length
  };

  // Next unlock hint: first uncaught creature
  const nextUncaught = allCreatures.find((c) => !caughtIds.has(c.id));
  const nextSpot = nextUncaught ? studySpots.find((s) => s.featuredCreatureId === nextUncaught.id) : null;

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-ink">
                {caughtCount}
                <span className="text-ink/30">/{totalCount}</span>
              </span>
              <span className="text-sm text-ink/60">creatures caught</span>
              <span className="ml-1 rounded-full bg-moss/10 px-2 py-0.5 text-xs font-bold text-moss">
                {progressPct}%
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-moss/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-moss to-fern transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {nextSpot && nextUncaught && (
              <p className="mt-2.5 text-xs text-ink/50">
                Next unlock: Study at{" "}
                <span className="font-semibold text-ink/70">{nextSpot.name}</span>{" "}
                to find a {nextUncaught.rarity.toLowerCase()} creature.
              </p>
            )}
          </div>

          {/* Per-rarity mini stats */}
          <div className="flex gap-4 text-center">
            {(["Common", "Rare", "Epic"] as const).map((rarity) => (
              <div key={rarity} className="min-w-[4.5rem]">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink/35">{rarity}</div>
                <div className="mt-0.5 font-serif text-lg text-ink">
                  {caughtByRarity[rarity]}
                  <span className="text-ink/25">/{rarityCounts[rarity]}</span>
                </div>
                <div className="mx-auto mt-1.5 h-1 w-10 overflow-hidden rounded-full bg-ink/[0.06]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rarity === "Epic" ? "bg-purple-500" : rarity === "Rare" ? "bg-orange-400" : "bg-amber"
                    }`}
                    style={{
                      width: `${rarityCounts[rarity] > 0 ? (caughtByRarity[rarity] / rarityCounts[rarity]) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item}
            variant={filter === item ? "primary" : "secondary"}
            size="sm"
            className="rounded-full px-4"
            onClick={() => setFilter(item)}
          >
            {item}
            {item !== "All" && (
              <span className="ml-1 text-[10px] opacity-60">
                {caughtByRarity[item as keyof typeof caughtByRarity]}/{rarityCounts[item as keyof typeof rarityCounts]}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Creature grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((creature, index) => {
          const caught = caughtIds.has(creature.id);
          const entry = entries.find((item) => item.creatureId === creature.id);
          const spot = entry ? getSpotById(entry.originSpotId) : null;
          const hintSpot = !caught ? studySpots.find((s) => s.featuredCreatureId === creature.id) : null;

          return caught ? (
            <CaughtCard
              key={creature.id}
              creature={creature}
              spotCode={spot?.buildingCode}
              acquiredAt={entry?.acquiredAt ?? ""}
              delay={index * 45}
            />
          ) : (
            <LockedCard
              key={creature.id}
              creature={creature}
              hintSpotName={hintSpot?.name}
              delay={index * 45}
            />
          );
        })}
      </div>
    </div>
  );
}

function CaughtCard({
  creature,
  spotCode,
  acquiredAt,
  delay
}: {
  creature: Creature;
  spotCode?: string;
  acquiredAt: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className={`panel overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${rarityGlowClass(creature.rarity)}`}>
      <div className={`relative overflow-hidden bg-gradient-to-br ${creature.accent} p-6 text-white`}>
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/[0.07]" />
        <div className="relative z-10 text-6xl drop-shadow-lg">{creature.illustration}</div>
        <span className={`mt-3 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] ${rarityBadgeClasses(creature.rarity)}`}>
          {creature.rarity}
        </span>
        <h3 className="mt-1.5 font-serif text-2xl leading-tight tracking-tight text-ink/80 sm:text-3xl">{creature.name}</h3>
      </div>
      <div className="p-5">
        <p className="text-sm leading-relaxed text-ink/80">{creature.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-ink/[0.06] pt-3 text-xs text-ink/55">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <Badge variant="moss" className="px-2.5">{spotCode ?? "Unknown"}</Badge>
          </div>
          <span>{formatDateLabel(acquiredAt)}</span>
        </div>
      </div>
    </Reveal>
  );
}

function LockedCard({ creature, hintSpotName, delay }: { creature: Creature; hintSpotName?: string; delay: number }) {
  return (
    <Reveal delay={delay} className="panel overflow-hidden opacity-65 transition-all duration-300 hover:opacity-80">
      <div className="relative overflow-hidden bg-gradient-to-br from-stone-200 to-stone-300 p-6">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/[0.07]" />
        <div className="relative z-10 text-6xl opacity-30 grayscale">{creature.illustration}</div>
        <Badge variant="cream" className="mt-3 border-stone-400/30 bg-stone-400/20 text-stone-500">
          {creature.rarity}
        </Badge>
        <h3 className="mt-1.5 font-serif text-2xl leading-tight tracking-tight text-stone-500 sm:text-3xl">???</h3>
      </div>
      <div className="p-5">
        <p className="text-sm italic leading-relaxed text-ink/40">
          {hintSpotName
            ? `Study at ${hintSpotName} to discover this creature.`
            : "Study at the right spot to discover this creature."}
        </p>
        <div className="mt-4 flex items-center gap-1.5 border-t border-ink/[0.06] pt-3 text-xs text-ink/30">
          <Lock className="h-3 w-3" />
          Not yet caught
        </div>
      </div>
    </Reveal>
  );
}
