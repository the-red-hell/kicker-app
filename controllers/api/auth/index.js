import { Router } from "express";
import { register, getProfile, login, logout } from "./authController.js";

const authRouter = new Router();

authRouter.get("/register", register);
authRouter.get("/login", login);
authRouter.get("/logout", logout);
authRouter.get("/profile", getProfile);

export default authRouter;
