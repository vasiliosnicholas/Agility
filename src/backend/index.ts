import express, { type RequestHandler } from "express";
import session from "express-session";
import Authenticator from "./authentication/Authenticator.ts";
import path from "path";
import {
  AuthenticationGuard,
  AccountTypeGuardFactoryFunction,
} from "./middleware/AuthenticationMiddleware.ts";
import AuthRouter from "./routes/Auth.ts";
import KanbanRouter from "./routes/Kanban.ts";
import PhasesRouter from "./routes/Phases.ts";
import DevelopersRouter from "./routes/Developers.ts";
import { AccountTypes } from "../shared/models/Users.ts";

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

//Assert SESSION_SECRET environmental variable exists
if (process.env.NODE_ENV == "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET required during production");
}
const SESSION_SECRET = process.env.SESSION_SECRET || "your-secret-key";

//Optional SESSION_AGE environmental variable.
const SESSION_AGE_IN_HOURS = process.env.SESSION_AGE_IN_HOURS
  ? parseFloat(process.env.SESSION_AGE_IN_HOURS)
  : 0.5;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./frontend/dist"));

// Session configuration
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV == "production", //set to true based on env variable
      httpOnly: true,
      maxAge: SESSION_AGE_IN_HOURS * 60 * 60 * 1000,
    },
  })
);

app.set("trust proxy", 1);

app.use(Authenticator.initialize());
app.use(Authenticator.session());
app.use("/api/auth", AuthRouter);
app.use("/api/kanban", KanbanRouter);
app.use("/api/phases", PhasesRouter);
app.use("/api/developers", DevelopersRouter);

const serveSinglePage: RequestHandler = (req, res) =>
  res.sendFile(path.resolve("./frontend/dist", "index.html"));

/**
 * Helper function for linking the SPA back to index.html
 * @param routes an Array of strings representing routes.
 * @param middleware an Array of Express.RequestHandlers to add to the middleware stack prior to serving the page.
 */
function serveSinglePageAppPages(
  routes: string[],
  middleware?: RequestHandler[]
) {
  for (const route of routes) {
    if (middleware) {
      app.get(route, ...middleware, serveSinglePage);
    } else {
      app.get(route, serveSinglePage);
    }
  }
}

/**
 * Add any public routes to this array
 */
const PUBLIC_ROUTES = ["/login", "/unauthorized"];
serveSinglePageAppPages(PUBLIC_ROUTES);

/**
 * Serve index.html IFF authenticated
 */
const AUTH_GUARDED_ROUTES = ["/kanban"];
serveSinglePageAppPages(AUTH_GUARDED_ROUTES, [AuthenticationGuard]);

/**
 * Serve Manager pages IFF User is Manager
 */
const MANAGER_PAGES = ["/team", "/phases"];
serveSinglePageAppPages(
  MANAGER_PAGES,
  AccountTypeGuardFactoryFunction(AccountTypes.Manager)
);

/**
 * catch all
 * react-router will serve the Not Found page
 */
serveSinglePageAppPages(["*splat"]);

if (process.env.NODE_ENV == "production") {
  app.listen(PORT, () => {
    console.log(`Agility server running on ${PORT}`);
  });
} else {
  app.listen(typeof PORT === "string" ? parseInt(PORT) : PORT, HOST, () => {
    console.log(`Agility server running on http://${HOST}:${PORT}`);
  });
}
