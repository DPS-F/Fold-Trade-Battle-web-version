export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardDiamonds?: number;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  // --- Начальные ---
  first_battle_win: { id: 'first_battle_win', title: 'Первая кровь', description: 'Выиграйте свой первый бой.', rewardCoins: 100 },
  first_business_win: { id: 'first_business_win', title: 'Успешный делец', description: 'Выиграйте первую бизнес-схватку.', rewardCoins: 100 },
  close_visa: { id: 'close_visa', title: 'Контракт закрыт', description: 'Закройте визитку в бизнес-схватке.', rewardCoins: 50 },
  rich_man: { id: 'rich_man', title: 'Богач', description: 'Накопите 1000 монет.', rewardCoins: 200, rewardDiamonds: 1 },
  collector_1: { id: 'collector_1', title: 'Коллекционер I', description: 'Соберите 3 визитки.', rewardCoins: 300, rewardDiamonds: 2 },
  
  // --- Бизнес-схватки ---
  business_10: { id: 'business_10', title: 'Опытный коммерсант', description: 'Выиграйте 10 бизнес-схваток.', rewardCoins: 500 },
  business_25: { id: 'business_25', title: 'Акула бизнеса', description: 'Выиграйте 25 бизнес-схваток.', rewardCoins: 1500, rewardDiamonds: 5 },
  business_vs_3: { id: 'business_vs_3', title: 'Один против всех', description: 'Победите в бизнес-схватке против 3 ботов.', rewardCoins: 1000, rewardDiamonds: 3 },
  business_rich: { id: 'business_rich', title: 'Воротила', description: 'Заработайте 500 монет за одну схватку.', rewardCoins: 500, rewardDiamonds: 2 },

  // --- Бои ---
  battle_10: { id: 'battle_10', title: 'Адмирал', description: 'Выиграйте 10 боёв.', rewardCoins: 500 },
  battle_25: { id: 'battle_25', title: 'Владыка морей', description: 'Выиграйте 25 боёв.', rewardCoins: 1500, rewardDiamonds: 5 },
  boss_3: { id: 'boss_3', title: 'Первый босс', description: 'Победите босса на 3 уровне.', rewardCoins: 300, rewardDiamonds: 1 },
  boss_6: { id: 'boss_6', title: 'Покоритель', description: 'Победите босса на 6 уровне.', rewardCoins: 600, rewardDiamonds: 2 },
  boss_9: { id: 'boss_9', title: 'Гроза боссов', description: 'Победите босса на 9 уровне.', rewardCoins: 1000, rewardDiamonds: 3 },
  boss_12: { id: 'boss_12', title: 'Легенда', description: 'Победите финального босса на 12 уровне.', rewardCoins: 5000, rewardDiamonds: 20 },
  flawless_victory: { id: 'flawless_victory', title: 'Безупречно', description: 'Выиграйте бой, не потеряв ни одного корабля.', rewardCoins: 300 },
  fleet_3_battleships: { id: 'fleet_3_battleships', title: 'Тяжелая артиллерия', description: 'Соберите флот из 3 Линкоров.', rewardCoins: 800, rewardDiamonds: 2 },

  // --- Коллекции ---
  collector_2: { id: 'collector_2', title: 'Коллекционер II', description: 'Соберите 5 визиток.', rewardCoins: 800, rewardDiamonds: 3 },
  collector_3: { id: 'collector_3', title: 'Коллекционер III', description: 'Соберите 8 визиток.', rewardCoins: 1500, rewardDiamonds: 5 },
  all_visas: { id: 'all_visas', title: 'Полная коллекция', description: 'Соберите все 10 визиток.', rewardCoins: 5000, rewardDiamonds: 20 },
  rare_visa: { id: 'rare_visa', title: 'Редкая находка', description: 'Соберите первую редкую визитку.', rewardCoins: 200 },
  epic_visa: { id: 'epic_visa', title: 'Эпический масштаб', description: 'Соберите первую эпическую визитку.', rewardCoins: 500 },
  legendary_visa: { id: 'legendary_visa', title: 'Легендарный контракт', description: 'Соберите легендарную визитку.', rewardCoins: 1000, rewardDiamonds: 5 },
  collection_visa: { id: 'collection_visa', title: 'Светское общество', description: 'Соберите коллекционную визитку.', rewardCoins: 2000, rewardDiamonds: 10 },

  // --- Прогрессия ---
  level_5: { id: 'level_5', title: 'Рост компании', description: 'Достигните 5 уровня.', rewardCoins: 500, rewardDiamonds: 3 },
  level_10: { id: 'level_10', title: 'Магнат', description: 'Достигните 10 уровня.', rewardCoins: 2000, rewardDiamonds: 10 },
  unlock_frigate: { id: 'unlock_frigate', title: 'Новые горизонты', description: 'Откройте Фрегат.', rewardCoins: 300 },
  unlock_battleship: { id: 'unlock_battleship', title: 'Морская мощь', description: 'Откройте Линкор.', rewardCoins: 800 },

  // --- Разное ---
  daily_streak: { id: 'daily_streak', title: 'Постоянный клиент', description: 'Заберите ежедневный бонус 5 дней подряд.', rewardCoins: 500 },
  wheel_master: { id: 'wheel_master', title: 'Фортуна', description: 'Выиграйте на колесе фортуны 10 раз.', rewardCoins: 400 },
  master_craftsman: { id: 'master_craftsman', title: 'Мастер-оригамист', description: 'Сложите 20 кораблей.', rewardCoins: 1000, rewardDiamonds: 2 },

  pinball_10: { id: 'pinball_10', title: 'Лунный маг', description: 'Забейте 10 шариков в лунку.', rewardCoins: 200 },
  pinball_50: { id: 'pinball_50', title: 'Космический бильярд', description: 'Забейте 50 шариков в лунку.', rewardCoins: 500, rewardDiamonds: 2 },
  pinball_100: { id: 'pinball_100', title: 'Гравитационный гений', description: 'Забейте 100 шариков в лунку.', rewardCoins: 1000, rewardDiamonds: 5 },
};

export const ALL_ACHIEVEMENTS = Object.values(ACHIEVEMENTS);