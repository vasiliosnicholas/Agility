import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy, type VerifyFunction } from "passport-local";
import {
  getUserById,
  getUserByUserNameAdmin,
} from "../database/UserOperations.ts";
import type { User } from "../../shared/models/Users.ts";
type AsyncVerifyFunction = (
  ...args: Parameters<VerifyFunction>
) => Promise<void>;

const handleAuthentication: AsyncVerifyFunction = async (
  username,
  password,
  done
) => {
  try {
    const user = await getUserByUserNameAdmin(username);
    if (!user) {
      return done(null, false);
    }
    if (!user.password) {
      //this would happen if user document doesn't have password in mongodb.
      throw new Error("Error authenticating. Database Corruption.");
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      delete user.password;
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error);
  }
};
passport.use(
  new LocalStrategy(
    (username, password, done) =>
      void handleAuthentication(username, password, done)
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
