import Badge from "react-bootstrap/Badge";

export interface PhaseListItemView {
    id: string;
    dateRange: string;
    duration: number;
    isActive: boolean;
}

interface PhaseSectionProps {
    id: string;
    title: string;
    phases: PhaseListItemView[];
    emptyMessage: string;
}

export default function PhaseSection({
    id,
    title,
    phases,
    emptyMessage,
}: PhaseSectionProps) {
    return (
        <section className="management-section" aria-labelledby={id}>
            <header className="management-section-header">
                <h2 id={id} className="management-section-title">
                    {title}
                </h2>
                <span className="management-section-count">
                    {phases.length} {phases.length === 1 ? "phase" : "phases"}
                </span>
            </header>
            <ul className="management-list">
                {phases.length === 0 ? (
                    <li className="management-list-empty">{emptyMessage}</li>
                ) : (
                    phases.map((phase) => (
                        <li key={phase.id} className="management-list-item">
                            <div className="management-list-content">
                                <span className="management-list-title">
                                    {phase.dateRange}
                                </span>
                                <span className="management-list-meta">
                                    {phase.duration}{" "}
                                    {phase.duration === 1 ? "day" : "days"}
                                </span>
                            </div>
                            {phase.isActive && (
                                <Badge
                                    pill
                                    bg="light"
                                    className="management-status-badge"
                                >
                                    Active
                                </Badge>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </section>
    );
}
