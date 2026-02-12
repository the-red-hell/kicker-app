import { Router } from "express";
import authRouter from "./auth/router.js";
import playersRouter from "./players/router.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/players", playersRouter);

export default apiRouter;
