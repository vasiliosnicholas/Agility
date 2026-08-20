import type { RequestHandler } from "express";
import type {
  User,
  UserAccountUpdate,
} from "../../shared/models/Users.ts";

import {
  hashPassword,
  validatePassword,
} from "../authentication/CredentialsManager.ts";

import type { UserRequestHandler } from "../ExpressTypes.d.ts";

export const AuthenticationGuard: RequestHandler = (
  req,
  res,
  next
) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  if (req.baseUrl.startsWith("/api")) {
    res.status(401).json({
      message: "Not logged in",
    });

    return;
  }

  res.redirect(
    `/login${req.user ? "#sessionExpired" : ""}`
  );
};

export const AccountTypeGuardFactoryFunction: (
  accountType: string
) => [RequestHandler, UserRequestHandler] = (
  accountType
) => {
  const AccountTypeGuard: UserRequestHandler = (
    req,
    res,
    next
  ) => {
    if (!req.user) {
      res.status(401).json({
        message: "Not logged in",
      });

      return;
    }

    if (req.user.accountType === accountType) {
      next();
      return;
    }

    if (req.baseUrl.startsWith("/api")) {
      res.status(403).json({
        message:
          "You do not have access to this route",
      });

      return;
    }

    res.redirect("/unauthorized");
  };

  return [
    AuthenticationGuard,
    AccountTypeGuard,
  ];
};

 */
export const SecureUserPassword: RequestHandler<
  object,
  any,
  User & UserAccountUpdate
> = async function (req, res, next) {
  try {
    if (
      req.method === "POST" &&
      req.body.password !== undefined
    ) {
      if (
        typeof req.body.password !== "string"
      ) {
        res.status(400).json({
          message: "Password must be a string",
        });

        return;
      }

      req.body.password = await hashPassword(
        req.body.password
      );
    }

    if (
      req.body.newPassword !== undefined
    ) {
      if (
        typeof req.body.newPassword !== "string"
      ) {
        res.status(400).json({
          message:
            "New password must be a string",
        });

        return;
      }

      req.body.newPassword = await hashPassword(
        req.body.newPassword
      );
    }

    delete req.body.confirmNewPassword;

    next();
  } catch (error) {
    next(error);
  }
};

const ConfirmAuth: UserRequestHandler = async (
  req,
  res,
  next
) => {
  if (
    typeof req.body.password === "string" &&
    req.user?.password &&
    (await validatePassword(
      req.body.password,
      req.user.password
    ))
  ) {
    next();
    return;
  }

  res.status(401).json({
    message: "Current password is incorrect",
  });
};

export const ConfirmAuthentication = [
  AuthenticationGuard,
  ConfirmAuth,
  SecureUserPassword,
];
