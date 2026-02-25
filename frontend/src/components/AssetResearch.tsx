import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Activity, Zap, Search, AlertCircle, Loader2 } from 'lucide-react';
import { useBinanceMarketData, useSearchBinanceAsset } from '@/hooks/useQueries';
import PredictiveConfidencePanel from './PredictiveConfidencePanel';
import { cn } from '@/lib/utils';

export default function AssetResearch() {
  const { data: marketData, isLoading: isLoadingMarket } = useBinanceMarketData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ICPUSDT');
  const [allSymbols, setAllSymbols] = useState<string[]>([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(false);

  // Fetch searched asset data
  const { data: searchedAsset, isLoading: isLoadingSearch, refetch: refetchAsset } = useSearchBinanceAsset(selectedSymbol);

  // Fetch all available Binance Futures USD-M symbols on mount
  useEffect(() => {
    const fetchAllSymbols = async () => {
      setIsLoadingSymbols(true);
      try {
        const response = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo');
        if (response.ok) {
          const data = await response.json();
          const usdtSymbols = data.symbols
            .filter((s: any) => s.symbol.endsWith('USDT') && s.status === 'TRADING')
            .map((s: any) => s.symbol)
            .sort();
          setAllSymbols(usdtSymbols);
        }
      } catch (error) {
        console.error('Error fetching Binance symbols:', error);
        // Fallback to cached symbols if API fails
        if (marketData) {
          setAllSymbols(marketData.map(m => m.symbol).sort());
        }
      } finally {
        setIsLoadingSymbols(false);
      }
    };

    fetchAllSymbols();
  }, [marketData]);

  // Filter symbols based on search term with autocomplete
  const filteredSymbols = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toUpperCase();
    return allSymbols
      .filter(symbol => symbol.includes(term))
      .slice(0, 20); // Limit to 20 suggestions
  }, [searchTerm, allSymbols]);

  const handleSearch = () => {
    if (filteredSymbols.length > 0) {
      setSelectedSymbol(filteredSymbols[0]);
      setSearchTerm('');
      refetchAsset();
    } else if (searchTerm.toUpperCase().endsWith('USDT')) {
      // Try direct search if user typed full symbol
      setSelectedSymbol(searchTerm.toUpperCase());
      setSearchTerm('');
      refetchAsset();
    }
  };

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    setSearchTerm('');
    refetchAsset();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Use searched asset if available, otherwise fall back to cached data
  const selectedAsset = searchedAsset || marketData?.find((m) => m.symbol === selectedSymbol);

  const isLoading = isLoadingMarket || isLoadingSearch || isLoadingSymbols;

  if (isLoading && !selectedAsset) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedAsset) {
    return (
      <Card className="border-2 border-border bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Pesquisa de Ativos</CardTitle>
          <CardDescription>Selecione um ativo para análise detalhada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-neon-orange" />
            <p className="text-muted-foreground">Dados não disponíveis no momento. Tente outro símbolo.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = selectedAsset.priceChangePercent >= 0;
  const hasManipulationZones = selectedAsset.analysis.manipulationZones.length > 0;
  const hasInstitutionalOrders = selectedAsset.analysis.institutionalOrders.length > 0;

  // Determine scenario based on analysis
  const getScenario = () => {
    const { trend, strength, confidence } = selectedAsset.analysis;
    
    if (trend === 'bullish' && strength > 70 && confidence > 0.7) {
      return { text: 'Alta Provável', color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/40' };
    } else if (trend === 'bearish' && strength > 70 && confidence > 0.7) {
      return { text: 'Queda Técnica', color: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/40' };
    } else if (strength < 40 || confidence < 0.4) {
      return { text: 'Consolidação', color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/40' };
    } else if (trend === 'bullish') {
      return { text: 'Tendência de Alta Moderada', color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/40' };
    } else {
      return { text: 'Tendência de Baixa Moderada', color: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/40' };
    }
  };

  const scenario = getScenario();

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="border-2 border-neon-cyan/40 bg-card/60 backdrop-blur-sm shadow-neon-md">
        <CardHeader>
          <CardTitle className="text-2xl text-neon-cyan flex items-center gap-2">
            <Search className="w-6 h-6" />
            Pesquisa Universal de Ativos
          </CardTitle>
          <CardDescription className="text-base">
            Busque e analise qualquer par Binance Futures USD-M em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Digite o símbolo (ex: BTCUSDT, ETHUSDT, SOLUSDT)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 text-base border-2 border-neon-cyan/40 focus:border-neon-cyan pr-10"
                />
                {isLoadingSymbols && (
                  <Loader2 className="absolute right-3 top-3 w-6 h-6 text-neon-cyan animate-spin" />
                )}
              </div>
              <Button
                onClick={handleSearch}
                disabled={!searchTerm && filteredSymbols.length === 0}
                className="h-12 px-6 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border-2 border-neon-cyan/60 shadow-neon-md"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </Button>
            </div>

            {/* Autocomplete suggestions */}
            {searchTerm && filteredSymbols.length > 0 && (
              <div className="p-3 rounded-lg bg-card/80 border-2 border-neon-cyan/30">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Sugestões ({filteredSymbols.length} encontrados):
                </p>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {filteredSymbols.map((symbol) => (
                    <Button
                      key={symbol}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSymbolSelect(symbol)}
                      className="border-neon-cyan/40 hover:bg-neon-cyan/20 hover:text-neon-cyan text-xs"
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Current selection */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Ativo selecionado:</span>
              <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60 font-bold">
                {selectedSymbol}
              </Badge>
              <span className="text-xs">
                ({allSymbols.length} pares disponíveis)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Analysis */}
      {isLoadingSearch ? (
        <Card className="border-2 border-border bg-card/60 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-neon-cyan animate-spin" />
              <p className="text-muted-foreground">Analisando {selectedSymbol}...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={cn(
          "border-2 bg-gradient-to-br from-card/80 backdrop-blur-sm transition-all duration-300",
          isPositive 
            ? "to-neon-green/10 border-neon-green/40 shadow-neon-bullish" 
            : "to-neon-red/10 border-neon-red/40 shadow-neon-bearish"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className={cn(
                  "text-3xl font-bold mb-2",
                  isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
                )}>
                  {selectedSymbol}
                </CardTitle>
                <CardDescription className="text-base font-medium">
                  Análise Detalhada com Inteligência Preditiva - Binance Futures USD-M
                </CardDescription>
              </div>
              <Badge
                variant={isPositive ? 'default' : 'destructive'}
                className={cn(
                  "text-2xl px-8 py-4 border-2 font-bold",
                  isPositive 
                    ? "bg-neon-green/20 text-neon-green border-neon-green/60 shadow-neon-bullish" 
                    : "bg-neon-red/20 text-neon-red border-neon-red/60 shadow-neon-bearish"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-7 h-7 mr-2" />
                ) : (
                  <TrendingDown className="w-7 h-7 mr-2" />
                )}
                {selectedAsset.priceChangePercent.toFixed(2)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Interpretation Panel */}
            <Card className={cn(
              "border-2 mb-6 shadow-neon-md",
              scenario.border,
              scenario.bg
            )}>
              <CardHeader>
                <CardTitle className={cn("text-xl", scenario.color)}>
                  Interpretação da Condição Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-card/60 border-2 border-border">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">Direção da Tendência</p>
                    <div className="flex items-center gap-2">
                      {selectedAsset.analysis.trend === 'bullish' ? (
                        <>
                          <TrendingUp className="w-6 h-6 text-neon-green" />
                          <span className="text-xl font-bold text-neon-green">Bullish (Alta)</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-6 h-6 text-neon-red" />
                          <span className="text-xl font-bold text-neon-red">Bearish (Baixa)</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-card/60 border-2 border-border">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">Confiança Preditiva</p>
                    <div className="flex items-center gap-2">
                      <Zap className="w-6 h-6 text-neon-cyan" />
                      <span className="text-xl font-bold text-neon-cyan">
                        {(selectedAsset.analysis.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-card/60 border-2 border-border">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">Cenário Futuro</p>
                    <span className={cn("text-lg font-bold", scenario.color)}>
                      {scenario.text}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-card/60 border-2 border-border">
                  <h4 className="text-sm font-bold mb-3 text-muted-foreground">Eventos Detectados</h4>
                  <div className="space-y-2">
                    {hasManipulationZones && (
                      <div className="flex items-start gap-2">
                        <img 
                          src="/assets/generated/manipulation-zone-icon-transparent.dim_48x48.png" 
                          alt="Zona de Manipulação" 
                          className="w-5 h-5 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-bold text-neon-orange">
                            Zonas de Manipulação Detectadas ({selectedAsset.analysis.manipulationZones.length})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Áreas de liquidez onde instituições podem estar acumulando ou distribuindo posições
                          </p>
                        </div>
                      </div>
                    )}
                    {hasInstitutionalOrders && (
                      <div className="flex items-start gap-2">
                        <img 
                          src="/assets/generated/institutional-order-icon-transparent.dim_48x48.png" 
                          alt="Ordem Institucional" 
                          className="w-5 h-5 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-bold text-neon-purple">
                            Ordens Institucionais Detectadas ({selectedAsset.analysis.institutionalOrders.length})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Movimentos de grande volume indicando atividade de smart money
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedAsset.analysis.learningLevel && selectedAsset.analysis.learningLevel > 0.5 && (
                      <div className="flex items-start gap-2">
                        <img 
                          src="/assets/generated/learning-brain-icon-transparent.dim_64x64.png" 
                          alt="IA Avançada" 
                          className="w-5 h-5 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-bold text-neon-blue">
                            IA com Alto Nível de Aprendizado ({(selectedAsset.analysis.learningLevel * 100).toFixed(0)}%)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sistema desenvolveu padrões consistentes de predição para este ativo
                          </p>
                        </div>
                      </div>
                    )}
                    {!hasManipulationZones && !hasInstitutionalOrders && (
                      <p className="text-sm text-muted-foreground">
                        Nenhum evento especial detectado no momento. Mercado operando em condições normais.
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-card/60 border-2 border-border">
                  <h4 className="text-sm font-bold mb-3 text-muted-foreground">Possibilidades de Cenários Futuros</h4>
                  <div className="space-y-2">
                    {selectedAsset.analysis.trend === 'bullish' && selectedAsset.analysis.strength > 70 && (
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-5 h-5 text-neon-green mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-neon-green">Alta Provável</p>
                          <p className="text-xs text-muted-foreground">
                            Forte momentum de alta com alta confiança. Possível continuação do movimento ascendente.
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedAsset.analysis.trend === 'bearish' && selectedAsset.analysis.strength > 70 && (
                      <div className="flex items-start gap-2">
                        <TrendingDown className="w-5 h-5 text-neon-red mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-neon-red">Queda Técnica</p>
                          <p className="text-xs text-muted-foreground">
                            Forte pressão vendedora com alta confiança. Possível continuação do movimento descendente.
                          </p>
                        </div>
                      </div>
                    )}
                    {(selectedAsset.analysis.strength < 40 || selectedAsset.analysis.confidence < 0.4) && (
                      <div className="flex items-start gap-2">
                        <Activity className="w-5 h-5 text-neon-cyan mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-neon-cyan">Consolidação</p>
                          <p className="text-xs text-muted-foreground">
                            Mercado sem direção clara. Possível período de acumulação antes de movimento significativo.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-5 rounded-lg bg-accent/30 border-2 border-neon-cyan/40 shadow-neon-md">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Preço Atual</p>
                <p className="text-4xl font-bold text-neon-cyan neon-text">
                  ${parseFloat(selectedAsset.lastPrice).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-5 rounded-lg bg-accent/30 border-2 border-neon-blue/40 shadow-neon-md">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Volume 24h</p>
                <p className="text-3xl font-bold text-neon-blue">
                  ${(parseFloat(selectedAsset.quoteVolume) / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className="p-5 rounded-lg bg-neon-green/10 border-2 border-neon-green/40 shadow-neon-bullish">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Máxima 24h</p>
                <p className="text-3xl font-bold text-neon-green">
                  ${parseFloat(selectedAsset.highPrice).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-5 rounded-lg bg-accent/30 border-2 border-neon-purple/40 shadow-neon-md">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Mínima 24h</p>
                <p className="text-3xl font-bold text-neon-purple">
                  ${parseFloat(selectedAsset.lowPrice).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Predictive Confidence Panel */}
            <div className="mb-8">
              <PredictiveConfidencePanel analysis={selectedAsset.analysis} symbol={selectedSymbol} />
            </div>

            {/* Technical Analysis and Support/Resistance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-neon-cyan/30 bg-card/60 shadow-neon-md">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-neon-cyan animate-pulse-neon" />
                    <CardTitle className="text-xl text-neon-cyan">Análise Técnica Avançada</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-300",
                    selectedAsset.analysis.trend === 'bullish'
                      ? "bg-neon-green/10 border-neon-green/40 shadow-neon-bullish"
                      : "bg-neon-red/10 border-neon-red/40 shadow-neon-bearish"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground font-medium">Tendência Atual</span>
                      {selectedAsset.analysis.trend === 'bullish' ? (
                        <Badge className="bg-neon-green/20 text-neon-green border-2 border-neon-green/60 font-bold text-base">
                          <TrendingUp className="w-5 h-5 mr-1" />
                          Bullish
                        </Badge>
                      ) : (
                        <Badge className="bg-neon-red/20 text-neon-red border-2 border-neon-red/60 font-bold text-base">
                          <TrendingDown className="w-5 h-5 mr-1" />
                          Bearish
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Análise baseada em SMC, Volume Delta, Price Action e zonas de liquidez
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-accent/30 border-2 border-neon-cyan/40">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground font-medium">Força do Sinal</span>
                      <Badge variant="outline" className="text-base border-2 border-neon-cyan/60 text-neon-cyan font-bold">
                        <Zap className="w-5 h-5 mr-1" />
                        {selectedAsset.analysis.strength.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-4 border-2 border-border">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isPositive 
                            ? "bg-gradient-to-r from-neon-green via-neon-cyan to-neon-blue shadow-neon-bullish" 
                            : "bg-gradient-to-r from-neon-red via-neon-orange to-neon-pink shadow-neon-bearish"
                        )}
                        style={{ width: `${selectedAsset.analysis.strength}%` }}
                      />
                    </div>
                  </div>

                  <div className={cn(
                    "p-5 rounded-lg border-2 transition-all duration-300",
                    isPositive 
                      ? "bg-neon-green/10 border-neon-green/40 shadow-neon-bullish" 
                      : "bg-neon-red/10 border-neon-red/40 shadow-neon-bearish"
                  )}>
                    <h4 className="text-sm font-bold mb-2 text-muted-foreground">Predição de Preço (24h)</h4>
                    <div className="flex items-baseline gap-2">
                      <span className={cn(
                        "text-4xl font-bold",
                        isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
                      )}>
                        ${selectedAsset.analysis.prediction.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className={cn(
                        "text-base font-bold",
                        isPositive ? "text-neon-green" : "text-neon-red"
                      )}>
                        (
                        {(
                          ((selectedAsset.analysis.prediction - parseFloat(selectedAsset.lastPrice)) /
                            parseFloat(selectedAsset.lastPrice)) *
                          100
                        ).toFixed(2)}
                        %)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-neon-cyan/30 bg-card/60 shadow-neon-md">
                <CardHeader>
                  <CardTitle className="text-xl text-neon-cyan">Zonas de Suporte e Resistência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-neon-green/10 border-2 border-neon-green/40 shadow-neon-bullish">
                    <h4 className="text-sm font-bold text-neon-green mb-3 flex items-center gap-2 neon-text-bullish">
                      <TrendingUp className="w-5 h-5" />
                      Zonas de Resistência
                    </h4>
                    <div className="space-y-2">
                      {selectedAsset.analysis.resistanceZones.map((zone, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded bg-card/60 border-2 border-neon-green/30"
                        >
                          <span className="text-sm text-muted-foreground font-bold">R{idx + 1}</span>
                          <span className="font-mono font-bold text-lg text-neon-green neon-text-bullish">
                            ${zone.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-neon-cyan/10 border-2 border-neon-cyan/40 shadow-neon-md">
                    <h4 className="text-sm font-bold text-neon-cyan mb-3 flex items-center gap-2 neon-text">
                      <TrendingDown className="w-5 h-5" />
                      Zonas de Suporte
                    </h4>
                    <div className="space-y-2">
                      {selectedAsset.analysis.supportZones.map((zone, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded bg-card/60 border-2 border-neon-cyan/30"
                        >
                          <span className="text-sm text-muted-foreground font-bold">S{idx + 1}</span>
                          <span className="font-mono font-bold text-lg text-neon-cyan neon-text">
                            ${zone.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
