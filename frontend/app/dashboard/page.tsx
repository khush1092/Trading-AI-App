import { ChartPlaceholder } from "@/components/chart/chart-placeholder";
import { PageHeader } from "@/components/ui/page-header";
import { StockCard } from "@/components/stock/stock-card";
import { getDashboardStocks } from "@/services/stocks";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const stocks = await getDashboardStocks();
  const gainers = stocks.filter((stock) => stock.changePercent >= 0).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="AI-assisted paper trading for Indian equities"
        description="Track leading NSE names, inspect placeholder chart surfaces, and prepare the frontend contracts before the live data and trading APIs arrive."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Tracked Stocks</p>
          <h2 className="mt-4 text-3xl font-semibold">{stocks.length}</h2>
          <p className="mt-2 text-sm text-mist/70">Initial watchlist across banking, IT, and energy.</p>
        </div>
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Avg. Daily Move</p>
          <h2 className="mt-4 text-3xl font-semibold">
            {formatPercent(
              stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length
            )}
          </h2>
          <p className="mt-2 text-sm text-mist/70">Used later for volatility-aware prediction UX.</p>
        </div>
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Advancing Names</p>
          <h2 className="mt-4 text-3xl font-semibold">{gainers}</h2>
          <p className="mt-2 text-sm text-mist/70">Placeholder breadth signal for the market pulse.</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-glow">Market view</p>
              <h2 className="mt-2 text-2xl font-semibold">NIFTY-linked signal board</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-mist/80">
              Placeholder chart until live API wiring
            </div>
          </div>
          <ChartPlaceholder
            symbol="RELIANCE.NS"
            priceLabel={formatCurrency(stocks[0].price)}
            trendLabel="Bullish bias"
          />
        </div>

        <div className="panel p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Prediction preview</p>
          <h2 className="mt-2 text-2xl font-semibold">Signal summary</h2>
          <div className="mt-6 space-y-4">
            {stocks.slice(0, 3).map((stock) => (
              <div
                key={stock.symbol}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{stock.symbol}</p>
                    <p className="text-sm text-mist/70">{stock.name}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      stock.changePercent >= 0
                        ? "bg-glow/15 text-glow"
                        : "bg-loss/15 text-loss"
                    }`}
                  >
                    {stock.changePercent >= 0 ? "BUY bias" : "HOLD bias"}
                  </span>
                </div>
                <p className="mt-4 text-sm text-mist/75">
                  Price at {formatCurrency(stock.price)} with a projected monitoring band near{" "}
                  {formatCurrency(stock.price * 1.012)}.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-glow">Watchlist</p>
            <h2 className="mt-2 text-2xl font-semibold">Core Indian stocks</h2>
          </div>
          <p className="text-sm text-mist/70">Cards already match the future `/stocks` response shape.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </section>
    </div>
  );
}
