# Specification

## Summary
**Goal:** Add an opportunity details view in Opportunities and show a modality-aware trade recommendation (Long/Short + Entry/TP/SL) with transparent rationale based on existing app data.

**Planned changes:**
- Allow selecting an opportunity from any Opportunities modality tab (scalping/swing/breakout/reversal/smc/fvg) to open a dedicated details UI (dialog/drawer/side panel) for the chosen symbol.
- Display, at minimum, the selected symbol and current price in the details UI, and allow closing it without losing the currently selected modality tab.
- Compute and display a deterministic “Trade Recommendation” for the selected symbol that depends on the active modality tab, including Direction (Long/Short), Entry, Take Profit, and Stop Loss, derived from existing live market data and existing analysis outputs.
- Add a “Rationale/Signals” section that reuses existing computed indicators/tags (e.g., trend, confidence, support/resistance references, institutional/manipulation signals) to justify the recommendation, updating with symbol/modality changes.
- Provide a graceful fallback UI state when required inputs are missing so the Opportunities page remains stable.

**User-visible outcome:** Users can click an opportunity in any modality tab to open a details view showing the symbol, current price, and a modality-specific trade recommendation (Long/Short with Entry/TP/SL) plus a brief rationale derived from existing signals.
