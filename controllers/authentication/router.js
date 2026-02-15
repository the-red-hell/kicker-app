import { Router } from "express";
import { logout } from "./controller.js";

const authenticationRouter = new Router();

authenticationRouter.get("/login", (_req, res) => {
  res.render("login", { title: "Login" });
});

authenticationRouter.get("/logout", logout);

export default authenticationRouter;
