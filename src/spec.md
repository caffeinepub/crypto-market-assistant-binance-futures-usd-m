# Specification

## Summary
**Goal:** Add manual trade monitoring functionality that allows users to track their crypto trades with entry point tracking, real-time PnL calculations, suggested take-profit zones, and stop-loss recommendations.

**Planned changes:**
- Add new Trade Monitoring tab to main navigation with form for manual trade entry (asset symbol, leverage 1x-125x, Long/Short direction, entry price)
- Display real-time monitoring panel showing current price, unrealized PnL percentage, and calculated liquidation price based on leverage
- Generate and show 3 suggested take-profit zones (TP1 at 1-2%, TP2 at 3-5%, TP3 at 5-10% from entry) adjusted for position direction
- Calculate and display recommended stop-loss price at 1-2% from entry with volatility adjustments
- Enable saving and tracking multiple monitored trades simultaneously with persistent storage in localStorage/IndexedDB
- Integrate with existing useQueries hooks for real-time Binance Futures price updates (frontend-only, no backend calls)

**User-visible outcome:** Users can manually input trade details, monitor real-time PnL and liquidation risk, view AI-suggested take-profit zones and stop-loss recommendations, and track multiple active positions simultaneously with all data persisting across sessions.
