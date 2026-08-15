import { ObjectId, type MatchKeysAndValues } from "mongodb";
import {
  type Developer,
  type Manager,
  type User,
  type UserAccountUpdate,
  type UserMetaData,
  AccountTypes,
} from "../../shared/models/Users.ts";
import {
  convertToUser,
  convertToUserDocument,
  getUsersCollection,
  type UserDocument,
} from "./Database.ts";
import { unassignUserFromTickets } from "./TicketOperations.ts";

async function getUsersHelper(query: object = {}) {
  return (await getUsersCollection()).find(query);
}

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
  await Promise.all([
    (await getUsersCollection()).deleteOne({
      _id: typeof _id == "string" ? new ObjectId(_id) : _id,
    }),
    unassignUserFromTickets(_id),
  ]);
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
  userFieldsToUpdate: UserAccountUpdate
) {
  if (!user._id) {
    throw new Error("User doesn't have an id!");
  }
  if (!userFieldsToUpdate) {
    throw new Error("No fields to update");
  }

  if (userFieldsToUpdate.newPassword)
    userFieldsToUpdate = {
      ...userFieldsToUpdate,
      password: userFieldsToUpdate.newPassword,
    };
  delete userFieldsToUpdate.newPassword;
  delete userFieldsToUpdate.confirmNewPassword;

  const userDocument = convertToUserDocument(user);
  return await (
    await getUsersCollection()
  ).updateOne(
    { _id: userDocument._id },
    {
      $set: userFieldsToUpdate as MatchKeysAndValues<
        UserDocument & Developer & Manager
      >,
    }
  );
}

/**
 * Updates a Developer's manager.
 * @param developer a Developer account
 * @param manager A Manager account to set developer's manager field to.
 * @returns results of operation.
 */
export async function updateManager(
  developer: Developer,
  manager: Manager | null
) {
  return !manager
    ? await Promise.all([
        updateUser(developer, {
          manager: undefined,
        }),
        unassignUserFromTickets(developer._id),
      ])
    : await updateUser(developer, {
        manager: manager ? manager._id : undefined,
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
  developers: Developer[] | undefined
) {
  if (!manager._id) {
    throw new Error("User doesn't have an id!");
  }
  return await updateUser(manager, {
    developers: developers
      ? (developers.map(({ _id }) => _id) as string[])
      : [],
  });
}
