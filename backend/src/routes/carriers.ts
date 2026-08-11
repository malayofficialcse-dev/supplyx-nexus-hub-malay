import { Router } from "express";
import { CarrierController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new CarrierController();

router.get("/", controller.getCarriers.bind(controller));
router.get("/:id", controller.getCarrierById.bind(controller));
router.post("/", controller.createCarrier.bind(controller));
router.put("/:id", controller.updateCarrier.bind(controller));
router.patch("/:id", controller.updateCarrier.bind(controller));
router.delete("/:id", controller.deleteCarrier.bind(controller));

export default router;
