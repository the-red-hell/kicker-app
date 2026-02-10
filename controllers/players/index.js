import { Router } from "express";
import { getPlayerById } from "./retrieval.js";

const playersRouter = new Router();

playersRouter.get("/player/:id", getPlayerById);

export default playersRouter;
