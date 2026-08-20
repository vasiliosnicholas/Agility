import { Router } from "express";
import { ObjectId } from "mongodb";

import {
  AccountTypeGuardFactoryFunction,
} from "../middleware/AuthenticationMiddleware.ts";

import {
  getDevelopersMetadata,
  getUserById,
  updateManager,
  updateUser,
} from "../database/UserOperations.ts";

import {
  AccountTypes,
  type Developer,
  type Manager,
} from "../../shared/models/Users.ts";

const DevelopersRouter = Router({
  mergeParams: true,
});

DevelopersRouter.use(
  ...AccountTypeGuardFactoryFunction(
    AccountTypes.Manager
  )
);

DevelopersRouter.get("/", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Could not get user details",
      });

      return;
    }

    const developers = req.query.assigned
      ? await getDevelopersMetadata(
          req.user as Manager
        )
      : await getDevelopersMetadata();

    res.status(200).json(developers);
  } catch (error) {
    console.error(
      "Could not load developers",
      error
    );

    res.status(500).json({
      message: "Could not load developers",
    });
  }
});

DevelopersRouter.put(
  "/:id",
  async (req, res) => {
    try {
      if (!req.user?._id) {
        res.status(401).json({
          message:
            "Authenticated manager not found",
        });

        return;
      }

      const developerId = req.params.id;

      if (!ObjectId.isValid(developerId)) {
        res.status(400).json({
          message: "Invalid developer ID",
        });

        return;
      }

      const developer = (await getUserById(
        developerId
      )) as Developer | null;

      if (
        !developer ||
        developer.accountType !==
          AccountTypes.Developer
      ) {
        res.status(404).json({
          message: "Developer not found",
        });

        return;
      }

      if (
        developer.manager &&
        developer.manager !== req.user._id
      ) {
        res.status(409).json({
          message:
            "Developer is already on another team",
        });

        return;
      }

      const manager = req.user as Manager;

      const currentDeveloperIds =
        Array.isArray(manager.developers)
          ? manager.developers
          : [];

      const nextDeveloperIds = [
        ...new Set([
          ...currentDeveloperIds,
          developerId,
        ]),
      ];

      await Promise.all([
        updateManager(developer, manager),

        updateUser(manager, {
          developers: nextDeveloperIds,
        }),
      ]);

      res.status(200).json({
        message: "Developer assigned",
      });
    } catch (error) {
      console.error(
        "Set developer's manager:",
        error
      );

      res.status(500).json({
        message:
          "Could not assign developer",
      });
    }
  }
);

/**
 * Remove a developer from the manager's team.
 */
DevelopersRouter.delete(
  "/:id",
  async (req, res) => {
    try {
      if (!req.user?._id) {
        res.status(401).json({
          message:
            "Authenticated manager not found",
        });

        return;
      }

      const developerId = req.params.id;

      if (!ObjectId.isValid(developerId)) {
        res.status(400).json({
          message: "Invalid developer ID",
        });

        return;
      }

      const developer = (await getUserById(
        developerId
      )) as Developer | null;

      if (
        !developer ||
        developer.accountType !==
          AccountTypes.Developer
      ) {
        res.status(404).json({
          message: "Developer not found",
        });

        return;
      }

      if (
        developer.manager !== req.user._id
      ) {
        res.status(403).json({
          message:
            "Developer is not on your team",
        });

        return;
      }

      const manager = req.user as Manager;

      const currentDeveloperIds =
        Array.isArray(manager.developers)
          ? manager.developers
          : [];

      const nextDeveloperIds =
        currentDeveloperIds.filter(
          (id) => id !== developerId
        );

      await Promise.all([
        updateManager(developer, null),

        updateUser(manager, {
          developers: nextDeveloperIds,
        }),
      ]);

      res.status(200).json({
        message: "Developer unassigned",
      });
    } catch (error) {
      console.error(
        "Remove developer's manager:",
        error
      );

      res.status(500).json({
        message:
          "Could not unassign developer",
      });
    }
  }
);

export default DevelopersRouter;
