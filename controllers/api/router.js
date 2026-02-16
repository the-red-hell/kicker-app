import { Router } from "express";
import apiAuthRouter from "./auth/router.js";
import tablesRouter from "./tables/router.js";
import gamesRouter from "./games/router.js";

const apiRouter = Router();

apiRouter.use("/auth", apiAuthRouter);
apiRouter.use("/tables", tablesRouter);
apiRouter.use("/games", gamesRouter);

export default apiRouter;
