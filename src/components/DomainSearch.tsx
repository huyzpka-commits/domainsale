"use client";
import { useState, useRef } from "react";
import { Search, CheckCircle, XCircle, Clock, Loader2, ExternalLink, DollarSign } from "lucide-react";
import type { DomainSearchResult } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";

export default function DomainSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DomainSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/search?domain=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const availabilityIcon = () => {
    if (!result) return null;
    const { available } = result.availability;
    if (available === true) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (available === false) return <XCircle className="w-5 h-5 text-red-400" />;
    return <Clock className="w-5 h-5 text-yellow-400" />;
  };

  const availabilityText = () => {
    if (!result) return "";
    const { available } = result.availability;
    if (available === true) return "Available!";
    if (available === false) return "Taken";
    return "Status unknown";
  };

  const availabilityColor = () => {
    if (!result) return "";
    const { available } = result.availability;
    if (available === true) return "text-green-400";
    if (available === false) return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div className="mb-10 p-6 rounded-2xl bg-white/3 border border-white/10">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Check Domain Availability</h2>
        <p className="text-sm text-gray-500">
          Search any domain to check availability + see the cheapest price from our tracked registrars
        </p>
      </div>

      <form onSubmit={search} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="e.g. myproject.com or hello.xyz"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-3 bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "Checking..." : "Search"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 animate-slide-up">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            {/* Domain + availability */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-mono font-bold text-white text-lg">{result.domain}</span>
                {result.availability.registrant && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Registered to: {result.availability.registrant}
                  </div>
                )}
                {result.availability.expiresAt && (
                  <div className="text-xs text-gray-600 mt-0.5">
                    Expires: {new Date(result.availability.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className={cn("flex items-center gap-2 font-semibold text-sm", availabilityColor())}>
                {availabilityIcon()}
                {availabilityText()}
              </div>
            </div>

            {/* Price options */}
            {result.availability.available && result.prices.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Register at
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.prices.map((p, i) => (
                    <a
                      key={i}
                      href={p.dealUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        i === 0
                          ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/15"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      <div>
                        <div className={cn(
                          "text-sm font-semibold",
                          i === 0 ? "text-green-400" : "text-gray-300"
                        )}>
                          {p.registrar}
                          {i === 0 && (
                            <span className="ml-2 text-[10px] bg-green-500/20 border border-green-500/30 text-green-400 px-1.5 py-0.5 rounded-full">
                              Best price
                            </span>
                          )}
                        </div>
                        {p.firstYearOnly && (
                          <div className="text-[10px] text-amber-400/70 mt-0.5">1st year only</div>
                        )}
                        {p.notes && (
                          <div className="text-[10px] text-gray-600 mt-0.5 max-w-[200px] truncate">{p.notes}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "font-mono font-bold",
                          p.price === 0 ? "text-green-400" : i === 0 ? "text-green-400" : "text-white"
                        )}>
                          {p.price === 0 ? "FREE" : formatPrice(p.price)}
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-600" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {result.availability.available === false && (
              <div className="mt-2 text-xs text-gray-500">
                This domain is already registered. Try a different name or TLD.
              </div>
            )}

            {result.availability.available && result.prices.length === 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Domain appears available but we don&apos;t have pricing data for <code className="font-mono">{result.tld}</code>. Check registrars directly.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
