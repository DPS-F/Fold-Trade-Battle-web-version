import { create } from 'zustand';
import { TEMPLATES } from '../data/templates';
import { useGameStore } from './gameStore';
import { getLevelData } from '../data/progression';
import type { FleetShip } from './gameStore';

export interface BattleUnit {
  id: string;
  templateId: string;
  currentHp: number;
  maxHp: number;
  spd: number;
  isBot: boolean;
}

export interface BattleState {
  playerFleet: BattleUnit[];
  botFleet: BattleUnit[];
  phase: 'setup' | 'player_turn' | 'bot_turn' | 'ended';
  turn: 'player' | 'bot' | 'none';
  winner: 'player' | 'bot' | 'none';
  log: string[];
  round: number;
  turnQueue: string[];
  activeUnitId: string | null;
  initiativeHolder: 'player' | 'bot' | 'none';

  startBattle: (playerFleetData: FleetShip[]) => void;
  attack: (targetId: string) => void;
  botTurn: () => void;
  passTurn: () => void;
  // Добавлены недостающие методы:
  nextTurn: () => void;
  buildTurnQueue: () => void;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  playerFleet: [], botFleet: [], phase: 'setup', turn: 'none', winner: 'none', log: [], round: 1, turnQueue: [], activeUnitId: null, initiativeHolder: 'none',

  startBattle: (playerFleetData) => {
    const playerLevel = useGameStore.getState().player.level;
    
    const playerFleet: BattleUnit[] = playerFleetData.map(s => {
      const template = TEMPLATES[s.templateId];
      return { id: s.id, templateId: s.templateId, currentHp: template.hp, maxHp: template.hp, spd: template.spd, isBot: false };
    });

    const botFleet: BattleUnit[] = [];
    let botTemplates = ['scout'];
    if (playerLevel >= 6) botTemplates = ['frigate', 'scout', 'scout'];
    if (playerLevel >= 9) botTemplates = ['battleship', 'scout', 'scout'];
    if (playerLevel >= 11) botTemplates = ['battleship', 'battleship', 'scout'];

    const hpMod = playerLevel <= 2 ? 0.8 : playerLevel <= 5 ? 0.9 : 0.95;
    const dmgMod = playerLevel <= 2 ? 0.7 : playerLevel <= 5 ? 0.9 : 0.95;

    botTemplates.forEach((tId, i) => {
      const template = TEMPLATES[tId];
      botFleet.push({
        id: `bot_${i}_${Date.now()}`,
        templateId: tId,
        currentHp: Math.max(1, Math.floor(template.hp * hpMod)),
        maxHp: Math.max(1, Math.floor(template.hp * hpMod)),
        spd: template.spd,
        isBot: true,
      });
    });

    const pSpd = playerFleet.reduce((sum, u) => sum + u.spd, 0);
    const bSpd = botFleet.reduce((sum, u) => sum + u.spd, 0);
    let initiativeHolder: 'player' | 'bot' = 'player';
    if (bSpd > pSpd) initiativeHolder = 'bot';
    else if (bSpd === pSpd) {
      const pCost = playerFleet.reduce((sum, u) => sum + TEMPLATES[u.templateId].cost, 0);
      const bCost = botFleet.reduce((sum, u) => sum + TEMPLATES[u.templateId].cost, 0);
      if (bCost < pCost) initiativeHolder = 'bot';
      else if (bCost === pCost && playerLevel >= 7) initiativeHolder = 'bot';
    }

    set({
      playerFleet, botFleet, phase: 'setup', winner: 'none', round: 1, log: [], initiativeHolder,
    });
    get().buildTurnQueue();
  },

  buildTurnQueue: () => {
    const { playerFleet, botFleet, initiativeHolder } = get();
    const allUnits = [...playerFleet, ...botFleet];
    
    allUnits.sort((a, b) => {
      if (b.spd !== a.spd) return b.spd - a.spd;
      if (a.isBot !== b.isBot) {
        return (initiativeHolder === 'player' && !a.isBot) ? -1 : (initiativeHolder === 'bot' && a.isBot) ? -1 : 1;
      }
      return 0;
    });

    const queue = allUnits.map(u => u.id);
    set({ turnQueue: queue });
    get().nextTurn();
  },

