import type { ToolOutput } from "./types";

export const demoToolOutput: ToolOutput = {
  meeting: {
    meetingId: "mtg_demo1234",
    title: "CS 374 midterm prep",
    organizerName: "Avery",
    dateRangeLabel: "next week after 4pm",
    durationMinutes: 90,
    preferredAfterHour: 16,
    meetingType: "problem-set",
    libraryPreference: "main-library",
    attendees: [
      {
        name: "Maya",
        source: "google-calendar",
        status: "available",
        responseLabel: "calendar synced",
        confidence: 0.93
      },
      {
        name: "Luis",
        source: "poll",
        status: "available",
        responseLabel: "poll submitted",
        confidence: 0.88
      },
      {
        name: "Jordan",
        source: "google-calendar",
        status: "maybe",
        responseLabel: "lab ends close to start",
        confidence: 0.61
      }
    ],
    options: [
      {
        id: "opt_1",
        label: "Tue, Mar 17 5:00 PM - 6:30 PM",
        startIso: "2026-03-17T22:00:00.000Z",
        endIso: "2026-03-17T23:30:00.000Z",
        responseScore: 1.06,
        fitLabel: "Strong overlap",
        reason: "Three of three attendees can likely make it, and Atlas Room 302 gives you whiteboards plus displays for a fast problem-set sprint.",
        availableAttendees: ["Maya", "Luis", "Jordan"],
        room: {
          id: "atlas-302",
          library: "Main Library",
          name: "Atlas Room 302",
          capacity: 6,
          vibe: "Quiet focus",
          amenities: ["whiteboard", "dual display", "power", "window light"],
          policyNote: "Main Library caps study room holds at 2 hours."
        },
        fallbackRooms: [
          {
            id: "lantern-215",
            library: "Main Library",
            name: "Lantern Room 215",
            capacity: 8,
            vibe: "Collaborative",
            amenities: ["glass board", "monitor", "power", "standing table"],
            policyNote: "Requires a current student ID to confirm."
          }
        ]
      },
      {
        id: "opt_2",
        label: "Wed, Mar 18 4:30 PM - 6:00 PM",
        startIso: "2026-03-18T21:30:00.000Z",
        endIso: "2026-03-18T23:00:00.000Z",
        responseScore: 0.98,
        fitLabel: "Full consensus",
        reason: "Everyone clears this window, and the collaborative room makes review questions easier to work through together.",
        availableAttendees: ["Maya", "Luis", "Jordan"],
        room: {
          id: "lantern-215",
          library: "Main Library",
          name: "Lantern Room 215",
          capacity: 8,
          vibe: "Collaborative",
          amenities: ["glass board", "monitor", "power", "standing table"],
          policyNote: "Requires a current student ID to confirm."
        },
        fallbackRooms: [
          {
            id: "sunroom-420",
            library: "Main Library",
            name: "Sunroom 420",
            capacity: 10,
            vibe: "Open collaboration",
            amenities: ["rolling boards", "presentation display", "power", "soft seating"],
            policyNote: "Best for discussion-heavy groups of 4 to 8."
          }
        ]
      },
      {
        id: "opt_3",
        label: "Thu, Mar 19 6:00 PM - 7:30 PM",
        startIso: "2026-03-20T00:00:00.000Z",
        endIso: "2026-03-20T01:30:00.000Z",
        responseScore: 0.85,
        fitLabel: "Usable fallback",
        reason: "Late-evening window works if Jordan leaves lab on time, with a bigger room available if the group expands.",
        availableAttendees: ["Maya", "Luis"],
        room: {
          id: "sunroom-420",
          library: "Main Library",
          name: "Sunroom 420",
          capacity: 10,
          vibe: "Open collaboration",
          amenities: ["rolling boards", "presentation display", "power", "soft seating"],
          policyNote: "Best for discussion-heavy groups of 4 to 8."
        },
        fallbackRooms: [
          {
            id: "atlas-302",
            library: "Main Library",
            name: "Atlas Room 302",
            capacity: 6,
            vibe: "Quiet focus",
            amenities: ["whiteboard", "dual display", "power", "window light"],
            policyNote: "Main Library caps study room holds at 2 hours."
          }
        ]
      }
    ],
    status: "draft",
    policySummary: [
      "Main Library caps study room holds at 2 hours.",
      "Attendees only receive confirmations after the organizer locks a final choice.",
      "If the room is still unclaimed after 15 minutes, the hold can be released."
    ],
    nextSteps: [
      "Choose one of the top-ranked overlaps.",
      "Confirm the room to lock the reservation code.",
      "Send reminders automatically one hour before the session."
    ],
    generatedAtIso: "2026-03-11T01:00:00.000Z"
  }
};

