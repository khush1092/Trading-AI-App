import { getHoldingsByUserId } from "../../repositories/portfolio.repository";
import { getLatestStocks } from "../../repositories/stocks.repository";
import { findUserById } from "../../repositories/users.repository";
import { AppError } from "../../utils/app-error";

export async function getPortfolio(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const holdings = await getHoldingsByUserId(userId);
  const marketData = await getLatestStocks();
  const latestPriceBySymbol = new Map(
    marketData.map((stock) => [stock.symbol.toUpperCase(), Number(stock.price)])
  );

  const enrichedHoldings = holdings.map((holding) => {
    const currentPrice = latestPriceBySymbol.get(holding.stock_symbol.toUpperCase()) ?? 0;
    const averageBuyPrice = Number(holding.avg_price);
    const quantity = Number(holding.quantity);
    const currentValue = currentPrice * quantity;
    const costBasis = averageBuyPrice * quantity;
    const unrealizedPnL = currentValue - costBasis;
    const returnPercent = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;

    return {
      symbol: holding.stock_symbol,
      quantity,
      averageBuyPrice,
      currentPrice,
      currentValue,
      unrealizedPnL,
      returnPercent
    };
  });

  const holdingsValue = enrichedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const unrealizedPnL = enrichedHoldings.reduce((sum, holding) => sum + holding.unrealizedPnL, 0);
  const cashBalance = Number(user.cash_balance);
  const totalValue = cashBalance + holdingsValue;

  return {
    cashBalance,
    totalValue,
    unrealizedPnL,
    holdings: enrichedHoldings
  };
}
