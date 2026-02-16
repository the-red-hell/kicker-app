import { Router } from "express";
import { checkAuthenticationMiddleware } from "../../common.js";
import { startGame } from "./controller.js";

const gamesRouter = new Router();

gamesRouter.use(checkAuthenticationMiddleware);

gamesRouter.post("/start", startGame);

export default gamesRouter;
