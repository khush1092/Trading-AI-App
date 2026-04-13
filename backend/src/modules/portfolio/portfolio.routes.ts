import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { getPortfolioController } from "./portfolio.controller";

export const portfolioRouter = Router();

portfolioRouter.get("/", authMiddleware, asyncHandler(getPortfolioController));
