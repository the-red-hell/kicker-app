import express from "express";
import process from "process";
import "dotenv/config";
import console from "console";
import expressSession from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool as pgPool } from "./models/index.js";
import mainRouter from "./controllers/home.js";
import { createServer as createHttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import gameSocket from "./controllers/api/game-socket/socket.js";

const PG_SESSION = connectPgSimple(expressSession);

const APP = express();
const PORT = process.env.PORT || 3000;
// we need socket.io for websockets
const SERVER = createHttpServer(APP);
const SOCKET_IO = new SocketIOServer(SERVER, { path: "/api/game-socket" });

// Middleware setup for json and urlencoded form data
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));

APP.set("view engine", "pug");

// session management
const sessionMiddleware = expressSession({
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
});

APP.use(sessionMiddleware);
SOCKET_IO.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

APP.use("/", mainRouter);
SOCKET_IO.on("connection", (socket) => gameSocket(SOCKET_IO, socket));

SERVER.listen(PORT, () => {
  console.log(
    `Server started on: ${SERVER.address().address}, port: ${SERVER.address().port}`
  );
});
