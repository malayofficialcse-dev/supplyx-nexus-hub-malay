import { Router } from "express";
import { RFQController } from "../controllers/rfq.controller.js";

const router = Router();
const controller = new RFQController();

router.get("/", controller.getRFQs.bind(controller));
router.get("/:id", controller.getRFQById.bind(controller));
router.post("/", controller.createRFQ.bind(controller));
router.patch("/:id", controller.updateRFQ.bind(controller));
router.delete("/:id", controller.deleteRFQ.bind(controller));
router.post("/:id/quotes", controller.addSupplierQuote.bind(controller));
router.post("/:id/award", controller.awardRFQ.bind(controller));

export default router;
