import { Router } from "express";
import { ObjectId } from "mongodb";
import type { KanbanData } from "../../shared/models/Kanban.ts";
import {
  TicketStatuses,
  type CreateTicketRequest,
  type TicketCreationStatus,
  type TicketPriority,
  type TicketStatus,
  type UpdateTicketErrorResponse,
  type UpdateTicketStatusRequest,
} from "../../shared/models/Tickets.ts";
import { AccountTypes } from "../../shared/models/Users.ts";
import { getActivePhase } from "../database/PhaseOperations.ts";
import {
  createTicket,
  getTicketsForManager,
  getTicketsForPhaseAndAssignee,
  updateTicketStatusForAssignee,
  updateTicketStatusForManager,
} from "../database/TicketOperations.ts";
import { getUsersMetadataByIds } from "../database/UserOperations.ts";
import { AuthenticationGuard } from "../middleware/AuthenticationMiddleware.ts";

const KanbanRouter = Router();
const TICKET_STATUSES = Object.values(TicketStatuses);

function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === "string" &&
    TICKET_STATUSES.some((status) => status === value)
  );
}

function isTicketCreationStatus(value: unknown): value is TicketCreationStatus {
  return value === TicketStatuses.Todo || value === TicketStatuses.Backlog;
}

function isTicketPriority(value: unknown): value is TicketPriority {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 3
  );
}

function getManagerTeamIds(userId: string, developers: unknown): string[] {
  const developerIds = Array.isArray(developers)
    ? developers.flatMap((id) => {
        if (id instanceof ObjectId) return [id.toHexString()];
        return typeof id === "string" && ObjectId.isValid(id) ? [id] : [];
      })
    : [];
  return [...new Set([userId, ...developerIds])];
}

KanbanRouter.use(AuthenticationGuard);

KanbanRouter.get("/", async (req, res) => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Authenticated user not found" });
      return;
    }

    const user = { ...req.user };
    delete user.password;
    const phase = await getActivePhase();
    const isManager = req.user.accountType === AccountTypes.Manager;
    if (isManager) {
      const teamIds = getManagerTeamIds(
        req.user._id,
        "developers" in req.user ? req.user.developers : []
      );
      const [tickets, teamMembers] = await Promise.all([
        getTicketsForManager(phase?._id ?? null, teamIds),
        getUsersMetadataByIds(teamIds),
      ]);
      const data: KanbanData = { user, phase, tickets, teamMembers };
      res.json(data);
      return;
    }

    const tickets = phase
      ? await getTicketsForPhaseAndAssignee(phase._id, req.user._id)
      : [];
    const data: KanbanData = { user, phase, tickets };
    res.json(data);
  } catch (error) {
    console.error("Error loading Kanban data", error);
    res.status(500).json({ message: "Could not load Kanban data" });
  }
});

KanbanRouter.post("/tickets", async (req, res) => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Authenticated user not found" });
      return;
    }

    const body = req.body as Partial<CreateTicketRequest>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : undefined;
    if (
      !title ||
      title.length > 120 ||
      (body.description !== undefined &&
        typeof body.description !== "string") ||
      (description?.length ?? 0) > 500 ||
      !isTicketPriority(body.priority) ||
      !isTicketCreationStatus(body.status)
    ) {
      res.status(400).json({ message: "Invalid ticket details" });
      return;
    }

    const isBacklog = body.status === TicketStatuses.Backlog;
    const isManager = req.user.accountType === AccountTypes.Manager;
    if (isBacklog && !isManager) {
      res
        .status(403)
        .json({ message: "Only managers can create backlog tickets" });
      return;
    }

    const phase = isBacklog ? null : await getActivePhase();
    if (!isBacklog && !phase) {
      res.status(409).json({ message: "There is no active phase" });
      return;
    }

    const ticket = await createTicket({
      title,
      ...(description ? { description } : {}),
      priority: body.priority,
      status: body.status,
      phaseId: phase?._id ?? null,
      assigneeId: isBacklog ? null : req.user._id,
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating Kanban ticket", error);
    res.status(500).json({ message: "Could not create ticket" });
  }
});

KanbanRouter.patch("/tickets/:ticketId", async (req, res) => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Authenticated user not found" });
      return;
    }

    const { ticketId } = req.params;
    const { status } = req.body as Partial<UpdateTicketStatusRequest>;
    if (!ObjectId.isValid(ticketId) || !isTicketStatus(status)) {
      res.status(400).json({ message: "Invalid ticket ID or status" });
      return;
    }

    const phase = await getActivePhase();
    if (!phase) {
      res.status(409).json({ message: "There is no active phase" });
      return;
    }

    const isManager = req.user.accountType === AccountTypes.Manager;
    if (!isManager && status === TicketStatuses.Backlog) {
      res
        .status(403)
        .json({ message: "Only managers can move tickets to backlog" });
      return;
    }

    const updatedTicket = isManager
      ? await updateTicketStatusForManager(
          ticketId,
          phase._id,
          getManagerTeamIds(
            req.user._id,
            "developers" in req.user ? req.user.developers : []
          ),
          req.user._id,
          status
        )
      : await updateTicketStatusForAssignee(
          ticketId,
          phase._id,
          req.user._id,
          status
        );
    if (updatedTicket) {
      res.json(updatedTicket);
      return;
    }

    const response: UpdateTicketErrorResponse = {
      message:
        "This ticket could not be updated. Refresh the board before continuing.",
    };
    res.status(409).json(response);
  } catch (error) {
    console.error("Error updating Kanban ticket", error);
    res.status(500).json({ message: "Could not update ticket" });
  }
});

export default KanbanRouter;
