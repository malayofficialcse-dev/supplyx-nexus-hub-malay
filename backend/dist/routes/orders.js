import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
const router = Router();
const controller = new OrderController();
router.get("/", controller.getOrders.bind(controller));
router.post("/", controller.createOrder.bind(controller));
router.post("/:id/3way", controller.threeWayMatch.bind(controller));
export default router;
