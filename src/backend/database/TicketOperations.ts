import { ObjectId } from "mongodb";
import {
  TicketStatuses,
  type CreateTicketRequest,
  type StoredTicket,
  type TicketStatus,
} from "../../shared/models/Tickets.ts";
import {
  convertToTicket,
  getTicketsCollection,
  type TicketDocument,
} from "./Database.ts";
import { getUserById } from "./UserOperations.ts";
import type { Developer, Manager } from "../../shared/models/Users.ts";

interface CreateTicketOptions extends CreateTicketRequest {
  phaseId: string | null;
  assigneeId: string | null;
}

export async function createTicket({
  title,
  description,
  priority,
  status,
  phaseId,
  assigneeId,
}: CreateTicketOptions): Promise<StoredTicket> {
  const ticketDocument: TicketDocument = {
    _id: new ObjectId(),
    title,
    ...(description ? { description } : {}),
    priority,
    status,
    phaseId: phaseId ? new ObjectId(phaseId) : null,
    assigneeId: assigneeId ? new ObjectId(assigneeId) : null,
    completedAt: null,
  };

  await (await getTicketsCollection()).insertOne(ticketDocument);
  return convertToTicket(ticketDocument);
}

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

export async function getTicketsForManager(
  phaseId: string | null,
  teamAssigneeIds: string[]
): Promise<StoredTicket[]> {
  const backlogFilter = {
    assigneeId: null,
    status: { $ne: TicketStatuses.Completed },
  };
  const filter = phaseId
    ? {
        $or: [
          backlogFilter,
          {
            phaseId: new ObjectId(phaseId),
            assigneeId: {
              $in: teamAssigneeIds.map((id) => new ObjectId(id)),
            },
          },
        ],
      }
    : backlogFilter;
  const ticketDocuments = await (
    await getTicketsCollection()
  )
    .find(filter)
    .sort({ priority: 1, title: 1 })
    .toArray();

  return ticketDocuments.map(convertToTicket);
}

