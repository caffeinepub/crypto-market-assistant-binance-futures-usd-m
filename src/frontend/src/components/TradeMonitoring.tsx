import { useState } from 'react';
import { Activity } from 'lucide-react';
import TabPageCard from './TabPageCard';
import TradeInputForm, { TradeFormData } from './TradeInputForm';
import MonitoredTradeCard from './MonitoredTradeCard';
import TradeMonitoringPanel from './TradeMonitoringPanel';
import { useMonitoredTrades } from '@/hooks/useMonitoredTrades';
import { toast } from 'sonner';

export default function TradeMonitoring() {
  const { trades, isLoading, addTrade, removeTrade, isAddingTrade } = useMonitoredTrades();
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);

  const handleAddTrade = async (data: TradeFormData) => {
    try {
      await addTrade({
        symbol: data.symbol,
        leverage: data.leverage,
        direction: data.direction,
        entryPrice: data.entryPrice,
        entryTimestamp: Date.now(),
      });
      toast.success('Trade adicionado ao monitoramento!');
    } catch (error) {
      console.error('Error adding trade:', error);
      toast.error('Erro ao adicionar trade');
    }
  };

  const handleRemoveTrade = async (id: string) => {
    try {
      await removeTrade(id);
      if (selectedTradeId === id) {
        setSelectedTradeId(null);
      }
      toast.success('Trade removido do monitoramento');
    } catch (error) {
      console.error('Error removing trade:', error);
      toast.error('Erro ao remover trade');
    }
  };

  const selectedTrade = trades.find((t) => t.id === selectedTradeId);

  return (
    <TabPageCard
      icon={<Activity className="h-8 w-8 text-neon-purple" />}
      title="Trade Monitoring"
      description="Monitore suas posições manualmente com análise em tempo real"
    >
      <div className="space-y-6">
        {/* Trade Input Form */}
        <TradeInputForm onSubmit={handleAddTrade} isSubmitting={isAddingTrade} />

        {/* Trade List and Details */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando trades...</div>
        ) : trades.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum trade em monitoramento</p>
            <p className="text-sm mt-1">Adicione um trade acima para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trade Cards List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-neon-cyan">Trades Ativos ({trades.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {trades.map((trade) => (
                  <MonitoredTradeCard
                    key={trade.id}
                    trade={trade}
                    onSelect={() => setSelectedTradeId(trade.id)}
                    onRemove={() => handleRemoveTrade(trade.id)}
                    isSelected={selectedTradeId === trade.id}
                  />
                ))}
              </div>
            </div>

            {/* Trade Details Panel */}
            <div>
              {selectedTrade ? (
                <TradeMonitoringPanel trade={selectedTrade} />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Selecione um trade para ver detalhes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TabPageCard>
  );
}
