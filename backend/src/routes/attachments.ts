import { Router } from "express";
import { AttachmentController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new AttachmentController();

router.post("/:entityType/:id", controller.addAttachment.bind(controller));
router.delete("/:entityType/:id/:attachmentId", controller.deleteAttachment.bind(controller));

export default router;
