import { Router } from "express";
import AuthenticationGuard from "../middleware/AuthenticationGuard.ts";
import {
  getUserById,
  getUserByUserName,
  getDevelopersMetadata,
} from "../database/UserOperations.ts";
import type { User } from "../../shared/models/Users.ts";

/**
 * Instance of router that requires authentication on all routes for getting user data
 */
const UsersRouter = Router({ mergeParams: true }); //TODO: see if mergeParams is even needed

//add authentication guard to all routes.
UsersRouter.use(AuthenticationGuard);

const GET_OPS: Record<string, (arg: string) => Promise<User | null>> = {
  id: getUserById,
  username: getUserByUserName,
};

/**
 * Handles both getting by _id and by username by a required query that specifies the identifier type
 */
UsersRouter.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = (req.query.by || "username") as string; //default to search by username
    if (!GET_OPS[query])
      throw new Error(
        `by must equal to one of the following value ${Object.keys(GET_OPS).join(", ")}`
      );
    const data = await GET_OPS[query](id);
    res.json(data);
  } catch (error) {
    console.error(`Error with GET /user/:id`, error);
    res.status(401).json({ error: (error as Error).message });
  }
});

export default UsersRouter;
