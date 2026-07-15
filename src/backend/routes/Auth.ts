import { Router, type RequestHandler } from "express";
import Authenticator from "../authentication/Authenticator.ts";
import AuthenticationGuard from "../middleware/AuthenticationGuard.ts";
import {
  addUser,
  getUserByUserName,
  getUserById,
  updateUser,
} from "../database/UserOperations.ts";
import type { User } from "../../shared/models/Users.ts";

/**
 * Router for managing authentication.
 */
const AuthRouter = Router({ mergeParams: true }); //TODO: see if mergeParams is even needed


/**
 * Register
 */
AuthRouter.post("/user", async (req, res) => {
  try {
    const response = await addUser(req.body as User);
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Login
 */
AuthRouter.post(
  "/user/:id",
  Authenticator.authenticate("local", {
    successMessage: "Logged in!",
  }) as RequestHandler<{ id: string }>
);

const handleUserRequest: RequestHandler<object, any, User> = (req, res) => {
  delete req.user?.password;
  res.json(req.user);
};

/**
 * Get current user details
 */
AuthRouter.get("/user/", AuthenticationGuard, handleUserRequest);

const handleUserUpdateRequest: RequestHandler<object, any, User> = async (
  req,
  res
) => {
  try {
    const response = await updateUser(req.user as User);
    res.status(201).json(response);
  } catch (error) {
    res.status(304).json({ error: (error as Error).message });
  }
};

/**
 * Update user details
 */
AuthRouter.put("/user", AuthenticationGuard, handleUserUpdateRequest);

export default AuthRouter;