export async function updateTicketStatusForAssignee(
  ticketId: string,
  phaseId: string,
  assigneeId: string,
  status: TicketStatus
): Promise<StoredTicket | null> {
  const tickets = await getTicketsCollection();
  const updatedTicket = await tickets.findOneAndUpdate(
    {
      _id: new ObjectId(ticketId),
      phaseId: new ObjectId(phaseId),
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

export async function updateTicketStatusForManager(
  ticketId: string,
  phaseId: string,
  teamAssigneeIds: string[],
  claimAssigneeId: string,
  status: TicketStatus
): Promise<StoredTicket | null> {
  const tickets = await getTicketsCollection();
  const ticketObjectId = new ObjectId(ticketId);
  const phaseObjectId = new ObjectId(phaseId);
  const teamObjectIds = teamAssigneeIds.map((id) => new ObjectId(id));

  if (status === TicketStatuses.Backlog) {
    const movedToBacklog = await tickets.findOneAndUpdate(
      {
        _id: ticketObjectId,
        phaseId: phaseObjectId,
        assigneeId: { $in: teamObjectIds },
      },
      {
        $set: {
          status,
          phaseId: null,
          assigneeId: null,
          completedAt: null,
        },
      },
      { returnDocument: "after" }
    );
    return movedToBacklog ? convertToTicket(movedToBacklog) : null;
  }

  const updatedTeamTicket = await tickets.findOneAndUpdate(
    {
      _id: ticketObjectId,
      phaseId: phaseObjectId,
      assigneeId: { $in: teamObjectIds },
    },
    {
      $set: {
        status,
        completedAt: status === TicketStatuses.Completed ? new Date() : null,
      },
    },
    { returnDocument: "after" }
  );
  if (updatedTeamTicket) {
    return convertToTicket(updatedTeamTicket);
  }

  const claimedBacklogTicket = await tickets.findOneAndUpdate(
    {
      _id: ticketObjectId,
      assigneeId: null,
      status: { $ne: TicketStatuses.Completed },
    },
    {
      $set: {
        status,
        phaseId: phaseObjectId,
        assigneeId: new ObjectId(claimAssigneeId),
        completedAt: status === TicketStatuses.Completed ? new Date() : null,
      },
    },
    { returnDocument: "after" }
  );

  return claimedBacklogTicket ? convertToTicket(claimedBacklogTicket) : null;
}

export async function countTicketsForPhase(phaseId: string): Promise<number> {
  return (await getTicketsCollection()).countDocuments({
    phaseId: new ObjectId(phaseId),
  });
}

export async function getBacklogTickets(): Promise<StoredTicket[]> {
  const ticketDocuments = await (
    await getTicketsCollection()
  )
    .find({
      assigneeId: null,
      status: { $ne: TicketStatuses.Completed },
    })
    .sort({ priority: 1, title: 1 })
    .toArray();

  return ticketDocuments.map(convertToTicket);
}

export async function getTicketsForPhase(
  phaseId: string
): Promise<StoredTicket[]> {
  const ticketDocuments = await (
    await getTicketsCollection()
  )
    .find({ phaseId: new ObjectId(phaseId) })
    .sort({ priority: 1, title: 1 })
    .toArray();

  return ticketDocuments.map(convertToTicket);
}

export async function assignBacklogTicketToPhase(
  ticketId: string,
  phaseId: string,
  assigneeId: string
): Promise<StoredTicket | null> {
  const updatedTicket = await (
    await getTicketsCollection()
  ).findOneAndUpdate(
    {
      _id: new ObjectId(ticketId),
      assigneeId: null,
      status: { $ne: TicketStatuses.Completed },
    },
    {
      $set: {
        status: TicketStatuses.Todo,
        phaseId: new ObjectId(phaseId),
        assigneeId: new ObjectId(assigneeId),
        completedAt: null,
      },
    },
    { returnDocument: "after" }
  );

  return updatedTicket ? convertToTicket(updatedTicket) : null;
}

export async function moveTicketToBacklogFromPhase(
  ticketId: string,
  phaseId: string
): Promise<StoredTicket | null> {
  const updatedTicket = await (
    await getTicketsCollection()
  ).findOneAndUpdate(
    {
      _id: new ObjectId(ticketId),
      phaseId: new ObjectId(phaseId),
    },
    {
      $set: {
        status: TicketStatuses.Backlog,
        phaseId: null,
        assigneeId: null,
        completedAt: null,
      },
    },
    { returnDocument: "after" }
  );

  return updatedTicket ? convertToTicket(updatedTicket) : null;
}

export async function moveTicketsToBacklogForPhase(
  phaseId: string
): Promise<number> {
  const result = await (
    await getTicketsCollection()
  ).updateMany(
    { phaseId: new ObjectId(phaseId) },
    {
      $set: {
        status: TicketStatuses.Backlog,
        phaseId: null,
        assigneeId: null,
        completedAt: null,
      },
    }
  );

  return result.modifiedCount;
}

export async function moveIncompleteTicketsToBacklogForPhase(
  phaseId: string
): Promise<number> {
  const result = await (
    await getTicketsCollection()
  ).updateMany(
    {
      phaseId: new ObjectId(phaseId),
      status: {
        $in: [TicketStatuses.Todo, TicketStatuses.InProgress],
      },
    },
    {
      $set: {
        status: TicketStatuses.Backlog,
        phaseId: null,
        assigneeId: null,
        completedAt: null,
      },
    }
  );

  return result.modifiedCount;
}

export async function deleteTicket(ticketId: string): Promise<boolean> {
  const result = await (
    await getTicketsCollection()
  ).deleteOne({ _id: new ObjectId(ticketId) });

  return result.deletedCount === 1;
}

export async function updateTicketAssignee(
  ticketId: string,
  assigneeId: string | undefined | null
) {
  const updatedTicket = await (
    await getTicketsCollection()
  ).findOneAndUpdate(
    {
      _id: new ObjectId(ticketId),
      status: { $ne: TicketStatuses.Completed },
    },
    {
      $set: {
        status: assigneeId ? TicketStatuses.Todo : TicketStatuses.Backlog, //Updating ticket status automatically sends it to Todo category IFF assigned to a User, o.w. sent to Backlog.
        assigneeId: assigneeId ? new ObjectId(assigneeId) : null,
        completedAt: null,
      },
    },
    { returnDocument: "after" }
  );

  return updatedTicket ? convertToTicket(updatedTicket) : null;
}

export async function unassignUserFromTickets(
  assigneeId: string | ObjectId | undefined
) {
  if (!assigneeId)
    throw new Error("Cannot unassign tickets with no assigneeId!");
  assigneeId =
    typeof assigneeId == "string" ? new ObjectId(assigneeId) : assigneeId;
  const manager_id = ((await getUserById(assigneeId)) as Developer | null)
    ?.manager;
  return await Promise.all([
    (await getTicketsCollection()).updateMany(
      {
        assigneeId: assigneeId,
        status: { $ne: TicketStatuses.Completed },
      },
      {
        $set: {
          status: TicketStatuses.Backlog,
          assigneeId: null,
          completedAt: null,
        },
      }
    ),
    (await getTicketsCollection()).updateMany(
      {
        assigneeId: assigneeId,
        status: { $eq: TicketStatuses.Completed },
      },
      {
        $set: {
          assigneeId: manager_id ? new ObjectId(manager_id) : null,
        },
      }
    ),
  ]);
}
