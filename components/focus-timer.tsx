"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, RotateCcw, MapPin, Pause } from "lucide-react";
import { completeFocusSession } from "@/lib/actions";
import { getCreatureById, getSpotBySlug } from "@/lib/mock-data";
import { getXpForDuration } from "@/lib/utils";

const durations = [25, 45, 60] as const;
type Duration = (typeof durations)[number];

const STORAGE_KEY = "studymon_focus_session";

// ─── Persisted session state ────────────────────────────────────────────────

interface PersistedSession {
  /** Unix ms timestamp when the timer should reach 0 (set when running) */
  endAt: number | null;
  /** Remaining seconds snapshot (set when paused) */
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
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/** Compute how many seconds remain from a persisted session. */
function computeSecondsLeft(session: PersistedSession): number {
  if (session.running && session.endAt) {
    return Math.max(0, Math.ceil((session.endAt - Date.now()) / 1000));
  }
  return session.pausedSecondsLeft;
}

// ─── Circular progress ring ─────────────────────────────────────────────────

function TimerRing({
  secondsLeft,
  totalSeconds,
  timeLabel,
  running,
}: {
  secondsLeft: number;
  totalSeconds: number;
  timeLabel: string;
  running: boolean;
}) {
  const size = 280;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative mx-auto flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-sm"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-moss/[0.08]"
        />
        {/* Progress arc */}
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
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
        <defs>
          <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f4d3d" />
            <stop offset="100%" stopColor="#8ecf9c" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-5xl font-bold tracking-tight text-ink sm:text-6xl">
          {timeLabel}
        </span>
        <span className="mt-1.5 text-xs font-medium uppercase tracking-widest text-ink/35">
          {running ? "Focusing..." : "Ready"}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function FocusTimer({ initialSpotSlug }: { initialSpotSlug?: string }) {
  const router = useRouter();
  const defaultSlug = initialSpotSlug || "perry-castaneda-library";

  const [selectedDuration, setSelectedDuration] = useState<Duration>(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [spotSlug, setSpotSlug] = useState(defaultSlug);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const spot = getSpotBySlug(spotSlug) ?? getSpotBySlug("perry-castaneda-library");
  const totalSeconds = selectedDuration * 60;

  // ── Hydrate from localStorage on mount ──────────────────────────────────
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
        // Timer expired while away — trigger completion
        setSecondsLeft(0);
        setRunning(true);
      } else {
        setSecondsLeft(saved.pausedSecondsLeft);
        setRunning(false);
      }
    }
    setHydrated(true);
  }, []);

  // ── Persist state to localStorage on every change ───────────────────────
  const persist = useCallback(
    (r: boolean, sLeft: number, dur: Duration, slug: string) => {
      if (r) {
        saveSession({
          endAt: Date.now() + sLeft * 1000,
          pausedSecondsLeft: sLeft,
          durationMinutes: dur,
          spotSlug: slug,
          running: true,
        });
      } else {
        saveSession({
          endAt: null,
          pausedSecondsLeft: sLeft,
          durationMinutes: dur,
          spotSlug: slug,
          running: false,
        });
      }
    },
    []
  );

  // ── Timer tick ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (!running) return;

    if (secondsLeft <= 0) {
      setRunning(false);
      clearSession();

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
            ? `Session complete! You earned ${result.xpEarned} XP and caught ${creature.name} ${creature.illustration}`
            : `Session complete! You earned ${result.xpEarned} XP.`
        );
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [hydrated, running, secondsLeft, selectedDuration, spot, startTransition]);

  // ── Handlers ────────────────────────────────────────────────────────────
  function handleDurationChange(dur: Duration) {
    setSelectedDuration(dur);
    setSecondsLeft(dur * 60);
    setRunning(false);
    setMessage(null);
    persist(false, dur * 60, dur, spotSlug);
  }

  function handleToggle() {
    const next = !running;
    setRunning(next);
    persist(next, secondsLeft, selectedDuration, spotSlug);
  }

  function handleReset() {
    setRunning(false);
    setSecondsLeft(selectedDuration * 60);
    setMessage(null);
    clearSession();
  }

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [secondsLeft]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {/* ── Left: Timer panel ───────────────────────────────────────────── */}
      <div className="panel bg-hero-grid p-6 sm:p-8">
        <p className="eyebrow">Focus Session</p>

        {/* Spot label */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-moss/8 px-3 py-1">
          <MapPin className="h-3 w-3 text-moss/60" />
          <span className="text-xs font-semibold text-moss">
            {spot?.name}
          </span>
        </div>

        {/* Circular timer */}
        <div className="my-8">
          <TimerRing
            secondsLeft={secondsLeft}
            totalSeconds={totalSeconds}
            timeLabel={timeLabel}
            running={running}
          />
        </div>

        {/* Duration pills */}
        <div className="flex justify-center gap-3">
          {durations.map((duration) => (
            <button
              key={duration}
              type="button"
              disabled={running}
              onClick={() => handleDurationChange(duration)}
              className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
                selectedDuration === duration
                  ? "bg-moss text-cream shadow-sm"
                  : "border border-moss/12 bg-white/80 text-ink hover:border-moss/25 disabled:opacity-50"
              }`}
            >
              {duration} min
              <span className="ml-1 text-[10px] font-medium opacity-60">
                +{getXpForDuration(duration)}
              </span>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-moss"
          >
            {running ? (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />{" "}
                {secondsLeft < totalSeconds ? "Resume" : "Start"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-moss/12 bg-white/80 px-5 py-3 text-sm font-semibold text-ink transition hover:border-moss/25"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

        {/* Status messages */}
        {message && (
          <div className="mx-auto mt-5 max-w-sm rounded-2xl bg-moss/8 px-4 py-3 text-center text-sm font-semibold text-moss">
            {message}
          </div>
        )}
        {isPending && (
          <p className="mt-3 text-center text-sm text-ink/50">
            Logging your session...
          </p>
        )}
      </div>

      {/* ── Right: Info panel ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="panel p-6">
          <p className="eyebrow">How It Works</p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-ink/70">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-moss/8 text-[11px] font-bold text-moss">
                1
              </span>
              <p>
                Pick a duration:{" "}
                <strong className="text-ink/80">25 min</strong> for a quick
                reset, <strong className="text-ink/80">45 min</strong> for a
                focused block, or{" "}
                <strong className="text-ink/80">60 min</strong> for max XP.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-moss/8 text-[11px] font-bold text-moss">
                2
              </span>
              <p>
                Hit start and lock in. The timer counts down while you focus on
                your work.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-moss/8 text-[11px] font-bold text-moss">
                3
              </span>
              <p>
                Earn XP and roll for the featured creature tied to your current
                study spot.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/spots")}
          className="panel flex items-center gap-3 p-5 text-left transition hover:shadow-lg"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lake/10 text-lake">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Change study spot</p>
            <p className="text-xs text-ink/50">
              Currently at {spot?.buildingCode}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
