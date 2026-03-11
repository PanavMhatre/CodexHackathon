import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { MapPin, PlugZap, UserPlus, Volume2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CheckInButton } from "@/components/check-in-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { getCreatureById, getSpotBySlug } from "@/lib/mock-data";

const SpotMap = dynamic(() => import("@/components/spot-map"), { ssr: false });

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
      <Reveal>
        <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-panel backdrop-blur">
          <div className="relative h-[320px] overflow-hidden bg-hero-grid">
            <SpotMap lat={spot.lat} lng={spot.lng} name={spot.name} height="100%" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="eyebrow text-white/80">{spot.buildingCode}</p>
              <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{spot.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">{spot.longDescription}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Reveal delay={70}>
          <Card className="bg-hero-grid p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {spot.tags.map((tag) => (
                <Badge key={tag} variant="cream">{tag}</Badge>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Card className="rounded-2xl border-moss/10 p-4 shadow-none">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Volume2 className="h-4 w-4 text-coral" />
                  Noise
                </div>
                <p className="mt-2 text-sm text-ink/80">{spot.noiseLevel}</p>
              </Card>
              <Card className="rounded-2xl border-moss/10 p-4 shadow-none">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <PlugZap className="h-4 w-4 text-lake" />
                  Outlets
                </div>
                <p className="mt-2 text-sm text-ink/80">{spot.outletAvailability}</p>
              </Card>
              <Card className="rounded-2xl border-moss/10 p-4 shadow-none">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <MapPin className="h-4 w-4 text-moss" />
                  Creature
                </div>
                <p className="mt-2 text-sm text-ink/80">{creature?.name}</p>
              </Card>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CheckInButton spotId={spot.id} />
              <Link
                href={`/focus?spot=${spot.slug}`}
                className={buttonVariants({ variant: "secondary", className: "w-full sm:w-auto" })}
              >
                Start focus session
              </Link>
              <Button variant="secondary" className="w-full sm:w-auto">
                <UserPlus className="h-4 w-4" />
                Invite friend
              </Button>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={130}>
          <Card className="overflow-hidden">
            <div className={`bg-gradient-to-br ${creature?.accent ?? "from-moss to-fern"} p-6 text-white`}>
              <p className="text-6xl">{creature?.illustration ?? "✨"}</p>
              <Badge variant="cream" className="mt-5 bg-white/90 text-black border-transparent">
                Featured Creature
              </Badge>
              <h2 className="mt-2 font-serif text-4xl text-ink/80">{creature?.name}</h2>
            </div>
            <div className="p-6">
              <p className="text-sm leading-6 text-ink/80">
                {creature?.description ?? "Catch this location's creature by finishing a focus session after checking in."}
              </p>
              <p className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm text-ink/80">
                Reward logic: complete a 25, 45, or 60 minute session to gain XP and roll for this creature.
              </p>
            </div>
          </Card>
        </Reveal>
      </div>
    </AppShell>
  );
}
