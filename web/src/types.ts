export type AttendeeSource = "google-calendar" | "poll" | "manual";
export type AttendeeStatus = "available" | "maybe" | "pending";
export type MeetingType = "quiet-study" | "problem-set" | "review-session";
export type LibraryPreference = "main-library" | "engineering-library" | "any";
export type MeetingStatus = "draft" | "confirmed" | "cancelled";

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
  meetingType: MeetingType;
  libraryPreference: LibraryPreference;
  notes?: string;
  attendees: AttendeePulse[];
  options: TimeOption[];
  status: MeetingStatus;
  selectedOptionId?: string;
  booking?: BookingInfo;
  policySummary: string[];
  nextSteps: string[];
  generatedAtIso: string;
}

export interface ToolOutput {
  meeting: MeetingPlan;
}

