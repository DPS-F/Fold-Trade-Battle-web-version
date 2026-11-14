import { create } from 'zustand';
import { ALL_VISAS } from '../data/visas';
import type { Rarity } from '../data/types';
import { ACHIEVEMENTS } from '../data/achievements';

export interface FleetShip { id: string; templateId: string; maxHp: number; }
export type Screen = 'loading' | 'main-menu' | 'business-prep' | 'business-battle' | 'battle-prep' | 'folding' | 'battle';
export type OverlayId = 'profile' | 'documentation' | 'save-load' | 'feedback' | 'conversion' | 'settings' | 'visas-gallery' | 'rent-select' | 'my-visas' | 'market' | 'production' | 'templates-gallery' | 'folding-overlay' | 'battle-results' | 'business-results' | 'meta-rewards' | 'achievements';

export interface PlayerSettings { musicVolume: number; sfxVolume: number; animations: boolean; uiScale: number; }

export interface PlayerState {
  name: string; gender: 'male' | 'female'; level: number; cyclesDone: number;
  businessWins: number; battleWins: number; coins: number; diamonds: number;
  paper: number; paint: number; visasOwned: string[]; visaPieces: Record<string, number>;
  unlockedTemplates: string[]; achievements: string[]; fleet: FleetShip[];
  settings: PlayerSettings; lastLoginDate: string; lastWheelSpinDate: string;
}

export interface GameState {
  screen: Screen; overlayStack: OverlayId[]; player: PlayerState; loaded: boolean;
  setScreen: (s: Screen) => void; openOverlay: (o: OverlayId) => void; closeOverlay: () => void; closeAllOverlays: () => void;
  setPlayerName: (name: string) => void; setPlayerGender: (g: 'male' | 'female') => void;
  addCoins: (n: number) => void; addDiamonds: (n: number) => void; addPaper: (n: number) => void;
  convertCoinsToDiamonds: () => boolean; convertDiamondsToCoins: () => boolean;
  updateSettings: (s: Partial<PlayerSettings>) => void; markLoaded: () => void;
  registerBusinessWin: (profit: number) => void; registerBattleWin: () => void;
  updateFleet: (fleet: FleetShip[]) => void; claimDailyBonus: (coins: number, paper: number) => void;
  spinWheel: (rewardType: string, amount: number) => void; unlockAchievement: (id: string) => void;
}

const DEFAULT_PLAYER: PlayerState = {
  name: 'Игрок', gender: 'male', level: 1, cyclesDone: 0, businessWins: 0, battleWins: 0,
  coins: 250, diamonds: 3, paper: 10, paint: 0,
  visasOwned: ['zhiest'], visaPieces: {}, unlockedTemplates: ['scout'],
  achievements: [], fleet: [],
  settings: { musicVolume: 0.35, sfxVolume: 0.6, animations: true, uiScale: 1 },
  lastLoginDate: '', lastWheelSpinDate: '',
};

const STORAGE_KEY = 'ftb-save-v1';
function loadFromStorage(): Partial<PlayerState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1 && parsed.player) return { ...DEFAULT_PLAYER, ...parsed.player };
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
  addCoins: (n) => { const player = { ...get().player, coins: Math.max(0, get().player.coins + n) }; set({ player }); saveToStorage(player); get().unlockAchievement('rich_man'); },
  addDiamonds: (n) => { const player = { ...get().player, diamonds: Math.max(0, get().player.diamonds + n) }; set({ player }); saveToStorage(player); },
  addPaper: (n) => { const player = { ...get().player, paper: Math.max(0, get().player.paper + n) }; set({ player }); saveToStorage(player); },
  
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
  updateFleet: (fleet) => { const player = { ...get().player, fleet }; set({ player }); saveToStorage(player); },

  registerBusinessWin: (profit: number) => {
    const p = get().player;
    const newBusinessWins = p.businessWins + 1;
    const newCycles = p.cyclesDone + 1;
    let newLevel = p.level;
    if (newBusinessWins >= p.level && p.battleWins >= p.level && p.level < 12) newLevel = p.level + 1;
    const player = { ...p, businessWins: newBusinessWins, cyclesDone: newCycles, coins: p.coins + Math.floor(profit * 0.1), paper: p.paper + Math.floor(Math.random() * 4) + 1, level: newLevel };
    set({ player }); saveToStorage(player);
    get().unlockAchievement('first_business_win');
    if (newLevel >= 5) get().unlockAchievement('level_5');
  },

  registerBattleWin: () => {
    const p = get().player;
    const roll = Math.random() * 100;
    let rarity: Rarity = 'simple';
    if (roll >= 95) rarity = 'collection';
    else if (roll >= 85) rarity = 'legendary';
    else if (roll >= 65) rarity = 'epic';
    else if (roll >= 35) rarity = 'rare';

    const visasOfRarity = ALL_VISAS.filter(v => v.rarity === rarity);
    let targetVisa = visasOfRarity.find(v => (p.visaPieces[v.id] || 0) < v.piecesRequired); // Используем piecesRequired!
    
    let paperReward = 0;
    let newPieces = { ...p.visaPieces };
    let newVisasOwned = [...p.visasOwned];

    if (targetVisa) {
      newPieces[targetVisa.id] = (newPieces[targetVisa.id] || 0) + 1;
      if (newPieces[targetVisa.id] >= targetVisa.piecesRequired && !newVisasOwned.includes(targetVisa.id)) {
        newVisasOwned.push(targetVisa.id);
        alert(`Вы собрали визитку: ${targetVisa.name}!`);
      } else {
        alert(`Вы получили кусок визитки: ${targetVisa.name}! (${newPieces[targetVisa.id]}/${targetVisa.piecesRequired})`);
      }
    } else {
      // Если у всех визиток этой редкости уже собрано нужное количество кусков
      if (rarity === 'simple' || rarity === 'rare') paperReward = 1;
      else if (rarity === 'epic' || rarity === 'legendary') paperReward = 2;
      else paperReward = 3;
      alert(`Все визитки этой редкости открыты! Взамен вы получили ${paperReward} бумаги.`);
    }

    const player = { ...p, battleWins: p.battleWins + 1, coins: p.coins + 50, paper: p.paper + paperReward, visaPieces: newPieces, visasOwned: newVisasOwned };
    set({ player }); saveToStorage(player);
    get().unlockAchievement('first_battle_win');
    if (newVisasOwned.length >= 3) get().unlockAchievement('collector');
  },

  claimDailyBonus: (coins, paper) => {
    const today = new Date().toDateString();
    const player = { ...get().player, coins: get().player.coins + coins, paper: get().player.paper + paper, lastLoginDate: today };
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
       player.visaPieces[target.id] = (player.visaPieces[target.id] || 0) + 1;
       if (player.visaPieces[target.id] >= target.piecesRequired && !player.visasOwned.includes(target.id)) player.visasOwned.push(target.id);
    }
    set({ player }); saveToStorage(player);
  },

  unlockAchievement: (id: string) => {
    const p = get().player; if (p.achievements.includes(id)) return;
    const ach = ACHIEVEMENTS[id]; if (!ach) return;
    const player = { ...p, achievements: [...p.achievements, id], coins: p.coins + ach.rewardCoins, diamonds: p.diamonds + (ach.rewardDiamonds || 0) };
    set({ player }); saveToStorage(player);
    alert(`🏆 Достижение разблокировано: ${ach.title}!\nНаграда: ${ach.rewardCoins} монет.`);
  },
}));