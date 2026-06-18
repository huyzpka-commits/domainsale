"use client";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { FilterState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  registrars: string[];
  tlds: string[];
  totalResults: number;
}

const DEAL_TYPES = [
  { value: "all", label: "All" },
  { value: "free", label: "🎁 Free" },
  { value: "sale", label: "🏷️ Sale" },
  { value: "promo", label: "⚡ Promo" },
  { value: "transfer", label: "🔄 Transfer" },
  { value: "bundle", label: "📦 Bundle" },
] as const;

const SORT_OPTIONS = [
  { value: "price-asc", label: "Cheapest first" },
  { value: "price-desc", label: "Most expensive" },
  { value: "discount-desc", label: "Biggest discount" },
  { value: "name-asc", label: "TLD A→Z" },
  { value: "newest", label: "Newest" },
] as const;

export default function FilterBar({ filters, onChange, registrars, tlds, totalResults }: FilterBarProps) {
  const update = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial });

  const hasActiveFilters =
    filters.search ||
    filters.maxPrice < 999 ||
    filters.dealType !== "all" ||
    (filters.registrar && filters.registrar !== "all") ||
    (filters.tld && filters.tld !== "all") ||
    !filters.showFirstYearOnly;

  const clearAll = () =>
    onChange({
      search: "",
      maxPrice: 999,
      dealType: "all",
      registrar: "all",
      tld: "all",
      sortBy: "price-asc",
      showFirstYearOnly: true,
    });

  return (
    <div className="space-y-4 mb-6">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Filter by TLD, registrar... (e.g. .xyz, Porkbun)"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => update({ sortBy: e.target.value as FilterState["sortBy"] })}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-green-500/50 cursor-pointer min-w-[160px]"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-gray-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Deal type pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {DEAL_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => update({ dealType: t.value as FilterState["dealType"] })}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              filters.dealType === t.value
                ? "bg-green-500/20 border-green-500/50 text-green-400"
                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"
            )}
          >
            {t.label}
          </button>
        ))}

        <div className="flex-1" />

        {/* Advanced filters */}
        <div className="flex items-center gap-3">
          {/* Registrar filter */}
          <select
            value={filters.registrar || "all"}
            onChange={(e) => update({ registrar: e.target.value })}
            className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 focus:outline-none focus:border-green-500/50 cursor-pointer"
          >
            <option value="all" className="bg-gray-900">All registrars</option>
            {registrars.map((r) => (
              <option key={r} value={r} className="bg-gray-900">{r}</option>
            ))}
          </select>

          {/* Max price */}
          <select
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: parseFloat(e.target.value) })}
            className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 focus:outline-none focus:border-green-500/50 cursor-pointer"
          >
            <option value="999" className="bg-gray-900">Any price</option>
            <option value="0" className="bg-gray-900">Free only</option>
            <option value="1" className="bg-gray-900">Under $1</option>
            <option value="5" className="bg-gray-900">Under $5</option>
            <option value="10" className="bg-gray-900">Under $10</option>
            <option value="20" className="bg-gray-900">Under $20</option>
          </select>

          {/* First year only toggle */}
          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.showFirstYearOnly}
              onChange={(e) => update({ showFirstYearOnly: e.target.checked })}
              className="w-3 h-3 accent-green-500"
            />
            Show 1st-year promos
          </label>
        </div>
      </div>

      {/* Results count + clear */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          <span className="text-white font-semibold">{totalResults}</span> deals
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
