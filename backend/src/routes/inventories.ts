import { Router } from "express";
import { InventoryController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new InventoryController();

router.get("/", controller.getInventories.bind(controller));
router.get("/warehouse/:warehouseId", controller.getInventoryByWarehouse.bind(controller));

export default router;
