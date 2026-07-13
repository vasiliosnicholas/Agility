import React from "react";
import KanbanList from "../components/kanban/KanbanList";
import Drag from "../components/kanban/Drag";
import type { DropPayload } from "../components/kanban/dragTypes";
import KanbanCard from "../components/kanban/KanbanCard.tsx";

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
    const [data] = React.useState(testData);

    function handleDrop({ dragItem, dragType, drop }: DropPayload) {
        console.log(dragItem, dragType, drop);
    };

    return (
        <Drag handleDrop={handleDrop}>
            {({ activeItem, activeType, isDragging }) => (
                <div className="kanban-container">
                    {data.map((list, listPos) => {
                        return (
                            <KanbanList key={list.id} name={list.name}>
                                {data[listPos].cards.map((card) => {
                                    return (
                                        <Drag.DragItem key={card.id} dragId={card.id} dragType="card"
                                            className={`cursor-pointer ${activeItem === card.id
                                                && activeType === "card" && isDragging ? "d-none" : "translate-x-0"}`}>
                                            <KanbanCard title={card.title} description={card.description}
                                                isBeingDragged={activeItem === card.id && activeType === "card"} />
                                        </Drag.DragItem>
                                    );
                                })}
                            </KanbanList>
                        )
                    })}
                </div>
            )}
        </Drag>
    );
}