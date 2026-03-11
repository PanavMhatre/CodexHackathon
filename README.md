# StudyMon

StudyMon is a **gamified AI study platform built for UT Austin students** that helps them discover study spaces, stay focused, and build consistent study habits.

UT has dozens of study locations across campus, but finding and reserving them often requires navigating multiple portals and reservation systems. StudyMon simplifies this process by combining **AI agents, campus data, and productivity tools** into a single workflow.

---

## Features

### Campus Study Map
Interactive map showing real UT Austin study locations using GPS coordinates.

### AI Study Assistant
ChatGPT-powered agent that helps students find nearby study spots and plan study sessions.

### Automated Room Booking
Uses OpenAI computer-use capabilities to navigate legacy UT reservation portals and prepare room bookings automatically.

### Calendar Integration
Automatically schedules study sessions in Google Calendar.

### Gamified Study Sessions
Students earn streaks and rewards for consistent study habits.

---

## AI Architecture

StudyMon uses **ChatGPT as an AI agent** connected to tools through the **Model Context Protocol (MCP)**.

MCP is an open standard that allows AI models to connect to external tools, APIs, and databases so they can perform real actions instead of just generating text. :contentReference[oaicite:0]{index=0}

The agent can:

- Query a **custom MCP server** for real-time UT study space information
- Use a **maps tool** to locate nearby study locations
- Connect to **Google Calendar** to schedule study sessions
- Use **computer-use automation** to navigate older university reservation portals

---

## Built With

- **Next.js** – Frontend framework
- **Supabase** – Authentication and database
- **Leaflet** – Interactive campus maps
- **Groq + LLaMA 3.3 70B** – AI reasoning
- **OpenAI tools** – AI agents, MCP integration, computer-use

---

## Development Workflow

This project was built using the **OpenAI Codex app** with **parallel agents and worktrees**.

- One agent generated the **map and location pipeline**
- Another agent implemented the **gamification system**
- Additional agents audited UI consistency and improved components

Codex allowed our team to **develop multiple features in parallel**, dramatically accelerating development during the hackathon.

---

## Why It Matters

Study spaces at UT Austin are distributed across multiple libraries and booking systems. StudyMon brings these systems together and helps students:

- find the best place to study
- reduce friction when booking rooms
- build sustainable study habits

---

## Built For

**OpenAI Codex Hackathon**

Theme: *Build it Forward*
