import { Router } from "express";
import { CustomerController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new CustomerController();

router.get("/", controller.getCustomers.bind(controller));

export default router;
