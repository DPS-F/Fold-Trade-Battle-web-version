import { create } from 'zustand';
import { TEMPLATES } from '../data/templates';
import { useGameStore } from './gameStore';
import type { FleetShip } from './gameStore';
import { getLevelData } from '../data/progression';

export interface BattleUnit {
  id: string;
  templateId: string;
  currentHp: number;
  maxHp: number;
}

export interface BattleState {
  playerFleet: BattleUnit[];
  botFleet: BattleUnit[];
  phase: 'setup' | 'rolling' | 'player_turn' | 'bot_turn' | 'ended';
  turn: 'player' | 'bot' | 'none';
  winner: 'player' | 'bot' | 'none';
  attacksLeft: number;
  log: string[];

  startBattle: (playerFleetData: FleetShip[]) => void;
  rollInitiative: () => void;
  attack: (attackerId: string, targetId: string) => void;
  botTurn: () => void;
  resetBattle: () => void;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  playerFleet: [],
  botFleet: [],
  phase: 'setup',
  turn: 'none',
  winner: 'none',
  attacksLeft: 0,
  log: [],

  startBattle: (playerFleetData) => {
    const playerLevel = useGameStore.getState().player.level;
    const levelData = getLevelData(playerLevel);

    // Формируем флот игрока
    const playerFleet: BattleUnit[] = playerFleetData.map(s => {
      const template = TEMPLATES[s.templateId];
      return { id: s.id, templateId: s.templateId, currentHp: template.hp, maxHp: template.hp };
    });

    // Формируем флот бота в зависимости от сложности
    const botFleet: BattleUnit[] = [];
    const fleetSize = Math.min(3, playerFleetData.length || 1); // Бот выставляет столько же, сколько игрок (мин 1)
    
    let botTemplate = 'scout';
    if (levelData.botDifficulty === 'medium') botTemplate = 'frigate';
    if (levelData.botDifficulty === 'hard') botTemplate = Math.random() > 0.5 ? 'battleship' : 'frigate';

    for (let i = 0; i < fleetSize; i++) {
      const template = TEMPLATES[botTemplate];
      botFleet.push({
        id: `bot_${i}_${Date.now()}`,
        templateId: botTemplate,
        currentHp: template.hp,
        maxHp: template.hp,
      });
    }

    set({
      playerFleet,
      botFleet,
      phase: 'setup',
      turn: 'none',
      winner: 'none',
      attacksLeft: 0,
      log: ['Бой начался!'],
    });
  },

  rollInitiative: () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    const isPlayerFirst = roll % 2 === 0;
    
    set({
      phase: isPlayerFirst ? 'player_turn' : 'bot_turn',
      turn: isPlayerFirst ? 'player' : 'bot',
      attacksLeft: 0,
      log: [`Бросок кубика: ${roll}. Первым ходит ${isPlayerFirst ? 'игрок' : 'бот'}.`],
    });

    if (!isPlayerFirst) {
      setTimeout(() => get().botTurn(), 1000);
    } else {
      get().attack('', ''); // Триггерим проверку лимитов атак
    }
  },

  attack: (attackerId, targetId) => {
    const state = get();
    if (state.phase !== 'player_turn') return;

    // Если атака не указана (только зашли в ход), рассчитываем лимиты
    if (!attackerId && !targetId) {
      const pCount = state.playerFleet.length;
      const bCount = state.botFleet.length;
      let attacks = 1;
      if (pCount < bCount && pCount > 1) attacks = pCount; // Если 2 против 3, бьем двумя
      
      set({ attacksLeft: attacks });
      return;
    }

    const pFleet = [...state.playerFleet];
    const bFleet = [...state.botFleet];
    const attacker = pFleet.find(u => u.id === attackerId);
    const target = bFleet.find(u => u.id === targetId);
    
    if (!attacker || !target) return;

    // Урон
    let damage = TEMPLATES[attacker.templateId].damage;
    if (pFleet.length === 1 && bFleet.length >= 2) damage *= 2; // Двойной урон за 1 против многих

    target.currentHp -= damage;
    
    let newLog = [...state.log, `Ваш ${TEMPLATES[attacker.templateId].name} нанес ${damage} урона.`];
    
    if (target.currentHp <= 0) {
      newLog.push(`Вражеский ${TEMPLATES[target.templateId].name} уничтожен!`);
      bFleet.splice(bFleet.indexOf(target), 1);
    }

    const nextAttacks = state.attacksLeft - 1;

    if (bFleet.length === 0) {
      set({ playerFleet: pFleet, botFleet: bFleet, phase: 'ended', winner: 'player', log: newLog });
      return;
    }

    if (nextAttacks > 0) {
      set({ playerFleet: pFleet, botFleet: bFleet, attacksLeft: nextAttacks, log: newLog });
    } else {
      set({ playerFleet: pFleet, botFleet: bFleet, phase: 'bot_turn', turn: 'bot', log: newLog });
      setTimeout(() => get().botTurn(), 1000);
    }
  },

  botTurn: () => {
    const state = get();
    if (state.phase !== 'bot_turn') return;

    const pFleet = [...state.playerFleet];
    const bFleet = [...state.botFleet];

    if (pFleet.length === 0) {
      set({ phase: 'ended', winner: 'bot' });
      return;
    }

    // Бот атакует слабейшего
    let target = pFleet[0];
    for (const u of pFleet) {
      if (u.currentHp < target.currentHp) target = u;
    }

    // Бот атакует. Какой из его кораблей? Возьмем первый живой.
    const attacker = bFleet[0];
    let damage = TEMPLATES[attacker.templateId].damage;
    
    // Правило неравного флота для бота
    if (bFleet.length === 1 && pFleet.length >= 2) damage *= 2;
    
    target.currentHp -= damage;
    
    let newLog = [...state.log, `Вражеский ${TEMPLATES[attacker.templateId].name} нанес ${damage} урона вашему ${TEMPLATES[target.templateId].name}.`];
    
    if (target.currentHp <= 0) {
      newLog.push(`Ваш ${TEMPLATES[target.templateId].name} уничтожен!`);
      pFleet.splice(pFleet.indexOf(target), 1);
    }

    if (pFleet.length === 0) {
      set({ playerFleet: pFleet, phase: 'ended', winner: 'bot', log: newLog });
      return;
    }

    // Передаем ход игроку
    set({ playerFleet: pFleet, botFleet: bFleet, phase: 'player_turn', turn: 'player', log: newLog });
    get().attack('', ''); // Триггерим расчет атак
  },

  resetBattle: () => set({ playerFleet: [], botFleet: [], phase: 'setup', turn: 'none', winner: 'none', log: [] }),
}));