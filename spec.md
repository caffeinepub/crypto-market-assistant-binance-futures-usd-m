# Specification

## Summary
**Goal:** Remove four tabs — ICP Analysis, Radar, Order Book, and Trade Monitor — from the Crypto Futures AI app entirely.

**Planned changes:**
- Remove the ICP Analysis tab and its component, lazy import, and route entry
- Remove the Radar tab (RadarDashboard, DynamicAlerts) and its component, lazy import, and route entry
- Remove the Order Book tab and its component, lazy import, and route entry
- Remove the Trade Monitor tab (TradeMonitoring, MonitoredTradeCard, TradeMonitoringPanel, StopLossRecommendation, TakeProfitZones) and its component, lazy import, and route entry
- Delete all hooks, query files, and utilities exclusively used by the removed tabs (e.g., orderBookDepth.ts, useMonitoredTrade.ts, useMonitoredTrades.ts, useRadarSensitivity.ts, radarFilters.ts, radarSensitivity.ts, stopLossCalculation.ts, takeProfitCalculation.ts, tradeStorage.ts)
- Update PWA manifest to remove shortcuts pointing to the removed tabs

**User-visible outcome:** The app tab bar shows only the remaining tabs; all four removed tabs are gone and the app builds and runs without errors.