  nextTurn: () => {
    const state = get();
    if (state.phase === 'ended') return;

    if (state.turnQueue.length === 0) {
      if (state.round >= 30) {
        const pTotalHp = state.playerFleet.reduce((sum, u) => sum + u.currentHp, 0);
        const bTotalHp = state.botFleet.reduce((sum, u) => sum + u.currentHp, 0);
        const winner = pTotalHp >= bTotalHp ? 'player' : 'bot';
        set({ phase: 'ended', winner, log: [...state.log, `Лимит раундов! Победа по HP: ${winner === 'player' ? 'Игрок' : 'Бот'}`] });
        return;
      }
      
      set({ round: state.round + 1, log: [...state.log, `--- Раунд ${state.round + 1} ---`] });
      get().buildTurnQueue();
      return;
    }

    const nextUnitId = state.turnQueue[0];
    const currentQueue = state.turnQueue.slice(1);
    
    const unit = [...state.playerFleet, ...state.botFleet].find(u => u.id === nextUnitId);
    if (!unit || unit.currentHp <= 0) {
      set({ turnQueue: currentQueue });
      get().nextTurn();
      return;
    }

    set({ turnQueue: currentQueue, activeUnitId: nextUnitId, phase: unit.isBot ? 'bot_turn' : 'player_turn', turn: unit.isBot ? 'bot' : 'player' });
    
    if (unit.isBot) {
      setTimeout(() => get().botTurn(), 1000);
    }
  },

  attack: (targetId) => {
    const state = get();
    const attacker = [...state.playerFleet, ...state.botFleet].find(u => u.id === state.activeUnitId);
    if (!attacker || attacker.isBot) return;

    const target = state.botFleet.find(u => u.id === targetId);
    if (!target) return;

    let damage = TEMPLATES[attacker.templateId].damage;
    
    if (state.playerFleet.length === 1 && state.botFleet.length >= 2) damage *= 2;
    else if (state.playerFleet.length < state.botFleet.length) damage += 1;

    target.currentHp -= damage;
    
    let newLog = [...state.log, `Ваш ${TEMPLATES[attacker.templateId].name} нанес ${damage} урона.`];
    const newBotFleet = state.botFleet.filter(u => u.currentHp > 0);
    
    if (target.currentHp <= 0) newLog.push(`Вражеский ${TEMPLATES[target.templateId].name} уничтожен!`);

    if (newBotFleet.length === 0) {
      set({ playerFleet: [...state.playerFleet], botFleet: newBotFleet, phase: 'ended', winner: 'player', log: newLog });
      return;
    }

    set({ playerFleet: [...state.playerFleet], botFleet: newBotFleet, log: newLog });
    get().nextTurn();
  },

  botTurn: () => {
    const state = get();
    const bot = state.botFleet.find(u => u.id === state.activeUnitId);
    if (!bot) return;

    const playerLevel = useGameStore.getState().player.level;
    const difficulty = getLevelData(playerLevel).botDifficulty;

    const alivePlayers = state.playerFleet.filter(u => u.currentHp > 0);
    if (alivePlayers.length === 0) return;

    let target = alivePlayers[0];
    const r = Math.random();

    if (difficulty === 'easy') {
      if (r < 0.1) {
        set({ log: [...state.log, `Бот пропустил атаку.`] });
        get().nextTurn(); return;
      }
      target = r < 0.55 ? alivePlayers[Math.floor(Math.random() * alivePlayers.length)] : alivePlayers[0];
    } else if (difficulty === 'medium') {
      if (r < 0.05) {
        set({ log: [...state.log, `Бот пропустил атаку.`] });
        get().nextTurn(); return;
      }
      target = r < 0.65 ? alivePlayers.reduce((prev, curr) => (prev.currentHp < curr.currentHp ? prev : curr)) : alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    } else if (difficulty === 'hard' || difficulty === 'expert') {
      target = alivePlayers.reduce((prev, curr) => (prev.currentHp < curr.currentHp ? prev : curr));
    }

    let damage = TEMPLATES[bot.templateId].damage;
    if (state.botFleet.length === 1 && state.playerFleet.length >= 2) damage *= 2;
    else if (state.botFleet.length < state.playerFleet.length) damage += 1;

    target.currentHp -= damage;
    
    let newLog = [...state.log, `Вражеский ${TEMPLATES[bot.templateId].name} нанес ${damage} урона вашему ${TEMPLATES[target.templateId].name}.`];
    const newPlayerFleet = state.playerFleet.filter(u => u.currentHp > 0);

    if (target.currentHp <= 0) newLog.push(`Ваш ${TEMPLATES[target.templateId].name} уничтожен!`);

    if (newPlayerFleet.length === 0) {
      set({ playerFleet: newPlayerFleet, phase: 'ended', winner: 'bot', log: newLog });
      return;
    }

    set({ playerFleet: newPlayerFleet, log: newLog });
    get().nextTurn();
  },

  passTurn: () => {
    get().nextTurn();
  }
}));