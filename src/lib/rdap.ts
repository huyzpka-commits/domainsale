/**
 * RDAP (Registration Data Access Protocol) — RFC 7480
 * Free, public, no API key required.
 * Used to check domain availability and registration info.
 */
import type { DomainAvailability } from "./types";

const RDAP_BOOTSTRAP = "https://rdap.org/domain/";
const RDAP_TIMEOUT_MS = 5000;

export async function checkDomainAvailability(domain: string): Promise<DomainAvailability> {
  const cleaned = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  const tld = `.${cleaned.split(".").pop()}`;
  const checkedAt = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RDAP_TIMEOUT_MS);

    const res = await fetch(`${RDAP_BOOTSTRAP}${cleaned}`, {
      signal: controller.signal,
      headers: { Accept: "application/rdap+json" },
    });
    clearTimeout(timeout);

    if (res.status === 404) {
      // 404 from RDAP = domain not found in registry = AVAILABLE
      return {
        domain: cleaned,
        tld,
        available: true,
        checkedAt,
        rdapSource: "rdap.org",
      };
    }

    if (!res.ok) {
      throw new Error(`RDAP HTTP ${res.status}`);
    }

    const data = await res.json();

    // Domain found in registry = TAKEN
    const registrant =
      data.entities
        ?.find((e: { roles: string[] }) => e.roles?.includes("registrant"))
        ?.vcardArray?.[1]?.find((v: string[]) => v[0] === "fn")?.[3] ?? undefined;

    const expiresAt = data.events?.find(
      (e: { eventAction: string }) => e.eventAction === "expiration"
    )?.eventDate ?? undefined;

    return {
      domain: cleaned,
      tld,
      available: false,
      registrant,
      expiresAt,
      checkedAt,
      rdapSource: "rdap.org",
    };
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      return { domain: cleaned, tld, available: null, checkedAt, rdapSource: "timeout" };
    }
    // Network error or other issue
    return { domain: cleaned, tld, available: null, checkedAt, rdapSource: "error" };
  }
}

/**
 * Get pricing suggestions for a domain from our deals dataset.
 */
export function getPriceSuggestions(tld: string, deals: import("./types").DomainDeal[]) {
  return deals
    .filter((d) => d.tld === tld)
    .sort((a, b) => a.salePrice - b.salePrice)
    .slice(0, 5)
    .map((d) => ({
      registrar: d.registrar,
      registrarUrl: d.registrarUrl,
      dealUrl: d.dealUrl,
      price: d.salePrice,
      isPromo: d.dealType === "promo" || d.dealType === "sale",
      firstYearOnly: d.firstYearOnly,
      notes: d.notes ?? undefined,
    }));
}
