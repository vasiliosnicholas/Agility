import type { User as AgilityUser } from "../../shared/models/Users.ts";

/**
 * Needed to define Express.User as our User interface.
 */
declare global {
  namespace Express {
    interface User extends AgilityUser {}
  }
}
