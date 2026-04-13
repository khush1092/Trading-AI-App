import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { buy, sell } from "./trades.controller";
import { tradeSchema } from "./trades.validation";

export const tradesRouter = Router();

tradesRouter.post("/buy", authMiddleware, validateBody(tradeSchema), asyncHandler(buy));
tradesRouter.post("/sell", authMiddleware, validateBody(tradeSchema), asyncHandler(sell));
