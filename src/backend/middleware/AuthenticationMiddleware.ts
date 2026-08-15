import type { RequestHandler } from "express";
import type { User, UserAccountUpdate } from "../../shared/models/Users.ts";
import {
  hashPassword,
  validatePassword,
} from "../authentication/CredentialsManager.ts";
import type { UserRequestHandler } from "../ExpressTypes.d.ts";

/**
 * Any auth guarded api requests are directed to /login
 * Any other paths are sent 401 status code with a json object containing a message or an error.
 * @param req
 * @param res
 * @param next express next function
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
 * Tuple of Middleware to guard routes to specific account types.
 * Simply rest the return type to an express function
 * that accepts a RequestHandler rest parameter.
 * @param accountType a string representing the accounttype to guard the route to.
 * @returns a tuple (fixed list of length 2) with middleware: [AuthenticationGuard, AccountTypeGuard]
 */
export const AccountTypeGuardFactoryFunction: (
  accountType: string
) => [RequestHandler, UserRequestHandler] = (accountType) => {
  const AccountTypeGuard: UserRequestHandler = (req, res, next) => {
    try {
      if (!req.user)
        throw new Error(
          "No user credentials can't access account type guarded route"
        );
      else {
        if (req.user.accountType === accountType) {
          next();
        } else {
          res.redirect(`/unauthorized`);
        }
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
  return [AuthenticationGuard, AccountTypeGuard];
};

/**
 * Middleware that hashes user password.
 * @param req a Request instance
 * @param res a Response instance.
 * @param next Express NextFunction
 */
export const SecureUserPassword: RequestHandler<
  object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  User & UserAccountUpdate
> = async function (req, res, next) {
  if (req.body.password) {
    //for login requests
    req.body.password = await hashPassword(req.body.password);
  } else if (req.user && req.user?.password) {
    delete req.user.password;
  }

  if (req.body.newPassword)
    req.body.newPassword = await hashPassword(req.body.newPassword);
  if (req.body.confirmNewPassword)
    req.body.confirmNewPassword = await hashPassword(
      req.body.confirmNewPassword
    );
  next();
};

const ConfirmAuth: UserRequestHandler = async (req, res, next) => {
  if (
    req.body.password &&
    req.user?.password &&
    (await validatePassword(req.body.password, req.user.password))
  ) {
    next();
  } else {
    res.status(401).json({ message: "Confirming Authentication Failed" });
  }
};

export const ConfirmAuthentication = [
  AuthenticationGuard,
  ConfirmAuth,
  SecureUserPassword,
];
