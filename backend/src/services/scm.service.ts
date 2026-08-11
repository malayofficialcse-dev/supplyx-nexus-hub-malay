import {
  Warehouse,
  Shipment,
  LogisticsRoute,
  Customer,
  Carrier,
  Contract,
  Invoice,
  Payment,
  GoodsReceipt,
} from "@prisma/client";
import {
  WarehouseRepository,
  ShipmentRepository,
  LogisticsRepository,
  CustomerRepository,
  CarrierRepository,
  ContractRepository,
  InvoiceRepository,
  PaymentRepository,
  GoodsReceiptRepository,
} from "../repositories/scm.repo.js";

const warehouseRepo = new WarehouseRepository();
const shipmentRepo = new ShipmentRepository();
const logisticsRepo = new LogisticsRepository();
const customerRepo = new CustomerRepository();
const carrierRepo = new CarrierRepository();
const contractRepo = new ContractRepository();
const invoiceRepo = new InvoiceRepository();
const paymentRepo = new PaymentRepository();
const goodsReceiptRepo = new GoodsReceiptRepository();

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class WarehouseService {
  async getWarehouses(params: Record<string, any> = {}): Promise<ListResult<Warehouse>> {
    return warehouseRepo.findMany(params);
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    return warehouseRepo.getById(id);
  }

  async createWarehouse(data: {
    whId: string;
    name: string;
    location: string;
    capacity: number;
    fillLevel: number;
    status: string;
  }): Promise<Warehouse> {
    return warehouseRepo.create(data);
  }

  async updateWarehouse(id: string, data: Partial<Omit<Warehouse, "id" | "createdAt">>): Promise<Warehouse> {
    return warehouseRepo.update(id, data);
  }

  async deleteWarehouse(id: string): Promise<Warehouse> {
    return warehouseRepo.delete(id);
  }
}

export class ShipmentService {
  async getShipments(): Promise<Shipment[]> {
    return shipmentRepo.getAll();
  }
  async createShipment(data: {
    trackingNumber: string;
    origin: string;
    destination: string;
    carrier: string;
    status: string;
    estDelivery: string;
  }): Promise<Shipment> {
    return shipmentRepo.create(data);
  }
}

export class LogisticsService {
  async getLogistics(): Promise<LogisticsRoute[]> {
    return logisticsRepo.getAll();
  }
}

export class CustomerService {
  async getCustomers(params: Record<string, any> = {}): Promise<ListResult<Customer>> {
    return customerRepo.findMany(params);
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return customerRepo.getById(id);
  }

  async createCustomer(data: {
    companyName: string;
    contact: string;
    email: string;
    status: string;
    salesYTD: number;
  }): Promise<Customer> {
    return customerRepo.create(data);
  }

  async updateCustomer(id: string, data: Partial<Omit<Customer, "id" | "createdAt">>): Promise<Customer> {
    return customerRepo.update(id, data);
  }

  async deleteCustomer(id: string): Promise<Customer> {
    return customerRepo.delete(id);
  }
}

export class CarrierService {
  async getCarriers(params: Record<string, any> = {}): Promise<ListResult<Carrier>> {
    return carrierRepo.findMany(params);
  }

  async getCarrierById(id: string): Promise<Carrier | null> {
    return carrierRepo.getById(id);
  }

  async createCarrier(data: {
    name: string;
    type: string;
    rating: number;
    activeVehicles: number;
    contact: string;
  }): Promise<Carrier> {
    return carrierRepo.create(data);
  }

  async updateCarrier(id: string, data: Partial<Omit<Carrier, "id" | "createdAt">>): Promise<Carrier> {
    return carrierRepo.update(id, data);
  }

  async deleteCarrier(id: string): Promise<Carrier> {
    return carrierRepo.delete(id);
  }
}

export class ContractService {
  async getContracts(params: Record<string, any> = {}): Promise<ListResult<Contract>> {
    return contractRepo.findMany(params);
  }

  async getContractById(id: string): Promise<Contract | null> {
    return contractRepo.getById(id);
  }

  async createContract(data: {
    conId: string;
    initials: string;
    supplier: string;
    start: string;
    end: string;
    status: string;
  }): Promise<Contract> {
    return contractRepo.create(data);
  }

  async updateContract(id: string, data: Partial<Omit<Contract, "id" | "createdAt">>): Promise<Contract> {
    return contractRepo.update(id, data);
  }

  async deleteContract(id: string): Promise<Contract> {
    return contractRepo.delete(id);
  }
}

export class InvoiceService {
  async getInvoices(): Promise<Invoice[]> {
    return invoiceRepo.getAll();
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    return invoiceRepo.getById(id);
  }

  async createInvoice(data: { supplier: string; date: string; amount: number; status?: string; items: any[] }): Promise<Invoice> {
    const count = await invoiceRepo.getAll();
    const invoiceId = `INV-${3000 + count.length}`;
    return invoiceRepo.create({ invoiceId, supplier: data.supplier, date: data.date, amount: data.amount, status: data.status || "Pending", items: data.items });
  }
}

export class PaymentService {
  async getPayments(): Promise<Payment[]> {
    return paymentRepo.getAll();
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return paymentRepo.getById(id);
  }

  async createPayment(data: { invoiceId: string; supplier: string; amount: number; method: string; auditTrail?: any[] }): Promise<Payment> {
    const count = await paymentRepo.getAll();
    const paymentId = `PAY-${9000 + count.length}`;
    return paymentRepo.create({ paymentId, invoiceId: data.invoiceId, supplier: data.supplier, amount: data.amount, status: "Processed", method: data.method, auditTrail: data.auditTrail || [] });
  }
}

export class GoodsReceiptService {
  async getGoodsReceipts(): Promise<GoodsReceipt[]> {
    return goodsReceiptRepo.getAll();
  }

  async getGoodsReceiptById(id: string): Promise<GoodsReceipt | null> {
    return goodsReceiptRepo.getById(id);
  }

  async createGoodsReceipt(data: {
    orderId: string;
    supplier: string;
    deliveryDate: string;
    status?: string;
    items: any[];
  }): Promise<GoodsReceipt> {
    const count = await goodsReceiptRepo.getAll();
    const receiptId = `GRN-${5522 + count.length}`;
    const created = await goodsReceiptRepo.create({
      receiptId,
      orderId: data.orderId,
      supplier: data.supplier,
      deliveryDate: data.deliveryDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: data.status || "Fully Received",
      items: data.items,
    });

    // Attempt to update warehouse fill level based on received quantities
    try {
      const warehouses = await warehouseRepo.getAll();
      if (warehouses && warehouses.length > 0) {
        const first = warehouses[0];
        const extraQty = (data.items || []).reduce((sum: number, it: any) => sum + (it.receivedQty || it.qty || 0), 0);
        // Adjust fillLevel conservatively: each 10 units -> +1%
        const delta = Math.round(extraQty / 10);
        const newFill = Math.min(100, (first.fillLevel || 0) + delta);
        await warehouseRepo.updateFillLevel(first.id, newFill);
      }
    } catch (e) {
      // ignore warehouse update failures
    }

    return created;
  }
}
