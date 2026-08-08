import { Router } from "express";
import { ContractController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new ContractController();

router.get("/", controller.getContracts.bind(controller));

export default router;
