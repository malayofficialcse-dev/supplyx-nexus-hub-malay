import { SupplierService, BudgetService } from "../services/supplier.service.js";
const supplierService = new SupplierService();
const budgetService = new BudgetService();
export class SupplierController {
    async getSuppliers(req, res) {
        try {
            const list = await supplierService.getSuppliers();
            return res.json(list);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getSupplierById(req, res) {
        try {
            const detail = await supplierService.getSupplierById(req.params.id);
            if (!detail)
                return res.status(404).json({ error: "Supplier not found" });
            return res.json(detail);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createSupplier(req, res) {
        try {
            const { name, contact, email, phone, category, status } = req.body;
            if (!name)
                return res.status(400).json({ error: "Supplier name is required" });
            const created = await supplierService.createSupplier({
                name,
                contact,
                email,
                phone,
                category,
                status,
            });
            return res.status(201).json(created);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async updateSupplier(req, res) {
        try {
            const updated = await supplierService.updateSupplier(req.params.id, req.body);
            return res.json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async deleteSupplier(req, res) {
        try {
            const deleted = await supplierService.deleteSupplier(req.params.id);
            return res.json(deleted);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getScorecard(req, res) {
        try {
            const scorecard = await supplierService.computeSupplierScorecard(req.params.id);
            return res.json(scorecard);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export class BudgetController {
    async getBudgets(req, res) {
        try {
            return res.json(await budgetService.getBudgets());
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getBudgetSummary(req, res) {
        try {
            return res.json(await budgetService.getBudgetSummary());
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createBudget(req, res) {
        try {
            const { category, allocated, spent, year } = req.body;
            if (!category || !allocated)
                return res.status(400).json({ error: "category and allocated are required" });
            const created = await budgetService.createBudget({ category, allocated: parseFloat(allocated), spent: parseFloat(spent ?? 0), year: parseInt(year ?? new Date().getFullYear()) });
            return res.status(201).json(created);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async updateBudget(req, res) {
        try {
            return res.json(await budgetService.updateBudget(req.params.id, req.body));
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async deleteBudget(req, res) {
        try {
            return res.json(await budgetService.deleteBudget(req.params.id));
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
