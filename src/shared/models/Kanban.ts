import type { User, UserMetaData } from "./Users.ts";
import type { StoredPhase } from "./Phases.ts";
import type { StoredTicket } from "./Tickets.ts";

export interface KanbanData {
  user: User;
  phase: StoredPhase | null;
  tickets: StoredTicket[];
  teamMembers?: UserMetaData[];
}
