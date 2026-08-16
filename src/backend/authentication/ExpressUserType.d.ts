import type { User as AgilityUser } from "../../shared/models/Users.ts";

/**
 * Needed to define Express.User as our User interface.
 */
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AgilityUser {}
  }
}
