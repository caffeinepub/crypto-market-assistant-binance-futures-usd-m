# Specification

## Summary
**Goal:** Rebuild clean deployment package for version 49 that preserves all existing functionality from version 48.

**Planned changes:**
- Generate clean version 49 deployment package without modifications
- Verify backend single-actor architecture with UnifiedSnapshot caching remains intact
- Ensure all frontend Binance Futures USD-M data fetching continues to work
- Preserve immutable frontend paths (useInternetIdentity.ts, useActor.ts, main.tsx, UI components)
- Maintain all PWA features including service worker, offline support, and manifest configuration
- Keep all 6 trading modalities (scalping, swing, breakout, reversal, SMC, FVG) functional
- Preserve Internet Identity authentication flow
- Maintain learning engine with IndexedDB prediction tracking

**User-visible outcome:** Users can deploy version 49 to production with all existing features working correctly including market overview, recommendations, radar dashboard, trading opportunities across all modalities, order book analysis, institutional orders detection, and full PWA functionality with offline support.
