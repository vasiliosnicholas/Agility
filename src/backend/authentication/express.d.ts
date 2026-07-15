import type { User as AgilityUser } from "../../shared/models/Users.ts";

declare global {
  namespace Express {
    interface User extends AgilityUser {}
  }
}
