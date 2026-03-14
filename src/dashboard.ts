import * as vscode from 'vscode';
import { StorageManager, DayRecord } from './storage';

export class DashboardPanel {
  public static currentPanel: DashboardPanel | undefined;
  private static readonly viewType = 'hydrocodeDashboard';
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private storage: StorageManager;

  static async show(
    context: vscode.ExtensionContext,
    storage: StorageManager
  ): Promise<void> {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;

    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel.panel.reveal(column);
      await DashboardPanel.currentPanel.refresh(storage);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      DashboardPanel.viewType,
      'HydroCode Dashboard',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    DashboardPanel.currentPanel = new DashboardPanel(panel, context, storage);
    await DashboardPanel.currentPanel.refresh(storage);
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext, storage: StorageManager) {
    this.panel = panel;
    this.storage = storage;
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.command === 'resetToday') {
        vscode.commands.executeCommand('hydrocode.resetToday');
      } else if (msg.command === 'removeEntry') {
        await this.storage.removeLogEntry(msg.index);
        await this.refresh(this.storage);
        vscode.commands.executeCommand('hydrocode.refreshStatusBar');
      }
    }, null, this.disposables);
  }

  async refresh(storage: StorageManager): Promise<void> {
    const records = await storage.getHistoryRecords(365);
    const today = await storage.getTodayRecord();
    this.panel.webview.html = this.getHtml(records, today);
  }

  private getHtml(records: DayRecord[], today: DayRecord): string {
    const percent = Math.min(100, Math.round((today.totalMl / today.goalMl) * 100));
    const streak = this.calculateStreak(records);
    const weekTotal = records.slice(-7).reduce((s, r) => s + r.totalMl, 0);
    const avgDaily = Math.round(
      records.filter((r) => r.totalMl > 0).reduce((s, r) => s + r.totalMl, 0) /
        Math.max(1, records.filter((r) => r.totalMl > 0).length)
    );

    // Build heatmap data (last 52 weeks = 364 days)
    const heatmapRecords = records.slice(-364);

    const heatmapCells = heatmapRecords
      .map((r) => {
        const pct = Math.min(100, (r.totalMl / r.goalMl) * 100);
        const level = pct === 0 ? 0 : pct < 25 ? 1 : pct < 50 ? 2 : pct < 75 ? 3 : pct < 100 ? 4 : 5;
        const dateObj = new Date(r.date + 'T00:00:00');
        const displayDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        return `<div class="cell level-${level}" title="${displayDate}: ${r.totalMl}ml (${Math.round(pct)}%)"></div>`;
      })
      .join('');

    // Droplet progress visual
    const droplets = Array.from({ length: 10 }, (_, i) => {
      const threshold = (i + 1) * 10;
      const filled = percent >= threshold;
      const partial = !filled && percent > i * 10;
      const partialPct = partial ? ((percent - i * 10) / 10) * 100 : 0;
      return { filled, partial, partialPct };
    });

    const dropletSvgs = droplets
      .map(({ filled, partial, partialPct }) => {
        if (filled) {
          return `<svg class="droplet filled" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 2 C15 2 2 18 2 27 C2 34 8 38 15 38 C22 38 28 34 28 27 C28 18 15 2 15 2Z" fill="#38bdf8"/>
            <ellipse cx="10" cy="22" rx="3" ry="5" fill="rgba(255,255,255,0.25)" transform="rotate(-20,10,22)"/>
          </svg>`;
        } else if (partial) {
          const id = `grad_${Math.random().toString(36).slice(2)}`;
          return `<svg class="droplet partial" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0">
                <stop offset="${partialPct}%" stop-color="#38bdf8"/>
                <stop offset="${partialPct}%" stop-color="transparent"/>
              </linearGradient>
            </defs>
            <path d="M15 2 C15 2 2 18 2 27 C2 34 8 38 15 38 C22 38 28 34 28 27 C28 18 15 2 15 2Z" fill="url(#${id})" stroke="#38bdf8" stroke-width="1.5"/>
          </svg>`;
        } else {
          return `<svg class="droplet empty" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 2 C15 2 2 18 2 27 C2 34 8 38 15 38 C22 38 28 34 28 27 C28 18 15 2 15 2Z" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.3"/>
          </svg>`;
        }
      })
      .join('');

    const totalLogs = today.logs.length;
    const recentLogs = today.logs
      .slice(-8)
      .reverse()
      .map((log, i) => {
        const realIndex = totalLogs - 1 - i;
        return `<div class="log-entry">
          <span class="log-time">${log.time}</span>
          <span class="log-ml">+${log.ml}ml</span>
          <button class="log-delete" onclick="removeEntry(${realIndex})" title="Remove this entry">×</button>
        </div>`;
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HydroCode Dashboard</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --bg: #0a0f1a;
    --surface: #0f1929;
    --surface2: #162033;
    --border: #1e3048;
    --water-0: #0f1929;
    --water-1: #0c2a4a;
    --water-2: #0a3d6b;
    --water-3: #0369a1;
    --water-4: #0ea5e9;
    --water-5: #38bdf8;
    --text: #e2eeff;
    --text-muted: #6b8aad;
    --accent: #38bdf8;
    --accent-glow: rgba(56, 189, 248, 0.15);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 28px;
  }

  header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 20px;
  }

  .logo { font-size: 28px; }

  header h1 {
    font-size: 22px;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: -0.5px;
  }

  header p { color: var(--text-muted); font-size: 13px; }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
  }

  .card.wide { grid-column: span 2; }
  .card.full { grid-column: span 3; }

  .card-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .card-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--accent);
    font-family: 'DM Mono', monospace;
    line-height: 1;
  }

  .card-sub {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  /* Today's progress */
  .today-progress {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .progress-pct {
    font-size: 40px;
    font-weight: 700;
    color: var(--accent);
    font-family: 'DM Mono', monospace;
    line-height: 1;
  }

  .progress-detail {
    text-align: right;
    color: var(--text-muted);
    font-size: 12px;
    line-height: 1.6;
  }

  /* Droplet row */
  .droplets {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .droplet { width: 28px; height: 38px; }

  /* Bar */
  .progress-bar {
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0369a1, #38bdf8);
    border-radius: 3px;
    transition: width 0.6s ease;
    width: ${percent}%;
  }

  /* Heatmap */
  .heatmap-wrapper { overflow-x: auto; }

  .heatmap-months {
    display: flex;
    gap: 3px;
    font-size: 10px;
    color: var(--text-muted);
    margin-bottom: 4px;
    font-family: 'DM Mono', monospace;
    padding-left: 28px;
  }

  .heatmap-body { display: flex; gap: 6px; }

  .heatmap-days {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 10px;
    color: var(--text-muted);
    font-family: 'DM Mono', monospace;
    padding-top: 2px;
  }

  .heatmap-days span { height: 13px; line-height: 13px; }

  .heatmap-grid {
    display: grid;
    grid-template-rows: repeat(7, 13px);
    grid-auto-flow: column;
    gap: 3px;
  }

  .cell {
    width: 13px;
    height: 13px;
    border-radius: 2px;
    cursor: default;
    transition: transform 0.1s;
  }

  .cell:hover { transform: scale(1.3); }

  .cell.level-0 { background: var(--water-0); border: 1px solid var(--border); }
  .cell.level-1 { background: var(--water-1); }
  .cell.level-2 { background: var(--water-2); }
  .cell.level-3 { background: var(--water-3); }
  .cell.level-4 { background: var(--water-4); }
  .cell.level-5 { background: var(--water-5); box-shadow: 0 0 4px rgba(56,189,248,0.5); }

  /* Legend */
  .legend {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    justify-content: flex-end;
    font-size: 11px;
    color: var(--text-muted);
  }

  .legend-cells { display: flex; gap: 3px; }

  /* Log list */
  .log-list { display: flex; flex-direction: column; gap: 8px; }

  .log-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--surface2);
    border-radius: 8px;
    font-size: 13px;
  }

  .log-time {
    font-family: 'DM Mono', monospace;
    color: var(--text-muted);
    font-size: 12px;
  }

  .log-ml {
    color: var(--accent);
    font-weight: 600;
    font-family: 'DM Mono', monospace;
  }

  .log-delete {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 0 2px;
    margin-left: auto;
    opacity: 0;
    transition: color 0.15s, opacity 0.15s;
  }

  .log-entry:hover .log-delete { opacity: 1; }
  .log-delete:hover { color: #ef4444; }

  .empty-log {
    color: var(--text-muted);
    font-size: 13px;
    text-align: center;
    padding: 20px;
  }

  /* Stat cards */
  .stats-row {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
  }

  .stat-icon { font-size: 20px; margin-bottom: 6px; }
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
    color: var(--accent);
  }
  .stat-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 14px;
  }

  /* Glow effect on accent card */
  .card.accent-card {
    border-color: rgba(56, 189, 248, 0.3);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.06);
  }

  .reset-btn {
    margin-left: auto;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s, color 0.2s;
  }

  .reset-btn:hover {
    border-color: #ef4444;
    color: #ef4444;
  }
