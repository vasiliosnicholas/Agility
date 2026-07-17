import type { RequestHandler } from "express";
import type { User } from "../../shared/models/Users.ts";
import { hashPassword } from "../authentication/CredentialsManager.ts";
import type { UserRequestHandler } from "../ExpressTypes.d.ts";

/**
 * Any auth guarded api requests are directed to /login
 * Any other paths are sent 401 status code with a json object containing a message or an error.
 * @param req
 * @param res
 * @param next
 */
export const AuthenticationGuard: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else if (req.isUnauthenticated()) {
    if (!req.baseUrl.includes("/api") || req.baseUrl == "/api/auth") {
      res.status(401).redirect(`/login${req.user ? "#sessionExpired" : ""}`); //route is not authentication guarded.
    } else {
      res.status(401).json({ message: "Not logged in" });
    }
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
 *  Middleware to guard routes to specific account types.
 * @param accountType a string representing the account type
 * @returns 
 */
const AccountTypeGuardPrototype: (accountType: string) => UserRequestHandler =
  (accountType) => (req, res, next) => {
    try {
      if (!req.user)
        throw new Error(
          "No user credentials can't access account type guarded route"
        );
      else {
        if (req.user.accountType !== accountType) {
          res.redirect(`/unauthorized`);
        } else {
          next();
        }
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
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
