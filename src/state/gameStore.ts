import { create } from 'zustand';
import { ALL_VISAS } from '../data/visas';
import type { Rarity } from '../data/types';
import { ACHIEVEMENTS, ALL_ACHIEVEMENTS } from '../data/achievements';
import { ALL_QUESTS, type QuestType } from '../data/quests';

export interface FleetShip { id: string; templateId: string; maxHp: number; }
export type Screen = 'loading' | 'main-menu' | 'business-prep' | 'business-battle' | 'battle-prep' | 'folding' | 'battle';
export type OverlayId = 'profile' | 'documentation' | 'save-load' | 'feedback' | 'conversion' | 'settings' | 'visas-gallery' | 'rent-select' | 'my-visas' | 'market' | 'production' | 'templates-gallery' | 'folding-overlay' | 'battle-results' | 'business-results' | 'meta-rewards' | 'achievements' | 'level-map' | 'tutorial' | 'ending';

export interface PlayerSettings { musicVolume: number; sfxVolume: number; animations: boolean; uiScale: number; }

export interface PlayerState {
  name: string; gender: 'male' | 'female'; level: number; cyclesDone: number;
  businessWins: number; battleWins: number; coins: number; diamonds: number;
  paper: number; paint: number; visasOwned: string[]; visaPieces: Record<string, number>;
  unlockedTemplates: string[]; achievements: string[]; fleet: FleetShip[];
  settings: PlayerSettings; 
  
  lastLoginDate: string; lastWheelSpinDate: string;
  loginStreak: number;
  
  dailyQuests: string[];
  questProgress: Record<string, number>;
  questsClaimed: string[];
  lastQuestDate: string;

  tutorialCompleted: boolean;
  endings: string[]; // 'level_12', 'all_achievements', 'all_visas', 'true_ending'
  activeEnding: string | null; // Для показа оверлея
}

export interface GameState {
  screen: Screen; overlayStack: OverlayId[]; player: PlayerState; loaded: boolean;
  setScreen: (s: Screen) => void; openOverlay: (o: OverlayId) => void; closeOverlay: () => void; closeAllOverlays: () => void;
  setPlayerName: (name: string) => void; setPlayerGender: (g: 'male' | 'female') => void;
  addCoins: (n: number) => void; addDiamonds: (n: number) => void; addPaper: (n: number) => void;
  addVisaPiece: (visaId: string, amount: number) => void;
  convertCoinsToDiamonds: () => boolean; convertDiamondsToCoins: () => boolean;
  updateSettings: (s: Partial<PlayerSettings>) => void; markLoaded: () => void;
  registerBusinessWin: (profit: number, wonVs3: boolean) => void; registerBattleWin: (isBoss: boolean, flawless: boolean) => void;
  updateFleet: (fleet: FleetShip[]) => void; claimDailyBonus: (coins: number, paper: number) => void;
  spinWheel: (rewardType: string, amount: number) => void; unlockAchievement: (id: string) => void;
  progressQuest: (type: QuestType, amount: number) => void;
  claimQuestReward: (questId: string) => void;
  finishTutorial: () => void;
  triggerEnding: (endingId: string) => void;
}

const DEFAULT_PLAYER: PlayerState = {
  name: 'Игрок', gender: 'male', level: 1, cyclesDone: 0, businessWins: 0, battleWins: 0,
  coins: 250, diamonds: 3, paper: 10, paint: 0,
  visasOwned: ['zhiest'], visaPieces: {}, unlockedTemplates: ['scout'],
  achievements: [], fleet: [], settings: { musicVolume: 0.35, sfxVolume: 0.6, animations: true, uiScale: 1 },
  lastLoginDate: '', lastWheelSpinDate: '', loginStreak: 0,
  dailyQuests: [], questProgress: {}, questsClaimed: [], lastQuestDate: '',
  tutorialCompleted: false, endings: [], activeEnding: null,
};

const STORAGE_KEY = 'ftb-save-v1';

