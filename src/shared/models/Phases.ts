import type { StoredTicket } from "./Tickets.ts";
import type { UserMetaData } from "./Users.ts";

export const PhaseStatuses = {
  Active: "active",
  Planned: "planned",
  Completed: "completed",
} as const;

export type PhaseStatus = (typeof PhaseStatuses)[keyof typeof PhaseStatuses];

export interface PhasePrototype {
  startsAt: string;
  duration: number;
  status?: PhaseStatus;
}

export class Phase {
  _id: string | undefined;
  startsAt: string;
  duration: number;
  status: PhaseStatus;

  constructor({
    startsAt,
    duration,
    status = PhaseStatuses.Planned,
  }: PhasePrototype) {
    this._id = undefined;
    this.startsAt = startsAt;
    this.duration = duration;
    this.status = status;
  }
}

export type StoredPhase = Phase & { _id: string };

export interface PhaseListResponse {
  phases: StoredPhase[];
  currentPhaseId: string | null;
}

/** Aggregated payload for the Plan Phases manage-tickets modal (KanbanData-style). */
export interface PhaseTicketsManageData {
  tickets: StoredTicket[];
  backlogTickets: StoredTicket[];
  teamMembers: UserMetaData[];
}

export interface CreatePhaseRequest {
  startsAt: string;
  duration: number;
}

export interface DeletePhaseRequest {
  confirmMoveTicketsToBacklog?: boolean;
}

export interface DeletePhaseErrorResponse {
  message: string;
  ticketCount?: number;
  requiresConfirmation?: boolean;
}
