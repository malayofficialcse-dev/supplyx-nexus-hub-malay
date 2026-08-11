const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`API Error [${response.status}]: ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

// Requisitions
export interface Requisition {
  id: string;
  reqId: string;
  department: string;
  item: string;
  total: number;
  status: string;
  createdAt: string;
}

export const getRequisitions = () => apiFetch<Requisition[]>("/requisitions");

export const createRequisition = (data: { department: string; item: string; total: number }) =>
  apiFetch<Requisition>("/requisitions", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Orders
export interface Order {
  id: string;
  orderId: string;
  supplier: string;
  amount: number;
  deliveryDate: string;
  status: string;
  description?: string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
}

export const getOrders = () => apiFetch<Order[]>("/orders");

export const createOrder = (data: Omit<Order, "id" | "orderId" | "status">) =>
  apiFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });

// RFQs
export interface RFQ {
  id: string;
  rfqId: string;
  title: string;
  department: string;
  deadline: string;
  status: string;
  vendorCount: number;
  items: Array<{ name: string; quantity: number }>;
}

export const getRFQs = () => apiFetch<RFQ[]>("/rfqs");

export const createRFQ = (data: Omit<RFQ, "id" | "rfqId" | "status" | "vendorCount">) =>
  apiFetch<RFQ>("/rfqs", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Analytics
export interface DashboardAnalytics {
  kpis: {
    totalSpendYTD: number;
    pendingRequisitions: number;
    activeRfqs: number;
    overdueInvoices: number;
    overdueInvoicesVal: number;
  };
  categories: Array<{
    category: string;
    allocated: number;
    spent: number;
    percentage: number;
  }>;
  monthlySpendTrend: Array<{
    month: string;
    spend: number;
  }>;
}

export const getDashboardAnalytics = () => apiFetch<DashboardAnalytics>("/analytics/dashboard");

// Shipments
export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  status: string;
  estDelivery: string;
}
export const getShipments = () => apiFetch<Shipment[]>("/shipments");

// Logistics Routes
export interface LogisticsRoute {
  id: string;
  routeName: string;
  costPerMile: number;
  avgTransitTime: number;
  volume: number;
}
export const getLogistics = () => apiFetch<LogisticsRoute[]>("/logistics");

// Contracts
export interface Contract {
  id: string;
  conId: string;
  initials: string;
  supplier: string;
  start: string;
  end: string;
  status: string;
}
export const getContracts = () => apiFetch<Contract[]>("/contracts");
export const getContractById = (id: string) => apiFetch<Contract>(`/contracts/${id}`);
export const createContract = (data: Omit<Contract, "id" | "createdAt">) =>
  apiFetch<Contract>("/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateContract = (id: string, data: Partial<Omit<Contract, "id" | "createdAt">>) =>
  apiFetch<Contract>(`/contracts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteContract = (id: string) =>
  apiFetch<Contract>(`/contracts/${id}`, {
    method: "DELETE",
  });

// Warehouses
export interface Warehouse {
  id: string;
  whId: string;
  name: string;
  location: string;
  capacity: number;
  fillLevel: number;
  status: string;
  createdAt: string;
}
export const getWarehouses = () => apiFetch<Warehouse[]>('/warehouses');
export const getWarehouseById = (id: string) => apiFetch<Warehouse>(`/warehouses/${id}`);
export const createWarehouse = (data: Omit<Warehouse, 'id' | 'createdAt'>) =>
  apiFetch<Warehouse>('/warehouses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateWarehouse = (id: string, data: Partial<Omit<Warehouse, 'id' | 'createdAt'>>) =>
  apiFetch<Warehouse>(`/warehouses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteWarehouse = (id: string) =>
  apiFetch<Warehouse>(`/warehouses/${id}`, {
    method: 'DELETE',
  });

// Customers
export interface Customer {
  id: string;
  companyName: string;
  contact: string;
  email: string;
  status: string;
  salesYTD: number;
}
export const getCustomers = () => apiFetch<Customer[]>('/customers');
export const getCustomerById = (id: string) => apiFetch<Customer>(`/customers/${id}`);
export const createCustomer = (data: Omit<Customer, 'id' | 'createdAt'>) =>
  apiFetch<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateCustomer = (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>) =>
  apiFetch<Customer>(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteCustomer = (id: string) =>
  apiFetch<Customer>(`/customers/${id}`, {
    method: 'DELETE',
  });

// Carriers
export interface Carrier {
  id: string;
  name: string;
  type: string;
  rating: number;
  activeVehicles: number;
  contact: string;
}
export const getCarriers = () => apiFetch<Carrier[]>('/carriers');
export const getCarrierById = (id: string) => apiFetch<Carrier>(`/carriers/${id}`);
export const createCarrier = (data: Omit<Carrier, 'id' | 'createdAt'>) =>
  apiFetch<Carrier>('/carriers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateCarrier = (id: string, data: Partial<Omit<Carrier, 'id' | 'createdAt'>>) =>
  apiFetch<Carrier>(`/carriers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteCarrier = (id: string) =>
  apiFetch<Carrier>(`/carriers/${id}`, {
    method: 'DELETE',
  });

// Goods Receipts
export interface GoodsReceiptItem {
  name: string;
  receivedQty: number;
  expectedQty: number;
  sku?: string;
  unit?: string;
}
export interface GoodsReceipt {
  id: string;
  receiptId: string;
  orderId: string;
  supplier: string;
  warehouseId?: string;
  deliveryDate: string;
  status: string;
  items: GoodsReceiptItem[];
}
export const getGoodsReceipts = () => apiFetch<GoodsReceipt[]>("/goods-receipts");
export const getGoodsReceiptById = (id: string) => apiFetch<GoodsReceipt>(`/goods-receipts/${id}`);
export const createGoodsReceipt = (data: Omit<GoodsReceipt, "id" | "receiptId">) =>
  apiFetch<GoodsReceipt>("/goods-receipts", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Inventory
export interface InventoryItem {
  id: string;
  warehouseId: string;
  item: string;
  sku?: string;
  unit: string;
  quantity: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}
export const getInventories = () => apiFetch<InventoryItem[]>("/inventories");
export const getInventoriesByWarehouse = (warehouseId: string) => apiFetch<InventoryItem[]>(`/inventories/warehouse/${warehouseId}`);

// Invoices
export interface InvoiceLineItem {
  description: string;
  amount: number;
}
export interface Invoice {
  id: string;
  invoiceId: string;
  supplier: string;
  date: string;
  amount: number;
  status: string;
  items: InvoiceLineItem[];
  createdAt: string;
}
export const getInvoices = () => apiFetch<Invoice[]>("/invoices");
export const getInvoiceById = (id: string) => apiFetch<Invoice>(`/invoices/${id}`);

// Payments
export interface AuditEntry {
  action: string;
  by: string;
  at: string;
}
export interface Payment {
  id: string;
  paymentId: string;
  invoiceId: string;
  supplier: string;
  amount: number;
  status: string;
  method: string;
  auditTrail: AuditEntry[];
  createdAt: string;
}
export const getPayments = () => apiFetch<Payment[]>("/payments");
export const getPaymentById = (id: string) => apiFetch<Payment>(`/payments/${id}`);

// Budget Categories
export interface BudgetCategory {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  year: number;
}
export const getBudgetCategories = () => apiFetch<BudgetCategory[]>("/analytics/dashboard");
