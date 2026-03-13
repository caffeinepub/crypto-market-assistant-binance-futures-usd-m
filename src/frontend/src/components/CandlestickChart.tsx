import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import React, { useEffect, useRef, useMemo } from "react";
import type { BinanceKline } from "../hooks/queries/binanceFetch";
import { TIMEFRAMES, type Timeframe } from "../hooks/useBinanceCandlestickData";
import type { SMCAnalysisResult } from "../lib/smcIndicators";
import type { TechnicalIndicatorsResult } from "../lib/technicalIndicators";

interface CandlestickChartProps {
  candles: BinanceKline[];
  smcAnalysis: SMCAnalysisResult;
  indicators: TechnicalIndicatorsResult | null;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  isLoading: boolean;
  error: Error | null;
  symbol: string;
}

const CHART_PADDING = { top: 20, right: 60, bottom: 30, left: 10 };
const CANDLE_WIDTH_RATIO = 0.7;

// Colors
const BULL_COLOR = "#00ff88";
const BEAR_COLOR = "#ff3366";
const WICK_BULL = "#00cc66";
const WICK_BEAR = "#cc2244";
const GRID_COLOR = "rgba(255,255,255,0.05)";
const TEXT_COLOR = "rgba(255,255,255,0.5)";
const BG_COLOR = "#070b14";

// MA colors
const EMA20_COLOR = "#00aaff";
const EMA50_COLOR = "#ffaa00";
const EMA200_COLOR = "#aa44ff";
const BB_COLOR = "rgba(0,170,255,0.15)";
const BB_LINE_COLOR = "rgba(0,170,255,0.5)";

