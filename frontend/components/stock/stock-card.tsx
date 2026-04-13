import Link from "next/link";
import type { StockSnapshot } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

type StockCardProps = {
  stock: StockSnapshot;
};

export function StockCard({ stock }: StockCardProps) {
  const positive = stock.changePercent >= 0;

  return (
    <Link
      href={`/stocks/${encodeURIComponent(stock.symbol)}`}
      className="panel block p-5 transition duration-200 hover:-translate-y-1 hover:border-glow/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">{stock.symbol}</p>
          <p className="mt-1 text-sm text-mist/70">{stock.name}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            positive ? "bg-glow/15 text-glow" : "bg-loss/15 text-loss"
          }`}
        >
          {positive ? "Positive" : "Negative"}
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-semibold">{formatCurrency(stock.price)}</p>
          <p className="mt-1 text-sm text-mist/70">{stock.sector}</p>
        </div>
        <div className={`text-right text-sm font-medium ${positive ? "text-glow" : "text-loss"}`}>
          <p>{formatPercent(stock.changePercent)}</p>
          <p className="mt-1 text-mist/60">{stock.volume.toLocaleString("en-IN")} vol</p>
        </div>
      </div>
    </Link>
  );
}
