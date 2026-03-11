import { NextRequest } from "next/server";
import OpenAI from "openai";
import {
  studySpots,
  tasks,
  dashboardSnapshot,
  getSpotById,
  getCreatureById
} from "@/lib/mock-data";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const SYSTEM_PROMPT = `You are StudyBot, an AI assistant for StudyMon — a study tracking app for UT Austin students.
You help students find study spots, book them, start focus sessions, manage tasks, and explore their creature collection.

When the user asks you to:
- Find, recommend, or search for a study spot → use search_study_spots
- Book, reserve, or check in to a spot → use check_in_to_spot
- Start a focus or study session → use start_focus_session
- See, list, or manage tasks → use get_tasks (then add_task or complete_task as needed)
- See their stats, XP, or streak → use get_user_stats
- See their creature collection → use get_collection
- Get info about a specific spot → use get_spot_details

Always use tools proactively — don't just describe what you could do, do it.
Be friendly, concise, and action-oriented. Confirm completed actions clearly.

Current user: Maya Chen (Level 3 CS major, 540 XP, 6-day streak)`;

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
  }
];

function executeTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
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

    case "start_focus_session": {
      const duration = input.duration_minutes as number;
      const xpEarned = duration >= 60 ? 120 : duration >= 45 ? 85 : 50;
      const spot = studySpots.find(s => s.id === input.spot_id);
      const grantCreature = spot && Math.random() >= 0.45;
      const creature = grantCreature && spot ? getCreatureById(spot.featuredCreatureId) : null;
      return JSON.stringify({
        success: true,
        spot_name: input.spot_name,
        duration_minutes: duration,
        xp_earned: xpEarned,
        creature_found: creature
          ? { name: creature.name, illustration: creature.illustration, rarity: creature.rarity }
          : null
      });
    }

    case "get_tasks": {
      return JSON.stringify({
        tasks: tasks.map(t => ({
          id: t.id,
          title: t.title,
          dueLabel: t.dueLabel,
          completed: t.completed,
          xpReward: t.xpReward
        }))
      });
    }

    case "add_task": {
      return JSON.stringify({
        success: true,
        task: {
          id: `task-${Date.now()}`,
          title: input.title,
          dueLabel: input.due_label,
          completed: false,
          xpReward: 20
        }
      });
    }

    case "complete_task": {
      const task = tasks.find(t => t.id === input.task_id);
      return JSON.stringify({
        success: true,
        task_title: input.task_title,
        xp_earned: task?.xpReward ?? 20
      });
    }

    case "get_user_stats": {
      const profile = dashboardSnapshot.profile;
      return JSON.stringify({
        name: profile.fullName,
        major: profile.major,
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        creatures_collected: dashboardSnapshot.collection.length,
        recent_sessions: dashboardSnapshot.recentSessions.length
      });
    }

    case "get_collection": {
      const entries = dashboardSnapshot.collection.map(entry => {
        const creature = getCreatureById(entry.creatureId);
        const spot = getSpotById(entry.originSpotId);
        return {
          name: creature?.name,
          illustration: creature?.illustration,
          rarity: creature?.rarity,
          description: creature?.description,
          foundAt: spot?.name,
          acquiredAt: entry.acquiredAt
        };
      });
      return JSON.stringify({ collection: entries, total: entries.length });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

type ApiMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const { messages }: { messages: ApiMessage[] } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role, content: m.content } as OpenAI.Chat.ChatCompletionMessageParam))
        ];

        // Agentic loop
        while (true) {
          const stream = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: chatMessages,
            tools,
            stream: true
          });

          let finishReason: string | null = null;
          const toolCallAccumulator: Record<number, { id: string; name: string; arguments: string }> = {};
          const assistantText: string[] = [];

          for await (const chunk of stream) {
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
                if (!toolCallAccumulator[idx]) {
                  toolCallAccumulator[idx] = { id: "", name: "", arguments: "" };
                }
                if (tc.id) toolCallAccumulator[idx].id = tc.id;
                if (tc.function?.name) toolCallAccumulator[idx].name += tc.function.name;
                if (tc.function?.arguments) toolCallAccumulator[idx].arguments += tc.function.arguments;
              }
            }
          }

          const toolCalls = Object.values(toolCallAccumulator);
          if (finishReason !== "tool_calls" || toolCalls.length === 0) break;

          // Append assistant message with tool calls
          chatMessages.push({
            role: "assistant",
            content: assistantText.join("") || null,
            tool_calls: toolCalls.map(tc => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.arguments }
            }))
          });

          // Execute tools and send results
          for (const tc of toolCalls) {
            const input = JSON.parse(tc.arguments) as Record<string, unknown>;
            send({ type: "tool_call", name: tc.name, input });

            const resultStr = executeTool(tc.name, input);
            const resultData = JSON.parse(resultStr);
            send({ type: "tool_result", name: tc.name, result: resultData });

            chatMessages.push({
              role: "tool",
              tool_call_id: tc.id,
              content: resultStr
            });
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
