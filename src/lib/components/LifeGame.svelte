<script lang="ts">
  import { onMount } from 'svelte';
  import { language } from '../stores/language';
  import { theme } from '../stores/theme';
  import { t } from '../utils/translations';
  import { LIFE_SIZE, stepLife, addLifeSeed } from '../utils/life';
  import EasterEggCard from './EasterEggCard.svelte';

  export let onClose: () => void;
  let canvas: HTMLCanvasElement;
  let board = addLifeSeed(addLifeSeed(new Uint8Array(LIFE_SIZE * LIFE_SIZE)).board).board;
  let paused = false;
  let speed = 50;
  let generation = 0;
  let lastPattern = '';
  let mounted = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  let drag: { id: number; value: number; x: number; y: number } | null = null;
  $: population = board.reduce((sum, cell) => sum + cell, 0);
  $: formatter = new Intl.NumberFormat($language);
  $: percent = new Intl.NumberFormat($language, { style: 'percent', maximumFractionDigits: 0 }).format(speed / 100);
  $: playbackLabel = t($language, paused ? 'lifeResume' : 'lifePause');
  $: delay = Math.round(1000 / (2 + speed * 0.28));
  $: if (mounted) configureTimer(paused, delay);

  function configureTimer(isPaused: boolean, interval: number) {
    clearInterval(timer);
    if (!isPaused) timer = setInterval(() => { board = stepLife(board); generation++; }, interval);
  }
  $: if (mounted && canvas) { board; $theme; draw(); }

  function draw() {
    const context = canvas.getContext('2d');
    if (!context) return;
    const pixels = Math.max(1, Math.round(canvas.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2)));
    if (canvas.width !== pixels || canvas.height !== pixels) { canvas.width = pixels; canvas.height = pixels; }
    const unit = pixels / LIFE_SIZE;
    const ink = getComputedStyle(canvas).getPropertyValue('--text').trim();
    context.clearRect(0, 0, pixels, pixels);
    context.fillStyle = ink;
    for (let i = 0; i < board.length; i++) {
      if (board[i]) context.fillRect((i % LIFE_SIZE) * unit, Math.floor(i / LIFE_SIZE) * unit, Math.max(1, unit - 0.5), Math.max(1, unit - 0.5));
    }
    context.strokeStyle = ink;
    context.globalAlpha = 0.07;
    context.lineWidth = 0.5;
    context.beginPath();
    for (let i = 0; i <= LIFE_SIZE; i++) {
      context.moveTo(i * unit, 0); context.lineTo(i * unit, pixels);
      context.moveTo(0, i * unit); context.lineTo(pixels, i * unit);
    }
    context.stroke();
    context.globalAlpha = 1;
  }

  function cellAt(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(LIFE_SIZE - 1, Math.floor((event.clientX - rect.left) / rect.width * LIFE_SIZE))),
      y: Math.max(0, Math.min(LIFE_SIZE - 1, Math.floor((event.clientY - rect.top) / rect.height * LIFE_SIZE)))
    };
  }

  function paint(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    const { x, y } = cellAt(event);
    const distance = Math.max(Math.abs(x - drag.x), Math.abs(y - drag.y), 1);
    const next = board.slice();
    for (let i = 0; i <= distance; i++) {
      next[Math.round(drag.y + (y - drag.y) * i / distance) * LIFE_SIZE + Math.round(drag.x + (x - drag.x) * i / distance)] = drag.value;
    }
    board = next;
    drag = { ...drag, x, y };
  }

  function pointerdown(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    paused = true;
    canvas.setPointerCapture(event.pointerId);
    const cell = cellAt(event);
    drag = { id: event.pointerId, value: 1 - board[cell.y * LIFE_SIZE + cell.x], ...cell };
    paint(event);
  }

  function clear() {
    paused = true;
    board = new Uint8Array(LIFE_SIZE * LIFE_SIZE);
    generation = 0;
    lastPattern = '';
  }

  function randomize() {
    const result = addLifeSeed(board);
    board = result.board;
    lastPattern = result.name;
  }

  function keydown(event: KeyboardEvent) {
    if (event.code !== 'Space' || event.repeat || event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    paused = !paused;
  }

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) paused = true;
    mounted = true;
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    const pause = () => { paused = true; };
    const hide = () => { if (document.hidden) pause(); };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', hide);
    return () => {
      mounted = false;
      clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', hide);
    };
  });
</script>

