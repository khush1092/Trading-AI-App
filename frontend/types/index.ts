export type StockSnapshot = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePercent: number;
  volume: number;
};

export type StockHistoryPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type PortfolioHolding = {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  returnPercent: number;
};

export type PortfolioSummary = {
  cash: number;
  totalValue: number;
  unrealizedPnL: number;
  returnPercent: number;
};

export type PortfolioResponse = {
  summary: PortfolioSummary;
  holdings: PortfolioHolding[];
};
