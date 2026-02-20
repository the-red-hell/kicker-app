import { Router } from "express";
import { generateQRCode, getTables } from "./controller.js";
import { checkAuthenticationMiddleware } from "../../common.js";

const tablesRouter = Router();

tablesRouter.use(checkAuthenticationMiddleware);

tablesRouter.get("/:tableId", getTables);
tablesRouter.get("/:tableId/qr-code/", generateQRCode);

export default tablesRouter;
