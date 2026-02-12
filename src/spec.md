# Specification

## Summary
**Goal:** Improve the Radar anomaly detection to surface meaningful early signals with fewer false positives, and give users better control over which alerts they see via smarter filters and a sensitivity setting.

**Planned changes:**
- Update Radar anomaly scoring to use adaptive, market-relative baselines (percentile/relative measures) instead of fixed thresholds while preserving the existing `useRadarAlerts` hook output fields and severity-first sorting.
- Adjust “earlier detection” logic so smaller moves can trigger when corroborated by at least one additional signal (e.g., volume spike, extreme volatility, funding irregularity, open interest spike), with confidence normalized to 0..1 and monotonic with severity.
- Add Radar UI filters to include/exclude alerts by anomaly type and to filter by severity (in addition to existing trend and min-confidence filters), with filter state persisted across reloads.
- Add a user-facing “Radar Sensitivity” selector (Conservative / Balanced / Aggressive) that immediately affects alert generation/display and is applied consistently to both the Radar list and Dynamic Alerts notifications, persisting across reloads.

**User-visible outcome:** Users see Radar alerts that adapt to current market conditions, can detect significant moves earlier with corroborating signals, and can narrow alerts by anomaly type, severity, and sensitivity—matching both the Radar tab and Dynamic Alerts notifications.
