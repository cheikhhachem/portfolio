import { tick } from 'svelte';
import { writable } from 'svelte/store';
import { CUBE_ENTER_MS, CUBE_EXIT_MS, LIQUID_REVEAL_MS, liquidKeyframes } from '../utils/themeEffects';

type Theme = 'light' | 'dark';
type Phase = 'idle' | 'exiting' | 'changing' | 'entering';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem('color-mode');
    return stored === 'dark-mode' || stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

let current = getInitialTheme();
let desired = current;
let running: Promise<void> | null = null;
let wake: (() => void) | undefined;
let redirect: (() => void) | undefined;
let cancelReveal: (() => void) | undefined;
let revision = 0;
const state = writable<Theme>(current);
const motion = writable<{ phase: Phase; startedAt: number }>({ phase: 'idle', startedAt: 0 });
export const themeTransition = { subscribe: motion.subscribe };
const requested = writable<Theme>(desired);
export const requestedTheme = { subscribe: requested.subscribe };
function wait(duration: number) {
  return new Promise<boolean>(resolve => {
    const finish = (elapsed: boolean) => { clearTimeout(timer); wake = undefined; resolve(elapsed); };
    const timer = setTimeout(() => finish(true), duration);
    wake = () => finish(false);
  });
}
async function bounded<T>(promise: Promise<T>, duration: number): Promise<T | undefined> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([promise, new Promise<undefined>(resolve => { timer = setTimeout(resolve, duration); })]);
  } finally { clearTimeout(timer); }
}
const phase = (value: Phase) => motion.set({ phase: value, startedAt: performance.now() });

function applyTheme(value: Theme) {
  current = value;
  if (typeof window !== 'undefined') {
    try { localStorage.setItem('color-mode', value); } catch { /* Theme switching also works without storage. */ }
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(`${value}-mode`);
  }
  state.set(value);
}

async function revealTheme(value: Theme) {
  const previous = current;
  const version = revision;
  const frames = liquidKeyframes(window.innerWidth, window.innerHeight);
  const options: KeyframeAnimationOptions = { duration: LIQUID_REVEAL_MS, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' };
  let live = true;
  let animation: Animation | undefined;
  let transition: ViewTransition | undefined;
  let wash: HTMLDivElement | undefined;
  let stop!: () => void;
  const canceled = new Promise<void>(resolve => { stop = resolve; });
  cancelReveal = stop;
  try {
    if (typeof document.startViewTransition === 'function') {
      transition = document.startViewTransition(async () => {
        if (live && version === revision) { applyTheme(value); await tick(); }
      });
      // Observe rejections immediately, including when a browser skips its snapshot.
      void transition.finished.catch(() => {});
      const ready = await Promise.race([
        bounded(transition.ready.then(() => true), 500), canceled
      ]);
      if (!ready || version !== revision) return;
      animation = document.documentElement.animate(frames, { ...options, pseudoElement: '::view-transition-new(root)' });
    } else {
      wash = document.createElement('div');
      wash.className = 'theme-liquid-wash';
      wash.setAttribute('aria-hidden', 'true');
      wash.style.background = value === 'dark' ? '#202124' : '#ffffff';
      document.body.append(wash);
      animation = wash.animate(frames, options);
    }
    const active = animation;
    redirect = () => {
      // Reverse the same snapshot at its current position; never stack snapshots.
      active.playbackRate = desired === value ? 1 : -1;
      active.play();
    };
    redirect();
    await Promise.race([bounded(active.finished, LIQUID_REVEAL_MS + 1000), canceled]);
    if (version === revision) {
      applyTheme(desired === value ? value : previous);
      await tick();
    }
  } finally {
    live = false;
    redirect = undefined;
    cancelReveal = undefined;
    // A filled pseudo-element animation otherwise keeps the snapshot alive.
    animation?.cancel();
    transition?.skipTransition();
    wash?.remove();
    if (version === revision && current !== desired) applyTheme(desired);
  }
}

async function drain() {
  while (true) {
    if (desired !== current) {
      phase('exiting');
      while (!await wait(CUBE_EXIT_MS + 16) && desired !== current) { /* Keep departing for the latest request. */ }
      if (desired !== current) {
        phase('changing');
        try { await revealTheme(desired); }
        catch { applyTheme(desired); }
      }
    }
    phase('entering');
    while (!await wait(CUBE_ENTER_MS + 16) && desired === current) { /* Finish returning after canceled clicks. */ }
    if (desired === current) break;
  }
  phase('idle');
}

export const theme = {
  subscribe: state.subscribe,
  set(value: Theme) {
    revision++;
    desired = value;
    requested.set(value);
    cancelReveal?.();
    wake?.();
    applyTheme(value);
  },
  toggle() {
    desired = desired === 'light' ? 'dark' : 'light';
    requested.set(desired);
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) {
      this.set(desired);
      return Promise.resolve();
    }
    if (redirect) redirect();
    else wake?.();
    if (!running) running = drain().finally(() => { running = null; });
    return running;
  }
};
