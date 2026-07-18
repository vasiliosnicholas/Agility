import { Router, type RequestHandler } from "express";
import type { UserRequestHandler } from "../ExpressTypes.d.ts";
import Authenticator from "../authentication/Authenticator.ts";
import {
  AuthenticationGuard,
  SecureUserPassword,
} from "../middleware/AuthenticationMiddleware.ts";
import { addUser, deleteUser, updateUser } from "../database/UserOperations.ts";
import { createUser, type User } from "../../shared/models/Users.ts";

/**
 * Router for managing authentication.
 */
const AuthRouter = Router({ mergeParams: true });

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
    if (error) {
      res.status(500).json({ error: "Unable to logout" });
      return next(error);
    } else {
      res.status(200).json({ message: "Logout successful" });
      req.session.destroy(() => {
        return;
      });
    }
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

/**
 * Handles updating user fields.
 * @param req
 * @param res
 */
const handleUserUpdateRequest: UserRequestHandler = async (req, res) => {
  try {
    const response = await updateUser(req.user as User, req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(304).json({ error: (error as Error).message });
  }
};

/**
 * Update user details
 */
AuthRouter.put("/user", AuthenticationGuard, handleUserUpdateRequest);

const handleUserAccountDelete: UserRequestHandler = async (req, res) => {
  try {
    if (!req.user) throw new Error("Not signed in or session expired");
    const response = await deleteUser(req.user);
    req.session.destroy(() => {
      return;
    });
    res.status(201).json(response);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};

/**
 * Delete current userAccount
 */
AuthRouter.delete("/user", AuthenticationGuard, handleUserAccountDelete);

export default AuthRouter;
