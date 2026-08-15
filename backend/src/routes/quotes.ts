import { Router } from "express";
import { QuoteController } from "../controllers/quote.controller.js";

const router = Router();
const controller = new QuoteController();

router.get("/", controller.getQuotes.bind(controller));
router.get("/rfq/:rfqId", controller.getQuotesByRfq.bind(controller));
router.post("/", controller.createQuote.bind(controller));
router.post("/:id/accept", controller.acceptQuote.bind(controller));

export default router;
