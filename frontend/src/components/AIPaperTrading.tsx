import React, { useState } from 'react';
import { Bot, Activity, Zap, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import TabPageCard from './TabPageCard';
import PaperTradeCard from './PaperTradeCard';
import AIPaperTradingStatsPanel from './AIPaperTradingStatsPanel';
import PaperTradeHistoryView from './PaperTradeHistoryView';
import { useAIPaperTrades } from '../hooks/useAIPaperTrades';
import { useAIPaperTradingEngine } from '../hooks/useAIPaperTradingEngine';
import { TradingModality } from '../lib/paperTradeStorage';

const MODALITIES: { key: TradingModality | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'scalping', label: 'Scalping' },
  { key: 'swing', label: 'Swing' },
  { key: 'breakout', label: 'Breakout' },
  { key: 'reversal', label: 'Reversal' },
  { key: 'smc', label: 'SMC' },
  { key: 'fvg', label: 'FVG' },
];

export default function AIPaperTrading() {
  const [activeModality, setActiveModality] = useState<TradingModality | 'all'>('all');
  const [showHistory, setShowHistory] = useState(false);
  const { isRunning } = useAIPaperTradingEngine();
  const { trades, allTrades, isLoading, refetch } = useAIPaperTrades(
    activeModality === 'all' ? undefined : activeModality
  );

  if (showHistory) {
    return (
      <TabPageCard
        icon={<Bot className="w-5 h-5" />}
        title="AI Paper Trading"
        description="Simulated trades across all Binance USD-M perpetual pairs"
      >
        <PaperTradeHistoryView onBack={() => setShowHistory(false)} />
      </TabPageCard>
    );
  }

  return (
    <TabPageCard
      icon={<Bot className="w-5 h-5" />}
      title="AI Paper Trading"
      description="Simulated trades across all Binance USD-M perpetual pairs"
      badge={
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${
            isRunning
              ? 'bg-neon-green/10 text-neon-green border-neon-green/30'
              : 'bg-muted/20 text-muted-foreground border-border/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-neon-green animate-pulse' : 'bg-muted-foreground'}`} />
            {isRunning ? 'Engine Running' : 'Engine Stopped'}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Stats Panel */}
        <AIPaperTradingStatsPanel />

        {/* View History Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Open Positions</span>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {allTrades.length} / 6 active
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-xs text-muted-foreground h-7 px-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="text-xs h-7"
            >
              View History
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2">
          <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-400/80">
            <strong>Simulated Paper Trades Only.</strong> All positions are fictitious using real market data. Not financial advice. Use trade signals as reference only.
          </p>
        </div>

        {/* Modality Filter Tabs */}
        <Tabs value={activeModality} onValueChange={(v) => setActiveModality(v as TradingModality | 'all')}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/20 p-1">
            {MODALITIES.map(({ key, label }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-xs px-3 py-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                {label}
                {key !== 'all' && (
                  <span className="ml-1 text-muted-foreground">
                    ({allTrades.filter(t => t.modality === key).length})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {MODALITIES.map(({ key }) => (
            <TabsContent key={key} value={key} className="mt-4">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 rounded-xl bg-muted/20 animate-pulse border border-border/40" />
                  ))}
                </div>
              ) : trades.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No open positions</p>
                  <p className="text-xs mt-1">
                    {isRunning
                      ? 'The AI engine is selecting the best opportunities...'
                      : 'Start the engine to begin paper trading.'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
                    {trades.map(trade => (
                      <PaperTradeCard key={trade.id} trade={trade} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </TabPageCard>
  );
}
