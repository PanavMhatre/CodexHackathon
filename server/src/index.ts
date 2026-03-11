import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { z } from "zod";

import {
  cancelBooking,
  collectAvailability,
  confirmBooking,
  createMeetingPlan,
  rerankMeetingPlan,
  type MeetingPlan
} from "./planner.js";
import { applyLivePclAvailability } from "./pcl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..", "..");
const widgetDistDir = path.resolve(workspaceRoot, "web", "dist");
const widgetUri = "ui://studyjam/scheduler-board.html";
const widgetMimeType = "text/html;profile=mcp-app";
const widgetOrigin = process.env.WIDGET_ORIGIN;

const meetingStore = new Map<string, MeetingPlan>();

const createMeetingRequestSchema = z.object({
  organizerName: z.string().min(1).max(80),
  title: z.string().min(3).max(120),
  attendees: z.array(z.string().min(1).max(80)).min(1).max(8),
  durationMinutes: z.number().int().min(30).max(180),
  dateRangeLabel: z.string().min(2).max(80),
  preferredAfterHour: z.number().int().min(6).max(22).optional(),
  preferredDays: z.array(z.string().min(3).max(3)).max(5).optional(),
  meetingType: z.enum(["quiet-study", "problem-set", "review-session"]).optional(),
  libraryPreference: z.enum(["main-library", "engineering-library", "any"]).optional(),
  roomNeeds: z.array(z.string().min(2).max(24)).max(6).optional(),
  notes: z.string().max(240).optional()
});

const meetingIdSchema = z.object({
  meetingId: z.string().min(4)
});

const confirmBookingSchema = z.object({
  meetingId: z.string().min(4),
  optionId: z.string().min(4)
});

const rerankSchema = z.object({
  meetingId: z.string().min(4),
  reason: z.string().max(200).optional()
});

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/", (_request, response) => {
  response.json({
    app: "StudyJam",
    status: "ok",
    mcp: "/mcp"
  });
});

