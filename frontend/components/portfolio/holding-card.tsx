import type { PortfolioHolding } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

type HoldingCardProps = {
  holding: PortfolioHolding;
};

export function HoldingCard({ holding }: HoldingCardProps) {
  const positive = holding.unrealizedPnL >= 0;

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">{holding.symbol}</p>
          <p className="mt-1 text-sm text-mist/70">{holding.quantity} shares</p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            positive ? "bg-glow/15 text-glow" : "bg-loss/15 text-loss"
          }`}
        >
          {formatPercent(holding.returnPercent)}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-sm text-mist/70">Avg Buy</p>
          <p className="mt-1 font-medium">{formatCurrency(holding.averageBuyPrice)}</p>
        </div>
        <div>
          <p className="text-sm text-mist/70">Current Price</p>
          <p className="mt-1 font-medium">{formatCurrency(holding.currentPrice)}</p>
        </div>
        <div>
          <p className="text-sm text-mist/70">Unrealized P&amp;L</p>
          <p className={`mt-1 font-medium ${positive ? "text-glow" : "text-loss"}`}>
            {formatCurrency(holding.unrealizedPnL)}
          </p>
        </div>
      </div>
    </article>
  );
}
