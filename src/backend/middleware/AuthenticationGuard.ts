import type { RequestHandler } from "express";

const AuthenticationGuard: RequestHandler = (req, res, next) => {
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

export default AuthenticationGuard;
