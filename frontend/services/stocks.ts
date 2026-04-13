import type { StockHistoryPoint, StockSnapshot } from "@/types";

const dashboardStocks: StockSnapshot[] = [
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries",
    sector: "Energy",
    price: 2984.55,
    changePercent: 1.42,
    volume: 3275401
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    sector: "IT Services",
    price: 3948.2,
    changePercent: -0.36,
    volume: 982113
  },
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank",
    sector: "Private Bank",
    price: 1678.95,
    changePercent: 0.74,
    volume: 4102230
  },
  {
    symbol: "INFY.NS",
    name: "Infosys",
    sector: "IT Services",
    price: 1514.7,
    changePercent: -1.18,
    volume: 2744100
  },
  {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank",
    sector: "Private Bank",
    price: 1128.85,
    changePercent: 1.12,
    volume: 3650025
  },
  {
    symbol: "SBIN.NS",
    name: "State Bank of India",
    sector: "Public Bank",
    price: 828.45,
    changePercent: 0.63,
    volume: 5189910
  }
];

export async function getDashboardStocks(): Promise<StockSnapshot[]> {
  return dashboardStocks;
}

export async function getStockBySymbol(symbol: string): Promise<StockSnapshot | undefined> {
  return dashboardStocks.find((stock) => stock.symbol.toLowerCase() === symbol.toLowerCase());
}

export async function getStockHistory(symbol: string): Promise<StockHistoryPoint[]> {
  const stock = await getStockBySymbol(symbol);
  const base = stock?.price ?? 1000;

  return Array.from({ length: 12 }, (_, index) => {
    const drift = base * (index * 0.0035);
    const wave = Math.sin(index / 1.8) * base * 0.02;
    const close = Number((base + drift + wave).toFixed(2));
    const open = Number((close - base * 0.008).toFixed(2));
    const high = Number((close + base * 0.015).toFixed(2));
    const low = Number((open - base * 0.012).toFixed(2));

    return {
      date: `2026-04-${String(index + 1).padStart(2, "0")}`,
      open,
      high,
      low,
      close,
      volume: 1000000 + index * 65000
    };
  });
}
