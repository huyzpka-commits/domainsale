"use client";
import { Tag, Gift, TrendingDown, RefreshCw } from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";

interface StatsBarProps {
  total: number;
  freeCount: number;
  avgDiscount: number;
  cheapestPrice: number;
  lastFetched: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function StatsBar({
  total,
  freeCount,
  avgDiscount,
  cheapestPrice,
  lastFetched,
  onRefresh,
  isRefreshing,
}: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <StatCard
        icon={<Tag className="w-4 h-4 text-blue-400" />}
        label="Total Deals"
        value={total.toString()}
        sub="active offers"
        color="blue"
      />
      <StatCard
        icon={<Gift className="w-4 h-4 text-green-400" />}
        label="Free Domains"
        value={freeCount.toString()}
        sub="$0.00/yr"
        color="green"
      />
      <StatCard
        icon={<TrendingDown className="w-4 h-4 text-orange-400" />}
        label="Avg Discount"
        value={`${avgDiscount}%`}
        sub="off regular price"
        color="orange"
      />
      <StatCard
        icon={<TrendingDown className="w-4 h-4 text-purple-400" />}
        label="Cheapest"
        value={cheapestPrice === 0 ? "FREE" : formatPrice(cheapestPrice)}
        sub="registration"
        color="purple"
        extra={
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="absolute top-3 right-3 p-1 rounded-md hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-300 disabled:opacity-50"
            title="Refresh deals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        }
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: "blue" | "green" | "orange" | "purple";
  extra?: React.ReactNode;
}

const colorMap = {
  blue: "border-blue-500/20 bg-blue-500/5",
  green: "border-green-500/20 bg-green-500/5",
  orange: "border-orange-500/20 bg-orange-500/5",
  purple: "border-purple-500/20 bg-purple-500/5",
};

function StatCard({ icon, label, value, sub, color, extra }: StatCardProps) {
  return (
    <div className={`relative rounded-xl border p-4 ${colorMap[color]}`}>
      {extra}
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
    </div>
  );
}
