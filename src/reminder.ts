import * as vscode from 'vscode';
import { StorageManager } from './storage';
import { StatusBarManager } from './statusBar';

export class ReminderManager {
  private reminderTimer: NodeJS.Timeout | undefined;
  private snoozeTimer: NodeJS.Timeout | undefined;
  private lastActivityTime: Date = new Date();
  private isDND: boolean = false;
  private isSnoozing: boolean = false;
  private activityListener: vscode.Disposable | undefined;

  constructor(
    private storage: StorageManager,
    private statusBar: StatusBarManager,
    private context: vscode.ExtensionContext
  ) {
    this.trackActivity();
  }

  private trackActivity(): void {
    // Track user activity via window state changes and text editor events
    this.activityListener = vscode.window.onDidChangeActiveTextEditor(() => {
      this.lastActivityTime = new Date();
    });

    vscode.window.onDidChangeWindowState((state) => {
      if (state.focused) {
        this.lastActivityTime = new Date();
      }
    });

    vscode.workspace.onDidChangeTextDocument(() => {
      this.lastActivityTime = new Date();
    });
  }

  isUserAway(): boolean {
    const config = vscode.workspace.getConfiguration('hydrocode');
    const awayMinutes = config.get<number>('awayTimeoutMinutes', 5);
    const minutesSinceActivity =
      (Date.now() - this.lastActivityTime.getTime()) / 1000 / 60;

    // Also check if VS Code window is not focused
    const windowFocused = vscode.window.state.focused;
    return minutesSinceActivity > awayMinutes || !windowFocused;
  }

  startReminders(): void {
    this.scheduleNextReminder();
  }

  private scheduleNextReminder(): void {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
    }

    const config = vscode.workspace.getConfiguration('hydrocode');
    const intervalMinutes = config.get<number>('reminderIntervalMinutes', 30);
    const intervalMs = intervalMinutes * 60 * 1000;

    this.reminderTimer = setTimeout(async () => {
      await this.triggerReminder();
      this.scheduleNextReminder();
    }, intervalMs);
  }

  private async triggerReminder(): Promise<void> {
    if (this.isDND || this.isSnoozing) {
      return;
    }

    if (this.isUserAway()) {
      // User is away — skip this notification silently
      return;
    }

    const record = await this.storage.getTodayRecord();
    const percent = Math.round((record.totalMl / record.goalMl) * 100);

    if (percent >= 100) {
      // Goal reached, no need to remind
      return;
    }

    const remaining = record.goalMl - record.totalMl;
    const config = vscode.workspace.getConfiguration('hydrocode');
    const defaultSip = config.get<number>('defaultSipMl', 250);

    const messages = [
      `Time to hydrate! 💧 ${remaining}ml left today`,
      `Drink water! You're at ${percent}% of your goal 💧`,
      `Stay hydrated! ${remaining}ml remaining 🩵`,
      `Water break! ${record.totalMl}ml done, ${remaining}ml to go 💧`,
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    const drankBtn = `💧 Drank`;
    const snoozeBtn = `⏱ Snooze`;
    const dndBtn = `🔕 DND`;

    const selection = await vscode.window.showInformationMessage(
      msg,
      { modal: false },
      drankBtn,
      snoozeBtn,
      dndBtn
    );

    if (selection === drankBtn) {
      const updated = await this.storage.logWater(defaultSip);
      this.statusBar.update(updated, this.isDND);
    } else if (selection === snoozeBtn) {
      this.snooze(15);
    } else if (selection === dndBtn) {
      this.enableDND();
      vscode.window.setStatusBarMessage('🔕 HydroCode DND enabled', 3000);
    }
  }

  snooze(minutes: number): void {
    this.isSnoozing = true;
    if (this.snoozeTimer) {
      clearTimeout(this.snoozeTimer);
    }
    this.snoozeTimer = setTimeout(() => {
      this.isSnoozing = false;
    }, minutes * 60 * 1000);
    vscode.window.setStatusBarMessage(`😴 HydroCode snoozed for ${minutes} min`, 3000);
  }

  enableDND(): void {
    this.isDND = true;
  }

  disableDND(): void {
    this.isDND = false;
  }

  getDNDStatus(): boolean {
    return this.isDND;
  }

  stopReminders(): void {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
    }
    if (this.snoozeTimer) {
      clearTimeout(this.snoozeTimer);
    }
    if (this.activityListener) {
      this.activityListener.dispose();
    }
  }
}
