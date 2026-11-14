import { create } from 'zustand';
import { VISAS } from '../data/visas';
import { GOODS } from '../data/goods';
import { BOARD } from '../data/board';
import type { CellType } from '../data/types';
import { useGameStore } from './gameStore';
import { getLevelData } from '../data/progression';

export interface BusinessPlayer {
  id: string; name: string; isBot: boolean; scraps: number; position: number;
  inventory: Record<string, number>; visas: string[]; closedVisas: string[];
  role: 'buyer' | 'seller' | null; roleHistory: ('buyer' | 'seller')[];
}

export interface Lot {
  id: string; sellerId: string; goodId: string; amount: number; price: number;
}

export interface BusinessState {
  players: BusinessPlayer[]; lots: Lot[]; storage: Lot[];
  turnIndex: number; phase: 'idle' | 'rolling' | 'moving' | 'action' | 'ended';
  lastRoll: number; winnerId: string | null; turnCount: number; roundCount: number;

  startMatch: (playerVisas: string[], botCount: number, botDifficulty: string) => void;
  rollDice: () => void; executeCell: () => void; endTurn: () => void;
  buyLot: (lotId: string) => boolean; createLot: (goodId: string, amount: number, totalPrice: number) => boolean;
  produce: (visaId: string, amount: number) => boolean; closeVisa: (visaId: string) => boolean;
}

const BOT_NAMES = ['Бот-Торговец', 'Бот-Магнат', 'Бот-Спекулянт'];

