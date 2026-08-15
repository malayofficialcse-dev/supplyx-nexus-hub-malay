# Supply Chain Navigator

think like you are a senior developer with 8 years of experience build a totally suppluychain management project frontend use the simple professional colours like microsoft, use the simple colour, everywhere border radius will be 3px , just like that build in professional way like microsoft websidete  where the entire style will be in this colour and use the normal react vite and tailwind,these are the backend routes and schemas , so start building the entire frontend, everything every buttons filters and search acion create edit delete should be workable export and so on everything should be related to this  "import { Router } from "express";

import { AnalyticsController } from "../controllers/analytics.controller.js";




const router = Router();

const controller = new AnalyticsController();




router.get("/dashboard", controller.getDashboardAnalytics.bind(controller));




export default router;","import { Router } from "express";

import { CarrierController } from "../controllers/scm.controller.js";




const router = Router();

const controller = new CarrierController();




router.get("/", controller.getCarriers.bind(controller));

router.get("/:id", controller.getCarrierById.bind(controller));

router.post("/", controller.createCarrier.bind(controller));

router.put("/:id", controller.updateCarrier.bind(controller));

router.patch("/:id", controller.updateCarrier.bind(controller));

router.delete("/:id", controller.deleteCarrier.bind(controller));




export default router;","import { Router } from "express";

import { ContractController } from "../controllers/scm.controller.js";




const router = Router();

const controller = new ContractController();




router.get("/", controller.getContracts.bind(controller));

router.get("/:id", controller.getContractById.bind(controller));

router.post("/", controller.createContract.bind(controller));

router.put("/:id", controller.updateContract.bind(controller));

router.patch("/:id", controller.updateContract.bind(controller));

router.delete("/:id", controller.deleteContract.bind(controller));




export default router;","import { Router } from "express";

import { CustomerController } from "../controllers/scm.controller.js";




const router = Router();

const controller = new CustomerController();




router.get("/", controller.getCustomers.bind(controller));

router.get("/:id", controller.getCustomerById.bind(controller));

router.post("/", controller.createCustomer.bind(controller));

router.put("/:id", controller.updateCustomer.bind(controller));

router.patch("/:id", controller.updateCustomer.bind(controller));

router.delete("/:id", controller.deleteCustomer.bind(controller));




export default router;","import { Router } from "express";

import { GoodsReceiptController } from "../controllers/scm.controller.js";




const router = Router();

const controller = new GoodsReceiptController();




router.get("/", controller.getGoodsReceipts.bind(controller));

router.get("/:id", controller.getGoodsReceiptById.bind(controller));

router.post("/", controller.createGoodsReceipt.bind(controller));




export default router;","import { Router } from "express";

import { InventoryController } from "../controllers/scm.controller.js";




const router = Router();

const controller = new InventoryController();




router.get("/", controller.getInventories.bind(controller));

router.get("/warehouse/:warehouseId", controller.getInventoryByWarehouse.bind(controller));




export default router;","import { Router } from "express";

import { InvoiceController } from "../controllers/scm.controller.js";




const router = Router();

const controller = new InvoiceController();




router.get("/", controller.getInvoices.bind(controller));

router.get("/:id", controller.getInvoiceById.bind(controller));

router.post("/", controller.createInvoice.bind(controller));




export default router;","import { Router } from "express";

import { LogisticsController } from "../controllers/scm.controller.js";




const router = Router();

const controller = new LogisticsController();




router.get("/", controller.getLogistics.bind(controller));




export default router;","import { Router } from "express";

import { OrderController } from "../controllers/order.controller.js";




const router = Router();

const controller = new OrderController();

router.get("/", controller.getOrders.bind(controller));

router.post("/", controller.createOrder.bind(controller));

router.post("/:id/3way", controller.threeWayMatch.bind(controller));

export default router;","import { Router } from "express";

import { PaymentController } from "../controllers/scm.controller.js";




const router = Router();

const controller = new PaymentController();




router.get("/", controller.getPayments.bind(controller));

router.get("/:id", controller.getPaymentById.bind(controller));

router.post("/", controller.createPayment.bind(controller));




export default router;","import { Router } from "express";

import { RequisitionController } from "../controllers/requisition.controller.js";




const router = Router();

const controller = new RequisitionController();




router.get("/", controller.getRequisitions.bind(controller));

router.post("/", controller.createRequisition.bind(controller));

router.post("/:id/approve", controller.approveRequisition.bind(controller));

router.post("/:id/rfq", controller.createRFQFromRequisition.bind(controller));




export default router;","import { Router } from "express";

import { RFQController } from "../controllers/rfq.controller.js";




const router = Router();

const controller = new RFQController();




router.get("/", controller.getRFQs.bind(controller));

