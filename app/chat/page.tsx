"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/app-shell";
import {
  Send,
  Bot,
  User,
  MapPinned,
  CheckCircle2,
  Clock3,
  BookOpen,
  Sparkles,
  BarChart3,
  Loader2,
  ChevronDown,
  ChevronUp,
  Navigation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SpotMap = dynamic(() => import("@/components/spot-map"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolCall = {
  name: string;
  input: Record<string, unknown>;
  result?: Record<string, unknown>;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  toolCalls: ToolCall[];
  isStreaming?: boolean;
};

// ─── Tool metadata ─────────────────────────────────────────────────────────────

const TOOL_META: Record<string, { label: string; icon: React.ReactNode }> = {
  search_study_spots: { label: "Searching study spots", icon: <MapPinned className="h-3.5 w-3.5" /> },
  get_spot_details: { label: "Getting spot details", icon: <MapPinned className="h-3.5 w-3.5" /> },
  check_in_to_spot: { label: "Booking spot", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  start_focus_session: { label: "Starting focus session", icon: <Clock3 className="h-3.5 w-3.5" /> },
  get_tasks: { label: "Loading tasks", icon: <BookOpen className="h-3.5 w-3.5" /> },
  add_task: { label: "Adding task", icon: <BookOpen className="h-3.5 w-3.5" /> },
  complete_task: { label: "Completing task", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  get_user_stats: { label: "Loading your stats", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  get_collection: { label: "Loading collection", icon: <Sparkles className="h-3.5 w-3.5" /> },
  get_directions: { label: "Getting directions", icon: <Navigation className="h-3.5 w-3.5" /> }
};

// ─── Tool result card ─────────────────────────────────────────────────────────

function ToolResultCard({ toolCall }: { toolCall: ToolCall }) {
  const [open, setOpen] = useState(toolCall.name === "get_directions");
  const meta = TOOL_META[toolCall.name] ?? { label: toolCall.name, icon: <Bot className="h-3.5 w-3.5" /> };
  const result = toolCall.result;

  return (
    <div className="mt-2 rounded-2xl border border-moss/10 bg-cream/60 text-xs overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-moss/80 transition-colors hover:text-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <span className="text-moss/50">{meta.icon}</span>
        <span className="font-semibold">{meta.label}</span>
        {result && (
          <span className="ml-auto text-moss/40">
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </span>
        )}
        {!result && <Loader2 className="ml-auto h-3 w-3 animate-spin text-moss/40" />}
      </button>

      {open && result && (
        <div className="border-t border-moss/10 px-3 py-2">
          <ToolResultBody name={toolCall.name} result={result} />
        </div>
      )}
    </div>
  );
}

function ToolResultBody({ name, result }: { name: string; result: Record<string, unknown> }) {
  if (name === "search_study_spots") {
    const spots = result.spots as Array<{ name: string; buildingCode: string; noiseLevel: string; outletAvailability: string; tags: string[] }>;
    if (!spots?.length) return <p className="text-ink/70">No spots found.</p>;
    return (
      <div className="space-y-1.5">
        {spots.map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-0.5 rounded-md bg-moss/10 px-1.5 py-0.5 font-mono font-bold text-moss">
              {s.buildingCode}
            </span>
            <div>
              <p className="font-semibold text-ink">{s.name}</p>
              <p className="text-ink/70">{s.noiseLevel} · {s.outletAvailability} outlets</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (name === "check_in_to_spot") {
    return (
      <p className="flex items-center gap-1.5 font-semibold text-moss">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {String(result.message ?? "Checked in!")}
      </p>
    );
  }

  if (name === "start_focus_session") {
    const creature = result.creature_found as { name: string; illustration: string; rarity: string } | null;
    return (
      <div className="space-y-1">
        <p className="font-semibold text-ink">
          {String(result.duration_minutes)} min · +{String(result.xp_earned)} XP earned
        </p>
        {creature && (
          <p className="text-moss">
            {creature.illustration} Found <strong>{creature.name}</strong>{" "}
            <span className="text-ink/70">({creature.rarity})</span>
          </p>
        )}
      </div>
    );
  }

  if (name === "get_tasks") {
    const tasks = result.tasks as Array<{ title: string; dueLabel: string; completed: boolean; xpReward: number }>;
    return (
      <div className="space-y-1">
        {tasks.map((t, i) => (
          <div key={i} className={cn("flex items-center gap-2", t.completed && "opacity-40 line-through")}>
            <CheckCircle2 className={cn("h-3 w-3 shrink-0", t.completed ? "text-moss" : "text-ink/20")} />
            <span className="text-ink">{t.title}</span>
            <span className="ml-auto text-ink/60">{t.dueLabel}</span>
          </div>
        ))}
      </div>
    );
  }

  if (name === "add_task") {
    const task = result.task as { title: string; dueLabel: string };
    return (
      <p className="font-semibold text-moss">
        Added: {task?.title} — due {task?.dueLabel}
      </p>
    );
  }

  if (name === "complete_task") {
    return (
      <p className="flex items-center gap-1.5 font-semibold text-moss">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed! +{String(result.xp_earned)} XP
      </p>
    );
  }

  if (name === "get_user_stats") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "XP", value: String(result.xp) },
          { label: "Level", value: String(result.level) },
          { label: "Streak", value: `${String(result.streak)}d` }
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-white/60 px-2 py-1.5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-ink/55">{label}</p>
            <p className="font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>
    );
  }

  if (name === "get_collection") {
    const collection = result.collection as Array<{ name: string; illustration: string; rarity: string; foundAt: string }>;
    return (
      <div className="flex flex-wrap gap-2">
        {collection.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-xl bg-white/60 px-2 py-1">
            <span>{c.illustration}</span>
            <div>
              <p className="font-semibold text-ink">{c.name}</p>
              <p className="text-ink/60">{c.rarity}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (name === "get_directions") {
    const lat = result.lat as number;
    const lng = result.lng as number;
    const walkUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    const driveUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    return (
      <div className="space-y-2.5">
        {/* Leaflet map */}
        <div className="overflow-hidden rounded-xl border border-moss/10 shadow-sm">
          <SpotMap lat={lat} lng={lng} name={String(result.name)} />
        </div>

        {/* Address card */}
        <div className="flex items-start gap-2 rounded-xl bg-white/70 px-3 py-2.5 border border-moss/10">
          <MapPinned className="h-3.5 w-3.5 mt-0.5 shrink-0 text-moss" />
          <div>
            <p className="font-semibold text-ink text-xs">{String(result.name)}</p>
            <p className="mt-0.5 text-[11px] text-ink/70">{String(result.address)}</p>
          </div>
        </div>

        {/* Direction mode buttons */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={walkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-moss/20 bg-white/70 px-3 py-2 text-xs font-semibold text-moss hover:bg-moss/10 transition-colors"
          >
            🚶 Walk there
          </a>
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-moss px-3 py-2 text-xs font-semibold text-cream hover:bg-moss/90 transition-colors"
          >
            <Navigation className="h-3 w-3" />
            Get Directions
          </a>
        </div>
      </div>
    );
  }

  // Fallback: raw JSON
  return (
    <pre className="overflow-auto rounded-lg bg-ink/5 p-2 text-[10px] text-ink/60">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-sm",
          isUser ? "bg-moss text-cream" : "bg-amber/30 text-amber-800"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className={cn(
        "space-y-1",
        isUser ? "items-end max-w-[75%]" : "items-start w-[90%]"
      )}>
        {/* Tool calls (assistant only) */}
        {!isUser && message.toolCalls.map((tc, i) => (
          <ToolResultCard key={i} toolCall={tc} />
        ))}

        {/* Text bubble */}
        {message.text && (
          <div
            className={cn(
              "rounded-3xl px-4 py-3 text-sm leading-relaxed",
              isUser
                ? "rounded-tr-md bg-moss text-cream"
                : "rounded-tl-md border border-white/60 bg-white/80 text-ink shadow-panel"
            )}
          >
            {message.text}
            {message.isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current opacity-60" />
            )}
          </div>
        )}

        {/* Streaming placeholder when only tool calls exist */}
        {!isUser && !message.text && message.isStreaming && message.toolCalls.length === 0 && (
          <div className="rounded-3xl rounded-tl-md border border-white/60 bg-white/80 px-4 py-3 shadow-panel">
            <Loader2 className="h-4 w-4 animate-spin text-moss/50" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTED = [
  "Find me a quiet spot with lots of outlets",
  "Book PCL for me",
  "Start a 45-minute session at the Union",
  "What tasks do I have due tonight?",
  "Show me my creature collection",
  "How's my study streak looking?",
  "How do I get to PCL?",
  "Get directions to the Union"
];

// ─── Main chat page ───────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setLoading(true);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: text.trim(),
      toolCalls: []
    };

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "",
      toolCalls: [],
      isStreaming: true
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);

    // Build plain message history for the API
    const history = messages.map(m => ({ role: m.role, content: m.text }));
    history.push({ role: "user", content: text.trim() });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          const event = JSON.parse(raw) as {
            type: string;
            text?: string;
            name?: string;
            input?: Record<string, unknown>;
            result?: Record<string, unknown>;
            message?: string;
          };

          setMessages(prev => {
            const updated = [...prev];
            const last = { ...updated[updated.length - 1] };

            if (event.type === "text" && event.text) {
              last.text = (last.text ?? "") + event.text;
            } else if (event.type === "tool_call" && event.name) {
              last.toolCalls = [
                ...(last.toolCalls ?? []),
                { name: event.name, input: event.input ?? {} }
              ];
            } else if (event.type === "tool_result" && event.name) {
              last.toolCalls = (last.toolCalls ?? []).map(tc =>
                tc.name === event.name && !tc.result
                  ? { ...tc, result: event.result }
                  : tc
              );
            } else if (event.type === "done") {
              last.isStreaming = false;
            } else if (event.type === "error") {
              last.text = `Error: ${event.message}`;
              last.isStreaming = false;
            }

            updated[updated.length - 1] = last;
            return updated;
          });
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        const last = { ...updated[updated.length - 1] };
        last.text = `Something went wrong. Please try again.`;
        last.isStreaming = false;
        updated[updated.length - 1] = last;
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <AppShell currentPath="/chat">
      <div className="flex h-[calc(100vh-88px)] flex-col lg:h-[calc(100vh-112px)]">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-1 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-moss text-3xl shadow-panel">
                <Bot className="h-8 w-8 text-cream" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-ink">StudyBot</h2>
                <p className="mt-1 text-sm text-ink/60">
                  I can find spots, book them, start sessions, and manage your tasks — just ask.
                </p>
              </div>
              <div className="flex w-full max-w-full gap-3 overflow-x-auto pb-2 text-left">
                {SUGGESTED.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="min-w-[240px] rounded-2xl border border-moss/15 bg-white/80 px-4 py-3 text-left text-sm font-medium text-ink shadow-sm transition hover:border-moss/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:min-w-[280px]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-5 px-1">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="panel mx-auto mb-4 mt-2 flex w-full max-w-2xl items-center gap-3 px-4 py-3"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything — find a spot, start a session, add a task…"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent py-1 text-sm leading-5 text-ink placeholder:text-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50"
            style={{ maxHeight: 160 }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            size="icon"
            className={cn("h-11 w-11 shrink-0", !input.trim() || loading ? "bg-moss/10 text-moss/30 hover:bg-moss/10" : "")}
            aria-label="Send chat message"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
