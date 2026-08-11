import { Request, Response } from "express";
import {
  WarehouseService,
  ShipmentService,
  LogisticsService,
  CustomerService,
  CarrierService,
  ContractService,
  InvoiceService,
  PaymentService,
  GoodsReceiptService,
} from "../services/scm.service.js";

const warehouseService = new WarehouseService();
const shipmentService = new ShipmentService();
const logisticsService = new LogisticsService();
const customerService = new CustomerService();
const carrierService = new CarrierService();
const contractService = new ContractService();
const invoiceService = new InvoiceService();
const paymentService = new PaymentService();
const goodsReceiptService = new GoodsReceiptService();

const parseNumber = (value: any, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const shouldReturnPagedList = (query: any) => {
  return Boolean(
    query.page ||
      query.limit ||
      query.search ||
      query.sortBy ||
      query.sortOrder ||
      query.status ||
      query.type
  );
};

export class WarehouseController {
  async getWarehouses(req: Request, res: Response) {
    try {
      const params = {
        search: req.query.search as string,
        status: req.query.status as string,
        page: parseNumber(req.query.page, 1),
        limit: parseNumber(req.query.limit, 10),
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as string,
      };
      const result = await warehouseService.getWarehouses(params);
      return res.json(shouldReturnPagedList(req.query) ? result : result.data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getWarehouseById(req: Request, res: Response) {
    try {
      const detail = await warehouseService.getWarehouseById(req.params.id);
      if (!detail) return res.status(404).json({ error: "Warehouse not found" });
      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createWarehouse(req: Request, res: Response) {
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
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateWarehouse(req: Request, res: Response) {
    try {
      const update = { ...req.body };
      if (update.capacity !== undefined) update.capacity = parseNumber(update.capacity, 0);
      if (update.fillLevel !== undefined) update.fillLevel = parseNumber(update.fillLevel, 0);
      const updated = await warehouseService.updateWarehouse(req.params.id, update);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteWarehouse(req: Request, res: Response) {
    try {
      const deleted = await warehouseService.deleteWarehouse(req.params.id);
      return res.json(deleted);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class ShipmentController {
  async getShipments(req: Request, res: Response) {
    try {
      const list = await shipmentService.getShipments();
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createShipment(req: Request, res: Response) {
    try {
      const { trackingNumber, origin, destination, carrier, status, estDelivery } = req.body;
      if (!trackingNumber || !origin || !destination) return res.status(400).json({ error: "Missing required fields" });
      const created = await shipmentService.createShipment({ trackingNumber, origin, destination, carrier, status: status || "Created", estDelivery: estDelivery || new Date().toDateString() });
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class LogisticsController {
  async getLogistics(req: Request, res: Response) {
    try {
      const list = await logisticsService.getLogistics();
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class CustomerController {
  async getCustomers(req: Request, res: Response) {
    try {
      const params = {
        search: req.query.search as string,
        status: req.query.status as string,
        page: parseNumber(req.query.page, 1),
        limit: parseNumber(req.query.limit, 10),
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as string,
      };
      const result = await customerService.getCustomers(params);
      return res.json(shouldReturnPagedList(req.query) ? result : result.data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getCustomerById(req: Request, res: Response) {
    try {
      const detail = await customerService.getCustomerById(req.params.id);
      if (!detail) return res.status(404).json({ error: "Customer not found" });
      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createCustomer(req: Request, res: Response) {
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
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const update = { ...req.body };
      if (update.salesYTD !== undefined) update.salesYTD = parseNumber(update.salesYTD, 0);
      const updated = await customerService.updateCustomer(req.params.id, update);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteCustomer(req: Request, res: Response) {
    try {
      const deleted = await customerService.deleteCustomer(req.params.id);
      return res.json(deleted);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class CarrierController {
  async getCarriers(req: Request, res: Response) {
    try {
      const params = {
        search: req.query.search as string,
        type: req.query.type as string,
        page: parseNumber(req.query.page, 1),
        limit: parseNumber(req.query.limit, 10),
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as string,
      };
      const result = await carrierService.getCarriers(params);
      return res.json(shouldReturnPagedList(req.query) ? result : result.data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getCarrierById(req: Request, res: Response) {
    try {
      const detail = await carrierService.getCarrierById(req.params.id);
      if (!detail) return res.status(404).json({ error: "Carrier not found" });
      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createCarrier(req: Request, res: Response) {
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
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateCarrier(req: Request, res: Response) {
    try {
      const update = { ...req.body };
      if (update.rating !== undefined) update.rating = parseNumber(update.rating, 0);
      if (update.activeVehicles !== undefined) update.activeVehicles = parseNumber(update.activeVehicles, 0);
      const updated = await carrierService.updateCarrier(req.params.id, update);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteCarrier(req: Request, res: Response) {
    try {
      const deleted = await carrierService.deleteCarrier(req.params.id);
      return res.json(deleted);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class ContractController {
  async getContracts(req: Request, res: Response) {
    try {
      const params = {
        search: req.query.search as string,
        status: req.query.status as string,
        page: parseNumber(req.query.page, 1),
        limit: parseNumber(req.query.limit, 10),
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as string,
      };
      const result = await contractService.getContracts(params);
      return res.json(shouldReturnPagedList(req.query) ? result : result.data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getContractById(req: Request, res: Response) {
    try {
      const detail = await contractService.getContractById(req.params.id);
      if (!detail) return res.status(404).json({ error: "Contract not found" });
      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createContract(req: Request, res: Response) {
    try {
      const { conId, initials, supplier, start, end, status } = req.body;
      if (!conId || !initials || !supplier || !start || !end || !status) {
        return res.status(400).json({ error: "Missing required fields (conId, initials, supplier, start, end, status)" });
      }
      const created = await contractService.createContract({ conId, initials, supplier, start, end, status });
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateContract(req: Request, res: Response) {
    try {
      const updated = await contractService.updateContract(req.params.id, req.body);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteContract(req: Request, res: Response) {
    try {
      const deleted = await contractService.deleteContract(req.params.id);
      return res.json(deleted);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class InvoiceController {
  async getInvoices(req: Request, res: Response) {
    try {
      const list = await invoiceService.getInvoices();
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getInvoiceById(req: Request, res: Response) {
    try {
      const detail = await invoiceService.getInvoiceById(req.params.id);
      if (!detail) return res.status(404).json({ error: "Invoice not found" });
      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createInvoice(req: Request, res: Response) {
    try {
      const { supplier, date, amount, items } = req.body;
      if (!supplier || !date || !amount) return res.status(400).json({ error: "Missing required fields (supplier, date, amount)" });
      const created = await invoiceService.createInvoice({ supplier, date, amount: parseFloat(amount), items: items || [] });
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class PaymentController {
  async getPayments(req: Request, res: Response) {
    try {
      const list = await paymentService.getPayments();
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getPaymentById(req: Request, res: Response) {
    try {
      const detail = await paymentService.getPaymentById(req.params.id);
      if (!detail) return res.status(404).json({ error: "Payment not found" });
      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createPayment(req: Request, res: Response) {
    try {
      const { invoiceId, supplier, amount, method } = req.body;
      if (!invoiceId || !supplier || !amount || !method) return res.status(400).json({ error: "Missing required fields (invoiceId, supplier, amount, method)" });
      const created = await paymentService.createPayment({ invoiceId, supplier, amount: parseFloat(amount), method, auditTrail: [] });
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class GoodsReceiptController {
  async getGoodsReceipts(req: Request, res: Response) {
    try {
      const list = await goodsReceiptService.getGoodsReceipts();
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getGoodsReceiptById(req: Request, res: Response) {
    try {
      const detail = await goodsReceiptService.getGoodsReceiptById(req.params.id);
      if (!detail) return res.status(404).json({ error: "Goods Receipt not found" });
      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createGoodsReceipt(req: Request, res: Response) {
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
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
