import React from "react";
import type { KanbanData } from "@shared/models/Kanban.ts";
import { TicketStatuses, type StoredTicket, type TicketStatus} from "@shared/models/Tickets.ts";
import KanbanList from "../components/kanban/KanbanList";
import Drag from "../components/kanban/Drag";
import type { DropPayload } from "../components/kanban/dragTypes";
import KanbanCard from "../components/kanban/KanbanCard.tsx";
import PhaseTimeline from "../components/kanban/PhaseTimeline.tsx";
import AppNavbar from "../components/AppNavbar.tsx";

interface KanbanColumn {
    id: TicketStatus;
    name: string;
    className: string;
    cards: StoredTicket[];
}

const COLUMN_DEFINITIONS: Omit<KanbanColumn, "cards">[] = [
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

function groupTickets(tickets: StoredTicket[]): KanbanColumn[] {
    return COLUMN_DEFINITIONS.map((column) => ({
        ...column,
        cards: tickets.filter((ticket) => ticket.status === column.id),
    }));
}

export default function Kanban() {
    const [kanbanData, setKanbanData] = React.useState<KanbanData | null>(null);
    const [columns, setColumns] = React.useState<KanbanColumn[]>([]);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const controller = new AbortController();

        async function loadKanban() {
            try {
                const response = await fetch("/api/kanban", {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error("Could not load your Kanban board.");
                }

                const loadedData = (await response.json()) as KanbanData;
                setKanbanData(loadedData);
                setColumns(groupTickets(loadedData.tickets));
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
        }

        void loadKanban();
        return () => controller.abort();
    }, []);

    function handleDrop({ dragItem, dragType, drop }: DropPayload) {
        if (dragType === "card" && drop !== null) {
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

            const newColumns = structuredClone(columns);
            const card = columns[oldListPos].cards[oldCardPos];

            if (newListPos === oldListPos && oldCardPos < newCardPos) {
                finalCardPos--;
            }
            newColumns[oldListPos].cards.splice(oldCardPos, 1);
            newColumns[newListPos].cards.splice(finalCardPos, 0, card);
            setColumns(newColumns);
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

    return (
        <div className="kanban-page">
            <AppNavbar user={kanbanData.user} />
            <main className="kanban-page-content">
                {kanbanData.phase ? (
                    <>
                        <PhaseTimeline
                            user={kanbanData.user}
                            phase={kanbanData.phase}
                            tickets={kanbanData.tickets}
                        />
                        <Drag handleDrop={handleDrop}>
                            {({ activeItem, activeType, isDragging }) => (
                                <div className="kanban-container">
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
                    </>
                ) : (
                    <p className="kanban-message">There is no active phase.</p>
                )}
            </main>
        </div>
    );
}
