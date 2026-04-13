import { Request, Response } from "express";
import { listStocks } from "./stocks.service";

export async function getStocks(_req: Request, res: Response) {
  const stocks = await listStocks();
  return res.status(200).json({ data: stocks });
}
