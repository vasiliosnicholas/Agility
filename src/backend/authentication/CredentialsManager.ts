import bcrypt from "bcrypt";
import type { RequestHandler } from "express";
import type { User } from "../../shared/models/Users.ts";

/**
 * Hashes a password.
 * @param password an unhashed string to hash
 * @returns a promise with the hashed password.
 */
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compares a password against a hashed password.
 * @param password a string representing the unhashed password
 * @param hashedPassword a string representing a hashed password.
 * @returns a promise boolan true if hashed password matches hashedPassword.
 */
export async function validatePassword(
  password: string,
  hashedPassword: string
) {
  return await bcrypt.compare(password, hashedPassword);
}

export type UserRequestHandler = RequestHandler<object, any, User>;

/**
 * Middleware that takes a post request.
 * @param req a Request instance
 * @param res a Response instance.
 * @param next Express NextFunction
 */
export const hashUserPassword: UserRequestHandler = async function (
  req,
  res,
  next
) {
  if (req.body.password)
    req.body.password = await hashPassword(req.body.password);
  next();
};
