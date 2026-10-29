// Run with Node 22.18+: node --test tests/idleBlink.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createIdleBlink } from '../src/lib/utils/idleBlink.ts';

test('idle blinking waits, reopens, and cancels cleanly when a face turn starts', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(Math, 'random', () => 0.5);
  const changes = [];
  const blink = createIdleBlink(closed => changes.push(closed));
  blink.start();
  t.mock.timers.tick(4499);
  assert.deepEqual(changes, [false]);
  t.mock.timers.tick(1);
  assert.equal(changes.at(-1), true);
  t.mock.timers.tick(135);
  assert.equal(changes.at(-1), false);
  t.mock.timers.tick(4500);
  assert.equal(changes.at(-1), true);
  blink.stop();
  assert.equal(changes.at(-1), false);
  const count = changes.length;
  t.mock.timers.tick(20000);
  assert.equal(changes.length, count, 'no blink can survive stop/unmount');
  blink.start();
  t.mock.timers.tick(4500);
  assert.equal(changes.at(-1), true, 'resting again resumes blinking');
  blink.stop();
});

test('an occasional double blink is short and does not loop', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(Math, 'random', () => 0);
  const changes = [];
  const blink = createIdleBlink(closed => changes.push(closed));
  blink.start();
  t.mock.timers.tick(2500);
  t.mock.timers.tick(100);
  t.mock.timers.tick(90);
  t.mock.timers.tick(100);
  assert.deepEqual(changes, [false, true, false, true, false]);
  t.mock.timers.tick(2499);
  assert.equal(changes.at(-1), false);
  blink.stop();
});