export default function CandlestickChart({
  candles,
  smcAnalysis,
  indicators,
  timeframe,
  onTimeframeChange,
  isLoading,
  error,
  symbol: _symbol,
}: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleCandles = useMemo(() => candles.slice(-100), [candles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || visibleCandles.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const chartWidth = width - CHART_PADDING.left - CHART_PADDING.right;
    const chartHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;

    // Background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);

    const prices = visibleCandles.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const pricePad = priceRange * 0.05;
    const priceMin = minPrice - pricePad;
    const priceMax = maxPrice + pricePad;
    const priceSpan = priceMax - priceMin;

    const toY = (price: number) =>
      CHART_PADDING.top +
      chartHeight -
      ((price - priceMin) / priceSpan) * chartHeight;

    const candleCount = visibleCandles.length;
    const candleWidth = chartWidth / candleCount;
    const bodyWidth = Math.max(1, candleWidth * CANDLE_WIDTH_RATIO);

    const toX = (index: number) =>
      CHART_PADDING.left + (index + 0.5) * candleWidth;

    // Grid lines
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    const gridLines = 6;
    for (let i = 0; i <= gridLines; i++) {
      const y = CHART_PADDING.top + (i / gridLines) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(CHART_PADDING.left, y);
      ctx.lineTo(width - CHART_PADDING.right, y);
      ctx.stroke();

      const price = priceMax - (i / gridLines) * priceSpan;
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText(formatPrice(price), width - 4, y + 4);
    }

    // SMC: Premium/Discount zones
    if (smcAnalysis.premiumDiscountZone) {
      const pdz = smcAnalysis.premiumDiscountZone;
      // Premium zone (red tint)
      ctx.fillStyle = "rgba(255,51,102,0.06)";
      const premY = toY(pdz.premiumHigh);
      const premH = toY(pdz.premiumLow) - premY;
      ctx.fillRect(CHART_PADDING.left, premY, chartWidth, premH);

      // Discount zone (green tint)
      ctx.fillStyle = "rgba(0,255,136,0.06)";
      const discY = toY(pdz.discountHigh);
      const discH = toY(pdz.discountLow) - discY;
      ctx.fillRect(CHART_PADDING.left, discY, chartWidth, discH);

      // Equilibrium line
      ctx.strokeStyle = "rgba(255,170,0,0.4)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CHART_PADDING.left, toY(pdz.equilibrium));
      ctx.lineTo(width - CHART_PADDING.right, toY(pdz.equilibrium));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // SMC: Fair Value Gaps
    for (const fvg of smcAnalysis.fairValueGaps) {
      if (fvg.filled) continue;
      const fvgIdx =
        fvg.index -
        (visibleCandles.length > 0
          ? candles.length - visibleCandles.length
          : 0);
      if (fvgIdx < 0 || fvgIdx >= visibleCandles.length) continue;
      ctx.fillStyle =
        fvg.type === "bullish"
          ? "rgba(0,170,255,0.15)"
          : "rgba(255,170,0,0.15)";
      const fvgY = toY(fvg.high);
      const fvgH = toY(fvg.low) - fvgY;
      ctx.fillRect(CHART_PADDING.left, fvgY, chartWidth, Math.max(2, fvgH));
    }

    // SMC: Order Blocks
    for (const ob of smcAnalysis.orderBlocks) {
      if (ob.mitigated) continue;
      const obIdx = ob.index - (candles.length - visibleCandles.length);
      if (obIdx < 0 || obIdx >= visibleCandles.length) continue;
      ctx.fillStyle =
        ob.type === "bullish"
          ? "rgba(0,255,136,0.15)"
          : "rgba(255,51,102,0.15)";
      ctx.strokeStyle =
        ob.type === "bullish" ? "rgba(0,255,136,0.4)" : "rgba(255,51,102,0.4)";
      ctx.lineWidth = 1;
      const obY = toY(ob.high);
      const obH = toY(ob.low) - obY;
      ctx.fillRect(CHART_PADDING.left, obY, chartWidth, Math.max(2, obH));
      ctx.strokeRect(CHART_PADDING.left, obY, chartWidth, Math.max(2, obH));
    }

    // SMC: Liquidity zones (dashed horizontal lines)
    for (const lz of smcAnalysis.liquidityZones) {
      if (lz.swept) continue;
      const lzY = toY(lz.price);
      if (lzY < CHART_PADDING.top || lzY > height - CHART_PADDING.bottom)
        continue;
      ctx.strokeStyle = lz.type.includes("high")
        ? "rgba(255,51,102,0.5)"
        : "rgba(0,255,136,0.5)";
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CHART_PADDING.left, lzY);
      ctx.lineTo(width - CHART_PADDING.right, lzY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Bollinger Bands
    if (indicators?.bollingerBands) {
      const bb = indicators.bollingerBands;
      const offset = candles.length - visibleCandles.length;

      // Fill between upper and lower
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleCandles.length; i++) {
        const realIdx = i + offset;
        const u = bb.upper[realIdx];
        if (u === null) continue;
        const x = toX(i);
        const y = toY(u);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      }
      for (let i = visibleCandles.length - 1; i >= 0; i--) {
        const realIdx = i + offset;
        const l = bb.lower[realIdx];
        if (l === null) continue;
        ctx.lineTo(toX(i), toY(l));
      }
      ctx.closePath();
      ctx.fillStyle = BB_COLOR;
      ctx.fill();

      // Upper band
      ctx.beginPath();
      started = false;
      for (let i = 0; i < visibleCandles.length; i++) {
        const realIdx = i + offset;
        const u = bb.upper[realIdx];
        if (u === null) continue;
        const x = toX(i);
        if (!started) {
          ctx.moveTo(x, toY(u));
          started = true;
        } else ctx.lineTo(x, toY(u));
      }
      ctx.strokeStyle = BB_LINE_COLOR;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Lower band
      ctx.beginPath();
      started = false;
      for (let i = 0; i < visibleCandles.length; i++) {
        const realIdx = i + offset;
        const l = bb.lower[realIdx];
        if (l === null) continue;
        const x = toX(i);
        if (!started) {
          ctx.moveTo(x, toY(l));
          started = true;
        } else ctx.lineTo(x, toY(l));
      }
      ctx.stroke();
    }

    // Moving Averages
    if (indicators?.movingAverages) {
      const mas = indicators.movingAverages;
      const offset = candles.length - visibleCandles.length;

      const drawMA = (
        values: (number | null)[],
        color: string,
        width: number,
      ) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        let started = false;
        for (let i = 0; i < visibleCandles.length; i++) {
          const v = values[i + offset];
          if (v === null) continue;
          const x = toX(i);
          const y = toY(v);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      drawMA(mas.ema200, EMA200_COLOR, 1.5);
      drawMA(mas.ema50, EMA50_COLOR, 1.5);
      drawMA(mas.ema20, EMA20_COLOR, 1.5);
    }

    // Candles
    for (let i = 0; i < visibleCandles.length; i++) {
      const c = visibleCandles[i];
      const x = toX(i);
      const isBull = c.close >= c.open;
      const color = isBull ? BULL_COLOR : BEAR_COLOR;
      const wickColor = isBull ? WICK_BULL : WICK_BEAR;

      // Wick
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, toY(c.high));
      ctx.lineTo(x, toY(c.low));
      ctx.stroke();

      // Body
      const bodyTop = toY(Math.max(c.open, c.close));
      const bodyBottom = toY(Math.min(c.open, c.close));
      const bodyH = Math.max(1, bodyBottom - bodyTop);
      ctx.fillStyle = color;
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyH);
    }

    // SMC: BOS/CHoCH labels
    for (const sp of smcAnalysis.structurePoints) {
      const spIdx = sp.index - (candles.length - visibleCandles.length);
      if (spIdx < 0 || spIdx >= visibleCandles.length) continue;
      const x = toX(spIdx);
      const y = toY(sp.price);
      const isBull = sp.direction === "bullish";
      ctx.fillStyle = isBull ? BULL_COLOR : BEAR_COLOR;
      ctx.font = "bold 9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(sp.type, x, isBull ? y + 14 : y - 6);
    }

    // Current price line
    if (visibleCandles.length > 0) {
      const lastPrice = visibleCandles[visibleCandles.length - 1].close;
      const priceY = toY(lastPrice);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CHART_PADDING.left, priceY);
      ctx.lineTo(width - CHART_PADDING.right, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price label
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 10px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText(formatPrice(lastPrice), width - 2, priceY - 2);
    }

    // Time labels
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.floor(candleCount / 6));
    for (let i = 0; i < visibleCandles.length; i += labelStep) {
      const c = visibleCandles[i];
      const x = toX(i);
      const date = new Date(c.time * 1000);
      const label = formatTimeLabel(date, timeframe);
      ctx.fillText(label, x, height - 4);
    }
  }, [visibleCandles, smcAnalysis, indicators, candles, timeframe]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4 h-full">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="flex-1" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-destructive">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-mono">
          Erro ao carregar dados do gráfico
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Timeframe selector */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono mr-2">
          TF:
        </span>
        {TIMEFRAMES.map((tf) => (
          <button
            type="button"
            key={tf.value}
            onClick={() => onTimeframeChange(tf.value)}
            className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
              timeframe === tf.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {tf.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-2xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-0.5 inline-block"
              style={{ background: EMA20_COLOR }}
            />
            EMA20
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-0.5 inline-block"
              style={{ background: EMA50_COLOR }}
            />
            EMA50
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-0.5 inline-block"
              style={{ background: EMA200_COLOR }}
            />
            EMA200
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-0.5 inline-block"
              style={{ background: BB_LINE_COLOR }}
            />
            BB
          </span>
        </div>
      </div>

      {/* Chart canvas */}
      <div ref={containerRef} className="flex-1 relative min-h-0">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString("en-US", { maximumFractionDigits: 1 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatTimeLabel(date: Date, timeframe: Timeframe): string {
  if (timeframe === "1d") {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  if (timeframe === "1h" || timeframe === "4h") {
    return `${date.getHours().toString().padStart(2, "0")}:00`;
  }
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}