function generateDailyQuests(): string[] {
  const shuffled = [...ALL_QUESTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).map(q => q.id);
}

function loadFromStorage(): Partial<PlayerState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1 && parsed.player) {
      return { ...DEFAULT_PLAYER, ...parsed.player };
    }
  } catch (e) {}
  return null;
}

export function saveToStorage(player: PlayerState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, player })); } catch (e) {}
}

const saved = loadFromStorage();

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'loading', overlayStack: [], player: { ...DEFAULT_PLAYER, ...saved }, loaded: false,

  setScreen: (s) => set({ screen: s, overlayStack: [] }),
  openOverlay: (o) => set((state) => {
    if (state.overlayStack[state.overlayStack.length - 1] === o) return state;
    return { overlayStack: [...state.overlayStack, o] };
  }),
  closeOverlay: () => set((state) => ({ overlayStack: state.overlayStack.slice(0, -1) })),
  closeAllOverlays: () => set({ overlayStack: [] }),

  setPlayerName: (name) => { const player = { ...get().player, name: name.slice(0, 20) }; set({ player }); saveToStorage(player); },
  setPlayerGender: (gender) => { const player = { ...get().player, gender }; set({ player }); saveToStorage(player); },
  
  addCoins: (n) => { 
    const player = { ...get().player, coins: Math.max(0, get().player.coins + n) }; 
    set({ player }); saveToStorage(player); 
    get().unlockAchievement('rich_man'); 
    if (n > 0) get().progressQuest('earn_coins', n);
  },
  addDiamonds: (n) => { const player = { ...get().player, diamonds: Math.max(0, get().player.diamonds + n) }; set({ player }); saveToStorage(player); },
  addPaper: (n) => { const player = { ...get().player, paper: Math.max(0, get().player.paper + n) }; set({ player }); saveToStorage(player); },
  
  addVisaPiece: (visaId, amount) => {
    const p = get().player;
    const pieces = { ...p.visaPieces };
    pieces[visaId] = (pieces[visaId] || 0) + amount;
    let newVisasOwned = [...p.visasOwned];
    const visa = ALL_VISAS.find(v => v.id === visaId);
    
    if (visa && pieces[visaId] >= visa.piecesRequired && !newVisasOwned.includes(visaId)) {
       newVisasOwned.push(visaId);
       alert(`Вы собрали новую визитку: ${visa.name}!`);
       if (newVisasOwned.length === 10) get().triggerEnding('all_visas');
    }
    const player = { ...p, visaPieces: pieces, visasOwned: newVisasOwned };
    set({ player }); saveToStorage(player);
  },

  convertCoinsToDiamonds: () => {
    const { coins, diamonds } = get().player; if (coins < 300) return false;
    const player = { ...get().player, coins: coins - 300, diamonds: diamonds + 1 };
    set({ player }); saveToStorage(player); return true;
  },
  convertDiamondsToCoins: () => {
    const { coins, diamonds } = get().player; if (diamonds < 1) return false;
    const player = { ...get().player, coins: coins + 150, diamonds: diamonds - 1 };
    set({ player }); saveToStorage(player); return true;
  },
  updateSettings: (s) => { const player = { ...get().player, settings: { ...get().player.settings, ...s } }; set({ player }); saveToStorage(player); },
  markLoaded: () => set({ loaded: true }),
  
  updateFleet: (fleet) => { 
    const player = { ...get().player, fleet }; 
    set({ player }); saveToStorage(player); 
    get().progressQuest('fold_ships', 1);
    if (fleet.filter(s => s.templateId === 'battleship').length >= 3) get().unlockAchievement('fleet_3_battleships');
  },

  registerBusinessWin: (profit, wonVs3) => {
    const p = get().player;
    const newBusinessWins = p.businessWins + 1;
    const newCycles = p.cyclesDone + 1;
    let newLevel = p.level;
    let newTemplates = [...p.unlockedTemplates];

    if (newBusinessWins >= p.level && p.battleWins >= p.level && p.level < 12) {
        newLevel = p.level + 1;
        // Разблокировка шаблонов по уровням
        if (newLevel === 4 && !newTemplates.includes('frigate')) newTemplates.push('frigate');
        if (newLevel === 7 && !newTemplates.includes('battleship')) newTemplates.push('battleship');
        if (newLevel === 12) get().triggerEnding('level_12');
    }
    
    const player = { 
        ...p, 
        businessWins: newBusinessWins, 
        cyclesDone: newCycles, 
        coins: p.coins + Math.floor(profit * 0.1), 
        paper: p.paper + Math.floor(Math.random() * 4) + 1, 
        level: newLevel,
        unlockedTemplates: newTemplates
    };
    set({ player }); saveToStorage(player);
    
    get().unlockAchievement('first_business_win');
    if (newBusinessWins >= 10) get().unlockAchievement('business_10');
    if (newBusinessWins >= 25) get().unlockAchievement('business_25');
    if (wonVs3) get().unlockAchievement('business_vs_3');
    if (newLevel >= 5) get().unlockAchievement('level_5');
    if (newLevel >= 10) get().unlockAchievement('level_10');
    
    get().progressQuest('business_win', 1);
    get().progressQuest('earn_coins', Math.floor(profit * 0.1)); // Фикс квеста на монеты
  },

  registerBattleWin: (isBoss, flawless) => {
    const p = get().player;
    
    if (Math.random() <= 0.75) {
        const roll = Math.random() * 100;
        let rarity: Rarity = 'simple';
        if (roll >= 95) rarity = 'collection';
        else if (roll >= 85) rarity = 'legendary';
        else if (roll >= 65) rarity = 'epic';
        else if (roll >= 35) rarity = 'rare';

        const visasOfRarity = ALL_VISAS.filter(v => v.rarity === rarity);
        let targetVisa = visasOfRarity.find(v => (p.visaPieces[v.id] || 0) < v.piecesRequired);
        
        if (targetVisa) {
          get().addVisaPiece(targetVisa.id, 1);
          alert(`Вы получили кусок визитки: ${targetVisa.name}!`);
        }
    }

    const player = { ...get().player, battleWins: get().player.battleWins + 1, coins: get().player.coins + 50 };
    set({ player }); saveToStorage(player);

    get().unlockAchievement('first_battle_win');
    if (player.battleWins >= 10) get().unlockAchievement('battle_10');
    if (player.battleWins >= 25) get().unlockAchievement('battle_25');
    if (flawless) get().unlockAchievement('flawless_victory');
    
    if (isBoss) {
      if (player.level === 3) get().unlockAchievement('boss_3');
      if (player.level === 6) get().unlockAchievement('boss_6');
      if (player.level === 9) get().unlockAchievement('boss_9');
      if (player.level === 12) get().unlockAchievement('boss_12');
    }

    get().progressQuest('battle_win', 1);
    get().progressQuest('earn_coins', 50);
  },

  claimDailyBonus: (coins, paper) => {
    const today = new Date().toDateString();
    const p = get().player;
    
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = p.lastLoginDate === yesterday ? p.loginStreak + 1 : 1;
    if (newStreak >= 5) get().unlockAchievement('daily_streak');

    let newQuests = p.dailyQuests;
    let newQuestProgress = p.questProgress;
    let newQuestsClaimed = p.questsClaimed;
    
    if (p.lastQuestDate !== today) {
       newQuests = generateDailyQuests();
       newQuestProgress = {};
       newQuestsClaimed = [];
    }

    const player = { 
      ...p, coins: p.coins + coins, paper: p.paper + paper, 
      lastLoginDate: today, loginStreak: newStreak,
      dailyQuests: newQuests, questProgress: newQuestProgress, questsClaimed: newQuestsClaimed, lastQuestDate: today
    };
    set({ player }); saveToStorage(player);
  },

  spinWheel: (rewardType, amount) => {
    const today = new Date().toDateString();
    const p = get().player; let player = { ...p };
    if (p.lastWheelSpinDate !== today) player.lastWheelSpinDate = today;
    else { if (player.diamonds < 1) return; player.diamonds -= 1; }

    if (rewardType === 'coins') player.coins += amount;
    if (rewardType === 'diamonds') player.diamonds += amount;
    if (rewardType === 'paper') player.paper += amount;
    if (rewardType === 'visaPiece') {
       const pool = ALL_VISAS.filter(v => v.rarity === 'simple' || v.rarity === 'rare');
       const target = pool[Math.floor(Math.random() * pool.length)];
       get().addVisaPiece(target.id, 1);
    }
    set({ player }); saveToStorage(player);
    get().progressQuest('spin_wheel', 1);
  },

  unlockAchievement: (id: string) => {
    const p = get().player; if (p.achievements.includes(id)) return;
    const ach = ACHIEVEMENTS[id]; if (!ach) return;
    const newAchievements = [...p.achievements, id];
    
    const player = { ...p, achievements: newAchievements, coins: p.coins + ach.rewardCoins, diamonds: p.diamonds + (ach.rewardDiamonds || 0) };
    set({ player }); saveToStorage(player);
    alert(`🏆 Достижение разблокировано: ${ach.title}!\nНаграда: ${ach.rewardCoins} монет.`);

    // Проверка на концовку всех достижений
    if (newAchievements.length === ALL_ACHIEVEMENTS.length) {
        get().triggerEnding('all_achievements');
    }
  },

  progressQuest: (type, amount) => {
    const p = get().player;
    if (!p.dailyQuests.length) return;

    let changed = false;
    const newProgress = { ...p.questProgress };
    
    p.dailyQuests.forEach(qId => {
       const q = ALL_QUESTS.find(x => x.id === qId);
       if (q && q.type === type) {
           newProgress[qId] = (newProgress[qId] || 0) + amount;
           changed = true;
       }
    });

    if (changed) {
        const player = { ...p, questProgress: newProgress };
        set({ player }); saveToStorage(player);
    }
  },

  claimQuestReward: (questId: string) => {
     const p = get().player;
     if (p.questsClaimed.includes(questId)) return;
     const q = ALL_QUESTS.find(x => x.id === questId);
     if (!q) return;
     
     const prog = p.questProgress[questId] || 0;
     if (prog < q.target) return;

     const newClaimed = [...p.questsClaimed, questId];
     let newCoins = p.coins + q.rewardCoins;
     
     let alertMsg = `Выполнено: ${q.title}. Награда: ${q.rewardCoins} 🪙.`;

     if (newClaimed.length === 5) {
         const pool = ALL_VISAS.filter(v => v.rarity === 'rare' || v.rarity === 'epic');
         const target = pool[Math.floor(Math.random() * pool.length)];
         get().addVisaPiece(target.id, 1);
         alertMsg += `\n\n🌟 Все квесты выполнены! Вы получили кусок визитки ${target.name}.`;
     }

     const player = { ...p, coins: newCoins, questsClaimed: newClaimed };
     set({ player }); saveToStorage(player);
     alert(alertMsg);
  },

  finishTutorial: () => {
    const player = { ...get().player, tutorialCompleted: true };
    set({ player }); saveToStorage(player);
  },

  triggerEnding: (endingId: string) => {
    const p = get().player;
    let newEndings = [...p.endings];
    
    if (!newEndings.includes(endingId)) {
        newEndings.push(endingId);
    }
    
    // Проверка Истинной концовки
    if (newEndings.includes('level_12') && newEndings.includes('all_achievements') && newEndings.includes('all_visas')) {
        if (!newEndings.includes('true_ending')) {
            newEndings.push('true_ending');
        }
    }

    const player = { ...p, endings: newEndings, activeEnding: endingId };
    set({ player }); saveToStorage(player);
    get().openOverlay('ending');
  }
}));