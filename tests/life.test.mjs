import assert from 'node:assert/strict';
import test from 'node:test';
import { LIFE_SIZE, stepLife, addLifeSeed, lifePatterns } from '../src/lib/utils/life.ts';

const blank = () => new Uint8Array(LIFE_SIZE * LIFE_SIZE);
const count = board => board.reduce((sum, cell) => sum + cell, 0);
function patternBoard(rows, x = 20, y = 20) {
  const board = blank();
  rows.forEach((row, dy) => [...row].forEach((cell, dx) => { if (cell === 'O') board[(y + dy) * LIFE_SIZE + x + dx] = 1; }));
  return board;
}
function advance(board, ticks) {
  for (let i = 0; i < ticks; i++) board = stepLife(board);
  return board;
}

test('Life follows births, survival, loneliness, and overcrowding without mutating the input', () => {
  const single = patternBoard(['O']);
  assert.equal(count(stepLife(single)), 0);
  assert.equal(count(single), 1);
  const block = patternBoard(['OO', 'OO']);
  assert.deepEqual(stepLife(block), block);
  const crowded = patternBoard(['OOO', 'OOO', 'OOO']);
  assert.equal(stepLife(crowded)[21 * LIFE_SIZE + 21], 0);
  const blinker = patternBoard(['OOO']);
  assert.deepEqual(stepLife(blinker), patternBoard(['.O.', '.O.', '.O.'], 20, 19));
  assert.deepEqual(advance(blinker, 2), blinker);
  assert.equal(count(stepLife(blank())), 0);
});

test('gliders travel and survive across connected edges', () => {
  const glider = ['.O.', '..O', 'OOO'];
  assert.deepEqual(advance(patternBoard(glider), 4), patternBoard(glider, 21, 21));
  const edge = blank();
  for (const x of [LIFE_SIZE - 1, 0, 1]) edge[x] = 1;
  const expected = blank();
  for (const y of [LIFE_SIZE - 1, 0, 1]) expected[y * LIFE_SIZE] = 1;
  assert.deepEqual(stepLife(edge), expected);
});

test('curated seeds include an exact pulsar oscillator and colonies that keep evolving', () => {
  const pulsar = patternBoard(lifePatterns.find(p => p.name === 'Pulsar').rows);
  assert.equal(count(pulsar), 48);
  assert.notDeepEqual(stepLife(pulsar), pulsar);
  assert.deepEqual(advance(pulsar, 3), pulsar);
  for (const name of ['Acorn', 'R-pentomino']) {
    const seed = patternBoard(lifePatterns.find(p => p.name === name).rows);
    const evolved = advance(seed, 200);
    assert.ok(count(evolved) > count(seed), `${name} grows beyond its initial seed`);
    assert.notDeepEqual(stepLife(evolved), evolved, `${name} is still evolving`);
  }
  const diehard = patternBoard(lifePatterns.find(p => p.name === 'Diehard').rows);
  assert.ok(count(advance(diehard, 129)) > 0);
  assert.equal(count(advance(diehard, 130)), 0);
});

test('random patterns vary orientation and preserve existing cells within the field', () => {
  const shapes = new Set();
  lifePatterns.forEach((pattern, index) => {
    for (let rotation = 0; rotation < 4; rotation++) {
      for (const mirror of [0.25, 0.75]) {
        const choices = [(index + 0.1) / lifePatterns.length, (rotation + 0.1) / 4, mirror, 0.3, 0.4];
        const source = blank();
        source[0] = 1;
        const { board, name } = addLifeSeed(source, () => choices.shift() ?? 0.5);
        assert.equal(name, pattern.name);
        assert.equal(board.length, LIFE_SIZE * LIFE_SIZE);
        assert.equal(source[0], 1);
        assert.equal(count(source), 1);
        assert.equal(board[0], 1);
        const cells = pattern.rows.join('').split('').filter(cell => cell === 'O').length;
        assert.equal(count(board), cells + 1);
        shapes.add(board.toString());
      }
    }
  });
  assert.ok(shapes.size > lifePatterns.length);
});
