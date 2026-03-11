"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Pause, Play, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { completeFocusSession } from "@/lib/actions";
import { getCreatureById, getSpotBySlug } from "@/lib/mock-data";
import { getXpForDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { useToast } from "@/components/ui/toast-provider";

const durations = [25, 45, 60] as const;
type Duration = (typeof durations)[number];

const STORAGE_KEY = "studymon_focus_session";

interface PersistedSession {
  endAt: number | null;
  pausedSecondsLeft: number;
  durationMinutes: Duration;
  spotSlug: string;
  running: boolean;
}

function saveSession(session: PersistedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function computeSecondsLeft(session: PersistedSession): number {
  if (session.running && session.endAt) {
    return Math.max(0, Math.ceil((session.endAt - Date.now()) / 1000));
  }
  return session.pausedSecondsLeft;
}

function TimerRing({
  secondsLeft,
  totalSeconds,
  timeLabel,
  running
}: {
  secondsLeft: number;
  totalSeconds: number;
  timeLabel: string;
  running: boolean;
}) {
  const size = 340;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;
  const offset = circumference * (1 - progress);
  const isCritical = running && secondsLeft <= 60;

  return (
    <div className="relative mx-auto flex items-center justify-center">
      <div className="absolute inset-10 rounded-full bg-gradient-to-br from-amber/20 via-transparent to-lake/20 blur-2xl" />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={isCritical ? "animate-pulse-ring" : ""}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-moss/[0.08]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#timerGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
        <defs>
          <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isCritical ? "#f0755c" : "#1f4d3d"} />
            <stop offset="100%" stopColor={isCritical ? "#ffbf69" : "#8ecf9c"} />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-6xl font-bold tracking-tight text-ink sm:text-7xl lg:text-8xl">
          {timeLabel}
        </span>
        <span className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-ink/45">
          {running ? "Focus in progress" : "Ready when you are"}
        </span>
      </div>
    </div>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 18 }, (_, index) => ({
    id: index,
    left: `${8 + (index % 6) * 14}%`,
    delay: `${(index % 5) * 70}ms`,
    color: ["bg-amber", "bg-fern", "bg-coral", "bg-lake"][index % 4]
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={`absolute top-[58%] h-3 w-2 rounded-full ${piece.color} animate-confetti-burst`}
          style={{ left: piece.left, animationDelay: piece.delay }}
        />
      ))}
    </div>
  );
}

// ── Completion summary shown after a session finishes ────────────────────────

