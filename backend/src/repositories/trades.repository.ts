import { PoolClient } from "pg";
import { query } from "../config/db";
import type { TradeRow } from "../types/db.types";

export async function createTrade(
  client: PoolClient,
  input: {
    userId: string;
    symbol: string;
    side: "BUY" | "SELL";
    quantity: number;
    price: number;
  }
): Promise<TradeRow> {
  const result = await client.query<TradeRow>(
    `
      INSERT INTO trades (user_id, stock_symbol, type, quantity, price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, stock_symbol, type, quantity, price, total_value, "timestamp"
    `,
    [input.userId, input.symbol, input.side, input.quantity, input.price]
  );

  return result.rows[0];
}

export async function getTradesByUserId(userId: string): Promise<TradeRow[]> {
  const result = await query<TradeRow>(
    `
      SELECT id, user_id, stock_symbol, type, quantity, price, total_value, "timestamp"
      FROM trades
      WHERE user_id = $1
      ORDER BY "timestamp" DESC
      LIMIT 100
    `,
    [userId]
  );

  return result.rows;
}
