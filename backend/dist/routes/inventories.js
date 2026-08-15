import { Router } from "express";
import { InventoryController } from "../controllers/scm.controller.js";
const router = Router();
const controller = new InventoryController();
router.get("/alerts", controller.getStockAlerts.bind(controller));
router.get("/", controller.getInventories.bind(controller));
router.get("/warehouse/:warehouseId", controller.getInventoryByWarehouse.bind(controller));
export default router;
