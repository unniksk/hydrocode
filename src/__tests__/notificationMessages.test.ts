import {
  buildGoalReachedMessage,
  buildReminderMessage,
  buildDefaultSipChangedMessage,
  isGoalReached,
  getProgressPercent,
} from '../notificationMessages';

describe('isGoalReached', () => {
  it('returns true when totalMl equals goalMl', () => {
    expect(isGoalReached(2500, 2500)).toBe(true);
  });

  it('returns true when totalMl exceeds goalMl', () => {
    expect(isGoalReached(3000, 2500)).toBe(true);
  });

  it('returns false when totalMl is below goalMl', () => {
    expect(isGoalReached(2499, 2500)).toBe(false);
  });

  it('returns false when no water logged', () => {
    expect(isGoalReached(0, 2500)).toBe(false);
  });
});

describe('getProgressPercent', () => {
  it('returns 0 at 0ml', () => {
    expect(getProgressPercent(0, 2500)).toBe(0);
  });

  it('returns 50 at half goal', () => {
    expect(getProgressPercent(1250, 2500)).toBe(50);
  });

  it('returns 100 at goal', () => {
    expect(getProgressPercent(2500, 2500)).toBe(100);
  });

  it('caps at 100 when over goal', () => {
    expect(getProgressPercent(5000, 2500)).toBe(100);
  });

  it('rounds to nearest integer', () => {
    expect(getProgressPercent(333, 1000)).toBe(33);
  });
});

describe('buildGoalReachedMessage', () => {
  it('includes total ml in the message', () => {
    const msg = buildGoalReachedMessage(2500);
    expect(msg).toContain('2500ml');
  });

  it('contains celebration emoji', () => {
    expect(buildGoalReachedMessage(2500)).toContain('🎉');
  });
});

describe('buildReminderMessage', () => {
  it('prompts to start when no water logged', () => {
    const msg = buildReminderMessage(0, 2500);
    expect(msg).toContain("haven't logged");
  });

  it('shows goal reached when at 100%', () => {
    const msg = buildReminderMessage(2500, 2500);
    expect(msg).toContain('hit your daily goal');
  });

  it('shows progress and remaining ml', () => {
    const msg = buildReminderMessage(1000, 2000);
    expect(msg).toContain('1000ml');
    expect(msg).toContain('50%');
    expect(msg).toContain('1000ml to go');
  });
});

describe('buildDefaultSipChangedMessage', () => {
  it('includes the ml value', () => {
    expect(buildDefaultSipChangedMessage(350)).toContain('350ml');
  });
});
