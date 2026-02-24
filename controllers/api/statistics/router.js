import { Router } from "express";
import {
  topPlayersByAvgGoals,
  topPlayersByVictories,
  topPlayersByAbsolutes,
} from "./controller.js";

const statisticsRouter = new Router();

statisticsRouter.get("/top-victories", topPlayersByVictories);
statisticsRouter.get("/top-avg-goals", topPlayersByAvgGoals);
statisticsRouter.get("/top-absolutes", topPlayersByAbsolutes);

export default statisticsRouter;
