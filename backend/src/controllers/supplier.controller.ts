import { Request, Response } from "express";
import { SupplierService, BudgetService } from "../services/supplier.service.js";

const supplierService = new SupplierService();
const budgetService = new BudgetService();

export class SupplierController {
  async getSuppliers(req: Request, res: Response) {
    try {
      const list = await supplierService.getSuppliers();
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getSupplierById(req: Request, res: Response) {
    try {
      const detail = await supplierService.getSupplierById(req.params.id);
      if (!detail) return res.status(404).json({ error: "Supplier not found" });
      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createSupplier(req: Request, res: Response) {
    try {
      const { name, contact, email, phone, category, status } = req.body;
      if (!name) return res.status(400).json({ error: "Supplier name is required" });
      const created = await supplierService.createSupplier({
        name,
        contact,
        email,
        phone,
        category,
        status,
      });
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateSupplier(req: Request, res: Response) {
    try {
      const updated = await supplierService.updateSupplier(req.params.id, req.body);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteSupplier(req: Request, res: Response) {
    try {
      const deleted = await supplierService.deleteSupplier(req.params.id);
      return res.json(deleted);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getScorecard(req: Request, res: Response) {
    try {
      const scorecard = await supplierService.computeSupplierScorecard(req.params.id);
      return res.json(scorecard);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class BudgetController {
  async getBudgets(req: Request, res: Response) {
    try {
      return res.json(await budgetService.getBudgets());
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getBudgetSummary(req: Request, res: Response) {
    try {
      return res.json(await budgetService.getBudgetSummary());
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createBudget(req: Request, res: Response) {
    try {
      const { category, allocated, spent, year } = req.body;
      if (!category || !allocated) return res.status(400).json({ error: "category and allocated are required" });
      const created = await budgetService.createBudget({ category, allocated: parseFloat(allocated), spent: parseFloat(spent ?? 0), year: parseInt(year ?? new Date().getFullYear()) });
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateBudget(req: Request, res: Response) {
    try {
      return res.json(await budgetService.updateBudget(req.params.id, req.body));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteBudget(req: Request, res: Response) {
    try {
      return res.json(await budgetService.deleteBudget(req.params.id));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async recalculateBudget(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await budgetService.recalculateBudget(id);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async recalculateAllBudgets(req: Request, res: Response) {
    try {
      const results = await budgetService.recalculateAllBudgets();
      return res.json(results);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
