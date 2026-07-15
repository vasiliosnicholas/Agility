import { loadEnvFile } from "process";
import type { User } from "../../shared/models/Users.ts";
import {
  convertToUser,
  convertToUserDocument,
  getUsersCollection,
  parseObjectId,
} from "./Database.ts";

try {
  loadEnvFile();
} catch {
  //variables already loaded.
}

export async function getUsers() {
  return (await getUsersCollection()).find().toArray();
}

/**
 * Gets a User from the Database, including the password
 * @param username The User's username to query for.
 * @returns a User with all fields, including the password.
 */
export async function getUserByUserNameAdmin(username: string) {
  const userDocument = await (
    await getUsersCollection()
  ).findOne({
    username: username,
  });
  return userDocument ? convertToUser(userDocument) : null;
}

/**
 * Gets a User from the Database, without the password
 * @param username The User's username to query for.
 * @returns a User with all fields, without the password.
 */
export async function getUserByUserName(username: string) {
  const user = await getUserByUserNameAdmin(username);
  if (user) {
    delete user.password;
  }
  return user;
}

/**
 * Adds a user to the database.
 * @param user an instance of User to add to the database.
 * @returns The results of adding the user if successful.
 * @throws Error if the username was already taken.
 */
export async function addUser(user: User) {
  if (await getUserByUserNameAdmin(user.userName))
    throw Error("Username already taken"); //user already exists
  return (await getUsersCollection()).insertOne(convertToUserDocument(user));
}
