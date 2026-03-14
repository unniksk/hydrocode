# 💧 HydroCode — Water Reminder for VS Code

> Stay hydrated while you code. Track your daily water intake right inside VS Code.

**By Unni Krishnan**

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=UnniKrishnan.hydrocode)
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)](https://github.com/unnikrishnan/hydrocode)

---

## ✨ Features

### 💧 Smart Status Bar
- A droplet icon in the status bar shows your **live progress** (e.g. `💧 750ml`)
- Click it to instantly log water from a quick-pick menu
- Color changes: normal → warning (low) → danger (very low) → goal reached
- Tooltip shows remaining ml and links to the dashboard

### 🔔 Smart Notifications
- Periodic reminders with **3 action buttons**: Log water, Snooze 15min, Do Not Disturb
- **Away detection**: no spam when you step away from VS Code or the window is not focused
- Notifications are short and auto-dismiss

### 📊 Beautiful Dashboard
- **Blue heatmap** (GitHub-style) showing 365 days of hydration history
- **10-droplet progress bar** with partial fill based on exact percentage
- Stats: streak, weekly total, daily average, goal
- Today's detailed intake log with timestamps

### ⚙️ Flexible Configuration
- Set your daily goal (presets: 1500–3500ml or custom)
- Choose default sip size (100ml–500ml)
- Adjust reminder interval (5–240 min)
- Configure away timeout
- Enable/disable Do Not Disturb mode

---

## 🚀 Getting Started

1. Install the extension
2. HydroCode activates automatically on VS Code startup
3. Click the 💧 icon in your status bar to log your first glass
4. Open the dashboard: `Ctrl+Shift+P` → **HydroCode: Open Dashboard**

---

## ⌨️ Commands

| Command | Description |
|---|---|
| `HydroCode: Log Water Intake` | Log water (click status bar or command palette) |
| `HydroCode: Open Dashboard` | Open the 365-day history dashboard |
| `HydroCode: Set Daily Goal` | Change your daily water goal |
| `HydroCode: Enable Do Not Disturb` | Pause all reminders |
| `HydroCode: Disable Do Not Disturb` | Resume reminders |
| `HydroCode: Reset Today's Intake` | Clear today's data |

---

## ⚙️ Settings

| Setting | Default | Description |
|---|---|---|
| `hydrocode.dailyGoalMl` | `2500` | Daily water goal in ml |
| `hydrocode.reminderIntervalMinutes` | `30` | How often to remind you |
| `hydrocode.defaultSipMl` | `250` | Default ml logged via status bar click |
| `hydrocode.awayTimeoutMinutes` | `5` | Inactivity time before pausing notifications |
| `hydrocode.notificationFadeSeconds` | `8` | Auto-dismiss time for notifications |

---

## 📦 Publishing

```bash
# Install vsce
npm install -g @vscode/vsce

# Package
vsce package

# Publish (requires Personal Access Token from marketplace.visualstudio.com)
vsce publish
```

See [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) for full instructions.

---

## 🙏 Credits

Built with ❤️ by **Unni Krishnan**  
Inspired by the belief that good code starts with a hydrated developer.

---

*"Code better. Drink water."*
