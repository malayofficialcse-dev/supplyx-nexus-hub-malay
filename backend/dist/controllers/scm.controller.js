import { WarehouseService, ShipmentService, LogisticsService, CustomerService, CarrierService, ContractService, InvoiceService, PaymentService, GoodsReceiptService, InventoryService, } from "../services/scm.service.js";
const warehouseService = new WarehouseService();
const shipmentService = new ShipmentService();
const logisticsService = new LogisticsService();
const customerService = new CustomerService();
const carrierService = new CarrierService();
const contractService = new ContractService();
const invoiceService = new InvoiceService();
const paymentService = new PaymentService();
const goodsReceiptService = new GoodsReceiptService();
const inventoryService = new InventoryService();
const parseNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const shouldReturnPagedList = (query) => {
    return Boolean(query.page ||
        query.limit ||
        query.search ||
        query.sortBy ||
        query.sortOrder ||
        query.status ||
        query.type);
};
export class WarehouseController {
    async getWarehouses(req, res) {
        try {
            const params = {
                search: req.query.search,
                status: req.query.status,
                page: parseNumber(req.query.page, 1),
                limit: parseNumber(req.query.limit, 10),
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
            };
            const result = await warehouseService.getWarehouses(params);
            return res.json(shouldReturnPagedList(req.query) ? result : result.data);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getWarehouseById(req, res) {
        try {
            const detail = await warehouseService.getWarehouseById(req.params.id);
            if (!detail)
                return res.status(404).json({ error: "Warehouse not found" });
            return res.json(detail);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createWarehouse(req, res) {
        try {
            const { whId, name, location, capacity, fillLevel, status } = req.body;
            if (!whId || !name || !location || capacity === undefined || fillLevel === undefined || !status) {
                return res.status(400).json({ error: "Missing required fields (whId, name, location, capacity, fillLevel, status)" });
            }
            const created = await warehouseService.createWarehouse({
                whId,
                name,
                location,
                capacity: parseNumber(capacity, 0),
                fillLevel: parseNumber(fillLevel, 0),
                status,
            });
            return res.status(201).json(created);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async updateWarehouse(req, res) {
        try {
            const update = { ...req.body };
            if (update.capacity !== undefined)
                update.capacity = parseNumber(update.capacity, 0);
            if (update.fillLevel !== undefined)
                update.fillLevel = parseNumber(update.fillLevel, 0);
            const updated = await warehouseService.updateWarehouse(req.params.id, update);
            return res.json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async deleteWarehouse(req, res) {
        try {
            const deleted = await warehouseService.deleteWarehouse(req.params.id);
            return res.json(deleted);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export class ShipmentController {
    async getShipments(req, res) {
        try {
            const list = await shipmentService.getShipments();
            return res.json(list);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createShipment(req, res) {
        try {
            const { trackingNumber, origin, destination, carrier, status, estDelivery } = req.body;
            if (!trackingNumber || !origin || !destination)
                return res.status(400).json({ error: "Missing required fields" });
            const created = await shipmentService.createShipment({ trackingNumber, origin, destination, carrier, status: status || "Created", estDelivery: estDelivery || new Date().toDateString() });
            return res.status(201).json(created);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export class LogisticsController {
    async getLogistics(req, res) {
        try {
            const list = await logisticsService.getLogistics();
            return res.json(list);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export class CustomerController {
    async getCustomers(req, res) {
        try {
            const params = {
                search: req.query.search,
                status: req.query.status,
                page: parseNumber(req.query.page, 1),
                limit: parseNumber(req.query.limit, 10),
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
            };
            const result = await customerService.getCustomers(params);
            return res.json(shouldReturnPagedList(req.query) ? result : result.data);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getCustomerById(req, res) {
        try {
            const detail = await customerService.getCustomerById(req.params.id);
            if (!detail)
                return res.status(404).json({ error: "Customer not found" });
            return res.json(detail);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createCustomer(req, res) {
        try {
            const { companyName, contact, email, status, salesYTD } = req.body;
            if (!companyName || !contact || !email || !status || salesYTD === undefined) {
                return res.status(400).json({ error: "Missing required fields (companyName, contact, email, status, salesYTD)" });
            }
            const created = await customerService.createCustomer({
                companyName,
                contact,
                email,
                status,
                salesYTD: parseNumber(salesYTD, 0),
            });
            return res.status(201).json(created);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async updateCustomer(req, res) {
        try {
            const update = { ...req.body };
            if (update.salesYTD !== undefined)
                update.salesYTD = parseNumber(update.salesYTD, 0);
            const updated = await customerService.updateCustomer(req.params.id, update);
            return res.json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async deleteCustomer(req, res) {
        try {
            const deleted = await customerService.deleteCustomer(req.params.id);
            return res.json(deleted);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export class CarrierController {
    async getCarriers(req, res) {
        try {
            const params = {
                search: req.query.search,
                type: req.query.type,
                page: parseNumber(req.query.page, 1),
                limit: parseNumber(req.query.limit, 10),
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
            };
            const result = await carrierService.getCarriers(params);
            return res.json(shouldReturnPagedList(req.query) ? result : result.data);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getCarrierById(req, res) {
        try {
            const detail = await carrierService.getCarrierById(req.params.id);
            if (!detail)
                return res.status(404).json({ error: "Carrier not found" });
            return res.json(detail);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createCarrier(req, res) {
        try {
            const { name, type, rating, activeVehicles, contact } = req.body;
            if (!name || !type || rating === undefined || activeVehicles === undefined || !contact) {
                return res.status(400).json({ error: "Missing required fields (name, type, rating, activeVehicles, contact)" });
            }
            const created = await carrierService.createCarrier({
                name,
                type,
                rating: parseNumber(rating, 0),
                activeVehicles: parseNumber(activeVehicles, 0),
                contact,
            });
            return res.status(201).json(created);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async updateCarrier(req, res) {
        try {
            const update = { ...req.body };
            if (update.rating !== undefined)
                update.rating = parseNumber(update.rating, 0);
            if (update.activeVehicles !== undefined)
                update.activeVehicles = parseNumber(update.activeVehicles, 0);
            const updated = await carrierService.updateCarrier(req.params.id, update);
            return res.json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async deleteCarrier(req, res) {
        try {
            const deleted = await carrierService.deleteCarrier(req.params.id);
            return res.json(deleted);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export class ContractController {
    async getContracts(req, res) {
        try {
            const params = {
                search: req.query.search,
                status: req.query.status,
                page: parseNumber(req.query.page, 1),
                limit: parseNumber(req.query.limit, 10),
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
            };
            const result = await contractService.getContracts(params);
            return res.json(shouldReturnPagedList(req.query) ? result : result.data);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getContractById(req, res) {
        try {
            const detail = await contractService.getContractById(req.params.id);
            if (!detail)
                return res.status(404).json({ error: "Contract not found" });
            return res.json(detail);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createContract(req, res) {
        try {
            const { conId, initials, supplier, start, end, status } = req.body;
            if (!conId || !initials || !supplier || !start || !end || !status) {
                return res.status(400).json({ error: "Missing required fields (conId, initials, supplier, start, end, status)" });
            }
            const created = await contractService.createContract({ conId, initials, supplier, start, end, status });
            return res.status(201).json(created);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async updateContract(req, res) {
        try {
            const updated = await contractService.updateContract(req.params.id, req.body);
            return res.json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async deleteContract(req, res) {
        try {
            const deleted = await contractService.deleteContract(req.params.id);
            return res.json(deleted);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getExpiringContracts(req, res) {
        try {
            const days = parseInt(req.query.days) || 90;
            const list = await contractService.getExpiringContracts(days);
            return res.json(list);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async autoExpire(req, res) {
        try {
            const result = await contractService.autoExpireContracts();
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export class InvoiceController {
    async getInvoices(req, res) {
        try {
            const list = await invoiceService.getInvoices();
            return res.json(list);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getInvoiceById(req, res) {
        try {
            const detail = await invoiceService.getInvoiceById(req.params.id);
            if (!detail)
                return res.status(404).json({ error: "Invoice not found" });
            return res.json(detail);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createInvoice(req, res) {
        try {
            const { supplier, date, amount, items, status } = req.body;
            if (!supplier || !date || !amount)
                return res.status(400).json({ error: "Missing required fields (supplier, date, amount)" });
            const created = await invoiceService.createInvoice({ supplier, date, amount: parseFloat(amount), status, items: items || [] });
            return res.status(201).json(created);
        }
        catch (error) {
            if (error.code === "DUPLICATE_INVOICE") {
                return res.status(409).json({
                    error: error.message,
                    code: "DUPLICATE_INVOICE",
                    duplicate: error.duplicate,
                });
            }
            return res.status(500).json({ error: error.message });
        }
    }
    async checkDuplicate(req, res) {
        try {
            const { supplier, amount, date } = req.query;
            if (!supplier || !amount || !date)
                return res.status(400).json({ error: "supplier, amount, date required" });
            const dup = await invoiceService.checkDuplicate(String(supplier), parseFloat(String(amount)), String(date));
            return res.json({ duplicate: !!dup, invoice: dup ?? null });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async updateInvoice(req, res) {
        try {
            const updated = await invoiceService.updateInvoice(req.params.id, req.body);
            return res.json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async payInvoice(req, res) {
        try {
            const { id } = req.params;
            const { method, notes } = req.body || {};
            const user = req.user;
            const actor = user?.name || "Procurement Specialist";
            const result = await invoiceService.payInvoice(id, { method, actor, notes });
            return res.status(200).json({
                message: `Invoice ${result.invoice.invoiceId} successfully settled and paid.`,
                invoice: result.invoice,
                payment: result.payment,
            });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async downloadPdf(req, res) {
        try {
            const { id } = req.params;
            const pdfBuffer = await invoiceService.getInvoicePdf(id);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=Invoice-${id}.pdf`);
            return res.send(pdfBuffer);
        }
        catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }
    async deleteInvoice(req, res) {
        try {
            const { id } = req.params;
            const { prisma } = await import("../repositories/scm.repo.js");
            const deleted = await prisma.invoice.delete({ where: { id } });
            return res.json(deleted);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export class PaymentController {
    async getPayments(req, res) {
        try {
            const list = await paymentService.getPayments();
            return res.json(list);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getPaymentById(req, res) {
        try {
            const detail = await paymentService.getPaymentById(req.params.id);
            if (!detail)
                return res.status(404).json({ error: "Payment not found" });
            return res.json(detail);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createPayment(req, res) {
        try {
            const { invoiceId, supplier, amount, method } = req.body;
            if (!invoiceId || !supplier || !amount || !method)
                return res.status(400).json({ error: "Missing required fields (invoiceId, supplier, amount, method)" });
            const created = await paymentService.createPayment({ invoiceId, supplier, amount: parseFloat(amount), method, auditTrail: [] });
            return res.status(201).json(created);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export class InventoryController {
    async getInventories(req, res) {
        try {
            const list = await inventoryService.getInventories();
            return res.json(list);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getInventoryByWarehouse(req, res) {
        try {
            const warehouseId = req.params.warehouseId;
            const list = await inventoryService.getInventoriesByWarehouse(warehouseId);
            return res.json(list);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getStockAlerts(req, res) {
        try {
            const alerts = await inventoryService.getStockAlerts();
            return res.json(alerts);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export class GoodsReceiptController {
    async getGoodsReceipts(req, res) {
        try {
            const list = await goodsReceiptService.getGoodsReceipts();
            return res.json(list);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getGoodsReceiptById(req, res) {
        try {
            const detail = await goodsReceiptService.getGoodsReceiptById(req.params.id);
            if (!detail)
                return res.status(404).json({ error: "Goods Receipt not found" });
            return res.json(detail);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createGoodsReceipt(req, res) {
        try {
            const { orderId, supplier, deliveryDate, status, items } = req.body;
            if (!orderId || !supplier) {
                return res.status(400).json({ error: "Missing required fields (orderId, supplier)" });
            }
            const newGR = await goodsReceiptService.createGoodsReceipt({
                orderId,
                supplier,
                deliveryDate,
                status,
                items: items || [],
            });
            return res.status(201).json(newGR);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
