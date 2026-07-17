import { ObjectId } from "mongodb";
import type { StoredTicket } from "../../shared/models/Tickets.ts";
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
