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

const LOGOUT_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const PORT = process.env.PORT || 3000;

const PG_SESSION = connectPgSimple(expressSession);

const app = express();
// we need socket.io for websockets
const server = createHttpServer(app);
const socketIo = new SocketIOServer(server, { path: "/api/game-socket" });

// Middleware setup for json and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");

// session management
const sessionMiddleware = expressSession({
    secret: process.env.SESSION_COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: LOGOUT_TIME },
    store: new PG_SESSION({
        pool: pgPool,
        createTableIfMissing: true,
        tableName: "user_session",
        ttl: LOGOUT_TIME,
        autoRemoveInterval: 60 * 60 * 1000, // Check for expired sessions every hour
    }),
});

app.use(sessionMiddleware);
socketIo.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

app.use("/", mainRouter);
socketIo.on("connection", (socket) => gameSocket(socketIo, socket));

server.listen(PORT, () => {
    console.log(
        `Server started on: ${server.address().address}, port: ${server.address().port}`
    );
});
