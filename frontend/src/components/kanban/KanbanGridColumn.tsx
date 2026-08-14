import { Button } from "react-bootstrap";
import type { KanbanData } from "@shared/models/Kanban.ts";
import {
  TicketStatuses,
  type AssignPhaseTicketRequest,
  type TicketCreationStatus,
} from "@shared/models/Tickets";
import {
  AccountTypes,
  type User,
  type UserMetaData,
} from "@shared/models/Users";
import Drag from "./Drag";
import KanbanCard from "./KanbanCard";
import type { KanbanColumn } from "../../pages/Kanban";
import type { DragRenderProps, DropPayload } from "./dragTypes";
import KanbanList from "./KanbanList";
import useGridKeyboardControls, {
  type AdjacentColumnRefObjectProps,
} from "../../hooks/useGridKeyboardControls";
import { useCallback, useEffect, useState } from "react";

interface KanbanGridColumnProps
  extends DragRenderProps, AdjacentColumnRefObjectProps<HTMLDivElement> {
  assigneeNames: Map<string, string>;
  columns: KanbanColumn[];
  list: KanbanColumn;
  listPos: number;
  kanbanData: KanbanData;
  openNewTicketModal: (status: TicketCreationStatus) => void;
  handleDeleteTicket: (ticketId: string) => Promise<void>;
  handleDrop: ({ dragItem, dragType, drop }: DropPayload) => Promise<void>;
}

export default function KanbanGridColumn({
  activeItem,
  activeType,
  isDragging,
  assigneeNames,
  columns,
  list,
  listPos,
  kanbanData,
  openNewTicketModal,
  handleDeleteTicket,
  handleDrop,
  leftColumnRef,
  rightColumnRef,
  setColumnRef,
}: KanbanGridColumnProps) {
  const [handleRow, colProps] = useGridKeyboardControls<
    HTMLDivElement,
    HTMLDivElement
  >({
    leftColumnRef,
    rightColumnRef,
    setColumnRef,
  });
  const titleId = `kanban-column-${list.id}-title`;
  const countId = `kanban-column-${list.id}-count`;
  const [teamMembers, setTeamMembers] = useState<UserMetaData[]>();
  const handleSetTeamMembers = useCallback(async () => {
    if (kanbanData.user.accountType === AccountTypes.Manager) {
      const response = await fetch("/api/developers?assigned=true");
      const fetchedTeamMembers = response.ok
        ? ((await response.json()) as User[])
        : [];
      setTeamMembers([kanbanData.user, ...fetchedTeamMembers]);
    }
  }, [setTeamMembers, kanbanData.user]);

  useEffect(() => void handleSetTeamMembers(), [handleSetTeamMembers]);

  return (
    <div
      key={list.id}
      className="kanban-column"
      {...colProps}
      aria-labelledby={titleId}
      aria-describedby={countId}
    >
      <KanbanList
        name={list.name}
        count={list.cards.length}
        titleId={titleId}
        countId={countId}
        className={list.className}
        NewTicketButton={
          (list.id === TicketStatuses.Todo && kanbanData.phase) ||
          list.id === TicketStatuses.Backlog ? (
            <Button
              type="button"
              className="new-ticket-button"
              aria-label={`Create a new ticket in ${list.name}`}
              onClick={() =>
                openNewTicketModal(
                  list.id === TicketStatuses.Backlog
                    ? TicketStatuses.Backlog
                    : TicketStatuses.Todo
                )
              }
            >
              <span aria-hidden="true">+</span> New Ticket
            </Button>
          ) : undefined
        }
      >
        {list.cards.map((card, cardPos) => (
          <Drag.DropZone
            key={card._id}
            dropId={`${listPos}-${cardPos}`}
            dropType="card"
            remember={true}
          >
            <Drag.DropGuide
              dropId={`${listPos}-${cardPos}`}
              className="drop-guide"
            />
            <Drag.DragItem
              dragId={card._id}
              dragType="card"
              className={`cursor-pointer ${
                activeItem === card._id && activeType === "card" && isDragging
                  ? "d-none"
                  : "translate-x-0"
              }`}
            >
              <KanbanCard
                title={card.title}
                description={card.description}
                priority={card.priority}
                cardId={card._id}
                assigneeName={
                  card.assigneeId
                    ? assigneeNames.get(card.assigneeId)
                    : undefined
                }
                assigneeId={card.assigneeId}
                isBeingDragged={
                  activeItem === card._id && activeType === "card"
                }
                onDelete={
                  kanbanData.user.accountType === AccountTypes.Manager
                    ? () => void handleDeleteTicket(card._id)
                    : undefined
                }
                onMoveLeft={
                  listPos > 0
                    ? () =>
                        void handleDrop({
                          dragItem: card._id,
                          dragType: "card",
                          drop: `${listPos - 1}-${cardPos}`,
                        })
                    : undefined
                }
                onMoveRight={
                  listPos < columns.length - 1
                    ? () =>
                        void handleDrop({
                          dragItem: card._id,
                          dragType: "card",
                          drop: `${listPos + 1}-${cardPos}`,
                        })
                    : undefined
                }
                leftColName={
                  listPos > 0 ? columns[listPos - 1].name : undefined
                }
                rightColName={
                  listPos < columns.length - 1
                    ? columns[listPos + 1].name
                    : undefined
                }
                teamMembers={list.name !== "Completed" ? teamMembers : undefined}
                handleAssign={list.name !== "Completed" ? async (request: AssignPhaseTicketRequest) => {
                  const response = await fetch(
                    `/api/kanban/ticket/${request.ticketId}`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(request),
                    }
                  );
                  if (response.ok)
                    void handleDrop({
                      dragItem: card._id,
                      dragType: "card",
                      drop: `${request.assigneeId ? 1 : 0}-${cardPos}`,
                    });
                  return response.ok;
                }: undefined}
                {...handleRow(cardPos)}
              />
            </Drag.DragItem>
          </Drag.DropZone>
        ))}
        <Drag.DropZone
          dropId={`${listPos}-${list.cards.length}`}
          dropType="card"
          remember={true}
          className="kanban-list-end-zone"
        >
          <Drag.DropGuide
            dropId={`${listPos}-${list.cards.length}`}
            className="drop-guide"
          />
        </Drag.DropZone>
      </KanbanList>
      <Drag.DropZone
        dropId={`${listPos}-${list.cards.length}`}
        className="flex-grow-1"
        dropType="card"
        remember={true}
      />
    </div>
  );
}
