import { Router } from "express";
import { ShipmentController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new ShipmentController();

router.get("/", controller.getShipments.bind(controller));

export default router;
