import type { Good } from './types';

export const GOODS: Record<string, Good> = {
  food: { id: 'food', name: 'Еда', basePrice: 20 },
  fuel: { id: 'fuel', name: 'Топливо', basePrice: 25 },
  alcohol: { id: 'alcohol', name: 'Алкоголь', basePrice: 30 },
  work: { id: 'work', name: 'Работа', basePrice: 40 },
  rods: { id: 'rods', name: 'Удочки', basePrice: 45 },
  mechanisms: { id: 'mechanisms', name: 'Механизмы', basePrice: 50 },
  glass: { id: 'glass', name: 'Стекло', basePrice: 60 },
  metal: { id: 'metal', name: 'Металл', basePrice: 70 },
  money: { id: 'money', name: 'Деньги', basePrice: 80 },
  clocks: { id: 'clocks', name: 'Часы', basePrice: 100 },
};

export const ALL_GOODS_IDS = Object.keys(GOODS);