import { Router } from "express";
import { topPlayersByGoals, topPlayersByVictories } from "./controller.js";

const statisticsRouter = new Router();

statisticsRouter.get("/top-goals/:num", topPlayersByGoals);
statisticsRouter.get("/top-victories/:num", topPlayersByVictories);

export default statisticsRouter;
