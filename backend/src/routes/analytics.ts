import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";

const router = Router();
const controller = new AnalyticsController();

router.get("/dashboard", controller.getDashboardAnalytics.bind(controller));

export default router;
