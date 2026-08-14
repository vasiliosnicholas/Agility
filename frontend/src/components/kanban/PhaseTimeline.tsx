import ProgressBar from "react-bootstrap/ProgressBar";
import type { StoredPhase } from "@shared/models/Phases.ts";
import { TicketStatuses, type StoredTicket } from "@shared/models/Tickets.ts";
import type { User } from "@shared/models/Users.ts";
import {
    addDays,
    dayIndex,
    formatDayMonth,
    parseDateFromDateTimeString,
} from "../../utils/phaseDates.ts";

interface PhaseTimelineProps {
    user: Pick<User, "name">;
    phase: StoredPhase;
    tickets: StoredTicket[];
}

const BURNUP_VIEW_WIDTH = 100;
const BURNUP_VIEW_HEIGHT = 48;
const BURNUP_PLOT_SCALE = 0.9;
const BURNUP_CEILING_Y = BURNUP_VIEW_HEIGHT * (1 - BURNUP_PLOT_SCALE);

function buildBurnupPaths(
    cumulativeTicketsByDay: number[],
    phaseDays: number,
    throughDay: number,
    totalTickets: number,
    width = BURNUP_VIEW_WIDTH,
    height = BURNUP_VIEW_HEIGHT,
) {
    if (totalTickets === 0) {
        return { line: "", area: "" };
    }

    const endDay = Math.min(
        throughDay,
        phaseDays,
        cumulativeTicketsByDay.length - 1,
    );
    const points: { x: number; y: number }[] = [];

    for (let day = 0; day <= endDay; day++) {
        const x = (day / phaseDays) * width;
        const y =
            height -
            (cumulativeTicketsByDay[day] / totalTickets) *
            (height * BURNUP_PLOT_SCALE);
        points.push({ x, y });
    }

    if (points.length === 0) {
        return { line: "", area: "" };
    }

    const line = points
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
        )
        .join(" ");
    const lastX = points[points.length - 1].x;
    const area = `${line} L ${lastX.toFixed(2)} ${height} L 0 ${height} Z`;

    return { line, area };
}

