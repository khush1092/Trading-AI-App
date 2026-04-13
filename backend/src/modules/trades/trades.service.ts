import { PoolClient } from "pg";
import { withTransaction } from "../../config/db";
import { getHoldingByUserIdAndSymbol, createHolding, deleteHolding, updateHolding } from "../../repositories/portfolio.repository";
import { getLatestStockPrice } from "../../repositories/stocks.repository";
import { createTrade } from "../../repositories/trades.repository";
import { findUserByIdForUpdate, updateUserCashBalance } from "../../repositories/users.repository";
import { getPortfolio } from "../portfolio/portfolio.service";
import { AppError } from "../../utils/app-error";
import type { TradeRow, UserRow } from "../../types/db.types";

type TradeExecutionInput = {
  userId: string;
  symbol: string;
  quantity: number;
};

function roundToScale(value: number, scale = 4) {
  const factor = 10 ** scale;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

async function getUserOrThrow(client: PoolClient, userId: string) {
  const user = await findUserByIdForUpdate(client, userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
}

async function getLatestPriceOrThrow(client: PoolClient, symbol: string) {
  const stock = await getLatestStockPrice(symbol.toUpperCase(), client);

  if (!stock) {
    throw new AppError(404, `No latest stock price found for symbol ${symbol}`);
  }

  return stock;
}

function calculateWeightedAverage(
  existingQuantity: number,
  existingAverage: number,
  buyQuantity: number,
  buyPrice: number
) {
  const totalCost = existingQuantity * existingAverage + buyQuantity * buyPrice;
  return roundToScale(totalCost / (existingQuantity + buyQuantity));
}

function formatTradeResponse(trade: TradeRow) {
  return {
    id: trade.id,
    symbol: trade.stock_symbol,
    type: trade.type,
    quantity: Number(trade.quantity),
    price: Number(trade.price),
    totalValue: Number(trade.total_value),
    timestamp: trade.timestamp
  };
}

function assertTradeQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError(400, "Quantity must be a positive whole number");
  }
}

function assertNonNegativeBalance(balance: number) {
  if (balance < 0) {
    throw new AppError(400, "Trade would result in a negative balance");
  }
}

function assertNonNegativeHolding(quantity: number) {
  if (quantity < 0) {
    throw new AppError(400, "Trade would result in negative holdings");
  }
}

async function executeBuy(client: PoolClient, input: TradeExecutionInput) {
  assertTradeQuantity(input.quantity);

  const user = await getUserOrThrow(client, input.userId);
  const stock = await getLatestPriceOrThrow(client, input.symbol);
  const symbol = stock.symbol.toUpperCase();
  const price = roundToScale(Number(stock.price));
  const totalValue = roundToScale(price * input.quantity);
  const currentBalance = roundToScale(Number(user.cash_balance));
  const nextBalance = roundToScale(currentBalance - totalValue);

  if (currentBalance < totalValue) {
    throw new AppError(400, "Insufficient virtual balance for this buy order");
  }
  assertNonNegativeBalance(nextBalance);

  const holding = await getHoldingByUserIdAndSymbol(client, input.userId, symbol);

  if (!holding) {
    await createHolding(client, {
      userId: input.userId,
      symbol,
      quantity: input.quantity,
      averageBuyPrice: price
    });
  } else {
    const newQuantity = Number(holding.quantity) + input.quantity;
    const averageBuyPrice = calculateWeightedAverage(
      Number(holding.quantity),
      Number(holding.avg_price),
      input.quantity,
      price
    );

    await updateHolding(client, {
      holdingId: holding.id,
      quantity: newQuantity,
      averageBuyPrice
    });
  }

  const updatedUser = await updateUserCashBalance(client, input.userId, nextBalance);

  const trade = await createTrade(client, {
    userId: input.userId,
    symbol,
    side: "BUY",
    quantity: input.quantity,
    price
  });

  return {
    message: "Paper buy order executed",
    trade,
    updatedUser
  };
}

async function executeSell(client: PoolClient, input: TradeExecutionInput) {
  assertTradeQuantity(input.quantity);

  const user = await getUserOrThrow(client, input.userId);
  const stock = await getLatestPriceOrThrow(client, input.symbol);
  const symbol = stock.symbol.toUpperCase();
  const price = roundToScale(Number(stock.price));
  const totalValue = roundToScale(price * input.quantity);
  const holding = await getHoldingByUserIdAndSymbol(client, input.userId, symbol);

  if (!holding) {
    throw new AppError(400, "You do not own this stock in your portfolio");
  }

  if (Number(holding.quantity) < input.quantity) {
    throw new AppError(400, "Insufficient holdings for this sell order");
  }

  const remainingQuantity = Number(holding.quantity) - input.quantity;
  assertNonNegativeHolding(remainingQuantity);

  if (remainingQuantity === 0) {
    await deleteHolding(client, holding.id);
  } else {
    await updateHolding(client, {
      holdingId: holding.id,
      quantity: remainingQuantity,
      averageBuyPrice: roundToScale(Number(holding.avg_price))
    });
  }

  const updatedUser = await updateUserCashBalance(
    client,
    input.userId,
    roundToScale(Number(user.cash_balance) + totalValue)
  );

  const trade = await createTrade(client, {
    userId: input.userId,
    symbol,
    side: "SELL",
    quantity: input.quantity,
    price
  });

  return {
    message: "Paper sell order executed",
    trade,
    updatedUser
  };
}

async function finalizeTradeResponse(
  executionResult: {
    message: string;
    trade: TradeRow;
    updatedUser: UserRow;
  },
  userId: string
) {
  const portfolio = await getPortfolio(userId);

  return {
    message: executionResult.message,
    updatedBalance: Number(executionResult.updatedUser.cash_balance),
    updatedPortfolio: portfolio,
    trade: formatTradeResponse(executionResult.trade)
  };
}

export async function buyStock(input: TradeExecutionInput) {
  const executionResult = await withTransaction((client) => executeBuy(client, input));
  return finalizeTradeResponse(executionResult, input.userId);
}

export async function sellStock(input: TradeExecutionInput) {
  const executionResult = await withTransaction((client) => executeSell(client, input));
  return finalizeTradeResponse(executionResult, input.userId);
}
