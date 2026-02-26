# Specification

## Summary
**Goal:** Build a professional SMC-based crypto trading platform with Binance Futures integration, real-time market data, technical analysis, and position monitoring — all running entirely in the browser.

**Planned changes:**
- Add a real-time market data dashboard fetching Binance Futures USD-M ticker data (price, 24h change, volume, funding rate, open interest) directly from the browser via public Binance REST API, with auto-refresh every 10 seconds
- Render interactive candlestick charts with timeframe selection (1m, 5m, 15m, 1h, 4h, 1d) for selected symbols
- Implement Smart Money Concepts (SMC) indicators on the chart: Order Blocks, Fair Value Gaps, BOS, CHoCH, liquidity zones, swing highs/lows, and Premium/Discount zones, with a side panel summarizing detected signals
- Add classic technical indicators: RSI (14), MACD (12/26/9), EMA 20/50/200, SMA 50/200, and Bollinger Bands (20, 2) — overlaid on the chart and summarized in a compact panel
- Implement browser-side Binance API Key/Secret Key authentication using HMAC-SHA256 signing (Web Crypto API), storing credentials only in localStorage and never sending them to the backend
- Display authenticated user's open USD-M Futures positions (entry price, mark price, unrealized PnL, liquidation price, leverage, side) with polling every 5–10 seconds
- Show visual PnL alerts (badge/animation) when unrealized PnL exceeds a configurable threshold (default ±5%), with color-coded green/red PnL values
- Apply a consistent dark neon trading terminal theme across all panels (dark background, neon green/red/amber accents, monospace fonts for data values, multi-panel grid layout)

**User-visible outcome:** Users can view live Binance Futures market data and SMC/technical analysis on interactive charts, connect their Binance API keys to monitor open positions in near real-time with PnL alerts, all within a professional dark-themed trading terminal interface.
