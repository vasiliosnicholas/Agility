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
import KanbanList from "../components/kanban/KanbanList";
import Drag from "../components/kanban/Drag";
import type { DropPayload } from "../components/kanban/dragTypes";
import KanbanCard from "../components/kanban/KanbanCard.tsx";
import PhaseTimeline from "../components/kanban/PhaseTimeline.tsx";
import AppNavbar from "../components/AppNavbar.tsx";
import NewTicketModal from "../components/kanban/NewTicketModal.tsx";
import Button from "react-bootstrap/Button";

interface KanbanColumn {
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
    includeBacklog: boolean,
): KanbanColumn[] {
    const definitions = includeBacklog
        ? COLUMN_DEFINITIONS
        : COLUMN_DEFINITIONS.filter(
            (column) => column.id !== TicketStatuses.Backlog,
        );
    return definitions.map((column) => ({
        ...column,
        cards:
            column.id === TicketStatuses.Backlog
                ? tickets.filter(
                    (ticket) =>
                        ticket.assigneeId === null &&
                        ticket.status !== TicketStatuses.Completed,
                )
                : tickets.filter(
                    (ticket) =>
                        ticket.assigneeId !== null &&
                        ticket.status === column.id,
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
                    loadedData.user.accountType === AccountTypes.Manager,
                ),
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
                    : "Could not load your Kanban board.",
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
                kanbanData.user.accountType === AccountTypes.Manager,
            ),
        );
    }

    async function handleDrop({ dragItem, dragType, drop }: DropPayload) {
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
                phaseId: destinationStatus === TicketStatuses.Backlog
                    ? null
                    : card.assigneeId === null
                      ? (kanbanData.phase?._id ?? null)
                      : card.phaseId,
                assigneeId: destinationStatus === TicketStatuses.Backlog
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
                ticket._id === card._id ? updatedCard : ticket,
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
                        "Could not update this ticket. Refresh the board before continuing.",
                    );
                    return;
                }

                const savedTicket = (await response.json()) as StoredTicket;
                setColumns((currentColumns) =>
                    currentColumns.map((column) => ({
                        ...column,
                        cards: column.cards.map((ticket) =>
                            ticket._id === savedTicket._id ? savedTicket : ticket,
                        ),
                    })),
                );
                setKanbanData((currentData) =>
                    currentData
                        ? {
                            ...currentData,
                            tickets: currentData.tickets.map((ticket) =>
                                ticket._id === savedTicket._id
                                    ? savedTicket
                                    : ticket,
                            ),
                        }
                        : currentData,
                );
            } catch {
                setColumns(previousColumns);
                setKanbanData(previousKanbanData);
                setActionError(
                    "Could not update this ticket. Refresh the board before continuing.",
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
                    <p className="kanban-message">Loading Kanban board…</p>
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
            <AppNavbar user={kanbanData.user} />
            <main className="kanban-page-content">
                {actionError && (
                    <div
                        className="alert alert-warning d-flex align-items-center justify-content-between gap-3"
                        role="alert"
                    >
                        <span>{actionError}</span>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-dark flex-shrink-0"
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
                {(kanbanData.phase || kanbanData.user.accountType === AccountTypes.Manager) && (
                    <Drag handleDrop={(payload) => void handleDrop(payload)}>
                            {({ activeItem, activeType, isDragging }) => (
                                <div
                                    className={`kanban-container${kanbanData.user.accountType === AccountTypes.Manager
                                        ? " kanban-container-manager" : ""}`}
                                >
                                    {columns.map((list, listPos) => (
                                        <div key={list.id} className="kanban-column">
                                            <KanbanList
                                                name={list.name}
                                                count={list.cards.length}
                                                className={list.className}
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
                                                            className={`cursor-pointer ${activeItem === card._id &&
                                                                activeType === "card" &&
                                                                isDragging
                                                                ? "d-none"
                                                                : "translate-x-0"
                                                                }`}
                                                        >
                                                            <KanbanCard
                                                                title={card.title}
                                                                description={card.description}
                                                                priority={card.priority}
                                                                assigneeName={
                                                                    card.assigneeId
                                                                        ? assigneeNames.get(
                                                                            card.assigneeId,
                                                                        )
                                                                        : undefined
                                                                }
                                                                isBeingDragged={
                                                                    activeItem === card._id &&
                                                                    activeType === "card"
                                                                }
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
                                                {((list.id === TicketStatuses.Todo &&
                                                    kanbanData.phase) ||
                                                    list.id ===
                                                        TicketStatuses.Backlog) && (
                                                    <Button
                                                        type="button"
                                                        variant="light"
                                                        className="new-ticket-button"
                                                        aria-label={`Create a new ticket in ${list.name}`}
                                                        onClick={() =>
                                                            openNewTicketModal(
                                                                list.id ===
                                                                    TicketStatuses.Backlog
                                                                    ? TicketStatuses.Backlog
                                                                    : TicketStatuses.Todo,
                                                            )
                                                        }
                                                    >
                                                        <span aria-hidden="true">
                                                            +
                                                        </span>{" "}
                                                        New Ticket
                                                    </Button>
                                                )}
                                            </KanbanList>
                                            <Drag.DropZone
                                                dropId={`${listPos}-${list.cards.length}`}
                                                className="flex-grow-1"
                                                dropType="card"
                                                remember={true}
                                            />
                                        </div>
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
