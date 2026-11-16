import { create } from 'zustand';
import { VISAS } from '../data/visas';
import { GOODS } from '../data/goods';
import { BOARD } from '../data/board';
import type { CellType } from '../data/types';
import { useGameStore } from './gameStore';
import { getLevelData } from '../data/progression';
import { ALL_VISAS } from '../data/visas';
import { decideBotAction, type BotMemory, type BotAction } from './botBrain';

export interface BusinessPlayer {
  id: string; name: string; isBot: boolean; scraps: number; position: number;
  inventory: Record<string, number>; visas: string[]; closedVisas: string[];
  selectedRequirements: Record<string, string>;
  role: 'buyer' | 'seller' | null; roleHistory: ('buyer' | 'seller')[];
}

export interface Lot {
  id: string; sellerId: string; goodId: string; amount: number; price: number;
  isCritical?: boolean;
}

export interface BusinessState {
  players: BusinessPlayer[]; lots: Lot[]; storage: Lot[];
  turnIndex: number; phase: 'idle' | 'rolling' | 'moving' | 'action' | 'ended';
  lastRoll: number; winnerId: string | null; turnCount: number; roundCount: number;
  botMemory: Record<string, BotMemory>;
  log: string[]; // Добавили лог событий

  startMatch: (playerVisas: string[], botCount: number, botDifficulty: string) => void;
  rollDice: () => void; executeCell: () => void; endTurn: () => void;
  buyLot: (lotId: string) => boolean; createLot: (goodId: string, amount: number, totalPrice: number) => boolean;
  produce: (visaId: string, amount: number) => boolean; closeVisa: (visaId: string) => boolean;
  addLog: (msg: string) => void;
}

const BOT_NAMES = ['Бот-Торговец', 'Бот-Магнат', 'Бот-Спекулянт'];

