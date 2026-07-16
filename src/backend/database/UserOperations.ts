import { ObjectId } from "mongodb";
import {
  type User,
  type UserMetaData,
  AccountTypes,
} from "../../shared/models/Users.ts";
import {
  convertToUser,
  convertToUserDocument,
  getUsersCollection,
} from "./Database.ts";
import { hashPassword } from "../authentication/CredentialsManager.ts";

async function getUsersHelper(query: object = {}) {
  return (await getUsersCollection()).find(query);
}

/**
 * Gets alls users in the Users collection
 * @returns An array with all users
 */
export async function getUsers() {
  return (await (await getUsersHelper()).toArray()).map((user) => {
    if (user && user.password) delete user.password;
    convertToUser(user);
  });
} //TODO: Decide if needed.

const devMetaData: Record<keyof UserMetaData, 1> = {
  _id: 1,
  name: 1,
  username: 1,
  email: 1,
};

/**
 * Gets alls developers' metadata in the Users collection
 * @returns An array with all users
 */
export async function getDevelopersMetadata() {
  return await (
    await getUsersHelper({ accountType: AccountTypes.Developer })
  )
    .project<UserMetaData>(devMetaData)
    .toArray();
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
 * Gets a User from the Database, with the password
 * @param _id The User's _id to query for.
 * @returns a User with all fields, with the password.
 */
export async function getUserById(_id: string) {
  const userDocument = await (
    await getUsersCollection()
  ).findOne({
    _id: new ObjectId(_id),
  });
  return userDocument ? convertToUser(userDocument) : null;
}

/**
 * Adds a user to the database.
 * @param user an instance of User to add to the database.
 * @returns The results of adding the user if successful.
 * @throws Error if the username was already taken.
 */
export async function addUser(user: User) {
  if (await getUserByUserNameAdmin(user.username))
    throw Error("Username already taken"); //user already exists
  // if (user.password)
  //   user.password = await hashPassword(user.password); //TODO: add this to middleware
  // else throw new Error("Attempting to create a user without a password!");
  return (await getUsersCollection()).insertOne(convertToUserDocument(user));
}

/**
 * Updates any of the user fields
 * @param userFieldsToUpdate an instance of User to update
 */
export async function updateUser(userFieldsToUpdate: User) {
  if (!userFieldsToUpdate._id) {
    throw new Error("User doesn't have an id!");
  }
  if (!userFieldsToUpdate.password) {
    const oldUser = await getUserById(userFieldsToUpdate._id);
    if (oldUser) {
      if (!oldUser.password)
        throw new Error(
          "Database error: current record of user doesn't have a password"
        );
      userFieldsToUpdate.password = oldUser.password;
    }
  }
  await (
    await getUsersCollection()
  ).updateOne(
    { _id: userFieldsToUpdate._id },
    convertToUserDocument(userFieldsToUpdate)
  );
}
