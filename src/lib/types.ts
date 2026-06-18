export type DealType = "free" | "sale" | "promo" | "transfer" | "bundle";

export interface DomainDeal {
  id: string;
  tld: string; // e.g. ".xyz"
  registrar: string;
  registrarUrl: string;
  dealUrl: string;
  regularPrice: number | null; // USD/yr, null if unknown
  salePrice: number; // USD/yr
  discount: number | null; // 0-100 percentage
  dealType: DealType;
  firstYearOnly: boolean;
  validUntil: string | null; // ISO date or null
  notes: string | null;
  lastUpdated: string; // ISO datetime
  source: "porkbun-api" | "namecheap" | "cloudflare" | "godaddy" | "ionos" | "hostinger" | "dynadot" | "curated";
  featured: boolean;
  tags: string[]; // e.g. ["popular", "new-gtld", "classic"]
}

export interface FilterState {
  search: string;
  maxPrice: number;
  dealType: "all" | DealType;
  registrar: string;
  tld: string;
  sortBy: "price-asc" | "price-desc" | "discount-desc" | "name-asc" | "newest";
  showFirstYearOnly: boolean;
}

export interface DomainAvailability {
  domain: string;
  tld: string;
  available: boolean | null; // null = unknown/error
  registrant?: string;
  expiresAt?: string;
  rdapSource?: string;
  checkedAt: string;
}

export interface PriceOption {
  registrar: string;
  registrarUrl: string;
  dealUrl: string;
  price: number;
  isPromo: boolean;
  firstYearOnly: boolean;
  notes?: string;
}

export interface DomainSearchResult {
  domain: string;
  sld: string; // second-level domain e.g. "example"
  tld: string; // e.g. ".com"
  availability: DomainAvailability;
  prices: PriceOption[];
  cheapestPrice: number | null;
  cheapestRegistrar: string | null;
}

export interface DealsApiResponse {
  deals: DomainDeal[];
  stats: {
    total: number;
    freeCount: number;
    avgDiscount: number;
    cheapestPrice: number;
    registrars: string[];
    tlds: string[];
  };
  lastFetched: string;
  sources: string[];
}
