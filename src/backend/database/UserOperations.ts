import { ObjectId } from "mongodb";
import {
  type Developer,
  type Manager,
  type User,
  type UserMetaData,
  AccountTypes,
} from "../../shared/models/Users.ts";
import {
  convertToUser,
  convertToUserDocument,
  getUsersCollection,
} from "./Database.ts";

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
export async function getDevelopersMetadata(
  manager: Manager | undefined = undefined
) {
  return await (
    await getUsersHelper({
      accountType: AccountTypes.Developer,
      manager: manager ? manager._id : null,
    })
  )
    .project<UserMetaData>(devMetaData)
    .toArray();
}

export async function getUsersMetadataByIds(userIds: string[]) {
  const objectIds = userIds
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));
  const users = await (
    await getUsersCollection()
  )
    .find({ _id: { $in: objectIds } })
    .project<{
      _id: ObjectId;
      name: string;
      username: string;
      email: string;
    }>(devMetaData)
    .toArray();

  return users.map((user) => ({
    ...user,
    _id: user._id.toHexString(),
  })) satisfies UserMetaData[];
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
export async function getUserById(_id: string | ObjectId) {
  const userDocument = await (
    await getUsersCollection()
  ).findOne({
    _id: typeof _id == "string" ? new ObjectId(_id) : _id,
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
  return (await getUsersCollection()).insertOne(convertToUserDocument(user));
}

async function deleteUserById(_id: string | ObjectId) {
  await (
    await getUsersCollection()
  ).deleteOne({ _id: typeof _id == "string" ? new ObjectId(_id) : _id });
}

export async function deleteUser(user: User) {
  await deleteUserById(convertToUserDocument(user)._id);
}

/**
 * Updates any of the user fields
 * @param userFieldsToUpdate an instance of User to update
 */
export async function updateUser(
  user: User,
  userFieldsToUpdate: Partial<User> | Partial<Developer> | Partial<Manager>
) {
  if (!user._id) {
    throw new Error("User doesn't have an id!");
  }

  const userDocument = convertToUserDocument(user);

  //Special case where changing account type
  if (
    userFieldsToUpdate.accountType &&
    userFieldsToUpdate.accountType !== user.accountType
  ) {
    //delete old user accountType from DB
    await deleteUser(user);
    /* Merge user with userFieldsToUpdate and add new user to DB
     * Since old user has an ObjectId in their _id field,
     * should just insert new document with same ObjectId as old one.
     */
    await addUser({ ...user, ...userFieldsToUpdate });
  } else {
    await (
      await getUsersCollection()
    ).updateOne({ _id: userDocument._id }, userFieldsToUpdate);
  }
}

/**
 * Updates a Developer's manager.
 * @param developer a Developer account
 * @param manager A Manager account to set developer's manager field to.
 * @returns results of operation.
 */
export async function updateManager(developer: Developer, manager: Manager) {
  return await updateUser(developer, {
    manager: manager._id,
  });
}

/**
 * Updates a Manager's developers
 * @param manager an instance of Manager.
 * @param developers an array of managers.
 * @returns results of operation.
 */
export async function updateDevelopers(
  manager: Manager,
  developers: Developer[]
) {
  return await updateUser(manager, {
    developers: developers.map(({ _id }) => _id as string),
  });
}
