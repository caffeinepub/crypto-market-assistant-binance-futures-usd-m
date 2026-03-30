import { j as jsxRuntimeExports, c as cn, T as TrendingUp } from "./index-W02uwOhi.js";
import { B as Badge, C as Card, a as CardContent } from "./card-CjFWqlgf.js";
import { Z as Zap } from "./zap-DOPjtBzC.js";
import { T as TriangleAlert } from "./useQueries-dD3CIt-h.js";
function PredictiveConfidencePanel({
  analysis,
  symbol: _symbol,
  compact = false
}) {
  const confidencePercent = Math.round(analysis.confidence * 100);
  const isHighConfidence = analysis.confidence >= 0.7;
  const isMediumConfidence = analysis.confidence >= 0.4 && analysis.confidence < 0.7;
  const gradientPosition = confidencePercent;
  const getConfidenceColor = () => {
    if (isHighConfidence) return "from-neon-green via-neon-cyan to-neon-purple";
    if (isMediumConfidence)
      return "from-neon-cyan via-neon-blue to-neon-purple";
    return "from-neon-purple via-neon-pink to-neon-red";
  };
  const getConfidenceLabel = () => {
    if (isHighConfidence) return "Alta Confiança";
    if (isMediumConfidence) return "Confiança Média";
    return "Baixa Confiança";
  };
  const getConfidenceBadgeClass = () => {
    if (isHighConfidence)
      return "bg-neon-green/20 text-neon-green border-neon-green/60";
    if (isMediumConfidence)
      return "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60";
    return "bg-neon-purple/20 text-neon-purple border-neon-purple/60";
  };
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium", children: "Confiança Preditiva" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Badge,
          {
            className: cn(
              "text-xs px-2 py-1 border-2 font-bold",
              getConfidenceBadgeClass()
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3 h-3 mr-1" }),
              confidencePercent,
              "%"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-2 bg-muted rounded-full border border-border overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
              `bg-gradient-to-r ${getConfidenceColor()}`
            ),
            style: { width: `${gradientPosition}%` }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-y-0 left-0 rounded-full animate-pulse",
            style: {
              width: `${gradientPosition}%`,
              background: "linear-gradient(90deg, transparent, oklch(var(--neon-cyan) / 0.3), transparent)"
            }
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      className: cn(
        "border-2 transition-all duration-300",
        isHighConfidence && "border-neon-green/40 bg-neon-green/5 shadow-neon-bullish",
        isMediumConfidence && "border-neon-cyan/40 bg-neon-cyan/5 shadow-neon-md",
        !isHighConfidence && !isMediumConfidence && "border-neon-purple/40 bg-neon-purple/5"
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 sm:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            isHighConfidence ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5 sm:w-6 sm:h-6 text-neon-green" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 sm:w-6 sm:h-6 text-neon-cyan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-base sm:text-lg font-bold text-foreground", children: "Confiança Preditiva" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              className: cn(
                "text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 border-2 font-bold",
                getConfidenceBadgeClass()
              ),
              children: [
                confidencePercent,
                "%"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-8 sm:h-10 bg-muted rounded-lg border-2 border-border overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "absolute inset-0 rounded-lg transition-all duration-700",
                  `bg-gradient-to-r ${getConfidenceColor()}`
                ),
                style: { width: `${gradientPosition}%` }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute inset-0 rounded-lg animate-pulse",
                style: {
                  width: `${gradientPosition}%`,
                  background: "linear-gradient(90deg, transparent, oklch(var(--neon-cyan) / 0.4), transparent)"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs sm:text-sm font-bold text-foreground drop-shadow-lg", children: getConfidenceLabel() }) })
          ] }),
          analysis.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 pt-2", children: analysis.tags.slice(0, 4).map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "text-xs border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10",
              children: tag
            },
            tag
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
            "Análise baseada em SMC, Volume Delta, Liquidez e Fair Value Gaps.",
            isHighConfidence && " Forte sinal de confiabilidade detectado.",
            isMediumConfidence && " Sinal moderado, monitorar evolução.",
            !isHighConfidence && !isMediumConfidence && " Sinal fraco, aguardar confirmação."
          ] })
        ] })
      ] })
    }
  );
}
export {
  PredictiveConfidencePanel as P
};