export const useBusinessStore = create<BusinessState>((set, get) => ({
  players: [], lots: [], storage: [], turnIndex: 0, phase: 'idle', lastRoll: 0, winnerId: null, turnCount: 0, roundCount: 0,

  startMatch: (playerVisas, botCount) => {
    // Даем всем по 300 обрезков для комфортного старта
    const players: BusinessPlayer[] = [
      { id: 'player', name: 'Вы', isBot: false, scraps: 300, position: 0, inventory: {}, visas: playerVisas, closedVisas: [], role: null, roleHistory: [] }
    ];

    const playerNeeds = playerVisas.flatMap(v => VISAS[v].requires);
    const playerProduces = playerVisas.map(v => VISAS[v].produces);
    const availableForBots = Object.values(VISAS).filter(v => !playerVisas.includes(v.id));
    let selectedBotsVisas: string[] = [];

    if (playerVisas.length === 1) {
        const directLink = availableForBots.find(v => v.requires.includes(playerProduces[0]) && playerNeeds.includes(v.produces));
        if (directLink) selectedBotsVisas.push(directLink.id);
    }

    while (selectedBotsVisas.length < botCount && availableForBots.length > 0) {
        const neededProducer = availableForBots.find(v => playerNeeds.includes(v.produces) && !selectedBotsVisas.includes(v.id));
        if (neededProducer) selectedBotsVisas.push(neededProducer.id);
        else {
            const fallback = availableForBots.find(v => !selectedBotsVisas.includes(v.id));
            if (fallback) selectedBotsVisas.push(fallback.id);
        }
    }

    for (let i = 0; i < botCount; i++) {
      const vId = selectedBotsVisas[i];
      if (!vId) break;
      const botVisa = VISAS[vId];
      players.push({
        id: `bot_${i}`, name: BOT_NAMES[i % BOT_NAMES.length], isBot: true, scraps: 300, position: 0,
        inventory: { [botVisa.produces]: 3 }, visas: [vId], closedVisas: [], role: null, roleHistory: [],
      });
    }

    set({ players, lots: [], storage: [], turnIndex: 0, phase: 'idle', lastRoll: 0, winnerId: null, turnCount: 0, roundCount: 0 });
  },

  rollDice: () => {
    const state = get();
    if (state.phase !== 'idle') return;

    const roll = Math.floor(Math.random() * 6) + 1;
    set({ phase: 'rolling', lastRoll: roll });

    setTimeout(() => {
      set({ phase: 'moving' });
      setTimeout(() => {
        const players = [...state.players];
        const current = players[state.turnIndex];
        const oldPos = current.position;
        const newPos = (oldPos + roll) % BOARD.length;
        const wrapped = oldPos + roll >= BOARD.length;

        current.position = newPos;
        if (newPos === 0 || wrapped) {
          current.scraps += 100;
          if (current.id === 'player') {
             set({ roundCount: state.roundCount + 1 });
             get().executeCell();
          }
        }

        set({ players, phase: 'action' });
        get().executeCell();
      }, 500);
    }, 600);
  },

  executeCell: () => {
    const state = get();
    
    // Склад появляется после первого круга
    if (state.roundCount > 0 && state.storage.length === 0) {
        const allNeeds = state.players.flatMap(p => p.visas.flatMap(v => VISAS[v].requires));
        const uniqueNeeds = [...new Set(allNeeds)];
        const storageLots: Lot[] = [];
        for (let i = 0; i < 3; i++) {
            const goodId = uniqueNeeds[Math.floor(Math.random() * uniqueNeeds.length)];
            if (goodId) {
                const amount = Math.floor(Math.random() * 5) + 1;
                storageLots.push({
                    id: `storage_${i}`, sellerId: 'storage', goodId, amount, price: Math.floor(GOODS[goodId].basePrice * 1.5 * amount)
                });
            }
        }
        set({ storage: storageLots });
    }

    const current = state.players[state.turnIndex];
    const cell: CellType = BOARD[current.position];

    if (cell === 'start') {
      set({ players: [...state.players], phase: 'idle' }); get().endTurn();
    } else if (cell === 'walk') {
      set({ phase: 'idle' }); get().endTurn();
    } else if (cell === 'penalty') {
      let totalPenalty = 0;
      Object.entries(current.inventory).forEach(([goodId, amount]) => {
        if (amount > 0) totalPenalty += Math.floor(GOODS[goodId].basePrice * 0.25 * amount);
      });
      if (current.scraps >= totalPenalty) current.scraps -= totalPenalty;
      else { current.scraps = 0; current.inventory = {}; }
      set({ players: [...state.players], phase: 'idle' }); get().endTurn();
    } else if (cell === 'market' || cell === 'production') {
      if (current.isBot) {
        if (cell === 'market') {
          const allLots = [...get().lots, ...get().storage];
          let botRole: 'buyer' | 'seller' = Math.random() > 0.5 ? 'buyer' : 'seller';
          
          if (current.roleHistory.length >= 2 && current.roleHistory[0] === botRole && current.roleHistory[1] === botRole) 
            botRole = botRole === 'buyer' ? 'seller' : 'buyer';
          
          current.role = botRole; 
          current.roleHistory = [current.roleHistory[1] || botRole, botRole];

          if (botRole === 'seller') {
            // Бот-продавец выставляет свой товар
            const sellable = Object.entries(current.inventory).find(([_, amt]) => amt > 0);
            if (sellable) {
              const [gId, amt] = sellable;
              const amount = Math.min(amt, 5); // Макс 5 в лот
              const price = Math.floor(GOODS[gId].basePrice * amount); // Продает по базовой цене (100%)
              current.inventory[gId] -= amount;
              set({ lots: [...get().lots, { id: `lot_${Date.now()}_${Math.random()}`, sellerId: current.id, goodId: gId, amount, price }], players: [...state.players] });
            }
          } else {
            // Бот-покупатель ищет нужный товар
            const needed = current.visas.flatMap(vId => VISAS[vId].requires);
            const playerLevel = useGameStore.getState().player.level;
            const difficulty = getLevelData(playerLevel).botDifficulty;
            
            // По GDD: Легкий - до 100%, Средний - до 120%, Сложный - до 130%
            let maxMultiplier = 1.0;
            if (difficulty === 'medium') maxMultiplier = 1.2;
            if (difficulty === 'hard') maxMultiplier = 1.3;

            // Ищем подходящий лот (свой не берем)
            const wanted = allLots.find(l => 
                l.sellerId !== current.id && 
                needed.includes(l.goodId) && 
                current.scraps >= l.price &&
                (l.price / l.amount) <= (GOODS[l.goodId].basePrice * maxMultiplier)
            );

            if (wanted) {
              current.scraps -= wanted.price; 
              current.inventory[wanted.goodId] = (current.inventory[wanted.goodId] || 0) + wanted.amount;
              
              if (wanted.sellerId === 'storage') {
                  set({ storage: get().storage.filter(l => l.id !== wanted.id), players: [...state.players] });
              } else {
                  const seller = state.players.find(p => p.id === wanted.sellerId);
                  if (seller) seller.scraps += wanted.price;
                  set({ lots: get().lots.filter(l => l.id !== wanted.id), players: [...state.players] });
              }
            }
          }
          set({ phase: 'idle' }); get().endTurn();
        } else {
          const visaId = current.visas[0];
          if (visaId) current.inventory[VISAS[visaId].produces] = (current.inventory[VISAS[visaId].produces] || 0) + 1;
          set({ players: [...state.players], phase: 'idle' }); get().endTurn();
        }
      } else {
        if (cell === 'market') {
          let newRole: 'buyer' | 'seller' = Math.random() > 0.5 ? 'buyer' : 'seller';
          if (current.roleHistory.length >= 2 && current.roleHistory[0] === newRole && current.roleHistory[1] === newRole) newRole = newRole === 'buyer' ? 'seller' : 'buyer';
          current.role = newRole; current.roleHistory = [current.roleHistory[1] || newRole, newRole];
          set({ players: [...state.players] });
        }
      }
    }
  },

  endTurn: () => {
    const state = get();
    const winner = state.players.find(p => p.visas.length > 0 && p.closedVisas.length === p.visas.length);
    if (winner) { set({ phase: 'ended', winnerId: winner.id }); return; }

    const nextIndex = (state.turnIndex + 1) % state.players.length;
    set({ turnIndex: nextIndex, phase: 'idle', turnCount: state.turnCount + 1 });
    if (state.players[nextIndex].isBot) setTimeout(() => get().rollDice(), 1000);
  },

  buyLot: (lotId) => {
    const state = get();
    let lot = state.lots.find(l => l.id === lotId);
    let isStorage = false;
    if (!lot) { lot = state.storage.find(l => l.id === lotId); isStorage = true; }
    
    const buyer = state.players[state.turnIndex];
    if (!lot || buyer.scraps < lot.price || buyer.isBot) return false;
    if (lot.sellerId === buyer.id) return false;

    buyer.scraps -= lot.price; buyer.inventory[lot.goodId] = (buyer.inventory[lot.goodId] || 0) + lot.amount;

    if (isStorage) {
        set({ players: [...state.players], storage: state.storage.filter(l => l.id !== lotId) });
    } else {
        const seller = state.players.find(p => p.id === lot.sellerId);
        if (seller) seller.scraps += lot.price;
        set({ players: [...state.players], lots: state.lots.filter(l => l.id !== lotId) });
    }
    get().endTurn(); return true;
  },

  createLot: (goodId, amount, totalPrice) => {
    const state = get();
    const player = state.players[state.turnIndex];
    if (amount > 5 || (player.inventory[goodId] || 0) < amount) return false;
    const basePrice = GOODS[goodId].basePrice;
    if (totalPrice < basePrice * 0.5 * amount || totalPrice > basePrice * 1.5 * amount) return false;

    player.inventory[goodId] -= amount;
    set({ players: [...state.players], lots: [...state.lots, { id: `lot_${Date.now()}_${Math.random()}`, sellerId: player.id, goodId, amount, price: totalPrice }] });
    get().endTurn(); return true;
  },

  produce: (visaId, amount) => {
    const state = get();
    const player = state.players[state.turnIndex];
    const visa = VISAS[visaId];
    if (!visa) return false;
    let cost = amount === 2 ? Math.floor(GOODS[visa.produces].basePrice * 0.5) : amount === 3 ? Math.floor(GOODS[visa.produces].basePrice * 0.5) + GOODS[visa.produces].basePrice : 0;
    if (player.scraps < cost) return false;

    player.scraps -= cost; player.inventory[visa.produces] = (player.inventory[visa.produces] || 0) + amount;
    set({ players: [...state.players] }); get().endTurn(); return true;
  },

  closeVisa: (visaId) => {
    const state = get();
    const player = state.players[state.turnIndex];
    const visa = VISAS[visaId];
    const requiredGood = visa.requires[0];
    if ((player.inventory[requiredGood] || 0) < visa.requiredAmount) return false;

    player.inventory[requiredGood] -= visa.requiredAmount; player.closedVisas.push(visaId);
    set({ players: [...state.players] });
    if (player.closedVisas.length === player.visas.length) set({ phase: 'ended', winnerId: player.id });
    else get().endTurn();
    
    if (player.id === 'player') useGameStore.getState().unlockAchievement('close_visa');
    return true;
  },
}));