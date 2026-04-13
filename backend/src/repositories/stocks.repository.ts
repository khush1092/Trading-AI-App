import { PoolClient } from "pg";
import { query } from "../config/db";
import type { StockPriceRow } from "../types/db.types";

async function runLatestStocksQuery(
  symbol?: string,
  client?: PoolClient
): Promise<StockPriceRow[]> {
  const values = symbol ? [symbol.toUpperCase()] : [];
  const symbolFilter = symbol ? `WHERE sp.symbol = $1` : "";
  const result = client
    ? await client.query<StockPriceRow>(
        `
          SELECT DISTINCT ON (sp.symbol)
            sp.id,
            sp.symbol,
            sp.interval,
            sp.price,
            sp.open,
            sp.high,
            sp.low,
            sp.close,
            sp.volume,
            sp."timestamp"
          FROM stock_prices sp
          ${symbolFilter}
          ORDER BY
            sp.symbol ASC,
            sp."timestamp" DESC,
            CASE sp.interval
              WHEN '1h' THEN 0
              WHEN '1d' THEN 1
              ELSE 2
            END
        `,
        values
      )
    : await query<StockPriceRow>(
    `
      SELECT DISTINCT ON (sp.symbol)
        sp.id,
        sp.symbol,
        sp.interval,
        sp.price,
        sp.open,
        sp.high,
        sp.low,
        sp.close,
        sp.volume,
        sp."timestamp"
      FROM stock_prices sp
      ${symbolFilter}
      ORDER BY
        sp.symbol ASC,
        sp."timestamp" DESC,
        CASE sp.interval
          WHEN '1h' THEN 0
          WHEN '1d' THEN 1
          ELSE 2
        END
    `,
    values
  );

  return result.rows;
}

export async function getLatestStocks(symbol?: string): Promise<StockPriceRow[]> {
  return runLatestStocksQuery(symbol);
}

export async function getLatestStockPrice(
  symbol: string,
  client?: PoolClient
): Promise<StockPriceRow | null> {
  const stocks = await runLatestStocksQuery(symbol, client);
  return stocks[0] ?? null;
}
