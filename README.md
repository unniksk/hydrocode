# 💧 HydroCode

> **Code better. Drink water.**

**By Unni Krishnan**

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=UnniKrishnan.hydrocode)
[![Version](https://img.shields.io/badge/version-1.1.0-brightgreen)](https://github.com/unnikrishnan/hydrocode)

---

## Status Bar

A single droplet icon and a blue progress bar live in your status bar. Click the 💧 to instantly log your default sip. Click the bar for more options.

![Status Bar](media/screenshot-statusbar.png)

---

## Dashboard

Open the full dashboard with `Cmd+Shift+P` → **HydroCode: Open Dashboard**.

![Dashboard](media/screenshot-dashboard.png)

---

## ✨ Features

- **One-click logging** — click the 💧 to log your default sip instantly
- **Blue progress bar** — 10-segment bar fills as you hydrate
- **Smart reminders** — periodic notifications with Log / Snooze / DND options
- **Away detection** — no spam when you step away from VS Code
- **365-day heatmap** — GitHub-style history of your hydration
- **Today's log** — timestamped list of every entry with undo support

---

## ⌨️ Commands

| Command | Description |
|---|---|
| `HydroCode: Log Water Intake` | Log water with a size picker |
| `HydroCode: Set Default Sip Size` | Change what the 💧 click logs |
| `HydroCode: Set Daily Goal` | Change your daily target |
| `HydroCode: Open Dashboard` | Open the 365-day dashboard |
| `HydroCode: Enable Do Not Disturb` | Pause all reminders |
| `HydroCode: Reset Today's Intake` | Clear today's data |

---

## ⚙️ How to change default sip size and daily goal

**Via Command Palette** (`Cmd+Shift+P`):
- `HydroCode: Set Default Sip Size` — choose from 100ml to 500ml
- `HydroCode: Set Daily Goal` — set your target (500–6000ml)

**Via VS Code Settings** (`Cmd+,` → search "hydrocode"):

| Setting | Default | Description |
|---|---|---|
| `hydrocode.defaultSipMl` | `250` | ml logged on each 💧 click |
| `hydrocode.dailyGoalMl` | `2500` | Daily water target in ml |
| `hydrocode.reminderIntervalMinutes` | `30` | How often reminders appear |
| `hydrocode.awayTimeoutMinutes` | `5` | Inactivity before pausing notifications |

---

## 🚀 Getting Started

1. Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=UnniKrishnan.hydrocode)
2. HydroCode activates automatically on startup
3. Click the 💧 in your status bar to log your first glass

---

*Built with ❤️ by Unni Krishnan*
