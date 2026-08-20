import { Router } from "express";
import { SupplierController, BudgetController } from "../controllers/supplier.controller.js";

const router = Router();
const controller = new SupplierController();
const budgetCtrl = new BudgetController();

// Supplier CRUD
router.get("/", controller.getSuppliers.bind(controller));
router.get("/:id/scorecard", controller.getScorecard.bind(controller));
router.get("/:id", controller.getSupplierById.bind(controller));
router.post("/", controller.createSupplier.bind(controller));
router.put("/:id", controller.updateSupplier.bind(controller));
router.delete("/:id", controller.deleteSupplier.bind(controller));

// Budget sub-router (mounted at /api/suppliers/budget)
router.get("/budget/summary", budgetCtrl.getBudgetSummary.bind(budgetCtrl));
router.get("/budget", budgetCtrl.getBudgets.bind(budgetCtrl));
router.post("/budget/recalculate-all", budgetCtrl.recalculateAllBudgets.bind(budgetCtrl));
router.patch("/budget/:id/recalculate", budgetCtrl.recalculateBudget.bind(budgetCtrl));
router.post("/budget", budgetCtrl.createBudget.bind(budgetCtrl));
router.put("/budget/:id", budgetCtrl.updateBudget.bind(budgetCtrl));
router.delete("/budget/:id", budgetCtrl.deleteBudget.bind(budgetCtrl));

export default router;
