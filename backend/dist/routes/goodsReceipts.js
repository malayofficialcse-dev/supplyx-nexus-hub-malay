import { Router } from "express";
import { GoodsReceiptController } from "../controllers/scm.controller.js";
const router = Router();
const controller = new GoodsReceiptController();
router.get("/", controller.getGoodsReceipts.bind(controller));
router.get("/:id", controller.getGoodsReceiptById.bind(controller));
router.post("/", controller.createGoodsReceipt.bind(controller));
export default router;
