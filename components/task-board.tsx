"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
        xpReward: 20
      },
      ...current
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

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <p className="eyebrow">Add Task</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Outline BIO 311D lecture review"
            className="h-12 flex-1 rounded-2xl border border-moss/15 bg-white px-4 text-sm outline-none ring-0 transition placeholder:text-ink/35 focus:border-moss"
          />
          <button
            type="button"
            onClick={addTask}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-moss px-5 text-sm font-semibold text-cream transition hover:bg-ink"
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </div>
      </div>

      <div className="panel p-5">
        <p className="eyebrow">Task Queue</p>
        <div className="mt-4 space-y-3">
          {tasks.map((task) => (
            <label
              key={task.id}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-moss/10 bg-cream/70 px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="mt-1 h-4 w-4 rounded border-moss/30 text-moss focus:ring-moss"
                />
                <div>
                  <p className={task.completed ? "text-ink/45 line-through" : "font-semibold text-ink"}>
                    {task.title}
                  </p>
                  <p className="text-sm text-ink/60">{task.dueLabel}</p>
                </div>
              </div>
              <p className="rounded-full bg-amber/20 px-3 py-1 text-xs font-semibold text-ink">
                +{task.xpReward} XP
              </p>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