router.get("/:id", controller.getRFQById.bind(controller));

router.post("/", controller.createRFQ.bind(controller));

router.patch("/:id", controller.updateRFQ.bind(controller));

router.delete("/:id", controller.deleteRFQ.bind(controller));

router.post("/:id/quotes", controller.addSupplierQuote.bind(controller));

router.post("/:id/award", controller.awardRFQ.bind(controller));




export default router;","import { Router } from "express";

import { ShipmentController } from "../controllers/scm.controller.js";




const router = Router();

const controller = new ShipmentController();




router.get("/", controller.getShipments.bind(controller));

router.post("/", controller.createShipment.bind(controller));




export default router;","import { Router } from "express";

import { WarehouseController } from "../controllers/scm.controller.js";




const router = Router();

const controller = new WarehouseController();




router.get("/", controller.getWarehouses.bind(controller));

router.get("/:id", controller.getWarehouseById.bind(controller));

router.post("/", controller.createWarehouse.bind(controller));

router.put("/:id", controller.updateWarehouse.bind(controller));

router.patch("/:id", controller.updateWarehouse.bind(controller));

router.delete("/:id", controller.deleteWarehouse.bind(controller));




export default router;","generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Requisition {
  id              String   @id @default(uuid())
  reqId           String   @unique
  requester       String
  department      String
  costCenter      String
  justification   String?
  item            String
  items           Json
  total           Float
  status          String
  approvalNotes   String?
  rejectedAt      DateTime?
  rejectionReason String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Contract {
  id        String   @id @default(uuid())
  conId     String   @unique
  initials  String
  supplier  String
  start     String
  end       String
  status    String
  createdAt DateTime @default(now())
}

model Order {
  id               String   @id @default(uuid())
  orderId          String   @unique
  supplier         String
  amount           Float
  deliveryDate     String
  status           String
  description      String?
  items            Json
  receivedQuantity Float    @default(0)
  createdAt        DateTime @default(now())
}

model GoodsReceipt {
  id           String   @id @default(uuid())
  receiptId    String   @unique
  orderId      String
  supplier     String
  warehouseId  String?
  deliveryDate String
  status       String
  items        Json
  createdAt    DateTime @default(now())
}

model Inventory {
  id          String   @id @default(uuid())
  warehouseId String
  item        String
  sku         String?
  unit        String
  quantity    Float    @default(0)
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([warehouseId, item, sku])
}

model InventoryMovement {
  id            String   @id @default(uuid())
  inventoryId   String
  goodsReceiptId String
  orderId       String
  warehouseId   String
  type          String
  quantity      Float
  balanceAfter  Float
  notes         String?
  createdAt     DateTime @default(now())
}

model Invoice {
  id        String   @id @default(uuid())
  invoiceId String   @unique
  supplier  String
  date      String
  amount    Float
  status    String
  items     Json
  createdAt DateTime @default(now())
}

model Payment {
  id         String   @id @default(uuid())
  paymentId  String   @unique
  invoiceId  String
  supplier   String
  amount     Float
  status     String
  method     String
  auditTrail Json
  createdAt  DateTime @default(now())
}

model RFQ {
  id          String   @id @default(uuid())
  rfqId       String   @unique
  title       String
  department  String
  deadline    String
  status      String
  vendorCount Int      @default(0)
  items       Json
  createdAt   DateTime @default(now())
}

model BudgetCategory {
  id        String   @id @default(uuid())
  category  String   @unique
  allocated Float
  spent     Float
  year      Int
  createdAt DateTime @default(now())
}

model Warehouse {
  id        String   @id @default(uuid())
  whId      String   @unique
  name      String
  location  String
  capacity  Float
  fillLevel Float
  status    String
  createdAt DateTime @default(now())
}

model Shipment {
  id             String   @id @default(uuid())
  trackingNumber String   @unique
  origin         String
  destination    String
  carrier        String
  status         String
  estDelivery    String
  createdAt      DateTime @default(now())
}

model LogisticsRoute {
  id             String   @id @default(uuid())
  routeName      String   @unique
  costPerMile    Float
  avgTransitTime Float
  volume         Float
  createdAt      DateTime @default(now())
}

model Customer {
  id          String   @id @default(uuid())
  companyName String   @unique
  contact     String
  email       String
  status      String
  salesYTD    Float
  createdAt   DateTime @default(now())
}

model Carrier {
  id             String   @id @default(uuid())
  name           String   @unique
  type           String
  rating         Float
  activeVehicles Int
  contact        String
  createdAt      DateTime @default(now())
}
","import express from "express";

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

app.use("/api/inventories", inventoryRouter);




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




export default app;"

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5f62faa4-319e-4c5f-8a5a-eee47a0964df).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
