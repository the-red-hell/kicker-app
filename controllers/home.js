import { Router } from "express";
import console from "console";
import apiRouter from "./api/router.js";
import gameRouter from "./game/router.js";
import authenticationRouter from "./authentication/router.js";
import aboutUs from "./aboutUs.js";

const mainRouter = Router();

mainRouter.use((req, res, next) => {
  res.locals.loggedIn = req.session.userId ? true : false;
  next();
});

mainRouter.get("/", (_req, res) => {
  res.render("home", { title: "Home" });
  console.log("Received a request at /");
});

mainRouter.get("/view-profile", (_req, res) => {
  res.render("view-profile", { title: "Profile" });
});

mainRouter.use("/game", gameRouter);
mainRouter.use("/api", apiRouter);
mainRouter.use("/auth", authenticationRouter);
mainRouter.get("/aboutUs", aboutUs);

export default mainRouter;
