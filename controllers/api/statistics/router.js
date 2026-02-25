import { Router } from "express";
import { topPlayersStats } from "./controller.js";

const statisticsRouter = new Router();

statisticsRouter.get("/top-players", topPlayersStats);

export default statisticsRouter;
