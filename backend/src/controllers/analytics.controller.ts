import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service.js";

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getDashboardAnalytics(req: Request, res: Response) {
    try {
      const analytics = await analyticsService.getDashboardAnalytics();
      return res.json(analytics);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAdvancedAnalytics(req: Request, res: Response) {
    try {
      const { timeframe, department, category } = req.query as {
        timeframe?: string;
        department?: string;
        category?: string;
      };
      const analytics = await analyticsService.getAdvancedAnalytics({ timeframe, department, category });
      return res.json(analytics);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

