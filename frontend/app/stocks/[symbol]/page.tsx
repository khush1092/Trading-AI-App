import { notFound } from "next/navigation";
import { ChartPlaceholder } from "@/components/chart/chart-placeholder";
import { PageHeader } from "@/components/ui/page-header";
import { getStockBySymbol, getStockHistory } from "@/services/stocks";
import { formatCurrency, formatPercent } from "@/lib/utils";

type StockDetailPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function StockDetailPage({ params }: StockDetailPageProps) {
  const { symbol } = await params;
  const stock = await getStockBySymbol(symbol);

  if (!stock) {
    notFound();
  }

  const history = await getStockHistory(stock.symbol);
  const high = Math.max(...history.map((point) => point.high));
  const low = Math.min(...history.map((point) => point.low));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Stock Detail"
        title={`${stock.symbol} · ${stock.name}`}
        description="A detail surface for per-stock analysis, chart review, and later prediction/trade execution actions."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Last Price</p>
          <h2 className="mt-4 text-3xl font-semibold">{formatCurrency(stock.price)}</h2>
        </div>
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Change</p>
          <h2
            className={`mt-4 text-3xl font-semibold ${
              stock.changePercent >= 0 ? "text-glow" : "text-loss"
            }`}
          >
            {formatPercent(stock.changePercent)}
          </h2>
        </div>
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">52W High</p>
          <h2 className="mt-4 text-3xl font-semibold">{formatCurrency(high)}</h2>
        </div>
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">52W Low</p>
          <h2 className="mt-4 text-3xl font-semibold">{formatCurrency(low)}</h2>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="panel p-6">
          <ChartPlaceholder
            symbol={stock.symbol}
            priceLabel={formatCurrency(stock.price)}
            trendLabel={stock.changePercent >= 0 ? "Upside accumulation" : "Pullback watch"}
          />
        </div>

        <div className="panel p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Stock snapshot</p>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm text-mist/70">Sector</p>
              <p className="mt-1 text-lg font-medium">{stock.sector}</p>
            </div>
            <div>
              <p className="text-sm text-mist/70">Volume</p>
              <p className="mt-1 text-lg font-medium">{stock.volume.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-sm text-mist/70">Market mood</p>
              <p className="mt-1 text-lg font-medium">
                {stock.changePercent >= 0 ? "Momentum positive" : "Risk-off tone"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-mist/80">
              This page is intentionally API-ready: the placeholder data maps cleanly to future
              `/stocks/:symbol`, `/history`, and `/predictions/:symbol` endpoints.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
