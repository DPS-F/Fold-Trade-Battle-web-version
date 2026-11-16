export type Archetype = 'speculator' | 'industrialist' | 'cautious';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface BotProfile {
  archetype: Archetype;
  difficulty: Difficulty;
  sellBaseMult: number;
  buyThreshold: number;
  lotMin: number;
  lotMax: number;
  productionPref: 1 | 2 | 3;
  arbitrage: 'always' | 'sometimes' | 'never';
  closePolicy: 'delay' | 'immediate' | 'safe';
  mistakeChance: number;
}

export const BOT_PROFILES: Record<Archetype, Omit<BotProfile, 'difficulty'>> = {
  speculator: {
    archetype: 'speculator',
    sellBaseMult: 1.35,
    buyThreshold: 1.15,
    lotMin: 3,
    lotMax: 5,
    productionPref: 3,
    arbitrage: 'always',
    closePolicy: 'delay',
    mistakeChance: 0.1,
  },
  industrialist: {
    archetype: 'industrialist',
    sellBaseMult: 1.15,
    buyThreshold: 1.25,
    lotMin: 2,
    lotMax: 3,
    productionPref: 2,
    arbitrage: 'sometimes',
    closePolicy: 'immediate',
    mistakeChance: 0.15,
  },
  cautious: {
    archetype: 'cautious',
    sellBaseMult: 1.05,
    buyThreshold: 1.10,
    lotMin: 1,
    lotMax: 2,
    productionPref: 1,
    arbitrage: 'never',
    closePolicy: 'safe',
    mistakeChance: 0.05,
  },
};

export const DIFFICULTY_MODIFIERS: Record<Difficulty, { mistakeChance: number; thresholdOffset: number }> = {
  easy: { mistakeChance: 0.30, thresholdOffset: -0.05 },
  medium: { mistakeChance: 0.15, thresholdOffset: 0.0 },
  hard: { mistakeChance: 0.05, thresholdOffset: 0.05 },
  expert: { mistakeChance: 0.02, thresholdOffset: 0.1 },
};

export function getBotProfile(archetype: Archetype, difficulty: Difficulty): BotProfile {
  const base = BOT_PROFILES[archetype];
  const diff = DIFFICULTY_MODIFIERS[difficulty];
  return {
    ...base,
    difficulty,
    mistakeChance: base.mistakeChance * (diff.mistakeChance / 0.15), // Масштабируем шанс ошибки
    buyThreshold: base.buyThreshold + diff.thresholdOffset,
  };
}