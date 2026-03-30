import { a as createLucideIcon, r as reactExports, j as jsxRuntimeExports, c as cn, B as Button } from "./index-W02uwOhi.js";
import { C as Card, b as CardHeader, a as CardContent, B as Badge, c as CardTitle, d as CardDescription } from "./card-CjFWqlgf.js";
import { S as ScrollArea, I as Info } from "./scroll-area-D1OoYdcG.js";
import { S as Skeleton } from "./skeleton-DX2LXGa-.js";
import { learningEngine } from "./learningEngine-DnDrJIqT.js";
import { B as Brain } from "./brain-CQ7V_FHR.js";
import { T as Target } from "./target-BbSsS_vs.js";
import { Z as Zap } from "./zap-DOPjtBzC.js";
import { A as Alert, a as AlertTitle, b as AlertDescription } from "./alert-D9FEYK2j.js";
import { T as TriangleAlert } from "./useQueries-dD3CIt-h.js";
import { C as CircleAlert } from "./binanceFetch-DZHWmsqK.js";
import { R as RefreshCw } from "./refresh-cw-CIoyRFar.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
      key: "1yiouv"
    }
  ],
  ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }]
];
const Award = createLucideIcon("award", __iconNode);
function AIPerformancePanel({
  symbol,
  compact = false
}) {
  const [stats, setStats] = reactExports.useState(null);
  const [allStats, setAllStats] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        await learningEngine.initialize();
        if (symbol) {
          const assetStats = await learningEngine.getAssetStats(symbol);
          setStats(assetStats);
        } else {
          const all = await learningEngine.getAllAssetStats();
          setAllStats(
            all.sort((a, b) => b.learningLevel - a.learningLevel).slice(0, 10)
          );
        }
      } catch (error) {
        console.error("Error loading learning stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [symbol]);
  const getLearningLevelColor = (level) => {
    if (level >= 0.7) return "from-neon-green via-neon-cyan to-neon-purple";
    if (level >= 0.4) return "from-neon-cyan via-neon-blue to-neon-purple";
    return "from-neon-purple via-neon-pink to-neon-orange";
  };
  const getLearningLevelLabel = (level) => {
    if (level >= 0.7) return "Avançado";
    if (level >= 0.4) return "Intermediário";
    return "Iniciante";
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-border bg-card/60 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-48" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-64 mt-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32" }) })
    ] });
  }
  if (compact && stats) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-4 rounded-lg bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 border-2 border-neon-purple/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-5 h-5 text-neon-purple" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-neon-purple", children: "Nível de Aprendizado IA" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-neon-purple/20 text-neon-purple border-2 border-neon-purple/60 font-bold", children: getLearningLevelLabel(stats.learningLevel) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-3 bg-muted rounded-full border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
            `bg-gradient-to-r ${getLearningLevelColor(stats.learningLevel)}`
          ),
          style: { width: `${stats.learningLevel * 100}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-3 h-3 text-neon-green" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Precisão:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-neon-green", children: [
            Math.round(stats.accuracyRate * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3 h-3 text-neon-cyan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Predições:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-neon-cyan", children: stats.totalPredictions })
        ] })
      ] })
    ] });
  }
  if (symbol && stats) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-neon-purple/40 bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 backdrop-blur-sm shadow-neon-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-7 h-7 text-neon-purple animate-pulse-neon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl text-neon-purple neon-text", children: "Análise de Performance da IA" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "text-sm mt-1", children: [
            "Aprendizado contínuo para ",
            symbol
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-muted-foreground", children: "Nível de Aprendizado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                className: cn(
                  "text-base px-4 py-2 border-2 font-bold",
                  stats.learningLevel >= 0.7 ? "bg-neon-green/20 text-neon-green border-neon-green/60" : stats.learningLevel >= 0.4 ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60" : "bg-neon-purple/20 text-neon-purple border-neon-purple/60"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-5 h-5 mr-2" }),
                  getLearningLevelLabel(stats.learningLevel)
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-8 bg-muted rounded-lg border-2 border-border overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "absolute inset-0 rounded-lg transition-all duration-700",
                  `bg-gradient-to-r ${getLearningLevelColor(stats.learningLevel)}`
                ),
                style: { width: `${stats.learningLevel * 100}%` }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute inset-0 rounded-lg animate-pulse",
                style: {
                  width: `${stats.learningLevel * 100}%`,
                  background: "linear-gradient(90deg, transparent, oklch(var(--neon-cyan) / 0.4), transparent)"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-foreground drop-shadow-lg", children: [
              Math.round(stats.learningLevel * 100),
              "%"
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-neon-green/10 border-2 border-neon-green/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-5 h-5 text-neon-green" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium", children: "Taxa de Acertos" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-neon-green", children: [
              Math.round(stats.accuracyRate * 100),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
              stats.correctPredictions,
              " de ",
              stats.totalPredictions,
              " predições"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-neon-cyan/10 border-2 border-neon-cyan/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-5 h-5 text-neon-cyan" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium", children: "Confiança Média" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-neon-cyan", children: [
              Math.round(stats.averageConfidence * 100),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Baseado em histórico" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold text-neon-purple flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-4 h-4" }),
            "Pesos Otimizados dos Indicadores"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Object.entries(stats.indicatorWeights).map(
            ([indicator, weight]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-medium capitalize", children: indicator === "smc" ? "SMC" : indicator === "volumeDelta" ? "Volume Delta" : indicator === "fvg" ? "FVG" : "Liquidez" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-neon-cyan", children: [
                  Math.round(weight * 100),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-2 border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-500",
                  style: { width: `${weight * 100}%` }
                }
              ) })
            ] }, indicator)
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-lg bg-neon-purple/10 border border-neon-purple/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-neon-purple", children: "Aprendizado Contínuo:" }),
          " ",
          "A IA ajusta automaticamente os pesos dos indicadores técnicos baseado no histórico de acertos. Quanto maior o nível de aprendizado, mais precisa a IA se torna nas predições para este ativo."
        ] }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-neon-purple/40 bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 backdrop-blur-sm shadow-neon-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-7 h-7 text-neon-purple animate-pulse-neon" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl text-neon-purple neon-text", children: "Performance da IA por Ativo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-sm mt-1", children: "Top 10 ativos com maior nível de aprendizado" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: allStats.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-16 h-16 text-muted-foreground/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-muted-foreground text-center", children: "Nenhum dado de aprendizado disponível" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground/70 text-center max-w-md", children: "A IA começará a aprender conforme predições forem sendo feitas e validadas ao longo do tempo." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[500px] pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: allStats.map((assetStats, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: cn(
          "border-2 transition-all duration-300 hover:scale-[1.02]",
          assetStats.learningLevel >= 0.7 ? "border-neon-green/40 bg-neon-green/5" : assetStats.learningLevel >= 0.4 ? "border-neon-cyan/40 bg-neon-cyan/5" : "border-neon-purple/40 bg-neon-purple/5"
        ),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold",
                    assetStats.learningLevel >= 0.7 ? "bg-neon-green/20 border-neon-green/60 text-neon-green" : assetStats.learningLevel >= 0.4 ? "bg-neon-cyan/20 border-neon-cyan/60 text-neon-cyan" : "bg-neon-purple/20 border-neon-purple/60 text-neon-purple"
                  ),
                  children: index + 1
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-foreground", children: assetStats.symbol }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  assetStats.totalPredictions,
                  " predições"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                className: cn(
                  "text-sm px-3 py-1 border-2 font-bold",
                  assetStats.learningLevel >= 0.7 ? "bg-neon-green/20 text-neon-green border-neon-green/60" : assetStats.learningLevel >= 0.4 ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60" : "bg-neon-purple/20 text-neon-purple border-neon-purple/60"
                ),
                children: getLearningLevelLabel(assetStats.learningLevel)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-2 bg-muted rounded-full border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                  `bg-gradient-to-r ${getLearningLevelColor(assetStats.learningLevel)}`
                ),
                style: {
                  width: `${assetStats.learningLevel * 100}%`
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 rounded bg-accent/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Precisão:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-neon-green", children: [
                  Math.round(assetStats.accuracyRate * 100),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 rounded bg-accent/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Confiança:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-neon-cyan", children: [
                  Math.round(assetStats.averageConfidence * 100),
                  "%"
                ] })
              ] })
            ] })
          ] })
        ] })
      },
      assetStats.symbol
    )) }) }) })
  ] });
}
function TabFetchErrorState({
  error,
  onReload,
  title = "Unable to Load Data",
  description = "There was an error loading the data for this tab."
}) {
  var _a, _b, _c;
  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };
  const isInterfaceMismatch = ((_a = error == null ? void 0 : error.message) == null ? void 0 : _a.includes("interface mismatch")) || ((_b = error == null ? void 0 : error.message) == null ? void 0 : _b.includes("not found")) || ((_c = error == null ? void 0 : error.message) == null ? void 0 : _c.includes("Invalid snapshot"));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[400px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "max-w-lg w-full border-destructive/50 shadow-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-12 w-12 text-destructive animate-pulse" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-base mt-2", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Error Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { className: "text-xs font-mono break-all mt-2", children: error.message })
      ] }),
      isInterfaceMismatch && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-neon-cyan/40 bg-neon-cyan/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4 text-neon-cyan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { className: "text-neon-cyan", children: "Possible PWA Cache Issue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { className: "text-sm text-muted-foreground", children: "This error may be caused by a stale PWA cache after a deployment. Reloading the page should clear the cache and fetch the latest version." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleReload, className: "w-full", size: "lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
        "Reload Page"
      ] })
    ] })
  ] }) });
}
export {
  AIPerformancePanel as A,
  TabFetchErrorState as T
};
