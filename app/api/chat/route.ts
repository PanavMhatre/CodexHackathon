export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";
import {
  studySpots,
  tasks,
  dashboardSnapshot,
  getSpotById,
  getCreatureById
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeLevel(xp: number) {
  return Math.floor(xp / 200) + 1;
}

/** Convert a human due label ("Tonight", "Tomorrow", "Fri") to an ISO timestamp. */
function parseDueLabel(label: string): string | null {
  const now = new Date();
  const lower = label.toLowerCase().trim();
  const endOfDay = (d: Date) => {
    d.setHours(23, 59, 0, 0);
    return d.toISOString();
  };
  if (lower === "tonight" || lower === "today") return endOfDay(new Date(now));
  if (lower === "tomorrow") {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return endOfDay(d);
  }
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayIdx = days.findIndex(d => lower.startsWith(d));
  if (dayIdx >= 0) {
    const d = new Date(now);
    const diff = ((dayIdx - d.getDay() + 7) % 7) || 7;
    d.setDate(d.getDate() + diff);
    return endOfDay(d);
  }
  return null;
}

/** Format a stored ISO timestamp back to a short human label. */
function formatDueLabel(dueAt: string | null): string {
  if (!dueAt) return "Soon";
  const due = new Date(dueAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diff = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Tonight";
  if (diff === 1) return "Tomorrow";
  return due.toLocaleDateString("en-US", { weekday: "short" });
}

// ─── System prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(name: string, major: string, xp: number, level: number, streak: number) {
  return `You are StudyBot, an AI assistant for StudyMon — a study tracking app for UT Austin students.
You help students find study spots, book them, start focus sessions, manage tasks, and explore their creature collection.

When the user asks you to:
- Find, recommend, or search for a study spot → use search_study_spots
- Book, reserve, or check in to a spot → use check_in_to_spot
- Start a focus or study session → use start_focus_session
- See, list, or manage tasks → use get_tasks (then add_task or complete_task as needed)
- See their stats, XP, or streak → use get_user_stats
- See their creature collection → use get_collection
- Get info about a specific spot → use get_spot_details
- Get directions or navigate to a spot → use get_directions. When you do, simply say something like "Here's how to get to [name]!" — never include raw latitude, longitude, or coordinate numbers in your text response.

Always use tools proactively — don't just describe what you could do, do it.
Be friendly, concise, and action-oriented. Confirm completed actions clearly.

Current user: ${name} (Level ${level} ${major} major, ${xp} XP, ${streak}-day streak)`;
}

// ─── Tool definitions ────────────────────────────────────────────────────────

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_study_spots",
      description:
        "Search and filter UT Austin study spots by noise level, outlet availability, or tags. Use this when the user wants to find a spot.",
      parameters: {
        type: "object",
        properties: {
          noise_level: {
            type: "string",
            enum: ["Quiet", "Moderate", "Buzzing"],
            description: "Filter by noise level"
          },
          outlet_availability: {
            type: "string",
            enum: ["Sparse", "Decent", "Plentiful"],
            description: "Filter by outlet availability"
          },
          tag: {
            type: "string",
            description: "Filter by tag keyword, e.g. 'Quiet floors', 'Coffee', 'Whiteboards'"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_spot_details",
      description: "Get detailed information about a specific study spot.",
      parameters: {
        type: "object",
        properties: {
          spot_id: { type: "string", description: "Spot ID or slug" }
        },
        required: ["spot_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_in_to_spot",
      description: "Book or check in the user to a study spot.",
      parameters: {
        type: "object",
        properties: {
          spot_id: { type: "string", description: "The spot ID" },
          spot_name: { type: "string", description: "The spot name for confirmation" }
        },
        required: ["spot_id", "spot_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "start_focus_session",
      description: "Start a timed focus/study session at a spot. XP is earned on completion.",
      parameters: {
        type: "object",
        properties: {
          spot_id: { type: "string", description: "The spot ID" },
          spot_name: { type: "string", description: "The spot name" },
          duration_minutes: {
            type: "integer",
            description: "Session length in minutes: 25 min (+50 XP), 45 min (+85 XP), 60 min (+120 XP)"
          }
        },
        required: ["spot_id", "spot_name", "duration_minutes"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_tasks",
      description: "Get the user's current task list with due dates and XP rewards.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "add_task",
      description: "Add a new task to the user's task list.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Task description" },
          due_label: {
            type: "string",
            description: "When it's due, e.g. 'Tonight', 'Tomorrow', 'Fri'"
          }
        },
        required: ["title", "due_label"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "complete_task",
      description: "Mark an existing task as completed and award XP.",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "The task ID" },
          task_title: { type: "string", description: "Task title for confirmation" }
        },
        required: ["task_id", "task_title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_user_stats",
      description: "Get the user's XP, level, streak, and recent session count.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_collection",
      description: "Get the user's collected study creatures with rarity and origin spot.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_directions",
      description: "Get directions and a map to a specific study spot. Use when the user asks how to get to, navigate to, or find the location of a spot.",
      parameters: {
        type: "object",
        properties: {
          spot_id: { type: "string", description: "The spot ID or building code (e.g. 'pcl', 'union')" }
        },
        required: ["spot_id"]
      }
    }
  }
];

// ─── Tool execution ───────────────────────────────────────────────────────────

type SupabaseClient = ReturnType<typeof createClient>;

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  userName: string,
  userMajor: string,
  userId: string | null,
  supabase: SupabaseClient | null
): Promise<string> {
  switch (name) {
    // Catalog tools — always use mock (lat/lng/address not in DB)
    case "search_study_spots": {
      let results = [...studySpots];
      if (input.noise_level) results = results.filter(s => s.noiseLevel === input.noise_level);
      if (input.outlet_availability) results = results.filter(s => s.outletAvailability === input.outlet_availability);
      if (input.tag) {
        const tagLower = (input.tag as string).toLowerCase();
        results = results.filter(s => s.tags.some(t => t.toLowerCase().includes(tagLower)));
      }
      return JSON.stringify({
        spots: results.map(s => ({
          id: s.id,
          name: s.name,
          buildingCode: s.buildingCode,
          noiseLevel: s.noiseLevel,
          outletAvailability: s.outletAvailability,
          tags: s.tags,
          description: s.description
        })),
        total: results.length
      });
    }

    case "get_spot_details": {
      const spot = studySpots.find(s => s.id === input.spot_id || s.slug === input.spot_id);
      if (!spot) return JSON.stringify({ error: "Spot not found" });
      const creature = getCreatureById(spot.featuredCreatureId);
      return JSON.stringify({ ...spot, featuredCreature: creature ?? null });
    }

    case "check_in_to_spot": {
      return JSON.stringify({
        success: true,
        spot_id: input.spot_id,
        spot_name: input.spot_name,
        message: `Checked in to ${input.spot_name}. Your spot is reserved!`
      });
    }

    case "get_directions": {
      const spot = studySpots.find(
        s => s.id === input.spot_id ||
             s.slug === input.spot_id ||
             s.buildingCode.toLowerCase() === String(input.spot_id).toLowerCase()
      );
      if (!spot) return JSON.stringify({ error: "Spot not found" });
      return JSON.stringify({
        name: spot.name,
        buildingCode: spot.buildingCode,
        address: spot.address,
        lat: spot.lat,
        lng: spot.lng,
        mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`
      });
    }

    // ── User-data tools — Supabase when authenticated, mock fallback ──────────

    case "start_focus_session": {
      const duration = input.duration_minutes as number;
      const xpEarned = duration >= 60 ? 120 : duration >= 45 ? 85 : 50;
      const mockSpot = studySpots.find(s => s.id === input.spot_id || s.slug === input.spot_id);
      const grantCreature = Boolean(mockSpot) && Math.random() >= 0.45;

      if (userId && supabase && mockSpot) {
        // Look up DB spot UUID by slug
        const { data: dbSpot } = await supabase
          .from("study_spots")
          .select("id, featured_creature_id")
          .eq("slug", mockSpot.slug)
          .single();

        let creatureData = null;
        let creatureGrantedId = null;

        if (grantCreature && dbSpot) {
          const { data: dbCreature } = await supabase
            .from("creatures")
            .select("id, name, illustration, rarity")
            .eq("id", dbSpot.featured_creature_id)
            .single();

          if (dbCreature) {
            creatureData = { name: dbCreature.name, illustration: dbCreature.illustration, rarity: dbCreature.rarity };
            creatureGrantedId = dbCreature.id;
            await supabase.from("user_creatures").insert({
              user_id: userId,
              creature_id: dbCreature.id,
              origin_spot_id: dbSpot.id
            });
          }
        }

        if (dbSpot) {
          await supabase.from("study_sessions").insert({
            user_id: userId,
            study_spot_id: dbSpot.id,
            duration_minutes: duration,
            xp_earned: xpEarned,
            creature_granted_id: creatureGrantedId
          });

          // Increment XP on profile
          const { data: prof } = await supabase
            .from("profiles")
            .select("xp")
            .eq("id", userId)
            .single();
          if (prof) {
            await supabase
              .from("profiles")
              .update({ xp: prof.xp + xpEarned, updated_at: new Date().toISOString() })
              .eq("id", userId);
          }
        }

        return JSON.stringify({
          success: true,
          spot_name: input.spot_name,
          duration_minutes: duration,
          xp_earned: xpEarned,
          creature_found: creatureData
        });
      }

      // Mock fallback
      const creature = grantCreature && mockSpot ? getCreatureById(mockSpot.featuredCreatureId) : null;
      return JSON.stringify({
        success: true,
        spot_name: input.spot_name,
        duration_minutes: duration,
        xp_earned: xpEarned,
        creature_found: creature ? { name: creature.name, illustration: creature.illustration, rarity: creature.rarity } : null
      });
    }

    case "get_tasks": {
      if (userId && supabase) {
        const { data } = await supabase
          .from("tasks")
          .select("id, title, due_at, completed, xp_reward")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });
        return JSON.stringify({
          tasks: (data ?? []).map((t: any) => ({
            id: t.id,
            title: t.title,
            dueLabel: formatDueLabel(t.due_at),
            completed: t.completed,
            xpReward: t.xp_reward
          }))
        });
      }
      return JSON.stringify({
        tasks: tasks.map(t => ({ id: t.id, title: t.title, dueLabel: t.dueLabel, completed: t.completed, xpReward: t.xpReward }))
      });
    }

    case "add_task": {
      if (userId && supabase) {
        const dueAt = parseDueLabel(input.due_label as string);
        const { data } = await supabase
          .from("tasks")
          .insert({ user_id: userId, title: input.title as string, due_at: dueAt, completed: false, xp_reward: 20 })
          .select("id, title")
          .single();
        return JSON.stringify({
          success: true,
          task: { id: data?.id, title: data?.title, dueLabel: input.due_label, completed: false, xpReward: 20 }
        });
      }
      return JSON.stringify({
        success: true,
        task: { id: `task-${Date.now()}`, title: input.title, dueLabel: input.due_label, completed: false, xpReward: 20 }
      });
    }

    case "complete_task": {
      if (userId && supabase) {
        const { data: taskData } = await supabase
          .from("tasks")
          .update({ completed: true })
          .eq("id", input.task_id as string)
          .eq("user_id", userId)
          .select("xp_reward")
          .single();
        const xpReward = (taskData as any)?.xp_reward ?? 20;
        // Increment XP
        const { data: prof } = await supabase.from("profiles").select("xp").eq("id", userId).single();
        if (prof) {
          await supabase
            .from("profiles")
            .update({ xp: prof.xp + xpReward, updated_at: new Date().toISOString() })
            .eq("id", userId);
        }
        return JSON.stringify({ success: true, task_title: input.task_title, xp_earned: xpReward });
      }
      const task = tasks.find(t => t.id === input.task_id);
      return JSON.stringify({ success: true, task_title: input.task_title, xp_earned: task?.xpReward ?? 20 });
    }

    case "get_user_stats": {
      if (userId && supabase) {
        const [profRes, creaturesRes, sessionsRes] = await Promise.all([
          supabase.from("profiles").select("xp, streak").eq("id", userId).single(),
          supabase.from("user_creatures").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("study_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId)
        ]);
        const xp = profRes.data?.xp ?? 0;
        return JSON.stringify({
          name: userName,
          major: userMajor,
          xp,
          level: computeLevel(xp),
          streak: profRes.data?.streak ?? 0,
          creatures_collected: creaturesRes.count ?? 0,
          recent_sessions: sessionsRes.count ?? 0
        });
      }
      const prof = dashboardSnapshot.profile;
      return JSON.stringify({
        name: userName,
        major: userMajor,
        xp: prof.xp,
        level: prof.level,
        streak: prof.streak,
        creatures_collected: dashboardSnapshot.collection.length,
        recent_sessions: dashboardSnapshot.recentSessions.length
      });
    }

    case "get_collection": {
      if (userId && supabase) {
        const { data } = await supabase
          .from("user_creatures")
          .select("acquired_at, creatures ( name, illustration, rarity, description ), study_spots ( name )")
          .eq("user_id", userId)
          .order("acquired_at", { ascending: false });
        const entries = (data ?? []).map((e: any) => ({
          name: e.creatures?.name,
          illustration: e.creatures?.illustration,
          rarity: e.creatures?.rarity,
          description: e.creatures?.description,
          foundAt: e.study_spots?.name,
          acquiredAt: e.acquired_at
        }));
        return JSON.stringify({ collection: entries, total: entries.length });
      }
      const entries = dashboardSnapshot.collection.map(entry => {
        const creature = getCreatureById(entry.creatureId);
        const spot = getSpotById(entry.originSpotId);
        return { name: creature?.name, illustration: creature?.illustration, rarity: creature?.rarity, description: creature?.description, foundAt: spot?.name, acquiredAt: entry.acquiredAt };
      });
      return JSON.stringify({ collection: entries, total: entries.length });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────

type ApiMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const { messages }: { messages: ApiMessage[] } = await req.json();

  // Resolve the current user
  const mockProfile = dashboardSnapshot.profile;
  let userName = mockProfile.fullName;
  let userMajor = mockProfile.major;
  let userId: string | null = null;
  let supabase: SupabaseClient | null = null;

  if (hasSupabaseEnv()) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      userName = user.user_metadata?.full_name || user.email?.split("@")[0] || userName;
      userMajor = user.user_metadata?.major || userMajor;
      userId = user.id;
      supabase = sb;

      // Use live XP/streak from profiles for a current system prompt
      const { data: prof } = await sb.from("profiles").select("xp, streak").eq("id", user.id).single();
      if (prof) {
        const systemPrompt = buildSystemPrompt(userName, userMajor, prof.xp, computeLevel(prof.xp), prof.streak);
        return runStream(messages, systemPrompt, userName, userMajor, userId, supabase);
      }
    }
  }

  const systemPrompt = buildSystemPrompt(userName, userMajor, mockProfile.xp, mockProfile.level, mockProfile.streak);
  return runStream(messages, systemPrompt, userName, userMajor, userId, supabase);
}

function runStream(
  messages: ApiMessage[],
  systemPrompt: string,
  userName: string,
  userMajor: string,
  userId: string | null,
  supabase: SupabaseClient | null
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content } as OpenAI.Chat.ChatCompletionMessageParam))
        ];

        // Agentic loop
        while (true) {
          let groqStream;
          try {
            groqStream = await client.chat.completions.create({
              model: "llama-3.3-70b-versatile",
              messages: chatMessages,
              tools,
              stream: true
            });
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("failed_generation")) continue;
            throw err;
          }

          let finishReason: string | null = null;
          const toolCallAccumulator: Record<number, { id: string; name: string; arguments: string }> = {};
          const assistantText: string[] = [];

          for await (const chunk of groqStream) {
            const choice = chunk.choices[0];
            if (!choice) continue;
            if (choice.finish_reason) finishReason = choice.finish_reason;
            const delta = choice.delta;
            if (delta.content) {
              send({ type: "text", text: delta.content });
              assistantText.push(delta.content);
            }
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index;
                if (!toolCallAccumulator[idx]) toolCallAccumulator[idx] = { id: "", name: "", arguments: "" };
                if (tc.id) toolCallAccumulator[idx].id = tc.id;
                if (tc.function?.name) toolCallAccumulator[idx].name += tc.function.name;
                if (tc.function?.arguments) toolCallAccumulator[idx].arguments += tc.function.arguments;
              }
            }
          }

          const toolCalls = Object.values(toolCallAccumulator);
          if (finishReason !== "tool_calls" || toolCalls.length === 0) break;

          chatMessages.push({
            role: "assistant",
            content: assistantText.join("") || null,
            tool_calls: toolCalls.map(tc => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.arguments }
            }))
          });

          for (const tc of toolCalls) {
            const input = JSON.parse(tc.arguments) as Record<string, unknown>;
            send({ type: "tool_call", name: tc.name, input });

            const resultStr = await executeTool(tc.name, input, userName, userMajor, userId, supabase);
            const resultData = JSON.parse(resultStr);
            send({ type: "tool_result", name: tc.name, result: resultData });

            chatMessages.push({ role: "tool", tool_call_id: tc.id, content: resultStr });
          }
        }

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
