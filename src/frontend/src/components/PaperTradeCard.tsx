import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import type { PaperTrade, TradingModality } from "../lib/paperTradeStorage";

interface PaperTradeCardProps {
  trade: PaperTrade;
}

const MODALITY_COLORS: Record<TradingModality, string> = {
  scalping: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  swing: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  breakout: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  reversal: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  smc: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  fvg: "bg-pink-500/20 text-pink-400 border-pink-500/40",
};

const MODALITY_LABELS: Record<TradingModality, string> = {
  scalping: "Scalping",
  swing: "Swing",
  breakout: "Breakout",
  reversal: "Reversal",
  smc: "SMC",
  fvg: "FVG",
};

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.01) return price.toFixed(5);
  return price.toFixed(8);
}

function formatDuration(openedAt: number): string {
  const ms = Date.now() - openedAt;
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}

export default function PaperTradeCard({ trade }: PaperTradeCardProps) {
  const [showReference, setShowReference] = useState(false);

  const isLong = trade.direction === "Long";
  const pnlPositive = trade.pnlPercent >= 0;

  const tp1Hit = isLong
    ? trade.currentPrice >= trade.tp1
    : trade.currentPrice <= trade.tp1;
  const tp2Hit = isLong
    ? trade.currentPrice >= trade.tp2
    : trade.currentPrice <= trade.tp2;
  const tp3Hit = isLong
    ? trade.currentPrice >= trade.tp3
    : trade.currentPrice <= trade.tp3;

  const pnlColor = pnlPositive ? "text-neon-green" : "text-neon-red";
  const pnlBg = pnlPositive
    ? "bg-neon-green/10 border-neon-green/30"
    : "bg-neon-red/10 border-neon-red/30";

  return (
    <div className="relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/40 transition-all duration-300">
      {/* Top accent line */}
      <div
        className={`h-0.5 w-full ${isLong ? "bg-neon-green" : "bg-neon-red"}`}
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono font-bold text-foreground text-base truncate">
              {trade.symbol}
            </span>
            <Badge
              variant="outline"
              className={`text-xs shrink-0 ${MODALITY_COLORS[trade.modality]}`}
            >
              {MODALITY_LABELS[trade.modality]}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant="outline"
              className={`text-xs font-bold ${isLong ? "bg-neon-green/10 text-neon-green border-neon-green/40" : "bg-neon-red/10 text-neon-red border-neon-red/40"}`}
            >
              {isLong ? (
                <TrendingUp className="w-3 h-3 mr-1 inline" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 inline" />
              )}
              {trade.direction}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs text-muted-foreground border-muted/40"
            >
              Paper
            </Badge>
          </div>
        </div>

        {/* Price info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">Entry</p>
            <p className="font-mono text-foreground font-medium">
              ${formatPrice(trade.entryPrice)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">Current</p>
            <p className="font-mono text-foreground font-medium">
              ${formatPrice(trade.currentPrice)}
            </p>
          </div>
        </div>

        {/* PnL */}
        <div className={`rounded-lg border px-3 py-2 ${pnlBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              PnL ({trade.leverage}x)
            </span>
            <div className="text-right">
              <span className={`font-mono font-bold text-sm ${pnlColor}`}>
                {pnlPositive ? "+" : ""}
                {trade.pnlPercent.toFixed(2)}%
              </span>
              <span className={`font-mono text-xs ml-2 ${pnlColor}`}>
                ({pnlPositive ? "+" : ""}${trade.pnlUsd.toFixed(2)})
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              Capital: ${trade.capital} × {trade.leverage}x = ${trade.exposure}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDuration(trade.openedAt)}
            </span>
          </div>
        </div>

        {/* TP/SL levels */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Target className="w-3 h-3" />
            <span>Take Profits</span>
          </div>
          {[
            { label: "TP1", price: trade.tp1, hit: tp1Hit },
            { label: "TP2", price: trade.tp2, hit: tp2Hit },
            { label: "TP3", price: trade.tp3, hit: tp3Hit },
          ].map(({ label, price, hit }) => (
            <div
              key={label}
              className={`flex items-center justify-between text-xs rounded px-2 py-1 ${hit ? "bg-neon-green/10 text-neon-green" : "bg-muted/20 text-muted-foreground"}`}
            >
              <span className="font-medium">{label}</span>
              <span className="font-mono">${formatPrice(price)}</span>
              {hit && <span className="text-neon-green text-xs">✓</span>}
            </div>
          ))}
          <div className="flex items-center justify-between text-xs rounded px-2 py-1 bg-neon-red/10 text-neon-red">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span className="font-medium">SL</span>
            </div>
            <span className="font-mono">${formatPrice(trade.slLevel)}</span>
          </div>
        </div>

        {/* Trade Reference Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-foreground border border-border/40 hover:border-primary/40"
          onClick={() => setShowReference(!showReference)}
        >
          {showReference ? (
            <ChevronUp className="w-3 h-3 mr-1" />
          ) : (
            <ChevronDown className="w-3 h-3 mr-1" />
          )}
          {showReference ? "Hide" : "Show"} Trade Signal
        </Button>

        {/* Trade Reference Section */}
        {showReference && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Trade Signal
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Use this information as a reference signal for manual
                    trading on Binance. This is a simulated paper trade.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">Pair:</span>
                <span className="ml-1 text-foreground font-bold">
                  {trade.symbol}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Dir:</span>
                <span
                  className={`ml-1 font-bold ${isLong ? "text-neon-green" : "text-neon-red"}`}
                >
                  {trade.direction}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Entry:</span>
                <span className="ml-1 text-foreground">
                  ${formatPrice(trade.entryPrice)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Lev:</span>
                <span className="ml-1 text-foreground">{trade.leverage}x</span>
              </div>
              <div>
                <span className="text-muted-foreground">TP1:</span>
                <span className="ml-1 text-neon-green">
                  ${formatPrice(trade.tp1)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">TP2:</span>
                <span className="ml-1 text-neon-green">
                  ${formatPrice(trade.tp2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">TP3:</span>
                <span className="ml-1 text-neon-green">
                  ${formatPrice(trade.tp3)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">SL:</span>
                <span className="ml-1 text-neon-red">
                  ${formatPrice(trade.slLevel)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
