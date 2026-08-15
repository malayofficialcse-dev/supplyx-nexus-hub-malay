import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface SupplierData {
  supId?: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  category?: string;
  status?: string;
  onTimeDeliveryRate?: number;
  defectRate?: number;
  avgLeadTimeDays?: number;
  totalOrderValue?: number;
  lastScoreUpdated?: Date;
}

export class SupplierRepository {
  async getAll(): Promise<any[]> {
    try {
      return await (prisma as any).supplier.findMany({
        orderBy: { name: "asc" },
      });
    } catch {
      // Fallback if table not migrated yet
      return [];
    }
  }

  async getById(id: string): Promise<any | null> {
    try {
      return await (prisma as any).supplier.findUnique({
        where: { id },
      });
    } catch {
      return null;
    }
  }

  async getByName(name: string): Promise<any | null> {
    try {
      return await (prisma as any).supplier.findUnique({
        where: { name },
      });
    } catch {
      return null;
    }
  }

  async create(data: SupplierData): Promise<any> {
    return (prisma as any).supplier.create({
      data: {
        supId: data.supId,
        name: data.name,
        contact: data.contact ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        category: data.category ?? "General Supplier",
        status: data.status ?? "Active",
      },
    });
  }

  async update(id: string, data: Partial<SupplierData>): Promise<any> {
    return (prisma as any).supplier.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<any> {
    return (prisma as any).supplier.delete({
      where: { id },
    });
  }
}
