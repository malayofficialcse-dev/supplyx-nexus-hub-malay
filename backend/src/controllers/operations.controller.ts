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
}
