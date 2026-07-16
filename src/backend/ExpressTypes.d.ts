import type { RequestHandler } from "express";
import type { User } from "../shared/models/Users.ts";
export type UserRequestHandler = RequestHandler<object, any, User>;
