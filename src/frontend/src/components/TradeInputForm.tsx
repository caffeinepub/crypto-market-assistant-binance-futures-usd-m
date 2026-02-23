import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useBinanceMarketData } from '@/hooks/useQueries';

export interface TradeFormData {
  symbol: string;
  leverage: number;
  direction: 'long' | 'short';
  entryPrice: number;
}

interface TradeInputFormProps {
  onSubmit: (data: TradeFormData) => void;
  isSubmitting?: boolean;
}

export default function TradeInputForm({ onSubmit, isSubmitting = false }: TradeInputFormProps) {
  const [symbol, setSymbol] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: marketData, isLoading: isLoadingMarket } = useBinanceMarketData();

  // Generate symbol suggestions
  useEffect(() => {
    if (!symbol || !marketData) {
      setSuggestions([]);
      return;
    }

    const filtered = marketData
      .filter((asset) => asset.symbol.toLowerCase().includes(symbol.toLowerCase()))
      .map((asset) => asset.symbol)
      .slice(0, 10);

    setSuggestions(filtered);
  }, [symbol, marketData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(entryPrice);
    if (isNaN(price) || price <= 0) {
      return;
    }

    // Validate symbol exists in Binance Futures
    const symbolExists = marketData?.some((asset) => asset.symbol === symbol.toUpperCase());
    if (!symbolExists) {
      return;
    }

    onSubmit({
      symbol: symbol.toUpperCase(),
      leverage,
      direction,
      entryPrice: price,
    });

    // Reset form
    setSymbol('');
    setEntryPrice('');
    setLeverage(10);
    setDirection('long');
  };

  const isValid = symbol.trim() !== '' && entryPrice.trim() !== '' && !isNaN(parseFloat(entryPrice)) && parseFloat(entryPrice) > 0;

  return (
    <Card className="border-2 border-neon-purple/30 bg-card/80 backdrop-blur-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symbol Input with Autocomplete */}
          <div className="space-y-2 relative">
            <Label htmlFor="symbol" className="text-sm font-medium">
              Ativo (Símbolo)
            </Label>
            <Input
              id="symbol"
              type="text"
              placeholder="Ex: BTCUSDT"
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="uppercase"
              disabled={isSubmitting}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-neon-cyan/30 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-neon-cyan/10 transition-colors"
                    onClick={() => {
                      setSymbol(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direction Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Direção</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={direction === 'long' ? 'default' : 'outline'}
                className={`h-12 ${
                  direction === 'long'
                    ? 'bg-neon-green/20 border-neon-green text-neon-green hover:bg-neon-green/30'
                    : 'border-neon-green/30 text-neon-green/60 hover:bg-neon-green/10'
                }`}
                onClick={() => setDirection('long')}
                disabled={isSubmitting}
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Long
              </Button>
              <Button
                type="button"
                variant={direction === 'short' ? 'default' : 'outline'}
                className={`h-12 ${
                  direction === 'short'
                    ? 'bg-neon-red/20 border-neon-red text-neon-red hover:bg-neon-red/30'
                    : 'border-neon-red/30 text-neon-red/60 hover:bg-neon-red/10'
                }`}
                onClick={() => setDirection('short')}
                disabled={isSubmitting}
              >
                <TrendingDown className="mr-2 h-5 w-5" />
                Short
              </Button>
            </div>
          </div>

          {/* Leverage Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="leverage" className="text-sm font-medium">
                Alavancagem
              </Label>
              <span className="text-lg font-bold text-neon-purple">{leverage}x</span>
            </div>
            <Slider
              id="leverage"
              min={1}
              max={125}
              step={1}
              value={[leverage]}
              onValueChange={(value) => setLeverage(value[0])}
              disabled={isSubmitting}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1x</span>
              <span>125x</span>
            </div>
          </div>

          {/* Entry Price Input */}
          <div className="space-y-2">
            <Label htmlFor="entryPrice" className="text-sm font-medium">
              Preço de Entrada
            </Label>
            <Input
              id="entryPrice"
              type="number"
              step="0.00000001"
              placeholder="Ex: 50000.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-neon-cyan hover:bg-neon-cyan/80 text-background font-semibold"
            disabled={!isValid || isSubmitting || isLoadingMarket}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Adicionando...
              </>
            ) : (
              'Adicionar Monitoramento'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
