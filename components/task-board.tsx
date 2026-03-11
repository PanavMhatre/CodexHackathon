"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Circle, ClipboardList, Plus } from "lucide-react";
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

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-7 w-7" />}
        title="No tasks queued up"
        description="Add a task to turn your next focus session into something concrete."
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

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          className="flex-1"
        />
        <Button onClick={addTask}>
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>

      <div className="my-4 h-px bg-moss/8" />

      {pending.length > 0 ? (
        <div className="space-y-2">
          {pending.map((task) => (
            <label
              key={task.id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-moss/8 bg-cream/40 px-4 py-3 transition hover:border-moss/15 hover:bg-cream/70"
            >
              <Button
                onClick={() => toggleTask(task.id)}
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl p-0 text-ink/30 hover:text-moss"
                aria-label={`Mark ${task.title} complete`}
              >
                <Circle className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{task.title}</p>
                <p className="text-xs text-ink/60">{task.dueLabel}</p>
              </div>
              <Badge variant="amber" className="shrink-0">
                +{task.xpReward} XP
              </Badge>
            </label>
          ))}
        </div>
      ) : null}

      {completed.length > 0 ? (
        <>
          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest text-ink/30">
            Completed
          </p>
          <div className="space-y-1.5">
            {completed.map((task) => (
              <label key={task.id} className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 transition hover:bg-cream/50">
                <Button
                  onClick={() => toggleTask(task.id)}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-xl p-0 text-moss/50 hover:text-moss"
                  aria-label={`Reopen ${task.title}`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </Button>
                <p className="min-w-0 flex-1 truncate text-sm text-ink/35 line-through">{task.title}</p>
                <span className="shrink-0 text-[11px] text-ink/25">+{task.xpReward} XP</span>
              </label>
            ))}
          </div>
        </>
      ) : null}
    </Card>
  );
}