app.all("/mcp", async (request, response) => {
  try {
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport();

    response.on("close", () => {
      void transport.close();
    });

    await server.connect(transport as Transport);
    await transport.handleRequest(request, response, request.body);
  } catch (error) {
    console.error("MCP error", error);
    if (!response.headersSent) {
      response.status(500).json({
        error: "mcp_transport_error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
});

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
app.listen(port, () => {
  console.log(`StudyJam MCP server listening on http://localhost:${port}`);
});

function buildServer(): McpServer {
  const server = new McpServer({
    name: "StudyJam",
    version: "0.1.0"
  });

  server.registerResource(
    "studyjam-widget",
    widgetUri,
    {},
    async () => ({
      contents: [
        {
          uri: widgetUri,
          mimeType: widgetMimeType,
          text: await renderWidgetHtml(),
          _meta: {
            "openai/widgetDescription":
              "StudyJam surfaces attendee status, ranked meeting options, room matches, and booking confirmation in a compact board.",
            "openai/widgetPrefersBorder": true,
            "openai/widgetCSP": {
              connect_domains: widgetOrigin ? [widgetOrigin] : [],
              resource_domains: widgetOrigin ? [widgetOrigin] : []
            },
            ui: {
              prefersBorder: true,
              csp: {
                connectDomains: widgetOrigin ? [widgetOrigin] : [],
                resourceDomains: widgetOrigin ? [widgetOrigin] : []
              }
            }
          }
        }
      ]
    })
  );

  server.registerTool(
    "create_meeting_request",
    {
      title: "Create meeting request",
      description:
        "Use this when a student wants ChatGPT to turn a study-session request into a ranked scheduling plan with room matches.",
      inputSchema: createMeetingRequestSchema.shape,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (input) => {
      const parsed = createMeetingRequestSchema.parse(input);
      const plan = await applyLivePclAvailability(createMeetingPlan(parsed));
      meetingStore.set(plan.meetingId, plan);
      return buildToolResult(
        plan,
        `Built a draft schedule for ${plan.title} with ${plan.options.length} ranked options and a room match for each.`
      );
    }
  );

  server.registerTool(
    "collect_availability",
    {
      title: "Collect availability",
      description:
        "Use this when the app should refresh attendee responses from connected calendars or availability polls before choosing a final slot.",
      inputSchema: meetingIdSchema.shape,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (input) => {
      const parsed = meetingIdSchema.parse(input);
      const current = meetingStore.get(parsed.meetingId);
      if (!current) {
        throw new Error(`Unknown meeting: ${parsed.meetingId}`);
      }

      const updated = await applyLivePclAvailability(collectAvailability(current));
      meetingStore.set(updated.meetingId, updated);
      return buildToolResult(updated, "Updated attendee responses and refreshed the top overlaps.");
    }
  );

  server.registerTool(
    "rank_time_options",
    {
      title: "Rank time options",
      description:
        "Use this when the organizer wants a fresh ranking of the best meeting times and backup room choices.",
      inputSchema: rerankSchema.shape,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (input) => {
      const parsed = rerankSchema.parse(input);
      const current = meetingStore.get(parsed.meetingId);
      if (!current) {
        throw new Error(`Unknown meeting: ${parsed.meetingId}`);
      }

      const updated = await applyLivePclAvailability(rerankMeetingPlan(current, parsed.reason));
      meetingStore.set(updated.meetingId, updated);
      return buildToolResult(updated, "Reranked the best slots with a slightly later start window.");
    }
  );

  server.registerTool(
    "confirm_meeting_and_book",
    {
      title: "Confirm meeting and book",
      description:
        "Use this when the organizer explicitly approves a ranked option and wants the study room booking confirmed.",
      inputSchema: confirmBookingSchema.shape,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (input) => {
      const parsed = confirmBookingSchema.parse(input);
      const current = meetingStore.get(parsed.meetingId);
      if (!current) {
        throw new Error(`Unknown meeting: ${parsed.meetingId}`);
      }

      const confirmed = confirmBooking(current, parsed.optionId);
      meetingStore.set(confirmed.meetingId, confirmed);
      return buildToolResult(
        confirmed,
        `Booked ${confirmed.options.find((option) => option.id === confirmed.selectedOptionId)?.room.name ?? "the selected room"} and generated a confirmation code.`
      );
    }
  );

  server.registerTool(
    "cancel_booking",
    {
      title: "Cancel booking",
      description:
        "Use this when the organizer wants to cancel a previously confirmed study room booking.",
      inputSchema: meetingIdSchema.shape,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (input) => {
      const parsed = meetingIdSchema.parse(input);
      const current = meetingStore.get(parsed.meetingId);
      if (!current) {
        throw new Error(`Unknown meeting: ${parsed.meetingId}`);
      }

      const cancelled = cancelBooking(current);
      meetingStore.set(cancelled.meetingId, cancelled);
      return buildToolResult(cancelled, "Cancelled the room booking and notified the group.");
    }
  );

  return server;
}

function buildToolResult(plan: MeetingPlan, narration: string) {
  return {
    structuredContent: {
      meeting: plan
    },
    content: [
      {
        type: "text" as const,
        text: narration
      }
    ],
    _meta: {
      ui: {
        resourceUri: widgetUri
      },
      "openai/outputTemplate": widgetUri,
      timeline: plan.options.map((option) => ({
        optionId: option.id,
        roomId: option.room.id,
        fallbackRoomIds: option.fallbackRooms.map((room) => room.id)
      }))
    }
  };
}

async function renderWidgetHtml(): Promise<string> {
  if (widgetOrigin) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StudyJam</title>
    <script type="module" src="${widgetOrigin}/src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
  }

  try {
    const [scriptPath, stylePath] = await Promise.all([resolveWidgetAsset("widget.js"), resolveWidgetStyle()]);
    const [script, styles] = await Promise.all([fs.readFile(scriptPath, "utf8"), fs.readFile(stylePath, "utf8")]);

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StudyJam</title>
    <style>${styles}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${script}</script>
  </body>
</html>`;
  } catch {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StudyJam</title>
    <style>
      body {
        margin: 0;
        font-family: "Avenir Next", "Segoe UI Variable", sans-serif;
        background: #f6efe7;
        color: #1f2937;
        display: grid;
        place-items: center;
        min-height: 100vh;
      }
      article {
        max-width: 32rem;
        padding: 2rem;
        border-radius: 1.5rem;
        background: white;
        box-shadow: 0 20px 60px rgba(15, 30, 66, 0.15);
      }
    </style>
  </head>
  <body>
    <article>
      <h1>StudyJam widget build missing</h1>
      <p>Run <code>pnpm build</code> or <code>pnpm dev</code> before loading the app in ChatGPT.</p>
    </article>
  </body>
</html>`;
  }
}

async function resolveWidgetAsset(fileName: string): Promise<string> {
  const directPath = path.join(widgetDistDir, fileName);
  try {
    await fs.access(directPath);
    return directPath;
  } catch {
    const nestedPath = path.join(widgetDistDir, "assets", fileName);
    await fs.access(nestedPath);
    return nestedPath;
  }
}

async function resolveWidgetStyle(): Promise<string> {
  const distEntries = await fs.readdir(widgetDistDir, { withFileTypes: true });

  for (const entry of distEntries) {
    if (entry.isFile() && entry.name.endsWith(".css")) {
      return path.join(widgetDistDir, entry.name);
    }
  }

  for (const entry of distEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const nestedDir = path.join(widgetDistDir, entry.name);
    const nestedEntries = await fs.readdir(nestedDir, { withFileTypes: true });
    const cssEntry = nestedEntries.find((candidate) => candidate.isFile() && candidate.name.endsWith(".css"));
    if (cssEntry) {
      return path.join(nestedDir, cssEntry.name);
    }
  }

  throw new Error("No built widget CSS file found.");
}
