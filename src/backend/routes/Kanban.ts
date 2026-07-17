import { Router } from "express";
import { ObjectId } from "mongodb";
import type { KanbanData } from "../../shared/models/Kanban.ts";
import {
  TicketStatuses,
  type TicketStatus,
  type UpdateTicketErrorResponse,
  type UpdateTicketStatusRequest,
} from "../../shared/models/Tickets.ts";
import { getActivePhase } from "../database/PhaseOperations.ts";
import {
  getTicketsForPhaseAndAssignee,
  updateTicketStatusForAssignee,
} from "../database/TicketOperations.ts";
import { AuthenticationGuard } from "../middleware/AuthenticationMiddleware.ts";

const KanbanRouter = Router();
const TICKET_STATUSES = Object.values(TicketStatuses);

function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && TICKET_STATUSES.includes(value);
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

    const updatedTicket = await updateTicketStatusForAssignee(
      ticketId,
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
