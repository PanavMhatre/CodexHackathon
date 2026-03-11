"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { StatCard } from "@/components/stat-card";

export function XpStatCard({
  value,
  detail,
  icon,
  progress
}: {
  value: number;
  detail: string;
  icon: ReactNode;
  progress: { current: number; max: number; label: string };
}) {
  const [displayValue, setDisplayValue] = useState(Math.max(0, value - 60));
  const [flash, setFlash] = useState(false);
  const previousValue = useRef(displayValue);

  useEffect(() => {
    const start = previousValue.current;
    const delta = value - start;
    if (delta <= 0) {
      setDisplayValue(value);
      return;
    }

    setFlash(true);
    const startedAt = performance.now();
    let frame = 0;

    const tick = (timestamp: number) => {
      const elapsed = timestamp - startedAt;
      const progressRatio = Math.min(elapsed / 900, 1);
      const nextValue = Math.round(start + delta * progressRatio);
      setDisplayValue(nextValue);

      if (progressRatio < 1) {
        frame = window.requestAnimationFrame(tick);
      } else {
        previousValue.current = value;
        window.setTimeout(() => setFlash(false), 300);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return (
    <StatCard
      label="Current XP"
      value={displayValue.toString()}
      detail={detail}
      valueClassName={flash ? "animate-number-flash" : undefined}
      icon={icon}
      accent="moss"
      progress={progress}
    />
  );
}
