import { Router } from "express";
import apiAuthRouter from "./auth/router.js";
import tablesRouter from "./tables/router.js";

const apiRouter = Router();

apiRouter.use("/auth", apiAuthRouter);
apiRouter.use("/tables", tablesRouter);

export default apiRouter;
