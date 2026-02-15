import { Router } from "express";
import { authenticatedMiddleware } from "../common.js";
import { joinGame } from "./controller.js";

const gameRouter = new Router();
gameRouter.use(authenticatedMiddleware);

gameRouter.get("/", () => {
  // TODO: maybe show a list of active games to join?
});

gameRouter.get("/join", joinGame);

export default gameRouter;
