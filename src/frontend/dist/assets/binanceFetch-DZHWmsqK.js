import { a as createLucideIcon } from "./index-W02uwOhi.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode);
function classifyError(err, status) {
  if (err instanceof TypeError && err.message.includes("fetch")) {
    return {
      type: "network",
      message: "Network error. Check your connection."
    };
  }
  return { type: "unknown", message: String(err) };
}
const FUTURES_BASE = "https://fapi.binance.com";
const SPOT_BASE = "https://api.binance.com";
async function fetchBinanceMarketData() {
  try {
    const response = await fetch(`${FUTURES_BASE}/fapi/v1/ticker/24hr`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    const classified = classifyError(error);
    throw new Error(classified.message);
  }
}
async function fetchBinanceFuturesTicker(symbol) {
  try {
    const response = await fetch(
      `${FUTURES_BASE}/fapi/v1/ticker/24hr?symbol=${symbol}`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    const classified = classifyError(error);
    throw new Error(classified.message);
  }
}
async function fetchBinanceAsset(symbol) {
  return fetchBinanceFuturesTicker(symbol);
}
async function fetchBinanceBTCFutures() {
  return fetchBinanceFuturesTicker("BTCUSDT");
}
async function fetchBinanceBTCSpot() {
  try {
    const response = await fetch(
      `${SPOT_BASE}/api/v3/ticker/24hr?symbol=BTCUSDT`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    const classified = classifyError(error);
    throw new Error(classified.message);
  }
}
function filterMajorPairs(tickers) {
  const majorSymbols = /* @__PURE__ */ new Set([
    "BTCUSDT",
    "ETHUSDT",
    "BNBUSDT",
    "SOLUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "MATICUSDT",
    "DOTUSDT",
    "LTCUSDT",
    "AVAXUSDT",
    "LINKUSDT",
    "ATOMUSDT",
    "UNIUSDT",
    "ETCUSDT",
    "XLMUSDT",
    "NEARUSDT",
    "ALGOUSDT",
    "APTUSDT",
    "ARBUSDT",
    "OPUSDT"
  ]);
  return tickers.filter((t) => majorSymbols.has(t.symbol));
}
export {
  CircleAlert as C,
  fetchBinanceBTCSpot as a,
  fetchBinanceMarketData as b,
  filterMajorPairs as c,
  fetchBinanceAsset as d,
  fetchBinanceBTCFutures as f
};
