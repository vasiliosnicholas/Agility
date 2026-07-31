import Badge from "react-bootstrap/Badge";
import type { TicketPriority } from "@shared/models/Tickets.ts";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface CardProps {
  title: string;
  description?: string;
  priority: TicketPriority;
  assigneeName?: string;
  isBeingDragged?: boolean;
  onDelete?: () => void;
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
  assigneeName,
  isBeingDragged = false,
  onDelete,
}: CardProps) {
  const priorityBadge = PRIORITY_BADGES[priority];

  return (
    <div className={`card${isBeingDragged ? " card-rotated" : ""}`}>
      <div className="card-body parent-with-actions" tabIndex={0}>
        <div className="card-header-row">
          <h5 className="card-title">{title}</h5>
          {onDelete && (
            <OverlayTrigger
              placement="left"
              delay={{ show: 0, hide: 0 }}
              overlay={(props) => (
                <Tooltip {...props}>Delete this ticket</Tooltip>
              )}
            >
              <button
                type="button"
                className="card-delete hover-actions"
                aria-label={`Delete ${title}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                ×
              </button>
            </OverlayTrigger>
          )}
        </div>
        {description && <p className="card-description">{description}</p>}
        {(priorityBadge || assigneeName) && (
          <div className="card-badges">
            {priorityBadge && (
              <Badge
                pill
                bg="light"
                className={`priority-badge ${priorityBadge.className}`}
              >
                {priorityBadge.label}
              </Badge>
            )}
            {assigneeName && (
              <Badge pill bg="light" className="assignee-badge">
                Assigned to: {assigneeName}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
