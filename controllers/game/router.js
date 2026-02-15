import { Router } from "express";
import { checkAuthenticationMiddleware } from "../common.js";
import { gamePage, joinGame } from "./controller.js";

const gameRouter = new Router();
gameRouter.use(checkAuthenticationMiddleware);

gameRouter.get("/", gamePage);
gameRouter.get("/:tableId", joinGame);

export default gameRouter;
