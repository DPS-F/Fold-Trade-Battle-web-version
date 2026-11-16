export type QuestType = 'business_win' | 'battle_win' | 'earn_coins' | 'fold_ships' | 'close_visas' | 'spin_wheel';

export interface QuestDef {
  id: string;
  type: QuestType;
  target: number;
  title: string;
  rewardCoins: number;
}

export const ALL_QUESTS: QuestDef[] = [
  { id: 'q1', type: 'business_win', target: 1, title: 'Выиграйте 1 бизнес-схватку', rewardCoins: 50 },
  { id: 'q2', type: 'battle_win', target: 1, title: 'Выиграйте 1 бой', rewardCoins: 50 },
  { id: 'q3', type: 'earn_coins', target: 100, title: 'Заработайте 100 монет', rewardCoins: 30 },
  { id: 'q4', type: 'fold_ships', target: 1, title: 'Сложите 1 корабль', rewardCoins: 40 },
  { id: 'q5', type: 'close_visas', target: 1, title: 'Закройте 1 визитку', rewardCoins: 60 },
  { id: 'q6', type: 'spin_wheel', target: 1, title: 'Покрутите колесо фортуны', rewardCoins: 20 },
  { id: 'q7', type: 'business_win', target: 2, title: 'Выиграйте 2 бизнес-схватки', rewardCoins: 120 },
  { id: 'q8', type: 'battle_win', target: 2, title: 'Выиграйте 2 боя', rewardCoins: 120 },
  { id: 'q9', type: 'earn_coins', target: 300, title: 'Заработайте 300 монет', rewardCoins: 80 },
  { id: 'q10', type: 'fold_ships', target: 2, title: 'Сложите 2 корабля', rewardCoins: 100 },
  { id: 'q11', type: 'close_visas', target: 2, title: 'Закройте 2 визитки', rewardCoins: 150 },
  { id: 'q12', type: 'business_win', target: 3, title: 'Выиграйте 3 бизнес-схватки', rewardCoins: 200 },
  { id: 'q13', type: 'battle_win', target: 3, title: 'Выиграйте 3 боя', rewardCoins: 200 },
  { id: 'q14', type: 'earn_coins', target: 500, title: 'Заработайте 500 монет', rewardCoins: 150 },
  { id: 'q15', type: 'fold_ships', target: 3, title: 'Сложите 3 корабля', rewardCoins: 150 },
  { id: 'q16', type: 'close_visas', target: 3, title: 'Закройте 3 визитки', rewardCoins: 250 },
  { id: 'q17', type: 'business_win', target: 5, title: 'Выиграйте 5 бизнес-схваток', rewardCoins: 400 },
  { id: 'q18', type: 'battle_win', target: 5, title: 'Выиграйте 5 боёв', rewardCoins: 400 },
  { id: 'q19', type: 'earn_coins', target: 1000, title: 'Заработайте 1000 монет', rewardCoins: 300 },
  { id: 'q20', type: 'spin_wheel', target: 2, title: 'Покрутите колесо 2 раза', rewardCoins: 50 },
];