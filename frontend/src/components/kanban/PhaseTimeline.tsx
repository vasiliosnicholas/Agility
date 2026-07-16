import ProgressBar from "react-bootstrap/ProgressBar";

const COUNTS = {
    todo: 17,
    inProgress: 25,
    completed: 20,
};

const TOTAL = COUNTS.todo + COUNTS.inProgress + COUNTS.completed;

const PHASE_LENGTH = 14;
const PHASE_START = new Date(2026, 6, 15);
const PHASE_END = addDays(PHASE_START, PHASE_LENGTH);

const TODAY = new Date(2026, 6, 29);

const CUMULATIVE_TICKETS_BY_DAY = [0, 0.8, 1.6, 2.4, 3.8, 5.2, 6.8, 8.6, 10.8, 12.6, 14.2, 15.8, 17.2, 18.6, 20];

function formatDayMonth(date: Date): string {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function dayIndex(date: Date, start: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((date.getTime() - start.getTime()) / msPerDay);
}

/* Width and height set here act like sandboxed co-ordinates on a graph which can be scaled by browser */
const BURNUP_VIEW_WIDTH = 100;
const BURNUP_VIEW_HEIGHT = 48;

/* limiting plot to under 90% of svg boundaries */
const BURNUP_PLOT_SCALE = 0.9;

const BURNUP_CEILING_Y = BURNUP_VIEW_HEIGHT * (1 - BURNUP_PLOT_SCALE);

function buildBurnupPaths(
    cumulativeTicketsByDay: number[],
    phaseDays: number,
    throughDay: number,
    width = BURNUP_VIEW_WIDTH,
    height = BURNUP_VIEW_HEIGHT,
) {
    const totalCompletedTickets = cumulativeTicketsByDay[cumulativeTicketsByDay.length - 1];
    const endDay = Math.min(throughDay, phaseDays, cumulativeTicketsByDay.length - 1);
    const points: { x: number; y: number }[] = [];
    for (let day = 0; day <= endDay; day++) {
        const x = (day / phaseDays) * width;
        /* Accomodate inverted y-axis (0,0 is top left) */
        const y = height - (cumulativeTicketsByDay[day] / totalCompletedTickets) * (height * BURNUP_PLOT_SCALE);
        points.push({ x, y });
    }

    if (points.length === 0) {
        return { line: "", area: "" };
    }

    /* SVG path syntax: M: move to, L: line to */
    const line = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(" ");
    const lastX = points[points.length - 1].x;
    /* Close the shape on right, bottom and left edges */
    const area = `${line} L ${lastX.toFixed(2)} ${height} L 0 ${height} Z`;
    return { line, area };
}

const TODAY_INDEX = Math.min(Math.max(dayIndex(TODAY, PHASE_START), 0), PHASE_LENGTH);
const TODAY_PERCENT = (TODAY_INDEX / PHASE_LENGTH) * 100;
const MID_DAY = Math.floor(PHASE_LENGTH / 2);

const MAJOR_MARKERS = [
    { day: 0, label: formatDayMonth(PHASE_START) },
    { day: MID_DAY, label: formatDayMonth(addDays(PHASE_START, MID_DAY)) },
    { day: PHASE_LENGTH, label: formatDayMonth(PHASE_END) },
];

const TODAY_ON_LABELED_DATE = MAJOR_MARKERS.some((marker) => marker.day === TODAY_INDEX);

const DAY_DOTS = Array.from({ length: PHASE_LENGTH - 1 }, (_, i) => i + 1).filter(
    (day) => day !== MID_DAY,
);

const { line: burnupLine, area: burnupArea } = buildBurnupPaths(
    CUMULATIVE_TICKETS_BY_DAY,
    PHASE_LENGTH,
    TODAY_INDEX,
);

/** TODO: Numbers from DB */
const statusItems = [
    {
        key: "todo",
        count: COUNTS.todo,
        label: "To-Do",
        swatchClass: "fill-todo",
        numberClass: "text-todo",
        barFill: "var(--status-todo-fill)",
        now: (COUNTS.todo / TOTAL) * 100,
    },
    {
        key: "inProgress",
        count: COUNTS.inProgress,
        label: "In Progress",
        swatchClass: "fill-progress",
        numberClass: "text-progress",
        barFill: "var(--status-progress-fill)",
        now: (COUNTS.inProgress / TOTAL) * 100,
    },
    {
        key: "completed",
        count: COUNTS.completed,
        label: "Completed",
        swatchClass: "fill-completed",
        numberClass: "text-completed",
        barFill: "var(--status-completed-fill)",
        now: (COUNTS.completed / TOTAL) * 100,
    },
];

export default function PhaseTimeline() {
    return (
        <div className="progress-timeline">
            <header className="progress-header">
                <h1 className="type-hero text-ink">Hi, User!</h1>
                <p className="type-body text-muted progress-subcopy">
                    Let's see how the team is doing.
                </p>
            </header>

            <div className="status-group">
                <div className="status-stats">
                    {statusItems.map((item) => (
                        <div key={item.key} className="status-item">
                            <span className={`swatch ${item.swatchClass}`} />
                            <span className={`type-stat ${item.numberClass}`}>{item.count}</span>
                            <span className="type-stat-label text-axis">{item.label}</span>
                        </div>
                    ))}
                </div>

                <ProgressBar className="status-bar">
                    {statusItems.map((item) => (
                        <ProgressBar
                            key={item.key}
                            now={item.now}
                            style={{ backgroundColor: item.barFill }}
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
                                <stop offset="0%" stopColor="var(--burnup-top)" stopOpacity="0.78" />
                                <stop offset="10%" stopColor="var(--burnup-top)" stopOpacity="0.68" />
                                <stop offset="45%" stopColor="var(--burnup-mid)" stopOpacity="0.52" />
                                <stop offset="58%" stopColor="var(--burnup-mid)" stopOpacity="0.22" />
                                <stop offset="82%" stopColor="var(--burnup-mid)" stopOpacity="0.07" />
                                <stop offset="92%" stopColor="var(--surface-quiet)" stopOpacity="0.03" />
                                <stop offset="100%" stopColor="var(--surface-quiet)" stopOpacity="0" />
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
                    className={`burnup-axis${TODAY_ON_LABELED_DATE ? " burnup-axis-today-on-label" : ""}`}
                >
                    <svg
                        className="burnup-axis-svg"
                        width="100%"
                        height="44"
                        aria-hidden="true"
                    >
                        <line className="burnup-axis-line" x1="0" y1="1" x2="100%" y2="1" />

                        {DAY_DOTS.map((day) => (
                            <circle
                                key={day}
                                className="burnup-day-dot"
                                cx={`${(day / PHASE_LENGTH) * 100}%`}
                                cy="6"
                                r="2"
                            />
                        ))}

                        {MAJOR_MARKERS.map((marker) => {
                            const x = `${(marker.day / PHASE_LENGTH) * 100}%`;

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
                                        className="burnup-date"
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
                        className={`burnup-today${TODAY_ON_LABELED_DATE ? " burnup-today-on-label" : ""}`}
                        style={{ left: `${TODAY_PERCENT}%` }}
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
                    <span className="type-caption text-muted">Cumulative tickets completed</span>
                </div>
            </div>
        </div>
    );
}
