# Specification

## Summary
**Goal:** Add trade entry/exit points and stop loss calculation to the Opportunities feature using existing frontend data.

**Planned changes:**
- Display optimal buy point (entry price) for selected opportunities in OpportunityDetailsPanel
- Show take profit target (sell point) based on volatility and momentum indicators
- Calculate and display stop loss price using ATR or support levels
- All calculations use only existing Binance data fetched by frontend hooks without new backend calls

**User-visible outcome:** When selecting an opportunity, users see the recommended entry price, take profit target, and stop loss level calculated from current market data.