export default function PhaseTimeline({
    user,
    phase,
    tickets,
}: PhaseTimelineProps) {
    const phaseTickets = tickets.filter(
        (ticket) => ticket.phaseId === phase._id,
    );
    const counts = {
        todo: phaseTickets.filter(
            (ticket) => ticket.status === TicketStatuses.Todo,
        ).length,
        inProgress: phaseTickets.filter(
            (ticket) => ticket.status === TicketStatuses.InProgress,
        ).length,
        completed: phaseTickets.filter(
            (ticket) => ticket.status === TicketStatuses.Completed,
        ).length,
    };
    const total = phaseTickets.length;
    const phaseLength = Math.max(phase.duration, 1);
    const phaseStart = parseDateFromDateTimeString(phase.startsAt);
    const phaseEnd = addDays(phaseStart, phaseLength);
    const todayIndex = Math.min(
        Math.max(dayIndex(new Date(), phaseStart), 0),
        phaseLength,
    );
    const todayPercent = (todayIndex / phaseLength) * 100;
    const midDay = Math.floor(phaseLength / 2);
    const majorMarkers = [
        { day: 0, label: formatDayMonth(phaseStart) },
        { day: midDay, label: formatDayMonth(addDays(phaseStart, midDay)) },
        { day: phaseLength, label: formatDayMonth(phaseEnd) },
    ];
    const todayOnLabeledDate = majorMarkers.some(
        (marker) => marker.day === todayIndex,
    );
    const dayDots = Array.from(
        { length: Math.max(phaseLength - 1, 0) },
        (_, index) => index + 1,
    ).filter((day) => day !== midDay);
    const completedDays = phaseTickets
        .filter((ticket) => ticket.completedAt !== null)
        .map((ticket) =>
            dayIndex(new Date(ticket.completedAt as string), phaseStart),
        );
    const cumulativeTicketsByDay = Array.from(
        { length: phaseLength + 1 },
        (_, day) =>
            completedDays.filter((completedDay) => completedDay <= day).length,
    );
    const { line: burnupLine, area: burnupArea } = buildBurnupPaths(
        cumulativeTicketsByDay,
        phaseLength,
        todayIndex,
        total,
    );
    const statusItems = [
        {
            key: "todo",
            count: counts.todo,
            label: "To-Do",
            swatchClass: "fill-todo",
            numberClass: "text-todo",
            barFill: "var(--status-todo-fill)",
        },
        {
            key: "inProgress",
            count: counts.inProgress,
            label: "In Progress",
            swatchClass: "fill-progress",
            numberClass: "text-progress",
            barFill: "var(--status-progress-fill)",
        },
        {
            key: "completed",
            count: counts.completed,
            label: "Completed",
            swatchClass: "fill-completed",
            numberClass: "text-completed",
            barFill: "var(--status-completed-fill)",
        },
    ];

    return (
        <div className="progress-timeline">
            <header className="progress-header">
                <h1 className="type-hero text-ink">Hi, {user.name}!</h1>
                <p className="type-body text-muted progress-subcopy">
                    Let's see how the team is doing.
                </p>
            </header>

            <div className="status-group">
                <div className="status-stats">
                    {statusItems.map((item) => (
                        <div key={item.key} className="status-item">
                            <span className={`swatch ${item.swatchClass}`} />
                            <span className={`type-stat ${item.numberClass}`}>
                                {item.count}
                            </span>
                            <span className="type-stat-label text-axis">{item.label}</span>
                        </div>
                    ))}
                </div>

                <ProgressBar className="status-bar">
                    {statusItems.map((item) => (
                        <ProgressBar
                            key={item.key}
                            now={total === 0 ? 0 : (item.count / total) * 100}
                            style={{ backgroundColor: item.barFill }}
                            aria-label={`${item.label}: ${item.count} of ${total} tickets`}
                        />
                    ))}
                </ProgressBar>
            </div>

            <div className="burnup">
                <div className="burnup-chart">
                    <svg
                        className="burnup-svg"
                        viewBox={`0 0 ${BURNUP_VIEW_WIDTH} ${BURNUP_VIEW_HEIGHT}`}
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient
                                id="burnup-gradient"
                                x1="10%"
                                y1="0%"
                                x2="70%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="var(--burnup-top)"
                                    stopOpacity="0.78"
                                />
                                <stop
                                    offset="10%"
                                    stopColor="var(--burnup-top)"
                                    stopOpacity="0.68"
                                />
                                <stop
                                    offset="45%"
                                    stopColor="var(--burnup-mid)"
                                    stopOpacity="0.52"
                                />
                                <stop
                                    offset="58%"
                                    stopColor="var(--burnup-mid)"
                                    stopOpacity="0.22"
                                />
                                <stop
                                    offset="82%"
                                    stopColor="var(--burnup-mid)"
                                    stopOpacity="0.07"
                                />
                                <stop
                                    offset="92%"
                                    stopColor="var(--surface-quiet)"
                                    stopOpacity="0.03"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="var(--surface-quiet)"
                                    stopOpacity="0"
                                />
                            </linearGradient>
                        </defs>
                        <line
                            className="burnup-ceiling-line"
                            x1="0"
                            y1={BURNUP_CEILING_Y}
                            x2={BURNUP_VIEW_WIDTH}
                            y2={BURNUP_CEILING_Y}
                            vectorEffect="non-scaling-stroke"
                        />
                        <path d={burnupArea} fill="url(#burnup-gradient)" />
                        <path
                            className="stroke-burnup burnup-line"
                            d={burnupLine}
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                    <span
                        className="type-caption text-subtle burnup-ceiling-label"
                        style={{ top: `${(1 - BURNUP_PLOT_SCALE) * 100}%` }}
                    >
                        100%
                    </span>
                </div>

                <div
                    className={`burnup-axis${todayOnLabeledDate ? " burnup-axis-today-on-label" : ""}`}
                >
                    <svg
                        className="burnup-axis-svg"
                        width="100%"
                        height="44"
                        aria-hidden="true"
                    >
                        <line className="burnup-axis-line" x1="0" y1="1" x2="100%" y2="1" />

                        {dayDots.map((day) => (
                            <circle
                                key={day}
                                className="burnup-day-dot"
                                cx={`${(day / phaseLength) * 100}%`}
                                cy="6"
                                r="2"
                            />
                        ))}

                        {majorMarkers.map((marker) => {
                            const x = `${(marker.day / phaseLength) * 100}%`;

                            return (
                                <g key={marker.day}>
                                    <line
                                        className="burnup-major-tick"
                                        x1={x}
                                        y1="0"
                                        x2={x}
                                        y2="12"
                                    />
                                    <text
                                        className="burnup-date type-date"
                                        x={x}
                                        y="29"
                                        textAnchor="middle"
                                    >
                                        {marker.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    <div
                        className={`burnup-today${todayOnLabeledDate ? " burnup-today-on-label" : ""}`}
                        style={{ left: `${todayPercent}%` }}
                    >
                        <svg
                            className="burnup-triangle"
                            viewBox="0 0 10 9"
                            aria-hidden="true"
                        >
                            <path d="M5 0 L10 9 H0 Z" />
                        </svg>
                        <span className="type-meta text-axis">You are here</span>
                    </div>
                </div>

                <div className="burnup-caption">
                    <span className="swatch fill-burnup-swatch" aria-hidden="true" />
                    <span className="type-caption text-muted">
                        Cumulative tickets completed
                    </span>
                </div>
            </div>
        </div>
    );
}
