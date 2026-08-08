import { Router } from "express";
import { RequisitionController } from "../controllers/requisition.controller.js";

const router = Router();
const controller = new RequisitionController();

router.get("/", controller.getRequisitions.bind(controller));
router.post("/", controller.createRequisition.bind(controller));

export default router;
