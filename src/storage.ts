import * as vscode from 'vscode';

export interface DayRecord {
  date: string; // YYYY-MM-DD
  totalMl: number;
  goalMl: number;
  logs: { time: string; ml: number }[];
}

// All history lives under this single key so VS Code Settings Sync
// can replicate it across devices with one setKeysForSync call.
type AllData = Record<string, DayRecord>; // keyed by YYYY-MM-DD

export class StorageManager {
  static readonly SYNC_KEY = 'hydrocode_all_data';

  constructor(private context: vscode.ExtensionContext) {}

  // ── Internal helpers ────────────────────────────────────────

  private dateKey(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }

  private readAll(): AllData {
    return this.context.globalState.get<AllData>(StorageManager.SYNC_KEY, {});
  }

  private async writeAll(data: AllData): Promise<void> {
    await this.context.globalState.update(StorageManager.SYNC_KEY, data);
  }

  private defaultGoal(): number {
    return vscode.workspace
      .getConfiguration('hydrocode')
      .get<number>('dailyGoalMl', 2500);
  }

  // ── Public API ──────────────────────────────────────────────

  async getTodayRecord(): Promise<DayRecord> {
    const key = this.dateKey();
    const all = this.readAll();
    return (
      all[key] ?? {
        date: key,
        totalMl: 0,
        goalMl: this.defaultGoal(),
        logs: [],
      }
    );
  }

  async logWater(ml: number): Promise<DayRecord> {
    const key = this.dateKey();
    const all = this.readAll();

    const record: DayRecord = all[key] ?? {
      date: key,
      totalMl: 0,
      goalMl: this.defaultGoal(),
      logs: [],
    };

    record.totalMl += ml;
    record.logs.push({ time: new Date().toTimeString().slice(0, 5), ml });

    all[key] = record;
    await this.writeAll(all);
    return record;
  }

  async resetToday(): Promise<void> {
    const key = this.dateKey();
    const all = this.readAll();
    all[key] = { date: key, totalMl: 0, goalMl: this.defaultGoal(), logs: [] };
    await this.writeAll(all);
  }

  async getHistoryRecords(days: number = 365): Promise<DayRecord[]> {
    const all = this.readAll();
    const goal = this.defaultGoal();
    const today = new Date();

    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (days - 1 - i));
      const key = this.dateKey(d);
      return all[key] ?? { date: key, totalMl: 0, goalMl: goal, logs: [] };
    });
  }
}
