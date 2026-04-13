export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  cash_balance: number;
  created_at: Date;
  updated_at: Date;
};

export type StockPriceRow = {
  id: number;
  symbol: string;
  interval: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
};

export type HoldingRow = {
  id: string;
  user_id: string;
  stock_symbol: string;
  quantity: number;
  avg_price: number;
  created_at: Date;
  updated_at: Date;
};

export type TradeRow = {
  id: string;
  user_id: string;
  stock_symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  total_value: number;
  timestamp: Date;
};
