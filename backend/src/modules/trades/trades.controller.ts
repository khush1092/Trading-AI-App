import { Request, Response } from "express";
import { buyStock, sellStock } from "./trades.service";

export async function buy(req: Request, res: Response) {
  const result = await buyStock({
    userId: req.user!.id,
    symbol: req.body.symbol,
    quantity: req.body.quantity
  });

  return res.status(200).json(result);
}

export async function sell(req: Request, res: Response) {
  const result = await sellStock({
    userId: req.user!.id,
    symbol: req.body.symbol,
    quantity: req.body.quantity
  });

  return res.status(200).json(result);
}
