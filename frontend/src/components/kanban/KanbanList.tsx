import React from "react";

interface KanbanListProps {
  name: string;
  count: number;
  children: React.ReactNode;
  className?: string;
  NewTicketButton?: React.ReactElement<
    React.ComponentPropsWithoutRef<"button">,
    "button"
  >;
}
<button></button>;
function KanbanList({
  name,
  count,
  children,
  className,
  NewTicketButton,
}: KanbanListProps) {
  return (
    <div className={`kanban-list ${className}`}>
      <div className="kanban-list-header">
        <h2 className="kanban-list-header-title">{name}</h2>
        <h3 className="kanban-list-header-subtitle">{count} items</h3>
      </div>
      <div className="kanban-list-container">{children}</div>
      <div className="mt-2 rounded-2">{NewTicketButton}</div>
    </div>
  );
}

export default KanbanList;
