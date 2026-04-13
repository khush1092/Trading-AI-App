import { getLatestStocks } from "../../repositories/stocks.repository";

export async function listStocks() {
  const stocks = await getLatestStocks();

  return stocks.map((stock) => ({
    id: stock.id,
    symbol: stock.symbol,
    interval: stock.interval,
    price: Number(stock.price),
    open: Number(stock.open),
    high: Number(stock.high),
    low: Number(stock.low),
    close: Number(stock.close),
    volume: Number(stock.volume),
    timestamp: stock.timestamp
  }));
}
