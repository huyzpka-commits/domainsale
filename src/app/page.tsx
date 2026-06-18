"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, AlertCircle, Zap } from "lucide-react";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import FilterBar from "@/components/FilterBar";
import DealCard from "@/components/DealCard";
import DomainSearch from "@/components/DomainSearch";
import type { DomainDeal, DealsApiResponse, FilterState } from "@/lib/types";
import { filterDeals } from "@/lib/utils";

const DEFAULT_FILTERS: FilterState = {
  search: "",
  maxPrice: 999,
  dealType: "all",
  registrar: "all",
  tld: "all",
  sortBy: "price-asc",
  showFirstYearOnly: true,
};

export default function HomePage() {
  const [data, setData] = useState<DealsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDeals = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      const res = await fetch(`/api/deals${forceRefresh ? "?refresh=1" : ""}`);
      if (!res.ok) throw new Error("Failed to load deals");
      const json: DealsApiResponse = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const filteredDeals = useMemo(() => {
    if (!data) return [];
    return filterDeals(data.deals, filters);
  }, [data, filters]);

  const freeDeals = useMemo(
    () => (data?.deals ?? []).filter((d) => d.salePrice === 0 || d.dealType === "free"),
    [data]
  );

  const featuredDeals = useMemo(
    () => filteredDeals.filter((d) => d.featured),
    [filteredDeals]
  );
  const otherDeals = useMemo(
    () => filteredDeals.filter((d) => !d.featured),
    [filteredDeals]
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 font-medium">
                <Zap className="w-3 h-3" />
                Real-time deal tracker
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Find{" "}
              <span className="text-green-400">cheap</span> &amp; <span className="text-green-400">free</span>
              <br />
              domains today
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Track the best domain deals from Porkbun, Namecheap, Cloudflare, GoDaddy and more.
              Live data, updated hourly.{" "}
              {data && (
                <span className="text-white font-semibold">
                  {data.stats.total} deals available now.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-3" />
            <span className="text-sm">Fetching latest deals...</span>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => fetchDeals()}
              className="ml-auto text-xs underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Stats */}
            <StatsBar
              total={data.stats.total}
              freeCount={data.stats.freeCount}
              avgDiscount={data.stats.avgDiscount}
              cheapestPrice={data.stats.cheapestPrice}
              lastFetched={data.lastFetched}
              onRefresh={() => fetchDeals(true)}
              isRefreshing={isRefreshing}
            />

            {/* Domain search */}
            <DomainSearch />

            {/* Filter bar */}
            <FilterBar
              filters={filters}
              onChange={setFilters}
              registrars={data.stats.registrars}
              tlds={data.stats.tlds}
              totalResults={filteredDeals.length}
            />

            {/* Free domains section */}
            {filters.dealType === "all" && !filters.search && freeDeals.length > 0 && (
              <section id="free" className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Free Domains
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 font-mono">
                    {freeDeals.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {freeDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              </section>
            )}

            {/* Featured deals */}
            {featuredDeals.length > 0 && (
              <section id="deals" className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      {filters.dealType === "all" && !filters.search ? "Featured Deals" : "Top Results"}
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-500 font-mono">
                    {featuredDeals.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {featuredDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              </section>
            )}

            {/* All other deals */}
            {otherDeals.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      {filters.dealType === "all" && !filters.search ? "All Deals" : "More Results"}
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-500 font-mono">
                    {otherDeals.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {otherDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {filteredDeals.length === 0 && (
              <div className="text-center py-16 text-gray-600">
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-semibold text-gray-400 mb-1">No deals found</div>
                <div className="text-sm">Try adjusting your filters</div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <div>
              <span className="text-gray-400 font-semibold">DomainDeals</span> — Track cheap &amp; free domains
            </div>
            <div className="flex items-center gap-4">
              <span>Sources: Porkbun API · Namecheap · Cloudflare · GoDaddy · Curated</span>
            </div>
            <div>
              Prices may vary. Always verify on registrar site.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