</style>
</head>
<body>

<header>
  <div class="logo">💧</div>
  <div>
    <h1>HydroCode</h1>
    <p>Your hydration companion by Unni Krishnan</p>
  </div>
  <button class="reset-btn" onclick="resetToday()">↺ Reset Today</button>
</header>

<div class="stats-row">
  <div class="stat-card">
    <div class="stat-icon">🔥</div>
    <div class="stat-value">${streak}</div>
    <div class="stat-label">Day streak</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon">📅</div>
    <div class="stat-value">${weekTotal}ml</div>
    <div class="stat-label">This week</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon">📊</div>
    <div class="stat-value">${avgDaily}ml</div>
    <div class="stat-label">Daily average</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon">🎯</div>
    <div class="stat-value">${today.goalMl}ml</div>
    <div class="stat-label">Today's goal</div>
  </div>
</div>

<div class="grid">
  <!-- Today's progress -->
  <div class="card wide accent-card">
    <div class="card-label">Today's Hydration</div>
    <div class="today-progress">
      <div class="progress-header">
        <div class="progress-pct">${percent}%</div>
        <div class="progress-detail">
          ${today.totalMl}ml consumed<br>
          ${Math.max(0, today.goalMl - today.totalMl)}ml remaining
        </div>
      </div>
      <div class="droplets">
        ${dropletSvgs}
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    </div>
  </div>

  <!-- Today's log -->
  <div class="card">
    <div class="card-label">Today's Log</div>
    <div class="log-list">
      ${recentLogs || '<div class="empty-log">No water logged yet today 🌵</div>'}
    </div>
  </div>

  <!-- Heatmap -->
  <div class="card full">
    <div class="section-title">365-Day Hydration History</div>
    <div class="heatmap-wrapper">
      <div class="heatmap-body">
        <div class="heatmap-days">
          <span></span>
          <span>Mon</span>
          <span></span>
          <span>Wed</span>
          <span></span>
          <span>Fri</span>
          <span></span>
        </div>
        <div>
          <div class="heatmap-grid">
            ${heatmapCells}
          </div>
        </div>
      </div>
      <div class="legend">
        <span>Less</span>
        <div class="legend-cells">
          <div class="cell level-0"></div>
          <div class="cell level-1"></div>
          <div class="cell level-2"></div>
          <div class="cell level-3"></div>
          <div class="cell level-4"></div>
          <div class="cell level-5"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  </div>
</div>

<script>
  const vscodeApi = acquireVsCodeApi();
  function resetToday() {
    vscodeApi.postMessage({ command: 'resetToday' });
  }
  function removeEntry(index) {
    vscodeApi.postMessage({ command: 'removeEntry', index });
  }
</script>
</body>
</html>`;
  }

  private calculateStreak(records: DayRecord[]): number {
    let streak = 0;
    const sorted = [...records].reverse();
    for (const r of sorted) {
      if (r.totalMl >= r.goalMl) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  dispose(): void {
    DashboardPanel.currentPanel = undefined;
    this.panel.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
