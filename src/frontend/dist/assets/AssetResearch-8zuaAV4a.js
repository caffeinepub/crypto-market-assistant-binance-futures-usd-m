import { a as createLucideIcon, j as jsxRuntimeExports, c as cn, r as reactExports, B as Button, T as TrendingUp } from "./index-W02uwOhi.js";
import { C as Card, b as CardHeader, a as CardContent, c as CardTitle, d as CardDescription, B as Badge } from "./card-CjFWqlgf.js";
import { S as Skeleton } from "./skeleton-DX2LXGa-.js";
import { u as useBinanceMarketData, b as useSearchBinanceAsset } from "./useQueries-dD3CIt-h.js";
import { P as PredictiveConfidencePanel } from "./PredictiveConfidencePanel-BoHoUZEH.js";
import { C as CircleAlert } from "./binanceFetch-DZHWmsqK.js";
import { L as LoaderCircle } from "./loader-circle-BBLq9xNC.js";
import { T as TrendingDown } from "./trending-down-Bs6x2N1r.js";
import { Z as Zap } from "./zap-DOPjtBzC.js";
import { A as Activity } from "./activity-v1WCnvZ-.js";
import "./learningEngine-DnDrJIqT.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode);
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
function AssetResearch() {
  const { data: marketData, isLoading: isLoadingMarket } = useBinanceMarketData();
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [selectedSymbol, setSelectedSymbol] = reactExports.useState("ICPUSDT");
  const [allSymbols, setAllSymbols] = reactExports.useState([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = reactExports.useState(false);
  const {
    data: searchedAsset,
    isLoading: isLoadingSearch,
    refetch: refetchAsset
  } = useSearchBinanceAsset(selectedSymbol);
  reactExports.useEffect(() => {
    const fetchAllSymbols = async () => {
      setIsLoadingSymbols(true);
      try {
        const response = await fetch(
          "https://fapi.binance.com/fapi/v1/exchangeInfo"
        );
        if (response.ok) {
          const data = await response.json();
          const usdtSymbols = data.symbols.filter(
            (s) => s.symbol.endsWith("USDT") && s.status === "TRADING"
          ).map((s) => s.symbol).sort();
          setAllSymbols(usdtSymbols);
        }
      } catch (error) {
        console.error("Error fetching Binance symbols:", error);
        if (marketData) {
          setAllSymbols(marketData.map((m) => m.symbol).sort());
        }
      } finally {
        setIsLoadingSymbols(false);
      }
    };
    fetchAllSymbols();
  }, [marketData]);
  const filteredSymbols = reactExports.useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toUpperCase();
    return allSymbols.filter((symbol) => symbol.includes(term)).slice(0, 20);
  }, [searchTerm, allSymbols]);
  const handleSearch = () => {
    if (filteredSymbols.length > 0) {
      setSelectedSymbol(filteredSymbols[0]);
      setSearchTerm("");
      refetchAsset();
    } else if (searchTerm.toUpperCase().endsWith("USDT")) {
      setSelectedSymbol(searchTerm.toUpperCase());
      setSearchTerm("");
      refetchAsset();
    }
  };
  const handleSymbolSelect = (symbol) => {
    setSelectedSymbol(symbol);
    setSearchTerm("");
    refetchAsset();
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  const selectedAsset = searchedAsset || (marketData == null ? void 0 : marketData.find((m) => m.symbol === selectedSymbol));
  const isLoading = isLoadingMarket || isLoadingSearch || isLoadingSymbols;
  if (isLoading && !selectedAsset) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-border bg-card/60 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-64" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-96 mt-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96" }) })
    ] }) });
  }
  if (!selectedAsset) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-border bg-card/60 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Pesquisa de Ativos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Selecione um ativo para análise detalhada" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-neon-orange" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Dados não disponíveis no momento. Tente outro símbolo." })
      ] }) })
    ] });
  }
  const isPositive = selectedAsset.priceChangePercent >= 0;
  const hasManipulationZones = selectedAsset.analysis.manipulationZones.length > 0;
  const hasInstitutionalOrders = selectedAsset.analysis.institutionalOrders.length > 0;
  const getScenario = () => {
    const { trend, strength, confidence } = selectedAsset.analysis;
    if (trend === "bullish" && strength > 70 && confidence > 0.7) {
      return {
        text: "Alta Provável",
        color: "text-neon-green",
        bg: "bg-neon-green/10",
        border: "border-neon-green/40"
      };
    }
    if (trend === "bearish" && strength > 70 && confidence > 0.7) {
      return {
        text: "Queda Técnica",
        color: "text-neon-red",
        bg: "bg-neon-red/10",
        border: "border-neon-red/40"
      };
    }
    if (strength < 40 || confidence < 0.4) {
      return {
        text: "Consolidação",
        color: "text-neon-cyan",
        bg: "bg-neon-cyan/10",
        border: "border-neon-cyan/40"
      };
    }
    if (trend === "bullish") {
      return {
        text: "Tendência de Alta Moderada",
        color: "text-neon-green",
        bg: "bg-neon-green/10",
        border: "border-neon-green/40"
      };
    }
    return {
      text: "Tendência de Baixa Moderada",
      color: "text-neon-red",
      bg: "bg-neon-red/10",
      border: "border-neon-red/40"
    };
  };
  const scenario = getScenario();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-neon-cyan/40 bg-card/60 backdrop-blur-sm shadow-neon-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-2xl text-neon-cyan flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-6 h-6" }),
          "Pesquisa Universal de Ativos"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-base", children: "Busque e analise qualquer par Binance Futures USD-M em tempo real" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "text",
                placeholder: "Digite o símbolo (ex: BTCUSDT, ETHUSDT, SOLUSDT)",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                onKeyDown: handleKeyDown,
                className: "h-12 text-base border-2 border-neon-cyan/40 focus:border-neon-cyan pr-10"
              }
            ),
            isLoadingSymbols && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "absolute right-3 top-3 w-6 h-6 text-neon-cyan animate-spin" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleSearch,
              disabled: !searchTerm && filteredSymbols.length === 0,
              className: "h-12 px-6 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border-2 border-neon-cyan/60 shadow-neon-md",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-5 h-5 mr-2" }),
                "Buscar"
              ]
            }
          )
        ] }),
        searchTerm && filteredSymbols.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-card/80 border-2 border-neon-cyan/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-2 font-medium", children: [
            "Sugestões (",
            filteredSymbols.length,
            " encontrados):"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 max-h-40 overflow-y-auto", children: filteredSymbols.map((symbol) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => handleSymbolSelect(symbol),
              className: "border-neon-cyan/40 hover:bg-neon-cyan/20 hover:text-neon-cyan text-xs",
              children: symbol
            },
            symbol
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Ativo selecionado:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60 font-bold", children: selectedSymbol }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
            "(",
            allSymbols.length,
            " pares disponíveis)"
          ] })
        ] })
      ] }) })
    ] }),
    isLoadingSearch ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-2 border-border bg-card/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-12 h-12 text-neon-cyan animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        "Analisando ",
        selectedSymbol,
        "..."
      ] })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: cn(
          "border-2 bg-gradient-to-br from-card/80 backdrop-blur-sm transition-all duration-300",
          isPositive ? "to-neon-green/10 border-neon-green/40 shadow-neon-bullish" : "to-neon-red/10 border-neon-red/40 shadow-neon-bearish"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                CardTitle,
                {
                  className: cn(
                    "text-3xl font-bold mb-2",
                    isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
                  ),
                  children: selectedSymbol
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-base font-medium", children: "Análise Detalhada com Inteligência Preditiva - Binance Futures USD-M" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: isPositive ? "default" : "destructive",
                className: cn(
                  "text-2xl px-8 py-4 border-2 font-bold",
                  isPositive ? "bg-neon-green/20 text-neon-green border-neon-green/60 shadow-neon-bullish" : "bg-neon-red/20 text-neon-red border-neon-red/60 shadow-neon-bearish"
                ),
                children: [
                  isPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-7 h-7 mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-7 h-7 mr-2" }),
                  selectedAsset.priceChangePercent.toFixed(2),
                  "%"
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              {
                className: cn(
                  "border-2 mb-6 shadow-neon-md",
                  scenario.border,
                  scenario.bg
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: cn("text-xl", scenario.color), children: "Interpretação da Condição Atual" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-card/60 border-2 border-border", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2 font-medium", children: "Direção da Tendência" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: selectedAsset.analysis.trend === "bullish" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-6 h-6 text-neon-green" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-neon-green", children: "Bullish (Alta)" })
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-6 h-6 text-neon-red" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-neon-red", children: "Bearish (Baixa)" })
                        ] }) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-card/60 border-2 border-border", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2 font-medium", children: "Confiança Preditiva" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-6 h-6 text-neon-cyan" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold text-neon-cyan", children: [
                            (selectedAsset.analysis.confidence * 100).toFixed(0),
                            "%"
                          ] })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-card/60 border-2 border-border", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2 font-medium", children: "Cenário Futuro" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-lg font-bold", scenario.color), children: scenario.text })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-card/60 border-2 border-border", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold mb-3 text-muted-foreground", children: "Eventos Detectados" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                        hasManipulationZones && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "img",
                            {
                              src: "/assets/generated/manipulation-zone-icon-transparent.dim_48x48.png",
                              alt: "Zona de Manipulação",
                              className: "w-5 h-5 mt-0.5"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-neon-orange", children: [
                              "Zonas de Manipulação Detectadas (",
                              selectedAsset.analysis.manipulationZones.length,
                              ")"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Áreas de liquidez onde instituições podem estar acumulando ou distribuindo posições" })
                          ] })
                        ] }),
                        hasInstitutionalOrders && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "img",
                            {
                              src: "/assets/generated/institutional-order-icon-transparent.dim_48x48.png",
                              alt: "Ordem Institucional",
                              className: "w-5 h-5 mt-0.5"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-neon-purple", children: [
                              "Ordens Institucionais Detectadas (",
                              selectedAsset.analysis.institutionalOrders.length,
                              ")"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Movimentos de grande volume indicando atividade de smart money" })
                          ] })
                        ] }),
                        selectedAsset.analysis.learningLevel && selectedAsset.analysis.learningLevel > 0.5 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "img",
                            {
                              src: "/assets/generated/learning-brain-icon-transparent.dim_64x64.png",
                              alt: "IA Avançada",
                              className: "w-5 h-5 mt-0.5"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-neon-blue", children: [
                              "IA com Alto Nível de Aprendizado (",
                              (selectedAsset.analysis.learningLevel * 100).toFixed(0),
                              "%)"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sistema desenvolveu padrões consistentes de predição para este ativo" })
                          ] })
                        ] }),
                        !hasManipulationZones && !hasInstitutionalOrders && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum evento especial detectado no momento. Mercado operando em condições normais." })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-card/60 border-2 border-border", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold mb-3 text-muted-foreground", children: "Possibilidades de Cenários Futuros" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                        selectedAsset.analysis.trend === "bullish" && selectedAsset.analysis.strength > 70 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5 text-neon-green mt-0.5" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-neon-green", children: "Alta Provável" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Forte momentum de alta com alta confiança. Possível continuação do movimento ascendente." })
                          ] })
                        ] }),
                        selectedAsset.analysis.trend === "bearish" && selectedAsset.analysis.strength > 70 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-5 h-5 text-neon-red mt-0.5" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-neon-red", children: "Queda Técnica" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Forte pressão vendedora com alta confiança. Possível continuação do movimento descendente." })
                          ] })
                        ] }),
                        (selectedAsset.analysis.strength < 40 || selectedAsset.analysis.confidence < 0.4) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-5 h-5 text-neon-cyan mt-0.5" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-neon-cyan", children: "Consolidação" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mercado sem direção clara. Possível período de acumulação antes de movimento significativo." })
                          ] })
                        ] })
                      ] })
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 rounded-lg bg-accent/30 border-2 border-neon-cyan/40 shadow-neon-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2 font-medium", children: "Preço Atual" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-4xl font-bold text-neon-cyan neon-text", children: [
                  "$",
                  Number.parseFloat(selectedAsset.lastPrice).toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 rounded-lg bg-accent/30 border-2 border-neon-blue/40 shadow-neon-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2 font-medium", children: "Volume 24h" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-bold text-neon-blue", children: [
                  "$",
                  (Number.parseFloat(selectedAsset.quoteVolume) / 1e6).toFixed(2),
                  "M"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 rounded-lg bg-neon-green/10 border-2 border-neon-green/40 shadow-neon-bullish", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2 font-medium", children: "Máxima 24h" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-bold text-neon-green", children: [
                  "$",
                  Number.parseFloat(selectedAsset.highPrice).toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 rounded-lg bg-accent/30 border-2 border-neon-purple/40 shadow-neon-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2 font-medium", children: "Mínima 24h" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-bold text-neon-purple", children: [
                  "$",
                  Number.parseFloat(selectedAsset.lowPrice).toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              PredictiveConfidencePanel,
              {
                analysis: selectedAsset.analysis,
                symbol: selectedSymbol
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-neon-cyan/30 bg-card/60 shadow-neon-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-6 h-6 text-neon-cyan animate-pulse-neon" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl text-neon-cyan", children: "Análise Técnica Avançada" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: cn(
                        "p-4 rounded-lg border-2 transition-all duration-300",
                        selectedAsset.analysis.trend === "bullish" ? "bg-neon-green/10 border-neon-green/40 shadow-neon-bullish" : "bg-neon-red/10 border-neon-red/40 shadow-neon-bearish"
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Tendência Atual" }),
                          selectedAsset.analysis.trend === "bullish" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-green/20 text-neon-green border-2 border-neon-green/60 font-bold text-base", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5 mr-1" }),
                            "Bullish"
                          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-red/20 text-neon-red border-2 border-neon-red/60 font-bold text-base", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-5 h-5 mr-1" }),
                            "Bearish"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Análise baseada em SMC, Volume Delta, Price Action e zonas de liquidez" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-accent/30 border-2 border-neon-cyan/40", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Força do Sinal" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Badge,
                        {
                          variant: "outline",
                          className: "text-base border-2 border-neon-cyan/60 text-neon-cyan font-bold",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-5 h-5 mr-1" }),
                            selectedAsset.analysis.strength.toFixed(1),
                            "%"
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-4 border-2 border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: cn(
                          "h-full rounded-full transition-all duration-500",
                          isPositive ? "bg-gradient-to-r from-neon-green via-neon-cyan to-neon-blue shadow-neon-bullish" : "bg-gradient-to-r from-neon-red via-neon-orange to-neon-pink shadow-neon-bearish"
                        ),
                        style: { width: `${selectedAsset.analysis.strength}%` }
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: cn(
                        "p-5 rounded-lg border-2 transition-all duration-300",
                        isPositive ? "bg-neon-green/10 border-neon-green/40 shadow-neon-bullish" : "bg-neon-red/10 border-neon-red/40 shadow-neon-bearish"
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold mb-2 text-muted-foreground", children: "Predição de Preço (24h)" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "span",
                            {
                              className: cn(
                                "text-4xl font-bold",
                                isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
                              ),
                              children: [
                                "$",
                                selectedAsset.analysis.prediction.toLocaleString(
                                  "pt-BR",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }
                                )
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "span",
                            {
                              className: cn(
                                "text-base font-bold",
                                isPositive ? "text-neon-green" : "text-neon-red"
                              ),
                              children: [
                                "(",
                                ((selectedAsset.analysis.prediction - Number.parseFloat(selectedAsset.lastPrice)) / Number.parseFloat(selectedAsset.lastPrice) * 100).toFixed(2),
                                "%)"
                              ]
                            }
                          )
                        ] })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-neon-cyan/30 bg-card/60 shadow-neon-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl text-neon-cyan", children: "Zonas de Suporte e Resistência" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-neon-green/10 border-2 border-neon-green/40 shadow-neon-bullish", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-bold text-neon-green mb-3 flex items-center gap-2 neon-text-bullish", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5" }),
                      "Zonas de Resistência"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedAsset.analysis.resistanceZones.map(
                      (zone, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: "flex items-center justify-between p-3 rounded bg-card/60 border-2 border-neon-green/30",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground font-bold", children: [
                              "R",
                              idx + 1
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-bold text-lg text-neon-green neon-text-bullish", children: [
                              "$",
                              zone.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })
                            ] })
                          ]
                        },
                        zone
                      )
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-neon-cyan/10 border-2 border-neon-cyan/40 shadow-neon-md", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-bold text-neon-cyan mb-3 flex items-center gap-2 neon-text", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-5 h-5" }),
                      "Zonas de Suporte"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedAsset.analysis.supportZones.map((zone, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "flex items-center justify-between p-3 rounded bg-card/60 border-2 border-neon-cyan/30",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground font-bold", children: [
                            "S",
                            idx + 1
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-bold text-lg text-neon-cyan neon-text", children: [
                            "$",
                            zone.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })
                          ] })
                        ]
                      },
                      zone
                    )) })
                  ] })
                ] })
              ] })
            ] })
          ] })
        ]
      }
    )
  ] });
}
export {
  AssetResearch as default
};
