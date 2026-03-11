import type { MeetingPlan, RoomMatch, TimeOption } from "./planner.js";

const PCL_PAGE_URL = "https://libcal.lib.utexas.edu/spaces?lid=16542&gid=35011";
const PCL_GRID_URL = "https://libcal.lib.utexas.edu/spaces/availability/grid";
const PCL_BOOKING_ADD_URL = "https://libcal.lib.utexas.edu/spaces/availability/booking/add";
const PCL_NAME = "Perry-Castaneda Library";
const CATALOG_CACHE_TTL_MS = 15 * 60 * 1000;

interface PclRoomCatalogEntry {
  eid: number;
  name: string;
  capacity: number;
  detailUrl: string;
}

interface PclGridSlot {
  start: string;
  end: string;
  itemId: number;
  checksum: string;
  className?: string;
}

interface PclGridResponse {
  slots: PclGridSlot[];
  windowEnd: boolean;
}

interface PclBookingCandidate {
  id: number;
  eid: number;
  start: string;
  end: string;
  options: string[];
  optionChecksums: string[];
}

interface PclBookingAddResponse {
  bookings?: PclBookingCandidate[];
  error?: string;
}

let catalogCache: { fetchedAt: number; rooms: PclRoomCatalogEntry[] } | null = null;

export async function applyLivePclAvailability(plan: MeetingPlan): Promise<MeetingPlan> {
  const catalog = await getCatalog();
  const groupSize = plan.attendees.length + 1;
  const eligibleRooms = catalog.filter((room) => room.capacity >= groupSize);

  if (eligibleRooms.length === 0) {
    return {
      ...plan,
      options: [],
      policySummary: [
        "Live PCL inventory was fetched, but no rooms fit the current group size.",
        "PCL group study rooms are for 2 or more UT Austin students.",
        "Reservations are limited to 4 hours per EID per week and are forfeited after 15 minutes."
      ],
      nextSteps: [
        "Reduce the group size or choose another building.",
        "Ask for a later slot or a different library."
      ],
      generatedAtIso: new Date().toISOString()
    };
  }

  const range = buildQueryRange(plan.dateRangeLabel, plan.preferredDays);
  const grid = await getAvailabilityGrid(range.startDate, range.endDate);
  const roomMap = new Map(eligibleRooms.map((room) => [room.eid, room]));
  const effectiveDurationMinutes = 60;
  const requestedDurationMinutes = plan.durationMinutes;

  const matchingSlots = grid.slots.filter((slot) => {
    const room = roomMap.get(slot.itemId);
    if (!room || slot.className) {
      return false;
    }

    const slotStart = parseLocalSlot(slot.start);
    const slotDateKey = formatYyyyMmDd(slotStart);
    return range.allowedDateKeys.has(slotDateKey) && slotStart.getHours() >= plan.preferredAfterHour;
  });

  const rankedCandidates = matchingSlots
    .slice()
    .sort(
      (left, right) =>
        scoreCandidateSlot(right, plan, roomMap) - scoreCandidateSlot(left, plan, roomMap) ||
        left.start.localeCompare(right.start)
    );

  const slotsByStart = new Map<string, PclGridSlot[]>();
  for (const slot of matchingSlots) {
    const bucket = slotsByStart.get(slot.start) ?? [];
    bucket.push(slot);
    slotsByStart.set(slot.start, bucket);
  }

  const validatedSlots: Array<{ slot: PclGridSlot; booking: PclBookingCandidate }> = [];
  const maxValidationAttempts = Math.min(rankedCandidates.length, 15);
  for (const slot of rankedCandidates.slice(0, maxValidationAttempts)) {
    const booking = await validateBookableSlot(slot, range.startDate, range.endDate);
    if (booking) {
      validatedSlots.push({ slot, booking });
    }

    if (validatedSlots.length >= 3) {
      break;
    }
  }

  const topOptions = validatedSlots.map(({ slot, booking }, index) =>
    buildOption(slot, booking, index, plan, roomMap, slotsByStart, effectiveDurationMinutes)
  );

  const policySummary = [
    "Live PCL availability was fetched from UT Austin LibCal at tool-call time.",
    "PCL group study rooms are for UT Austin students in groups of 2 or more.",
    requestedDurationMinutes === effectiveDurationMinutes
      ? "PCL currently exposes this inventory in 1-hour reservable blocks."
      : `Requested ${requestedDurationMinutes} minutes, but PCL currently exposes 1-hour reservable blocks, so options were shortened to 60 minutes.`,
    "Reservations are limited to 4 hours per EID per week and are forfeited after 15 minutes."
  ];

  const nextSteps =
    topOptions.length > 0
      ? [
          "Review the top live PCL slots and confirm one room.",
          "If nothing fits, rerank for a later start or another day.",
          "Confirm quickly if you want to lock the current availability."
        ]
      : [
          "No live PCL slots matched the requested window.",
          "Ask for a different day, a different after-hour cutoff, or another library."
        ];

  return {
    ...plan,
    durationMinutes: effectiveDurationMinutes,
    options: topOptions,
    libraryPreference: "main-library",
    policySummary,
    nextSteps,
    notes: appendNote(
      plan.notes,
      `Live PCL data checked for ${range.startDate} through ${range.endDate}.`
    ),
    generatedAtIso: new Date().toISOString()
  };
}

