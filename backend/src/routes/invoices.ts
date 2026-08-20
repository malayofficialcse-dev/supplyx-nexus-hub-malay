import { Router } from "express";
import { InvoiceController } from "../controllers/scm.controller.js";
import { ThreeWayMatchController } from "../controllers/threeWayMatch.controller.js";

const router = Router();
const controller = new InvoiceController();
const matchController = new ThreeWayMatchController();

router.get("/check-duplicate", controller.checkDuplicate.bind(controller));
router.get("/matching/summary", matchController.getMatchingSummary.bind(matchController));
router.get("/:id/three-way-match", matchController.getInvoiceMatchReport.bind(matchController));
router.post("/:id/resolve-match", matchController.resolveMatch.bind(matchController));
router.get("/:id/pdf", controller.downloadPdf.bind(controller));
router.get("/", controller.getInvoices.bind(controller));
router.get("/:id", controller.getInvoiceById.bind(controller));
router.post("/:id/pay", controller.payInvoice.bind(controller));
router.post("/", controller.createInvoice.bind(controller));
router.put("/:id", controller.updateInvoice.bind(controller));
router.delete("/:id", controller.deleteInvoice.bind(controller));

export default router;

