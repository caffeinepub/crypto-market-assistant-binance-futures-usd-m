import { a as createLucideIcon, E as useInternetIdentity, f as useQueryClient, r as reactExports, F as createActorWithConfig, j as jsxRuntimeExports, T as TrendingUp, B as Button } from "./index-BMAOQGGr.js";
import { A as Alert, a as AlertDescription } from "./alert-DeTqM6RN.js";
import { u as useQuery, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, B as Badge, a as CardContent } from "./card-BIDaU0aL.js";
import { S as Skeleton } from "./skeleton-CXQ8sRzl.js";
import { f as fetchBinanceBTCFutures, a as fetchBinanceBTCSpot, C as CircleAlert } from "./binanceFetch-CHtJR5Bx.js";
import { T as TabPageCard } from "./TabPageCard-C88AofjL.js";
import { T as TrendingDown } from "./trending-down-kR7GhulM.js";
import { R as RefreshCw } from "./refresh-cw-CqqcaVpj.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", key: "1b4qmf" }],
  ["path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", key: "i71pzd" }],
  ["path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", key: "10jefs" }],
  ["path", { d: "M10 6h4", key: "1itunk" }],
  ["path", { d: "M10 10h4", key: "tcdvrf" }],
  ["path", { d: "M10 14h4", key: "kelpxr" }],
  ["path", { d: "M10 18h4", key: "1ulq68" }]
];
const Building2 = createLucideIcon("building-2", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2", key: "ngkwjq" }],
  ["rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2", key: "iecqi9" }],
  ["line", { x1: "6", x2: "6.01", y1: "6", y2: "6", key: "16zg32" }],
  ["line", { x1: "6", x2: "6.01", y1: "18", y2: "18", key: "nzw8ys" }]
];
const Server = createLucideIcon("server", __iconNode);
function storeSessionParameter(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to store session parameter ${key}:`, error);
  }
}
function getSessionParameter(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to retrieve session parameter ${key}:`, error);
    return null;
  }
}
function clearParamFromHash(paramName) {
  if (!window.history.replaceState) {
    return;
  }
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) {
    return;
  }
  const hashContent = hash.substring(1);
  const queryStartIndex = hashContent.indexOf("?");
  if (queryStartIndex === -1) {
    return;
  }
  const routePath = hashContent.substring(0, queryStartIndex);
  const queryString = hashContent.substring(queryStartIndex + 1);
  const params = new URLSearchParams(queryString);
  params.delete(paramName);
  const newQueryString = params.toString();
  let newHash = routePath;
  if (newQueryString) {
    newHash += `?${newQueryString}`;
  }
  const newUrl = window.location.pathname + window.location.search + (newHash ? `#${newHash}` : "");
  window.history.replaceState(null, "", newUrl);
}
function getSecretFromHash(paramName) {
  const existingSecret = getSessionParameter(paramName);
  if (existingSecret !== null) {
    return existingSecret;
  }
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) {
    return null;
  }
  const hashContent = hash.substring(1);
  const params = new URLSearchParams(hashContent);
  const secret = params.get(paramName);
  if (secret) {
    storeSessionParameter(paramName, secret);
    clearParamFromHash(paramName);
    return secret;
  }
  return null;
}
function getSecretParameter(paramName) {
  return getSecretFromHash(paramName);
}
const ACTOR_QUERY_KEY = "actor";
function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, identity == null ? void 0 : identity.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;
      if (!isAuthenticated) {
        return await createActorWithConfig();
      }
      const actorOptions = {
        agentOptions: {
          identity
        }
      };
      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      await actor._initializeAccessControlWithSecret(adminToken);
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    // This will cause the actor to be recreated when the identity changes
    enabled: true
  });
  reactExports.useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);
  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching
  };
}
function detectInstitutionalSignals(price, open, high, low, volume, priceChange) {
  const signals = [];
  if (!Number.isFinite(price) || !Number.isFinite(open) || !Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(volume) || !Number.isFinite(priceChange)) {
    console.warn("Invalid input data for institutional signal detection");
    return signals;
  }
  const volumeDelta = volume / 1e9;
  if (volumeDelta > 8 && Math.abs(priceChange) < 2) {
    signals.push({
      direction: price > open ? "up" : "down",
      confidence: Math.min(volumeDelta / 12, 0.95),
      price: (open + price) / 2
    });
  }
  if (Math.abs(priceChange) > 5 && volumeDelta > 6) {
    signals.push({
      direction: priceChange > 0 ? "up" : "down",
      confidence: Math.min((Math.abs(priceChange) + volumeDelta) / 18, 0.9),
      price: (low + high) / 2
    });
  }
  const range = high - low;
  if (range > 0 && volumeDelta > 7) {
    const pricePosition = (price - low) / range;
    if (pricePosition < 0.2 || pricePosition > 0.8) {
      signals.push({
        direction: pricePosition < 0.2 ? "up" : "down",
        confidence: Math.min(volumeDelta / 10, 0.85),
        price: pricePosition < 0.2 ? low : high
      });
    }
  }
  return signals;
}
function useInstitutionalOrdersFutures() {
  return useQuery({
    queryKey: ["institutional-orders-futures"],
    queryFn: async () => {
      try {
        const data = await fetchBinanceBTCFutures();
        const price = Number.parseFloat(data.lastPrice);
        const open = Number.parseFloat(data.openPrice);
        const high = Number.parseFloat(data.highPrice);
        const low = Number.parseFloat(data.lowPrice);
        const volume = Number.parseFloat(data.quoteVolume);
        const priceChange = Number.parseFloat(data.priceChangePercent);
        const signals = detectInstitutionalSignals(
          price,
          open,
          high,
          low,
          volume,
          priceChange
        );
        return {
          signals,
          lastUpdated: Date.now()
        };
      } catch (error) {
        console.error("Error fetching Futures institutional orders:", error);
        throw error;
      }
    },
    refetchInterval: 6e4,
    // Refresh every 60 seconds
    staleTime: 45e3,
    retry: 2
  });
}
function useInstitutionalOrdersSpot() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["institutional-orders-spot"],
    queryFn: async () => {
      let usedBackendFallback = false;
      let data;
      try {
        data = await fetchBinanceBTCSpot();
      } catch (browserError) {
        console.warn(
          "Browser fetch failed for Spot, attempting backend fallback:",
          browserError
        );
        if (!actor) {
          throw new Error(
            "Browser fetch failed and backend actor not available. Please refresh the page."
          );
        }
        try {
          const backendResponse = await actor.getBinanceSpotTickerBTCUSDT();
          if (!backendResponse || backendResponse.trim() === "") {
            throw new Error("Backend returned empty response for Spot data.");
          }
          data = JSON.parse(backendResponse);
          usedBackendFallback = true;
          console.info("Successfully fetched Spot data via backend fallback");
        } catch (backendError) {
          console.error("Backend fallback also failed:", backendError);
          throw new Error(
            `Browser fetch failed: ${browserError instanceof Error ? browserError.message : "Unknown error"}. Backend fallback also failed.`
          );
        }
      }
      try {
        const price = Number.parseFloat(data.lastPrice);
        const open = Number.parseFloat(data.openPrice);
        const high = Number.parseFloat(data.highPrice);
        const low = Number.parseFloat(data.lowPrice);
        const volume = Number.parseFloat(data.quoteVolume);
        const priceChange = Number.parseFloat(data.priceChangePercent);
        if (!Number.isFinite(price) || !Number.isFinite(open) || !Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(volume)) {
          throw new Error("Invalid numeric data received from Spot API");
        }
        const signals = detectInstitutionalSignals(
          price,
          open,
          high,
          low,
          volume,
          priceChange
        );
        return {
          signals,
          lastUpdated: Date.now(),
          usedBackendFallback
        };
      } catch (parseError) {
        console.error("Error parsing Spot data:", parseError);
        throw new Error(
          `Failed to parse Spot data: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`
        );
      }
    },
    refetchInterval: 6e4,
    // Refresh every 60 seconds
    staleTime: 45e3,
    retry: 2
  });
}
function InstitutionalOrders() {
  var _a, _b;
  const queryClient = useQueryClient();
  const futuresQuery = useInstitutionalOrdersFutures();
  const spotQuery = useInstitutionalOrdersSpot();
  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["institutional-orders-futures"]
    });
    queryClient.invalidateQueries({ queryKey: ["institutional-orders-spot"] });
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never";
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date(timestamp));
  };
  const getErrorCategory = (errorMessage) => {
    const msg = errorMessage.toLowerCase();
    if (msg.includes("network") || msg.includes("fetch")) {
      return {
        category: "Network Error",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" })
      };
    }
    if (msg.includes("blocked") || msg.includes("restricted") || msg.includes("cors") || msg.includes("403")) {
      return {
        category: "Binance Spot API Blocked",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" })
      };
    }
    if (msg.includes("429") || msg.includes("rate limit")) {
      return {
        category: "Rate Limit",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" })
      };
    }
    if (msg.includes("500") || msg.includes("502") || msg.includes("503") || msg.includes("server")) {
      return {
        category: "Server Error",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" })
      };
    }
    return { category: "Error", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }) };
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TabPageCard,
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-8 w-8 text-neon-purple" }),
      title: "Institutional Orders",
      description: "BTC-only institutional buy/sell signals for Futures (USD-M) and Spot markets",
      badge: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: handleRefresh,
          disabled: futuresQuery.isFetching || spotQuery.isFetching,
          className: "gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              RefreshCw,
              {
                className: `h-4 w-4 ${futuresQuery.isFetching || spotQuery.isFetching ? "animate-spin" : ""}`
              }
            ),
            "Refresh"
          ]
        }
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-neon-cyan/30 bg-card/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl text-neon-cyan", children: "BTC Futures (USD-M)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "mt-1", children: "Institutional signals from Binance Futures" })
            ] }),
            futuresQuery.dataUpdatedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs", children: [
              "Last updated: ",
              formatTimestamp(futuresQuery.dataUpdatedAt)
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            futuresQuery.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full" })
            ] }),
            futuresQuery.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Failed to load Futures data" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm mt-1", children: ((_a = futuresQuery.error) == null ? void 0 : _a.message) || "Unknown error" })
              ] })
            ] }),
            futuresQuery.isSuccess && futuresQuery.data && (futuresQuery.data.signals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "No institutional signals detected for BTC Futures at this time." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: futuresQuery.data.signals.map((signal) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Card,
              {
                className: `border-2 ${signal.direction === "up" ? "border-neon-green/40 bg-neon-green/5" : "border-neon-red/40 bg-neon-red/5"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    signal.direction === "up" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-6 w-6 text-neon-green" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-6 w-6 text-neon-red" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-lg", children: [
                        signal.direction === "up" ? "BUY" : "SELL",
                        " ",
                        "Signal"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
                        "Price Level: ",
                        formatPrice(signal.price)
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Badge,
                    {
                      variant: "outline",
                      className: `text-sm ${signal.direction === "up" ? "border-neon-green text-neon-green" : "border-neon-red text-neon-red"}`,
                      children: [
                        (signal.confidence * 100).toFixed(0),
                        "% confidence"
                      ]
                    }
                  )
                ] }) })
              },
              String(signal.price) + signal.direction + String(signal.confidence)
            )) }))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-neon-purple/30 bg-card/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl text-neon-purple", children: "BTC Spot" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "mt-1", children: "Institutional signals from Binance Spot" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              ((_b = spotQuery.data) == null ? void 0 : _b.usedBackendFallback) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Badge,
                {
                  variant: "outline",
                  className: "text-xs gap-1 border-neon-cyan/50 text-neon-cyan",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "h-3 w-3" }),
                    "Backend"
                  ]
                }
              ),
              spotQuery.dataUpdatedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs", children: [
                "Last updated: ",
                formatTimestamp(spotQuery.dataUpdatedAt)
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            spotQuery.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full" })
            ] }),
            spotQuery.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { variant: "destructive", children: (() => {
              var _a2, _b2;
              const { category, icon } = getErrorCategory(
                ((_a2 = spotQuery.error) == null ? void 0 : _a2.message) || ""
              );
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                icon,
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: category }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm mt-1", children: ((_b2 = spotQuery.error) == null ? void 0 : _b2.message) || "Unknown error" }),
                  category === "Binance Spot API Blocked" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-2 opacity-80", children: "The browser cannot reach Binance Spot API. Backend fallback will be attempted automatically." })
                ] })
              ] });
            })() }),
            spotQuery.isSuccess && spotQuery.data && (spotQuery.data.signals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "No institutional signals detected for BTC Spot at this time." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: spotQuery.data.signals.map((signal) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Card,
              {
                className: `border-2 ${signal.direction === "up" ? "border-neon-green/40 bg-neon-green/5" : "border-neon-red/40 bg-neon-red/5"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    signal.direction === "up" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-6 w-6 text-neon-green" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-6 w-6 text-neon-red" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-lg", children: [
                        signal.direction === "up" ? "BUY" : "SELL",
                        " ",
                        "Signal"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
                        "Price Level: ",
                        formatPrice(signal.price)
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Badge,
                    {
                      variant: "outline",
                      className: `text-sm ${signal.direction === "up" ? "border-neon-green text-neon-green" : "border-neon-red text-neon-red"}`,
                      children: [
                        (signal.confidence * 100).toFixed(0),
                        "% confidence"
                      ]
                    }
                  )
                ] }) })
              },
              String(signal.price) + signal.direction + String(signal.confidence)
            )) }))
          ] })
        ] })
      ] })
    }
  );
}
export {
  InstitutionalOrders as default
};
