import { Router } from "express";
import { WarehouseController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new WarehouseController();

router.get("/", controller.getWarehouses.bind(controller));

export default router;
