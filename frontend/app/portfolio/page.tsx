import { HoldingCard } from "@/components/portfolio/holding-card";
import { PageHeader } from "@/components/ui/page-header";
import { getPortfolio } from "@/services/portfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function PortfolioPage() {
  const portfolio = await getPortfolio();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Portfolio"
        title="Virtual capital and open positions"
        description="This page mirrors the future paper trading contract: cash balance, holdings, allocation, and realized or unrealized performance."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Virtual Cash</p>
          <h2 className="mt-4 text-3xl font-semibold">{formatCurrency(portfolio.summary.cash)}</h2>
        </div>
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Portfolio Value</p>
          <h2 className="mt-4 text-3xl font-semibold">
            {formatCurrency(portfolio.summary.totalValue)}
          </h2>
        </div>
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Unrealized P&L</p>
          <h2
            className={`mt-4 text-3xl font-semibold ${
              portfolio.summary.unrealizedPnL >= 0 ? "text-glow" : "text-loss"
            }`}
          >
            {formatCurrency(portfolio.summary.unrealizedPnL)}
          </h2>
        </div>
        <div className="metric-card">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Return</p>
          <h2
            className={`mt-4 text-3xl font-semibold ${
              portfolio.summary.returnPercent >= 0 ? "text-glow" : "text-loss"
            }`}
          >
            {formatPercent(portfolio.summary.returnPercent)}
          </h2>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-glow">Open holdings</p>
              <h2 className="mt-2 text-2xl font-semibold">Paper positions</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-mist/75">
              {portfolio.holdings.length} active holdings
            </span>
          </div>
          <div className="grid gap-4">
            {portfolio.holdings.map((holding) => (
              <HoldingCard key={holding.symbol} holding={holding} />
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Allocation note</p>
          <h2 className="mt-2 text-2xl font-semibold">Risk posture</h2>
          <div className="mt-6 space-y-4 text-sm text-mist/80">
            <p>
              The portfolio screen is structured for backend integration with `/portfolio` and
              `/portfolio/summary` so the paper trading engine can drop in without UI refactors.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-medium text-white">Readiness checklist</p>
              <ul className="mt-3 space-y-2">
                <li>JWT-protected portfolio fetch</li>
                <li>Server-side P&amp;L computation</li>
                <li>Position-level realized and unrealized metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
