/**
 * Porkbun public pricing API
 * POST https://porkbun.com/api/json/v3/pricing/get
 * No auth required — returns live pricing for all supported TLDs
 */
import type { DomainDeal } from "../types";

interface PorkbunTldPricing {
  registration: string;
  renewal: string;
  transfer: string;
  coupons?: {
    registration?: {
      code: string;
      max_years: number;
      discount_type: "amount" | "percentage";
      discount: string;
      price: string;
    };
  };
}

interface PorkbunApiResponse {
  status: "SUCCESS" | "ERROR";
  pricing: Record<string, PorkbunTldPricing>;
}

// TLDs that are typically ultra-cheap or popular for deals
const CHEAP_THRESHOLD_USD = 5.0;
const FEATURED_TLDS = new Set([
  "com", "net", "org", "io", "dev", "app", "xyz", "me", "co",
  "ai", "sh", "cloud", "store", "online", "site", "tech", "info",
]);

export async function fetchPorkbunDeals(): Promise<DomainDeal[]> {
  const res = await fetch("https://porkbun.com/api/json/v3/pricing/get", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    next: { revalidate: 3600 }, // Next.js cache 1h
  });

  if (!res.ok) throw new Error(`Porkbun API error: ${res.status}`);

  const data: PorkbunApiResponse = await res.json();
  if (data.status !== "SUCCESS") throw new Error("Porkbun API returned non-SUCCESS");

  const deals: DomainDeal[] = [];
  const now = new Date().toISOString();

  for (const [tld, pricing] of Object.entries(data.pricing)) {
    const regPrice = parseFloat(pricing.registration);
    if (isNaN(regPrice)) continue;

    const renewalPrice = parseFloat(pricing.renewal);
    const coupon = pricing.coupons?.registration;

    // If there's a coupon, use its discounted price
    if (coupon) {
      const salePrice = parseFloat(coupon.price);
      const regularPrice = regPrice;
      const discount = ((regularPrice - salePrice) / regularPrice) * 100;

      deals.push({
        id: `porkbun-${tld}-promo`,
        tld: `.${tld}`,
        registrar: "Porkbun",
        registrarUrl: "https://porkbun.com",
        dealUrl: `https://porkbun.com/tld/${tld}`,
        regularPrice: regularPrice,
        salePrice: salePrice === 0 ? 0 : salePrice,
        discount: Math.round(discount),
        dealType: salePrice === 0 ? "free" : "promo",
        firstYearOnly: coupon.max_years === 1,
        validUntil: null,
        notes: `Code: ${coupon.code} (max ${coupon.max_years} yr). Renewal: $${renewalPrice}/yr`,
        lastUpdated: now,
        source: "porkbun-api",
        featured: FEATURED_TLDS.has(tld),
        tags: salePrice === 0 ? ["free", "porkbun"] : ["promo", "porkbun"],
      });
    } else if (regPrice <= CHEAP_THRESHOLD_USD) {
      // No coupon but naturally cheap
      deals.push({
        id: `porkbun-${tld}`,
        tld: `.${tld}`,
        registrar: "Porkbun",
        registrarUrl: "https://porkbun.com",
        dealUrl: `https://porkbun.com/tld/${tld}`,
        regularPrice: regPrice,
        salePrice: regPrice,
        discount: null,
        dealType: "sale",
        firstYearOnly: false,
        validUntil: null,
        notes: `Standard price. Renewal: $${renewalPrice}/yr`,
        lastUpdated: now,
        source: "porkbun-api",
        featured: FEATURED_TLDS.has(tld),
        tags: ["cheap", "porkbun"],
      });
    }
  }

  return deals;
}
