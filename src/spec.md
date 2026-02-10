# Specification

## Summary
**Goal:** Make the Radar and Trading Opportunities tabs visually consistent with the established layout and Card-based styling used by other tabs (e.g., Market Overview / Top Recommendations).

**Planned changes:**
- Update `frontend/src/components/RadarDashboard.tsx` to match the common tab page structure: remove/adjust redundant outer padding/margins, use a single consistent top-level container, and apply the same theme-driven Card border/background/backdrop styling as other tabs.
- Update `frontend/src/components/Opportunities.tsx` to render its header (title/description) within a CardHeader/Card layout consistent with other tabs, and align its primary container styling (borders/background/backdrop/shadow) with the shared tab template.
- Keep all functionality intact (e.g., Opportunities modality switching and loading/error/empty states) while limiting changes to visual/layout consistency only.

**User-visible outcome:** Radar and Trading Opportunities pages look and feel like the other app tabs, with consistent spacing and Card-based containers, without changing how either tab functions.
