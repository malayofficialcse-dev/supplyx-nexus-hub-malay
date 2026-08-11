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

interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface PaginationParams {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const normalizePagination = ({ page = 1, limit = 10 }: PaginationParams) => ({
  page: page < 1 ? 1 : page,
  limit: limit < 1 ? 10 : limit,
});

export class WarehouseRepository {
  async getAll(): Promise<Warehouse[]> {
    return this.findMany({}).then((result) => result.data);
  }

  async findMany(params: PaginationParams = {}): Promise<ListResult<Warehouse>> {
    const { search, status, page, limit, sortBy, sortOrder } = params;
    const { page: normalizedPage, limit: normalizedLimit } = normalizePagination({ page, limit });
    const where: any = {};

    if (search) {
      where.OR = [
        { whId: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const orderBy: any = {};
    const allowed = ["name", "whId", "createdAt", "fillLevel", "capacity", "status"];
    if (sortBy && allowed.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const data = await prisma.warehouse.findMany({
      where,
      orderBy,
      skip: (normalizedPage - 1) * normalizedLimit,
      take: normalizedLimit,
    });

    const total = await prisma.warehouse.count({ where });

    return { data, total, page: normalizedPage, limit: normalizedLimit };
  }

  async getById(id: string): Promise<Warehouse | null> {
    return prisma.warehouse.findUnique({ where: { id } });
  }

  async create(data: {
    whId: string;
    name: string;
    location: string;
    capacity: number;
    fillLevel: number;
    status: string;
  }): Promise<Warehouse> {
    return prisma.warehouse.create({ data });
  }

  async update(id: string, data: Partial<Omit<Warehouse, "id" | "createdAt">>): Promise<Warehouse> {
    return prisma.warehouse.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Warehouse> {
    return prisma.warehouse.delete({ where: { id } });
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
    return this.findMany({}).then((result) => result.data);
  }

  async findMany(params: PaginationParams = {}): Promise<ListResult<Customer>> {
    const { search, status, page, limit, sortBy, sortOrder } = params;
    const { page: normalizedPage, limit: normalizedLimit } = normalizePagination({ page, limit });
    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contact: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const orderBy: any = {};
    const allowed = ["companyName", "createdAt", "status", "salesYTD"];
    if (sortBy && allowed.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.companyName = "asc";
    }

    const data = await prisma.customer.findMany({
      where,
      orderBy,
      skip: (normalizedPage - 1) * normalizedLimit,
      take: normalizedLimit,
    });

    const total = await prisma.customer.count({ where });
    return { data, total, page: normalizedPage, limit: normalizedLimit };
  }

  async getById(id: string): Promise<Customer | null> {
    return prisma.customer.findUnique({ where: { id } });
  }

  async create(data: {
    companyName: string;
    contact: string;
    email: string;
    status: string;
    salesYTD: number;
  }): Promise<Customer> {
    return prisma.customer.create({ data });
  }

  async update(id: string, data: Partial<Omit<Customer, "id" | "createdAt">>): Promise<Customer> {
    return prisma.customer.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Customer> {
    return prisma.customer.delete({ where: { id } });
  }
}

export class CarrierRepository {
  async getAll(): Promise<Carrier[]> {
    return this.findMany({}).then((result) => result.data);
  }

  async findMany(params: PaginationParams = {}): Promise<ListResult<Carrier>> {
    const { search, type, page, limit, sortBy, sortOrder } = params;
    const { page: normalizedPage, limit: normalizedLimit } = normalizePagination({ page, limit });
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
        { contact: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const orderBy: any = {};
    const allowed = ["name", "rating", "activeVehicles", "createdAt"];
    if (sortBy && allowed.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.rating = "desc";
    }

    const data = await prisma.carrier.findMany({
      where,
      orderBy,
      skip: (normalizedPage - 1) * normalizedLimit,
      take: normalizedLimit,
    });

    const total = await prisma.carrier.count({ where });
    return { data, total, page: normalizedPage, limit: normalizedLimit };
  }

  async getById(id: string): Promise<Carrier | null> {
    return prisma.carrier.findUnique({ where: { id } });
  }

  async create(data: {
    name: string;
    type: string;
    rating: number;
    activeVehicles: number;
    contact: string;
  }): Promise<Carrier> {
    return prisma.carrier.create({ data });
  }

  async update(id: string, data: Partial<Omit<Carrier, "id" | "createdAt">>): Promise<Carrier> {
    return prisma.carrier.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Carrier> {
    return prisma.carrier.delete({ where: { id } });
  }
}

export class ContractRepository {
  async getAll(): Promise<Contract[]> {
    return this.findMany({}).then((result) => result.data);
  }

  async findMany(params: PaginationParams = {}): Promise<ListResult<Contract>> {
    const { search, status, page, limit, sortBy, sortOrder } = params;
    const { page: normalizedPage, limit: normalizedLimit } = normalizePagination({ page, limit });
    const where: any = {};

    if (search) {
      where.OR = [
        { supplier: { contains: search, mode: "insensitive" } },
        { conId: { contains: search, mode: "insensitive" } },
        { initials: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const orderBy: any = {};
    const allowed = ["supplier", "start", "createdAt", "status", "conId"];
    if (sortBy && allowed.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const data = await prisma.contract.findMany({
      where,
      orderBy,
      skip: (normalizedPage - 1) * normalizedLimit,
      take: normalizedLimit,
    });

    const total = await prisma.contract.count({ where });
    return { data, total, page: normalizedPage, limit: normalizedLimit };
  }

  async getById(id: string): Promise<Contract | null> {
    return prisma.contract.findUnique({ where: { id } });
  }

  async create(data: {
    conId: string;
    initials: string;
    supplier: string;
    start: string;
    end: string;
    status: string;
  }): Promise<Contract> {
    return prisma.contract.create({ data });
  }

  async update(id: string, data: Partial<Omit<Contract, "id" | "createdAt">>): Promise<Contract> {
    return prisma.contract.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Contract> {
    return prisma.contract.delete({ where: { id } });
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
