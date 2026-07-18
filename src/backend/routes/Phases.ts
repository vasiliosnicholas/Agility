import { Router } from "express";
import { ObjectId } from "mongodb";
import type {
  CreatePhaseRequest,
  DeletePhaseErrorResponse,
  DeletePhaseRequest,
  PhaseListResponse,
  PhaseTicketsManageData,
} from "../../shared/models/Phases.ts";
import type {
  AssignPhaseTicketRequest,
  UpdateTicketErrorResponse,
} from "../../shared/models/Tickets.ts";
import { AccountTypes } from "../../shared/models/Users.ts";
import {
  createPhase,
  deletePhase,
  findOverlappingPhase,
  getActivePhase,
  getPhaseById,
  getPhases,
} from "../database/PhaseOperations.ts";
import {
  assignBacklogTicketToPhase,
  countTicketsForPhase,
  getBacklogTickets,
  getTicketsForPhase,
  moveTicketToBacklogFromPhase,
  moveTicketsToBacklogForPhase,
} from "../database/TicketOperations.ts";
import { getUsersMetadataByIds } from "../database/UserOperations.ts";
import { getManagerTeamIds } from "../managerTeam.ts";
import { AccountTypeGuardFactoryFunction } from "../middleware/AuthenticationMiddleware.ts";

const PhasesRouter = Router();
const ManagerGuards = AccountTypeGuardFactoryFunction(AccountTypes.Manager);

function isValidStartsAt(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isValidDuration(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

PhasesRouter.get("/", ...ManagerGuards, async (_req, res) => {
  try {
    const currentPhase = await getActivePhase();
    const phases = await getPhases();
    const response: PhaseListResponse = {
      phases,
      currentPhaseId: currentPhase?._id ?? null,
    };
    res.json(response);
  } catch (error) {
    console.error("Error loading phases", error);
    res.status(500).json({ message: "Could not load phases" });
  }
});

PhasesRouter.post("/", ...ManagerGuards, async (req, res) => {
  try {
    const { startsAt, duration } = req.body as Partial<CreatePhaseRequest>;
    if (!isValidStartsAt(startsAt) || !isValidDuration(duration)) {
      res.status(400).json({
        message: "Provide a valid start date and a duration of at least 1 day.",
      });
      return;
    }

    const overlappingPhase = await findOverlappingPhase({ startsAt, duration });
    if (overlappingPhase) {
      res.status(409).json({
        message:
          "This phase overlaps an existing phase. Choose different dates.",
      });
      return;
    }

    const phase = await createPhase({ startsAt, duration });
    res.status(201).json(phase);
  } catch (error) {
    console.error("Error creating phase", error);
    res.status(500).json({ message: "Could not create phase" });
  }
});

PhasesRouter.get("/:phaseId/tickets", ...ManagerGuards, async (req, res) => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Authenticated user not found" });
      return;
    }

    const phaseId = req.params.phaseId;
    if (typeof phaseId !== "string" || !ObjectId.isValid(phaseId)) {
      res.status(400).json({ message: "Invalid phase ID" });
      return;
    }

    const phase = await getPhaseById(phaseId);
    if (!phase) {
      res.status(404).json({ message: "Phase not found" });
      return;
    }

    const teamIds = getManagerTeamIds(
      req.user._id,
      "developers" in req.user ? req.user.developers : []
    );
    const [tickets, backlogTickets, teamMembers] = await Promise.all([
      getTicketsForPhase(phaseId),
      getBacklogTickets(),
      getUsersMetadataByIds(teamIds),
    ]);

    const data: PhaseTicketsManageData = {
      tickets,
      backlogTickets,
      teamMembers,
    };
    res.json(data);
  } catch (error) {
    console.error("Error loading phase tickets", error);
    res.status(500).json({ message: "Could not load phase tickets" });
  }
});

