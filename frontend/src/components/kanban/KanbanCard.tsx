import Badge from "react-bootstrap/Badge";
import type { TicketPriority } from "@shared/models/Tickets.ts";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";

interface CardProps {
  title: string;
  description?: string;
  priority: TicketPriority;
  assigneeName?: string;
  isBeingDragged?: boolean;
  onDelete?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
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
  onMoveLeft,
  onMoveRight,
}: CardProps) {
  const priorityBadge = PRIORITY_BADGES[priority];

  return (
    <div className={`card${isBeingDragged ? " card-rotated" : ""}`}>
      <div className="card-body parent-with-actions justify-content-between" tabIndex={0}>
        {onMoveLeft && (
          <OverlayTrigger
            placement="auto"
            delay={{ show: 0, hide: 0 }}
            overlay={(props) => (
              <Tooltip {...props}>Move to left column</Tooltip>
            )}
          >
            <Button
              type="button"
              className="hover-actions p-0 pe-1 m-0 align-items-center"
              variant="light"
              aria-label={`Move to left column`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onMoveLeft();
              }}
            >
              <CaretLeftFill color="grey" />
            </Button>
          </OverlayTrigger>
        )}
        <div>
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
        {onMoveRight && (
          <OverlayTrigger
            placement="auto"
            delay={{ show: 0, hide: 0 }}
            overlay={(props) => (
              <Tooltip {...props}>Move to right column</Tooltip>
            )}
          >
            <Button
              type="button"
              className="hover-actions p-0 ps-1 m-0 align-items-center"
              variant="light"
              aria-label={`Move to right column`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onMoveRight();
              }}
            >
              <CaretRightFill color="grey" />
            </Button>
          </OverlayTrigger>
        )}
      </div>
    </div>
  );
}

export default Card;
