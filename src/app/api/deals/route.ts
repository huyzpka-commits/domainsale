import { NextResponse } from "next/server";
import { aggregateDeals } from "@/lib/scrapers";
import { cache } from "@/lib/cache";
import type { DealsApiResponse } from "@/lib/types";

const CACHE_KEY = "all-deals";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "1";

  // Try cache first
  if (!forceRefresh) {
    const cached = cache.get<DealsApiResponse>(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }
  }

  try {
    const { deals, sources, errors, fetchedAt } = await aggregateDeals();

    const freeDeals = deals.filter((d) => d.dealType === "free" || d.salePrice === 0);
    const discountDeals = deals.filter((d) => d.discount !== null && d.discount > 0);
    const avgDiscount =
      discountDeals.length > 0
        ? discountDeals.reduce((sum, d) => sum + (d.discount ?? 0), 0) / discountDeals.length
        : 0;

    const registrars = Array.from(new Set(deals.map((d) => d.registrar))).sort();
    const tlds = Array.from(new Set(deals.map((d) => d.tld))).sort();
    const cheapestPrice = Math.min(...deals.map((d) => d.salePrice));

    const response: DealsApiResponse = {
      deals,
      stats: {
        total: deals.length,
        freeCount: freeDeals.length,
        avgDiscount: Math.round(avgDiscount),
        cheapestPrice,
        registrars,
        tlds,
      },
      lastFetched: fetchedAt,
      sources,
    };

    if (errors.length > 0) {
      console.warn("Deal fetch errors:", errors);
    }

    cache.set(CACHE_KEY, response, CACHE_TTL_MS);
    return NextResponse.json({ ...response, cached: false });
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}
