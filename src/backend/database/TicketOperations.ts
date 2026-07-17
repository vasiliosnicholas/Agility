import { ObjectId } from "mongodb";
import {
  TicketStatuses,
  type StoredTicket,
  type TicketStatus,
} from "../../shared/models/Tickets.ts";
import { convertToTicket, getTicketsCollection } from "./Database.ts";

export async function getTicketsForPhaseAndAssignee(
  phaseId: string,
  assigneeId: string
): Promise<StoredTicket[]> {
  const ticketDocuments = await (
    await getTicketsCollection()
  )
    .find({
      phaseId: new ObjectId(phaseId),
      assigneeId: new ObjectId(assigneeId),
    })
    .sort({ priority: 1, title: 1 })
    .toArray();

  return ticketDocuments.map(convertToTicket);
}

export async function updateTicketStatusForAssignee(
  ticketId: string,
  assigneeId: string,
  status: TicketStatus
): Promise<StoredTicket | null> {
  const tickets = await getTicketsCollection();
  const updatedTicket = await tickets.findOneAndUpdate(
    {
      _id: new ObjectId(ticketId),
      assigneeId: new ObjectId(assigneeId),
    },
    {
      $set: {
        status,
        completedAt: status === TicketStatuses.Completed ? new Date() : null,
      },
    },
    { returnDocument: "after" }
  );

  return updatedTicket ? convertToTicket(updatedTicket) : null;
}
