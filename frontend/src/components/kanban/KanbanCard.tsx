import Badge from "react-bootstrap/Badge";
import type { TicketPriority } from "@shared/models/Tickets.ts";

interface CardProps {
    title: string;
    description?: string;
    priority: TicketPriority;
    isBeingDragged?: boolean;
}

const PRIORITY_BADGES: Partial<
    Record<TicketPriority, { label: string; className: string }>
> = {
    0: { label: "Urgent", className: "priority-badge-urgent" },
    1: { label: "High Priority", className: "priority-badge-high" },
    3: { label: "Low Priority", className: "priority-badge-low" },
};

function Card({
    title,
    description,
    priority,
    isBeingDragged = false,
}: CardProps) {
    const priorityBadge = PRIORITY_BADGES[priority];

    return (
        <div className={`card${isBeingDragged ? " card-rotated" : ""}`}>
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                {description && <p className="card-description">{description}</p>}
                {priorityBadge && (
                    <Badge
                        pill
                        bg="light"
                        className={`priority-badge ${priorityBadge.className}`}
                    >
                        {priorityBadge.label}
                    </Badge>
                )}
            </div>
        </div>
    );
}

export default Card;