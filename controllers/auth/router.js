import { Router } from "express";
import { logout } from "./controller.js";

const authRouter = new Router();

authRouter.get("/login", (_req, res) => {
    res.render("auth/login", { title: "Login" });
});

authRouter.get("/register", (_req, res) => {
    res.render("auth/register", { title: "Register" });
});

authRouter.get("/logout", logout);

export default authRouter;
