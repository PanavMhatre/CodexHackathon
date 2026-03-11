"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { StudySession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function StudyCalendar({ sessions }: { sessions: StudySession[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const studyDays = new Set<number>();
  const xpByDay: Record<number, number> = {};
  const sessionsByDay: Record<number, number> = {};

  for (const session of sessions) {
    const date = new Date(session.completedAt);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate();
      studyDays.add(day);
      xpByDay[day] = (xpByDay[day] || 0) + session.xpEarned;
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
    }
  }

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();
  const totalStudyDays = studyDays.size;
  const totalXp = Object.values(xpByDay).reduce((sum, value) => sum + value, 0);
  const totalSessions = Object.values(sessionsByDay).reduce((sum, value) => sum + value, 0);
  const monthLabel = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="eyebrow">Study Calendar</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">
            {totalStudyDays} {totalStudyDays === 1 ? "day" : "days"} this month
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-ink/70"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            aria-label="View previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-ink">{monthLabel}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-ink/70"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            aria-label="View next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-ink/40">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`pad-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const studied = studyDays.has(day);
          const isToday = isCurrentMonth && day === todayDate;
          const xp = xpByDay[day];
          const count = sessionsByDay[day];
          const isPast = isCurrentMonth && day < todayDate;

          return (
            <div
              key={day}
              title={studied ? `${count} session${count > 1 ? "s" : ""} · +${xp} XP` : undefined}
              className={[
                "group relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all duration-150",
                studied ? "bg-moss font-semibold text-cream shadow-sm" : isPast ? "text-ink/35" : "text-ink/70 hover:bg-cream/60",
                isToday && !studied ? "ring-2 ring-moss/50 font-semibold text-ink" : "",
                isToday && studied ? "ring-2 ring-amber shadow-md" : ""
              ].join(" ")}
            >
              <span className="leading-none">{day}</span>
              {studied ? <span className="mt-0.5 text-[9px] font-medium leading-none text-cream/70">+{xp}</span> : null}
              {isToday && !studied ? <span className="mt-0.5 h-1 w-1 rounded-full bg-moss/50" /> : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-moss/8 bg-cream/50 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-moss/60" />
          <span className="text-xs font-medium text-ink/70">
            {totalSessions} {totalSessions === 1 ? "session" : "sessions"}
          </span>
        </div>
        <div className="h-3 w-px bg-ink/10" />
        <span className="text-xs font-semibold text-moss">+{totalXp} XP earned</span>
        {totalStudyDays > 0 ? (
          <>
            <div className="h-3 w-px bg-ink/10" />
            <span className="text-xs text-ink/60">avg {Math.round(totalXp / totalStudyDays)} XP/day</span>
          </>
        ) : null}
      </div>
    </Card>
  );
}
