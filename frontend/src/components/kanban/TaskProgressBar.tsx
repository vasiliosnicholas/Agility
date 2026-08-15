import { TicketStatuses, type StoredTicket } from "@shared/models/Tickets";
import { ProgressBar } from "react-bootstrap";

interface TaskProgressBarProps extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> {
  phaseTickets: StoredTicket[];
  total: number;
}

export type TaskProgressBarType = React.FC<TaskProgressBarProps>;

const TaskProgressBar: TaskProgressBarType = ({
  phaseTickets,
  total,
  className,
  ...props
}) => {
  const counts = {
    todo: phaseTickets.filter((ticket) => ticket.status === TicketStatuses.Todo)
      .length,
    inProgress: phaseTickets.filter(
      (ticket) => ticket.status === TicketStatuses.InProgress
    ).length,
    completed: phaseTickets.filter(
      (ticket) => ticket.status === TicketStatuses.Completed
    ).length,
  };
  const statusItems = [
    {
      key: "todo",
      count: counts.todo,
      label: "To-Do",
      swatchClass: "fill-todo",
      numberClass: "text-todo",
      barFill: "var(--status-todo-fill)",
    },
    {
      key: "inProgress",
      count: counts.inProgress,
      label: "In Progress",
      swatchClass: "fill-progress",
      numberClass: "text-progress",
      barFill: "var(--status-progress-fill)",
    },
    {
      key: "completed",
      count: counts.completed,
      label: "Completed",
      swatchClass: "fill-completed",
      numberClass: "text-completed",
      barFill: "var(--status-completed-fill)",
    },
  ];
  return (
    <div {...props} className={`status-group ${className}`}>
      <div className="status-stats">
        {statusItems.map((item) => (
          <div key={item.key} className="status-item">
            <span className={`swatch ${item.swatchClass}`} />
            <span className={`type-stat ${item.numberClass}`}>
              {item.count}
            </span>
            <span className="type-stat-label text-axis">{item.label}</span>
          </div>
        ))}
      </div>

      <ProgressBar className="status-bar">
        {statusItems.map((item) => (
          <ProgressBar
            key={item.key}
            now={total === 0 ? 0 : (item.count / total) * 100}
            style={{ backgroundColor: item.barFill }}
            aria-label={`${item.label}: ${item.count} of ${total} tickets`}
          />
        ))}
      </ProgressBar>
    </div>
  );
};

export default TaskProgressBar;
