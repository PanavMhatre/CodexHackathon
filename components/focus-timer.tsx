"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeFocusSession } from "@/lib/actions";
import { getCreatureById, getSpotBySlug } from "@/lib/mock-data";
import { getXpForDuration } from "@/lib/utils";

const durations = [25, 45, 60] as const;

export function FocusTimer({ initialSpotSlug }: { initialSpotSlug?: string }) {
  const router = useRouter();
  const spotSlug = initialSpotSlug || "perry-castaneda-library";
  const spot = getSpotBySlug(spotSlug) ?? getSpotBySlug("perry-castaneda-library");

  const [selectedDuration, setSelectedDuration] = useState<(typeof durations)[number]>(25);
  const [secondsLeft, setSecondsLeft] = useState(selectedDuration * 60);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSecondsLeft(selectedDuration * 60);
    setRunning(false);
    setMessage(null);
  }, [selectedDuration]);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      const formData = new FormData();
      formData.set("spotSlug", spot?.slug || "perry-castaneda-library");
      formData.set("duration", String(selectedDuration));

      startTransition(async () => {
        const result = await completeFocusSession(formData);
        const creature = result.grantedCreatureId
          ? getCreatureById(result.grantedCreatureId)
          : null;
        setMessage(
          creature
            ? `Session complete. You earned ${result.xpEarned} XP and caught ${creature.name}.`
            : `Session complete. You earned ${result.xpEarned} XP.`
        );
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [running, secondsLeft, selectedDuration, spot, startTransition]);

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [secondsLeft]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="panel bg-hero-grid p-6 sm:p-8">
        <p className="eyebrow">Focus Session</p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">{timeLabel}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-ink/70 sm:text-base">
          Studying at <span className="font-semibold text-ink">{spot?.name}</span>. Pick a timer length, start the session, and StudyMon will award XP on completion.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {durations.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => setSelectedDuration(duration)}
              className={
                selectedDuration === duration
                  ? "rounded-2xl bg-moss px-5 py-3 text-sm font-semibold text-cream"
                  : "rounded-2xl border border-moss/15 bg-white/85 px-5 py-3 text-sm font-semibold text-ink"
              }
            >
              {duration} min
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-moss"
          >
            Start focus session
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setSecondsLeft(selectedDuration * 60);
            }}
            className="rounded-2xl border border-moss/15 bg-white/85 px-5 py-3 text-sm font-semibold text-ink"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => router.push("/spots")}
            className="rounded-2xl border border-transparent px-5 py-3 text-sm font-semibold text-moss"
          >
            Change study spot
          </button>
        </div>

        <p className="mt-6 text-sm text-ink/60">
          Estimated reward: <span className="font-semibold text-moss">{getXpForDuration(selectedDuration)} XP</span>
        </p>
        {message ? <p className="mt-3 text-sm font-semibold text-moss">{message}</p> : null}
        {isPending ? <p className="mt-2 text-sm text-ink/60">Logging your session...</p> : null}
      </div>

      <div className="panel p-6">
        <p className="eyebrow">Session Rules</p>
        <div className="mt-4 space-y-4 text-sm leading-6 text-ink/70">
          <p>25 minutes is a quick momentum reset, 45 minutes is ideal for a focused block, and 60 minutes maximizes XP gain.</p>
          <p>Completing a session gives XP and a chance to catch the featured creature tied to the current study spot.</p>
          <p>For the MVP, rewards and timers are wired for local demo use while keeping the Supabase integration points ready.</p>
        </div>
      </div>
    </div>
  );
}
