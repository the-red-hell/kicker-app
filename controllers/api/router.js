import { Router } from "express";
import apiAuthRouter from "./auth/router.js";
import playersRouter from "./players/router.js";
import tablesRouter from "./tables/router.js";

const apiRouter = Router();

apiRouter.use("/auth", apiAuthRouter);
apiRouter.use("/players", playersRouter);
apiRouter.use("/tables", tablesRouter);

export default apiRouter;
