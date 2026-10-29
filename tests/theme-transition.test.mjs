// Run with Node 22.18+: node --test tests/theme-transition.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { CUBE_EXIT_MS, CUBE_ENTER_MS, LIQUID_REVEAL_MS } from '../src/lib/utils/themeEffects.ts';
const { build } = createRequire(import.meta.resolve('vite'))('esbuild');
const { outputFiles } = await build({ entryPoints: [resolve('src/lib/stores/theme.ts')], bundle: true, write: false, platform: 'node', format: 'esm' });
const moduleURL = 'data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64');
let instance = 0;

async function setup(t, { native = true, reduced = false, skipped = false, blockedStorage = false, held = false, stalled = false } = {}) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const saved = new Map();
  const animations = [];
  const classes = new Set();
  let removed = false;
  let snapshots = 0;
  let skippedSnapshots = 0;
  const animate = (frames, options) => {
    let finish;
    const animation = {
      frames, options, playbackRate: 1, plays: 0, canceled: false,
      finished: held ? new Promise(resolve => { finish = resolve; }) : Promise.resolve(),
      play() { this.plays++; },
      cancel() { this.canceled = true; },
      finish() { finish?.(); }
    };
    animations.push(animation);
    return animation;
  };
  const globals = {
    window: { innerWidth: 1440, innerHeight: 900, matchMedia: () => ({ matches: reduced }) },
    localStorage: {
      getItem: key => { if (blockedStorage) throw new Error('Storage unavailable'); return saved.get(key); },
      setItem: (key, value) => { if (blockedStorage) throw new Error('Storage unavailable'); saved.set(key, value); }
    },
    document: {
      hidden: false,
      documentElement: { classList: { remove: (...names) => names.forEach(name => classes.delete(name)), add: name => classes.add(name) }, animate },
      createElement: () => ({ style: {}, setAttribute() {}, animate, remove() { removed = true; } }),
      body: { append() {} },
      ...(native ? { startViewTransition(update) {
        snapshots++;
        const done = Promise.resolve().then(update);
        return {
          ready: stalled ? new Promise(() => {}) : done.then(() => { if (skipped) throw new Error('Transition skipped'); }),
          // Filled snapshot animations can prevent this promise from resolving.
          finished: new Promise(() => {}),
          skipTransition() { skippedSnapshots++; }
        };
      } } : {})
    }
  };
  for (const [key, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    t.after(() => original ? Object.defineProperty(globalThis, key, original) : delete globalThis[key]);
  }
  const { theme, themeTransition, requestedTheme } = await import(moduleURL + '#instance-' + instance++);
  const phases = [], values = [], requests = [];
  const unsubscribePhase = themeTransition.subscribe(value => phases.push(value.phase));
  const unsubscribeTheme = theme.subscribe(value => values.push(value));
  const unsubscribeRequest = requestedTheme.subscribe(value => requests.push(value));
  t.after(() => { unsubscribePhase(); unsubscribeTheme(); unsubscribeRequest(); });
  const advance = async ms => {
    t.mock.timers.tick(ms);
    await new Promise(resolve => setImmediate(resolve));
  };
  return { theme, phases, values, requests, saved, classes, animations, advance,
    removed: () => removed, snapshots: () => snapshots, skippedSnapshots: () => skippedSnapshots };
}

const departure = CUBE_EXIT_MS + 16;
const arrival = CUBE_ENTER_MS + 16;

test('both themes reveal and return, releasing filled snapshots without waiting forever', async t => {
  const env = await setup(t);
  for (const target of ['dark', 'light']) {
    const task = env.theme.toggle();
    assert.equal(env.phases.at(-1), 'exiting');
    await env.advance(departure);
    assert.equal(env.values.at(-1), target);
    assert.equal(env.phases.at(-1), 'entering');
    assert.equal(env.saved.get('color-mode'), target);
    assert.ok(env.classes.has(target + '-mode'));
    await env.advance(arrival);
    await task;
    assert.equal(env.phases.at(-1), 'idle');
  }
  assert.equal(env.skippedSnapshots(), 2);
  assert.ok(env.animations.every(animation => animation.canceled));
  assert.equal(env.animations[0].options.duration, LIQUID_REVEAL_MS);
});

test('a second click during departure cancels the theme change and brings cubes home', async t => {
  const env = await setup(t);
  const task = env.theme.toggle();
  env.theme.toggle();
  await env.advance(0);
  assert.equal(env.phases.at(-1), 'entering');
  await env.advance(arrival);
  await task;
  assert.equal(env.values.at(-1), 'light');
  assert.equal(env.snapshots(), 0);
  assert.equal(env.phases.at(-1), 'idle');
});

for (const native of [true, false]) {
  test(`rapid clicks reverse one active liquid animation (${native ? 'native' : 'fallback'})`, async t => {
    const env = await setup(t, { held: true, native });
    const task = env.theme.toggle();
    await env.advance(departure);
    const animation = env.animations[0];
    for (let i = 0; i < 101; i++) env.theme.toggle();
    assert.equal(env.animations.length, 1);
    assert.equal(animation.playbackRate, -1);
    assert.equal(env.requests.at(-1), 'light');
    env.theme.toggle();
    assert.equal(animation.playbackRate, 1);
    env.theme.toggle();
    assert.equal(animation.playbackRate, -1);
    animation.finish();
    await env.advance(0);
    await env.advance(arrival);
    await task;
    assert.equal(env.values.at(-1), 'light');
    assert.equal(env.phases.at(-1), 'idle');
    assert.equal(animation.canceled, true);
    if (!native) assert.equal(env.removed(), true);
    // A fresh request works after all that interruption.
    const next = env.theme.toggle();
    await env.advance(departure);
    env.animations.at(-1).finish();
    await env.advance(0);
    await env.advance(arrival);
    await next;
    assert.equal(env.values.at(-1), 'dark');
  });
}

test('a click during cube return starts a new departure and honors the latest theme', async t => {
  const env = await setup(t);
  const task = env.theme.toggle();
  await env.advance(departure);
  env.theme.toggle();
  await env.advance(0);
  assert.equal(env.phases.at(-1), 'exiting');
  await env.advance(departure);
  await env.advance(arrival);
  await task;
  assert.equal(env.values.at(-1), 'light');
  assert.equal(env.phases.at(-1), 'idle');
});

test('setting a theme cancels a pending reveal without a stale callback overwriting it', async t => {
  const env = await setup(t, { held: true });
  const task = env.theme.toggle();
  await env.advance(departure);
  env.theme.set('light');
  await env.advance(0);
  await env.advance(arrival);
  await task;
  assert.equal(env.values.at(-1), 'light');
  assert.equal(env.animations[0].canceled, true);
  assert.equal(env.phases.at(-1), 'idle');
});

test('reduced motion switches immediately without flights or liquid animation', async t => {
  const env = await setup(t, { reduced: true });
  await env.theme.toggle();
  assert.deepEqual(env.phases, ['idle']);
  assert.deepEqual(env.values, ['light', 'dark']);
  assert.equal(env.animations.length, 0);
});

for (const options of [{ skipped: true, blockedStorage: true }, { stalled: true }, { held: true }]) {
  test(`browser failures cannot strand the transition: ${JSON.stringify(options)}`, async t => {
    const env = await setup(t, options);
    const task = env.theme.toggle();
    await env.advance(departure);
    await env.advance(LIQUID_REVEAL_MS + 1000);
    await env.advance(arrival);
    await task;
    assert.equal(env.values.at(-1), 'dark');
    assert.equal(env.phases.at(-1), 'idle');
    assert.equal(env.skippedSnapshots(), 1);
  });
}
