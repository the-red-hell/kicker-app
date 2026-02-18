import { Router } from "express";
import console from "console";
import apiRouter from "./api/router.js";
import gameRouter from "./game/router.js";
import authRouter from "./auth/router.js";
import aboutUs from "./aboutUs.js";
import profileRouter from "./profile/router.js";

const mainRouter = Router();

mainRouter.use((req, res, next) => {
  res.locals.loggedIn = req.session.userId ? true : false;
  next();
});

mainRouter.get("/", (_req, res) => {
  res.render("home", { title: "Home" });
  console.log("Received a request at /");
});

mainRouter.use("/profile", profileRouter);
mainRouter.use("/game", gameRouter);
mainRouter.use("/api", apiRouter);
mainRouter.use("/auth", authRouter);
mainRouter.get("/about-us", aboutUs);

export default mainRouter;
