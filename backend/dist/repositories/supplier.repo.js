import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export class SupplierRepository {
    async getAll() {
        try {
            return await prisma.supplier.findMany({
                orderBy: { name: "asc" },
            });
        }
        catch {
            // Fallback if table not migrated yet
            return [];
        }
    }
    async getById(id) {
        try {
            return await prisma.supplier.findUnique({
                where: { id },
            });
        }
        catch {
            return null;
        }
    }
    async getByName(name) {
        try {
            return await prisma.supplier.findUnique({
                where: { name },
            });
        }
        catch {
            return null;
        }
    }
    async create(data) {
        return prisma.supplier.create({
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
    async update(id, data) {
        return prisma.supplier.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma.supplier.delete({
            where: { id },
        });
    }
}
