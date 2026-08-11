import {
  PrismaClient,
  Warehouse,
  Shipment,
  LogisticsRoute,
  Customer,
  Carrier,
  Contract,
  Invoice,
  Payment,
  GoodsReceipt,
  BudgetCategory,
} from "@prisma/client";

const prisma = new PrismaClient();

export class WarehouseRepository {
  async getAll(): Promise<Warehouse[]> {
    return prisma.warehouse.findMany({
      orderBy: { whId: "asc" },
    });
  }

  async updateFillLevel(id: string, fillLevel: number): Promise<Warehouse> {
    return prisma.warehouse.update({ where: { id }, data: { fillLevel } });
  }
}

export class ShipmentRepository {
  async getAll(): Promise<Shipment[]> {
    return prisma.shipment.findMany({
      orderBy: { estDelivery: "asc" },
    });
  }

  async create(data: { trackingNumber: string; origin: string; destination: string; carrier: string; status: string; estDelivery: string; }): Promise<Shipment> {
    return prisma.shipment.create({ data });
  }
}

export class LogisticsRepository {
  async getAll(): Promise<LogisticsRoute[]> {
    return prisma.logisticsRoute.findMany({
      orderBy: { routeName: "asc" },
    });
  }
}

export class CustomerRepository {
  async getAll(): Promise<Customer[]> {
    return prisma.customer.findMany({
      orderBy: { companyName: "asc" },
    });
  }
}

export class CarrierRepository {
  async getAll(): Promise<Carrier[]> {
    return prisma.carrier.findMany({
      orderBy: { rating: "desc" },
    });
  }
}

export class ContractRepository {
  async getAll(): Promise<Contract[]> {
    return prisma.contract.findMany({
      orderBy: { start: "desc" },
    });
  }
}

export class InvoiceRepository {
  async getAll(): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      orderBy: { date: "desc" },
    });
  }

  async getById(id: string): Promise<Invoice | null> {
    return prisma.invoice.findUnique({
      where: { id },
    });
  }

  async create(data: {
    invoiceId: string;
    supplier: string;
    date: string;
    amount: number;
    status: string;
    items: any;
  }): Promise<Invoice> {
    return prisma.invoice.create({ data });
  }
}

export class PaymentRepository {
  async getAll(): Promise<Payment[]> {
    return prisma.payment.findMany({
      orderBy: { paymentId: "desc" },
    });
  }

  async getById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id },
    });
  }

  async create(data: { paymentId: string; invoiceId: string; supplier: string; amount: number; status: string; method: string; auditTrail: any; }): Promise<Payment> {
    return prisma.payment.create({ data });
  }
}

export class GoodsReceiptRepository {
  async getAll(): Promise<GoodsReceipt[]> {
    return prisma.goodsReceipt.findMany({
      orderBy: { deliveryDate: "desc" },
    });
  }

  async getById(id: string): Promise<GoodsReceipt | null> {
    return prisma.goodsReceipt.findUnique({
      where: { id },
    });
  }

  async create(data: {
    receiptId: string;
    orderId: string;
    supplier: string;
    deliveryDate: string;
    status: string;
    items: any;
  }): Promise<GoodsReceipt> {
    return prisma.goodsReceipt.create({
      data,
    });
  }
}

export class BudgetRepository {
  async getAll(): Promise<BudgetCategory[]> {
    return prisma.budgetCategory.findMany({
      orderBy: { category: "asc" },
    });
  }
}
