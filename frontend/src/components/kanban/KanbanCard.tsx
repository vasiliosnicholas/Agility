import Badge from "react-bootstrap/Badge";
import type { TicketPriority } from "@shared/models/Tickets.ts";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";

interface CardProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  title: string;
  description?: string;
  priority: TicketPriority;
  assigneeName?: string;
  isBeingDragged?: boolean;
  onDelete?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  leftColName?: string;
  rightColName?: string;
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
  leftColName,
  rightColName,
  ...props
}: CardProps) {
  const priorityBadge = PRIORITY_BADGES[priority];

  return (
    <div className={`card${isBeingDragged ? " card-rotated" : ""}`}>
      <div
        className="card-body rounded-2 parent-with-actions justify-content-between"
        tabIndex={0}
        {...props}
      >
        {onMoveLeft && (
          <OverlayTrigger
            placement="right"
            delay={{ show: 0, hide: 0 }}
            overlay={(props) => (
              <Tooltip {...props}>Move to {leftColName || "left column"}</Tooltip>
            )}
          >
            <Button
              type="button"
              className="hover-actions p-0 pe-1 m-0 align-items-center"
              variant="outline-light"
              aria-label={`Move to ${leftColName || "left column"}`}
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
        <div className="d-flex flex-column align-content-start">
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
                className="card-delete hover-actions position-absolute ps-1"
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
          {onMoveRight && (
            <OverlayTrigger
              placement="left"
              delay={{ show: 0, hide: 0 }}
              overlay={(props) => (
                <Tooltip {...props}>Move to {rightColName || "right column"}</Tooltip>
              )}
            >
              <Button
                type="button"
                className="hover-actions p-0 ps-1 m-0 align-items-center h-100"
                variant="outline-light"
                aria-label={`Move to ${rightColName || "right column"}`}
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
    </div>
  );
}

export default Card;
