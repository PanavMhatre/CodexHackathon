"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { TaskItem } from "@/lib/types";

export function TaskBoard({ initialTasks }: { initialTasks: TaskItem[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");

  function addTask() {
    if (!title.trim()) return;
    setTasks((current) => [
      {
        id: `task-${crypto.randomUUID()}`,
        title: title.trim(),
        dueLabel: "This week",
        completed: false,
        xpReward: 20,
      },
      ...current,
    ]);
    setTitle("");
  }

  function toggleTask(taskId: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  }

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="panel p-5">
      {/* Add task input */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          className="h-11 flex-1 rounded-2xl border border-moss/12 bg-white px-4 text-sm outline-none transition placeholder:text-ink/30 focus:border-moss/30 focus:ring-1 focus:ring-moss/10"
        />
        <button
          type="button"
          onClick={addTask}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-moss px-5 text-sm font-semibold text-cream transition hover:bg-ink"
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-moss/8" />

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((task) => (
            <label
              key={task.id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-moss/8 bg-cream/40 px-4 py-3 transition hover:border-moss/15 hover:bg-cream/70"
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="shrink-0 text-ink/20 transition hover:text-moss"
              >
                <Circle className="h-5 w-5" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{task.title}</p>
                <p className="text-xs text-ink/45">{task.dueLabel}</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                +{task.xpReward} XP
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {completed.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest text-ink/25">
            Completed
          </p>
          <div className="space-y-1.5">
            {completed.map((task) => (
              <label
                key={task.id}
                className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 transition hover:bg-cream/50"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0 text-moss/50 transition hover:text-moss"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
                <p className="flex-1 min-w-0 truncate text-sm text-ink/35 line-through">
                  {task.title}
                </p>
                <span className="shrink-0 text-[11px] text-ink/20">
                  +{task.xpReward} XP
                </span>
              </label>
            ))}
          </div>
        </>
      )}

      {tasks.length === 0 && (
        <p className="py-8 text-center text-sm text-ink/30">
          No tasks yet. Add one above to get started.
        </p>
      )}
    </div>
  );
}
