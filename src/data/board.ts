import type { CellType } from './types';

// Добавлена одна 'р' в конец, чтобы закрыть круг из 36 клеток (10x10)
const BOARD_SEQUENCE = 'с, р, п, пр, р, п, ш, р, п, пр, р, п, р, п, р, п, пр, р, п, ш, р, п, р, п, пр, р, п, р, п, пр, ш, р, п, р, п, р';

const MAP_CHAR_TO_TYPE: Record<string, CellType> = {
  'с': 'start',
  'р': 'market',
  'п': 'production',
  'пр': 'walk',
  'ш': 'penalty',
};

export const BOARD: CellType[] = BOARD_SEQUENCE
  .split(',')
  .map(c => MAP_CHAR_TO_TYPE[c.trim()] || 'walk');

export const BOARD_SIZE = BOARD.length;