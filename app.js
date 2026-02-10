import express from "express";
import process from "process";
import "dotenv/config";
import console from "console";
import playersRouter from "./controllers/players/index.js";
import sessionRouter from "./controllers/session.js";
import expressSession from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool as pgPool } from "./models/index.js";

const pgSession = connectPgSimple(expressSession);

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "pug");

// session management
app.use(
  expressSession({
    secret: process.env.SESSION_COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5 * 24 * 60 * 60 * 1000 }, // 5 days
    store: new pgSession({
      pool: pgPool,
      createTableIfMissing: true,
      tableName: "user_session",
      ttl: 5 * 24 * 60 * 60 * 1000, // 5 days
      autoRemoveInterval: 60 * 60 * 1000, // Check for expired sessions every hour
    }),
  })
);

app.get("/", (_req, res) => {
  res.render("home", { title: "Home" });
  console.log("Received a request at /");
});

app.use("/players", playersRouter);
app.use("/session", sessionRouter);

const server = app.listen(PORT, () => {
  console.log(
    `Server started on: ${server.address().address}, port: ${server.address().port}`
  );
});
