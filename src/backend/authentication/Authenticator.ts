import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user ; //TODO: Add service functions
      if (!user) {
        return done(null, false);
      }
      if (!bcrypt.compare(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      done(error);
    }
  }),
);

passport.

export default passport;
