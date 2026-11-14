import { describe, it, expect } from 'vitest';
import { getLevelData, getMaxVisasAllowed } from '../src/data/progression';

describe('Progression System', () => {
  it('should return correct level data', () => {
    const lvl1 = getLevelData(1);
    expect(lvl1.botsCount).toBe(1);
    expect(lvl1.isBoss).toBe(false);

    const lvl3 = getLevelData(3);
    expect(lvl3.isBoss).toBe(true);
    expect(lvl3.botDifficulty).toBe('medium');

    const lvl12 = getLevelData(12);
    expect(lvl12.cyclesRequired).toBe(5);
    expect(lvl12.botsCount).toBe(3);
  });

  it('should cap levels at 12', () => {
    const lvl99 = getLevelData(99);
    expect(lvl99.level).toBe(12);
  });

  it('should return correct visa limits', () => {
    expect(getMaxVisasAllowed(1)).toBe(1);
    expect(getMaxVisasAllowed(4)).toBe(2);
    expect(getMaxVisasAllowed(7)).toBe(3);
    expect(getMaxVisasAllowed(12)).toBe(4);
  });
});