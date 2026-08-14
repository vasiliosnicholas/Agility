import React from "react";

interface KanbanListProps extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> {
  name: string;
  count: number;
  titleId: string;
  countId: string;
  children: React.ReactNode;
  className?: string;
  NewTicketButton?: React.ReactElement<
    React.ComponentPropsWithoutRef<"button">,
    "button"
  >;
}

function KanbanList({
  name,
  count,
  titleId,
  countId,
  children,
  className,
  NewTicketButton,
  ...props
}: KanbanListProps) {
  const countLabel = `${count} ${count === 1 ? "task" : "tasks"}`;

  return (
    <div className={`kanban-list ${className}`} {...props}>
      <div className="kanban-list-header">
        <h2 id={titleId} className="kanban-list-header-title type-subtitle">
          {name}
        </h2>
        <span id={countId} className="kanban-list-header-subtitle type-date">
          {countLabel}
        </span>
      </div>
      <div className="kanban-list-container">{children}</div>
      <div className="mt-2 rounded-2">{NewTicketButton}</div>
    </div>
  );
}

export default KanbanList;
