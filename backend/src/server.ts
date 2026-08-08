import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

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

// ─── Database Seeding ────────────────────────────────────────────────────────
async function seedDatabaseIfEmpty() {
  try {
    const requisitionCount = await prisma.requisition.count();
    if (requisitionCount > 0) {
      console.log("✅ Database already seeded, skipping.");
      return;
    }

    console.log("🌱 Seeding SCM database with initial data...");

    await prisma.requisition.createMany({
      data: [
        { reqId: "REQ-2041", department: "IT Infrastructure", item: "Dell PowerEdge Servers (x4)", amount: 45200, status: "Pending Approval" },
        { reqId: "REQ-2040", department: "Marketing", item: "Q3 Campaign Agency Retainer", amount: 12500, status: "Approved" },
        { reqId: "REQ-2039", department: "Facilities", item: "HVAC Maintenance Q2", amount: 8100, status: "Rejected" },
        { reqId: "REQ-2038", department: "Operations", item: "Forklift Fleet Lease Renewal", amount: 32000, status: "Pending Approval" },
        { reqId: "REQ-2037", department: "Finance", item: "SAP ERP License Renewal", amount: 78500, status: "Approved" },
      ],
    });

    await prisma.contract.createMany({
      data: [
        { conId: "CON-8842-A", initials: "GT", supplier: "Global Tech Mfg", start: "Jan 01, 2023", end: "Dec 31, 2025", status: "Active" },
        { conId: "CON-7921-X", initials: "NS", supplier: "Nordic Steel Co.", start: "Mar 15, 2021", end: "Nov 15, 2023", status: "Expiring" },
        { conId: "CON-9011-B", initials: "AP", supplier: "Apex Packaging", start: "Jun 01, 2022", end: "May 31, 2026", status: "Active" },
        { conId: "CON-6610-C", initials: "FX", supplier: "FedEx Freight Corp", start: "Feb 01, 2024", end: "Jan 31, 2027", status: "Active" },
        { conId: "CON-5540-D", initials: "DH", supplier: "DHL Express Ltd", start: "Aug 01, 2020", end: "Aug 01, 2023", status: "Expiring" },
      ],
    });

    await prisma.order.createMany({
      data: [
        {
          orderId: "PO-1092",
          supplier: "Global Tech Mfg",
          amount: 85000,
          deliveryDate: "Sep 20, 2026",
          status: "Approved",
          description: "Production components batch #4",
          items: [
            { name: "Resistor Arrays", quantity: 5000, unitPrice: 5 },
            { name: "Capacitor Packs", quantity: 12000, unitPrice: 5 },
          ],
        },
        {
          orderId: "PO-1093",
          supplier: "Nordic Steel Co.",
          amount: 142000,
          deliveryDate: "Oct 05, 2026",
          status: "Submitted",
          description: "Raw structural beams for construction project",
          items: [{ name: "Grade A Steel Beams", quantity: 50, unitPrice: 2840 }],
        },
        {
          orderId: "PO-1091",
          supplier: "Apex Packaging",
          amount: 28400,
          deliveryDate: "Aug 30, 2026",
          status: "Approved",
          description: "Custom printed packaging materials",
          items: [{ name: "Printed Corrugated Boxes", quantity: 10000, unitPrice: 2.84 }],
        },
        {
          orderId: "PO-1090",
          supplier: "DHL Express Ltd",
          amount: 9800,
          deliveryDate: "Aug 15, 2026",
          status: "Draft",
          description: "International Express Shipping Q3",
          items: [{ name: "Express Freight Contract", quantity: 1, unitPrice: 9800 }],
        },
      ],
    });

    await prisma.rFQ.createMany({
      data: [
        {
          rfqId: "RFQ-2026-001",
          title: "Data Center Upgrades",
          department: "IT Infrastructure",
          deadline: "Aug 25, 2026",
          status: "Open",
          vendorCount: 6,
          items: [{ name: "High-throughput fiber optic modules", quantity: 150 }],
        },
        {
          rfqId: "RFQ-2026-002",
          title: "Corporate Relocation Logistics",
          department: "Operations Dept",
          deadline: "Sep 01, 2026",
          status: "Draft",
          vendorCount: 0,
          items: [{ name: "Logistics shipping containers & cargo service", quantity: 10 }],
        },
        {
          rfqId: "RFQ-2026-003",
          title: "Annual MRO Supplies Tender",
          department: "Maintenance",
          deadline: "Sep 15, 2026",
          status: "Open",
          vendorCount: 4,
          items: [
            { name: "Industrial Lubricants (drums)", quantity: 200 },
            { name: "Safety Equipment Sets", quantity: 50 },
          ],
        },
      ],
    });

    await prisma.goodsReceipt.createMany({
      data: [
        {
          receiptId: "GRN-5521",
          orderId: "PO-1092",
          supplier: "Global Tech Mfg",
          deliveryDate: "Sep 21, 2026",
          status: "Fully Received",
          items: [
            { name: "Resistor Arrays", receivedQty: 5000, expectedQty: 5000 },
            { name: "Capacitor Packs", receivedQty: 12000, expectedQty: 12000 },
          ],
        },
        {
          receiptId: "GRN-5520",
          orderId: "PO-1091",
          supplier: "Apex Packaging",
          deliveryDate: "Aug 28, 2026",
          status: "Partially Received",
          items: [
            { name: "Printed Corrugated Boxes", receivedQty: 6000, expectedQty: 10000 },
          ],
        },
        {
          receiptId: "GRN-5519",
          orderId: "PO-1090",
          supplier: "DHL Express Ltd",
          deliveryDate: "Aug 14, 2026",
          status: "Fully Received",
          items: [{ name: "Express Freight Contract", receivedQty: 1, expectedQty: 1 }],
        },
      ],
    });

    await prisma.invoice.createMany({
      data: [
        {
          invoiceId: "INV-3041",
          supplier: "Global Tech Mfg",
          date: "Sep 22, 2026",
          amount: 85000,
          status: "Paid",
          items: [
            { description: "Resistor Arrays x5000", amount: 25000 },
            { description: "Capacitor Packs x12000", amount: 60000 },
          ],
        },
        {
          invoiceId: "INV-3040",
          supplier: "Apex Packaging",
          date: "Aug 29, 2026",
          amount: 17040,
          status: "Pending",
          items: [{ description: "Corrugated Boxes 6000 units (partial)", amount: 17040 }],
        },
        {
          invoiceId: "INV-3039",
          supplier: "Nordic Steel Co.",
          date: "Oct 06, 2026",
          amount: 142000,
          status: "Overdue",
          items: [{ description: "Grade A Steel Beams x50", amount: 142000 }],
        },
        {
          invoiceId: "INV-3038",
          supplier: "DHL Express Ltd",
          date: "Aug 15, 2026",
          amount: 9800,
          status: "Paid",
          items: [{ description: "International Express Freight Q3", amount: 9800 }],
        },
      ],
    });

    await prisma.payment.createMany({
      data: [
        {
          paymentId: "PAY-9088",
          invoiceId: "INV-3041",
          supplier: "Global Tech Mfg",
          amount: 85000,
          status: "Processed",
          method: "Wire Transfer",
          auditTrail: [
            { action: "Initiated", by: "Jane Doe", at: "Sep 25, 2026 09:00" },
            { action: "Approved", by: "CFO Office", at: "Sep 25, 2026 10:30" },
            { action: "Processed", by: "Bank System", at: "Sep 26, 2026 08:00" },
          ],
        },
        {
          paymentId: "PAY-9087",
          invoiceId: "INV-3038",
          supplier: "DHL Express Ltd",
          amount: 9800,
          status: "Processed",
          method: "ACH Transfer",
          auditTrail: [
            { action: "Initiated", by: "AP Team", at: "Aug 16, 2026 11:00" },
            { action: "Processed", by: "Bank System", at: "Aug 17, 2026 09:00" },
          ],
        },
        {
          paymentId: "PAY-9086",
          invoiceId: "INV-3040",
          supplier: "Apex Packaging",
          amount: 17040,
          status: "Pending",
          method: "Wire Transfer",
          auditTrail: [
            { action: "Initiated", by: "AP Team", at: "Aug 30, 2026 14:00" },
          ],
        },
      ],
    });

    await prisma.budgetCategory.createMany({
      data: [
        { category: "IT Equipment", allocated: 1000000, spent: 420000, year: 2026 },
        { category: "Raw Materials", allocated: 2500000, spent: 1850000, year: 2026 },
        { category: "Professional Services", allocated: 800000, spent: 280000, year: 2026 },
        { category: "Logistics & Freight", allocated: 600000, spent: 340000, year: 2026 },
        { category: "Facilities & MRO", allocated: 400000, spent: 195000, year: 2026 },
        { category: "Other", allocated: 500000, spent: 115000, year: 2026 },
      ],
    });

    await prisma.warehouse.createMany({
      data: [
        { whId: "WH-01", name: "Chicago Central Hub", location: "Chicago, IL", capacity: 50000, fillLevel: 78.4, status: "Active" },
        { whId: "WH-02", name: "Dallas Logistics Depot", location: "Dallas, TX", capacity: 35000, fillLevel: 42.1, status: "Active" },
        { whId: "WH-03", name: "Seattle Cold Storage", location: "Seattle, WA", capacity: 15000, fillLevel: 91.0, status: "Full" },
        { whId: "WH-04", name: "Miami Transit Facility", location: "Miami, FL", capacity: 20000, fillLevel: 12.5, status: "Maintenance" },
        { whId: "WH-05", name: "Atlanta Regional Center", location: "Atlanta, GA", capacity: 28000, fillLevel: 55.7, status: "Active" },
      ],
    });

    await prisma.shipment.createMany({
      data: [
        { trackingNumber: "SH-7392-A", origin: "Chicago Hub (WH-01)", destination: "Dallas Depot (WH-02)", carrier: "Apex Logistics", status: "In Transit", estDelivery: "Aug 12, 2026" },
        { trackingNumber: "SH-7392-B", origin: "Seattle Storage (WH-03)", destination: "Miami Transit (WH-04)", carrier: "FedEx Freight", status: "In Transit", estDelivery: "Aug 15, 2026" },
        { trackingNumber: "SH-7392-C", origin: "Houston Vendor", destination: "Chicago Hub (WH-01)", carrier: "DHL Express", status: "Delivered", estDelivery: "Aug 07, 2026" },
        { trackingNumber: "SH-7392-D", origin: "New York Port", destination: "Chicago Hub (WH-01)", carrier: "Maersk Carrier", status: "Delayed", estDelivery: "Aug 18, 2026" },
        { trackingNumber: "SH-7392-E", origin: "Atlanta Center (WH-05)", destination: "Dallas Depot (WH-02)", carrier: "Apex Logistics", status: "In Transit", estDelivery: "Aug 10, 2026" },
      ],
    });

    await prisma.logisticsRoute.createMany({
      data: [
        { routeName: "Chicago-Dallas Hub Link", costPerMile: 2.45, avgTransitTime: 18.5, volume: 1200.0 },
        { routeName: "LA-Seattle Coastline Express", costPerMile: 2.85, avgTransitTime: 24.0, volume: 850.0 },
        { routeName: "NY-Chicago Express Rail", costPerMile: 1.15, avgTransitTime: 32.0, volume: 4500.0 },
        { routeName: "Miami-Atlanta Transit Route", costPerMile: 2.10, avgTransitTime: 12.0, volume: 600.0 },
        { routeName: "Dallas-Houston Corridor", costPerMile: 1.80, avgTransitTime: 6.0, volume: 2100.0 },
      ],
    });

    await prisma.customer.createMany({
      data: [
        { companyName: "Hyperion Retailers", contact: "Alice Smith", email: "a.smith@hyperion.com", status: "Active", salesYTD: 245000.0 },
        { companyName: "Summit Tech Systems", contact: "David Miller", email: "d.miller@summittech.com", status: "Active", salesYTD: 185000.0 },
        { companyName: "Astra Logistics Corp", contact: "Robert Jones", email: "r.jones@astra.com", status: "Inactive", salesYTD: 42000.0 },
        { companyName: "Nova Industrial Parts", contact: "Emma Watson", email: "e.watson@nova.com", status: "Active", salesYTD: 312000.0 },
        { companyName: "Pacific Rim Imports", contact: "Kevin Chen", email: "k.chen@pacrim.com", status: "Active", salesYTD: 128000.0 },
      ],
    });

    await prisma.carrier.createMany({
      data: [
        { name: "Apex Logistics", type: "Truckload", rating: 4.8, activeVehicles: 120, contact: "ap-ops@apex.com" },
        { name: "FedEx Freight", type: "Air & Ground", rating: 4.6, activeVehicles: 450, contact: "ops@fedexfreight.com" },
        { name: "DHL Express", type: "Air Freight", rating: 4.9, activeVehicles: 300, contact: "freight@dhl.com" },
        { name: "Maersk Carrier", type: "Sea Freight", rating: 4.2, activeVehicles: 75, contact: "ops@maersk.com" },
        { name: "J.B. Hunt Transport", type: "Intermodal", rating: 4.5, activeVehicles: 680, contact: "jbh@jbhunt.com" },
      ],
    });

    console.log("🚀 SCM Database seeding completed successfully.");
  } catch (error) {
    console.error("⚠️ Database Seeding Failed:", error);
  }
}

// ─── Server Boot ─────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n📡 SupplyX SCM Backend v2.0 running on http://localhost:${PORT}`);
  console.log(`📋 API Docs: http://localhost:${PORT}/health\n`);
  await seedDatabaseIfEmpty();
});

export default app;
