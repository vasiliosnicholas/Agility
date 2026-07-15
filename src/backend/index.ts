import express from "express";
import session from "express-session";
import Authenticator from "./authentication/Authenticator.ts";
import path from "path";

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./frontend/dist"));

//TODO: Add routes, middleware, db connection, and passport here
app.use(Authenticator.initialize());
app.use(Authenticator.session());
app.get("/api", (req, res) => res.send("API should show up here"));

// Session configuration
app.use(
  session({
    secret: "your-secret-key-change-in-production", //TODO: decide what to do for this maybe use crypto or bcrypt again
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV == "production", //set to true based on env variable
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

//for all other routes, serve index.html
app.get("*splat", (req, res) => {
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
