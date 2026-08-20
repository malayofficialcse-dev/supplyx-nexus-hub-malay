import { Router } from "express";
import { ContractController } from "../controllers/scm.controller.js";

const router = Router();
const controller = new ContractController();

router.get("/expiring", controller.getExpiringContracts.bind(controller));
router.post("/auto-expire", controller.autoExpire.bind(controller));
router.get("/", controller.getContracts.bind(controller));
router.get("/:id", controller.getContractById.bind(controller));
router.post("/", controller.createContract.bind(controller));
router.put("/:id", controller.updateContract.bind(controller));
router.patch("/:id", controller.updateContract.bind(controller));
router.delete("/:id", controller.deleteContract.bind(controller));

export default router;
