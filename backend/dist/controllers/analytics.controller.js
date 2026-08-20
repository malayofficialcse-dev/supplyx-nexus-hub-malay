import { AnalyticsService } from "../services/analytics.service.js";
const analyticsService = new AnalyticsService();
export class AnalyticsController {
    async getDashboardAnalytics(req, res) {
        try {
            const analytics = await analyticsService.getDashboardAnalytics();
            return res.json(analytics);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getAdvancedAnalytics(req, res) {
        try {
            const { timeframe, department, category } = req.query;
            const analytics = await analyticsService.getAdvancedAnalytics({ timeframe, department, category });
            return res.json(analytics);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
