export type Cell = { x: number; y: number };
export type Direction = 'up' | 'down' | 'left' | 'right';
export const SIZE = 20;
export const vectors: Record<Direction, Cell> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
};
export const sameCell = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

export function placeFood(snake: Cell[], random = Math.random): Cell | null {
  const free: Cell[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = { x, y };
      if (!snake.some(segment => sameCell(segment, cell))) free.push(cell);
    }
  }
  return free.length ? free[Math.floor(random() * free.length)]! : null;
}

export function canTurn(from: Direction, to: Direction) {
  return vectors[from].x + vectors[to].x !== 0 || vectors[from].y + vectors[to].y !== 0;
}

export function step(snake: Cell[], direction: Direction, food: Cell | null) {
  const head = {
    x: (snake[0]!.x + vectors[direction].x + SIZE) % SIZE,
    y: (snake[0]!.y + vectors[direction].y + SIZE) % SIZE
  };
  const ate = food !== null && sameCell(head, food);
  const body = ate ? snake : snake.slice(0, -1);
  if (body.some(cell => sameCell(cell, head))) {
    return { snake, ate: false, dead: true };
  }
  return { snake: [head, ...body], ate, dead: false };
}
