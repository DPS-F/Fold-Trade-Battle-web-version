export interface FoldStep {
  id: string;
  instruction: string;
  lineStart: [number, number, number];
  lineEnd: [number, number, number];
  movingSide: 1 | -1;
  targetAngle: number;
  dragDirection: [number, number];
  dragPoint: [number, number, number];
}

export interface BoatModelData {
  id: string;
  name: string;
  size: [number, number];
  steps: FoldStep[];
}

// 1. РАЗВЕДЧИК (Классический кораблик, прямоугольник)
export const CLASSIC_BOAT_3D: BoatModelData = {
  id: 'scout',
  name: 'Разведчик',
  size: [4, 5], 
  steps: [
    {
      id: 's1',
      instruction: 'Зажмите верхний край и потяните ВНИЗ, чтобы сложить пополам.',
      lineStart: [-2, 0, 0], lineEnd: [2, 0, 0],
      movingSide: 1, targetAngle: Math.PI - 0.02,
      dragDirection: [0, 1], dragPoint: [0, 2.5, 0],
    },
    {
      id: 's2',
      instruction: 'Зажмите правый угол и потяните ВЛЕВО-ВНИЗ к центру.',
      lineStart: [0, 0, 0], lineEnd: [2, -2.5, 0],
      movingSide: 1, targetAngle: Math.PI - 0.02,
      dragDirection: [-1, 1], dragPoint: [2, 0, 0],
    },
    {
      id: 's3',
      instruction: 'Зажмите левый угол и потяните ВПРАВО-ВНИЗ к центру.',
      lineStart: [0, 0, 0], lineEnd: [-2, -2.5, 0],
      movingSide: -1, targetAngle: Math.PI - 0.02,
      dragDirection: [1, 1], dragPoint: [-2, 0, 0],
    },
    {
      id: 's4',
      instruction: 'Потяните нижний угол ВВЕРХ, чтобы раскрыть борта.',
      lineStart: [-2, -1.5, 0], lineEnd: [2, -1.5, 0],
      movingSide: -1, targetAngle: Math.PI * 0.8,
      dragDirection: [0, -1], dragPoint: [0, -2.5, 0],
    }
  ]
};

// 2. ФРЕГАТ (Квадратный лист)
export const FRIGATE_3D: BoatModelData = {
  id: 'frigate',
  name: 'Фрегат',
  size: [5, 5], // Квадрат
  steps: [
    {
      id: 'f1',
      instruction: 'Зажмите верхний край и потяните ВНИЗ, чтобы сложить пополам.',
      lineStart: [-2.5, 0, 0], lineEnd: [2.5, 0, 0],
      movingSide: 1, targetAngle: Math.PI - 0.02,
      dragDirection: [0, 1], dragPoint: [0, 2.5, 0],
    },
    {
      id: 'f2',
      instruction: 'Зажмите правый угол и потяните ВЛЕВО-ВНИЗ к центру.',
      lineStart: [0, 0, 0], lineEnd: [2.5, -2.5, 0],
      movingSide: 1, targetAngle: Math.PI - 0.02,
      dragDirection: [-1, 1], dragPoint: [2.5, 0, 0],
    },
    {
      id: 'f3',
      instruction: 'Зажмите левый угол и потяните ВПРАВО-ВНИЗ к центру.',
      lineStart: [0, 0, 0], lineEnd: [-2.5, -2.5, 0],
      movingSide: -1, targetAngle: Math.PI - 0.02,
      dragDirection: [1, 1], dragPoint: [-2.5, 0, 0],
    },
    {
      id: 'f4',
      instruction: 'Потяните нижний угол ВВЕРХ, чтобы раскрыть борта.',
      lineStart: [-2.5, -1.5, 0], lineEnd: [2.5, -1.5, 0],
      movingSide: -1, targetAngle: Math.PI * 0.8,
      dragDirection: [0, -1], dragPoint: [0, -2.5, 0],
    }
  ]
};

// 3. ЛИНКОР (Удлиненный лист)
export const BATTLESHIP_3D: BoatModelData = {
  id: 'battleship',
  name: 'Линкор',
  size: [3.5, 7], // Удлиненный
  steps: [
    {
      id: 'b1',
      instruction: 'Сложите лист пополам по горизонтали (сверху вниз).',
      lineStart: [-1.75, 0, 0], lineEnd: [1.75, 0, 0],
      movingSide: 1, targetAngle: Math.PI - 0.02,
      dragDirection: [0, 1], dragPoint: [0, 3.5, 0],
    },
    {
      id: 'b2',
      instruction: 'Загните правый верхний угол к центру (влево-вниз).',
      lineStart: [0, 0, 0], lineEnd: [1.75, -3.5, 0],
      movingSide: 1, targetAngle: Math.PI - 0.02,
      dragDirection: [-1, 1], dragPoint: [1.75, 0, 0],
    },
    {
      id: 'b3',
      instruction: 'Загните левый верхний угол к центру (вправо-вниз).',
      lineStart: [0, 0, 0], lineEnd: [-1.75, -3.5, 0],
      movingSide: -1, targetAngle: Math.PI - 0.02,
      dragDirection: [1, 1], dragPoint: [-1.75, 0, 0],
    },
    {
      id: 'b4',
      instruction: 'Поднимите нижнюю часть вверх (формируем корпус).',
      lineStart: [-1.75, -2.5, 0], lineEnd: [1.75, -2.5, 0],
      movingSide: -1, targetAngle: Math.PI - 0.02,
      dragDirection: [0, -1], dragPoint: [0, -3.5, 0],
    },
    {
      id: 'b5',
      instruction: 'Потяните верхний край ВНИЗ, чтобы завершить Линкор.',
      lineStart: [-1.75, 0, 0], lineEnd: [1.75, 0, 0],
      movingSide: 1, targetAngle: Math.PI * 0.5,
      dragDirection: [0, 1], dragPoint: [0, 1, 0],
    }
  ]
};