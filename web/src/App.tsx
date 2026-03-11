import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
  useSyncExternalStore
} from "react";

import { demoToolOutput } from "./demo-data";
import type { MeetingPlan, TimeOption, ToolOutput } from "./types";

interface HostSnapshot {
  locale: string;
  theme: "light" | "dark";
  toolOutput: ToolOutput | null;
  hasHost: boolean;
}

interface ActionState {
  label: string;
  pending: boolean;
}

function readHostSnapshot(): HostSnapshot {
  const host = window.openai;
  return {
    locale: host?.locale ?? navigator.language ?? "en-US",
    theme: host?.theme ?? "light",
    toolOutput: host?.toolOutput ?? null,
    hasHost: Boolean(host)
  };
}

function subscribeToHost(onStoreChange: () => void): () => void {
  const refresh = () => {
    startTransition(() => onStoreChange());
  };

  window.addEventListener("openai:set_globals", refresh as EventListener);
  window.addEventListener("message", refresh);

  return () => {
    window.removeEventListener("openai:set_globals", refresh as EventListener);
    window.removeEventListener("message", refresh);
  };
}

export function App() {
  const snapshot = useSyncExternalStore(subscribeToHost, readHostSnapshot, readHostSnapshot);
  const [localOutput, setLocalOutput] = useState<ToolOutput | null>(null);
  const [actionState, setActionState] = useState<ActionState>({ label: "", pending: false });

  const activeOutput = localOutput ?? snapshot.toolOutput ?? demoToolOutput;
  const deferredOutput = useDeferredValue(activeOutput);
  const meeting = deferredOutput.meeting;
  const selectedOption =
    meeting.options.find((option) => option.id === meeting.selectedOptionId) ?? meeting.options[0] ?? null;
  const stats = buildStats(meeting);
  const generatedAt = new Intl.DateTimeFormat(snapshot.locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(meeting.generatedAtIso));

  useEffect(() => {
    if (!snapshot.toolOutput) {
      return;
    }

    setLocalOutput(null);
  }, [snapshot.toolOutput]);

  async function runTool(toolName: string, input: Record<string, unknown>, label: string) {
    if (!window.openai?.callTool) {
      return;
    }

    setActionState({ label, pending: true });

    try {
      const result = await window.openai.callTool(toolName, input);
      const nextOutput = extractToolOutput(result);
      if (nextOutput) {
        startTransition(() => {
          setLocalOutput(nextOutput);
          setActionState({ label: "", pending: false });
        });
      } else {
        setActionState({ label: "", pending: false });
      }
      await window.openai.sendFollowUpMessage?.(`${label} complete.`);
    } catch (error) {
      console.error(error);
      setActionState({ label: "Action failed", pending: false });
    }
  }

  return (
    <main className={`shell theme-${snapshot.theme}`}>
      <section className="backdrop" />
      <section className="board">
        <header className="hero panel reveal">
          <div className="hero-copy">
            <p className="eyebrow">Campus coordination that feels premium</p>
            <h1>{meeting.title}</h1>
            <p className="hero-summary">
              StudyJam turns loose scheduling intent into ranked overlaps, policy-safe rooms, and a booking you can
              confirm inside ChatGPT.
            </p>
          </div>
          <div className="hero-aside">
            <div className="metric-tile">
              <span className="metric-label">Best overlap</span>
              <strong>{stats.bestOverlap}</strong>
            </div>
            <div className="metric-tile">
              <span className="metric-label">Room vibe</span>
              <strong>{selectedOption?.room.vibe ?? "Ready"}</strong>
            </div>
            <button
              className="ghost-button"
              type="button"
              onClick={() => window.openai?.requestDisplayMode?.("fullscreen")}
              disabled={!snapshot.hasHost}
            >
              Expand board
            </button>
          </div>
        </header>

        <section className="top-grid reveal delay-1">
          <article className="panel briefing">
            <div className="panel-heading">
              <span className="panel-tag">Brief</span>
              <span className={`status-pill status-${meeting.status}`}>{meeting.status}</span>
            </div>
            <dl className="brief-grid">
              <div>
                <dt>Organizer</dt>
                <dd>{meeting.organizerName}</dd>
              </div>
              <div>
                <dt>Window</dt>
                <dd>{meeting.dateRangeLabel}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{meeting.durationMinutes} min</dd>
              </div>
              <div>
                <dt>Library</dt>
                <dd>{formatLibrary(meeting.libraryPreference)}</dd>
              </div>
            </dl>
            <p className="timestamp">Last refresh {generatedAt}</p>
          </article>

          <article className="panel response-panel">
            <div className="panel-heading">
              <span className="panel-tag">Attendee pulse</span>
              <span className="mini-copy">{stats.responseLine}</span>
            </div>
            <div className="attendee-list">
              {meeting.attendees.map((attendee) => (
                <div className="attendee-row" key={attendee.name}>
                  <div>
                    <strong>{attendee.name}</strong>
                    <p>{attendee.responseLabel}</p>
                  </div>
                  <div className="attendee-meta">
                    <span className={`status-dot status-${attendee.status}`} />
                    <span>{Math.round(attendee.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="ghost-button"
              type="button"
              onClick={() => runTool("collect_availability", { meetingId: meeting.meetingId }, "Availability refresh")}
              disabled={!snapshot.hasHost || actionState.pending}
            >
              Refresh availability
            </button>
          </article>
        </section>

        <section className="content-grid reveal delay-2">
          <article className="panel options-panel">
            <div className="panel-heading">
              <span className="panel-tag">Ranked options</span>
              <span className="mini-copy">Top 3 time + room pairs</span>
            </div>
            <div className="option-stack">
              {meeting.options.map((option, index) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  index={index}
                  isSelected={meeting.selectedOptionId === option.id || (!meeting.selectedOptionId && index === 0)}
                  hasHost={snapshot.hasHost}
                  pending={actionState.pending}
                  onConfirm={() =>
                    runTool(
                      "confirm_meeting_and_book",
                      { meetingId: meeting.meetingId, optionId: option.id },
                      "Booking"
                    )
                  }
                />
              ))}
            </div>
          </article>

          <article className="panel rail-panel">
            <div className="panel-heading">
              <span className="panel-tag">Booking rail</span>
              <span className="mini-copy">{selectedOption?.room.library ?? "Library room"}</span>
            </div>
            {selectedOption ? <RoomRail meeting={meeting} option={selectedOption} /> : null}
            <div className="cta-group">
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  selectedOption &&
                  runTool(
                    "confirm_meeting_and_book",
                    { meetingId: meeting.meetingId, optionId: selectedOption.id },
                    "Booking"
                  )
                }
                disabled={!snapshot.hasHost || actionState.pending || !selectedOption}
              >
                {actionState.pending && actionState.label === "Booking" ? "Booking..." : "Confirm best option"}
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() =>
                  runTool(
                    "rank_time_options",
                    { meetingId: meeting.meetingId, reason: "Room conflict or stronger overlap requested." },
                    "Reranking"
                  )
                }
                disabled={!snapshot.hasHost || actionState.pending}
              >
                {actionState.pending && actionState.label === "Reranking" ? "Reranking..." : "Rerank options"}
              </button>
              <button
                className="ghost-button danger"
                type="button"
                onClick={() => runTool("cancel_booking", { meetingId: meeting.meetingId }, "Cancellation")}
                disabled={!snapshot.hasHost || actionState.pending || meeting.status !== "confirmed"}
              >
                Cancel booking
              </button>
            </div>
          </article>
        </section>

        <section className="footer-grid reveal delay-3">
          <article className="panel">
            <div className="panel-heading">
              <span className="panel-tag">Trust layer</span>
            </div>
            <ul className="bullet-list">
              {meeting.policySummary.map((policy) => (
                <li key={policy}>{policy}</li>
              ))}
            </ul>
          </article>
          <article className="panel">
            <div className="panel-heading">
              <span className="panel-tag">Next moves</span>
            </div>
            <ol className="number-list">
              {meeting.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        </section>
      </section>
    </main>
  );
}

function OptionCard(props: {
  option: TimeOption;
  index: number;
  isSelected: boolean;
  hasHost: boolean;
  pending: boolean;
  onConfirm: () => void;
}) {
  const { option, index, isSelected, hasHost, pending, onConfirm } = props;

  return (
    <article className={`option-card ${isSelected ? "selected" : ""}`}>
      <div className="option-head">
        <div>
          <span className="option-rank">Option {index + 1}</span>
          <h2>{option.label}</h2>
        </div>
        <div className="score-badge">{Math.round(option.responseScore * 100)}</div>
      </div>
      <p className="fit-copy">
        <strong>{option.fitLabel}.</strong> {option.reason}
      </p>
      <div className="pill-row">
        {option.availableAttendees.map((attendee) => (
          <span className="name-pill" key={attendee}>
            {attendee}
          </span>
        ))}
      </div>
      <div className="room-strip">
        <div>
          <p className="room-kicker">{option.room.library}</p>
          <strong>{option.room.name}</strong>
        </div>
        <span>{option.room.capacity} seats</span>
      </div>
      <button className="ghost-button accent" type="button" onClick={onConfirm} disabled={!hasHost || pending}>
        Reserve this slot
      </button>
    </article>
  );
}

function RoomRail(props: { meeting: MeetingPlan; option: TimeOption }) {
  const { meeting, option } = props;

  return (
    <div className="room-rail">
      <div className="reservation-card">
        <p className="room-kicker">Primary room match</p>
        <h2>{option.room.name}</h2>
        <p>{option.room.vibe}</p>
        <div className="amenity-grid">
          {option.room.amenities.map((amenity) => (
            <span className="amenity-pill" key={amenity}>
              {amenity}
            </span>
          ))}
        </div>
      </div>
      <div className="booking-card">
        <p className="room-kicker">Reservation state</p>
        {meeting.booking ? (
          <>
            <h3>{meeting.booking.confirmationCode}</h3>
            <p>Approved by {meeting.booking.approvedBy}</p>
          </>
        ) : (
          <>
            <h3>Awaiting organizer approval</h3>
            <p>No room is booked until ChatGPT receives a clear confirmation event.</p>
          </>
        )}
      </div>
      <div className="fallback-card">
        <p className="room-kicker">Fallback rooms</p>
        {option.fallbackRooms.map((room) => (
          <div className="fallback-row" key={room.id}>
            <div>
              <strong>{room.name}</strong>
              <p>{room.library}</p>
            </div>
            <span>{room.capacity} seats</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildStats(meeting: MeetingPlan) {
  const available = meeting.attendees.filter((attendee) => attendee.status === "available").length;
  const pending = meeting.attendees.filter((attendee) => attendee.status === "pending").length;
  const bestOption = meeting.options[0];

  return {
    bestOverlap: bestOption ? `${bestOption.availableAttendees.length}/${meeting.attendees.length}` : "0/0",
    responseLine: pending > 0 ? `${available} ready, ${pending} pending` : `${available} ready to confirm`
  };
}

function extractToolOutput(result: unknown): ToolOutput | null {
  if (!result || typeof result !== "object") {
    return null;
  }

  if ("meeting" in result) {
    return result as ToolOutput;
  }

  if ("structuredContent" in result && result.structuredContent && typeof result.structuredContent === "object") {
    return result.structuredContent as ToolOutput;
  }

  return null;
}

function formatLibrary(value: MeetingPlan["libraryPreference"]) {
  if (value === "main-library") {
    return "Main Library";
  }

  if (value === "engineering-library") {
    return "Engineering Library";
  }

  return "Any campus library";
}