PhasesRouter.post("/:phaseId/tickets", ...ManagerGuards, async (req, res) => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Authenticated user not found" });
      return;
    }

    const phaseId = req.params.phaseId;
    const { ticketId, assigneeId } =
      req.body as Partial<AssignPhaseTicketRequest>;

    if (
      typeof phaseId !== "string" ||
      !ObjectId.isValid(phaseId) ||
      typeof ticketId !== "string" ||
      !ObjectId.isValid(ticketId) ||
      typeof assigneeId !== "string" ||
      !ObjectId.isValid(assigneeId)
    ) {
      res.status(400).json({ message: "Invalid phase, ticket, or assignee" });
      return;
    }

    const phase = await getPhaseById(phaseId);
    if (!phase) {
      res.status(404).json({ message: "Phase not found" });
      return;
    }

    const teamIds = getManagerTeamIds(
      req.user._id,
      "developers" in req.user ? req.user.developers : []
    );
    if (!teamIds.includes(assigneeId)) {
      const response: UpdateTicketErrorResponse = {
        message: "Assignee must be you or one of your developers.",
      };
      res.status(403).json(response);
      return;
    }

    const ticket = await assignBacklogTicketToPhase(
      ticketId,
      phaseId,
      assigneeId
    );
    if (!ticket) {
      const response: UpdateTicketErrorResponse = {
        message:
          "This ticket could not be assigned. It may no longer be in the backlog.",
      };
      res.status(409).json(response);
      return;
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error assigning ticket to phase", error);
    res.status(500).json({ message: "Could not assign ticket" });
  }
});

PhasesRouter.delete(
  "/:phaseId/tickets/:ticketId",
  ...ManagerGuards,
  async (req, res) => {
    try {
      const phaseId = req.params.phaseId;
      const ticketId = req.params.ticketId;
      if (
        typeof phaseId !== "string" ||
        !ObjectId.isValid(phaseId) ||
        typeof ticketId !== "string" ||
        !ObjectId.isValid(ticketId)
      ) {
        res.status(400).json({ message: "Invalid phase or ticket ID" });
        return;
      }

      const phase = await getPhaseById(phaseId);
      if (!phase) {
        res.status(404).json({ message: "Phase not found" });
        return;
      }

      const ticket = await moveTicketToBacklogFromPhase(ticketId, phaseId);
      if (!ticket) {
        const response: UpdateTicketErrorResponse = {
          message:
            "This ticket could not be removed. It may no longer belong to this phase.",
        };
        res.status(409).json(response);
        return;
      }

      res.json(ticket);
    } catch (error) {
      console.error("Error removing ticket from phase", error);
      res.status(500).json({ message: "Could not remove ticket" });
    }
  }
);

PhasesRouter.delete("/:phaseId", ...ManagerGuards, async (req, res) => {
  try {
    const phaseId = req.params.phaseId;
    if (typeof phaseId !== "string" || !ObjectId.isValid(phaseId)) {
      res.status(400).json({ message: "Invalid phase ID" });
      return;
    }

    const existingPhase = await getPhaseById(phaseId);
    if (!existingPhase) {
      res.status(404).json({ message: "Phase not found" });
      return;
    }

    const { confirmMoveTicketsToBacklog } =
      (req.body as DeletePhaseRequest | undefined) ?? {};
    const ticketCount = await countTicketsForPhase(phaseId);

    if (ticketCount > 0 && !confirmMoveTicketsToBacklog) {
      const response: DeletePhaseErrorResponse = {
        message: `${ticketCount} ticket${ticketCount === 1 ? "" : "s"} will be moved to backlog if you delete this phase.`,
        ticketCount,
        requiresConfirmation: true,
      };
      res.status(409).json(response);
      return;
    }

    if (ticketCount > 0) {
      await moveTicketsToBacklogForPhase(phaseId);
    }

    const deleted = await deletePhase(phaseId);
    if (!deleted) {
      res.status(404).json({ message: "Phase not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting phase", error);
    res.status(500).json({ message: "Could not delete phase" });
  }
});

export default PhasesRouter;