export const useBusinessStore = create<BusinessState>((set, get) => ({
  players: [], lots: [], storage: [], turnIndex: 0, phase: 'idle', lastRoll: 0, winnerId: null, turnCount: 0, roundCount: 0,
  botMemory: {}, log: [],

  addLog: (msg) => set(state => ({ log: [...state.log, msg] })),

  startMatch: (playerVisas, botCount) => {
    const pReqs: Record<string, string> = {};
    playerVisas.forEach(vId => {
        const visa = VISAS[vId];
        const pOutputs = playerVisas.map(id => VISAS[id].produces);
        const validReqs = visa.requires.filter(r => !pOutputs.includes(r));
        pReqs[vId] = validReqs[0] || visa.requires[0];
    });

    const players: BusinessPlayer[] = [
      { id: 'player', name: 'Вы', isBot: false, scraps: 100, position: 0, inventory: {}, visas: playerVisas, closedVisas: [], selectedRequirements: pReqs, role: null, roleHistory: [] }
    ];

    const playerNeeds = Object.values(pReqs);
    const playerOutputs = playerVisas.map(v => VISAS[v].produces);
    const availableForBots = [...ALL_VISAS].filter(v => !playerVisas.includes(v.id));
    
    const botMemories: Record<string, BotMemory> = {};

    for (let i = 0; i < botCount; i++) {
      let botVisa = availableForBots.splice(0, 1)[0];
      if (!botVisa) break;
      
      let botName = botVisa.name;
      let selectedReq = botVisa.requires[0];
      
      if (playerVisas.length === 1) {
          const pNeed = playerNeeds[0];
          const pOut = playerOutputs[0];
          if (botVisa.produces !== pNeed) {
             const producer = availableForBots.find(v => v.produces === pNeed);
             if (producer) {
                 botVisa = producer;
                 availableForBots.splice(availableForBots.indexOf(producer), 1);
             }
          }
          if (!botVisa.requires.includes(pOut)) {
             const donor = ALL_VISAS.find(v => v.requires.includes(pOut) && v.id !== botVisa.id);
             if (donor) botName = `${donor.name} ${botVisa.name}`;
             selectedReq = pOut;
          } else {
             selectedReq = pOut;
          }
      }

      const botId = `bot_${i}`;
      botMemories[botId] = { grudge: {}, delayedCloseCount: 0 };

      players.push({
        id: botId, name: botName, isBot: true, scraps: 100, position: 0,
        inventory: { [botVisa.produces]: 2 }, visas: [botVisa.id], closedVisas: [],
        selectedRequirements: { [botVisa.id]: selectedReq }, 
        role: null, roleHistory: [],
      });
    }

    set({ players, lots: [], storage: [], turnIndex: 0, phase: 'idle', lastRoll: 0, winnerId: null, turnCount: 0, roundCount: 0, botMemory: botMemories, log: ['Матч начался!'] });
    get().executeCell(); 
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
          get().addLog(`${current.name} прошел круг и получил 100 обрезков.`);
          if (current.id === 'player') set({ roundCount: state.roundCount + 1 });
        }

        set({ players, phase: 'action' });
        get().executeCell();
      }, 500);
    }, 600);
  },

  executeCell: () => {
    const state = get();
    
    if (state.roundCount > 0 || (state.roundCount === 0 && state.storage.length === 0)) {
        const allReqs = state.players.flatMap(p => Object.values(p.selectedRequirements));
        const allOutputs = state.players.flatMap(p => p.visas.map(v => VISAS[v].produces));
        const criticalGoods = [...new Set(allReqs)].filter(r => !allOutputs.includes(r));

        const storageLots: Lot[] = [];
        criticalGoods.forEach(g => {
            storageLots.push({ id: `storage_crit_${g}`, sellerId: 'storage', goodId: g, amount: 2, price: GOODS[g].basePrice, isCritical: true });
        });
        
        const freeSlots = Math.max(3, Math.min(6, allReqs.length)) - storageLots.length;
        const normalGoods = [...new Set(allReqs)].filter(g => !criticalGoods.includes(g));
        for(let i=0; i<freeSlots; i++) {
            const g = normalGoods[Math.floor(Math.random() * normalGoods.length)];
            if(g) storageLots.push({ id: `storage_norm_${i}`, sellerId: 'storage', goodId: g, amount: 2, price: Math.ceil(GOODS[g].basePrice * 1.5), isCritical: false });
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
      get().addLog(`${current.name} попал на штраф. Заплатил ${totalPenalty} или потерял товар.`);
      set({ players: [...state.players], phase: 'idle' }); get().endTurn();
    } else if (cell === 'market' || cell === 'production') {
      if (current.isBot) {
        const memory = state.botMemory[current.id] || { grudge: {}, delayedCloseCount: 0 };
        if (cell === 'market' && !current.role) {
          current.role = Math.random() > 0.5 ? 'buyer' : 'seller'; // Бот получает роль
        }
        
        const action = decideBotAction(state, current, memory);
        set({ botMemory: { ...state.botMemory, [current.id]: memory } });
        
        // Обработка действия бота
        const pIdx = state.players.findIndex(p => p.id === current.id);
        const newPlayers = [...state.players];

        if (action.type === 'CLOSE_VISA') {
           const visa = VISAS[action.visaId];
           const reqGood = current.selectedRequirements[action.visaId];
           current.inventory[reqGood] -= visa.requiredAmount;
           current.closedVisas.push(action.visaId);
           get().addLog(`${current.name} ЗАКРЫЛ ВИЗИТКУ ${visa.name}!`);
           set({ players: newPlayers });
           if (current.closedVisas.length === current.visas.length) {
               set({ phase: 'ended', winnerId: current.id });
               return;
           }
        } else if (action.type === 'BUY') {
           const lot = [...state.lots, ...state.storage].find(l => l.id === action.lotId);
           if (lot) {
              current.scraps -= lot.price;
              current.inventory[lot.goodId] = (current.inventory[lot.goodId] || 0) + lot.amount;
              get().addLog(`${current.name} купил ${GOODS[lot.goodId].name} x${lot.amount} за ${lot.price} 🪙.`);
              if (lot.sellerId === 'storage') set({ storage: state.storage.filter(l => l.id !== lot.id) });
              else {
                  const seller = newPlayers.find(p => p.id === lot.sellerId);
                  if (seller) seller.scraps += lot.price;
                  set({ lots: state.lots.filter(l => l.id !== lot.id) });
              }
           }
        } else if (action.type === 'SELL') {
           current.inventory[action.goodId] -= action.amount;
           set({ lots: [...state.lots, { id: `lot_${Date.now()}`, sellerId: current.id, goodId: action.goodId, amount: action.amount, price: action.totalPrice }] });
           get().addLog(`${current.name} выставил ${GOODS[action.goodId].name} x${action.amount} за ${action.totalPrice} 🪙.`);
        } else if (action.type === 'PRODUCE') {
           const visa = VISAS[action.visaId];
           const p = GOODS[visa.produces].basePrice;
           const cost = action.amount === 2 ? Math.floor(p * 0.25) : action.amount === 3 ? Math.floor(p * 0.75) : 0;
           current.scraps -= cost;
           current.inventory[visa.produces] = (current.inventory[visa.produces] || 0) + action.amount;
           get().addLog(`${current.name} произвел ${GOODS[visa.produces].name} x${action.amount}.`);
        } else {
           get().addLog(`${current.name} пропустил ход.`);
        }

        set({ players: newPlayers, phase: 'idle' });
        setTimeout(() => get().endTurn(), 1000); // Даем время прочитать лог
      } else {
        if (cell === 'market' && !current.role) {
          current.role = Math.random() > 0.5 ? 'buyer' : 'seller';
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
    set({ turnIndex: nextIndex, phase: 'idle', turnCount: state.turnCount + 1, log: [] }); // Очищаем лог для след хода
    if (state.players[nextIndex].isBot) setTimeout(() => get().rollDice(), 1000);
  },

  buyLot: (lotId) => {
    const state = get();
    let lot = state.lots.find(l => l.id === lotId);
    let isStorage = false;
    if (!lot) { lot = state.storage.find(l => l.id === lotId); isStorage = true; }
    
    const buyer = state.players[state.turnIndex];
    if (!lot || buyer.scraps < lot.price || buyer.isBot || lot.sellerId === buyer.id) return false;

    if (isStorage && lot.amount > 3) {
        alert("Со склада можно купить не более 3 единиц!");
        return false;
    }

    buyer.scraps -= lot.price; buyer.inventory[lot.goodId] = (buyer.inventory[lot.goodId] || 0) + lot.amount;

    if (isStorage) set({ players: [...state.players], storage: state.storage.filter(l => l.id !== lotId) });
    else {
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
    set({ players: [...state.players], lots: [...state.lots, { id: `lot_${Date.now()}`, sellerId: player.id, goodId, amount, price: totalPrice }] });
    get().endTurn(); return true;
  },

  produce: (visaId, amount) => {
    const state = get();
    const player = state.players[state.turnIndex];
    const visa = VISAS[visaId];
    if (!visa) return false;
    
    const p = GOODS[visa.produces].basePrice;
    let cost = amount === 2 ? Math.floor(p * 0.25) : amount === 3 ? Math.floor(p * 0.75) : 0;
    if (player.scraps < cost) return false;

    player.scraps -= cost; player.inventory[visa.produces] = (player.inventory[visa.produces] || 0) + amount;
    set({ players: [...state.players] }); get().endTurn(); return true;
  },

  closeVisa: (visaId) => {
    const state = get();
    const player = state.players[state.turnIndex];
    const visa = VISAS[visaId];
    const reqGood = player.selectedRequirements[visaId];
    
    if ((player.inventory[reqGood] || 0) < visa.requiredAmount) return false;

    player.inventory[reqGood] -= visa.requiredAmount; player.closedVisas.push(visaId);
    
    player.scraps += 100;
    if (player.id === 'player') {
        useGameStore.getState().addVisaPiece(visaId, 1);
        alert(`Визитка закрыта! Вы получили 100 обрезков и кусок визитки.`);
    }

    set({ players: [...state.players] });
    if (player.closedVisas.length === player.visas.length) set({ phase: 'ended', winnerId: player.id });
    else get().endTurn();
    
    return true;
  },
}));