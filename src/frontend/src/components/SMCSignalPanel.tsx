import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Minus, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import type { SMCAnalysisResult } from "../lib/smcIndicators";

interface SMCSignalPanelProps {
  analysis: SMCAnalysisResult;
  symbol: string;
  currentPrice?: number;
}

export default function SMCSignalPanel({
  analysis,
  symbol,
  currentPrice,
}: SMCSignalPanelProps) {
  const {
    orderBlocks,
    fairValueGaps,
    structurePoints,
    liquidityZones,
    premiumDiscountZone,
    bias,
    biasStrength,
  } = analysis;

  const activeOBs = orderBlocks.filter((ob) => !ob.mitigated);
  const activeFVGs = fairValueGaps.filter((fvg) => !fvg.filled);
  const recentStructure = structurePoints.slice(-5);
  const activeZones = liquidityZones.filter((lz) => !lz.swept);

  const BiasIcon =
    bias === "bullish" ? TrendingUp : bias === "bearish" ? TrendingDown : Minus;
  const biasColor =
    bias === "bullish"
      ? "text-[var(--trading-green)]"
      : bias === "bearish"
        ? "text-[var(--trading-red)]"
        : "text-[var(--trading-amber)]";

  return (
    <div className="flex flex-col h-full panel-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-display font-semibold text-foreground">
              SMC
            </span>
          </div>
          <span className="text-2xs font-mono text-muted-foreground">
            {symbol}
          </span>
        </div>

        {/* Bias indicator */}
        <div className={`flex items-center gap-1.5 mt-2 ${biasColor}`}>
          <BiasIcon className="w-4 h-4" />
          <span className="text-sm font-bold font-mono uppercase">{bias}</span>
          <span className="text-xs font-mono ml-auto text-muted-foreground">
            {biasStrength}%
          </span>
        </div>
        <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              bias === "bullish"
                ? "bg-[var(--trading-green)]"
                : bias === "bearish"
                  ? "bg-[var(--trading-red)]"
                  : "bg-[var(--trading-amber)]"
            }`}
            style={{ width: `${biasStrength}%` }}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {/* Premium/Discount Zone */}
          {premiumDiscountZone && currentPrice && (
            <div className="space-y-1">
              <p className="text-2xs font-mono text-muted-foreground uppercase tracking-wider">
                Zona Atual
              </p>
              <div className="bg-secondary/50 rounded p-2 space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Preço</span>
                  <span className="text-foreground">
                    {formatPrice(currentPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Zona</span>
                  <span
                    className={
                      currentPrice > premiumDiscountZone.premiumLow
                        ? "text-[var(--trading-red)]"
                        : currentPrice < premiumDiscountZone.discountHigh
                          ? "text-[var(--trading-green)]"
                          : "text-[var(--trading-amber)]"
                    }
                  >
                    {currentPrice > premiumDiscountZone.premiumLow
                      ? "PREMIUM"
                      : currentPrice < premiumDiscountZone.discountHigh
                        ? "DESCONTO"
                        : "EQUILÍBRIO"}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Equilíbrio</span>
                  <span className="text-[var(--trading-amber)]">
                    {formatPrice(premiumDiscountZone.equilibrium)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Order Blocks */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-2xs font-mono text-muted-foreground uppercase tracking-wider">
                Order Blocks
              </p>
              <Badge variant="outline" className="text-2xs h-4 px-1">
                {activeOBs.length}
              </Badge>
            </div>
            {activeOBs.length === 0 ? (
              <p className="text-2xs text-muted-foreground font-mono">
                Nenhum ativo
              </p>
            ) : (
              <div className="space-y-1">
                {activeOBs.slice(-5).map((ob) => (
                  <div
                    key={`ob-${ob.low}-${ob.high}`}
                    className="flex items-center justify-between bg-secondary/30 rounded px-2 py-1"
                  >
                    <Badge
                      variant="outline"
                      className={`text-2xs h-4 px-1 ${ob.type === "bullish" ? "border-[var(--trading-green)] text-[var(--trading-green)]" : "border-[var(--trading-red)] text-[var(--trading-red)]"}`}
                    >
                      {ob.type === "bullish" ? "▲" : "▼"}
                    </Badge>
                    <span className="text-2xs font-mono text-muted-foreground">
                      {formatPrice(ob.low)} – {formatPrice(ob.high)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fair Value Gaps */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-2xs font-mono text-muted-foreground uppercase tracking-wider">
                FVG
              </p>
              <Badge variant="outline" className="text-2xs h-4 px-1">
                {activeFVGs.length}
              </Badge>
            </div>
            {activeFVGs.length === 0 ? (
              <p className="text-2xs text-muted-foreground font-mono">
                Nenhum ativo
              </p>
            ) : (
              <div className="space-y-1">
                {activeFVGs.slice(-5).map((fvg) => (
                  <div
                    key={`fvg-${fvg.low}-${fvg.high}`}
                    className="flex items-center justify-between bg-secondary/30 rounded px-2 py-1"
                  >
                    <Badge
                      variant="outline"
                      className={`text-2xs h-4 px-1 ${fvg.type === "bullish" ? "border-blue-400 text-blue-400" : "border-[var(--trading-amber)] text-[var(--trading-amber)]"}`}
                    >
                      FVG
                    </Badge>
                    <span className="text-2xs font-mono text-muted-foreground">
                      {formatPrice(fvg.low)} – {formatPrice(fvg.high)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Structure Points */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-2xs font-mono text-muted-foreground uppercase tracking-wider">
                Estrutura
              </p>
              <Badge variant="outline" className="text-2xs h-4 px-1">
                {recentStructure.length}
              </Badge>
            </div>
            {recentStructure.length === 0 ? (
              <p className="text-2xs text-muted-foreground font-mono">
                Sem dados
              </p>
            ) : (
              <div className="space-y-1">
                {recentStructure.map((sp) => (
                  <div
                    key={`sp-${sp.price}-${sp.type}`}
                    className="flex items-center justify-between bg-secondary/30 rounded px-2 py-1"
                  >
                    <Badge
                      variant="outline"
                      className={`text-2xs h-4 px-1 ${sp.direction === "bullish" ? "border-[var(--trading-green)] text-[var(--trading-green)]" : "border-[var(--trading-red)] text-[var(--trading-red)]"}`}
                    >
                      {sp.type}
                    </Badge>
                    <span className="text-2xs font-mono text-muted-foreground">
                      {formatPrice(sp.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Liquidity Zones */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-2xs font-mono text-muted-foreground uppercase tracking-wider">
                Liquidez
              </p>
              <Badge variant="outline" className="text-2xs h-4 px-1">
                {activeZones.length}
              </Badge>
            </div>
            {activeZones.length === 0 ? (
              <p className="text-2xs text-muted-foreground font-mono">
                Nenhuma ativa
              </p>
            ) : (
              <div className="space-y-1">
                {activeZones.slice(-6).map((lz) => (
                  <div
                    key={`lz-${lz.price}-${lz.type}`}
                    className="flex items-center justify-between bg-secondary/30 rounded px-2 py-1"
                  >
                    <span
                      className={`text-2xs font-mono ${lz.type.includes("high") ? "text-[var(--trading-red)]" : "text-[var(--trading-green)]"}`}
                    >
                      {lz.type === "swing_high"
                        ? "SH"
                        : lz.type === "swing_low"
                          ? "SL"
                          : lz.type === "equal_high"
                            ? "EQH"
                            : "EQL"}
                    </span>
                    <span className="text-2xs font-mono text-muted-foreground">
                      {formatPrice(lz.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString("en-US", { maximumFractionDigits: 1 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}
