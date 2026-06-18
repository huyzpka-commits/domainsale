import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DomainDeal, FilterState } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price === 0) return "FREE";
  return `$${price.toFixed(2)}`;
}

export function formatDiscount(discount: number | null): string {
  if (!discount) return "";
  return `-${Math.round(discount)}%`;
}

export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getDealTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    free: "FREE",
    sale: "SALE",
    promo: "PROMO",
    transfer: "TRANSFER",
    bundle: "BUNDLE",
  };
  return labels[type] ?? type.toUpperCase();
}

export function getDealTypeBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    free: "bg-green-500/20 text-green-400 border-green-500/30",
    sale: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    promo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    transfer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    bundle: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };
  return classes[type] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

export function parseDomain(input: string): { sld: string; tld: string } | null {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];

  const parts = cleaned.split(".");
  if (parts.length < 2) return null;
  if (parts.some((p) => !p)) return null;

  // Handle multi-part TLDs like .co.uk
  if (parts.length >= 3) {
    const possibleTld2 = `.${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    const twoPartTlds = [".co.uk", ".com.au", ".co.in", ".com.br", ".co.nz", ".org.uk"];
    if (twoPartTlds.includes(possibleTld2)) {
      return {
        sld: parts.slice(0, parts.length - 2).join("."),
        tld: possibleTld2,
      };
    }
  }

  return {
    sld: parts.slice(0, -1).join("."),
    tld: `.${parts[parts.length - 1]}`,
  };
}

export function filterDeals(deals: DomainDeal[], filters: FilterState): DomainDeal[] {
  let result = [...deals];

  // Search by TLD or name
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase().replace(/^\./, "");
    result = result.filter(
      (d) =>
        d.tld.toLowerCase().includes(q) ||
        d.registrar.toLowerCase().includes(q) ||
        (d.notes ?? "").toLowerCase().includes(q)
    );
  }

  // Price filter
  if (filters.maxPrice < 999) {
    result = result.filter((d) => d.salePrice <= filters.maxPrice);
  }

  // Deal type
  if (filters.dealType !== "all") {
    result = result.filter((d) => d.dealType === filters.dealType);
  }

  // Registrar
  if (filters.registrar && filters.registrar !== "all") {
    result = result.filter((d) => d.registrar === filters.registrar);
  }

  // TLD
  if (filters.tld && filters.tld !== "all") {
    result = result.filter((d) => d.tld === filters.tld);
  }

  // First year only toggle
  if (!filters.showFirstYearOnly) {
    result = result.filter((d) => !d.firstYearOnly);
  }

  // Sort
  switch (filters.sortBy) {
    case "price-asc":
      result.sort((a, b) => a.salePrice - b.salePrice);
      break;
    case "price-desc":
      result.sort((a, b) => b.salePrice - a.salePrice);
      break;
    case "discount-desc":
      result.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
      break;
    case "name-asc":
      result.sort((a, b) => a.tld.localeCompare(b.tld));
      break;
    case "newest":
      result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      break;
  }

  return result;
}
