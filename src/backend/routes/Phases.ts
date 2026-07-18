import { Router } from "express";
import type { PhaseListResponse } from "../../shared/models/Phases.ts";
import { AccountTypes } from "../../shared/models/Users.ts";
import { getActivePhase, getPhases } from "../database/PhaseOperations.ts";
import { AccountTypeGuardFactoryFunction } from "../middleware/AuthenticationMiddleware.ts";

const PhasesRouter = Router();
const ManagerGuards = AccountTypeGuardFactoryFunction(AccountTypes.Manager);

PhasesRouter.get("/", ...ManagerGuards, async (_req, res) => {
  try {
    const [phases, currentPhase] = await Promise.all([
      getPhases(),
      getActivePhase(),
    ]);
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

export default PhasesRouter;
