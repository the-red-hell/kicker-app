import { Router } from "express";
import console from "console";
import apiRouter from "./api/router.js";

const homeRouter = Router();

homeRouter.use((req, res, next) => {
  res.locals.loggedIn = req.session.userId ? true : false;
  next();
});

homeRouter.get("/", (_req, res) => {
  res.render("home", { title: "Home" });
  console.log("Received a request at /");
});

homeRouter.use("/api", apiRouter);

export default homeRouter;