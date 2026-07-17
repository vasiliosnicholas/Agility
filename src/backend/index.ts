import express from "express";
import session from "express-session";
import Authenticator from "./authentication/Authenticator.ts";
import path from "path";
import { AuthenticationGuard } from "./middleware/AuthenticationMiddleware.ts";
import AuthRouter from "./routes/Auth.ts";
import UsersRouter from "./routes/Users.ts";
import KanbanRouter from "./routes/Kanban.ts";

const SESSION_AGE_IN_HOURS = 0.5;

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./frontend/dist"));

// Session configuration
app.use(
  session({
    secret: "your-secret-key-change-in-production", //TODO: decide what to do for this maybe use crypto or bcrypt again
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV == "production", //set to true based on env variable
      httpOnly: true,
      maxAge: SESSION_AGE_IN_HOURS * 60 * 60 * 1000,
    },
  }),
);

app.use(Authenticator.initialize());
app.use(Authenticator.session());
//TODO: Add routes/routers here
app.use("/api/auth", AuthRouter);
app.use("/api/users", UsersRouter);
app.use("/api/kanban", KanbanRouter);

/**
 * Add any public routes to this array
 */
const PUBLIC_ROUTES = ["/login", "/unauthorized"];
for (const route of PUBLIC_ROUTES) {
  app.get(route, (req, res) => {
    res.sendFile(path.resolve("./frontend/dist", "index.html"));
  });
}

//for all other routes, serve index.html if authenticated
app.get("*splat", AuthenticationGuard, (req, res) => {
  res.sendFile(path.resolve("./frontend/dist", "index.html"));
});

if (process.env.NODE_ENV == "production") {
  app.listen(PORT, () => {
    console.log(`Agility server running on ${PORT}`);
  });
} else {
  app.listen(typeof PORT === "string" ? parseInt(PORT) : PORT, HOST, () => {
    console.log(`Agility server running on http://${HOST}:${PORT}`);
  });
}
