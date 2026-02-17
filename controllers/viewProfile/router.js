import { Router } from "express";
import { checkAuthenticationMiddleware } from "../common";

const profileRouter = new Router();

profileRouter.use(checkAuthenticationMiddleware);

profileRouter.get("/", (_req, res) => {
  res.render("profile", { title: "Profile" });
});

export default profileRouter;
