import { clsx } from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function getXpForDuration(minutes: number) {
  if (minutes >= 60) return 120;
  if (minutes >= 45) return 85;
  return 50;
}

export function getLevelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 200) + 1);
}
