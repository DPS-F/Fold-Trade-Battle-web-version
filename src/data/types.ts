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
  requiredAmount: number; // Сколько товара нужно для закрытия в схватке
  piecesRequired: number; // Сколько кусков нужно для открытия визитки
  rentPrice: number;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  hp: number;
  damage: number;
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
  botDifficulty: 'easy' | 'medium' | 'hard';
  isBoss: boolean;
}