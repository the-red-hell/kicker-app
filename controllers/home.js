import { Router } from "express";
import console from "console";
import apiRouter from "./api/router.js";
import gameRouter from "./game/router.js";

const mainRouter = Router();

mainRouter.use((req, res, next) => {
  res.locals.loggedIn = req.session.userId ? true : false;
  next();
});

mainRouter.get("/", (_req, res) => {
  res.render("home", { title: "Home" });
  console.log("Received a request at /");
});

mainRouter.use("/game", gameRouter);
mainRouter.use("/api", apiRouter);

export default mainRouter;
