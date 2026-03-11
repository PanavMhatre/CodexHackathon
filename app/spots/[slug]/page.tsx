import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, PlugZap, Volume2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CheckInButton } from "@/components/check-in-button";
import { getCreatureById, getSpotBySlug } from "@/lib/mock-data";

export default function StudySpotDetailPage({
  params
}: {
  params: { slug: string };
}) {
  const spot = getSpotBySlug(params.slug);

  if (!spot) {
    notFound();
  }

  const creature = getCreatureById(spot.featuredCreatureId);

  return (
    <AppShell currentPath="/spots">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel bg-hero-grid p-6 sm:p-8">
          <p className="eyebrow">{spot.buildingCode}</p>
          <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">{spot.name}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70 sm:text-base">
            {spot.longDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {spot.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-moss/8 px-3 py-1 text-xs font-medium text-moss">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-moss/10 bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Volume2 className="h-4 w-4 text-coral" />
                Noise
              </div>
              <p className="mt-2 text-sm text-ink/65">{spot.noiseLevel}</p>
            </div>
            <div className="rounded-2xl border border-moss/10 bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <PlugZap className="h-4 w-4 text-lake" />
                Outlets
              </div>
              <p className="mt-2 text-sm text-ink/65">{spot.outletAvailability}</p>
            </div>
            <div className="rounded-2xl border border-moss/10 bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MapPin className="h-4 w-4 text-moss" />
                Creature
              </div>
              <p className="mt-2 text-sm text-ink/65">{creature?.name}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CheckInButton spotId={spot.id} />
            <Link
              href={`/focus?spot=${spot.slug}`}
              className="rounded-2xl border border-moss/15 bg-white/85 px-5 py-3 text-center text-sm font-semibold text-ink"
            >
              Start focus session
            </Link>
          </div>
        </section>

        <aside className="panel overflow-hidden">
          <div className={`bg-gradient-to-br ${creature?.accent ?? "from-moss to-fern"} p-6 text-white`}>
            <p className="text-6xl">{creature?.illustration ?? "✨"}</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              Featured Creature
            </p>
            <h2 className="mt-2 font-serif text-4xl">{creature?.name}</h2>
          </div>
          <div className="p-6">
            <p className="text-sm leading-6 text-ink/70">
              {creature?.description ??
                "Catch this location's creature by finishing a focus session after checking in."}
            </p>
            <p className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm text-ink/70">
              Reward logic: complete a 25, 45, or 60 minute session to gain XP and roll for this creature.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
