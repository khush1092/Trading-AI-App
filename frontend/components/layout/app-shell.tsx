import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="panel mb-8 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-glow">Indian Paper Trading</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              AI prediction workspace for NSE-focused simulation
            </h1>
          </div>
          <nav className="flex flex-wrap gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-mist transition hover:border-glow/40 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="pb-10">{children}</main>
      </div>
    </div>
  );
}
