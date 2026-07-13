import React from 'react';

interface KanbanListProps {
    name: string;
    children: React.ReactNode;
}

function KanbanList({ name, children }: KanbanListProps) {
    return (
        <div className="kanban-list">
            <div className="kanban-list-header">
                <h2 className="kanban-list-header-title">{name}</h2>
            </div>
            {children}
        </div>
    );
};

export default KanbanList;