import React from "react";
import type { KanbanData } from "@shared/models/Kanban.ts";
import {
  TicketStatuses,
  type StoredTicket,
  type TicketCreationStatus,
  type TicketStatus,
  type UpdateTicketErrorResponse,
  type UpdateTicketStatusRequest,
} from "@shared/models/Tickets.ts";
import { AccountTypes } from "@shared/models/Users.ts";
import Drag from "../components/kanban/Drag";
import type { DropPayload } from "../components/kanban/dragTypes";
import PhaseTimeline from "../components/kanban/PhaseTimeline.tsx";
import AppNavbar from "../components/AppNavbar.tsx";
import NewTicketModal from "../components/kanban/NewTicketModal.tsx";
import KanbanGridColumn from "../components/kanban/KanbanGridColumn.tsx";
import type { ColElementRefObject } from "../hooks/useGridKeyboardControls.ts";
import { useImmer } from "use-immer";

export interface KanbanColumn {
  id: TicketStatus;
  name: string;
  className: string;
  cards: StoredTicket[];
}

const COLUMN_DEFINITIONS: Omit<KanbanColumn, "cards">[] = [
  {
    id: TicketStatuses.Backlog,
    name: "Backlog",
    className: "kanban-list-backlog",
  },
  {
    id: TicketStatuses.Todo,
    name: "To-Do",
    className: "kanban-list-to-do",
  },
  {
    id: TicketStatuses.InProgress,
    name: "In Progress",
    className: "kanban-list-in-progress",
  },
  {
    id: TicketStatuses.Completed,
    name: "Completed",
    className: "kanban-list-completed",
  },
];

function groupTickets(
  tickets: StoredTicket[],
  includeBacklog: boolean
): KanbanColumn[] {
  const definitions = includeBacklog
    ? COLUMN_DEFINITIONS
    : COLUMN_DEFINITIONS.filter(
        (column) => column.id !== TicketStatuses.Backlog
      );
  return definitions.map((column) => ({
    ...column,
    cards:
      column.id === TicketStatuses.Backlog
        ? tickets.filter(
            (ticket) =>
              ticket.assigneeId === null &&
              ticket.status !== TicketStatuses.Completed
          )
        : tickets.filter(
            (ticket) =>
              ticket.assigneeId !== null && ticket.status === column.id
          ),
  }));
}

