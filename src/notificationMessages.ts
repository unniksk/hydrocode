/**
 * Pure functions for building notification messages.
 * Kept separate from vscode API so they can be unit tested without a VS Code instance.
 */

export function buildGoalReachedMessage(totalMl: number): string {
  return `🎉 Daily goal reached! You've had ${totalMl}ml today. Amazing work!`;
}

export function buildReminderMessage(totalMl: number, goalMl: number): string {
  const percent = Math.min(100, Math.round((totalMl / goalMl) * 100));
  const remaining = Math.max(0, goalMl - totalMl);
  if (percent === 0) {
    return `💧 Time to hydrate! You haven't logged any water yet today.`;
  }
  if (remaining === 0) {
    return `🎉 You've hit your daily goal of ${goalMl}ml!`;
  }
  return `💧 Drink up! You've had ${totalMl}ml today (${percent}%). ${remaining}ml to go!`;
}

export function buildDefaultSipChangedMessage(ml: number): string {
  return `Default sip set to ${ml}ml`;
}

export function isGoalReached(totalMl: number, goalMl: number): boolean {
  return totalMl >= goalMl;
}

export function getProgressPercent(totalMl: number, goalMl: number): number {
  return Math.min(100, Math.round((totalMl / goalMl) * 100));
}
