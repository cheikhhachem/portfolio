// Run with Node 22.18+: node --test tests/theme-effects.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { CUBE_EXIT_MS, CUBE_ENTER_MS, createCubeFlight, sampleCubeFlight, liquidKeyframes } from '../src/lib/utils/themeEffects.ts';

test('each column exits its own side and returns on a fresh continuous curve', () => {
  for (const side of [-1, 1]) {
    const home = [side * 1.1, 0.55, 0];
    const outside = [side * 8, 1, 0];
    const outgoing = createCubeFlight(home, outside, () => 0.25);
    const returning = createCubeFlight(outside, home, () => 0.75);
    assert.deepEqual(sampleCubeFlight(outgoing, 0, CUBE_EXIT_MS, false), home);
    assert.deepEqual(sampleCubeFlight(outgoing, CUBE_EXIT_MS, CUBE_EXIT_MS, false), outside);
    assert.deepEqual(sampleCubeFlight(returning, 0, CUBE_ENTER_MS, true), outside);
    assert.deepEqual(sampleCubeFlight(returning, CUBE_ENTER_MS, CUBE_ENTER_MS, true), home);
    assert.notDeepEqual(outgoing.points.slice(1, 3).reverse(), returning.points.slice(1, 3));
    let previous = Math.abs(home[0]);
    for (let elapsed = 0; elapsed <= CUBE_EXIT_MS; elapsed += 8) {
      const point = sampleCubeFlight(outgoing, elapsed, CUBE_EXIT_MS, false);
      assert.ok(point.every(Number.isFinite));
      assert.ok(Math.abs(point[0]) >= previous, 'departure must keep moving outwards');
      previous = Math.abs(point[0]);
    }
  }
});

test('the liquid morph starts below bottom center and grows beyond all viewport corners', () => {
  for (const [width, height] of [[390, 844], [1440, 900], [3440, 1440]]) {
    const frames = liquidKeyframes(width, height);
    assert.equal(frames.length, 25);
    const coordinates = frame => [...frame.clipPath.matchAll(/-?\d+\.\d+/g)].map(match => Number(match[0]));
    const origin = coordinates(frames[0]);
    for (let i = 0; i < origin.length; i += 2) {
      assert.equal(origin[i], width / 2);
      assert.equal(origin[i + 1], height + 12);
    }
    const last = coordinates(frames.at(-1));
    assert.ok(Math.min(...last.filter((_, i) => i % 2 === 0)) < 0);
    assert.ok(Math.max(...last.filter((_, i) => i % 2 === 0)) > width);
    assert.ok(Math.min(...last.filter((_, i) => i % 2 === 1)) < 0);
    assert.ok(Math.max(...last.filter((_, i) => i % 2 === 1)) > height);
    // All final outline points lie outside even the farthest viewport corner.
    const commands = frames.at(-1).clipPath.match(/C [^C]+/g);
    for (const command of commands) {
      const values = [...command.matchAll(/-?\d+\.\d+/g)].map(match => Number(match[0]));
      assert.ok(Math.hypot(values[4] - width / 2, values[5] - height - 12) > Math.hypot(width / 2, height + 12));
    }
    for (const frame of frames) {
      assert.ok(!frame.clipPath.includes('NaN'));
      assert.equal((frame.clipPath.match(/ C /g) || []).length, 12);
    }
  }
});
