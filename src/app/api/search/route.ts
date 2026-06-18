import { NextResponse } from "next/server";
import { checkDomainAvailability, getPriceSuggestions } from "@/lib/rdap";
import { aggregateDeals } from "@/lib/scrapers";
import { cache } from "@/lib/cache";
import { parseDomain } from "@/lib/utils";
import type { DomainSearchResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain || domain.length < 3) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const parsed = parseDomain(domain);
  if (!parsed) {
    return NextResponse.json({ error: "Could not parse domain" }, { status: 400 });
  }

  const fullDomain = `${parsed.sld}${parsed.tld}`;

  try {
    // Get availability + deals in parallel
    const [availability, aggregated] = await Promise.all([
      checkDomainAvailability(fullDomain),
      // Try cache first for deals
      Promise.resolve(cache.get<{ deals: Parameters<typeof getPriceSuggestions>[1] }>("all-deals") ?? null).then(
        async (cached) => {
          if (cached) return cached;
          return aggregateDeals();
        }
      ),
    ]);

    const deals = "deals" in aggregated ? aggregated.deals : [];
    const prices = getPriceSuggestions(parsed.tld, deals);

    const result: DomainSearchResult = {
      domain: fullDomain,
      sld: parsed.sld,
      tld: parsed.tld,
      availability,
      prices,
      cheapestPrice: prices.length > 0 ? Math.min(...prices.map((p) => p.price)) : null,
      cheapestRegistrar: prices.length > 0 ? prices.reduce((a, b) => (a.price < b.price ? a : b)).registrar : null,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
