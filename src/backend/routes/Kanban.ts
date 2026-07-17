import { Router } from "express";
import type { KanbanData } from "../../shared/models/Kanban.ts";
import { getActivePhase } from "../database/PhaseOperations.ts";
import { getTicketsForPhaseAndAssignee } from "../database/TicketOperations.ts";
import { AuthenticationGuard } from "../middleware/AuthenticationMiddleware.ts";

const KanbanRouter = Router();

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

export default KanbanRouter;
