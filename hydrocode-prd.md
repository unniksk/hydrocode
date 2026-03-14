# HydroCode — Product Requirements Document

**Author:** Unni Krishnan
**Version:** 1.0
**Date:** March 2026

---

## Overview

HydroCode is a VS Code extension that reminds developers to drink water throughout the day. It tracks daily water intake, shows progress in the status bar, and provides a 365-day history dashboard — all without leaving the editor.

---

## Problem

Developers lose track of time and forget to hydrate during long coding sessions. Existing reminder apps are separate windows that get ignored or closed.

---

## Goals

- Log water intake with a single click inside VS Code
- Show live progress in the status bar at all times
- Send smart reminders that don't interrupt flow
- Track history and show trends over time
- Sync data across devices via VS Code Settings Sync

---

## Features

### 1. Status Bar

- Displays a droplet icon `$(drop)` followed by 5 progress dots and current ml
- Each dot represents 20% of the daily goal
- Filled `$(drop)` = reached, empty `$(circle-outline)` = remaining
- Example: `$(drop) ●●○○○ 750ml`
- Color changes: normal → warning (below 40%) → danger (below 20%)
- Click to log water instantly

### 2. Water Logging

- Click status bar or run `HydroCode: Log Water Intake` from command palette
- Quick-pick menu with preset options: 100ml, 150ml, 200ml, 250ml (default), 300ml, 350ml, 400ml, 500ml
- Custom amount option for any value
- Default sip size: **250ml**

### 3. Reminders

- Periodic notifications at configurable intervals (default: every 30 min)
- Notification actions: `💧 250ml` · `😴 Snooze 15m` · `🔕 DND`
- Away detection: no notifications if VS Code is unfocused or user inactive for 5+ min
- Do Not Disturb mode toggled from notification or command palette

### 4. Dashboard

- Opens as a side panel via `HydroCode: Open Dashboard`
- Shows today's progress with 10-droplet visual bar
- Today's intake log with timestamps
- Stats: current streak, weekly total, daily average, goal
- 365-day heatmap (GitHub-style, blue color scale)
  - Level 0 = no water, Level 5 = goal reached or exceeded

### 5. First Install

- Welcome notification on first launch only
- Shows daily goal, default sip size info
- Action buttons: `Set My Goal` · `Open Dashboard` · `Got it!`

### 6. Cross-Device Sync

- All data stored under a single `globalState` key: `hydrocode_all_data`
- Registered with `setKeysForSync` — syncs automatically via VS Code Settings Sync
- Requires user to be signed in with Microsoft or GitHub account in VS Code

---

## Settings

| Setting | Default | Description |
|---|---|---|
| `hydrocode.dailyGoalMl` | 2500 | Daily water goal in ml |
| `hydrocode.reminderIntervalMinutes` | 30 | Reminder frequency in minutes |
| `hydrocode.defaultSipMl` | 250 | Default ml logged per click |
| `hydrocode.awayTimeoutMinutes` | 5 | Inactivity threshold before pausing reminders |

---

## Commands

| Command | Description |
|---|---|
| `HydroCode: Log Water Intake` | Log water with quick-pick |
| `HydroCode: Open Dashboard` | Open 365-day history dashboard |
| `HydroCode: Set Daily Goal` | Change daily goal |
| `HydroCode: Enable Do Not Disturb` | Pause all reminders |
| `HydroCode: Disable Do Not Disturb` | Resume reminders |
| `HydroCode: Reset Today's Intake` | Clear today's data |

---

## Out of Scope (v1.0)

- Custom reminder messages
- Weekly/monthly email summaries
- Team hydration challenges
- Apple Health / Google Fit integration

---

## Publisher Info

- **Publisher ID:** UnniKrishnan
- **Extension ID:** UnniKrishnan.hydrocode
- **VS Code compatibility:** ^1.85.0
- **Marketplace URL:** `marketplace.visualstudio.com/items?itemName=UnniKrishnan.hydrocode`
