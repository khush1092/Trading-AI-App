import type { PortfolioResponse } from "@/types";

export async function getPortfolio(): Promise<PortfolioResponse> {
  return {
    summary: {
      cash: 325000,
      totalValue: 478945.6,
      unrealizedPnL: 18945.6,
      returnPercent: 4.12
    },
    holdings: [
      {
        symbol: "RELIANCE.NS",
        quantity: 20,
        averageBuyPrice: 2875.4,
        currentPrice: 2984.55,
        unrealizedPnL: 2183,
        returnPercent: 3.8
      },
      {
        symbol: "HDFCBANK.NS",
        quantity: 35,
        averageBuyPrice: 1622.3,
        currentPrice: 1678.95,
        unrealizedPnL: 1982.75,
        returnPercent: 3.49
      },
      {
        symbol: "SBIN.NS",
        quantity: 50,
        averageBuyPrice: 790.1,
        currentPrice: 828.45,
        unrealizedPnL: 1917.5,
        returnPercent: 4.85
      }
    ]
  };
}
