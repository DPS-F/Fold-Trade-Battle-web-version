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

// 1. РАЗВЕДЧИК (Классический кораблик, A4)
export const CLASSIC_BOAT_3D: BoatModelData = {
  id: 'scout',
  name: 'Разведчик',
  size: [4, 5], 
  steps: [
    {
      id: 's1',
      instruction: 'Зажмите верхний край и потяните ВНИЗ, чтобы сложить пополам.',
      lineStart: [-2, 0, 0],
      lineEnd: [2, 0, 0],
      movingSide: 1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [0, 1],
      dragPoint: [0, 2.5, 0],
    },
    {
      id: 's2',
      instruction: 'Зажмите правый угол и потяните ВЛЕВО-ВНИЗ к центру.',
      lineStart: [0, 0, 0],
      lineEnd: [2, -2.5, 0],
      movingSide: 1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [-1, 1],
      dragPoint: [2, 0, 0],
    },
    {
      id: 's3',
      instruction: 'Зажмите левый угол и потяните ВПРАВО-ВНИЗ к центру.',
      lineStart: [0, 0, 0],
      lineEnd: [-2, -2.5, 0],
      movingSide: -1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [1, 1],
      dragPoint: [-2, 0, 0],
    },
    {
      id: 's4',
      instruction: 'Потяните нижний угол ВВЕРХ, чтобы раскрыть борта.',
      lineStart: [-2, -1.5, 0],
      lineEnd: [2, -1.5, 0],
      movingSide: -1,
      targetAngle: Math.PI * 0.8,
      dragDirection: [0, -1],
      dragPoint: [0, -2.5, 0],
    }
  ]
};

// 2. ФРЕГАТ (Парусник, квадратный лист)
export const FRIGATE_3D: BoatModelData = {
  id: 'frigate',
  name: 'Фрегат',
  size: [4.5, 4.5], // Квадратный лист
  steps: [
    {
      id: 'f1',
      instruction: 'Сложите лист по диагонали (верхний левый угол вниз).',
      lineStart: [-2.25, 2.25, 0],
      lineEnd: [2.25, -2.25, 0],
      movingSide: 1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [0, -1],
      dragPoint: [-1, 2, 0],
    },
    {
      id: 'f2',
      instruction: 'Сложите еще раз пополам, чтобы получился маленький треугольник.',
      lineStart: [-2.25, -2.25, 0],
      lineEnd: [2.25, -2.25, 0],
      movingSide: 1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [0, -1],
      dragPoint: [0, 0, 0],
    },
    {
      id: 'f3',
      instruction: 'Потяните нижний острый угол ВВЕРХ (это будет основание).',
      lineStart: [-1.5, -0.5, 0],
      lineEnd: [1.5, -0.5, 0],
      movingSide: -1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [0, -1],
      dragPoint: [0, -2, 0],
    },
    {
      id: 'f4',
      instruction: 'Загните верхний треугольник ВНИЗ (это будет парус).',
      lineStart: [-1.5, 1, 0],
      lineEnd: [1.5, 1, 0],
      movingSide: 1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [0, 1],
      dragPoint: [0, 2, 0],
    }
  ]
};

// 3. ЛИНКОР (Длинный лист, много сгибов)
export const BATTLESHIP_3D: BoatModelData = {
  id: 'battleship',
  name: 'Линкор',
  size: [3.5, 6], // Удлиненный
  steps: [
    {
      id: 'b1',
      instruction: 'Сложите лист пополам по горизонтали (сверху вниз).',
      lineStart: [-1.75, 0, 0],
      lineEnd: [1.75, 0, 0],
      movingSide: 1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [0, 1],
      dragPoint: [0, 3, 0],
    },
    {
      id: 'b2',
      instruction: 'Загните правый верхний угол к центру.',
      lineStart: [0, 0, 0],
      lineEnd: [1.75, -3, 0],
      movingSide: 1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [-1, 1],
      dragPoint: [1.75, 0, 0],
    },
    {
      id: 'b3',
      instruction: 'Загните левый верхний угол к центру.',
      lineStart: [0, 0, 0],
      lineEnd: [-1.75, -3, 0],
      movingSide: -1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [1, 1],
      dragPoint: [-1.75, 0, 0],
    },
    {
      id: 'b4',
      instruction: 'Поднимите нижнюю часть вверх (формируем корпус).',
      lineStart: [-1.75, -2, 0],
      lineEnd: [1.75, -2, 0],
      movingSide: -1,
      targetAngle: Math.PI - 0.02,
      dragDirection: [0, -1],
      dragPoint: [0, -3, 0],
    },
    {
      id: 'b5',
      instruction: 'Раскройте боковые стороны, чтобы завершить Линкор.',
      lineStart: [-1.75, -0.5, 0],
      lineEnd: [1.75, -0.5, 0],
      movingSide: 1,
      targetAngle: Math.PI * 0.7,
      dragDirection: [0, -1],
      dragPoint: [0, 0, 0],
    }
  ]
};