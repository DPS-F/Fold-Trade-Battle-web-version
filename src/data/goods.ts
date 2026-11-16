import type { Good } from './types';

export const GOODS: Record<string, Good> = {
  food: { id: 'food', name: 'Еда', basePrice: 15 },
  fuel: { id: 'fuel', name: 'Топливо', basePrice: 16 },
  alcohol: { id: 'alcohol', name: 'Алкоголь', basePrice: 18 },
  work: { id: 'work', name: 'Работа', basePrice: 20 },
  rods: { id: 'rods', name: 'Удочки', basePrice: 21 },
  mechanisms: { id: 'mechanisms', name: 'Механизмы', basePrice: 22 },
  glass: { id: 'glass', name: 'Стекло', basePrice: 24 },
  metal: { id: 'metal', name: 'Металл', basePrice: 25 },
  money: { id: 'money', name: 'Деньги', basePrice: 27 },
  clocks: { id: 'clocks', name: 'Часы', basePrice: 28 },
};

export const ALL_GOODS_IDS = Object.keys(GOODS);