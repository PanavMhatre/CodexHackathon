"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Circle, ClipboardList, Plus, Sparkles, Trash2 } from "lucide-react";
import { TaskItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";

export function TaskBoard({ initialTasks }: { initialTasks: TaskItem[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const { pushToast } = useToast();

  function addTask() {
    if (!title.trim()) return;

    const nextTitle = title.trim();
    setTasks((current) => [
      {
        id: `task-${crypto.randomUUID()}`,
        title: nextTitle,
        dueLabel: "This week",
        completed: false,
        xpReward: 20
      },
      ...current
    ]);
    setTitle("");
    pushToast({
      tone: "info",
      title: "Task added",
      description: `${nextTitle} is queued for your next study block.`
    });
  }

  function toggleTask(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    setTasks((current) =>
      current.map((item) => (item.id === taskId ? { ...item, completed: !item.completed } : item))
    );
    if (task && !task.completed) {
      pushToast({
        tone: "success",
        title: "Task completed",
        description: `+${task.xpReward} XP momentum banked.`
      });
    }
  }

  function removeCompleted() {
    setTasks((current) => current.filter((t) => !t.completed));
    pushToast({ tone: "info", title: "Cleared completed tasks", description: "Your board is cleaned up." });
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-7 w-7" />}
        title="No tasks queued up"
        description="Add a task to turn your next focus session into something concrete. Each completed task earns you XP."
        action={
          <Link href="/focus" className={buttonVariants({})}>
            Start a focus block
          </Link>
        }
      />
    );
  }

  const pending = tasks.filter((task) => !task.completed);
  const completed = tasks.filter((task) => task.completed);
  const totalXpPending = pending.reduce((sum, t) => sum + t.xpReward, 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-moss/8 px-3 py-1 font-semibold text-moss">
          {pending.length} open
        </span>
        <span className="rounded-full bg-fern/10 px-3 py-1 text-moss/70">
          {completed.length} done
        </span>
        {totalXpPending > 0 && (
          <span className="rounded-full bg-amber/15 px-3 py-1 text-amber-800">
            <Sparkles className="mr-1 inline h-3 w-3" />
            {totalXpPending} XP available
          </span>
        )}
      </div>

      <Card className="p-5">
        {/* Add task */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && addTask()}
            placeholder="Add a new task..."
            className="flex-1"
          />
          <Button onClick={addTask} disabled={!title.trim()}>
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        </div>

        <div className="my-4 h-px bg-moss/8" />

        {/* Pending tasks */}
        {pending.length > 0 ? (
          <div className="space-y-2">
            {pending.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-2xl border border-moss/8 bg-cream/40 px-4 py-3 transition hover:border-moss/15 hover:bg-cream/70"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink/30 transition hover:bg-moss/8 hover:text-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2"
                  aria-label={`Mark ${task.title} complete`}
                >
                  <Circle className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{task.title}</p>
                  <p className="text-xs text-ink/60">{task.dueLabel}</p>
                </div>
                <Badge variant="amber" className="shrink-0">
                  +{task.xpReward} XP
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-moss/15 bg-cream/30 px-6 py-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-moss/30" />
            <p className="mt-2 text-sm font-semibold text-ink/50">All tasks complete</p>
            <p className="mt-1 text-xs text-ink/40">Add more tasks or start a focus session to keep building momentum.</p>
          </div>
        )}

        {/* Completed tasks */}
        {completed.length > 0 && (
          <>
            <div className="mb-2 mt-5 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/30">
                Completed ({completed.length})
              </p>
              <button
                onClick={removeCompleted}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-ink/30 transition hover:bg-cream/70 hover:text-ink/50"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            </div>
            <div className="space-y-1.5">
              {completed.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-2xl px-4 py-2.5 transition hover:bg-cream/50"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-moss/50 transition hover:text-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2"
                    aria-label={`Reopen ${task.title}`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                  <p className="min-w-0 flex-1 truncate text-sm text-ink/35 line-through">{task.title}</p>
                  <span className="shrink-0 text-[11px] text-ink/25">+{task.xpReward} XP</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
