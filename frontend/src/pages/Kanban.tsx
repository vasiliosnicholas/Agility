import React from "react";
import KanbanList from "../components/kanban/KanbanList";
import Drag from "../components/kanban/Drag";
import type { DropPayload } from "../components/kanban/dragTypes";
import KanbanCard from "../components/kanban/KanbanCard.tsx";
import PhaseTimeline from "../components/kanban/PhaseTimeline.tsx";

const testData = [
    {
        id: 1, name: "In Progress", cards: [
            { id: 1, title: "Card 1", description: "Lorem" },
            { id: 2, title: "Card 2", description: "Ipsum" },
        ]
    },
    {
        id: 2, name: "Done", cards: [
            { id: 3, title: "Card 3", description: "Dolor" },
            { id: 4, title: "Card 4", description: "Sit" },
        ]
    }
]

export default function Kanban() {
    const [data, setData] = React.useState(testData);

    function handleDrop({ dragItem, dragType, drop }: DropPayload) {
        if (dragType === "card" && drop !== null) {
            const [newListPos, newCardPos] = drop.toString().split("-").map((string) => parseInt(string));

            if (Number.isNaN(newListPos) || Number.isNaN(newCardPos)) {
                return;
            }

            let finalCardPos: number = newCardPos;
            let oldCardPos: number | undefined;
            const oldListPos = data.findIndex((list) => {
                oldCardPos = list.cards.findIndex((card) => card.id === dragItem);
                return oldCardPos >= 0;
            });

            if (oldListPos < 0 || oldCardPos === undefined || oldCardPos < 0) {
                return;
            }

            const newData = structuredClone(data);
            const card = data[oldListPos].cards[oldCardPos];

            if (newListPos === oldListPos && oldCardPos < newCardPos) {
                finalCardPos--;
            }
            newData[oldListPos].cards.splice(oldCardPos, 1);
            newData[newListPos].cards.splice(finalCardPos, 0, card);
            setData(newData);
          }
    };

    return (
        <>
            <PhaseTimeline />
            <Drag handleDrop={handleDrop}>
                {({ activeItem, activeType, isDragging }) => (
                    <div className="kanban-container">
                        {data.map((list, listPos) => {
                            return (
                                <div key={list.id} className="kanban-column">
                                    <KanbanList name={list.name}>
                                        {data[listPos].cards.map((card, cardPos) => {
                                            return (
                                                <Drag.DropZone key={card.id} dropId={`${listPos}-${cardPos}`}
                                                    dropType="card" remember={true}>
                                                    <Drag.DropGuide dropId={`${listPos}-${cardPos}`} className="drop-guide" />
                                                    <Drag.DragItem dragId={card.id} dragType="card"
                                                        className={`cursor-pointer ${activeItem === card.id
                                                            && activeType === "card" && isDragging ? "d-none" : "translate-x-0"}`}>
                                                        <KanbanCard title={card.title} description={card.description}
                                                            isBeingDragged={activeItem === card.id && activeType === "card"} />
                                                    </Drag.DragItem>
                                                </Drag.DropZone>
                                            );
                                        })}
                                        <Drag.DropZone dropId={`${listPos}-${data[listPos].cards.length}`}
                                            dropType="card" remember={true} className="kanban-list-end-zone">
                                            <Drag.DropGuide dropId={`${listPos}-${data[listPos].cards.length}`} className="drop-guide" />
                                        </Drag.DropZone>
                                    </KanbanList>
                                    <Drag.DropZone dropId={`${listPos}-${data[listPos].cards.length}`} className="flex-grow-1"
                                        dropType="card" remember={true} />
                                </div>
                            )
                        })}
                    </div>
                )}
            </Drag>
        </>
    );
}