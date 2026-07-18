export const TicketStatuses = {
  Backlog: "backlog",
  Todo: "todo",
  InProgress: "inProgress",
  Completed: "completed",
} as const;

export type TicketStatus = (typeof TicketStatuses)[keyof typeof TicketStatuses];
export type TicketCreationStatus =
  typeof TicketStatuses.Backlog | typeof TicketStatuses.Todo;

export interface CreateTicketRequest {
  title: string;
  description?: string;
  priority: TicketPriority;
  status: TicketCreationStatus;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface UpdateTicketErrorResponse {
  message: string;
}

export type TicketPriority = 0 | 1 | 2 | 3;

export interface TicketPrototype {
  title: string;
  description?: string;
  phaseId: string | null;
  assigneeId: string | null;
  status?: TicketStatus;
  priority?: TicketPriority;
  completedAt?: string | null;
}

export class Ticket {
  _id: string | undefined;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  phaseId: string | null;
  assigneeId: string | null;
  completedAt: string | null;

  constructor({
    title,
    description,
    phaseId,
    assigneeId,
    status = TicketStatuses.Todo,
    priority = 2,
    completedAt = null,
  }: TicketPrototype) {
    this._id = undefined;
    this.title = title;
    if (description !== undefined) this.description = description;
    this.status = status;
    this.priority = priority;
    this.phaseId = phaseId;
    this.assigneeId = assigneeId;
    this.completedAt = completedAt;
  }
}

export type StoredTicket = Ticket & { _id: string };
