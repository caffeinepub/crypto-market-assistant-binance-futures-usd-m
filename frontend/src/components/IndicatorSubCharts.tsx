import React, { useEffect, useRef } from 'react';
import type { TechnicalIndicatorsResult } from '../lib/technicalIndicators';
import type { BinanceKline } from '../hooks/queries/binanceFetch';

interface IndicatorSubChartsProps {
  candles: BinanceKline[];
  indicators: TechnicalIndicatorsResult;
}

const BG = '#070b14';
const GRID = 'rgba(255,255,255,0.05)';
const TEXT = 'rgba(255,255,255,0.5)';
const RSI_COLOR = '#aa44ff';
const MACD_COLOR = '#00aaff';
const SIGNAL_COLOR = '#ffaa00';
const HIST_BULL = '#00ff88';
const HIST_BEAR = '#ff3366';

export default function IndicatorSubCharts({ candles, indicators }: IndicatorSubChartsProps) {
  const rsiRef = useRef<HTMLCanvasElement>(null);
  const macdRef = useRef<HTMLCanvasElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);

  const visibleCount = Math.min(100, candles.length);
  const offset = candles.length - visibleCount;

  useEffect(() => {
    const canvas = rsiRef.current;
    const container = rsiContainerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    const pad = { top: 4, right: 40, bottom: 16, left: 4 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    // Grid
    [30, 50, 70].forEach(level => {
      const y = pad.top + ch - ((level - 0) / 100) * ch;
      ctx.strokeStyle = level === 50 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)';
      ctx.setLineDash(level !== 50 ? [3, 3] : []);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = TEXT;
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(level), w - 2, y + 3);
    });

    // RSI line
    const rsiValues = indicators.rsi.values;
    ctx.beginPath();
    ctx.strokeStyle = RSI_COLOR;
    ctx.lineWidth = 1.5;
    let started = false;
    for (let i = 0; i < visibleCount; i++) {
      const v = rsiValues[i + offset];
      if (v === null) continue;
      const x = pad.left + ((i + 0.5) / visibleCount) * cw;
      const y = pad.top + ch - (v / 100) * ch;
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Label
    ctx.fillStyle = RSI_COLOR;
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('RSI(14)', pad.left + 2, pad.top + 10);

    const currentRSI = indicators.rsi.current;
    if (currentRSI !== null) {
      ctx.fillStyle = currentRSI >= 70 ? HIST_BEAR : currentRSI <= 30 ? HIST_BULL : TEXT;
      ctx.textAlign = 'right';
      ctx.fillText(currentRSI.toFixed(1), w - 2, pad.top + 10);
    }
  }, [candles, indicators, visibleCount, offset]);

  useEffect(() => {
    const canvas = macdRef.current;
    const container = macdContainerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    const pad = { top: 4, right: 40, bottom: 16, left: 4 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const histValues = indicators.macd.histogram.slice(offset, offset + visibleCount);
    const macdValues = indicators.macd.macd.slice(offset, offset + visibleCount);
    const signalValues = indicators.macd.signal.slice(offset, offset + visibleCount);

    const allVals = [...histValues, ...macdValues, ...signalValues].filter(v => v !== null) as number[];
    if (allVals.length === 0) return;

    const minV = Math.min(...allVals);
    const maxV = Math.max(...allVals);
    const span = maxV - minV || 1;
    const toY = (v: number) => pad.top + ch - ((v - minV) / span) * ch;

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, toY(0));
    ctx.lineTo(w - pad.right, toY(0));
    ctx.stroke();

    // Histogram bars
    const barW = Math.max(1, (cw / visibleCount) * 0.7);
    for (let i = 0; i < visibleCount; i++) {
      const v = histValues[i];
      if (v === null) continue;
      const x = pad.left + ((i + 0.5) / visibleCount) * cw;
      const zeroY = toY(0);
      const valY = toY(v);
      ctx.fillStyle = v >= 0 ? HIST_BULL : HIST_BEAR;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x - barW / 2, Math.min(zeroY, valY), barW, Math.abs(zeroY - valY));
      ctx.globalAlpha = 1;
    }

    // MACD line
    ctx.beginPath();
    ctx.strokeStyle = MACD_COLOR;
    ctx.lineWidth = 1.5;
    let started = false;
    for (let i = 0; i < visibleCount; i++) {
      const v = macdValues[i];
      if (v === null) continue;
      const x = pad.left + ((i + 0.5) / visibleCount) * cw;
      if (!started) { ctx.moveTo(x, toY(v)); started = true; }
      else ctx.lineTo(x, toY(v));
    }
    ctx.stroke();

    // Signal line
    ctx.beginPath();
    ctx.strokeStyle = SIGNAL_COLOR;
    ctx.lineWidth = 1.5;
    started = false;
    for (let i = 0; i < visibleCount; i++) {
      const v = signalValues[i];
      if (v === null) continue;
      const x = pad.left + ((i + 0.5) / visibleCount) * cw;
      if (!started) { ctx.moveTo(x, toY(v)); started = true; }
      else ctx.lineTo(x, toY(v));
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = MACD_COLOR;
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MACD', pad.left + 2, pad.top + 10);

    const curr = indicators.macd.current;
    if (curr.macd !== null) {
      ctx.fillStyle = (curr.macd ?? 0) >= 0 ? HIST_BULL : HIST_BEAR;
      ctx.textAlign = 'right';
      ctx.fillText(curr.macd.toFixed(4), w - 2, pad.top + 10);
    }
  }, [candles, indicators, visibleCount, offset]);

  return (
    <div className="flex flex-col gap-0 border-t border-border">
      <div ref={rsiContainerRef} className="h-16 w-full">
        <canvas ref={rsiRef} className="w-full h-full" />
      </div>
      <div ref={macdContainerRef} className="h-20 w-full border-t border-border">
        <canvas ref={macdRef} className="w-full h-full" />
      </div>
    </div>
  );
}
