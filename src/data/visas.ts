import type { Visa } from './types';

export const VISAS: Record<string, Visa> = {
  zhiest: { id: 'zhiest', name: 'Жи-есть', rarity: 'simple', produces: 'food', requires: ['rods', 'clocks', 'money'], requiredAmount: 20, piecesRequired: 1, rentPrice: 10, description: 'Производит еду.' },
  smetana: { id: 'smetana', name: 'С-метан-а', rarity: 'simple', produces: 'fuel', requires: ['mechanisms', 'metal', 'money'], requiredAmount: 19, piecesRequired: 1, rentPrice: 10, description: 'Производит топливо.' },
  badyaga: { id: 'badyaga', name: 'Бадяга', rarity: 'simple', produces: 'alcohol', requires: ['food', 'fuel', 'glass'], requiredAmount: 17, piecesRequired: 1, rentPrice: 10, description: 'Производит алкоголь.' },
  tyaplyap: { id: 'tyaplyap', name: 'Тяп-ляп', rarity: 'rare', produces: 'work', requires: ['alcohol', 'mechanisms', 'food'], requiredAmount: 15, piecesRequired: 2, rentPrice: 20, description: 'Производит работу.' },
  zhivchik: { id: 'zhivchik', name: 'Живчик', rarity: 'rare', produces: 'rods', requires: ['metal', 'clocks', 'alcohol'], requiredAmount: 14, piecesRequired: 2, rentPrice: 20, description: 'Производит удочки.' },
  shesterka: { id: 'shesterka', name: 'Шестерка', rarity: 'rare', produces: 'mechanisms', requires: ['money', 'food', 'rods'], requiredAmount: 14, piecesRequired: 2, rentPrice: 20, description: 'Производит механизмы.' },
  oskolok: { id: 'oskolok', name: 'Осколок', rarity: 'epic', produces: 'glass', requires: ['fuel', 'rods', 'metal'], requiredAmount: 13, piecesRequired: 3, rentPrice: 30, description: 'Производит стекло.' },
  rtut: { id: 'rtut', name: 'Р-туть', rarity: 'epic', produces: 'metal', requires: ['fuel', 'mechanisms', 'work'], requiredAmount: 12, piecesRequired: 3, rentPrice: 30, description: 'Производит металл.' },
  alebusiness: { id: 'alebusiness', name: 'Алё, бизнес?', rarity: 'legendary', produces: 'money', requires: ['work', 'alcohol', 'clocks', 'glass'], requiredAmount: 11, piecesRequired: 5, rentPrice: 40, description: 'Производит деньги.' },
  time2359: { id: 'time2359', name: '23:59', rarity: 'collection', produces: 'clocks', requires: ['glass', 'mechanisms', 'work', 'metal'], requiredAmount: 11, piecesRequired: 10, rentPrice: 50, description: 'Производит часы.' },
};

export const ALL_VISAS = Object.values(VISAS);
export const STARTING_VISA_ID = 'zhiest';