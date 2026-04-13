type ChartPlaceholderProps = {
  symbol: string;
  priceLabel: string;
  trendLabel: string;
};

export function ChartPlaceholder({ symbol, priceLabel, trendLabel }: ChartPlaceholderProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#06101b] p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-glow">Chart placeholder</p>
          <h3 className="mt-2 text-xl font-semibold">{symbol}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{priceLabel}</p>
          <p className="mt-1 text-sm text-mist/70">{trendLabel}</p>
        </div>
      </div>

      <div className="relative h-72 overflow-hidden rounded-3xl border border-white/10 bg-market-grid bg-[size:36px_36px]">
        <svg
          viewBox="0 0 800 320"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          aria-label="Stock chart placeholder"
        >
          <defs>
            <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(85,243,190,0.35)" />
              <stop offset="100%" stopColor="rgba(85,243,190,0.02)" />
            </linearGradient>
          </defs>
          <path
            d="M0,250 C80,220 120,180 190,185 C260,190 310,120 380,110 C450,100 500,145 560,125 C620,105 670,65 800,40 L800,320 L0,320 Z"
            fill="url(#lineFill)"
          />
          <path
            d="M0,250 C80,220 120,180 190,185 C260,190 310,120 380,110 C450,100 500,145 560,125 C620,105 670,65 800,40"
            fill="none"
            stroke="#55f3be"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-mist/80">
          OHLC and indicators plug in here in Phase 5+
        </div>
      </div>
    </div>
  );
}
