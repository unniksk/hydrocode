import * as vscode from 'vscode';
import { DayRecord } from './storage';

const BLUE = '#38bdf8';

export class StatusBarManager {
  private iconItem: vscode.StatusBarItem;
  private progressItem: vscode.StatusBarItem;
  private dndStatusItem: vscode.StatusBarItem;

  constructor() {
    // Clickable droplet icon
    this.iconItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      101
    );
    this.iconItem.text = '💧';
    this.iconItem.command = 'hydrocode.quickLog';
    this.iconItem.show();

    // Blue progress bar — opens dashboard on click
    this.progressItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.progressItem.color = BLUE;
    this.progressItem.command = 'hydrocode.openDashboard';
    this.progressItem.show();

    this.dndStatusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      99
    );
    this.dndStatusItem.command = 'hydrocode.disableDND';
    this.dndStatusItem.text = '$(bell-slash) DND';
    this.dndStatusItem.tooltip = 'HydroCode: Do Not Disturb is ON. Click to disable.';
    this.dndStatusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  }

  update(record: DayRecord, isDND: boolean): void {
    const percent = Math.min(100, (record.totalMl / record.goalMl) * 100);
    const remaining = Math.max(0, record.goalMl - record.totalMl);

    // Droplet icon
    this.iconItem.text = '💧';
    this.iconItem.backgroundColor = percent >= 100
      ? new vscode.ThemeColor('statusBarItem.prominentBackground')
      : undefined;

    const tooltip = new vscode.MarkdownString(
      `### 💧 HydroCode\n\n` +
      `**Today:** ${record.totalMl}ml / ${record.goalMl}ml (${Math.round(percent)}%)\n\n` +
      `${remaining > 0 ? `Still need: **${remaining}ml**` : `🎉 Daily goal reached!`}\n\n` +
      `---\nClick to log water · [Open Dashboard](command:hydrocode.openDashboard)`
    );
    tooltip.isTrusted = true;
    this.iconItem.tooltip = tooltip;

    // Progress bar — 10 segments, each = 10%
    const filled = Math.min(10, Math.floor(percent / 10));
    this.progressItem.text = '▰'.repeat(filled) + '▱'.repeat(10 - filled);
    this.progressItem.tooltip = `${record.totalMl}ml / ${record.goalMl}ml (${Math.round(percent)}%)`;

    if (isDND) {
      this.dndStatusItem.show();
    } else {
      this.dndStatusItem.hide();
    }
  }

  dispose(): void {
    this.iconItem.dispose();
    this.progressItem.dispose();
    this.dndStatusItem.dispose();
  }
}
