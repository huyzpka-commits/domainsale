import type { DomainDeal } from "../types";
import { fetchPorkbunDeals } from "./porkbun";
import { getCuratedDeals } from "./curated";

export interface AggregatedDeals {
  deals: DomainDeal[];
  sources: string[];
  errors: string[];
  fetchedAt: string;
}

/**
 * Aggregate deals from all sources.
 * Falls back gracefully — if a live source fails, curated data is always used.
 */
export async function aggregateDeals(): Promise<AggregatedDeals> {
  const sources: string[] = [];
  const errors: string[] = [];
  const allDeals: DomainDeal[] = [];

  // 1. Always include curated deals (offline, always works)
  const curated = getCuratedDeals();
  allDeals.push(...curated);
  sources.push("curated");

  // 2. Try Porkbun live API
  try {
    const porkbunDeals = await fetchPorkbunDeals();

    // Merge: Porkbun live overwrites matching curated entries
    const porkbunTlds = new Set(porkbunDeals.map((d) => d.tld));

    // Remove curated porkbun entries for TLDs we got live data for
    const filtered = allDeals.filter(
      (d) => !(d.source === "porkbun-api" && porkbunTlds.has(d.tld))
    );
    filtered.push(...porkbunDeals);

    // Replace allDeals with merged result
    allDeals.length = 0;
    allDeals.push(...filtered);
    sources.push("porkbun-api");
  } catch (e) {
    errors.push(`Porkbun API: ${(e as Error).message}`);
  }

  // De-duplicate by id (keep last seen, which is live data)
  const seen = new Map<string, DomainDeal>();
  for (const deal of allDeals) {
    seen.set(deal.id, deal);
  }

  return {
    deals: Array.from(seen.values()),
    sources,
    errors,
    fetchedAt: new Date().toISOString(),
  };
}
