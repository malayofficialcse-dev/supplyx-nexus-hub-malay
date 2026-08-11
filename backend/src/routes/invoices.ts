import { Router } from "express";
import { InvoiceController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new InvoiceController();

router.get("/", controller.getInvoices.bind(controller));
router.get("/:id", controller.getInvoiceById.bind(controller));
router.post("/", controller.createInvoice.bind(controller));

export default router;
