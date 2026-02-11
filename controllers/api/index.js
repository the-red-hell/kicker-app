import { Router } from "express";
import authRouter from "./auth/index.js";
import playersRouter from "./players/index.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.get("/players", playersRouter);
