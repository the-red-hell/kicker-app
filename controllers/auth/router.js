import { Router } from "express";
import { logout } from "./controller.js";

const authRouter = new Router();

authRouter.get("/login", (_req, res) => {
  res.render("login", { title: "Login" });
});

authRouter.get("/register", (_req, res) => {
  res.render("register", { title: "Register" });
});

authRouter.get("/logout", logout);

export default authRouter;
