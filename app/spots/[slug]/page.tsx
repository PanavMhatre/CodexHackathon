import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, MapPin, PlugZap, Sparkles, UserPlus, Volume2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CheckInButton } from "@/components/check-in-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { getCreatureById, getSpotBySlug } from "@/lib/mock-data";

const SpotMap = dynamic(() => import("@/components/spot-map"), { ssr: false });

const bestForMap: Record<string, string> = {
  Quiet: "Deep focus, long reading sessions, exam prep, solo work",
  Moderate: "Problem sets, group study, lab prep, project sprints",
  Buzzing: "Light work, planning, social study, writing breaks"
};

const ambianceMap: Record<string, string> = {
  Quiet: "Calm and focused. Minimal noise, serious study energy.",
  Moderate: "Balanced buzz. A mix of solo and group activity.",
  Buzzing: "Lively and social. Ambient noise with movement nearby."
};

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
      {/* Back link */}
      <Link
        href="/spots"
        className="mb-4 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-ink/60 transition hover:bg-white/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All spots
      </Link>

      {/* Hero map */}
      <Reveal>
        <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-panel backdrop-blur">
          <div className="relative h-[280px] overflow-hidden bg-hero-grid sm:h-[320px]">
            <SpotMap lat={spot.lat} lng={spot.lng} name={spot.name} height="100%" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-white/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
                  {spot.buildingCode}
                </span>
                <Badge variant="cream" className="border-white/30 bg-white/20 text-white backdrop-blur">
                  {spot.noiseLevel}
                </Badge>
              </div>
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl">{spot.name}</h1>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Left: details */}
        <div className="flex flex-col gap-6">
          <Reveal delay={70}>
            <Card className="bg-hero-grid p-6 sm:p-8">
              <p className="text-sm leading-7 text-ink/80 sm:text-base">{spot.longDescription}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {spot.tags.map((tag) => (
                  <Badge key={tag} variant="cream">{tag}</Badge>
                ))}
              </div>

              {/* Best for + Ambiance */}
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-moss/8 bg-cream/40 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Best for</p>
                  <p className="mt-1 text-sm text-ink/80">{bestForMap[spot.noiseLevel] ?? "General study"}</p>
                </div>
                <div className="rounded-2xl border border-moss/8 bg-cream/40 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Ambiance</p>
                  <p className="mt-1 text-sm text-ink/80">{ambianceMap[spot.noiseLevel] ?? "Standard campus energy."}</p>
                </div>
              </div>
            </Card>
          </Reveal>

          {/* Metadata grid */}
          <Reveal delay={100}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="rounded-2xl border-moss/10 p-4 shadow-none">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Volume2 className="h-4 w-4 text-coral" />
                  Noise Level
                </div>
                <p className="mt-2 text-lg font-bold text-ink">{spot.noiseLevel}</p>
              </Card>
              <Card className="rounded-2xl border-moss/10 p-4 shadow-none">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <PlugZap className="h-4 w-4 text-lake" />
                  Outlets
                </div>
                <p className="mt-2 text-lg font-bold text-ink">{spot.outletAvailability}</p>
              </Card>
              <Card className="rounded-2xl border-moss/10 p-4 shadow-none">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <MapPin className="h-4 w-4 text-moss" />
                  Address
                </div>
                <p className="mt-2 text-sm font-medium text-ink/80">{spot.address}</p>
              </Card>
            </div>
          </Reveal>

          {/* Actions */}
          <Reveal delay={130}>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CheckInButton spotId={spot.id} />
              <Link
                href={`/focus?spot=${spot.slug}`}
                className={buttonVariants({ variant: "secondary", className: "w-full gap-2 sm:w-auto" })}
              >
                <Clock3 className="h-4 w-4" />
                Start focus session
              </Link>
              <Button variant="secondary" className="w-full sm:w-auto">
                <UserPlus className="h-4 w-4" />
                Invite friend
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Right: featured creature */}
        <Reveal delay={130}>
          <Card className="h-fit overflow-hidden">
            <div className={`bg-gradient-to-br ${creature?.accent ?? "from-moss to-fern"} p-6 text-white`}>
              <div className="flex items-start justify-between">
                <p className="text-6xl drop-shadow-lg">{creature?.illustration ?? "✨"}</p>
                <Badge variant="cream" className="border-transparent bg-white/90 text-black">
                  {creature?.rarity ?? "Unknown"}
                </Badge>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Featured Creature</p>
              <h2 className="mt-1 font-serif text-3xl text-white sm:text-4xl">{creature?.name ?? "???"}</h2>
            </div>
            <div className="p-6">
              <p className="text-sm leading-6 text-ink/80">
                {creature?.description ?? "Catch this location's creature by finishing a focus session after checking in."}
              </p>
              <div className="mt-5 rounded-2xl bg-cream px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-ink/70">
                  <Sparkles className="h-4 w-4 text-amber-700" />
                  <span>Complete a focus session here for a 55% chance to catch {creature?.name ?? "this creature"}.</span>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </AppShell>
  );
}
