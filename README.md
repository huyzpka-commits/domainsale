# 🌐 DomainDeals — Cheap & Free Domain Tracker

A full-stack Next.js web app that aggregates the best domain deals from multiple registrars in real-time.

## Features

- **Real-time data** from Porkbun's public pricing API
- **Curated deals** from Namecheap, Cloudflare, GoDaddy, IONOS, Hostinger, Dynadot
- **Domain availability checker** using RDAP (no API key required)
- **Price comparison** across registrars for any TLD
- **Smart filters** — by price, deal type, registrar, TLD
- **Free domain section** — GitHub Student Pack, Freenom, bundle deals
- **Dark mode UI** with live deal cards
- **1-hour cache** to avoid hammering APIs
- **Docker-ready** for easy deployment

## Quick Start

### Development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Docker (Production)
```bash
docker compose up -d
# Open http://localhost:3000
```

### Build manually
```bash
npm install
npm run build
npm start
```

## Data Sources

| Source | Type | Refresh |
|--------|------|---------|
| [Porkbun API](https://porkbun.com/api/json/v3/pricing/get) | Live API | Every request (cached 1h) |
| Namecheap | Curated | Manual update |
| Cloudflare Registrar | Curated (at-cost) | Manual update |
| GoDaddy | Curated | Manual update |
| IONOS | Curated | Manual update |
| Hostinger | Curated | Manual update |
| Dynadot | Curated | Manual update |
| GitHub Education | Curated | Manual update |
| Freenom | Curated | Manual update |

## API Endpoints

### `GET /api/deals`
Returns all aggregated deals with stats.

Query params:
- `?refresh=1` — force skip cache and re-fetch

### `GET /api/search?domain=example.com`
Check domain availability (via RDAP) + pricing options.

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Main dashboard (client)
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── deals/route.ts    # Aggregates all sources
│       └── search/route.ts   # RDAP check + price lookup
├── components/
│   ├── Header.tsx
│   ├── StatsBar.tsx
│   ├── FilterBar.tsx
│   ├── DealCard.tsx
│   └── DomainSearch.tsx
└── lib/
    ├── types.ts
    ├── utils.ts
    ├── cache.ts              # In-memory server-side cache
    ├── rdap.ts               # Domain availability via RDAP
    └── scrapers/
        ├── index.ts          # Aggregator with fallback
        ├── porkbun.ts        # Live Porkbun API
        └── curated.ts        # Curated deal dataset
```

## Extending with New Sources

1. Create `src/lib/scrapers/myregistrar.ts`
2. Export a `fetchMyRegistrarDeals(): Promise<DomainDeal[]>` function
3. Import and call it in `src/lib/scrapers/index.ts`

## Deployment

### VPS with Docker
```bash
git clone <your-repo>
cd domain-deals
docker compose up -d
```

### Vercel
```bash
npm i -g vercel
vercel deploy
```

### Nginx reverse proxy (optional)
Uncomment the nginx service in `docker-compose.yml` and add your `nginx.conf`.

## Keeping Deals Updated

- **Porkbun prices** update automatically every hour via the live API
- **Curated deals** need manual maintenance in `src/lib/scrapers/curated.ts`
- Consider adding a cron job or GitHub Action to periodically call `/api/deals?refresh=1`

## License
MIT
