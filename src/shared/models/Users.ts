// export type DeveloperAccountType = "Developer";
// export type ManagerAccountType = "Manager";

/**
 * For use when getting user from collection
 */

export const AccountTypes = {
  Developer: "Developer",
  Manager: "Manager",
};

export interface User {
  _id: string | undefined;
  accountType: string;
  name: string;
  username: string;
  email: string;
  password?: string;
}

export type UserMetaData = Pick<User, "_id" | "name" | "username" | "email">;

// export interface DeveloperAccountSchema extends User {
// } //add any developer specific fields to this schema.

export interface ManagerAccountSchema extends User {
  developers: Array<string>; //Will be array of MongoDB ObjectId
}

export abstract class AbstractUserAccount implements User {
  _id: string | undefined;
  accountType: string;
  name: string;
  username: string;
  email: string;
  password?: string;

  constructor(
    accountType: string,
    name: string,
    userName: string,
    email: string,
    password: string
  ) {
    this._id = undefined;
    this.accountType = accountType;
    this.name = name;
    this.username = userName;
    this.email = email;
    this.password = password;
  }
}

export class DeveloperAccount extends AbstractUserAccount {
  // implements DeveloperAccountSchema
  constructor(name: string, username: string, email: string, password: string) {
    super(AccountTypes.Developer, name, username, email, password);
  }
}

export class ManagerAccount
  extends AbstractUserAccount
  implements ManagerAccountSchema
{
  developers: string[];

  constructor(name: string, username: string, email: string, password: string) {
    super(AccountTypes.Manager, name, username, email, password);
    this.developers = new Array<string>();
  }
}
