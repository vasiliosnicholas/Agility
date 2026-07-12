import express from "express";
import session from "express-session";
import path from "path";

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./frontend/dist"));

//TODO: Add routes, middleware, db connection, and passport here
app.get("/api", (req, res) => res.send("API should show up here"));

//for all other routes, serve index.html
app.get("*splat", (req, res) => {
  res.sendFile(path.resolve("./frontend/dist", "index.html"));
});

if (process.env.NODE_ENV == "production") {
  app.listen(PORT, () => {
    console.log(`Agility server running on ${PORT}`);
  });
} else {
  app.listen(PORT, HOST, () => {
    console.log(`Agility server running on http://${HOST}:${PORT}`);
  });
}