export default function Kanban() {
  const [kanbanData, setKanbanData] = React.useState<KanbanData | null>(null);
  const [columns, setColumns] = React.useState<KanbanColumn[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [newTicketStatus, setNewTicketStatus] =
    React.useState<TicketCreationStatus>(TicketStatuses.Todo);
  const [showNewTicketModal, setShowNewTicketModal] = React.useState(false);
  const isUpdatingTicket = React.useRef(false);
  const [columnRefs, updateColumnRefs] = useImmer<
    (ColElementRefObject<HTMLDivElement> | undefined)[]
  >(new Array(columns.length));

  const loadKanban = React.useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/kanban", { signal });
      if (!response.ok) {
        throw new Error("Could not load your Kanban board.");
      }

      const loadedData = (await response.json()) as KanbanData;
      setKanbanData(loadedData);
      setColumns(
        groupTickets(
          loadedData.tickets,
          loadedData.user.accountType === AccountTypes.Manager
        )
      );
      setActionError(null);
      setError(null);
    } catch (loadError) {
      if (
        loadError instanceof DOMException &&
        loadError.name === "AbortError"
      ) {
        return;
      }
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your Kanban board."
      );
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadInitialKanban() {
      await loadKanban(controller.signal);
    }

    void loadInitialKanban();
    return () => controller.abort();
  }, [loadKanban]);

  React.useEffect(() => {
    if (actionError) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [actionError]);

  function openNewTicketModal(status: TicketCreationStatus) {
    setNewTicketStatus(status);
    setShowNewTicketModal(true);
  }

  function handleTicketCreated(ticket: StoredTicket) {
    if (!kanbanData) return;

    const updatedTickets = [...kanbanData.tickets, ticket];
    setKanbanData({ ...kanbanData, tickets: updatedTickets });
    setColumns(
      groupTickets(
        updatedTickets,
        kanbanData.user.accountType === AccountTypes.Manager
      )
    );
  }

  async function handleDeleteTicket(ticketId: string) {
    if (!kanbanData) return;
    if (!window.confirm("Delete this ticket? This cannot be undone.")) {
      return;
    }

    setActionError(null);
    try {
      const response = await fetch(`/api/kanban/tickets/${ticketId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setActionError("Could not delete this ticket.");
        return;
      }

      const updatedTickets = kanbanData.tickets.filter(
        (ticket) => ticket._id !== ticketId
      );
      setKanbanData({ ...kanbanData, tickets: updatedTickets });
      setColumns(
        groupTickets(
          updatedTickets,
          kanbanData.user.accountType === AccountTypes.Manager
        )
      );
    } catch {
      setActionError("Could not delete this ticket.");
    }
  }

  async function handleDrop(
    { dragItem, dragType, drop }: DropPayload,
    {
      updatedList = undefined,
      listPos = undefined,
    }: { updatedList?: KanbanColumn; listPos?: number } = {}
  ) {
    if (updatedList && listPos) columns[listPos] = updatedList;

    if (
      dragType === "card" &&
      drop !== null &&
      kanbanData &&
      !isUpdatingTicket.current
    ) {
      const [newListPos, newCardPos] = drop
        .toString()
        .split("-")
        .map((value) => parseInt(value));

      if (Number.isNaN(newListPos) || Number.isNaN(newCardPos)) {
        return;
      }

      let finalCardPos = newCardPos;
      let oldCardPos: number | undefined;
      const oldListPos = columns.findIndex((list) => {
        oldCardPos = list.cards.findIndex((card) => card._id === dragItem);
        return oldCardPos >= 0;
      });

      if (oldListPos < 0 || oldCardPos === undefined || oldCardPos < 0) {
        return;
      }

      if (newListPos < 0 || newListPos >= columns.length) {
        return;
      }

      const newColumns = structuredClone(columns);
      const card = columns[oldListPos].cards[oldCardPos];

      if (newListPos === oldListPos && oldCardPos < newCardPos) {
        finalCardPos--;
      }
      newColumns[oldListPos].cards.splice(oldCardPos, 1);
      if (newListPos === oldListPos) {
        newColumns[newListPos].cards.splice(finalCardPos, 0, card);
        setColumns(newColumns);
        return;
      }

      const destinationStatus = newColumns[newListPos].id;
      const updatedCard: StoredTicket = {
        ...card,
        status: destinationStatus,
        phaseId:
          destinationStatus === TicketStatuses.Backlog
            ? null
            : card.assigneeId === null
              ? (kanbanData.phase?._id ?? null)
              : card.phaseId,
        assigneeId:
          destinationStatus === TicketStatuses.Backlog
            ? null
            : card.assigneeId === null
              ? (kanbanData.user._id ?? null)
              : card.assigneeId,
        completedAt:
          destinationStatus === TicketStatuses.Completed
            ? new Date().toISOString()
            : null,
      };
      newColumns[newListPos].cards.splice(finalCardPos, 0, updatedCard);

      const previousColumns = columns;
      const previousKanbanData = kanbanData;
      const ticketsFromPreviousData = kanbanData.tickets.map((ticket) =>
        ticket._id === card._id ? updatedCard : ticket
      );

      setColumns(newColumns);
      setKanbanData({ ...kanbanData, tickets: ticketsFromPreviousData });
      setActionError(null);
      isUpdatingTicket.current = true;

      try {
        const request: UpdateTicketStatusRequest = {
          status: destinationStatus,
        };
        const response = await fetch(`/api/kanban/tickets/${card._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          let responseError: UpdateTicketErrorResponse | null = null;
          try {
            responseError =
              (await response.json()) as UpdateTicketErrorResponse;
          } catch {
            // The fallback below will handlw non-JSON server errors.
          }

          setColumns(previousColumns);
          setKanbanData(previousKanbanData);
          setActionError(
            responseError?.message ??
              "Could not update this ticket. Refresh the board before continuing."
          );
          return;
        }

        const savedTicket = (await response.json()) as StoredTicket;
        setColumns((currentColumns) =>
          currentColumns.map((column) => ({
            ...column,
            cards: column.cards.map((ticket) =>
              ticket._id === savedTicket._id ? savedTicket : ticket
            ),
          }))
        );
        setKanbanData((currentData) =>
          currentData
            ? {
                ...currentData,
                tickets: currentData.tickets.map((ticket) =>
                  ticket._id === savedTicket._id ? savedTicket : ticket
                ),
              }
            : currentData
        );
      } catch {
        setColumns(previousColumns);
        setKanbanData(previousKanbanData);
        setActionError(
          "Could not update this ticket. Refresh the board before continuing."
        );
      } finally {
        isUpdatingTicket.current = false;
      }
    }
  }

  if (error) {
    return (
      <div className="kanban-page">
        <main className="kanban-page-content">
          <p className="kanban-message" role="alert">
            {error}
          </p>
        </main>
      </div>
    );
  }

  if (!kanbanData) {
    return (
      <div className="kanban-page">
        <main className="kanban-page-content">
          <p className="kanban-message">Loading Tasks Page…</p>
        </main>
      </div>
    );
  }

  const assigneeNames = new Map<string, string>();
  for (const teamMember of kanbanData.teamMembers ?? []) {
    if (teamMember._id) {
      assigneeNames.set(teamMember._id, teamMember.name);
    }
  }

  return (
    <div className="kanban-page">
      <AppNavbar user={kanbanData.user} title="Tasks" />
      <main className="kanban-page-content">
        {actionError && (
          <div
            className="alert alert-warning d-flex align-items-center justify-content-between gap-3"
            role="alert"
          >
            <span>{actionError}</span>
            <button
              type="button"
              className="btn btn-sm btn-action-neutral flex-shrink-0"
              onClick={() => void loadKanban()}
            >
              Refresh board
            </button>
          </div>
        )}
        {kanbanData.phase ? (
          <PhaseTimeline
            user={kanbanData.user}
            phase={kanbanData.phase}
            tickets={kanbanData.tickets}
          />
        ) : (
          <p className="kanban-message">There is no active phase.</p>
        )}
        {(kanbanData.phase ||
          kanbanData.user.accountType === AccountTypes.Manager) && (
          <Drag handleDrop={(payload) => void handleDrop(payload)}>
            {({ activeItem, activeType, isDragging }) => (
              <div
                className={`kanban-container${
                  kanbanData.user.accountType === AccountTypes.Manager
                    ? " kanban-container-manager"
                    : ""
                }`}
              >
                {columns.map((list, listPos) => (
                  <KanbanGridColumn
                    key={listPos}
                    assigneeNames={assigneeNames}
                    list={list}
                    listPos={listPos}
                    kanbanData={kanbanData}
                    openNewTicketModal={openNewTicketModal}
                    activeItem={activeItem}
                    activeType={activeType}
                    isDragging={isDragging}
                    columns={columns}
                    handleDeleteTicket={handleDeleteTicket}
                    handleDrop={handleDrop}
                    setColumnRef={(colRef) => {
                      updateColumnRefs((draftColumnRefs) => {
                        // @ts-expect-error: Immer draft typing mismatch with React.RefObject
                        draftColumnRefs[listPos] = colRef;
                      });
                    }}
                    leftColumnRef={
                      listPos > 0 ? columnRefs[listPos - 1] : undefined
                    }
                    rightColumnRef={
                      listPos < columnRefs.length - 1
                        ? columnRefs[listPos + 1]
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </Drag>
        )}
        <NewTicketModal
          show={showNewTicketModal}
          status={newTicketStatus}
          onHide={() => setShowNewTicketModal(false)}
          onCreated={handleTicketCreated}
        />
      </main>
    </div>
  );
}
