import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";

const router = Router();
const controller = new OrderController();

router.get("/", controller.getOrders.bind(controller));
router.post("/", controller.createOrder.bind(controller));

export default router;
