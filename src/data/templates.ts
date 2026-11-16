import type { Template } from './types';

export const TEMPLATES: Record<string, Template> = {
  scout: { id: 'scout', name: 'Разведчик', hp: 10, damage: 2, spd: 3, cost: 50, paper: 1, time: 30, description: 'Быстрый корабль.', unlockedAtLevel: 1 },
  frigate: { id: 'frigate', name: 'Фрегат', hp: 20, damage: 4, spd: 2, cost: 120, paper: 2, time: 60, description: 'Сбалансированный корабль.', unlockedAtLevel: 4 },
  battleship: { id: 'battleship', name: 'Линкор', hp: 30, damage: 6, spd: 1, cost: 250, paper: 3, time: 90, description: 'Мощная артиллерия.', unlockedAtLevel: 7 },
};

export const ALL_TEMPLATES = Object.values(TEMPLATES);