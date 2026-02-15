import { Router } from "express";
import { authenticatedMiddleware } from "../common.js";
import { joinGame } from "./controller.js";

const gameRouter = new Router();
gameRouter.use(authenticatedMiddleware);

gameRouter.get("/", (req, res) => {
  res.render("game", { title: "Game" });
});

gameRouter.get("/join", joinGame);

export default gameRouter;
