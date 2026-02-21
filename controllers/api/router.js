import { Router } from "express";
import apiAuthRouter from "./auth/router.js";
import tablesRouter from "./tables/router.js";
import statisticsRouter from "./statistics/router.js";

const apiRouter = Router();

apiRouter.use("/auth", apiAuthRouter);
apiRouter.use("/tables", tablesRouter);
apiRouter.use("/statistics", statisticsRouter);

export default apiRouter;
