import { Request, Response } from "express";
import { getPortfolio } from "./portfolio.service";

export async function getPortfolioController(req: Request, res: Response) {
  const portfolio = await getPortfolio(req.user!.id);
  return res.status(200).json(portfolio);
}
