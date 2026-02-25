import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePaperTradeHistory } from '../hooks/usePaperTradeHistory';
import { TradingModality, ClosedPaperTrade } from '../lib/paperTradeStorage';

interface PaperTradeHistoryViewProps {
  onBack: () => void;
}

const MODALITY_LABELS: Record<TradingModality, string> = {
  scalping: 'Scalping',
  swing: 'Swing',
  breakout: 'Breakout',
  reversal: 'Reversal',
  smc: 'SMC',
  fvg: 'FVG',
};

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatDuration(openedAt: number, closedAt: number): string {
  const ms = closedAt - openedAt;
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}

export default function PaperTradeHistoryView({ onBack }: PaperTradeHistoryViewProps) {
  const { closedTrades, isLoadingHistory } = usePaperTradeHistory();
  const [modalityFilter, setModalityFilter] = useState<TradingModality | 'all'>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'Long' | 'Short'>('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const filtered = closedTrades
    .filter(t => modalityFilter === 'all' || t.modality === modalityFilter)
    .filter(t => directionFilter === 'all' || t.direction === directionFilter)
    .sort((a, b) => b.closedAt - a.closedAt);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h2 className="text-base font-semibold text-foreground">Trade History</h2>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {filtered.length} trades
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Modality:</span>
        </div>
        {(['all', 'scalping', 'swing', 'breakout', 'reversal', 'smc', 'fvg'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setModalityFilter(m); setPage(0); }}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              modalityFilter === m
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-muted/20 text-muted-foreground border-border/40 hover:border-primary/30'
            }`}
          >
            {m === 'all' ? 'All' : MODALITY_LABELS[m]}
          </button>
        ))}
        <div className="flex items-center gap-1 ml-2">
          {(['all', 'Long', 'Short'] as const).map(d => (
            <button
              key={d}
              onClick={() => { setDirectionFilter(d); setPage(0); }}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                directionFilter === d
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-muted/20 text-muted-foreground border-border/40 hover:border-primary/30'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoadingHistory ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/20 rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No closed trades yet.</p>
          <p className="text-xs mt-1">The AI engine will close trades when TP or SL is hit.</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-1.5 pr-2">
            {paginated.map((trade: ClosedPaperTrade) => (
              <div
                key={trade.id}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  trade.pnlPercent >= 0
                    ? 'border-neon-green/20 bg-neon-green/5'
                    : 'border-neon-red/20 bg-neon-red/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-foreground truncate">{trade.symbol}</span>
                    <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground border-muted/40">
                      {MODALITY_LABELS[trade.modality]}
                    </Badge>
                    <span className={`font-medium shrink-0 ${trade.direction === 'Long' ? 'text-neon-green' : 'text-neon-red'}`}>
                      {trade.direction === 'Long' ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                      {' '}{trade.direction}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs ${trade.exitReason === 'SL' ? 'text-neon-red border-neon-red/40 bg-neon-red/10' : 'text-neon-green border-neon-green/40 bg-neon-green/10'}`}
                    >
                      {trade.exitReason}
                    </Badge>
                    <span className={`font-mono font-bold ${trade.pnlPercent >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                  <span>Entry: <span className="font-mono text-foreground">${formatPrice(trade.entryPrice)}</span></span>
                  <span>Exit: <span className="font-mono text-foreground">${formatPrice(trade.exitPrice)}</span></span>
                  <span>Duration: {formatDuration(trade.openedAt, trade.closedAt)}</span>
                  <span className="ml-auto">{formatDate(trade.closedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
            Prev
          </Button>
          <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
