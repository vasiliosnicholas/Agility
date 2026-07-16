import { Router, type RequestHandler } from "express";
import type { UserRequestHandler } from "../ExpressTypes.d.ts";
import Authenticator from "../authentication/Authenticator.ts";
import {
  AuthenticationGuard,
  SecureUserPassword,
} from "../middleware/AuthenticationMiddleware.ts";
import { addUser, updateUser } from "../database/UserOperations.ts";
import { createUser, type User } from "../../shared/models/Users.ts";

/**
 * Router for managing authentication.
 */
const AuthRouter = Router({ mergeParams: true }); //TODO: see if mergeParams is even needed

/**
 * Register
 */
const registerUser: UserRequestHandler = async (req, res) => {
  try {
    const response = await addUser(createUser(req.body));
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Login Route
 */
AuthRouter.post(
  "/login",
  Authenticator.authenticate("local") as RequestHandler<{ id: string }>,
  (req, res) => {
    if (req.user)
      res.status(201).json({ message: `Logged in as ${req.user.username}` });
    else {
      res.status(500).json({ message: "Error authenticating" });
    }
  }
);

/**
 * Register route
 */
AuthRouter.post("/user", SecureUserPassword, registerUser);

/**
 * Logout route
 */
AuthRouter.post("/logout", AuthenticationGuard, (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
    res.status(200).json({ message: "Logout successful" });
  });
});

const handleUserRequest: UserRequestHandler = (req, res) => {
  delete req.user?.password;
  res.json(req.user);
};

/**
 * Get current user details
 */
AuthRouter.get("/user", AuthenticationGuard, handleUserRequest);

const handleUserUpdateRequest: UserRequestHandler = async (req, res) => {
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

/**
 * Delete user details
 */
AuthRouter.delete("/user", AuthenticationGuard);

export default AuthRouter;
