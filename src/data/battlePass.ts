export interface BattlePassReward {
  level: number;
  rewardType: 'coins' | 'diamonds' | 'paper' | 'visaPiece' | 'skin_silver' | 'skin_gold';
  amount: number;
  label: string;
}

export const BATTLE_PASS_REWARDS: BattlePassReward[] = [
  { level: 1, rewardType: 'coins', amount: 100, label: '100 🪙' },
  { level: 2, rewardType: 'paper', amount: 2, label: '2 📄' },
  { level: 3, rewardType: 'coins', amount: 200, label: '200 🪙' },
  { level: 4, rewardType: 'diamonds', amount: 1, label: '1 💎' },
  { level: 5, rewardType: 'visaPiece', amount: 1, label: 'Кусок 📇' },
  { level: 6, rewardType: 'coins', amount: 300, label: '300 🪙' },
  { level: 7, rewardType: 'skin_silver', amount: 1, label: 'Серебряная фишка' },
  { level: 8, rewardType: 'paper', amount: 4, label: '4 📄' },
  { level: 9, rewardType: 'diamonds', amount: 2, label: '2 💎' },
  { level: 10, rewardType: 'visaPiece', amount: 2, label: '2 куска 📇' },
  { level: 11, rewardType: 'coins', amount: 500, label: '500 🪙' },
  { level: 12, rewardType: 'diamonds', amount: 3, label: '3 💎' },
  { level: 13, rewardType: 'coins', amount: 1000, label: '1000 🪙' },
  { level: 14, rewardType: 'skin_gold', amount: 1, label: 'Золотая фишка + Секретный режим (в будущем)' },
];