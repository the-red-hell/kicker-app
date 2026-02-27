import { Router } from "express";
import { checkAuthenticationMiddleware } from "./common.js";

const dashboardRouter = new Router();
dashboardRouter.use(checkAuthenticationMiddleware);

dashboardRouter.get("/", (req, res) => {
    res.render("dashboard", { title: "dashboard" });
});

export default dashboardRouter;
