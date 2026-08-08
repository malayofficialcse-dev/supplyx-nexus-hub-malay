import { getCache, setCache } from "../lib/redis.js";
import { RequisitionRepository } from "../repositories/requisition.repo.js";
import { OrderRepository } from "../repositories/order.repo.js";
import { RFQRepository } from "../repositories/rfq.repo.js";
import { BudgetRepository } from "../repositories/scm.repo.js";

const requisitionRepo = new RequisitionRepository();
const orderRepo = new OrderRepository();
const rfqRepo = new RFQRepository();
const budgetRepo = new BudgetRepository();

export class AnalyticsService {
  async getDashboardAnalytics() {
    const cacheKey = "scm:dashboard:analytics";

    try {
      const cached = await getCache<any>(cacheKey);
      if (cached) {
        console.log("⚡ serving dashboard analytics from Redis cache");
        return cached;
      }

      console.log("📊 cache miss: compiling analytics from PostgreSQL...");

      const baseSpend = 4200000;
      const sumPO = await orderRepo.sumTotalAmount();

      const pendingRequisitions = await requisitionRepo.countPending();
      const activeRfqs = await rfqRepo.countOpen();
      const budgets = await budgetRepo.getAll();

      const result = {
        kpis: {
          totalSpendYTD: baseSpend + sumPO,
          pendingRequisitions,
          activeRfqs,
          overdueInvoices: 8,
          overdueInvoicesVal: 124500,
        },
        categories: budgets.map((b) => ({
          category: b.category,
          allocated: b.allocated,
          spent: b.spent,
          percentage: Math.round((b.spent / b.allocated) * 100),
        })),
        monthlySpendTrend: [
          { month: "Jan", spend: 320000 },
          { month: "Feb", spend: 410000 },
          { month: "Mar", spend: 390000 },
          { month: "Apr", spend: 540000 },
          { month: "May", spend: 480000 },
          { month: "Jun", spend: 610000 },
          { month: "Jul", spend: 550000 },
        ],
      };

      await setCache(cacheKey, result, 300);
      return result;
    } catch (error) {
      console.error("Analytics Service Compilation Failure:", error);
      throw error;
    }
  }
}
