export type Rarity = 'simple' | 'rare' | 'epic' | 'legendary' | 'collection';

export interface Good {
  id: string;
  name: string;
  basePrice: number;
}

export interface Visa {
  id: string;
  name: string;
  rarity: Rarity;
  produces: string;
  requires: string[];
  requiredAmount: number;
  piecesRequired: number;
  rentPrice: number;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  hp: number;
  damage: number;
  spd: number; // <--- НОВЫЙ ПАРАМЕТР
  cost: number;
  paper: number;
  time: number;
  description: string;
  unlockedAtLevel: number;
}

export type CellType = 'start' | 'market' | 'production' | 'walk' | 'penalty';

export interface GameLevel {
  level: number;
  tier: number;
  cyclesRequired: number;
  botsCount: number;
  botDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  isBoss: boolean;
}