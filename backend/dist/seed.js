import { prisma } from "./repositories/scm.repo.js";
import bcrypt from "bcryptjs";
const ALL_MODULES = [
    "analytics",
    "suppliers",
    "requisitions",
    "rfqs",
    "orders",
    "goods-receipts",
    "invoices",
    "payments",
    "budget",
    "contracts",
    "warehouses",
    "inventory",
    "shipments",
    "logistics",
    "carriers",
    "customers",
    "users",
];
function buildPermissions(allowedModules) {
    const perms = {};
    for (const m of ALL_MODULES) {
        const isAllowed = allowedModules.includes(m);
        perms[m] = {
            view: isAllowed,
            create: isAllowed,
            edit: isAllowed,
            delete: isAllowed,
        };
    }
    return perms;
}
async function main() {
    console.log("🧹 Wiping previous database records...");
    await prisma.inventoryMovement.deleteMany({});
    await prisma.inventory.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.goodsReceipt.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.quote.deleteMany({});
    await prisma.rFQ.deleteMany({});
    await prisma.requisition.deleteMany({});
    await prisma.contract.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.warehouse.deleteMany({});
    await prisma.shipment.deleteMany({});
    await prisma.logisticsRoute.deleteMany({});
    await prisma.carrier.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.budgetCategory.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("👥 Creating team users with realistic RBAC permissions...");
    const hashedPassword = await bcrypt.hash("Password123", 10);
    // 1. Superadmin
    const fullPerms = buildPermissions(ALL_MODULES);
    const superadmin = await prisma.user.create({
        data: {
            email: "superadmin@supplyx.com",
            name: "Alex Rivera (Superadmin)",
            password: hashedPassword,
            role: "Superadmin",
            permissions: fullPerms,
        },
    });
    // 2. Procurement Manager
    const procPerms = buildPermissions(["analytics", "suppliers", "requisitions", "rfqs", "orders", "contracts"]);
    const procurementUser = await prisma.user.create({
        data: {
            email: "procurement@supplyx.com",
            name: "Elena Rostova (Procurement)",
            password: hashedPassword,
            role: "Manager",
            permissions: procPerms,
        },
    });
    // 3. Warehouse & Inventory Lead
    const whPerms = buildPermissions(["analytics", "warehouses", "inventory", "goods-receipts", "shipments"]);
    const warehouseUser = await prisma.user.create({
        data: {
            email: "warehouse@supplyx.com",
            name: "Marcus Vance (Warehouse Lead)",
            password: hashedPassword,
            role: "Manager",
            permissions: whPerms,
        },
    });
    // 4. Finance Controller
    const finPerms = buildPermissions(["analytics", "invoices", "payments", "budget", "suppliers", "orders"]);
    const financeUser = await prisma.user.create({
        data: {
            email: "finance@supplyx.com",
            name: "Sophia Chen (Finance Director)",
            password: hashedPassword,
            role: "Manager",
            permissions: finPerms,
        },
    });
    // 5. Logistics Coordinator
    const logPerms = buildPermissions(["analytics", "shipments", "logistics", "carriers", "customers"]);
    const logisticsUser = await prisma.user.create({
        data: {
            email: "logistics@supplyx.com",
            name: "David Kim (Logistics Coordinator)",
            password: hashedPassword,
            role: "User",
            permissions: logPerms,
        },
    });
    // 6. Commercial Analyst
    const commPerms = buildPermissions(["analytics", "customers", "suppliers"]);
    await prisma.user.create({
        data: {
            email: "commercial@supplyx.com",
            name: "Jane Doe (Commercial Analyst)",
            password: hashedPassword,
            role: "User",
            permissions: commPerms,
        },
    });
    console.log("🏢 Seeding Warehouses...");
    const wh1 = await prisma.warehouse.create({
        data: {
            whId: "WH-01",
            name: "North America Central Hub",
            location: "Chicago, IL, USA",
            capacity: 150000,
            fillLevel: 72.4,
            status: "Active",
        },
    });
    const wh2 = await prisma.warehouse.create({
        data: {
            whId: "WH-02",
            name: "Western Coast Distribution Center",
            location: "Reno, NV, USA",
            capacity: 85000,
            fillLevel: 58.1,
            status: "Active",
        },
    });
    const wh3 = await prisma.warehouse.create({
        data: {
            whId: "WH-03",
            name: "European Central Gateway",
            location: "Rotterdam, Netherlands",
            capacity: 120000,
            fillLevel: 84.6,
            status: "Active",
        },
    });
    const wh4 = await prisma.warehouse.create({
        data: {
            whId: "WH-04",
            name: "APAC Regional Fulfillment Site",
            location: "Singapore",
            capacity: 95000,
            fillLevel: 63.9,
            status: "Active",
        },
    });
    console.log("🤝 Seeding Suppliers...");
    const sup1 = await prisma.supplier.create({
        data: {
            supId: "SUP-101",
            name: "Apex Electronics & Microchip Ltd",
            contact: "Marcus Thorne",
            email: "orders@apexelectronics.com",
            phone: "+1 (415) 890-2100",
            category: "Semiconductors",
            status: "Active",
            onTimeDeliveryRate: 97.4,
            defectRate: 0.2,
            avgLeadTimeDays: 14,
            totalOrderValue: 485000,
            lastScoreUpdated: new Date("2026-08-10"),
        },
    });
    const sup2 = await prisma.supplier.create({
        data: {
            supId: "SUP-102",
            name: "Global Packaging & Pallet Systems",
            contact: "Sarah Jenkins",
            email: "contracts@globalpack.com",
            phone: "+1 (312) 555-0144",
            category: "Packaging",
            status: "Active",
            onTimeDeliveryRate: 98.8,
            defectRate: 0.1,
            avgLeadTimeDays: 4,
            totalOrderValue: 125000,
            lastScoreUpdated: new Date("2026-08-12"),
        },
    });
    const sup3 = await prisma.supplier.create({
        data: {
            supId: "SUP-103",
            name: "Nordic Metals & Precision Castings",
            contact: "Henrik Lindqvist",
            email: "sales@nordicmetals.se",
            phone: "+46 8 123 4567",
            category: "Raw Materials",
            status: "Active",
            onTimeDeliveryRate: 93.2,
            defectRate: 0.8,
            avgLeadTimeDays: 21,
            totalOrderValue: 780000,
            lastScoreUpdated: new Date("2026-08-05"),
        },
    });
    const sup4 = await prisma.supplier.create({
        data: {
            supId: "SUP-104",
            name: "Quantum Sensor Technologies Inc",
            contact: "Dr. Aris Thorne",
            email: "supply@quantumsensors.io",
            phone: "+1 (617) 440-9922",
            category: "Electronics",
            status: "Active",
            onTimeDeliveryRate: 99.1,
            defectRate: 0.05,
            avgLeadTimeDays: 10,
            totalOrderValue: 340000,
            lastScoreUpdated: new Date("2026-08-14"),
        },
    });
    const sup5 = await prisma.supplier.create({
        data: {
            supId: "SUP-105",
            name: "Hydra Industrial Fluids & Lubricants",
            contact: "Carlos Morales",
            email: "orders@hydrafluids.com",
            phone: "+1 (713) 220-4100",
            category: "Chemicals",
            status: "Active",
            onTimeDeliveryRate: 95.0,
            defectRate: 0.4,
            avgLeadTimeDays: 7,
            totalOrderValue: 98000,
            lastScoreUpdated: new Date("2026-08-01"),
        },
    });
    console.log("📦 Seeding Inventory...");
    const inventoryItems = [
        { item: "Microcontroller Unit MCU-32", sku: "MCU-32X-01", unit: "Units", whId: wh1.id, qty: 12500, rop: 2000, roq: 5000 },
        { item: "Microcontroller Unit MCU-32", sku: "MCU-32X-01", unit: "Units", whId: wh3.id, qty: 8400, rop: 1500, roq: 3000 },
        { item: "Industrial Heavy Pallet 120x80", sku: "PAL-120-HD", unit: "Pallets", whId: wh1.id, qty: 450, rop: 100, roq: 500 },
        { item: "Industrial Heavy Pallet 120x80", sku: "PAL-120-HD", unit: "Pallets", whId: wh2.id, qty: 320, rop: 100, roq: 300 },
        { item: "Aluminum Precision Rod 6061-T6", sku: "AL-6061-ROD", unit: "kg", whId: wh1.id, qty: 3400, rop: 800, roq: 2000 },
        { item: "High-Temp Optical Sensor OS-800", sku: "OS-800-HT", unit: "Units", whId: wh1.id, qty: 45, rop: 50, roq: 100 }, // Low stock
        { item: "Lithium Polymer Battery Pack 48V", sku: "LIPO-48V-20AH", unit: "Units", whId: wh4.id, qty: 620, rop: 150, roq: 400 },
        { item: "Hydraulic Fluid ISO-VG-46", sku: "HYD-46-DRUM", unit: "Drums (200L)", whId: wh2.id, qty: 18, rop: 20, roq: 40 }, // Low stock
        { item: "Thermal Paste TG-900 Ultra", sku: "TP-900-TUBE", unit: "Tubes", whId: wh3.id, qty: 2800, rop: 400, roq: 1000 },
    ];
    for (const inv of inventoryItems) {
        await prisma.inventory.create({
            data: {
                warehouseId: inv.whId,
                item: inv.item,
                sku: inv.sku,
                unit: inv.unit,
                quantity: inv.qty,
                reorderPoint: inv.rop,
                reorderQty: inv.roq,
            },
        });
    }
    console.log("📑 Seeding Contracts...");
    await prisma.contract.create({
        data: {
            conId: "CON-2026-001",
            initials: "APX-SCM",
            supplier: sup1.name,
            start: "2026-01-01",
            end: "2026-12-31",
            status: "Active",
        },
    });
    await prisma.contract.create({
        data: {
            conId: "CON-2026-002",
            initials: "GPK-ANN",
            supplier: sup2.name,
            start: "2025-09-01",
            end: "2026-08-31", // Expiring within 30 days
            status: "Active",
        },
    });
    await prisma.contract.create({
        data: {
            conId: "CON-2026-003",
            initials: "NRD-MET",
            supplier: sup3.name,
            start: "2026-03-01",
            end: "2027-03-01",
            status: "Active",
        },
    });
    await prisma.contract.create({
        data: {
            conId: "CON-2026-004",
            initials: "QNT-SNS",
            supplier: sup4.name,
            start: "2026-02-15",
            end: "2026-09-05", // Expiring soon
            status: "Active",
        },
    });
    console.log("📝 Seeding Requisitions...");
    const reqData = [
        {
            reqId: "REQ-2042",
            requester: "Elena Rostova (Procurement)",
            department: "Procurement",
            costCenter: "CC-4401",
            item: "Microcontroller Unit MCU-32",
            items: [{ item: "MCU-32", quantity: 5000, price: 18.5 }],
            total: 92500,
            status: "Approved by Sophia Chen (Finance Director)",
            createdAt: new Date("2026-02-10T09:30:00Z"),
        },
        {
            reqId: "REQ-2043",
            requester: "Marcus Vance (Warehouse Lead)",
            department: "Operations",
            costCenter: "CC-3200",
            item: "Heavy Duty Wooden Pallets",
            items: [{ item: "Industrial Heavy Pallets", quantity: 300, price: 32 }],
            total: 9600,
            status: "Approved by Alex Rivera (Superadmin)",
            createdAt: new Date("2026-03-14T11:15:00Z"),
        },
        {
            reqId: "REQ-2044",
            requester: "David Kim (Logistics Coordinator)",
            department: "Logistics",
            costCenter: "CC-5500",
            item: "GPS Tracking Units for Fleet",
            items: [{ item: "Cellular Telematics Beacon", quantity: 50, price: 120 }],
            total: 6000,
            status: "Approved by Alex Rivera (Superadmin)",
            createdAt: new Date("2026-04-18T14:00:00Z"),
        },
        {
            reqId: "REQ-2045",
            requester: "Elena Rostova (Procurement)",
            department: "Manufacturing",
            costCenter: "CC-2100",
            item: "Aluminum Precision Rod 6061-T6",
            items: [{ item: "6061-T6 Rods (kg)", quantity: 2000, price: 14 }],
            total: 28000,
            status: "Converted by Elena Rostova (Procurement)",
            createdAt: new Date("2026-05-22T08:45:00Z"),
        },
        {
            reqId: "REQ-2046",
            requester: "Jane Doe (Commercial Analyst)",
            department: "IT",
            costCenter: "CC-1100",
            item: "Enterprise Data Hub Servers",
            items: [{ item: "Rackmount Server Node", quantity: 4, price: 4200 }],
            total: 16800,
            status: "Approved L1 by Sophia Chen (Finance Director)",
            createdAt: new Date("2026-07-02T16:20:00Z"),
        },
        {
            reqId: "REQ-2047",
            requester: "Marcus Vance (Warehouse Lead)",
            department: "Operations",
            costCenter: "CC-3200",
            item: "Hydraulic Fluid ISO-VG-46 Restock",
            items: [{ item: "ISO-VG-46 200L Drum", quantity: 25, price: 480 }],
            total: 12000,
            status: "Pending Approval",
            createdAt: new Date("2026-08-15T10:05:00Z"),
        },
    ];
    for (const r of reqData) {
        await prisma.requisition.create({
            data: {
                reqId: r.reqId,
                requester: r.requester,
                department: r.department,
                costCenter: r.costCenter,
                item: r.item,
                items: r.items,
                total: r.total,
                status: r.status,
                createdAt: r.createdAt,
            },
        });
    }
    console.log("🛒 Seeding Purchase Orders...");
    const order1 = await prisma.order.create({
        data: {
            orderId: "PO-1090",
            supplier: sup1.name,
            amount: 92500,
            deliveryDate: "2026-02-28",
            status: "Received",
            description: "Batch supply of MCU-32 chips",
            items: [{ item: "MCU-32", quantity: 5000, price: 18.5 }],
            receivedQuantity: 5000,
            createdAt: new Date("2026-02-12T10:00:00Z"),
        },
    });
    const order2 = await prisma.order.create({
        data: {
            orderId: "PO-1091",
            supplier: sup2.name,
            amount: 9600,
            deliveryDate: "2026-03-25",
            status: "Received",
            description: "Quarterly pallet order",
            items: [{ item: "Industrial Heavy Pallets", quantity: 300, price: 32 }],
            receivedQuantity: 300,
            createdAt: new Date("2026-03-16T14:30:00Z"),
        },
    });
    const order3 = await prisma.order.create({
        data: {
            orderId: "PO-1092",
            supplier: sup3.name,
            amount: 28000,
            deliveryDate: "2026-06-10",
            status: "Received",
            description: "Raw aluminum materials",
            items: [{ item: "6061-T6 Rods (kg)", quantity: 2000, price: 14 }],
            receivedQuantity: 2000,
            createdAt: new Date("2026-05-25T11:00:00Z"),
        },
    });
    const order4 = await prisma.order.create({
        data: {
            orderId: "PO-1093",
            supplier: sup4.name,
            amount: 45000,
            deliveryDate: "2026-08-28",
            status: "Ordered",
            description: "Optical sensor production run",
            items: [{ item: "OS-800-HT", quantity: 150, price: 300 }],
            receivedQuantity: 0,
            createdAt: new Date("2026-08-02T15:45:00Z"),
        },
    });
    const order5 = await prisma.order.create({
        data: {
            orderId: "PO-1094",
            supplier: sup5.name,
            amount: 12000,
            deliveryDate: "2026-08-30",
            status: "Ordered",
            description: "Hydraulic fluids shipment",
            items: [{ item: "ISO-VG-46 200L Drum", quantity: 25, price: 480 }],
            receivedQuantity: 0,
            createdAt: new Date("2026-08-15T11:30:00Z"),
        },
    });
    console.log("📥 Seeding Goods Receipts...");
    await prisma.goodsReceipt.create({
        data: {
            receiptId: "GRN-5520",
            orderId: order1.orderId,
            supplier: sup1.name,
            warehouseId: wh1.id,
            deliveryDate: "2026-02-28",
            status: "Received",
            items: [{ item: "MCU-32", received: 5000, inspected: 5000, passed: 5000 }],
            createdAt: new Date("2026-02-28T14:20:00Z"),
        },
    });
    await prisma.goodsReceipt.create({
        data: {
            receiptId: "GRN-5521",
            orderId: order2.orderId,
            supplier: sup2.name,
            warehouseId: wh2.id,
            deliveryDate: "2026-03-24",
            status: "Received",
            items: [{ item: "Industrial Heavy Pallets", received: 300, inspected: 300, passed: 300 }],
            createdAt: new Date("2026-03-24T16:10:00Z"),
        },
    });
    await prisma.goodsReceipt.create({
        data: {
            receiptId: "GRN-5522",
            orderId: order3.orderId,
            supplier: sup3.name,
            warehouseId: wh1.id,
            deliveryDate: "2026-06-09",
            status: "Received",
            items: [{ item: "6061-T6 Rods (kg)", received: 2000, inspected: 2000, passed: 2000 }],
            createdAt: new Date("2026-06-09T09:45:00Z"),
        },
    });
    console.log("💰 Seeding Invoices & Payments...");
    const inv1 = await prisma.invoice.create({
        data: {
            invoiceId: "INV-2026-8801",
            supplier: sup1.name,
            date: "2026-03-02",
            amount: 92500,
            status: "Paid",
            paymentTerms: "NET_30",
            dueDate: "2026-04-01",
            items: [{ description: "MCU-32 Microcontrollers (5,000 units)", amount: 92500 }],
            createdAt: new Date("2026-03-02T10:00:00Z"),
        },
    });
    await prisma.payment.create({
        data: {
            paymentId: "PAY-2026-4401",
            invoiceId: inv1.invoiceId,
            supplier: sup1.name,
            amount: 92500,
            status: "Paid",
            method: "Wire",
            auditTrail: [
                { action: "Authorized by Sophia Chen (Finance Director)", timestamp: "2026-03-28T14:00:00Z" },
                { action: "Settled via JPMorgan Chase Fedwire", timestamp: "2026-03-28T15:30:00Z" },
            ],
            createdAt: new Date("2026-03-28T14:00:00Z"),
        },
    });
    const inv2 = await prisma.invoice.create({
        data: {
            invoiceId: "INV-2026-8802",
            supplier: sup2.name,
            date: "2026-03-26",
            amount: 9600,
            status: "Paid",
            paymentTerms: "NET_30",
            dueDate: "2026-04-25",
            items: [{ description: "Pallets delivery GRN-5521", amount: 9600 }],
            createdAt: new Date("2026-03-26T11:00:00Z"),
        },
    });
    await prisma.payment.create({
        data: {
            paymentId: "PAY-2026-4402",
            invoiceId: inv2.invoiceId,
            supplier: sup2.name,
            amount: 9600,
            status: "Paid",
            method: "ACH",
            auditTrail: [
                { action: "Approved by Sophia Chen (Finance Director)", timestamp: "2026-04-20T10:15:00Z" },
            ],
            createdAt: new Date("2026-04-20T10:15:00Z"),
        },
    });
    await prisma.invoice.create({
        data: {
            invoiceId: "INV-2026-8803",
            supplier: sup3.name,
            date: "2026-06-12",
            amount: 28000,
            status: "Paid",
            paymentTerms: "NET_30",
            dueDate: "2026-07-12",
            items: [{ description: "Nordic precision metals", amount: 28000 }],
            createdAt: new Date("2026-06-12T14:30:00Z"),
        },
    });
    await prisma.invoice.create({
        data: {
            invoiceId: "INV-2026-8804",
            supplier: sup4.name,
            date: "2026-08-05",
            amount: 45000,
            status: "Approved",
            paymentTerms: "NET_30",
            dueDate: "2026-09-04",
            items: [{ description: "Advance optical sensors", amount: 45000 }],
            createdAt: new Date("2026-08-05T09:15:00Z"),
        },
    });
    console.log("🚚 Seeding Shipments, Carriers & Logistics...");
    await prisma.carrier.create({
        data: {
            name: "Maersk Global Line",
            type: "Ocean",
            rating: 4.8,
            activeVehicles: 640,
            contact: "dispatch@maersk.com",
        },
    });
    await prisma.carrier.create({
        data: {
            name: "FedEx Freight & Logistics",
            type: "Road",
            rating: 4.7,
            activeVehicles: 1250,
            contact: "customercare@fedex.com",
        },
    });
    await prisma.carrier.create({
        data: {
            name: "DHL Global Air Express",
            type: "Air",
            rating: 4.9,
            activeVehicles: 420,
            contact: "air-freight@dhl.com",
        },
    });
    await prisma.logisticsRoute.create({
        data: {
            routeName: "Rotterdam Port -> Chicago Central DC",
            costPerMile: 2.85,
            avgTransitTime: 12.5,
            volume: 4500,
        },
    });
    await prisma.logisticsRoute.create({
        data: {
            routeName: "Singapore Gateway -> Reno DC",
            costPerMile: 3.10,
            avgTransitTime: 14.0,
            volume: 3800,
        },
    });
    await prisma.logisticsRoute.create({
        data: {
            routeName: "Chicago Central -> Dallas Regional",
            costPerMile: 1.95,
            avgTransitTime: 2.0,
            volume: 8200,
        },
    });
    await prisma.shipment.create({
        data: {
            trackingNumber: "TRK-8890214",
            origin: "Rotterdam, Netherlands",
            destination: "Chicago, IL, USA",
            carrier: "Maersk Global Line",
            status: "Delivered",
            estDelivery: "2026-06-08",
            createdAt: new Date("2026-05-26T08:00:00Z"),
        },
    });
    await prisma.shipment.create({
        data: {
            trackingNumber: "TRK-8890450",
            origin: "Austin, TX, USA",
            destination: "Reno, NV, USA",
            carrier: "FedEx Freight & Logistics",
            status: "In Transit",
            estDelivery: "2026-08-20",
            createdAt: new Date("2026-08-14T10:00:00Z"),
        },
    });
    await prisma.shipment.create({
        data: {
            trackingNumber: "TRK-8890789",
            origin: "Singapore",
            destination: "Rotterdam, Netherlands",
            carrier: "DHL Global Air Express",
            status: "Scheduled",
            estDelivery: "2026-08-26",
            createdAt: new Date("2026-08-16T12:00:00Z"),
        },
    });
    console.log("🏢 Seeding Customers & Budgets...");
    await prisma.customer.create({
        data: {
            companyName: "Tesla Motors Giga Austin",
            contact: "James Wilson",
            email: "procurement@tesla.com",
            status: "Active",
            salesYTD: 1450000,
        },
    });
    await prisma.customer.create({
        data: {
            companyName: "Siemens Energy AG",
            contact: "Klaus Mueller",
            email: "supply.chain@siemens.com",
            status: "Active",
            salesYTD: 920000,
        },
    });
    await prisma.customer.create({
        data: {
            companyName: "Boeing Commercial Airplanes",
            contact: "Linda Taylor",
            email: "contracts@boeing.com",
            status: "Active",
            salesYTD: 2100000,
        },
    });
    const budgetItems = [
        { category: "Raw Materials & Metals", allocated: 1200000, spent: 808000, year: 2026 },
        { category: "Semiconductors & Electronic Components", allocated: 950000, spent: 577500, year: 2026 },
        { category: "Packaging & Logistics Operations", allocated: 350000, spent: 184600, year: 2026 },
        { category: "Warehouse Facility Maintenance", allocated: 250000, spent: 112000, year: 2026 },
        { category: "R&D & Engineering Intake", allocated: 400000, spent: 220000, year: 2026 },
    ];
    for (const b of budgetItems) {
        await prisma.budgetCategory.create({
            data: b,
        });
    }
    console.log("\n=======================================================");
    console.log("✨ DATABASE SEEDING COMPLETED SUCCESSFULLY ✨");
    console.log("=======================================================");
    console.log("🔑 Available Team Credentials (Password: Password123 for all):");
    console.log("1. Superadmin:           superadmin@supplyx.com");
    console.log("2. Procurement Lead:     procurement@supplyx.com");
    console.log("3. Warehouse Lead:       warehouse@supplyx.com");
    console.log("4. Finance Director:     finance@supplyx.com");
    console.log("5. Logistics Lead:       logistics@supplyx.com");
    console.log("6. Commercial Analyst:   commercial@supplyx.com");
    console.log("=======================================================\n");
}
main()
    .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
