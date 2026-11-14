import type { GameLevel } from './types';

export const LEVELS: GameLevel[] = [
  { level: 1, tier: 1, cyclesRequired: 1, botsCount: 1, botDifficulty: 'easy', isBoss: false },
  { level: 2, tier: 1, cyclesRequired: 1, botsCount: 1, botDifficulty: 'easy', isBoss: false },
  { level: 3, tier: 1, cyclesRequired: 1, botsCount: 1, botDifficulty: 'medium', isBoss: true },
  { level: 4, tier: 2, cyclesRequired: 2, botsCount: 2, botDifficulty: 'medium', isBoss: false },
  { level: 5, tier: 2, cyclesRequired: 2, botsCount: 2, botDifficulty: 'medium', isBoss: false },
  { level: 6, tier: 2, cyclesRequired: 2, botsCount: 2, botDifficulty: 'hard', isBoss: true },
  { level: 7, tier: 3, cyclesRequired: 3, botsCount: 3, botDifficulty: 'hard', isBoss: false },
  { level: 8, tier: 3, cyclesRequired: 3, botsCount: 3, botDifficulty: 'hard', isBoss: false },
  { level: 9, tier: 3, cyclesRequired: 3, botsCount: 3, botDifficulty: 'hard', isBoss: true },
  { level: 10, tier: 4, cyclesRequired: 5, botsCount: 3, botDifficulty: 'hard', isBoss: false },
  { level: 11, tier: 4, cyclesRequired: 5, botsCount: 3, botDifficulty: 'hard', isBoss: false },
  { level: 12, tier: 4, cyclesRequired: 5, botsCount: 3, botDifficulty: 'hard', isBoss: true },
];

export function getLevelData(level: number): GameLevel {
  return LEVELS[Math.min(level - 1, LEVELS.length - 1)];
}

// Максимум визиток (аренда) по тирам
export function getMaxVisasAllowed(level: number): number {
  if (level <= 3) return 1;
  if (level <= 6) return 2;
  if (level <= 9) return 3;
  return 4;
}