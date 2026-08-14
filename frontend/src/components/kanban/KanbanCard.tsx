import Badge from "react-bootstrap/Badge";
import type {
  AssignPhaseTicketRequest,
  TicketPriority,
} from "@shared/models/Tickets.ts";
import { Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import type { UserMetaData } from "@shared/models/Users";
import AssignTicket from "./AssignTicket";
import { useCallback, useState } from "react";

interface CardProps extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> {
  title: string;
  description?: string;
  priority: TicketPriority;
  assigneeName?: string;
  assigneeId?: string | null;
  cardId: string;
  handleAssign?: (request: AssignPhaseTicketRequest) => Promise<boolean>;
  isBeingDragged?: boolean;
  onDelete?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  leftColName?: string;
  rightColName?: string;
  teamMembers?: UserMetaData[];
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
  assigneeId,
  handleAssign,
  cardId,
  isBeingDragged = false,
  onDelete,
  onMoveLeft,
  onMoveRight,
  leftColName,
  rightColName,
  teamMembers,
  ...props
}: CardProps) {
  const priorityBadge = PRIORITY_BADGES[priority];
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<
    UserMetaData["_id"] | null
  >(assigneeId);

  const handleChange = useCallback(
    async (event) => {
      const value = event.target.value;
      if (handleAssign && value) {
        const assigneeUpdated = await handleAssign({
          ticketId: cardId,
          assigneeId: value,
        });
        
        if (assigneeUpdated) setSelectedAssigneeId(value);
        else alert("Error updating ticket assignee");
      }
    },
    [cardId, handleAssign]
  ) as React.ChangeEventHandler<HTMLSelectElement, HTMLSelectElement>;

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
              <Tooltip {...props}>
                Move to {leftColName || "left column"}
              </Tooltip>
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
            <h3 className="card-title type-subtitle">{title}</h3>
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
              {assigneeName &&
                (teamMembers ? (
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 0, hide: 0 }}
                    overlay={(props) => (
                      <Tooltip {...props}>
                       {assigneeName ? `Reassign ticket from ${assigneeName}` : "Assign ticket to a user"}
                      </Tooltip>
                    )}
                  >
                    <Form
                      id="assign-ticket"
                      noValidate
                      className="modal-form w-100 "
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <AssignTicket
                        label="Ticket Assignee"
                        teamMembers={teamMembers}
                        value={selectedAssigneeId || undefined}
                        onChange={handleChange}
                        className="rounded-4 assignee-badge"
                        size="sm"
                      />
                    </Form>
                  </OverlayTrigger>
                ) : (
                  <Badge pill bg="light" className="assignee-badge">
                    Assigned to: {assigneeName}
                  </Badge>
                ))}
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
                <Tooltip {...props}>
                  Move to {rightColName || "right column"}
                </Tooltip>
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
