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
  Inventory,
  InventoryMovement,
} from "@prisma/client";
import { OrderRepository } from "../repositories/order.repo.js";
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
  InventoryRepository,
  InventoryMovementRepository,
  prisma,
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
const orderRepo = new OrderRepository();
const inventoryRepo = new InventoryRepository();
const inventoryMovementRepo = new InventoryMovementRepository();

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

export class InventoryService {
  async getInventories(): Promise<Inventory[]> {
    return inventoryRepo.getAll();
  }

  async getInventoriesByWarehouse(warehouseId: string): Promise<Inventory[]> {
    return inventoryRepo.getByWarehouseId(warehouseId);
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
    warehouseId?: string;
    deliveryDate: string;
    status?: string;
    items: any[];
  }): Promise<GoodsReceipt> {
    const order = await orderRepo.getByOrderId(data.orderId);
    if (!order) {
      throw new Error(`Purchase order ${data.orderId} not found`);
    }

    const normalizedItems = Array.isArray(data.items) ? data.items : [];
    if (normalizedItems.length === 0) {
      throw new Error("Goods receipt must include at least one item");
    }

    const orderItems = Array.isArray(order.items) ? (order.items as any[]) : [];
    const totalOrdered = orderItems.reduce((sum: number, item: any) => sum + (Number(item?.quantity) || 0), 0);
    const receiptQuantity = normalizedItems.reduce((sum: number, item: any) => sum + (Number(item?.receivedQty) || 0), 0);

    if (receiptQuantity <= 0) {
      throw new Error("Received quantity must be greater than zero");
    }

    const projectedReceived = order.receivedQuantity + receiptQuantity;
    if (projectedReceived > totalOrdered) {
      throw new Error("Received quantity exceeds ordered quantity for this purchase order");
    }

    const warehouses = await warehouseRepo.getAll();
    const warehouseId = data.warehouseId || warehouses?.[0]?.id;
    if (!warehouseId) {
      throw new Error("Warehouse is required to record inventory receipt");
    }

    const receiptId = `GRN-${5522 + (await goodsReceiptRepo.getAll()).length}`;
    const deliveryDate = data.deliveryDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const status = data.status || (projectedReceived === totalOrdered ? "Fully Received" : "Partially Received");

    const createdReceipt = await prisma.$transaction(async (tx) => {
      const gr = await tx.goodsReceipt.create({
        data: {
          receiptId,
          orderId: data.orderId,
          supplier: data.supplier,
          warehouseId,
          deliveryDate,
          status,
          items: normalizedItems,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          receivedQuantity: projectedReceived,
          status,
        },
      });

      for (const item of normalizedItems) {
        const itemName = String(item.name || "Unknown Item");
        const receivedQty = Number(item.receivedQty || 0);
        if (receivedQty <= 0) continue;

        const matchedOrderItem = orderItems.find((oi: any) => oi.name === itemName);
        const unit = item.unit || matchedOrderItem?.unit || "pcs";
        const skuValue = item.sku ?? "";

        const inventory = await tx.inventory.upsert({
          where: { warehouseId_item_sku: { warehouseId, item: itemName, sku: skuValue } },
          create: {
            warehouseId,
            item: itemName,
            sku: item.sku,
            unit,
            quantity: receivedQty,
            metadata: item.metadata || {},
          },
          update: {
            quantity: {
              increment: receivedQty,
            },
            metadata: item.metadata || {},
          },
        });

        await tx.inventoryMovement.create({
          data: {
            inventoryId: inventory.id,
            goodsReceiptId: gr.id,
            orderId: order.id,
            warehouseId,
            type: "GoodsReceipt",
            quantity: receivedQty,
            balanceAfter: inventory.quantity,
            notes: `Received for ${order.orderId}`,
          },
        });
      }

      const warehouse = await tx.warehouse.findUnique({ where: { id: warehouseId } });
      if (warehouse) {
        const delta = Math.round(receiptQuantity / 10);
        await tx.warehouse.update({
          where: { id: warehouseId },
          data: { fillLevel: Math.min(100, Math.max(0, warehouse.fillLevel + delta)) },
        });
      }

      return gr;
    });

    return createdReceipt;
  }
}
