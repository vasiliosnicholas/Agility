// export type DeveloperAccountType = "Developer";
// export type ManagerAccountType = "Manager";

/**
 * For use when getting user from collection
 * or just simply keeping track of account types accross
 * multiple modules
 */
export const AccountTypes = {
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

/**
 * For extracting/receiving user metadata.
 */
export type UserMetaData = Pick<User, "_id" | "name" | "username" | "email">;

/**
 * Developer type
 */
export interface Developer extends User {
  manager: string | undefined; //wil be either a ObjectId or null in MongoDb
}

/**
 * Manager type
 */
export interface Manager extends User {
  developers: Array<string>; //Will be array of MongoDB ObjectId
}

abstract class AbstractUserAccount implements User {
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

class DeveloperAccount extends AbstractUserAccount implements Developer {
  manager: string | undefined; //stores id of developer's manager, by default null until manager assigns them.
  constructor(user: UserPrototype) {
    super({ accountType: AccountTypes.Developer, ...user });
  }
}

class ManagerAccount extends AbstractUserAccount implements Manager {
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
