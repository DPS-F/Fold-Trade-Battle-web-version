export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardDiamonds?: number;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_battle_win: { id: 'first_battle_win', title: 'Первая кровь', description: 'Выиграйте свой первый бой.', rewardCoins: 100 },
  first_business_win: { id: 'first_business_win', title: 'Успешный делец', description: 'Выиграйте первую бизнес-схватку.', rewardCoins: 100 },
  close_visa: { id: 'close_visa', title: 'Контракт закрыт', description: 'Закройте визитку в бизнес-схватке.', rewardCoins: 50 },
  rich_man: { id: 'rich_man', title: 'Богач', description: 'Накопите 1000 монет.', rewardCoins: 200, rewardDiamonds: 1 },
  collector: { id: 'collector', title: 'Коллекционер', description: 'Соберите 3 визитки.', rewardCoins: 300, rewardDiamonds: 2 },
  level_5: { id: 'level_5', title: 'Рост компании', description: 'Достигните 5 уровня.', rewardCoins: 500, rewardDiamonds: 3 },
};

export const ALL_ACHIEVEMENTS = Object.values(ACHIEVEMENTS);