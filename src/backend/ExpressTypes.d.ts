import type { RequestHandler } from "express";
import type { User } from "../shared/models/Users.ts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserRequestHandler = RequestHandler<object, any, User>;