{#snippet icon(name: string)}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d={name === 'pause' ? 'M9 5v14M15 5v14' : name === 'play' ? 'm8 5 11 7-11 7Z' : name === 'clear' ? 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7' : 'm16 3 4 4-4 4M4 7h4l8 10h4m-4-4 4 4-4 4M4 17h4l3-4m2-2 3-4h4'} />
  </svg>
{/snippet}

<svelte:window on:keydown={keydown} />

<EasterEggCard title={t($language, 'lifeTitle')} {onClose}>
  <div class="speed-controls">
    <button class="icon-button playback" type="button" aria-label={playbackLabel} title={playbackLabel} on:click={() => paused = !paused}>
      {@render icon(paused ? 'play' : 'pause')}
    </button>
    <div class="speed-slider">
      <label for="life-speed">{t($language, 'snakeSpeed')} <output for="life-speed"><bdi>{percent}</bdi></output></label>
      <input id="life-speed" type="range" min="0" max="100" step="1" bind:value={speed} dir="ltr" aria-label={t($language, 'lifeSpeed')} aria-valuetext={percent} style={`--fill: ${speed}%`} />
    </div>
  </div>
  <div class="scoreboard">
    <span>{t($language, 'lifeGeneration')} <strong><bdi>{formatter.format(generation)}</bdi></strong></span>
    <span>{t($language, 'lifePopulation')} <strong><bdi>{formatter.format(population)}</bdi></strong></span>
  </div>
  <div class="field">
    <canvas bind:this={canvas} width="512" height="512" aria-label={t($language, 'lifeField')} on:pointerdown={pointerdown} on:pointermove={paint} on:pointerup={() => drag = null} on:pointercancel={() => drag = null} on:lostpointercapture={() => drag = null}>{t($language, 'lifeField')}</canvas>
    {#if population === 0}<p class="empty">{t($language, 'lifeEmpty')}</p>{/if}
  </div>
  <div class="actions">
    <button type="button" on:click={clear}>{@render icon('clear')}<span>{t($language, 'lifeClear')}</span></button>
    <button type="button" on:click={randomize}>{@render icon('random')}<span>{t($language, 'lifeRandom')}</span></button>
  </div>
  <p class="seed" aria-live="polite">{#if lastPattern}{t($language, 'lifeAdded')} <bdi>{lastPattern}</bdi>{/if}</p>
  <p class="hint">{t($language, 'lifeHint')}</p>
  <p class="rules">{t($language, 'lifeRules')}</p>
</EasterEggCard>

<style>
  .speed-controls { display: flex; align-items: center; gap: 16px; margin-top: 20px; padding: 12px; border: 1px solid color-mix(in srgb, var(--text) 15%, transparent); border-radius: 14px; background: var(--bg-alt-2); }
  .speed-slider { flex: 1; min-width: 0; }
  .speed-slider label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 11px; }
  output { font: 12px monospace; }
  input[type='range'] { display: block; appearance: none; box-sizing: border-box; width: 100%; height: 6px; margin: 10px 0; border-radius: 999px; background: linear-gradient(to right, var(--text) 0%, var(--text) var(--fill), color-mix(in srgb, var(--text) 18%, transparent) var(--fill), color-mix(in srgb, var(--text) 18%, transparent) 100%); cursor: pointer; }
  input[type='range']::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; border: 3px solid var(--bg); border-radius: 50%; background: var(--text); box-shadow: 0 0 0 1px color-mix(in srgb, var(--text) 40%, transparent); }
  input[type='range']::-moz-range-thumb { width: 12px; height: 12px; border: 3px solid var(--bg); border-radius: 50%; background: var(--text); box-shadow: 0 0 0 1px color-mix(in srgb, var(--text) 40%, transparent); }
  .scoreboard { display: flex; justify-content: space-between; gap: 8px; padding: 16px 0 12px; font-size: 11px; flex-wrap: wrap; }
  strong { margin-inline-start: 5px; font: 18px monospace; }
  .field { position: relative; width: min(100%, 48dvh); margin: auto; overflow: hidden; border: 1px solid color-mix(in srgb, var(--text) 25%, transparent); border-radius: 10px; }
  .field, canvas { user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none; }
  canvas { display: block; width: 100%; height: auto; aspect-ratio: 1; touch-action: none; cursor: crosshair; }
  .empty { position: absolute; inset: 0; display: grid; place-content: center; margin: 0; padding: 24px; text-align: center; font-size: 13px; color: var(--text); background: color-mix(in srgb, var(--bg) 70%, transparent); pointer-events: none; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
  .actions button { flex: 1; font-size: 12px; }
  .seed { min-height: 16px; margin: 8px 0; font-size: 11px; opacity: .7; }
  .hint, .rules { margin: 5px 0 0; font-size: 11px; line-height: 1.5; opacity: .55; }
  @media (max-width: 480px) { .field { width: min(100%, 42dvh); } }
</style>
