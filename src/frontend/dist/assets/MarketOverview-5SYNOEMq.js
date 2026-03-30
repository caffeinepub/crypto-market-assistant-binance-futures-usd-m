import { j as jsxRuntimeExports, c as cn, T as TrendingUp, r as reactExports } from "./index-W02uwOhi.js";
import { C as Card, a as CardContent, B as Badge, b as CardHeader, c as CardTitle, d as CardDescription } from "./card-CjFWqlgf.js";
import { S as ScrollArea } from "./scroll-area-D1OoYdcG.js";
import { S as Skeleton } from "./skeleton-DX2LXGa-.js";
import { u as useBinanceMarketData } from "./useQueries-dD3CIt-h.js";
import { T as TabFetchErrorState, A as AIPerformancePanel } from "./TabFetchErrorState-DwVAIAsO.js";
import { T as TrendingDown } from "./trending-down-Bs6x2N1r.js";
import { Z as Zap } from "./zap-DOPjtBzC.js";
import { P as PredictiveConfidencePanel } from "./PredictiveConfidencePanel-BoHoUZEH.js";
import { A as Activity } from "./activity-v1WCnvZ-.js";
import { T as Target } from "./target-BbSsS_vs.js";
import "./learningEngine-DnDrJIqT.js";
import "./binanceFetch-DZHWmsqK.js";
import "./brain-CQ7V_FHR.js";
import "./alert-D9FEYK2j.js";
import "./refresh-cw-CIoyRFar.js";
function MarketCard({
  market,
  isSelected,
  onClick
}) {
  const isPositive = market.priceChangePercent >= 0;
  const isHighConfidence = market.analysis.confidence >= 0.7;
  const confidencePercent = Math.round(market.analysis.confidence * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      className: cn(
        "cursor-pointer transition-all duration-300 hover:scale-105 border-2 bg-card/60 backdrop-blur-sm",
        isSelected && "ring-4 ring-neon-cyan shadow-neon-md",
        isPositive ? "border-neon-green/40 hover:border-neon-green/70 hover:shadow-neon-bullish" : "border-neon-red/40 hover:border-neon-red/70 hover:shadow-neon-bearish",
        isPositive && isSelected && "neon-border-bullish",
        !isPositive && isSelected && "neon-border-bearish",
        isHighConfidence && "ring-2 ring-neon-green/30"
      ),
      onClick,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h3",
              {
                className: cn(
                  "font-bold text-lg",
                  isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
                ),
                children: market.symbol
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Binance Futures" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "p-2 rounded-full transition-all duration-300",
                isPositive ? "bg-neon-green/20 shadow-neon-bullish" : "bg-neon-red/20 shadow-neon-bearish"
              ),
              children: isPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-6 h-6 text-neon-green" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-6 h-6 text-neon-red" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-foreground", children: [
            "$",
            Number.parseFloat(market.lastPrice).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: isPositive ? "default" : "destructive",
              className: cn(
                "w-full justify-center text-base font-bold border-2 transition-all duration-300",
                isPositive ? "bg-neon-green/20 text-neon-green border-neon-green/60 hover:bg-neon-green/30 hover:shadow-neon-bullish" : "bg-neon-red/20 text-neon-red border-neon-red/60 hover:bg-neon-red/30 hover:shadow-neon-bearish"
              ),
              children: [
                isPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5 mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-5 h-5 mr-1" }),
                market.priceChangePercent.toFixed(2),
                "%"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t-2 border-border space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-medium", children: "Volume 24h" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-neon-cyan", children: [
                "$",
                (Number.parseFloat(market.quoteVolume) / 1e6).toFixed(1),
                "M"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-medium", children: "Força" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: cn(
                    "font-bold",
                    isPositive ? "text-neon-green" : "text-neon-orange"
                  ),
                  children: [
                    market.analysis.strength.toFixed(0),
                    "%"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-medium", children: "Confiança" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Badge,
                {
                  className: cn(
                    "text-xs px-2 py-0.5 border font-bold",
                    isHighConfidence ? "bg-neon-green/20 text-neon-green border-neon-green/60" : "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60"
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3 h-3 mr-0.5" }),
                    confidencePercent,
                    "%"
                  ]
                }
              )
            ] })
          ] }),
          isHighConfidence && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-1.5 bg-muted rounded-full border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute inset-0 rounded-full bg-gradient-to-r from-neon-green via-neon-cyan to-neon-purple transition-all duration-500",
              style: { width: `${confidencePercent}%` }
            }
          ) }) })
        ] })
      ] })
    }
  );
}
function MarketOverview() {
  const { data: marketData, isLoading, error } = useBinanceMarketData();
  const [selectedSymbol, setSelectedSymbol] = reactExports.useState("BTCUSDT");
  reactExports.useEffect(() => {
    if (marketData && marketData.length > 0 && !selectedSymbol) {
      setSelectedSymbol(marketData[0].symbol);
    }
  }, [marketData, selectedSymbol]);
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabFetchErrorState,
      {
        error,
        title: "Market Data Unavailable",
        description: "Unable to fetch live market data from Binance. Check your internet connection and try again."
      }
    );
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-border bg-card/60 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-64" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-96 mt-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48" }, i)) }) })
    ] }) });
  }
  if (!marketData || marketData.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabFetchErrorState,
      {
        title: "No Market Data",
        description: "No market data is currently available from Binance. Please check your internet connection and try again."
      }
    );
  }
  const selectedMarket = marketData == null ? void 0 : marketData.find((m) => m.symbol === selectedSymbol);
  const isPositive = selectedMarket ? selectedMarket.priceChangePercent >= 0 : false;
  const hasManipulationZones = selectedMarket && selectedMarket.analysis.manipulationZones.length > 0;
  const hasInstitutionalOrders = selectedMarket && selectedMarket.analysis.institutionalOrders.length > 0;
  const hasLearning = selectedMarket && (selectedMarket.analysis.learningLevel || 0) > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-neon-cyan/30 bg-card/60 backdrop-blur-sm shadow-neon-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-6 h-6 text-neon-cyan animate-pulse-neon" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl text-neon-cyan neon-text", children: "Market Overview" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-base", children: "Live data from Binance Futures USD-M with advanced predictive analysis and continuous learning" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[600px] pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: marketData == null ? void 0 : marketData.map((market) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        MarketCard,
        {
          market,
          isSelected: market.symbol === selectedSymbol,
          onClick: () => setSelectedSymbol(market.symbol)
        },
        market.symbol
      )) }) }) })
    ] }),
    selectedMarket && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: cn(
          "border-2 bg-card/60 backdrop-blur-sm transition-all duration-300",
          isPositive ? "border-neon-green/40 shadow-neon-bullish" : "border-neon-red/40 shadow-neon-bearish"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                CardTitle,
                {
                  className: cn(
                    "text-3xl font-bold",
                    isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
                  ),
                  children: selectedMarket.symbol
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-base", children: "Detailed Analysis with Predictive Intelligence" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: isPositive ? "default" : "destructive",
                className: cn(
                  "text-xl px-6 py-3 border-2 font-bold",
                  isPositive ? "bg-neon-green/20 text-neon-green border-neon-green/60 shadow-neon-bullish" : "bg-neon-red/20 text-neon-red border-neon-red/60 shadow-neon-bearish"
                ),
                children: [
                  isPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-6 h-6 mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-6 h-6 mr-2" }),
                  selectedMarket.priceChangePercent.toFixed(2),
                  "%"
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-4 rounded-lg bg-accent/30 border-2 border-neon-cyan/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "Current Price" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-bold text-neon-cyan neon-text", children: [
                  "$",
                  Number.parseFloat(selectedMarket.lastPrice).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-4 rounded-lg bg-accent/30 border-2 border-neon-blue/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "24h Volume" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-neon-blue", children: [
                  "$",
                  Number.parseFloat(selectedMarket.quoteVolume).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-4 rounded-lg bg-accent/30 border-2 border-neon-green/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "24h High" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-neon-green", children: [
                  "$",
                  Number.parseFloat(selectedMarket.highPrice).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-4 rounded-lg bg-accent/30 border-2 border-neon-purple/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "24h Low" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-neon-purple", children: [
                  "$",
                  Number.parseFloat(selectedMarket.lowPrice).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              PredictiveConfidencePanel,
              {
                analysis: selectedMarket.analysis,
                symbol: selectedMarket.symbol
              }
            ) }),
            hasLearning && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AIPerformancePanel, { symbol: selectedMarket.symbol, compact: true }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-neon-cyan", children: "Advanced Technical Analysis" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: cn(
                      "p-4 rounded-lg border-2 transition-all duration-300",
                      selectedMarket.analysis.trend === "bullish" ? "bg-neon-green/10 border-neon-green/40 shadow-neon-bullish" : "bg-neon-red/10 border-neon-red/40 shadow-neon-bearish"
                    ),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Trend" }),
                        selectedMarket.analysis.trend === "bullish" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-green/20 text-neon-green border-2 border-neon-green/60 font-bold", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5 mr-1" }),
                          "Bullish"
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-red/20 text-neon-red border-2 border-neon-red/60 font-bold", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-5 h-5 mr-1" }),
                          "Bearish"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Based on SMC analysis, volume delta, momentum and price structure" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-accent/30 border-2 border-neon-cyan/30", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "Signal Strength" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Badge,
                      {
                        variant: "outline",
                        className: "border-2 border-neon-cyan/60 text-neon-cyan font-bold",
                        children: [
                          selectedMarket.analysis.strength.toFixed(1),
                          "%"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-3 mt-2 border-2 border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: cn(
                        "h-full rounded-full transition-all duration-500",
                        isPositive ? "bg-gradient-to-r from-neon-green via-neon-cyan to-neon-blue shadow-neon-bullish" : "bg-gradient-to-r from-neon-red via-neon-orange to-neon-pink shadow-neon-bearish"
                      ),
                      style: {
                        width: `${selectedMarket.analysis.strength}%`
                      }
                    }
                  ) })
                ] })
              ] }),
              (hasManipulationZones || hasInstitutionalOrders) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4", children: [
                hasManipulationZones && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-2 border-neon-orange/40 bg-neon-orange/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: "/assets/generated/manipulation-zone-icon-transparent.dim_48x48.png",
                        alt: "Manipulation Zone",
                        className: "w-6 h-6"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-neon-orange", children: "Manipulation Zones Detected" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedMarket.analysis.manipulationZones.map(
                    (zone) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "flex items-center justify-between text-xs p-2 rounded bg-card/50 border border-neon-orange/30",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-semibold", children: [
                            "$",
                            zone.priceRange.min.toFixed(2),
                            " - $",
                            zone.priceRange.max.toFixed(2)
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-orange/20 text-neon-orange border border-neon-orange/60 text-xs", children: [
                            Math.round(zone.confidence * 100),
                            "%"
                          ] })
                        ]
                      },
                      `${zone.priceRange.min}-${zone.priceRange.max}`
                    )
                  ) })
                ] }) }),
                hasInstitutionalOrders && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-2 border-neon-purple/40 bg-neon-purple/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: "/assets/generated/institutional-order-icon-transparent.dim_48x48.png",
                        alt: "Institutional Order",
                        className: "w-6 h-6"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-neon-purple", children: "Institutional Orders Detected" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedMarket.analysis.institutionalOrders.map(
                    (order) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "flex items-center justify-between text-xs p-2 rounded bg-card/50 border border-neon-purple/30",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-semibold", children: [
                            order.direction === "up" ? "Buy" : "Sell",
                            " @ $",
                            order.price.toFixed(2)
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-purple/20 text-neon-purple border border-neon-purple/60 text-xs", children: [
                            Math.round(order.confidence * 100),
                            "%"
                          ] })
                        ]
                      },
                      `${order.direction}-${order.price}`
                    )
                  ) })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-neon-green/10 border-2 border-neon-green/40 shadow-neon-bullish", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-bold text-neon-green mb-3 flex items-center gap-2 neon-text-bullish", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5" }),
                    "Resistance Zones"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedMarket.analysis.resistanceZones.map(
                    (zone, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "flex items-center justify-between text-sm p-2 rounded bg-card/50 border border-neon-green/30",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-semibold", children: [
                            "R",
                            idx + 1
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-bold text-neon-green", children: [
                            "$",
                            zone.toLocaleString("en-US", {
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
                    "Support Zones"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedMarket.analysis.supportZones.map((zone, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex items-center justify-between text-sm p-2 rounded bg-card/50 border border-neon-cyan/30",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-semibold", children: [
                          "S",
                          idx + 1
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-bold text-neon-cyan", children: [
                          "$",
                          zone.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })
                        ] })
                      ]
                    },
                    zone
                  )) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: cn(
                    "p-6 rounded-lg border-2 mt-4 transition-all duration-300",
                    isPositive ? "bg-neon-green/10 border-neon-green/40 shadow-neon-bullish" : "bg-neon-red/10 border-neon-red/40 shadow-neon-bearish"
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-bold mb-2 text-muted-foreground flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-4 h-4" }),
                      "Price Prediction"
                    ] }),
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
                            selectedMarket.analysis.prediction.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }
                            )
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "next 24h" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [
                      "Based on algorithmic analysis of SMC, Volume Delta, Liquidity and Fair Value Gaps",
                      hasLearning && " with continuous learning optimization"
                    ] })
                  ]
                }
              )
            ] })
          ] })
        ]
      }
    )
  ] });
}
export {
  MarketOverview as default
};
