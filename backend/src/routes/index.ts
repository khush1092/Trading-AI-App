import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { portfolioRouter } from "../modules/portfolio/portfolio.routes";
import { stocksRouter } from "../modules/stocks/stocks.routes";
import { tradesRouter } from "../modules/trades/trades.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/stocks", stocksRouter);
apiRouter.use("/", tradesRouter);
apiRouter.use("/portfolio", portfolioRouter);