function CompletionSummary({
  xpEarned,
  durationMinutes,
  creature,
  onReset
}: {
  xpEarned: number;
  durationMinutes: number;
  creature: { name: string; illustration: string; rarity: string; description: string } | null;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-moss/10 text-moss">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-serif text-3xl text-ink">Session complete</h3>
        <p className="mt-2 text-sm text-ink/60">
          Great work staying focused for {durationMinutes} minutes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-fern/20 bg-gradient-to-br from-moss/[0.06] to-fern/[0.08] p-4 text-center">
          <Sparkles className="mx-auto h-5 w-5 text-moss/60" />
          <p className="mt-2 font-serif text-2xl font-bold text-ink">+{xpEarned}</p>
          <p className="mt-0.5 text-xs font-medium text-ink/50">XP earned</p>
        </div>
        <div className="rounded-2xl border border-amber/20 bg-gradient-to-br from-amber/[0.08] to-coral/[0.05] p-4 text-center">
          <Trophy className="mx-auto h-5 w-5 text-amber-700/60" />
          <p className="mt-2 font-serif text-2xl font-bold text-ink">{durationMinutes}m</p>
          <p className="mt-0.5 text-xs font-medium text-ink/50">Focused</p>
        </div>
      </div>

      {creature && (
        <div className="overflow-hidden rounded-2xl border border-amber/25 bg-gradient-to-r from-amber/10 via-white/80 to-fern/10">
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/20 text-3xl shadow-sm">
              {creature.illustration}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-serif text-xl font-semibold text-ink">{creature.name}</p>
                <Badge variant="amber">{creature.rarity}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink/60">{creature.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={onReset} className="flex-1 gap-2">
          <Play className="h-4 w-4" />
          Start another session
        </Button>
        <Link
          href="/collection"
          className={buttonVariants({ variant: "secondary", className: "flex-1 gap-2" })}
        >
          View collection
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function FocusTimer({ initialSpotSlug }: { initialSpotSlug?: string }) {
  const router = useRouter();
  const defaultSlug = initialSpotSlug || "perry-castaneda-library";
  const { pushToast } = useToast();

  const [selectedDuration, setSelectedDuration] = useState<Duration>(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [spotSlug, setSpotSlug] = useState(defaultSlug);
  const [hydrated, setHydrated] = useState(false);
  const [caughtCreatureId, setCaughtCreatureId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [isPending, startTransition] = useTransition();

  const spot = getSpotBySlug(spotSlug) ?? getSpotBySlug("perry-castaneda-library");
  const totalSeconds = selectedDuration * 60;
  const creature = caughtCreatureId ? getCreatureById(caughtCreatureId) : null;
  const progressPct = totalSeconds > 0 ? Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100) : 0;

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      const remaining = computeSecondsLeft(saved);
      setSelectedDuration(saved.durationMinutes);
      setSpotSlug(saved.spotSlug);

      if (remaining > 0) {
        setSecondsLeft(remaining);
        setRunning(saved.running);
      } else if (saved.running) {
        setSecondsLeft(0);
        setRunning(true);
      } else {
        setSecondsLeft(saved.pausedSecondsLeft);
      }
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((nextRunning: boolean, timeRemaining: number, duration: Duration, slug: string) => {
    if (nextRunning) {
      saveSession({
        endAt: Date.now() + timeRemaining * 1000,
        pausedSecondsLeft: timeRemaining,
        durationMinutes: duration,
        spotSlug: slug,
        running: true
      });
      return;
    }

    saveSession({
      endAt: null,
      pausedSecondsLeft: timeRemaining,
      durationMinutes: duration,
      spotSlug: slug,
      running: false
    });
  }, []);

  useEffect(() => {
    if (!hydrated || !running) return;

    if (secondsLeft <= 0) {
      setRunning(false);
      clearSession();

      const formData = new FormData();
      formData.set("spotSlug", spot?.slug || "perry-castaneda-library");
      formData.set("duration", String(selectedDuration));

      startTransition(async () => {
        const result = await completeFocusSession(formData);
        setCaughtCreatureId(result.grantedCreatureId ?? null);
        setEarnedXp(result.xpEarned);
        setSessionComplete(true);

        if (result.grantedCreatureId) {
          const grantedCreature = getCreatureById(result.grantedCreatureId);
          setShowConfetti(true);
          pushToast({
            tone: "celebration",
            title: `+${result.xpEarned} XP and a new creature`,
            description: grantedCreature
              ? `You caught ${grantedCreature.name} ${grantedCreature.illustration}.`
              : "You caught a new campus creature."
          });
        } else {
          pushToast({
            tone: "success",
            title: `+${result.xpEarned} XP earned`,
            description: "Session saved. Keep stacking focused blocks."
          });
        }
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [hydrated, running, secondsLeft, selectedDuration, spot, pushToast, startTransition]);

  useEffect(() => {
    if (!showConfetti) return;
    const timer = window.setTimeout(() => setShowConfetti(false), 1100);
    return () => window.clearTimeout(timer);
  }, [showConfetti]);

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [secondsLeft]);

  function handleDurationChange(duration: Duration) {
    setSelectedDuration(duration);
    setSecondsLeft(duration * 60);
    setRunning(false);
    setCaughtCreatureId(null);
    setSessionComplete(false);
    persist(false, duration * 60, duration, spotSlug);
  }

  function handleToggle() {
    const nextRunning = !running;
    setRunning(nextRunning);
    persist(nextRunning, secondsLeft, selectedDuration, spotSlug);
  }

  function handleReset() {
    setRunning(false);
    setSecondsLeft(selectedDuration * 60);
    setCaughtCreatureId(null);
    setSessionComplete(false);
    setEarnedXp(0);
    clearSession();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Reveal className="relative">
        <Card className="relative overflow-hidden bg-hero-grid p-6 sm:p-8">
          {showConfetti ? <ConfettiBurst /> : null}

          {/* Header with spot + progress badge */}
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Focus Session</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-moss/8 px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-moss/70" />
                <span className="text-xs font-semibold text-moss">{spot?.name}</span>
              </div>
            </div>
            {running && (
              <Badge variant="moss" className="animate-pulse">{progressPct}%</Badge>
            )}
          </div>

          {/* Completion state or active timer */}
          {sessionComplete ? (
            <div className="mt-8">
              <CompletionSummary
                xpEarned={earnedXp}
                durationMinutes={selectedDuration}
                creature={creature ? {
                  name: creature.name,
                  illustration: creature.illustration,
                  rarity: creature.rarity,
                  description: creature.description
                } : null}
                onReset={handleReset}
              />
            </div>
          ) : (
            <>
              <div className="my-6">
                <TimerRing
                  secondsLeft={secondsLeft}
                  totalSeconds={totalSeconds}
                  timeLabel={timeLabel}
                  running={running}
                />
              </div>

              {/* Segmented duration control */}
              <div className="flex justify-center">
                <div className="inline-flex rounded-2xl border border-moss/10 bg-white/60 p-1">
                  {durations.map((duration) => (
                    <button
                      key={duration}
                      disabled={running}
                      onClick={() => handleDurationChange(duration)}
                      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
                        selectedDuration === duration
                          ? "bg-moss text-cream shadow-sm"
                          : "text-ink/60 hover:text-ink disabled:opacity-40"
                      }`}
                    >
                      {duration}m
                      <span className="ml-1 text-[10px] font-medium opacity-60">+{getXpForDuration(duration)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Play / reset controls */}
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={handleToggle} size="lg" className="min-w-[140px] gap-2">
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? "Pause" : secondsLeft < totalSeconds ? "Resume" : "Start"}
                </Button>
                {(running || secondsLeft < totalSeconds) && (
                  <Button variant="secondary" size="lg" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}

          {isPending ? <p className="mt-4 text-center text-sm text-ink/50">Saving your session...</p> : null}
        </Card>
      </Reveal>

      <div className="flex flex-col gap-6">
        {/* Session info card */}
        <Reveal delay={80}>
          <Card className="p-6">
            <p className="eyebrow">Session info</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-cream/60 px-4 py-3">
                <span className="text-sm text-ink/70">Duration</span>
                <span className="text-sm font-bold text-ink">{selectedDuration} min</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-cream/60 px-4 py-3">
                <span className="text-sm text-ink/70">XP reward</span>
                <span className="text-sm font-bold text-moss">+{getXpForDuration(selectedDuration)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-cream/60 px-4 py-3">
                <span className="text-sm text-ink/70">Creature chance</span>
                <span className="text-sm font-bold text-ink">55%</span>
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={120}>
          <Card className="p-6">
            <p className="eyebrow">How It Works</p>
            <div className="mt-4 space-y-4 text-sm leading-6 text-ink/80">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-moss/8 text-[11px] font-bold text-moss">
                  1
                </span>
                <p>Pick 25, 45, or 60 minutes and earn proportional XP.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-moss/8 text-[11px] font-bold text-moss">
                  2
                </span>
                <p>Start the timer and stay focused until it completes.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-moss/8 text-[11px] font-bold text-moss">
                  3
                </span>
                <p>Earn XP and a chance to catch this spot&apos;s featured creature.</p>
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={160}>
          <button
            onClick={() => router.push("/spots")}
            className="flex w-full items-center gap-4 rounded-3xl border border-white/60 bg-white/80 p-5 text-left shadow-panel backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lake/10 text-lake">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Change study spot</p>
              <p className="text-xs text-ink/60">Currently at {spot?.buildingCode}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-ink/30" />
          </button>
        </Reveal>
      </div>
    </div>
  );
}
