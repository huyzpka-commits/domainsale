"use client";
import { Globe, TrendingDown, Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">Domain</span>
              <span className="font-bold text-lg text-green-400">Deals</span>
            </div>
          </div>

          {/* Nav tags */}
          <nav className="hidden md:flex items-center gap-2">
            <a
              href="#deals"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Best Deals
            </a>
            <a
              href="#free"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              Free Domains
            </a>
          </nav>

          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live data
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
