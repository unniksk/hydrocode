# Changelog

## [1.1.0] — 2026-03-16

### Added
- `HydroCode: Set Default Sip Size` command — change the 💧 click amount from the command palette
- Unit tests for notification message logic (`npm run test:unit`)
- All 7 day labels (Mon–Sun) shown on the 365-day heatmap

### Changed
- Status bar items moved to the left side
- Progress bar height increased (6px → 12px)
- Notification buttons updated to `💧 Drank`, `⏱ Snooze`, `🔕 DND`
- Clicking 💧 no longer shows a toast — message only appears when daily goal is reached
- Reset Today now instantly refreshes the dashboard

### Fixed
- Dashboard Reset Today button now correctly refreshes the view
- Removed unimplemented `notificationFadeSeconds` setting

---

## [1.0.0] — 2026-03-14

### Initial Release

- **Status bar** — single 💧 emoji icon that logs your default sip on click, plus a blue `▰▰▰▰▰▱▱▱▱▱` progress bar (10 segments, each = 10% of goal)
- **Water logging** — click the drop to instantly log your default sip (250ml); use `HydroCode: Log Water Intake` for a custom amount quick-pick
- **Smart reminders** — periodic notifications at a configurable interval (default 30 min) with away detection; skips reminders when VS Code is unfocused or you've been inactive
- **Do Not Disturb** — toggle DND from any reminder notification or the command palette
- **Dashboard** — 365-day heatmap (GitHub-style, blue scale), 10-droplet today progress, intake log with per-entry delete, streak / weekly total / daily average stats
- **Undo & reset** — remove individual log entries from the dashboard or undo the last entry via the progress bar menu; full daily reset available
- **Cross-device sync** — all data stored under a single `globalState` key registered with `setKeysForSync`; syncs automatically via VS Code Settings Sync
- **First-install welcome** — one-time notification with quick links to set your goal or open the dashboard
