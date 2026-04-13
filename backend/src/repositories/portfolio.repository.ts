import { PoolClient } from "pg";
import { query } from "../config/db";
import type { HoldingRow } from "../types/db.types";

export async function getHoldingsByUserId(userId: string): Promise<HoldingRow[]> {
  const result = await query<HoldingRow>(
    `
      SELECT id, user_id, stock_symbol, quantity, avg_price, created_at, updated_at
      FROM portfolio
      WHERE user_id = $1
      ORDER BY stock_symbol ASC
    `,
    [userId]
  );

  return result.rows;
}

export async function getHoldingByUserIdAndSymbol(
  client: PoolClient,
  userId: string,
  symbol: string
): Promise<HoldingRow | null> {
  const result = await client.query<HoldingRow>(
    `
      SELECT id, user_id, stock_symbol, quantity, avg_price, created_at, updated_at
      FROM portfolio
      WHERE user_id = $1 AND stock_symbol = $2
      LIMIT 1
      FOR UPDATE
    `,
    [userId, symbol]
  );

  return result.rows[0] ?? null;
}

export async function createHolding(
  client: PoolClient,
  input: { userId: string; symbol: string; quantity: number; averageBuyPrice: number }
): Promise<HoldingRow> {
  const result = await client.query<HoldingRow>(
    `
      INSERT INTO portfolio (user_id, stock_symbol, quantity, avg_price)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, stock_symbol, quantity, avg_price, created_at, updated_at
    `,
    [input.userId, input.symbol, input.quantity, input.averageBuyPrice]
  );

  return result.rows[0];
}

export async function updateHolding(
  client: PoolClient,
  input: { holdingId: string; quantity: number; averageBuyPrice: number }
): Promise<void> {
  await client.query(
    `
      UPDATE portfolio
      SET quantity = $2, avg_price = $3, updated_at = NOW()
      WHERE id = $1
    `,
    [input.holdingId, input.quantity, input.averageBuyPrice]
  );
}

export async function deleteHolding(client: PoolClient, holdingId: string): Promise<void> {
  await client.query(`DELETE FROM portfolio WHERE id = $1`, [holdingId]);
}
