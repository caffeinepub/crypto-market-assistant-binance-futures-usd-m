import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  BarChart2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import React, { useState } from "react";
import { usePaperTradeHistory } from "../hooks/usePaperTradeHistory";
import type { TradingModality } from "../lib/paperTradeStorage";

const MODALITY_LABELS: Record<TradingModality, string> = {
  scalping: "Scalping",
  swing: "Swing",
  breakout: "Breakout",
  reversal: "Reversal",
  smc: "SMC",
  fvg: "FVG",
};

function WinRateBadge({ rate }: { rate: number }) {
  const color =
    rate >= 60
      ? "bg-neon-green/20 text-neon-green border-neon-green/40"
      : rate >= 40
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
        : "bg-neon-red/20 text-neon-red border-neon-red/40";
  return (
    <Badge variant="outline" className={`text-xs font-bold ${color}`}>
      {rate.toFixed(1)}%
    </Badge>
  );
}

export default function AIPaperTradingStatsPanel() {
  const { summary, clearHistory } = usePaperTradeHistory();

  if (!summary) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/80 p-4 animate-pulse">
        <div className="h-4 bg-muted/30 rounded w-1/3 mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const {
    totalTrades,
    winRate,
    averagePnlPercent,
    totalPnlUsd,
    modalityBreakdown,
  } = summary;

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            AI Accuracy Stats
          </span>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {totalTrades} trades closed
          </Badge>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-neon-red h-7 px-2"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Paper Trading History?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all closed paper trade history and
                accuracy statistics. Open trades will not be affected. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => clearHistory.mutate()}
                disabled={clearHistory.isPending}
              >
                {clearHistory.isPending ? "Resetting..." : "Reset History"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Overall stats */}
      {totalTrades === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No closed trades yet. The AI engine is running...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/20 border border-border/40 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
              <WinRateBadge rate={winRate} />
            </div>
            <div className="rounded-lg bg-muted/20 border border-border/40 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Avg PnL</p>
              <span
                className={`text-sm font-bold font-mono ${averagePnlPercent >= 0 ? "text-neon-green" : "text-neon-red"}`}
              >
                {averagePnlPercent >= 0 ? "+" : ""}
                {averagePnlPercent.toFixed(1)}%
              </span>
            </div>
            <div className="rounded-lg bg-muted/20 border border-border/40 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total PnL</p>
              <span
                className={`text-sm font-bold font-mono ${totalPnlUsd >= 0 ? "text-neon-green" : "text-neon-red"}`}
              >
                {totalPnlUsd >= 0 ? "+" : ""}${totalPnlUsd.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Per-modality breakdown */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Per Modality
            </p>
            <div className="space-y-1">
              {modalityBreakdown
                .filter((m) => m.trades > 0)
                .map((m) => (
                  <div
                    key={m.modality}
                    className="flex items-center justify-between text-xs rounded-lg px-3 py-1.5 bg-muted/10 border border-border/30"
                  >
                    <span className="text-foreground font-medium w-20">
                      {MODALITY_LABELS[m.modality]}
                    </span>
                    <span className="text-muted-foreground">
                      {m.trades} trades
                    </span>
                    <WinRateBadge rate={m.winRate} />
                    <span
                      className={`font-mono font-medium ${m.avgPnl >= 0 ? "text-neon-green" : "text-neon-red"}`}
                    >
                      {m.avgPnl >= 0 ? "+" : ""}
                      {m.avgPnl.toFixed(1)}%
                    </span>
                  </div>
                ))}
              {modalityBreakdown.every((m) => m.trades === 0) && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Waiting for first trades to close...
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