async function getCatalog(): Promise<PclRoomCatalogEntry[]> {
  if (catalogCache && Date.now() - catalogCache.fetchedAt < CATALOG_CACHE_TTL_MS) {
    return catalogCache.rooms;
  }

  const response = await fetch(PCL_PAGE_URL, {
    headers: {
      "user-agent": "StudyJam/0.1 (+https://developers.openai.com/apps-sdk)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load PCL page: ${response.status}`);
  }

  const html = await response.text();
  const rooms = parseCatalogFromHtml(html);
  if (rooms.length === 0) {
    throw new Error("Failed to parse PCL room catalog.");
  }

  catalogCache = {
    fetchedAt: Date.now(),
    rooms
  };

  return rooms;
}

async function getAvailabilityGrid(startDate: string, endDate: string): Promise<PclGridResponse> {
  const payload = new URLSearchParams({
    lid: "16542",
    gid: "35011",
    start: startDate,
    end: endDate,
    pageIndex: "0",
    pageSize: "100",
    seat: "0",
    zone: "0"
  });

  const response = await fetch(PCL_GRID_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      referer: PCL_PAGE_URL,
      "user-agent": "StudyJam/0.1 (+https://developers.openai.com/apps-sdk)"
    },
    body: payload.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to load PCL availability grid: ${response.status}`);
  }

  const data = (await response.json()) as PclGridResponse;
  if (!Array.isArray(data.slots)) {
    throw new Error("Unexpected PCL availability response.");
  }

  return data;
}

async function validateBookableSlot(
  slot: PclGridSlot,
  rangeStartDate: string,
  rangeEndDate: string
): Promise<PclBookingCandidate | null> {
  const payload = new URLSearchParams({
    "add[eid]": String(slot.itemId),
    "add[seat_id]": "",
    "add[gid]": "35011",
    "add[lid]": "16542",
    "add[start]": slot.start,
    "add[checksum]": slot.checksum,
    lid: "16542",
    gid: "35011",
    start: rangeStartDate,
    end: rangeEndDate
  });

  const response = await fetch(PCL_BOOKING_ADD_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      referer: PCL_PAGE_URL,
      "user-agent": "StudyJam/0.1 (+https://developers.openai.com/apps-sdk)"
    },
    body: payload.toString()
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as PclBookingAddResponse;
  return data.bookings?.[0] ?? null;
}

function parseCatalogFromHtml(html: string): PclRoomCatalogEntry[] {
  const rooms: PclRoomCatalogEntry[] = [];
  const matcher =
    /resources\.push\(\{\s*id:\s*"eid_(\d+)",[\s\S]*?title:\s*"([^"]+)",[\s\S]*?url:\s*"([^"]+)",[\s\S]*?capacity:\s*(\d+)/g;

  for (const match of html.matchAll(matcher)) {
    const [, eidRaw, titleRaw, detailUrlRaw, capacityRaw] = match;
    if (!eidRaw || !titleRaw || !detailUrlRaw || !capacityRaw) {
      continue;
    }

    rooms.push({
      eid: Number.parseInt(eidRaw, 10),
      name: decodeJsString(titleRaw).replace(/\s+\(Capacity \d+\)$/, ""),
      detailUrl: `https://libcal.lib.utexas.edu${decodeJsString(detailUrlRaw)}`,
      capacity: Number.parseInt(capacityRaw, 10)
    });
  }

  return rooms;
}

function buildOption(
  slot: PclGridSlot,
  booking: PclBookingCandidate,
  index: number,
  plan: MeetingPlan,
  roomMap: Map<number, PclRoomCatalogEntry>,
  slotsByStart: Map<string, PclGridSlot[]>,
  durationMinutes: number
): TimeOption {
  const roomEntry = roomMap.get(slot.itemId);
  if (!roomEntry) {
    throw new Error(`Missing room metadata for item ${slot.itemId}`);
  }

  const start = parseLocalSlot(slot.start);
  const end = booking.end ? parseLocalSlot(booking.end) : new Date(start.getTime() + durationMinutes * 60_000);
  const attendeesReady = plan.attendees
    .filter((attendee, attendeeIndex) => attendee.status === "available" || (attendee.status === "maybe" && (attendeeIndex + index) % 2 === 0))
    .map((attendee) => attendee.name);
  const attendanceFit = attendeesReady.length / Math.max(plan.attendees.length, 1);
  const exactHourBonus = start.getHours() === plan.preferredAfterHour ? 0.16 : 0.08;
  const capacityBonus = Math.max(0, 0.15 - Math.abs(roomEntry.capacity - (plan.attendees.length + 1)) * 0.01);
  const responseScore = Number((attendanceFit + exactHourBonus + capacityBonus).toFixed(2));
  const concurrentRooms = (slotsByStart.get(slot.start) ?? []).filter((candidate) => candidate.itemId !== slot.itemId);
  const fallbackRooms = concurrentRooms.slice(0, 2).map((fallback) => toRoomMatch(roomMap.get(fallback.itemId)!));

  return {
    id: `pcl:${slot.itemId}:${slot.start}`,
    label: `${formatDay(start)} ${formatTime(start)} - ${formatTime(end)}`,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    responseScore,
    fitLabel:
      attendeesReady.length === plan.attendees.length
        ? "Full consensus"
        : attendeesReady.length >= Math.max(2, plan.attendees.length - 1)
          ? "Strong overlap"
          : "Limited overlap",
    reason: `${attendeesReady.length} of ${plan.attendees.length} attendees can likely make this live PCL slot. ${roomEntry.name} fits a group of ${plan.attendees.length + 1} with capacity ${roomEntry.capacity}.`,
    availableAttendees: attendeesReady,
    room: toRoomMatch(roomEntry),
    fallbackRooms
  };
}

