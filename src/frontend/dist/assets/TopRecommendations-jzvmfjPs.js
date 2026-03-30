import { j as jsxRuntimeExports, c as cn, T as TrendingUp } from "./index-W02uwOhi.js";
import { A as Alert, a as AlertTitle, b as AlertDescription } from "./alert-D9FEYK2j.js";
import { C as Card, b as CardHeader, a as CardContent, c as CardTitle, d as CardDescription, B as Badge } from "./card-CjFWqlgf.js";
import { S as ScrollArea } from "./scroll-area-D1OoYdcG.js";
import { S as Skeleton } from "./skeleton-DX2LXGa-.js";
import { u as useBinanceMarketData, a as useRecommendations } from "./useQueries-dD3CIt-h.js";
import { T as TabFetchErrorState, A as AIPerformancePanel } from "./TabFetchErrorState-DwVAIAsO.js";
import { P as PredictiveConfidencePanel } from "./PredictiveConfidencePanel-BoHoUZEH.js";
import { S as Star } from "./star-DVNDklFt.js";
import { C as CircleAlert } from "./binanceFetch-DZHWmsqK.js";
import { B as Brain } from "./brain-CQ7V_FHR.js";
import { Z as Zap } from "./zap-DOPjtBzC.js";
import { T as Target } from "./target-BbSsS_vs.js";
import "./learningEngine-DnDrJIqT.js";
import "./refresh-cw-CIoyRFar.js";
function TopRecommendations() {
  const {
    data: marketData,
    isLoading: marketLoading,
    error: marketError
  } = useBinanceMarketData();
  const {
    data: recommendations,
    isLoading: recsLoading,
    error: recsError
  } = useRecommendations();
  const isLoading = marketLoading || recsLoading;
  const error = marketError || recsError;
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabFetchErrorState,
      {
        error,
        title: "Recommendations Unavailable",
        description: "Unable to generate recommendations from live market data. Check your internet connection and try again."
      }
    );
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-border bg-card/60 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-64" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-96 mt-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32" }, i)) }) })
    ] });
  }
  const topRecs = recommendations == null ? void 0 : recommendations.map((rec) => {
    const market = marketData == null ? void 0 : marketData.find((m) => m.symbol === rec.symbol);
    return { ...rec, market };
  }).filter((rec) => rec.market).slice(0, 10);
  const hasRecommendations = topRecs && topRecs.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-neon-green/30 bg-card/60 backdrop-blur-sm shadow-neon-bullish", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-6 h-6 text-neon-green fill-neon-green animate-pulse-bullish" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl text-neon-green neon-text-bullish", children: "Top Recommendations" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-base", children: "Assets with highest upside potential based on advanced algorithmic analysis, predictive confidence and continuous learning" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: !hasRecommendations ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-2 border-neon-cyan/40 bg-neon-cyan/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-neon-cyan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { className: "text-neon-cyan font-bold", children: "Generating Recommendations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { className: "text-muted-foreground", children: "The system is analyzing live market data and generating recommendations automatically. Recommendations will appear shortly based on Smart Money Concepts, Volume Delta, Liquidity analysis, institutional order detection and continuous AI learning." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[700px] pr-2 overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 min-w-0", children: topRecs.map((rec, index) => {
      const isHighConfidence = rec.confidence >= 0.7;
      const hasLearning = rec.market && (rec.market.analysis.learningLevel || 0) >= 0.6;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: cn(
            "border-2 bg-gradient-to-br from-card/80 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 min-w-0",
            isHighConfidence ? "to-neon-green/10 border-neon-green/50 shadow-neon-bullish animate-pulse-bullish" : "to-neon-cyan/10 border-neon-green/40 hover:shadow-neon-bullish"
          ),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 sm:p-6 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start justify-between gap-3 mb-4 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: cn(
                        "absolute inset-0 blur-lg opacity-60 rounded-full",
                        isHighConfidence ? "bg-neon-green" : "bg-neon-cyan"
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: cn(
                        "relative text-primary-foreground font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center border-2",
                        isHighConfidence ? "bg-gradient-to-br from-neon-green to-neon-cyan border-neon-green shadow-neon-bullish" : "bg-gradient-to-br from-neon-cyan to-neon-blue border-neon-cyan"
                      ),
                      children: index + 1
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-xl text-neon-green neon-text-bullish truncate", children: rec.symbol }),
                    hasLearning && /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-5 h-5 text-neon-purple flex-shrink-0" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground font-medium truncate", children: [
                    "Binance Futures USD-M",
                    hasLearning && " • AI Advanced"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row sm:flex-col gap-2 items-start sm:items-end flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Badge,
                  {
                    className: cn(
                      "text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 border-2 font-bold whitespace-nowrap",
                      isHighConfidence ? "bg-neon-green/20 text-neon-green border-neon-green/60 shadow-neon-bullish" : "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60"
                    ),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 sm:w-5 h-4 sm:h-5 mr-1 fill-current" }),
                      rec.strength.toFixed(0),
                      "%"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Badge,
                  {
                    className: cn(
                      "text-xs sm:text-sm px-2 sm:px-3 py-1 border-2 font-bold whitespace-nowrap",
                      isHighConfidence ? "bg-neon-green/20 text-neon-green border-neon-green/60" : "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60"
                    ),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-3 sm:w-4 h-3 sm:h-4 mr-1" }),
                      Math.round(rec.confidence * 100),
                      "% confidence"
                    ]
                  }
                )
              ] })
            ] }),
            rec.market && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:gap-4 mb-4 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-2 sm:p-3 rounded-lg bg-accent/30 border border-neon-cyan/30 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "Current Price" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base sm:text-lg font-bold text-neon-cyan truncate", children: [
                    "$",
                    Number.parseFloat(
                      rec.market.lastPrice
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-2 sm:p-3 rounded-lg bg-neon-green/10 border border-neon-green/40 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "24h Change" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 sm:w-5 h-4 sm:h-5 text-neon-green flex-shrink-0" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base sm:text-lg font-bold text-neon-green truncate", children: [
                      rec.market.priceChangePercent.toFixed(2),
                      "%"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-2 sm:p-3 rounded-lg bg-accent/30 border border-neon-blue/30 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "24h Volume" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base sm:text-lg font-bold text-neon-blue truncate", children: [
                    "$",
                    (Number.parseFloat(rec.market.quoteVolume) / 1e6).toFixed(1),
                    "M"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-2 sm:p-3 rounded-lg bg-accent/30 border border-neon-purple/30 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "Prediction" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base sm:text-lg font-bold text-neon-purple truncate", children: [
                    "$",
                    rec.market.analysis.prediction.toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                PredictiveConfidencePanel,
                {
                  analysis: rec.market.analysis,
                  symbol: rec.symbol,
                  compact: true
                }
              ) }),
              hasLearning && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AIPerformancePanel, { symbol: rec.symbol, compact: true }) }),
              (rec.market.analysis.manipulationZones.length > 0 || rec.market.analysis.institutionalOrders.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4 min-w-0", children: [
                rec.market.analysis.manipulationZones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-orange/20 text-neon-orange border border-neon-orange/60 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: "/assets/generated/manipulation-zone-icon-transparent.dim_48x48.png",
                      alt: "",
                      className: "w-3 h-3 mr-1"
                    }
                  ),
                  rec.market.analysis.manipulationZones.length,
                  " ",
                  "Manipulation Zone",
                  rec.market.analysis.manipulationZones.length > 1 ? "s" : ""
                ] }),
                rec.market.analysis.institutionalOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-purple/20 text-neon-purple border border-neon-purple/60 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: "/assets/generated/institutional-order-icon-transparent.dim_48x48.png",
                      alt: "",
                      className: "w-3 h-3 mr-1"
                    }
                  ),
                  rec.market.analysis.institutionalOrders.length,
                  " ",
                  "Institutional Order",
                  rec.market.analysis.institutionalOrders.length > 1 ? "s" : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-neon-cyan", children: "Key Indicators:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: rec.market.analysis.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Badge,
                  {
                    variant: "outline",
                    className: "text-xs border-neon-cyan/40 text-neon-cyan",
                    children: tag
                  },
                  tag
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed break-words", children: [
                  "Strong ",
                  rec.market.analysis.trend,
                  " trend detected with ",
                  rec.strength.toFixed(0),
                  "% strength. Technical analysis shows",
                  " ",
                  rec.market.analysis.confidence >= 0.7 ? "high" : "moderate",
                  " ",
                  "confidence based on price action, volume analysis, and market structure.",
                  hasLearning && " Enhanced by AI learning from historical predictions."
                ] })
              ] })
            ] })
          ] })
        },
        `${rec.symbol}-${rec.timestamp}`
      );
    }) }) }) })
  ] });
}
export {
  TopRecommendations as default
};
