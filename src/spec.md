# Specification

## Summary
**Goal:** Let users manually reset the app’s local state and restart from a clean “first launch” experience via a control in Preferences.

**Planned changes:**
- Add a clearly labeled English “Reset / Reload from scratch” button to the existing Preferences screen, styled as a destructive/danger action.
- On click, open a confirmation dialog explaining that local AI learning history and local app caches will be deleted, with Cancel and Confirm actions.
- On confirm, clear local AI evolution storage (IndexedDB), clear relevant localStorage keys used by Preferences/settings/caches, clear the in-memory React Query cache, then force a clean app reload.
- Add UX feedback for the reset flow: disabled/progress state during reset, success messaging, and error handling with a toast/message if clearing storage fails.

**User-visible outcome:** Users can go to Preferences, choose “Reset / Reload from scratch,” confirm the action, and the app restarts in a fresh local state with prior local AI learning and caches removed.
