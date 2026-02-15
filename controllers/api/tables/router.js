import { Router } from "express";
import { generateQRCode, getTables } from "./controller.js";

const tablesRouter = Router();

tablesRouter.get("/", getTables);
tablesRouter.get("/:tableId/qr-code/", generateQRCode);

export default tablesRouter;
