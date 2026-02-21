import { Router } from "express";
import { checkAuthenticationMiddleware } from "../common.js";
import { viewProfilePage } from "./controller.js";

const profileRouter = new Router();

profileRouter.use(checkAuthenticationMiddleware);

profileRouter.get("/", viewProfilePage);

export default profileRouter;
