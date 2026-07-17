// export type DeveloperAccountType = "Developer";
// export type ManagerAccountType = "Manager";

/**
 * For use when getting user from collection
 */

export type AccountTypeEnum = Record<string, string>;

export const AccountTypes: AccountTypeEnum = {
  Developer: "Developer",
  Manager: "Manager",
};

export interface UserPrototype {
  name: string;
  username: string;
  email: string;
  password?: string;
}

export interface BaseUser extends UserPrototype {
  accountType: string;
}

export interface User extends BaseUser {
  _id: string | undefined;
}

export type UserMetaData = Pick<User, "_id" | "name" | "username" | "email">;

export interface DeveloperAccountSchema extends User {
  manager: string | undefined;
} //add any developer specific fields to this schema.

export interface ManagerAccountSchema extends User {
  developers: Array<string>; //Will be array of MongoDB ObjectId
}

export abstract class AbstractUserAccount implements User {
  _id: string | undefined;
  accountType: string;
  name: string;
  username: string;
  email: string;
  password: string;

  constructor({ accountType, name, username, email, password }: BaseUser) {
    this._id = undefined;
    this.accountType = accountType;
    this.name = name;
    this.username = username;
    this.email = email;
    if (!password)
      throw new Error("Cannot create UserAccount without password!");
    this.password = password;
  }
}

class DeveloperAccount
  extends AbstractUserAccount
  implements DeveloperAccountSchema
{
  manager: string | undefined; //stores id of developer's manager, by default null until manager assigns them.
  constructor(user: UserPrototype) {
    super({ accountType: AccountTypes.Developer, ...user });
  }
}

class ManagerAccount
  extends AbstractUserAccount
  implements ManagerAccountSchema
{
  developers: string[];
  constructor(user: UserPrototype) {
    super({ accountType: AccountTypes.Manager, ...user });
    this.developers = new Array<string>(); //stores id's of developers
  }
}

export function createUser({ accountType, ...userPrototype }: BaseUser) {
  switch (accountType) {
    case AccountTypes.Developer:
      return new DeveloperAccount(userPrototype);
    case AccountTypes.Manager:
      return new ManagerAccount(userPrototype);
    default:
      throw new Error("Incorrect account type!");
  }
}