function toRoomMatch(room: PclRoomCatalogEntry): RoomMatch {
  return {
    id: `pcl-${room.eid}`,
    library: PCL_NAME,
    name: room.name,
    capacity: room.capacity,
    vibe: room.capacity >= 9 ? "Large group study" : "Collaborative group study",
    amenities: [`capacity ${room.capacity}`, "UT student-only", "PCL group study room"],
    policyNote: "PCL group study rooms are booked in 1-hour blocks and are forfeited after 15 minutes."
  };
}

function buildQueryRange(
  dateRangeLabel: string,
  preferredDays: string[]
): { startDate: string; endDate: string; allowedDateKeys: Set<string> } {
  const normalizedLabel = dateRangeLabel.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (normalizedLabel.includes("tomorrow")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateKey = formatYyyyMmDd(tomorrow);
    const end = new Date(tomorrow);
    end.setDate(end.getDate() + 1);
    return {
      startDate: dateKey,
      endDate: formatYyyyMmDd(end),
      allowedDateKeys: new Set([dateKey])
    };
  }

  if (normalizedLabel.includes("today")) {
    const dateKey = formatYyyyMmDd(today);
    const end = new Date(today);
    end.setDate(end.getDate() + 1);
    return {
      startDate: dateKey,
      endDate: formatYyyyMmDd(end),
      allowedDateKeys: new Set([dateKey])
    };
  }

  if (normalizedLabel.includes("this week")) {
    const targets = buildTargetsForWeek(preferredDays, today);
    return buildRangeFromTargets(targets);
  }

  const nextWeekStart = new Date(today);
  nextWeekStart.setDate(today.getDate() + (8 - today.getDay()));
  nextWeekStart.setHours(0, 0, 0, 0);
  const targets = buildTargetsForWeek(preferredDays, nextWeekStart);
  return buildRangeFromTargets(targets);
}

function buildTargetsForWeek(preferredDays: string[], weekStart: Date): Date[] {
  return preferredDays.map((dayLabel) => {
    const weekdayIndex = weekdayToIndex(dayLabel);
    const candidate = new Date(weekStart);
    const delta = (weekdayIndex - weekStart.getDay() + 7) % 7;
    candidate.setDate(weekStart.getDate() + delta);
    return candidate;
  });
}

function buildRangeFromTargets(targets: Date[]): {
  startDate: string;
  endDate: string;
  allowedDateKeys: Set<string>;
} {
  const earliest = new Date(Math.min(...targets.map((date) => date.getTime())));
  const latest = new Date(Math.max(...targets.map((date) => date.getTime())));
  latest.setDate(latest.getDate() + 1);

  return {
    startDate: formatYyyyMmDd(earliest),
    endDate: formatYyyyMmDd(latest),
    allowedDateKeys: new Set(targets.map((date) => formatYyyyMmDd(date)))
  };
}

function parseLocalSlot(value: string): Date {
  return new Date(value.replace(" ", "T"));
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

function formatYyyyMmDd(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function weekdayToIndex(dayLabel: string): number {
  const normalized = dayLabel.slice(0, 3).toLowerCase();
  const map: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6
  };

  return map[normalized] ?? 1;
}

function decodeJsString(value: string): string {
  return JSON.parse(`"${value.replace(/"/g, '\\"')}"`) as string;
}

function appendNote(existing: string | undefined, extra: string): string {
  return existing ? `${existing} ${extra}` : extra;
}

function scoreCandidateSlot(
  slot: PclGridSlot,
  plan: MeetingPlan,
  roomMap: Map<number, PclRoomCatalogEntry>
): number {
  const room = roomMap.get(slot.itemId);
  if (!room) {
    return Number.NEGATIVE_INFINITY;
  }

  const start = parseLocalSlot(slot.start);
  const readyCount = plan.attendees.filter((attendee) => attendee.status === "available").length;
  const attendanceFit = readyCount / Math.max(plan.attendees.length, 1);
  const timeBonus = start.getHours() === plan.preferredAfterHour ? 0.18 : start.getHours() > plan.preferredAfterHour ? 0.1 : 0;
  const capacityBonus = Math.max(0, 0.14 - Math.abs(room.capacity - (plan.attendees.length + 1)) * 0.01);
  return attendanceFit + timeBonus + capacityBonus;
}
