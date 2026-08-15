import { Router } from "express";
import { LogisticsController } from "../controllers/scm.controller.js";
const router = Router();
const controller = new LogisticsController();
router.get("/", controller.getLogistics.bind(controller));
export default router;
