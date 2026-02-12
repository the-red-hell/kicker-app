import { Router } from "express";
import { register, getProfile, login, logout } from "./authController.js";

const authRouter = new Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/profile", getProfile);

export default authRouter;
