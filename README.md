# SupplyX SCM

SupplyX SCM is a full-stack Supply Chain Management platform designed to manage procurement, supplier relationships, purchasing, receiving, invoicing, payments, budgets, contracts, and logistics operations from a centralized web application.

The system follows a practical source-to-pay workflow, connecting internal purchase requisitions with supplier sourcing, purchase orders, goods receipts, invoice processing, and payment settlement.

<p align="center">
  <img src="./assets/baner.png" alt="SupplyX SCM">
  <img src="https://img.shields.io/badge/Architecture-Full--Stack-2F855A?style=for-the-badge" alt="Full Stack">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge" alt="Prisma">
</p>

<p align="center">
  <strong>Procurement | Supplier Management | Purchasing | Receiving | Invoicing | Payments | Budget Control | Contracts</strong>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Objectives](#key-objectives)
- [Core Modules](#core-modules)
- [End-to-End Business Workflow](#end-to-end-business-workflow)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Functional Highlights](#functional-highlights)
- [Database and Data Model](#database-and-data-model)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Commands](#development-commands)
- [API](#api)
- [Screenshots](#screenshots)
- [Business Workflow Example](#business-workflow-example)
- [Security and Reliability](#security-and-reliability)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

SupplyX SCM provides a centralized platform for controlling the procurement lifecycle and related supply-chain operations.

The application is organized around the following operational areas:

1. Supplier management
2. Internal requisitions
3. Request for Quotation (RFQ)
4. Purchase orders
5. Goods receipts
6. Invoice management
7. Payments
8. Budget and ledger management
9. Contract management
10. Warehouses and inventory
11. Shipments and logistics
12. Carriers and customers

The application is designed to provide traceability between procurement documents and operational transactions.

---

## Key Objectives

SupplyX SCM focuses on:

- Centralizing supplier and procurement information
- Creating a structured approval workflow
- Converting approved requisitions into RFQs and purchase orders
- Tracking supplier commitments and deliveries
- Recording goods receipts against purchase orders
- Managing supplier invoices and payment status
- Supporting purchase-order, receipt, and invoice reconciliation
- Monitoring department budgets and expenditure
- Tracking supplier contracts and renewal windows
- Providing a single interface for procurement and supply-chain operations
- Maintaining a relational data model for transactional consistency

---

## Core Modules

### 1. Suppliers Directory

The supplier module maintains the central supplier master.

Capabilities include:

- Supplier registration
- Supplier categories
- Primary contact information
- Supplier status
- Supplier scorecards
- Supplier editing and deletion
- Supplier filtering and search
- CSV export

---

### 2. Requisitions

Requisitions represent internal purchasing requests created by departments.

The module supports:

- Requisition creation
- Department assignment
- Cost-centre information
- Requested items
- Approval tiers
- Approval status
- Requisition review
- RFQ generation
- Purchase-order generation
- Search and filtering
- CSV export

---

### 3. RFQs

The Request for Quotation module connects internal purchasing requirements with suppliers.

Capabilities include:

- RFQ creation
- Department association
- Supplier/vendor selection
- Submission deadlines
- Quote management
- RFQ status tracking
- Supplier award workflow
- RFQ editing and deletion

---

### 4. Purchase Orders

Purchase orders represent formal purchasing commitments to suppliers.

Capabilities include:

- PO creation
- Supplier association
- Delivery-date tracking
- Order line management
- Order amount tracking
- Received quantity tracking
- PO status management
- Three-way matching
- Purchase-order search and filtering

---

### 5. Goods Receipts

Goods receipts record physical deliveries against purchase orders.

Capabilities include:

- Receipt creation
- PO association
- Supplier identification
- Warehouse assignment
- Delivered quantity tracking
- Partial receipt handling
- Pending receipt tracking
- Inventory movement integration

---

### 6. Invoices

The invoice module manages accounts-payable documents received from suppliers.

Capabilities include:

- Invoice registration
- Supplier association
- Invoice date
- Invoice line items
- Amount tracking
- Payment terms
- Approval workflow
- Submitted, approved, and paid states
- Bill viewing

---

### 7. Payments

The payment module records settlements against supplier invoices.

Capabilities include:

- Payment creation
- Invoice association
- Supplier information
- Payment method
- Payment amount
- Processing status
- Payment timestamps
- Payment tracking

---

### 8. Budgets and Ledger

The budget module helps departments control spending against approved allocations.

Capabilities include:

- Department budget configuration
- Ledger accounts/categories
- Allocated budget
- Actual expenditure
- Utilization calculation
- Budget compliance monitoring
- Over-budget identification

---

### 9. Contracts

The contract module manages supplier agreements and renewal periods.

Capabilities include:

- Contract creation
- Supplier association
- Contract owner
- Start date
- End date
- Active contracts
- Expiring contracts
- Expired contracts
- Contract editing and deletion

---

### 10. Logistics and Inventory

The platform also provides navigation and operational areas for:

- Warehouses
- Inventory
- Shipments
- Logistics routes
- Carriers
- Customers

These modules provide the foundation for extending SupplyX from procurement management into a broader supply-chain execution platform.

---

## End-to-End Business Workflow

The primary procurement lifecycle can be represented as:

```text
Internal Requirement
        |
        v
   Requisition
        |
        v
 Approval Workflow
        |
        v
       RFQ
        |
        v
 Supplier Quotes
        |
        v
 Supplier Award
        |
        v
 Purchase Order
        |
        v
 Supplier Delivery
        |
        v
   Goods Receipt
        |
        v
    Inventory
        |
        v
 Supplier Invoice
        |
        v
  Three-Way Match
        |
        v
 Invoice Approval
        |
        v
     Payment
        |
        v
   Settlement
```

This workflow provides a traceable relationship between a business requirement, supplier selection, purchasing commitment, physical receipt, financial document, and final payment.

---

## Architecture

The repository is organized into separate frontend and backend applications.

```text
+-----------------------+
|       Frontend        |
|  React / TypeScript   |
|  UI + Routing + API   |
+-----------+-----------+
            |
            | HTTP / REST API
            v
+-----------------------+
|        Backend        |
| Node.js / Express     |
| Business Logic        |
| Validation / Services |
+-----------+-----------+
            |
            | Prisma ORM
            v
+-----------------------+
|      PostgreSQL       |
| Relational Database   |
+-----------------------+
```

### Application Flow

```text
User
 |
 v
Frontend UI
 |
 v
API Client
 |
 v
Express API
 |
 v
Controllers / Services
 |
 v
Prisma ORM
 |
 v
PostgreSQL
```

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router / TanStack Router
- React Query
- Tailwind CSS
- Component-based UI architecture

### Backend

- Node.js
- TypeScript
- Express.js
- REST API
- Prisma ORM

### Database

- PostgreSQL

### Development and Tooling

- Git
- GitHub
- npm
- Environment-based configuration
- REST API architecture

---

## Project Structure

```text
supplyx-nexus-hub-malay/
|
+-- backend/
|   +-- src/
|   |   +-- controllers/
|   |   +-- routes/
|   |   +-- services/
|   |   +-- middleware/
|   |   +-- utils/
|   |   +-- server.ts
|   |
|   +-- prisma/
|   |   +-- schema.prisma
|   |
|   +-- package.json
|   +-- tsconfig.json
|   +-- .env
|
+-- frontend/
|   +-- src/
|   |   +-- components/
|   |   +-- routes/
|   |   +-- pages/
|   |   +-- lib/
|   |   +-- hooks/
|   |   +-- App.tsx
|   |
|   +-- package.json
|   +-- vite.config.ts
|
+-- docs/
|   +-- screenshots/
|
+-- README.md
```

The exact directory names may vary depending on the current implementation, but the repository follows a frontend/backend separation.

---

## Functional Highlights

### Supplier Management

The supplier directory provides a centralized view of registered vendors, active partners, and supplier categories.

### Procurement Approval

Requisitions move through approval states before they can be converted into downstream procurement documents.

### RFQ and Supplier Award

Approved purchasing requirements can be converted into RFQs, allowing supplier sourcing and award decisions.

### Purchase Order Tracking

Purchase orders track supplier, delivery date, order lines, received quantity, amount, and order status.

### Goods Receipt Processing

Received goods can be recorded against purchase orders, including partial receipt scenarios.

### Invoice Processing

Supplier invoices can be tracked through submission, approval, and payment states.

### Three-Way Match

The procurement workflow includes a three-way matching concept:

```text
Purchase Order
      +
Goods Receipt
      +
Supplier Invoice
      |
      v
Three-Way Match
      |
      v
Invoice Validation
      |
      v
Payment
```

The purpose is to validate that the ordered goods, received goods, and invoiced amounts are consistent before settlement.

### Budget Control

Department-level budgets can be compared with expenditure to identify utilization and potential over-budget categories.

### Contract Monitoring

Supplier agreements can be monitored based on active, expiring, and expired states.

---

## Database and Data Model

SupplyX uses PostgreSQL as the relational database and Prisma as the ORM.

A simplified conceptual model is:

```text
Supplier
   |
   +--------------------+
   |                    |
   v                    v
Contract             PurchaseOrder
                          |
                          v
                    GoodsReceipt
                          |
                          v
                       Invoice
                          |
                          v
                       Payment


Department
    |
    +----> Requisition
               |
               v
              RFQ
               |
               v
        PurchaseOrder
```

The relational approach helps maintain consistency across procurement and financial transactions.

---

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js 20+
- npm
- PostgreSQL
- Git

Verify the installations:

```bash
node --version
npm --version
psql --version
git --version
```

---

### 1. Clone the Repository

```bash
git clone https://github.com/malayofficialcse-dev/supplyx-nexus-hub-malay.git
cd supplyx-nexus-hub-malay
```

---

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/Supply_chain_management"
PORT=5006
```

Use the PostgreSQL username, password, database name, and port configured on your machine.

---

### 3. Configure Prisma

From the backend directory:

```bash
npx prisma generate
```

Apply the Prisma schema/migrations according to the repository's migration setup:

```bash
npx prisma migrate dev
```

If the project uses an existing database schema rather than migrations, use the appropriate Prisma workflow for that environment.

---

### 4. Start the Backend

```bash
npm run dev
```

The API is expected to be available at:

```text
http://localhost:5006/api
```

---

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend is expected to run on a Vite development server, commonly:

```text
http://localhost:5173
```

If your local Vite configuration uses a different port, use the URL printed in the terminal.

---

## Environment Variables

Backend configuration should be stored in `.env` and must not be committed to Git.

Example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/Supply_chain_management"
PORT=5006
NODE_ENV=development
```

If additional services are added, keep their credentials in environment variables as well.

Recommended:

```text
.env
.env.local
.env.production
```

should be excluded from version control when they contain secrets.

---

## Development Commands

### Backend

```bash
cd backend

npm install
npm run dev
npm run build
npm start
```

Prisma:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

### Frontend

```bash
cd frontend

npm install
npm run dev
npm run build
npm run preview
```

---

## API

The backend exposes a REST-style API under:

```text
http://localhost:5006/api
```

Representative resource groups include:

```text
/api/suppliers
/api/requisitions
/api/rfqs
/api/purchase-orders
/api/goods-receipts
/api/invoices
/api/payments
/api/budgets
/api/contracts
```

The exact endpoint paths and HTTP methods should be treated as implementation-specific and can be verified in the backend route definitions.

---

## Screenshots

### Suppliers Directory

The supplier directory provides visibility into registered vendors, categories, active status, contacts, and supplier scorecards.

<p align="center">
  <img src="./docs/screenshots/suppliers-directory.png" alt="SupplyX SCM Suppliers Directory" width="100%">
</p>

### Requisitions

The requisitions screen manages internal purchasing requests, approval states, totals, and conversion actions.

<p align="center">
  <img src="./docs/screenshots/requisitions.png" alt="SupplyX SCM Requisitions" width="100%">
</p>

### RFQs

The RFQ module provides sourcing and supplier-award functionality.

<p align="center">
  <img src="./docs/screenshots/rfqs.png" alt="SupplyX SCM RFQs" width="100%">
</p>

### Purchase Orders

The purchase-order screen tracks suppliers, delivery dates, quantities, amounts, statuses, and three-way matching.

<p align="center">
  <img src="./docs/screenshots/purchase-orders.png" alt="SupplyX SCM Purchase Orders" width="100%">
</p>

### Goods Receipts

Goods receipts connect inbound deliveries with purchase orders and warehouses.

<p align="center">
  <img src="./docs/screenshots/goods-receipts.png" alt="SupplyX SCM Goods Receipts" width="100%">
</p>

### Invoices

The invoice module provides accounts-payable tracking with approval and payment states.

<p align="center">
  <img src="./docs/screenshots/invoices.png" alt="SupplyX SCM Invoices" width="100%">
</p>

### Payments

The payment module records invoice settlements, methods, amounts, and processing states.

<p align="center">
  <img src="./docs/screenshots/payments.png" alt="SupplyX SCM Payments" width="100%">
</p>

### Budgets and Ledger

The budget module provides department-level allocation, spending, utilization, and compliance visibility.

<p align="center">
  <img src="./docs/screenshots/budgets-ledger.png" alt="SupplyX SCM Budgets and Ledger" width="100%">
</p>

### Contracts

The contract module tracks supplier agreements, owners, validity periods, and renewal windows.

<p align="center">
  <img src="./docs/screenshots/contracts.png" alt="SupplyX SCM Contracts" width="100%">
</p>

### Repository

The project repository is organized into separate backend and frontend applications.

<p align="center">
  <img src="./docs/screenshots/github-repository.png" alt="SupplyX SCM GitHub Repository" width="100%">
</p>

---

## Business Workflow Example

A typical procurement transaction can follow this sequence:

### Step 1: Create a Requisition

An employee or department identifies a requirement and creates a requisition.

```text
Department
   |
   v
Requisition
   |
   v
Approval
```

### Step 2: Convert to RFQ

After approval, the requirement can be converted into an RFQ and sent to relevant suppliers.

```text
Approved Requisition
        |
        v
       RFQ
        |
        v
Supplier Quotes
```

### Step 3: Select Supplier

The procurement team evaluates supplier responses and awards the requirement.

```text
Supplier A
Supplier B  ---> Evaluation ---> Award
Supplier C
```

### Step 4: Create Purchase Order

The selected supplier receives a purchase order containing the purchasing commitment.

```text
Award
  |
  v
Purchase Order
  |
  v
Supplier
```

### Step 5: Receive Goods

When the supplier delivers the goods, a goods receipt is recorded.

```text
Purchase Order
      |
      v
Goods Delivery
      |
      v
Goods Receipt
      |
      v
Warehouse / Inventory
```

### Step 6: Process Invoice

The supplier invoice is registered and validated.

```text
Purchase Order
      +
Goods Receipt
      +
Invoice
      |
      v
Three-Way Match
```

### Step 7: Approve and Pay

Once the invoice passes validation and approval, the payment is processed.

```text
Invoice
  |
  v
Approval
  |
  v
Payment
  |
  v
Settlement
```

---

## Security and Reliability

For production deployment, the following controls should be implemented or strengthened:

- Authentication and role-based authorization
- Input validation on all API endpoints
- Server-side authorization checks
- Secure password hashing
- JWT/session security where applicable
- Rate limiting
- CORS configuration
- Request logging
- Database transaction handling
- Audit logging for procurement and financial actions
- Secrets management
- HTTPS/TLS
- Database backups
- Error monitoring
- Production environment configuration

Sensitive configuration values should never be committed to the repository.

---

## Future Enhancements

Potential extensions for SupplyX SCM include:

- Role-Based Access Control
- Multi-level approval rules
- Supplier performance analytics
- Supplier scorecard automation
- Advanced inventory management
- Stock-level alerts
- Barcode and QR-code support
- Warehouse bin management
- Shipment tracking
- Logistics route optimization
- Email notifications
- Approval notifications
- Automated invoice matching
- Purchase analytics dashboards
- Spend analytics
- Contract renewal notifications
- Audit trails
- File/document attachments
- S3 or Azure Blob Storage integration
- Redis-based caching
- Background job processing
- Docker containerization
- Kubernetes deployment
- CI/CD pipelines
- Prometheus and Grafana monitoring

---

## Contributing

Contributions are welcome.

### Development Workflow

```text
Fork
  |
  v
Create Feature Branch
  |
  v
Implement Changes
  |
  v
Test
  |
  v
Commit
  |
  v
Push
  |
  v
Pull Request
```

Suggested branch naming:

```text
feature/supplier-scorecard
feature/invoice-matching
fix/requisition-validation
refactor/procurement-service
```

Before opening a pull request:

- Verify the frontend builds successfully
- Verify the backend builds successfully
- Verify database migrations
- Test affected API endpoints
- Test the affected UI workflow
- Avoid committing secrets or local configuration

---

## License

This project is currently maintained as a personal/project portfolio application.

If this repository is intended for public distribution, add an appropriate open-source license such as MIT, Apache-2.0, or GPL-3.0.

---

## Author

**Malay Maity**

Full-Stack Developer | Computer Science & Engineering

GitHub:

https://github.com/malayofficialcse-dev

Project Repository:

https://github.com/malayofficialcse-dev/supplyx-nexus-hub-malay

---

## Project Status

**Status:** Active Development

SupplyX SCM is being developed as a full-stack supply-chain and procurement management platform with a focus on modular architecture, transactional workflows, supplier management, purchasing, financial operations, and future logistics capabilities.
