"use client";
import { ExternalLink, Clock, Star, ArrowRight, Info } from "lucide-react";
import type { DomainDeal } from "@/lib/types";
import { formatPrice, formatDiscount, getDealTypeLabel, getDealTypeBadgeClass, cn } from "@/lib/utils";

interface DealCardProps {
  deal: DomainDeal;
}

const SOURCE_LABELS: Record<string, string> = {
  "porkbun-api": "Porkbun",
  namecheap: "Namecheap",
  cloudflare: "Cloudflare",
  godaddy: "GoDaddy",
  ionos: "IONOS",
  hostinger: "Hostinger",
  dynadot: "Dynadot",
  curated: "Curated",
};

export default function DealCard({ deal }: DealCardProps) {
  const isFree = deal.salePrice === 0;
  const hasDiscount = deal.discount !== null && deal.discount > 0;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border p-5 transition-all duration-200 animate-fade-in",
        "bg-gray-900/50 border-white/10 hover:border-white/20 hover:bg-gray-900/80 hover:shadow-xl hover:shadow-black/20",
        deal.featured && "ring-1 ring-green-500/20"
      )}
    >
      {/* Featured badge */}
      {deal.featured && (
        <span className="absolute -top-2 left-4 flex items-center gap-1 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-[10px] text-green-400 font-medium">
          <Star className="w-2.5 h-2.5 fill-green-400" />
          Featured
        </span>
      )}

      {/* Header: TLD + deal type badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-3xl font-black text-white tracking-tight font-mono">
            {deal.tld}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{deal.registrar}</div>
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
          getDealTypeBadgeClass(deal.dealType)
        )}>
          {getDealTypeLabel(deal.dealType)}
        </span>
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-2xl font-bold font-mono",
            isFree ? "text-green-400" : "text-white"
          )}>
            {isFree ? "FREE" : formatPrice(deal.salePrice)}
          </span>
          {!isFree && <span className="text-xs text-gray-500">/yr</span>}
        </div>

        <div className="flex items-center gap-2 mt-1">
          {deal.regularPrice && deal.regularPrice !== deal.salePrice && (
            <span className="text-xs text-gray-600 line-through font-mono">
              {formatPrice(deal.regularPrice)}
            </span>
          )}
          {hasDiscount && (
            <span className="text-xs text-orange-400 font-semibold">
              {formatDiscount(deal.discount)}
            </span>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="space-y-1.5 mb-4">
        {deal.firstYearOnly && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400/80">
            <Clock className="w-3 h-3" />
            First year only
          </div>
        )}
        {deal.validUntil && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Clock className="w-3 h-3" />
            Expires {new Date(deal.validUntil).toLocaleDateString()}
          </div>
        )}
        {deal.notes && (
          <div className="flex items-start gap-1.5 text-[11px] text-gray-500">
            <Info className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{deal.notes}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {deal.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-gray-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA Button */}
      <a
        href={deal.dealUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
          isFree
            ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
            : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white group-hover:border-white/20"
        )}
      >
        {isFree ? "Get free domain" : "Get this deal"}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>

      {/* Source footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-[10px] text-gray-700">
          via {SOURCE_LABELS[deal.source] ?? deal.source}
        </span>
        <a
          href={deal.registrarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors"
        >
          {deal.registrar} <ArrowRight className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
