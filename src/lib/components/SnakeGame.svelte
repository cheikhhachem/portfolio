<script lang="ts">
  import { onMount } from 'svelte';
  import { language } from '../stores/language';
  import { t } from '../utils/translations';
  import { SIZE, canTurn, placeFood, step, type Cell, type Direction } from '../utils/snake';

  export let onClose: () => void;
  let dialog: HTMLDialogElement;
  let snake: Cell[] = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
  let direction: Direction = 'right';
  let turns: Direction[] = [];
  let food = placeFood(snake);
  let score = 0;
  let best = 0;
  let speed = 50;
  let mounted = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  // 70% equals the original 120 ms per step; 50% starts at 150 ms.
  $: tickDelay = Math.round(1000 / (2.5 + speed / 12));
  $: if (mounted) {
    clearInterval(timer);
    timer = setInterval(tick, tickDelay);
  }
  const iconPaths: Record<string, string> = {
    up: 'M12 19V5m-6 6 6-6 6 6',
    down: 'M12 5v14m-6-6 6 6 6-6',
    left: 'M19 12H5m6-6-6 6 6 6',
    right: 'M5 12h14m-6-6 6 6-6 6',
    close: 'm6 6 12 12M6 18 18 6',
    pause: 'M9 5v14M15 5v14',
    play: 'm8 5 11 7-11 7Z',
    restart: 'M3 10a9 9 0 1 1 2 8M3 4v6h6'
  };
  let state: 'ready' | 'running' | 'paused' | 'over' | 'won' = 'ready';
  $: scoreFormatter = new Intl.NumberFormat($language, { minimumIntegerDigits: 2, useGrouping: false });
  $: percentFormatter = new Intl.NumberFormat($language, { style: 'percent', maximumFractionDigits: 0 });
  $: playbackLabel = t($language, state === 'running' ? 'snakePause' : state === 'paused' ? 'snakeResume' : 'snakePlay');
  let drag: { x: number; y: number; id: number } | null = null;
  const arrows: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

  function reset() {
    snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
    direction = 'right';
    turns = [];
    food = placeFood(snake);
    score = 0;
    state = 'ready';
  }

  function turn(next: Direction) {
    if (state === 'over' || state === 'won' || state === 'paused') return;
    const previous = turns[turns.length - 1] ?? direction;
    if (turns.length < 2 && next !== previous && canTurn(previous, next)) turns = [...turns, next];
    if (state === 'ready') state = 'running';
  }

  function tick() {
    if (state !== 'running') return;
    direction = turns.shift() ?? direction;
    const result = step(snake, direction, food);
    if (result.dead) { state = 'over'; return; }
    snake = result.snake;
    if (result.ate) {
      score += 1;
      if (score > best) {
        best = score;
        try { localStorage.setItem('snake-best', String(best)); } catch { /* Storage may be unavailable. */ }
      }
      food = placeFood(snake);
      if (!food) state = 'won';
    }
  }

  function pause() {
    if (state === 'running') state = 'paused';
    else if (state === 'paused' || state === 'ready') state = 'running';
  }

  function keydown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement) return;
    if (arrows[event.key]) {
      event.preventDefault();
      turn(arrows[event.key]!);
    } else if (event.code === 'Space' && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault(); pause();
    }
  }

  function pointerdown(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    (event.currentTarget as SVGSVGElement).setPointerCapture(event.pointerId);
    drag = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  function pointermove(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    drag = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  onMount(() => {
    try {
      const saved = Number(localStorage.getItem('snake-best'));
      if (Number.isFinite(saved) && saved >= 0) best = Math.floor(saved);
    } catch { /* The game also works without storage. */ }
    dialog.showModal();
    mounted = true;
    const hide = () => { if (document.hidden && state === 'running') state = 'paused'; };
    const blur = () => { if (state === 'running') state = 'paused'; };
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('blur', blur);
    return () => {
      mounted = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('blur', blur);
      dialog.close();
    };
  });
</script>

{#snippet icon(name: string)}
  <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d={iconPaths[name]} />
  </svg>
{/snippet}

<svelte:window on:keydown={keydown} />

<dialog bind:this={dialog} lang={$language} dir={$language === 'ar' ? 'rtl' : 'ltr'} aria-labelledby="snake-title" on:cancel={(event) => { event.preventDefault(); onClose(); }}>
  <header>
    <div><span class="eyebrow">{t($language, 'snakeSecret')}</span><h2 id="snake-title">{t($language, 'snakeTitle')}<span class="dot">.</span></h2></div>
    <button class="icon-button close" type="button" aria-label={t($language, 'snakeClose')} title={t($language, 'snakeClose')} on:click={onClose}>{@render icon('close')}</button>
  </header>
  <div class="speed-controls">
    <button class="icon-button playback" type="button" aria-label={playbackLabel} title={playbackLabel} disabled={state === 'over' || state === 'won'} on:click={pause}>
      {@render icon(state === 'running' ? 'pause' : 'play')}
    </button>
    <div class="speed-slider">
      <label for="snake-speed">{t($language, 'snakeSpeed')} <output for="snake-speed"><bdi>{percentFormatter.format(speed / 100)}</bdi></output></label>
      <input id="snake-speed" type="range" min="0" max="100" step="1" bind:value={speed} dir="ltr" aria-label={t($language, 'snakeSpeedLabel')} aria-valuetext={percentFormatter.format(speed / 100)} style={`--fill: ${speed}%`} />
    </div>
  </div>
  <div class="scoreboard"><span>{t($language, 'snakeScore')} <strong><bdi>{scoreFormatter.format(score)}</bdi></strong></span><span>{t($language, 'snakeBest')} <strong><bdi>{scoreFormatter.format(best)}</bdi></strong></span></div>
  <div class="field">
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t($language, 'snakeField')} on:pointerdown={pointerdown} on:pointermove={pointermove} on:pointerup={() => drag = null} on:pointercancel={() => drag = null} on:lostpointercapture={() => drag = null}>
      <defs><pattern id="snake-grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M 1 0 L 0 0 0 1" fill="none" stroke="currentColor" stroke-width="0.025" opacity="0.12" /></pattern></defs>
      <rect width={SIZE} height={SIZE} fill="url(#snake-grid)" />
      {#if food}<rect class="food" x={food.x + 0.22} y={food.y + 0.22} width="0.56" height="0.56" rx="0.12" fill="none" stroke="currentColor" stroke-width="0.12" />{/if}
      {#each snake as segment, index}
        <rect x={segment.x + 0.06} y={segment.y + 0.06} width="0.88" height="0.88" rx="0.16" fill="currentColor" opacity={index === 0 ? 1 : 0.65} />
      {/each}
    </svg>
    {#if state !== 'running'}
      <div class="field-message" aria-live="polite">
        <div class="message-card">
          <h3>{t($language, state === 'ready' ? 'snakeReady' : state === 'paused' ? 'snakePaused' : state === 'won' ? 'snakeWon' : 'snakeOver')}</h3>
          <p>{state === 'ready' ? t($language, 'snakeInstructions') : state === 'paused' ? t($language, 'snakePausedHint') : `${t($language, 'snakeFinalScore')} · ${score.toLocaleString($language)}`}</p>
          {#if state === 'over' || state === 'won'}
            <button class="primary-button" type="button" on:click={reset}>{@render icon('restart')}<span>{t($language, 'snakePlayAgain')}</span></button>
          {:else}
            <button class="primary-button" type="button" on:click={pause}>{@render icon('play')}<span>{t($language, state === 'paused' ? 'snakeResume' : 'snakePlay')}</span></button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  <div class="game-footer"><span>{t($language, 'snakeControlsHint')}</span><span>{t($language, 'snakeEdgesHint')}</span></div>
  <nav class="controls" aria-label={t($language, 'snakeControlsLabel')}>
    <button class="up" type="button" aria-label={t($language, 'snakeUp')} on:pointerdown={(e) => { e.preventDefault(); turn('up'); }} on:click={(e) => { if (e.detail === 0) turn('up'); }}>{@render icon('up')}</button>
    <button class="left" type="button" aria-label={t($language, 'snakeLeft')} on:pointerdown={(e) => { e.preventDefault(); turn('left'); }} on:click={(e) => { if (e.detail === 0) turn('left'); }}>{@render icon('left')}</button>
    <button class="down" type="button" aria-label={t($language, 'snakeDown')} on:pointerdown={(e) => { e.preventDefault(); turn('down'); }} on:click={(e) => { if (e.detail === 0) turn('down'); }}>{@render icon('down')}</button>
    <button class="right" type="button" aria-label={t($language, 'snakeRight')} on:pointerdown={(e) => { e.preventDefault(); turn('right'); }} on:click={(e) => { if (e.detail === 0) turn('right'); }}>{@render icon('right')}</button>
  </nav>
</dialog>

<style>
  dialog { width: min(440px, calc(100vw - 48px)); max-height: calc(100dvh - 32px); margin: auto; padding: 24px; overflow-y: auto; background: var(--bg); color: var(--text); border: 1px solid color-mix(in srgb, var(--text) 25%, transparent); border-radius: 20px; box-shadow: 0 24px 100px #0003; font-family: inherit; }
  dialog::backdrop { background: #0008; backdrop-filter: blur(10px); }
  header, .scoreboard, .game-footer { display: flex; align-items: center; justify-content: space-between; }
  .eyebrow { font-size: 10px; letter-spacing: 0.22em; opacity: 0.55; }
  h2 { margin: 0; font-size: 38px; font-weight: 500; line-height: 1.15; }
  .dot { opacity: 0.4; }
  dialog[dir="rtl"] .eyebrow, dialog[dir="rtl"] .scoreboard, dialog[dir="rtl"] .speed-slider label { letter-spacing: normal; }
  button { font: inherit; color: inherit; cursor: pointer; border: 1px solid color-mix(in srgb, var(--text) 25%, transparent); border-radius: 10px; background: var(--bg); padding: 6px 14px; touch-action: manipulation; }
  button:hover { background: var(--bg-alt-2); }
  button:focus-visible { outline: 2px solid var(--text); outline-offset: 3px; }
  button:disabled { opacity: 0.35; cursor: default; }
  .button-icon { display: block; width: 22px; height: 22px; flex-shrink: 0; }
  button { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 44px; transition: background 150ms, border-color 150ms, transform 150ms, box-shadow 150ms; }
  button:active:not(:disabled) { transform: translateY(2px); box-shadow: none; }
  .icon-button { width: 44px; height: 44px; padding: 0; border-radius: 12px; }
  .close { align-self: flex-start; border-color: transparent; }
  .playback { background: var(--text); color: var(--bg); border-color: var(--text); }
  .playback:hover { background: color-mix(in srgb, var(--text) 85%, var(--bg)); }
  .speed-controls { display: flex; align-items: center; gap: 16px; margin-top: 20px; padding: 12px; border: 1px solid color-mix(in srgb, var(--text) 15%, transparent); border-radius: 14px; background: var(--bg-alt-2); }
  .speed-slider { flex: 1; min-width: 0; }
  .speed-slider label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 10px; letter-spacing: 0.14em; }
  output { font: 12px monospace; letter-spacing: 0; }
  input[type='range'] { display: block; appearance: none; width: 100%; height: 6px; margin: 10px 0; border-radius: 999px; background: linear-gradient(to right, var(--text) 0%, var(--text) var(--fill), color-mix(in srgb, var(--text) 18%, transparent) var(--fill), color-mix(in srgb, var(--text) 18%, transparent) 100%); cursor: pointer; touch-action: pan-y; }
  input[type='range']::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; border: 3px solid var(--bg); border-radius: 50%; background: var(--text); box-shadow: 0 0 0 1px color-mix(in srgb, var(--text) 40%, transparent); }
  input[type='range']::-moz-range-thumb { width: 12px; height: 12px; border: 3px solid var(--bg); border-radius: 50%; background: var(--text); box-shadow: 0 0 0 1px color-mix(in srgb, var(--text) 40%, transparent); }
  input[type='range']:focus-visible { outline: 2px solid var(--text); outline-offset: 6px; }
  .primary-button { margin: auto; }
  .primary-button:hover { opacity: 0.85; }
  .scoreboard { padding: 20px 0 12px; font-size: 11px; letter-spacing: 0.12em; }
  strong { margin-inline-start: 8px; font: 22px monospace; letter-spacing: 0; }
  .field { width: min(100%, 52dvh); margin: auto; box-sizing: border-box; position: relative; border: 1px solid color-mix(in srgb, var(--text) 25%, transparent); border-radius: 10px; overflow: hidden; }
  .field, .field :global(*) {
    -webkit-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  .field > svg { display: block; width: 100%; aspect-ratio: 1; touch-action: none; user-select: none; }
  .field-message { position: absolute; inset: 0; display: grid; place-items: center; background: color-mix(in srgb, var(--bg) 70%, transparent); pointer-events: none; }
  .message-card { text-align: center; padding: 18px; }
  h3 { margin: 0; font-size: 23px; font-weight: 500; }
  .message-card p { margin: 5px 0 18px; font-size: 13px; opacity: 0.65; }
  .message-card button { pointer-events: auto; background: var(--text); color: var(--bg); padding: 7px 24px; }
  .game-footer { padding-top: 12px; font-size: 11px; flex-wrap: wrap; gap: 6px 16px; }
  .game-footer span { opacity: 0.55; }
  .controls { display: none; direction: ltr; grid-template-columns: repeat(3, 52px); grid-template-rows: repeat(2, 48px); gap: 7px; justify-content: center; margin-top: 12px; }
  .controls button { padding: 0; border-radius: 13px; background: var(--bg-alt-2); box-shadow: 0 3px 0 color-mix(in srgb, var(--text) 18%, transparent); }
  .up { grid-column: 2; }
  .left { grid-column: 1; grid-row: 2; }
  .down { grid-column: 2; grid-row: 2; }
  .right { grid-column: 3; grid-row: 2; }
  @media (max-width: 768px), (pointer: coarse) { .controls { display: grid; } dialog { padding: 16px; width: min(400px, calc(100vw - 48px)); } .field { width: min(100%, 43dvh); } }
</style>
