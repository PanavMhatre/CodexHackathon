import crypto from "node:crypto";

export type MeetingType = "quiet-study" | "problem-set" | "review-session";
export type LibraryPreference = "main-library" | "engineering-library" | "any";
export type AttendeeSource = "google-calendar" | "poll" | "manual";
export type AttendeeStatus = "available" | "maybe" | "pending";
export type MeetingStatus = "draft" | "confirmed" | "cancelled";

export interface MeetingRequestInput {
  organizerName: string;
  title: string;
  attendees: string[];
  durationMinutes: number;
  dateRangeLabel: string;
  preferredAfterHour?: number | undefined;
  preferredDays?: string[] | undefined;
  meetingType?: MeetingType | undefined;
  libraryPreference?: LibraryPreference | undefined;
  roomNeeds?: string[] | undefined;
  notes?: string | undefined;
}

export interface AttendeePulse {
  name: string;
  source: AttendeeSource;
  status: AttendeeStatus;
  responseLabel: string;
  confidence: number;
}

export interface RoomMatch {
  id: string;
  library: string;
  name: string;
  capacity: number;
  vibe: string;
  amenities: string[];
  policyNote: string;
}

export interface TimeOption {
  id: string;
  label: string;
  startIso: string;
  endIso: string;
  responseScore: number;
  fitLabel: string;
  reason: string;
  availableAttendees: string[];
  room: RoomMatch;
  fallbackRooms: RoomMatch[];
}

export interface BookingInfo {
  confirmationCode: string;
  approvedBy: string;
  roomId: string;
  optionId: string;
  bookedAtIso: string;
}

export interface MeetingPlan {
  meetingId: string;
  title: string;
  organizerName: string;
  dateRangeLabel: string;
  durationMinutes: number;
  preferredAfterHour: number;
  preferredDays: string[];
  meetingType: MeetingType;
  libraryPreference: LibraryPreference;
  roomNeeds: string[];
  notes?: string | undefined;
  attendees: AttendeePulse[];
  options: TimeOption[];
  status: MeetingStatus;
  selectedOptionId?: string | undefined;
  booking?: BookingInfo | undefined;
  policySummary: string[];
  nextSteps: string[];
  generatedAtIso: string;
}

