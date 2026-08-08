import { Router } from "express";
import { RFQController } from "../controllers/rfq.controller.js";

const router = Router();
const controller = new RFQController();

router.get("/", controller.getRFQs.bind(controller));
router.post("/", controller.createRFQ.bind(controller));

export default router;
