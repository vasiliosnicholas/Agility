import { Router } from "express";
import { AccountTypeGuardFactoryFunction } from "../middleware/AuthenticationMiddleware.ts";
import {
  getDevelopersMetadata,
  updateManager,
} from "../database/UserOperations.ts";
import {
  AccountTypes,
  type Developer,
  type Manager,
} from "../../shared/models/Users.ts";

/**
 * Specific Operations on Developer's accounts.
 */
const DevelopersRouter = Router({ mergeParams: true });

DevelopersRouter.use(...AccountTypeGuardFactoryFunction(AccountTypes.Manager));

/**
 * Route for getting developers metadata
 */
DevelopersRouter.get("/developers", async (req, res) => {
  try {
    const developers = await getDevelopersMetadata();
    res.status(201).json(developers);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Set a developer's manager
 */
DevelopersRouter.put("/developer/:id", async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Error user must be authenticated for this route");
    }
    if (!req.params.id) {
      throw new Error("id required!");
    }
    const updateResponse = await updateManager(
      req.body as Developer,
      req.user as Manager
    );
    res.status(201).json(updateResponse);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

/**
 * Set a manager's developers
 */
DevelopersRouter.put("/developers/", async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Error user must be authenticated for this route");
    }

    const updateResponse = await updateManager(
      req.body as Developer,
      req.user as Manager
    );
    res.status(201).json(updateResponse);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});
