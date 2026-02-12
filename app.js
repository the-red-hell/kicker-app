import express from "express";
import process from "process";
import "dotenv/config";
import console from "console";
import apiRouter from "./controllers/api/router.js";
import expressSession from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool as pgPool } from "./models/index.js";

const PG_SESSION = connectPgSimple(expressSession);

const APP = express();
const PORT = process.env.PORT || 3000;

// Middleware setup for json and urlencoded form data
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));

APP.set("view engine", "pug");

// session management
APP.use(
  expressSession({
    secret: process.env.SESSION_COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    store: new PG_SESSION({
      pool: pgPool,
      createTableIfMissing: true,
      tableName: "user_session",
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      autoRemoveInterval: 60 * 60 * 1000, // Check for expired sessions every hour
    }),
  })
);

APP.get("/", (_req, res) => {
  res.render("home", { title: "Home" });
  console.log("Received a request at /");
});

APP.use("/api", apiRouter);

const server = APP.listen(PORT, () => {
  console.log(
    `Server started on: ${server.address().address}, port: ${server.address().port}`
  );
});
