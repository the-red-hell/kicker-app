import { Router } from "express";
import { authenticatedMiddleware } from "../common.js";

const gameRouter = new Router();
gameRouter.use(authenticatedMiddleware);

gameRouter.get("/", (req, res) => {
  res.render("game", { title: "Game" });
});

export default gameRouter;
