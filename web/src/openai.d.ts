import type { ToolOutput } from "./types";

declare global {
  interface Window {
    openai?: {
      theme?: "light" | "dark";
      locale?: string;
      toolInput?: unknown;
      toolOutput?: ToolOutput;
      widgetState?: unknown;
      callTool?: (name: string, input: Record<string, unknown>) => Promise<{ structuredContent?: ToolOutput } | ToolOutput>;
      sendFollowUpMessage?: (message: string) => Promise<void>;
      requestDisplayMode?: (mode: "fullscreen" | "inline") => Promise<void>;
    };
  }
}

export {};

