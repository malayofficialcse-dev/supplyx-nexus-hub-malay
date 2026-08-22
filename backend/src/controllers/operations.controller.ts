import { Response } from "express";
import { CustomRequest } from "../middleware/auth.js";
import { OperationsService } from "../services/operations.service.js";

const service = new OperationsService();
const actor = (req: CustomRequest) => ({ id: req.user?.id, name: req.user?.name || "System", role: req.user?.role });

export class OperationsController {
  async rules(req: CustomRequest, res: Response) { try { return res.json(await service.listApprovalRules()); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async createRule(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.createApprovalRule(req.body)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async updateRule(req: CustomRequest, res: Response) { try { return res.json(await service.updateApprovalRule(req.params.id, req.body)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async deleteRule(req: CustomRequest, res: Response) { try { return res.json(await service.deleteApprovalRule(req.params.id)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async inbox(req: CustomRequest, res: Response) { try { return res.json(await service.approvalInbox(actor(req))); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async decide(req: CustomRequest, res: Response) { try { return res.json(await service.decideApproval(req.params.id, actor(req), req.body.decision || "approve", req.body.notes)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async match(req: CustomRequest, res: Response) { try { return res.json(await service.runMatch(req.params.invoiceId, req.user?.name || "System")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async exceptions(req: CustomRequest, res: Response) { try { return res.json(await service.listExceptions(req.query.status as string)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async resolveException(req: CustomRequest, res: Response) { try { return res.json(await service.resolveException(req.params.id, actor(req), req.body.resolution || "Resolved by reviewer")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async inviteSupplier(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.inviteSupplier(req.body)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async invitations(req: CustomRequest, res: Response) { try { return res.json(await service.listInvitations()); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async portalRfqs(req: CustomRequest, res: Response) { try { return res.json(await service.listPortalRfqs(String(req.query.supplier || ""))); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async inviteToRfq(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.inviteToRfq(req.params.rfqId, req.body.supplier)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async scoreQuote(req: CustomRequest, res: Response) { try { return res.json(await service.scoreQuote(req.params.quoteId, req.body)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async comparison(req: CustomRequest, res: Response) { try { return res.json(await service.quoteComparison(req.params.rfqId)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async replenishment(req: CustomRequest, res: Response) { try { return res.json(await service.replenishment()); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async reserve(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.reserveInventory(req.body, req.user?.name || "System")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async release(req: CustomRequest, res: Response) { try { return res.json(await service.releaseReservation(req.params.id)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async transfer(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.transferInventory(req.body, req.user?.name || "System")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async transfers(req: CustomRequest, res: Response) { try { return res.json(await service.listTransfers()); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async audit(req: CustomRequest, res: Response) { try { return res.json(await service.auditLogs(req.query.entityType as string, req.query.entityId as string)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async bins(req: CustomRequest, res: Response) { try { return res.json(await service.listBins(req.query.warehouseId as string)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async createBin(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.createBin(req.body)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async putaway(req: CustomRequest, res: Response) { try { return res.json(await service.listPutaway(req.query.status as string)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async createPutaway(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.createPutaway(req.body, req.user?.name || "System")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async completePutaway(req: CustomRequest, res: Response) { try { return res.json(await service.completePutaway(req.params.id, actor(req))); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async fulfillment(req: CustomRequest, res: Response) { try { return res.json(await service.listFulfillment(req.query.status as string)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async createFulfillment(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.createFulfillment(req.body)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async advanceFulfillment(req: CustomRequest, res: Response) { try { return res.json(await service.advanceFulfillment(req.params.id, req.body.status, actor(req))); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async cycleCounts(req: CustomRequest, res: Response) { try { return res.json(await service.listCycleCounts(req.query.status as string)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async createCycleCount(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.createCycleCount(req.body, req.user?.name || "System")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async submitCycleCount(req: CustomRequest, res: Response) { try { return res.json(await service.submitCycleCount(req.params.id, Number(req.body.countedQty), actor(req))); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async approveCycleCount(req: CustomRequest, res: Response) { try { return res.json(await service.approveCycleCount(req.params.id, actor(req))); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async adjustments(req: CustomRequest, res: Response) { try { return res.json(await service.listStockAdjustments(req.query.status as string)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async createAdjustment(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.createStockAdjustment(req.body, req.user?.name || "System")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async approveAdjustment(req: CustomRequest, res: Response) { try { return res.json(await service.approveStockAdjustment(req.params.id, actor(req))); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async contractOverview(req: CustomRequest, res: Response) { try { return res.json(await service.contractOverview(req.params.id)); } catch (e: any) { return res.status(404).json({ error: e.message }); } }
  async contractVersion(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.createContractVersion(req.params.id, req.body, req.user?.name || "System")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async contractObligation(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.createObligation(req.params.id, req.body)); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async contractAlerts(req: CustomRequest, res: Response) { try { return res.json(await service.listContractAlerts()); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async budgetAvailability(req: CustomRequest, res: Response) { try { return res.json(await service.budgetAvailability(req.params.id)); } catch (e: any) { return res.status(404).json({ error: e.message }); } }
  async reserveBudget(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.reserveBudget(req.body, req.user?.name || "System")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async budgetReservations(req: CustomRequest, res: Response) { try { return res.json(await service.listBudgetReservations(req.query.status as string)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async createBudgetTransfer(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.createBudgetTransfer(req.body, req.user?.name || "System")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async budgetTransfers(req: CustomRequest, res: Response) { try { return res.json(await service.listBudgetTransfers(req.query.status as string)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async approveBudgetTransfer(req: CustomRequest, res: Response) { try { return res.json(await service.approveBudgetTransfer(req.params.id, actor(req))); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async budgetAlerts(req: CustomRequest, res: Response) { try { return res.json(await service.budgetAlerts(req.query.year ? Number(req.query.year) : undefined)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async rolloverBudgets(req: CustomRequest, res: Response) { try { return res.json(await service.rolloverBudgets(Number(req.body.fromYear), Number(req.body.toYear), actor(req))); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
  async supplierRisk(req: CustomRequest, res: Response) { try { return res.json(await service.supplierRisk(req.params.id, req.user?.name || "System")); } catch (e: any) { return res.status(404).json({ error: e.message }); } }
  async supplierRiskSummary(req: CustomRequest, res: Response) { try { return res.json(await service.supplierRiskSummary()); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async supplierCompliance(req: CustomRequest, res: Response) { try { return res.json(await service.supplierCompliance(req.query.supplierId as string)); } catch (e: any) { return res.status(500).json({ error: e.message }); } }
  async createSupplierCompliance(req: CustomRequest, res: Response) { try { return res.status(201).json(await service.createSupplierCompliance(req.body, req.user?.name || "System")); } catch (e: any) { return res.status(400).json({ error: e.message }); } }
}
