import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

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
    onAddPhase?: () => void;
    onDeletePhase?: (phaseId: string) => void;
    onManageTickets?: (phaseId: string) => void;
}

export default function PhaseSection({
    id,
    title,
    phases,
    emptyMessage,
    onAddPhase,
    onDeletePhase,
    onManageTickets,
}: PhaseSectionProps) {
    return (
        <section className="management-section" aria-labelledby={id}>
            <header className="management-section-header">
                <div className="management-section-heading">
                    <h2 id={id} className="management-section-title type-section">
                        {title}
                    </h2>
                    <span className="management-section-count">
                        {phases.length}{" "}
                        {phases.length === 1 ? "phase" : "phases"}
                    </span>
                </div>
                {onAddPhase && (
                    <Button
                        type="button"
                        size="sm"
                        className="management-add-button"
                        onClick={onAddPhase}
                    >
                        Add New Phase
                    </Button>
                )}
            </header>
            <ul className="management-list">
                {phases.length === 0 ? (
                    <li className="management-list-empty">{emptyMessage}</li>
                ) : (
                    phases.map((phase) => (
                        <li key={phase.id} className="management-list-item" tabIndex={0}>
                            <div className="management-list-content">
                                <span className="management-list-title">
                                    {phase.dateRange}
                                </span>
                                <span className="management-list-meta">
                                    {phase.duration}{" "}
                                    {phase.duration === 1 ? "day" : "days"}
                                </span>
                            </div>
                            <div className="management-list-actions">
                                {phase.isActive && (
                                    <Badge
                                        pill
                                        bg="light"
                                        className="management-status-badge"
                                    >
                                        Active
                                    </Badge>
                                )}
                                {onManageTickets && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="management-add-button"
                                        onClick={() =>
                                            onManageTickets(phase.id)
                                        }
                                    >
                                        Manage tickets
                                    </Button>
                                )}
                                {onDeletePhase && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="management-delete-button"
                                        aria-label={`Delete phase ${phase.dateRange}`}
                                        onClick={() => onDeletePhase(phase.id)}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </section>
    );
}
