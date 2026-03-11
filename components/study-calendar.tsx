"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { StudySession } from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function StudyCalendar({ sessions }: { sessions: StudySession[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Build a set of study days and XP totals for the visible month
  const studyDays = new Set<number>();
  const xpByDay: Record<number, number> = {};
  const sessionsByDay: Record<number, number> = {};

  for (const s of sessions) {
    const d = new Date(s.completedAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      studyDays.add(day);
      xpByDay[day] = (xpByDay[day] || 0) + s.xpEarned;
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
    }
  }

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const totalStudyDays = studyDays.size;
  const totalXp = Object.values(xpByDay).reduce((a, b) => a + b, 0);
  const totalSessions = Object.values(sessionsByDay).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="panel p-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="eyebrow">Study Calendar</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">
            {totalStudyDays} {totalStudyDays === 1 ? "day" : "days"} this month
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="rounded-xl p-2 text-ink/50 transition-colors hover:bg-cream hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-ink">
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-xl p-2 text-ink/50 transition-colors hover:bg-cream hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-ink/35"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const studied = studyDays.has(day);
          const isToday = isCurrentMonth && day === todayDate;
          const xp = xpByDay[day];
          const count = sessionsByDay[day];
          const isPast = isCurrentMonth && day < todayDate;
          const isFuture = isCurrentMonth && day > todayDate;

          return (
            <div
              key={day}
              title={
                studied
                  ? `${count} session${count > 1 ? "s" : ""} · +${xp} XP`
                  : undefined
              }
              className={`
                group relative flex aspect-square flex-col items-center justify-center
                rounded-xl text-sm transition-all duration-150
                ${
                  studied
                    ? "bg-moss font-semibold text-cream shadow-sm"
                    : isPast && !isFuture
                      ? "text-ink/30"
                      : "text-ink/60 hover:bg-cream/60"
                }
                ${isToday && !studied ? "ring-2 ring-moss/50 font-semibold text-ink" : ""}
                ${isToday && studied ? "ring-2 ring-amber shadow-md" : ""}
              `}
            >
              <span className="leading-none">{day}</span>

              {/* XP badge on study days */}
              {studied && (
                <span className="mt-0.5 text-[9px] font-medium leading-none text-cream/70">
                  +{xp}
                </span>
              )}

              {/* Dot indicator for today if not studied */}
              {isToday && !studied && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-moss/50" />
              )}
            </div>
          );
        })}
      </div>

      {/* Monthly summary bar */}
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-moss/8 bg-cream/50 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-moss/60" />
          <span className="text-xs font-medium text-ink/60">
            {totalSessions} {totalSessions === 1 ? "session" : "sessions"}
          </span>
        </div>
        <div className="h-3 w-px bg-ink/10" />
        <span className="text-xs font-semibold text-moss">
          +{totalXp} XP earned
        </span>
        {totalStudyDays > 0 && (
          <>
            <div className="h-3 w-px bg-ink/10" />
            <span className="text-xs text-ink/50">
              avg {Math.round(totalXp / totalStudyDays)} XP/day
            </span>
          </>
        )}
      </div>
    </div>
  );
}