interface NormalizedMeetingRequest {
  organizerName: string;
  title: string;
  attendees: string[];
  durationMinutes: number;
  dateRangeLabel: string;
  preferredAfterHour: number;
  preferredDays: string[];
  meetingType: MeetingType;
  libraryPreference: LibraryPreference;
  roomNeeds: string[];
  notes: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_ROOM_NEEDS = ["whiteboard", "power"];

const ROOM_POOL: RoomMatch[] = [
  {
    id: "atlas-302",
    library: "Main Library",
    name: "Atlas Room 302",
    capacity: 6,
    vibe: "Quiet focus",
    amenities: ["whiteboard", "dual display", "power", "window light"],
    policyNote: "Main Library caps study room holds at 2 hours."
  },
  {
    id: "lantern-215",
    library: "Main Library",
    name: "Lantern Room 215",
    capacity: 8,
    vibe: "Collaborative",
    amenities: ["glass board", "monitor", "power", "standing table"],
    policyNote: "Requires a current student ID to confirm."
  },
  {
    id: "circuit-118",
    library: "Engineering Library",
    name: "Circuit Studio 118",
    capacity: 5,
    vibe: "Problem set sprint",
    amenities: ["whiteboard", "HDMI screen", "power", "maker stools"],
    policyNote: "Engineering Library releases no-shows after 15 minutes."
  },
  {
    id: "sunroom-420",
    library: "Main Library",
    name: "Sunroom 420",
    capacity: 10,
    vibe: "Open collaboration",
    amenities: ["rolling boards", "presentation display", "power", "soft seating"],
    policyNote: "Best for discussion-heavy groups of 4 to 8."
  }
];

const LIBRARY_RANK: Record<LibraryPreference, string[]> = {
  "main-library": ["Main Library"],
  "engineering-library": ["Engineering Library"],
  any: ["Main Library", "Engineering Library"]
};

const MEETING_STYLE_COPY: Record<MeetingType, string> = {
  "quiet-study": "Quiet room priority, stable focus blocks, minimal foot traffic.",
  "problem-set": "Whiteboards and displays prioritized for active collaboration.",
  "review-session": "Balanced room with enough capacity for slides, notes, and discussion."
};

export function createMeetingPlan(input: MeetingRequestInput): MeetingPlan {
  const normalized = normalizeInput(input);
  const meetingId = createId("mtg");
  const attendees = buildAttendeePulse(normalized.attendees);
  const options = buildOptions(normalized, attendees, 0);

  return {
    meetingId,
    title: normalized.title,
    organizerName: normalized.organizerName,
    dateRangeLabel: normalized.dateRangeLabel,
    durationMinutes: normalized.durationMinutes,
    preferredAfterHour: normalized.preferredAfterHour,
    preferredDays: normalized.preferredDays,
    meetingType: normalized.meetingType,
    libraryPreference: normalized.libraryPreference,
    roomNeeds: normalized.roomNeeds,
    notes: normalized.notes,
    attendees,
    options,
    status: "draft",
    policySummary: buildPolicySummary(normalized, options[0]?.room.policyNote),
    nextSteps: [
      "Review the top three overlaps and confirm one slot.",
      "If someone is pending, nudge them before booking.",
      "Confirm the room so the reservation code is locked in."
    ],
    generatedAtIso: new Date().toISOString()
  };
}

export function collectAvailability(plan: MeetingPlan): MeetingPlan {
  const attendees = plan.attendees.map((attendee, index) => {
    if (attendee.status !== "pending") {
      return attendee;
    }

    const available = hashToInt(`${plan.meetingId}:${attendee.name}:${index}`) % 2 === 0;
    const status: AttendeeStatus = available ? "available" : "maybe";
    return {
      ...attendee,
      status,
      responseLabel: available ? "poll submitted" : "might join after class",
      confidence: available ? 0.83 : 0.58
    };
  });

  return {
    ...plan,
    attendees,
    options: buildOptions(
      {
        organizerName: plan.organizerName,
        title: plan.title,
        attendees: attendees.map((attendee) => attendee.name),
        durationMinutes: plan.durationMinutes,
        dateRangeLabel: plan.dateRangeLabel,
        preferredAfterHour: plan.preferredAfterHour,
        preferredDays: plan.preferredDays,
        meetingType: plan.meetingType,
        libraryPreference: plan.libraryPreference,
        roomNeeds: plan.roomNeeds,
        notes: plan.notes ?? ""
      },
      attendees,
      0
    ),
    generatedAtIso: new Date().toISOString()
  };
}

export function rerankMeetingPlan(plan: MeetingPlan, reason?: string): MeetingPlan {
  const options = buildOptions(
    {
      organizerName: plan.organizerName,
      title: plan.title,
      attendees: plan.attendees.map((attendee) => attendee.name),
      durationMinutes: plan.durationMinutes,
      dateRangeLabel: plan.dateRangeLabel,
      preferredAfterHour: plan.preferredAfterHour + 1,
      preferredDays: plan.preferredDays,
      meetingType: plan.meetingType,
      libraryPreference: plan.libraryPreference,
      roomNeeds: plan.roomNeeds,
      notes: reason ?? plan.notes ?? ""
    },
    plan.attendees,
    1
  );

  return {
    ...plan,
    options,
    notes: reason ?? plan.notes,
    nextSteps: [
      "A fresh set of options is ready with a slightly later start window.",
      "Pick the strongest overlap or keep nudging the remaining attendees.",
      "Confirm quickly if you want the first-choice room."
    ],
    generatedAtIso: new Date().toISOString()
  };
}

export function confirmBooking(plan: MeetingPlan, optionId: string): MeetingPlan {
  const selectedOption = plan.options.find((option) => option.id === optionId) ?? plan.options[0];

  if (!selectedOption) {
    return plan;
  }

  return {
    ...plan,
    status: "confirmed",
    selectedOptionId: selectedOption.id,
    booking: {
      confirmationCode: `LIB-${hashToInt(`${plan.meetingId}:${optionId}`).toString(16).toUpperCase().slice(0, 6)}`,
      approvedBy: plan.organizerName,
      roomId: selectedOption.room.id,
      optionId: selectedOption.id,
      bookedAtIso: new Date().toISOString()
    },
    nextSteps: [
      "Confirmation sent to all attendees.",
      "Keep the room or reschedule if availability changes.",
      "Arrive within 15 minutes so the hold is not released."
    ],
    generatedAtIso: new Date().toISOString()
  };
}

export function cancelBooking(plan: MeetingPlan): MeetingPlan {
  return {
    ...plan,
    status: "cancelled",
    nextSteps: [
      "The booking is cancelled.",
      "Create a new request when the group is ready to meet again."
    ],
    generatedAtIso: new Date().toISOString()
  };
}

function normalizeInput(input: MeetingRequestInput): NormalizedMeetingRequest {
  return {
    organizerName: input.organizerName.trim(),
    title: input.title.trim(),
    attendees: input.attendees.map((attendee) => attendee.trim()).filter(Boolean),
    durationMinutes: Math.min(Math.max(input.durationMinutes, 30), 120),
    dateRangeLabel: input.dateRangeLabel.trim(),
    preferredAfterHour: input.preferredAfterHour ?? 16,
    preferredDays: input.preferredDays?.length ? input.preferredDays : ["Tue", "Wed", "Thu"],
    meetingType: input.meetingType ?? "quiet-study",
    libraryPreference: input.libraryPreference ?? "main-library",
    roomNeeds: input.roomNeeds?.length ? input.roomNeeds : DEFAULT_ROOM_NEEDS,
    notes: input.notes ?? ""
  };
}

function buildAttendeePulse(attendees: string[]): AttendeePulse[] {
  return attendees.map((name, index) => {
    const seed = hashToInt(`${name}:${index}`);
    const status: AttendeeStatus = seed % 5 === 0 ? "pending" : seed % 3 === 0 ? "maybe" : "available";
    const source: AttendeeSource = seed % 2 === 0 ? "google-calendar" : "poll";

    return {
      name,
      source,
      status,
      responseLabel:
        status === "pending"
          ? "waiting on response"
          : status === "maybe"
            ? "calendar conflict near start time"
            : source === "google-calendar"
              ? "calendar synced"
              : "poll submitted",
      confidence: status === "available" ? 0.92 : status === "maybe" ? 0.64 : 0.33
    };
  });
}

function buildOptions(
  input: NormalizedMeetingRequest,
  attendees: AttendeePulse[],
  offsetSeed: number
): TimeOption[] {
  const candidateStarts = buildCandidateStarts(input.preferredDays, input.preferredAfterHour, offsetSeed);
  const requestedLibraries = new Set(LIBRARY_RANK[input.libraryPreference]);
  const groupSize = attendees.length + 1;

  return candidateStarts
    .map((start, index) => {
      const availableAttendees = attendees
        .filter((attendee) => attendee.status === "available" || (attendee.status === "maybe" && (index + attendee.name.length) % 2 === 0))
        .map((attendee) => attendee.name);
      const roomMatches = ROOM_POOL.filter((room) => {
        const libraryFits = requestedLibraries.has(room.library);
        const capacityFits = room.capacity >= groupSize;
        const meetingFits =
          input.meetingType !== "quiet-study" ||
          room.vibe.toLowerCase().includes("quiet") ||
          room.amenities.includes("window light");
        return libraryFits && capacityFits && meetingFits;
      });
      const room = roomMatches[index % Math.max(roomMatches.length, 1)] ?? ROOM_POOL[index % ROOM_POOL.length]!;
      const fallbackRooms = ROOM_POOL.filter((candidate) => candidate.id !== room.id && candidate.capacity >= groupSize).slice(0, 2);
      const end = new Date(start.getTime() + input.durationMinutes * 60_000);
      const attendanceFit = availableAttendees.length / Math.max(attendees.length, 1);
      const timeBonus = start.getHours() >= input.preferredAfterHour ? 0.15 : 0;
      const roomBonus = room.library === "Main Library" && input.libraryPreference === "main-library" ? 0.08 : 0.04;
      const responseScore = Number((attendanceFit + timeBonus + roomBonus).toFixed(2));

      return {
        id: `${start.toISOString()}-${index}`,
        label: `${formatDay(start)} ${formatTime(start)} - ${formatTime(end)}`,
        startIso: start.toISOString(),
        endIso: end.toISOString(),
        responseScore,
        fitLabel:
          availableAttendees.length === attendees.length
            ? "Full consensus"
            : availableAttendees.length >= Math.max(2, attendees.length - 1)
              ? "Strong overlap"
              : "Usable fallback",
        reason: buildReason({
          input,
          availableCount: availableAttendees.length,
          attendeeCount: attendees.length,
          room
        }),
        availableAttendees,
        room,
        fallbackRooms
      };
    })
    .sort((left, right) => right.responseScore - left.responseScore)
    .slice(0, 3);
}

function buildCandidateStarts(preferredDays: string[], preferredAfterHour: number, offsetSeed: number): Date[] {
  const now = new Date();
  const nextWeekStart = new Date(now);
  nextWeekStart.setDate(now.getDate() + (8 - now.getDay()));
  nextWeekStart.setHours(0, 0, 0, 0);

  return preferredDays.map((dayLabel, index) => {
    const targetDay = Math.max(DAY_NAMES.indexOf(dayLabel.slice(0, 3)), 1);
    const candidate = new Date(nextWeekStart);
    const delta = (targetDay - nextWeekStart.getDay() + 7) % 7;
    candidate.setDate(nextWeekStart.getDate() + delta);
    candidate.setHours(preferredAfterHour + (index % 2) + offsetSeed, index === 1 ? 30 : 0, 0, 0);
    return candidate;
  });
}

function buildReason(args: {
  input: NormalizedMeetingRequest;
  availableCount: number;
  attendeeCount: number;
  room: RoomMatch;
}): string {
  const overlapText =
    args.availableCount === args.attendeeCount
      ? "Everyone clears this window."
      : `${args.availableCount} of ${args.attendeeCount} attendees are solid for this slot.`;

  return `${overlapText} ${MEETING_STYLE_COPY[args.input.meetingType]} ${args.room.name} fits the requested vibe with ${args.room.amenities.slice(0, 2).join(" and ")}.`;
}

function buildPolicySummary(input: NormalizedMeetingRequest, roomPolicy?: string): string[] {
  return [
    roomPolicy ?? "Library rooms require an explicit organizer confirmation before booking.",
    `Study sessions are trimmed to ${input.durationMinutes} minutes to stay inside campus booking limits.`,
    "Attendees only receive confirmations after the organizer locks a final choice."
  ];
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

function hashToInt(value: string): number {
  const digest = crypto.createHash("sha256").update(value).digest("hex").slice(0, 8);
  return Number.parseInt(digest, 16);
}

function formatDay(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}
