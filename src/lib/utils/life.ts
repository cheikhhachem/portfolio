export const LIFE_SIZE = 64;
export type LifeBoard = Uint8Array;

// Opposite edges connect, so moving patterns can keep exploring the field.
export function stepLife(board: LifeBoard, size = LIFE_SIZE): LifeBoard {
  const next = new Uint8Array(board.length);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx || dy) neighbors += board[((y + dy + size) % size) * size + (x + dx + size) % size];
        }
      }
      const i = y * size + x;
      next[i] = neighbors === 3 || (board[i] === 1 && neighbors === 2) ? 1 : 0;
    }
  }
  return next;
}

// Small hand-picked seeds produce movement, oscillation, and evolving colonies.
export const lifePatterns = [
  { name: 'Acorn', rows: ['.O.....', '...O...', 'OO..OOO'] },
  { name: 'R-pentomino', rows: ['.OO', 'OO.', '.O.'] },
  { name: 'Diehard', rows: ['......O.', 'OO......', '.O...OOO'] },
  { name: 'Pulsar', rows: ['..OOO...OOO..', '.............', 'O....O.O....O', 'O....O.O....O', 'O....O.O....O', '..OOO...OOO..', '.............', '..OOO...OOO..', 'O....O.O....O', 'O....O.O....O', 'O....O.O....O', '.............', '..OOO...OOO..'] },
  { name: 'Gliders', rows: ['.O..........', '..O.........', 'OOO.........', '............', '............', '........O...', '.........O..', '.......OOO..', '............', '..O.........', '...O........', '.OOO........'] },
  { name: 'Lightweight spaceship', rows: ['.O..O', 'O....', 'O...O', 'OOOO.'] }
] as const;

export function addLifeSeed(board: LifeBoard, random = Math.random): { board: LifeBoard; name: string } {
  const pattern = lifePatterns[Math.floor(random() * lifePatterns.length)];
  const rotation = Math.floor(random() * 4);
  const mirrored = random() < 0.5;
  const cells: [number, number][] = [];
  pattern.rows.forEach((row, y) => [...row].forEach((cell, x) => {
    if (cell !== 'O') return;
    let a = mirrored ? -x : x, b = y;
    for (let i = 0; i < rotation; i++) [a, b] = [-b, a];
    cells.push([a, b]);
  }));
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  const width = Math.max(...cells.map(([x]) => x)) - minX + 1;
  const height = Math.max(...cells.map(([, y]) => y)) - minY + 1;
  // Prefer an empty neighborhood; preserve existing colonies when adding a seed.
  let best = { x: 0, y: 0, occupied: Infinity };
  for (let attempt = 0; attempt < 40; attempt++) {
    const x = 3 + Math.floor(random() * (LIFE_SIZE - width - 6));
    const y = 3 + Math.floor(random() * (LIFE_SIZE - height - 6));
    let occupied = 0;
    for (let dy = -3; dy < height + 3; dy++) {
      for (let dx = -3; dx < width + 3; dx++) occupied += board[(y + dy) * LIFE_SIZE + x + dx];
    }
    if (occupied < best.occupied) best = { x, y, occupied };
    if (!occupied) break;
  }
  const next = board.slice();
  for (const [x, y] of cells) next[(best.y + y - minY) * LIFE_SIZE + best.x + x - minX] = 1;
  return { board: next, name: pattern.name };
}
