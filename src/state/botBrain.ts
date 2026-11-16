import type { BusinessState, BusinessPlayer, Lot } from './businessStore';
import { VISAS } from '../data/visas';
import { GOODS } from '../data/goods';
import { BOARD } from '../data/board';
import type { BotProfile, Archetype } from '../data/botProfiles';
import { getBotProfile } from '../data/botProfiles';
import { getLevelData } from '../data/progression';
import { useGameStore } from './gameStore';

export type BotAction =
  | { type: 'CLOSE_VISA'; visaId: string }
  | { type: 'PRODUCE'; visaId: string; amount: 1 | 2 | 3 }
  | { type: 'SELL'; goodId: string; amount: number; totalPrice: number }
  | { type: 'BUY'; lotId: string }
  | { type: 'WAIT' };

export interface BotMemory {
  grudge: Record<string, number>;
  delayedCloseCount: number;
}

export function decideBotAction(
  state: BusinessState,
  self: BusinessPlayer,
  memory: BotMemory
): BotAction {
  const playerLevel = useGameStore.getState().player.level;
  const levelData = getLevelData(playerLevel);
  const difficulty = levelData.botDifficulty as any; // Приводим тип

  // Выбираем архетип на основе ID бота (чтобы он был постоянным)
  const archetypes: Archetype[] = ['speculator', 'industrialist', 'cautious'];
  const archetype = archetypes[self.id.charCodeAt(self.id.length - 1) % archetypes.length];
  const profile = getBotProfile(archetype, difficulty);

  const cell = BOARD[self.position];
  const allLots = [...state.lots, ...state.storage];

  // --- 1. Проверка на закрытие визитки (Приоритет 1) ---
  if (cell === 'start' || cell === 'walk') {
    for (const vId of self.visas) {
      if (self.closedVisas.includes(vId)) continue;
      const visa = VISAS[vId];
      const reqGood = self.selectedRequirements[vId];
      const have = self.inventory[reqGood] || 0;
      
      if (have >= visa.requiredAmount) {
        if (profile.closePolicy === 'delay' && memory.delayedCloseCount < 3) {
           memory.delayedCloseCount++;
        } else {
           return { type: 'CLOSE_VISA', visaId: vId };
        }
      }
    }
  }

  // --- 2. Логика для клетки Рынок ---
  if (cell === 'market') {
    const role = self.role;

    if (role === 'seller') {
      // Ищем излишки для продажи
      for (const [gId, amt] of Object.entries(self.inventory)) {
        let missing = 0;
        self.visas.forEach(vId => {
          if (!self.closedVisas.includes(vId) && self.selectedRequirements[vId] === gId) {
            missing += VISAS[vId].requiredAmount;
          }
        });

        const excess = amt - missing;
        if (excess > 0) {
          const amountToSell = Math.min(excess, profile.lotMax);
          const basePrice = GOODS[gId].basePrice;
          const unitPrice = Math.floor(basePrice * profile.sellBaseMult);
          return { type: 'SELL', goodId: gId, amount: amountToSell, totalPrice: unitPrice * amountToSell };
        }
      }
    } 
    
    if (role === 'buyer') {
      // Ищем, что нам нужно купить
      const neededGoods = new Set<string>();
      self.visas.forEach(vId => {
        if (!self.closedVisas.includes(vId)) {
          const reqGood = self.selectedRequirements[vId];
          const have = self.inventory[reqGood] || 0;
          if (have < VISAS[vId].requiredAmount) neededGoods.add(reqGood);
        }
      });

      // Фильтруем лоты
      const validLots = allLots.filter(lot => {
        if (lot.sellerId === self.id) return false;
        const unitPrice = lot.price / lot.amount;
        const maxAllowed = GOODS[lot.goodId].basePrice * profile.buyThreshold;
        const reserve = 20; // Не тратим всё до копейки
        return neededGoods.has(lot.goodId) && unitPrice <= maxAllowed && self.scraps - lot.price >= reserve;
      });

      if (validLots.length > 0) {
        // Сортируем по цене за штуку
        validLots.sort((a, b) => (a.price / a.amount) - (b.price / b.amount));
        return { type: 'BUY', lotId: validLots[0].id };
      }

      // Если на рынке пусто, идем на склад (если он есть в allLots)
      const storageLots = state.storage.filter(lot => {
        const unitPrice = lot.price / lot.amount;
        return neededGoods.has(lot.goodId) && unitPrice <= GOODS[lot.goodId].basePrice * 1.5 && self.scraps > lot.price;
      });
      if (storageLots.length > 0) {
        return { type: 'BUY', lotId: storageLots[0].id };
      }
    }
  }

  // --- 3. Логика для клетки Производство ---
  if (cell === 'production') {
    const activeVisaId = self.visas.find(vId => !self.closedVisas.includes(vId));
    if (activeVisaId) {
      const visa = VISAS[activeVisaId];
      const good = visa.produces;
      const missing = visa.requiredAmount - (self.inventory[good] || 0);
      
      if (missing > 0) {
        let amountToProduce: 1 | 2 | 3 = 1;
        const basePrice = GOODS[good].basePrice;
        
        // Оцениваем деньги на 2 или 3 единицы
        const cost2 = Math.floor(basePrice * 0.25);
        const cost3 = Math.floor(basePrice * 0.75);

        if (profile.productionPref === 3 && missing >= 3 && self.scraps >= cost3) amountToProduce = 3;
        else if (profile.productionPref >= 2 && missing >= 2 && self.scraps >= cost2) amountToProduce = 2;

        return { type: 'PRODUCE', visaId: activeVisaId, amount: amountToProduce };
      }
    }
  }

  // --- 4. Обработка ошибок (Сложность) ---
  if (Math.random() < profile.mistakeChance) {
    // Бот может случайно сделать глупость (например, подождать)
    return { type: 'WAIT' };
  }

  return { type: 'WAIT' };
}