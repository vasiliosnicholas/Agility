import React from 'react';

interface KanbanListProps {
    name: string;
    count: number;
    children: React.ReactNode;
    className?: string;
}

function KanbanList({ name, count, children, className }: KanbanListProps) {
    return (
        <div className={`kanban-list ${className}`}>
            <div className="kanban-list-header">
                <h2 className="kanban-list-header-title">{name}</h2>
                <h3 className="kanban-list-header-subtitle">{count} items</h3>
            </div>
            {children}
        </div>
    );
};

export default KanbanList;