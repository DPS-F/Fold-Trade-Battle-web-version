import type { Visa } from './types';

export const VISAS: Record<string, Visa> = {
  zhiest: {
    id: 'zhiest', name: 'Жи-есть', rarity: 'simple', produces: 'food',
    requires: ['rods', 'clocks', 'money'], requiredAmount: 10, piecesRequired: 1, rentPrice: 50,
    description: 'Производит еду. Нужна удочка, часы или деньги.',
  },
  smetana: {
    id: 'smetana', name: 'С-метан-а', rarity: 'simple', produces: 'fuel',
    requires: ['mechanisms', 'metal', 'money'], requiredAmount: 10, piecesRequired: 1, rentPrice: 50,
    description: 'Производит топливо. Нужны механизмы, металл или деньги.',
  },
  badyaga: {
    id: 'badyaga', name: 'Бадяга', rarity: 'simple', produces: 'alcohol',
    requires: ['food', 'fuel', 'glass'], requiredAmount: 12, piecesRequired: 1, rentPrice: 60,
    description: 'Производит алкоголь. Нужна еда, топливо или стекло.',
  },
  tyaplyap: {
    id: 'tyaplyap', name: 'Тяп-ляп', rarity: 'rare', produces: 'work',
    requires: ['alcohol', 'mechanisms', 'food'], requiredAmount: 15, piecesRequired: 2, rentPrice: 100,
    description: 'Производит работу. Нужен алкоголь, механизмы или еда.',
  },
  zhivchik: {
    id: 'zhivchik', name: 'Живчик', rarity: 'rare', produces: 'rods',
    requires: ['metal', 'clocks', 'alcohol'], requiredAmount: 15, piecesRequired: 2, rentPrice: 100,
    description: 'Производит удочки. Нужен металл, часы или алкоголь.',
  },
  shesterka: {
    id: 'shesterka', name: 'Шестерка', rarity: 'rare', produces: 'mechanisms',
    requires: ['money', 'food', 'rods'], requiredAmount: 15, piecesRequired: 2, rentPrice: 120,
    description: 'Производит механизмы. Нужны деньги, еда или удочки.',
  },
  oskolok: {
    id: 'oskolok', name: 'Осколок', rarity: 'epic', produces: 'glass',
    requires: ['fuel', 'rods', 'metal'], requiredAmount: 20, piecesRequired: 3, rentPrice: 200,
    description: 'Производит стекло. Нужно топливо, удочки или металл.',
  },
  rtut: {
    id: 'rtut', name: 'Р-туть', rarity: 'epic', produces: 'metal',
    requires: ['fuel', 'mechanisms', 'work'], requiredAmount: 20, piecesRequired: 3, rentPrice: 220,
    description: 'Производит металл. Нужно топливо, механизмы или работа.',
  },
  alebusiness: {
    id: 'alebusiness', name: 'Алё, бизнес?', rarity: 'legendary', produces: 'money',
    requires: ['work', 'alcohol', 'clocks', 'glass'], requiredAmount: 25, piecesRequired: 5, rentPrice: 400,
    description: 'Производит деньги. Нужна работа, алкоголь, часы или стекло.',
  },
  time2359: {
    id: 'time2359', name: '23:59', rarity: 'collection', produces: 'clocks',
    requires: ['glass', 'mechanisms', 'work', 'metal'], requiredAmount: 30, piecesRequired: 10, rentPrice: 800,
    description: 'Производит часы. Нужно стекло, механизмы, работа или металл.',
  },
};

export const ALL_VISAS = Object.values(VISAS);
export const STARTING_VISA_ID = 'zhiest';