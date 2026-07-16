import passport from "passport";
import { Strategy as LocalStrategy, type VerifyFunction } from "passport-local";
import {
  getUserById,
  getUserByUserNameAdmin,
} from "../database/UserOperations.ts";
import type { User } from "../../shared/models/Users.ts";
import { validatePassword } from "./CredentialsManager.ts";

type AsyncVerifyFunction = (
  ...args: Parameters<VerifyFunction>
) => Promise<void>;

const MESSAGE = { message: "Username or password incorrect" };

const handleAuthentication: AsyncVerifyFunction = async (
  username,
  password,
  done
) => {
  try {
    const user = await getUserByUserNameAdmin(username);
    if (!user) {
      //user doesn't exist
      return done(null, false, MESSAGE);
    }
    if (!user.password) {
      //user doesn't have a password, critical error.
      //this would happen if user document doesn't have password in mongodb.
      throw new Error("Error authenticating. Database Corruption.");
    }
    const isValid = await validatePassword(password, user.password);
    if (isValid) {
      //password matches
      delete user.password;
      return done(null, user);
    }
    return done(null, false, MESSAGE); //password didn't match
  } catch (error) {
    return done(error);
  }
};

passport.use(
  new LocalStrategy(
    handleAuthentication as (...args: Parameters<VerifyFunction>) => void
  )
);

passport.serializeUser((user: User, done) => {
  done(null, user._id);
});

async function deserializeUser(
  _id: string,
  done: (err: any, user?: false | Express.User | null) => void
) {
  try {
    const user = await getUserById(_id);
    done(null, user);
  } catch (error) {
    done(error);
  }
}
passport.deserializeUser<string>((id, done) => void deserializeUser(id, done));

export default passport;
