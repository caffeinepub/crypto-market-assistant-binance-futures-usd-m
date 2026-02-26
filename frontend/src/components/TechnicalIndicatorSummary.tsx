import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { TechnicalIndicatorsResult } from '../lib/technicalIndicators';

interface TechnicalIndicatorSummaryProps {
  indicators: TechnicalIndicatorsResult;
  currentPrice?: number;
}

export default function TechnicalIndicatorSummary({ indicators, currentPrice }: TechnicalIndicatorSummaryProps) {
  const { rsi, macd, movingAverages, bollingerBands } = indicators;

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border bg-card">
      {/* RSI */}
      <div className="flex items-center gap-1.5">
        <span className="text-2xs font-mono text-muted-foreground">RSI</span>
        <span className={`text-xs font-mono font-bold ${
          rsi.signal === 'overbought' ? 'text-[var(--trading-red)]' :
          rsi.signal === 'oversold' ? 'text-[var(--trading-green)]' :
          'text-foreground'
        }`}>
          {rsi.current?.toFixed(1) ?? '--'}
        </span>
        {rsi.signal !== 'neutral' && (
          <Badge
            variant="outline"
            className={`text-2xs h-4 px-1 ${
              rsi.signal === 'overbought'
                ? 'border-[var(--trading-red)] text-[var(--trading-red)]'
                : 'border-[var(--trading-green)] text-[var(--trading-green)]'
            }`}
          >
            {rsi.signal === 'overbought' ? 'OB' : 'OS'}
          </Badge>
        )}
      </div>

      <div className="w-px h-4 bg-border" />

      {/* MACD */}
      <div className="flex items-center gap-1.5">
        <span className="text-2xs font-mono text-muted-foreground">MACD</span>
        <span className={`text-xs font-mono font-bold ${
          (macd.current.macd ?? 0) >= 0 ? 'text-[var(--trading-green)]' : 'text-[var(--trading-red)]'
        }`}>
          {macd.current.macd?.toFixed(4) ?? '--'}
        </span>
        {macd.crossover !== 'none' && (
          <Badge
            variant="outline"
            className={`text-2xs h-4 px-1 ${
              macd.crossover === 'bullish'
                ? 'border-[var(--trading-green)] text-[var(--trading-green)]'
                : 'border-[var(--trading-red)] text-[var(--trading-red)]'
            }`}
          >
            {macd.crossover === 'bullish' ? '↑X' : '↓X'}
          </Badge>
        )}
      </div>

      <div className="w-px h-4 bg-border" />

      {/* MA Alignment */}
      <div className="flex items-center gap-1.5">
        <span className="text-2xs font-mono text-muted-foreground">MAs</span>
        <Badge
          variant="outline"
          className={`text-2xs h-4 px-1 ${
            movingAverages.alignment === 'bullish'
              ? 'border-[var(--trading-green)] text-[var(--trading-green)]'
              : movingAverages.alignment === 'bearish'
              ? 'border-[var(--trading-red)] text-[var(--trading-red)]'
              : 'border-[var(--trading-amber)] text-[var(--trading-amber)]'
          }`}
        >
          {movingAverages.alignment === 'bullish' ? '▲ ALTA' : movingAverages.alignment === 'bearish' ? '▼ BAIXA' : '~ MISTO'}
        </Badge>
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Bollinger Bands */}
      <div className="flex items-center gap-1.5">
        <span className="text-2xs font-mono text-muted-foreground">BB</span>
        <Badge
          variant="outline"
          className={`text-2xs h-4 px-1 ${
            bollingerBands.current.position === 'upper'
              ? 'border-[var(--trading-red)] text-[var(--trading-red)]'
              : bollingerBands.current.position === 'lower'
              ? 'border-[var(--trading-green)] text-[var(--trading-green)]'
              : 'border-[var(--trading-amber)] text-[var(--trading-amber)]'
          }`}
        >
          {bollingerBands.current.position === 'upper' ? 'TOPO' :
           bollingerBands.current.position === 'lower' ? 'BASE' : 'MEIO'}
        </Badge>
      </div>

      {/* EMA values */}
      {movingAverages.current.ema20 && currentPrice && (
        <>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-2xs font-mono" style={{ color: '#00aaff' }}>EMA20</span>
            <span className={`text-2xs font-mono ${currentPrice > movingAverages.current.ema20 ? 'text-[var(--trading-green)]' : 'text-[var(--trading-red)]'}`}>
              {formatPrice(movingAverages.current.ema20)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 1 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}
