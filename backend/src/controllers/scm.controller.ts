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

export class WarehouseController {
  async getWarehouses(req: Request, res: Response) {
    try {
      const list = await warehouseService.getWarehouses();
      return res.json(list);
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
      const list = await customerService.getCustomers();
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class CarrierController {
  async getCarriers(req: Request, res: Response) {
    try {
      const list = await carrierService.getCarriers();
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export class ContractController {
  async getContracts(req: Request, res: Response) {
    try {
      const list = await contractService.getContracts();
      return res.json(list);
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
}
