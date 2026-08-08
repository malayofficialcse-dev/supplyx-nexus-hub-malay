import { Router } from "express";
import { CarrierController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new CarrierController();

router.get("/", controller.getCarriers.bind(controller));

export default router;
