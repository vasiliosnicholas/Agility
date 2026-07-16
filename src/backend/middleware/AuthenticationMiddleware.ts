import type { RequestHandler } from "express";
import type { User } from "../../shared/models/Users.ts";
import { hashPassword } from "../authentication/CredentialsManager.ts";

export const AuthenticationGuard: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else if (req.isUnauthenticated()) {
    res.status(401).json({ message: "Not logged in" });
  } else {
    const errorMessage =
      "Error with request: can't get authentication state from request";
    res.status(422).json({
      error: errorMessage,
    });
    next(new Error(errorMessage));
  }
};

/**
 * Middleware that takes a post request and hashes user password.
 * @param req a Request instance
 * @param res a Response instance.
 * @param next Express NextFunction
 */
export const SecureUserPassword: RequestHandler<object, any, User> =
  async function (req, res, next) {
    if (req.body.password)
      //for login requests
      req.body.password = await hashPassword(req.body.password);
    else if (req.user && req.user?.password) {
      delete req.user.password;
    }
    next();
  };
