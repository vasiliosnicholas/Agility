import { Router, type RequestHandler } from "express";
import Authenticator from "../authentication/Authenticator.ts";
import AuthenticationGuard from "../middleware/AuthenticationGuard.ts";
import { addUser, updateUser } from "../database/UserOperations.ts";
import {
  createUser,
  type User,
  type BaseUser,
} from "../../shared/models/Users.ts";

/**
 * Router for managing authentication.
 */
const AuthRouter = Router({ mergeParams: true }); //TODO: see if mergeParams is even needed

/**
 * Register
 */
AuthRouter.post("/register", async (req, res) => {
  try {
    const response = await addUser(createUser(req.body as BaseUser));
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Login
 */
AuthRouter.post(
  "/login",
  Authenticator.authenticate("local") as RequestHandler<{ id: string }>,
  (req, res) => {
    if (req.user)
      res.status(201).json({ message: `Logged in as ${req.user.username}` });
  }
);

const handleUserRequest: RequestHandler<object, any, User> = (req, res) => {
  delete req.user?.password;
  res.json(req.user);
};

/**
 * Get current user details
 */
AuthRouter.get("/user", AuthenticationGuard, handleUserRequest);

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
