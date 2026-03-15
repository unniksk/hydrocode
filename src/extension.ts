import * as vscode from 'vscode';
import { buildGoalReachedMessage, buildReminderMessage, isGoalReached } from './notificationMessages';
import { StorageManager } from './storage';
import { StatusBarManager } from './statusBar';
import { ReminderManager } from './reminder';
import { DashboardPanel } from './dashboard';

export async function activate(context: vscode.ExtensionContext) {
  console.log('HydroCode is now active! 💧');

  // Register the single data key with VS Code Settings Sync.
  // Users signed in with a Microsoft or GitHub account will have their
  // full 365-day history automatically synced across all their devices.
  context.globalState.setKeysForSync([StorageManager.SYNC_KEY]);

  const storage = new StorageManager(context);
  const statusBar = new StatusBarManager();
  const reminder = new ReminderManager(storage, statusBar, context);

  // Initial status bar render
  const todayRecord = await storage.getTodayRecord();
  statusBar.update(todayRecord, false);

  // Start reminders
  reminder.startReminders();

  // ── First install welcome notification ───────────────────────
  const hasSeenWelcome = context.globalState.get<boolean>('hydrocode_welcomed', false);
  if (!hasSeenWelcome) {
    await context.globalState.update('hydrocode_welcomed', true);
    const action = await vscode.window.showInformationMessage(
      '💧 Welcome to HydroCode! Stay hydrated while you code. ' +
      'Click the droplet in the status bar to log water. Default sip is 250ml.',
      'Set My Goal',
      'Open Dashboard',
      'Got it!'
    );
    if (action === 'Set My Goal') {
      vscode.commands.executeCommand('hydrocode.setDailyGoal');
    } else if (action === 'Open Dashboard') {
      vscode.commands.executeCommand('hydrocode.openDashboard');
    }
  }

  // ── Commands ────────────────────────────────────────────────

  // Instant log — used by the status bar drop icon
  const quickLogCmd = vscode.commands.registerCommand('hydrocode.quickLog', async () => {
    const config = vscode.workspace.getConfiguration('hydrocode');
    const ml = config.get<number>('defaultSipMl', 250);
    const updated = await storage.logWater(ml);
    statusBar.update(updated, reminder.getDNDStatus());
    const percent = Math.min(100, Math.round((updated.totalMl / updated.goalMl) * 100));
    if (percent >= 100) {
      vscode.window.showInformationMessage(
        buildGoalReachedMessage(updated.totalMl)
      );
    }
  });

  // Log water with quick pick
  const logWaterCmd = vscode.commands.registerCommand('hydrocode.logWater', async () => {
    const config = vscode.workspace.getConfiguration('hydrocode');
    const defaultSip = config.get<number>('defaultSipMl', 250);

    const options = [
      { label: `💧 ${defaultSip}ml`, description: 'Default sip', ml: defaultSip },
      { label: '💧 100ml', description: 'Small sip', ml: 100 },
      { label: '💧 150ml', description: 'Medium sip', ml: 150 },
      { label: '💧 200ml', description: 'Small glass', ml: 200 },
      { label: '💧 250ml', description: 'Standard glass', ml: 250 },
      { label: '💧 300ml', description: 'Large glass', ml: 300 },
      { label: '💧 350ml', description: 'Tumbler', ml: 350 },
      { label: '💧 400ml', description: 'Large tumbler', ml: 400 },
      { label: '💧 500ml', description: 'Bottle', ml: 500 },
      { label: '✏️ Custom amount...', description: 'Enter custom ml', ml: -1 },
    ];

    // Remove duplicate default
    const dedupedOptions = options.filter(
      (o, idx) => idx === 0 || o.ml !== defaultSip
    );

    const pick = await vscode.window.showQuickPick(dedupedOptions, {
      placeHolder: '💧 How much water did you drink?',
      title: 'HydroCode – Log Water Intake',
    });

    if (!pick) return;

    let ml = pick.ml;
    if (ml === -1) {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter amount in milliliters',
        placeHolder: 'e.g. 350',
        validateInput: (val) => {
          const num = parseInt(val);
          if (isNaN(num) || num <= 0 || num > 3000) {
            return 'Please enter a number between 1 and 3000';
          }
          return undefined;
        },
      });
      if (!input) return;
      ml = parseInt(input);
    }

    const updated = await storage.logWater(ml);
    statusBar.update(updated, reminder.getDNDStatus());

    const percent = Math.min(100, Math.round((updated.totalMl / updated.goalMl) * 100));
    if (percent >= 100) {
      vscode.window.showInformationMessage(
        buildGoalReachedMessage(updated.totalMl)
      );
    } else {
      vscode.window.setStatusBarMessage(`✅ +${ml}ml logged! ${updated.totalMl}ml today (${percent}%)`, 4000);
    }
  });

  // Open dashboard
  const openDashboardCmd = vscode.commands.registerCommand(
    'hydrocode.openDashboard',
    async () => {
      await DashboardPanel.show(context, storage);
    }
  );

  // Set daily goal
  const setGoalCmd = vscode.commands.registerCommand('hydrocode.setDailyGoal', async () => {
    const config = vscode.workspace.getConfiguration('hydrocode');
    const current = config.get<number>('dailyGoalMl', 2500);

    const presets = [
      { label: '1500ml', description: 'Light (sedentary)', ml: 1500 },
      { label: '2000ml', description: 'Moderate', ml: 2000 },
      { label: '2500ml', description: 'Recommended (default)', ml: 2500 },
      { label: '3000ml', description: 'Active lifestyle', ml: 3000 },
      { label: '3500ml', description: 'Very active', ml: 3500 },
      { label: '✏️ Custom...', description: `Currently: ${current}ml`, ml: -1 },
    ];

    const pick = await vscode.window.showQuickPick(presets, {
      placeHolder: `Current goal: ${current}ml. Choose a new daily goal.`,
      title: 'HydroCode – Set Daily Water Goal',
    });

    if (!pick) return;

    let goal = pick.ml;
    if (goal === -1) {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter your daily water goal in ml',
        placeHolder: 'e.g. 2800',
        value: String(current),
        validateInput: (val) => {
          const num = parseInt(val);
          if (isNaN(num) || num < 500 || num > 6000) {
            return 'Please enter between 500 and 6000 ml';
          }
          return undefined;
        },
      });
      if (!input) return;
      goal = parseInt(input);
    }

    await config.update('dailyGoalMl', goal, vscode.ConfigurationTarget.Global);
    const updated = await storage.getTodayRecord();
    statusBar.update(updated, reminder.getDNDStatus());
    vscode.window.showInformationMessage(`🎯 Daily goal set to ${goal}ml!`);
  });

  // Enable DND
  const enableDNDCmd = vscode.commands.registerCommand('hydrocode.enableDND', async () => {
    reminder.enableDND();
    const record = await storage.getTodayRecord();
    statusBar.update(record, true);
    vscode.window.setStatusBarMessage('🔕 HydroCode: Do Not Disturb enabled', 3000);
  });

  // Disable DND
  const disableDNDCmd = vscode.commands.registerCommand('hydrocode.disableDND', async () => {
    reminder.disableDND();
    const record = await storage.getTodayRecord();
    statusBar.update(record, false);
    vscode.window.setStatusBarMessage('🔔 HydroCode: Do Not Disturb disabled', 3000);
  });

  // Refresh status bar (called after dashboard edits)
  const refreshStatusBarCmd = vscode.commands.registerCommand('hydrocode.refreshStatusBar', async () => {
    const record = await storage.getTodayRecord();
    statusBar.update(record, reminder.getDNDStatus());
  });

  // Progress bar click menu
  const barMenuCmd = vscode.commands.registerCommand('hydrocode.barMenu', async () => {
    const record = await storage.getTodayRecord();
    const lastLog = record.logs.at(-1);
    const items: { label: string; id: string }[] = [
      { label: '$(graph) Open Dashboard', id: 'dashboard' },
    ];
    if (lastLog) {
      items.push({ label: `$(discard) Undo Last Entry (−${lastLog.ml}ml at ${lastLog.time})`, id: 'undo' });
    }
    items.push({ label: '$(trash) Reset Today\'s Intake', id: 'reset' });

    const pick = await vscode.window.showQuickPick(items, { title: 'HydroCode' });
    if (pick?.id === 'dashboard') {
      vscode.commands.executeCommand('hydrocode.openDashboard');
    } else if (pick?.id === 'undo') {
      const updated = await storage.removeLogEntry(record.logs.length - 1);
      statusBar.update(updated, reminder.getDNDStatus());
      vscode.window.setStatusBarMessage(`↩ Removed ${lastLog!.ml}ml entry`, 3000);
    } else if (pick?.id === 'reset') {
      vscode.commands.executeCommand('hydrocode.resetToday');
    }
  });

  // Set default sip size
  const setDefaultSipCmd = vscode.commands.registerCommand('hydrocode.setDefaultSip', async () => {
    const config = vscode.workspace.getConfiguration('hydrocode');
    const current = config.get<number>('defaultSipMl', 250);
    const options = [100, 150, 200, 250, 300, 350, 400, 500].map(ml => ({
      label: `💧 ${ml}ml`,
      description: ml === current ? '✓ current' : '',
      ml,
    }));
    const pick = await vscode.window.showQuickPick(options, {
      placeHolder: 'Select your default sip size',
      title: 'HydroCode – Set Default Sip Size',
    });
    if (!pick) return;
    await config.update('defaultSipMl', pick.ml, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`Default sip set to ${pick.ml}ml`);
  });

  // Reset today
  const resetCmd = vscode.commands.registerCommand('hydrocode.resetToday', async () => {
    const confirm = await vscode.window.showWarningMessage(
      "Reset today's water intake to 0?",
      { modal: true },
      'Yes, Reset'
    );
    if (confirm !== 'Yes, Reset') return;

    await storage.resetToday();
    const updated = await storage.getTodayRecord();
    statusBar.update(updated, reminder.getDNDStatus());
    vscode.window.setStatusBarMessage("🔄 Today's intake reset to 0ml", 3000);
  });

  context.subscriptions.push(
    quickLogCmd,
    refreshStatusBarCmd,
    barMenuCmd,
    logWaterCmd,
    openDashboardCmd,
    setGoalCmd,
    enableDNDCmd,
    disableDNDCmd,
    setDefaultSipCmd,
    resetCmd,
    { dispose: () => statusBar.dispose() },
    { dispose: () => reminder.stopReminders() }
  );
}

export function deactivate() {
  console.log('HydroCode deactivated.');
}
