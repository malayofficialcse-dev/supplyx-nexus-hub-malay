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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5006;
// Prisma client instance removed; keep Prisma usage in repository/service modules

app.use(cors({ origin: "*" }));
app.use(express.json());

// Mount all API routers
app.use("/api/requisitions", requisitionRouter);
app.use("/api/orders", orderRouter);
app.use("/api/rfqs", rfqRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/warehouses", warehouseRouter);
app.use("/api/shipments", shipmentRouter);
app.use("/api/logistics", logisticsRouter);
app.use("/api/customers", customerRouter);
app.use("/api/carriers", carrierRouter);
app.use("/api/contracts", contractRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/goods-receipts", goodsReceiptsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date(), version: "2.0.0" });
});

// Database seeding removed. All data must be provided by API clients/frontend.

// ─── Server Boot ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n📡 SupplyX SCM Backend v2.0 running on http://localhost:${PORT}`);
  console.log(`📋 API Docs: http://localhost:${PORT}/health\n`);
});

export default app;
