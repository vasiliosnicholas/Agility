import { Router } from "express";
import { AccountTypeGuardFactoryFunction } from "../middleware/AuthenticationMiddleware.ts";
import {
  getDevelopersMetadata,
  updateManager,
  updateDevelopers,
  getUserById,
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
DevelopersRouter.get("/", async (req, res) => {
  try {
    if (!req.user) throw new Error("Could not get user details");
    const developers = req.query.assigned
      ? await getDevelopersMetadata(req.user as Manager)
      : await getDevelopersMetadata();
    res.status(201).json(developers);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Set a developer's manager
 */
DevelopersRouter.put("/:id", async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Error user must be authenticated for this route");
    }
    if (!req.params.id) {
      throw new Error("id required!");
    }
    const developer = (await getUserById(req.params.id)) as Developer;
    if (developer.accountType !== AccountTypes.Developer)
      throw new Error("Must pass the id of a developer!");
    const developers = (await getDevelopersMetadata(
      req.user as Manager
    )) as Developer[];
    if (!developers.includes(developer)) developers.push(developer);
    const updateResponse = await Promise.all([
      updateManager(developer, req.user as Manager),
      updateDevelopers(req.user as Manager, developers),
    ]);
    res.status(201).json(updateResponse);
  } catch (error) {
    console.error("Set developer's manager:", error);
    res.status(500).json({ message: (error as Error).message });
  }
});

/**
 * Remove developer's manager
 */
DevelopersRouter.delete("/:id", async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Error user must be authenticated for this route");
    }

    if (!req.params.id) {
      throw new Error("id required!");
    }
    const developer = (await getUserById(req.params.id)) as Developer;
    if (developer.accountType !== AccountTypes.Developer)
      throw new Error("Must pass the id of a developer!");
    const developers = (await getDevelopersMetadata(
      req.user as Manager
    )) as Developer[];
    if (developers.includes(developer))
      developers.splice(
        developers.findIndex(({ _id }) => _id === developer._id),
        1
      );
    const updateResponse = await Promise.all([
      updateManager(developer, null),
      updateDevelopers(req.user as Manager, developers),
    ]);
    res.status(201).json(updateResponse);
  } catch (error) {
    console.error("Remove developer's manager:", error);
    res.status(500).json({ message: (error as Error).message });
  }
});

export default DevelopersRouter;
