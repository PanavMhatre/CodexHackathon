# StudyJam

StudyJam is a ChatGPT app MVP for coordinating student study sessions and booking library rooms once the group agrees on a time. The repo is scaffolded as a `pnpm` workspace with:

- `server/`: a TypeScript MCP server that exposes scheduling and booking tools on `/mcp`
- `web/`: a React widget with a high-contrast, hackathon-friendly “booking command center” UI

## What the demo does

- turns a natural-language study request into a structured meeting plan
- tracks attendee availability from mock calendar and poll signals
- ranks three meeting options with room matches
- confirms a room booking only after an explicit organizer action
- supports reranking and cancellation

## Tool surface

- `create_meeting_request`
- `collect_availability`
- `rank_time_options`
- `confirm_meeting_and_book`
- `cancel_booking`

## Local development

1. Install dependencies:

```bash
pnpm install
```

2. Start the widget dev server and MCP server together:

```bash
pnpm dev
```

3. For a production-style build:

```bash
pnpm build
pnpm start
```

The server listens on [http://localhost:3000](http://localhost:3000) and exposes the MCP endpoint at [http://localhost:3000/mcp](http://localhost:3000/mcp).

## ChatGPT developer mode notes

- In local dev, `pnpm dev` serves the widget from `http://localhost:5173` and the MCP server from `http://localhost:3000`.
- In build mode, the server inlines the widget bundle into the registered app resource so ChatGPT can render a self-contained UI.
- The widget includes an approval-first booking flow and visual state for attendee pulse, ranked options, fallback rooms, and confirmation status.

## Validation target

This scaffold is designed to satisfy the basic Apps SDK repo contract:

- explicit `/mcp` server entry point
- deliberate tool descriptions and annotations
- registered widget resource with ChatGPT metadata
- React UI rendered from tool `structuredContent`

## Relevant OpenAI docs

- [Apps SDK quickstart](https://developers.openai.com/apps-sdk/quickstart)
- [Build an MCP server](https://developers.openai.com/apps-sdk/build/mcp-server)
- [Build the ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui)
- [Apps SDK reference](https://developers.openai.com/apps-sdk/reference)
- [Apps SDK examples](https://developers.openai.com/apps-sdk/build/examples)
