import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export class RequisitionRepository {
    async getAll() {
        return prisma.requisition.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async create(data) {
        return prisma.requisition.create({
            data,
        });
    }
    async getById(id) {
        return prisma.requisition.findUnique({ where: { id } });
    }
    async updateStatus(id, status) {
        return prisma.requisition.update({ where: { id }, data: { status } });
    }
    async updateApproval(id, data) {
        return prisma.requisition.update({ where: { id }, data });
    }
    async countPending() {
        return prisma.requisition.count({
            where: { status: "Pending Approval" },
        });
    }
}
