import { Router } from "express";
import { register, getProfile, login } from "./controller.js";

const apiAuthRouter = new Router();

apiAuthRouter.post("/register", register);
apiAuthRouter.post("/login", login);
apiAuthRouter.get("/profile", getProfile);

export default apiAuthRouter;
