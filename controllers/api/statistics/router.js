import { Router } from "express";
import { topPlayersByGoals } from "./controller.js";

const statisticsRouter = new Router();

statisticsRouter.get("/top-goals/:num", topPlayersByGoals);

export default statisticsRouter;
