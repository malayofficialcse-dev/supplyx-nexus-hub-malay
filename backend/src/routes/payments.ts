import { Router } from "express";
import { PaymentController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new PaymentController();

router.get("/", controller.getPayments.bind(controller));
router.get("/:id", controller.getPaymentById.bind(controller));

export default router;
