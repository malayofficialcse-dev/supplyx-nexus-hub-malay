import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
// Prisma client removed from server file — data will come from API clients/frontend
// Routes
import requisitionRouter from "./routes/requisitions.js";
import orderRouter from "./routes/orders.js";
import rfqRouter from "./routes/rfqs.js";
import analyticsRouter from "./routes/analytics.js";
import warehouseRouter from "./routes/warehouses.js";
import shipmentRouter from "./routes/shipments.js";
import logisticsRouter from "./routes/logistics.js";
import customerRouter from "./routes/customers.js";
import carrierRouter from "./routes/carriers.js";
import contractRouter from "./routes/contracts.js";
import invoiceRouter from "./routes/invoices.js";
import paymentRouter from "./routes/payments.js";
import goodsReceiptsRouter from "./routes/goodsReceipts.js";
import inventoryRouter from "./routes/inventories.js";
import supplierRouter from "./routes/suppliers.js";
import quoteRouter from "./routes/quotes.js";
import userRouter from "./routes/users.js";
import attachmentRouter from "./routes/attachments.js";
import operationsRouter from "./routes/operations.js";
import { authenticateToken, autoAuthorize } from "./middleware/auth.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Keep the environment file resolution stable for both `src` execution and
// compiled `dist` execution. The .env file lives at the backend root.
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const app = express();
const PORT = process.env.PORT || 5006;
// Prisma client instance removed; keep Prisma usage in repository/service modules
app.use(cors({ origin: "*" }));
app.use(express.json());
// Mount all API routers
app.use("/api/users", userRouter);
app.use("/api/suppliers", authenticateToken, autoAuthorize(), supplierRouter);
app.use("/api/quotes", authenticateToken, autoAuthorize(), quoteRouter);
app.use("/api/requisitions", authenticateToken, autoAuthorize(), requisitionRouter);
app.use("/api/orders", authenticateToken, autoAuthorize(), orderRouter);
app.use("/api/rfqs", authenticateToken, autoAuthorize(), rfqRouter);
app.use("/api/analytics", authenticateToken, autoAuthorize(), analyticsRouter);
app.use("/api/warehouses", authenticateToken, autoAuthorize(), warehouseRouter);
app.use("/api/shipments", authenticateToken, autoAuthorize(), shipmentRouter);
app.use("/api/logistics", authenticateToken, autoAuthorize(), logisticsRouter);
app.use("/api/customers", authenticateToken, autoAuthorize(), customerRouter);
app.use("/api/carriers", authenticateToken, autoAuthorize(), carrierRouter);
app.use("/api/contracts", authenticateToken, autoAuthorize(), contractRouter);
app.use("/api/invoices", authenticateToken, autoAuthorize(), invoiceRouter);
app.use("/api/payments", authenticateToken, autoAuthorize(), paymentRouter);
app.use("/api/goods-receipts", authenticateToken, autoAuthorize(), goodsReceiptsRouter);
app.use("/api/inventories", authenticateToken, autoAuthorize(), inventoryRouter);
app.use("/api/attachments", authenticateToken, autoAuthorize(), attachmentRouter);
app.use("/api/operations", authenticateToken, autoAuthorize(), operationsRouter);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date(), version: "2.0.0" });
});
// Database seeding removed. All data must be provided by API clients/frontend.
// ─── Server Boot ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n📡 SupplyX SCM Backend v2.0 running on http://localhost:${PORT}`);
    console.log(`📋 API Docs: http://localhost:${PORT}/health\n`);
    // Tier 1: Background contract auto-expiry scheduler
    import("./services/scm.service.js").then(({ ContractService }) => {
        const contractService = new ContractService();
        // Run immediately on boot
        contractService.autoExpireContracts().catch((err) => console.error("Initial contract auto-expiry error:", err));
        // Run periodically every 1 hour
        setInterval(() => {
            contractService.autoExpireContracts().catch((err) => console.error("Periodic contract auto-expiry error:", err));
        }, 60 * 60 * 1000);
    });
});
export default app;
