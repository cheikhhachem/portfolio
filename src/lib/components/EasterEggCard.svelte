<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { language } from '../stores/language';
  import { t } from '../utils/translations';

  let { title, onClose, children }: { title: string; onClose: () => void; children: Snippet } = $props();
  let dialog: HTMLDialogElement;
  onMount(() => {
    dialog.showModal();
    return () => dialog.close();
  });
</script>

<dialog bind:this={dialog} lang={$language} dir={$language === 'ar' ? 'rtl' : 'ltr'} aria-labelledby="egg-title" oncancel={(event) => { event.preventDefault(); onClose(); }}>
  <header>
    <div><span class="eyebrow">{t($language, 'snakeSecret')}</span><h2 id="egg-title">{title}<span class="dot">.</span></h2></div>
    <button class="icon-button close" type="button" aria-label={t($language, 'eggClose')} title={t($language, 'eggClose')} onclick={onClose}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
    </button>
  </header>
  {@render children()}
</dialog>

<style>
  dialog { box-sizing: border-box; width: min(480px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); padding: 24px; margin: auto; overflow: auto; color: var(--text); background: var(--bg); border: 1px solid color-mix(in srgb, var(--text) 25%, transparent); border-radius: 20px; box-shadow: 0 24px 100px #0003; font-family: inherit; animation: reveal 350ms cubic-bezier(.16,1,.3,1) both; }
  dialog::backdrop { background: #0008; backdrop-filter: blur(10px); }
  header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .eyebrow { font-size: 10px; letter-spacing: .18em; opacity: .55; }
  dialog[dir='rtl'] .eyebrow { letter-spacing: normal; }
  h2 { margin: 0; font-size: clamp(26px, 7vw, 36px); font-weight: 500; line-height: 1.2; }
  .dot { opacity: .4; }
  dialog :global(button) { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 8px 14px; font: inherit; color: inherit; cursor: pointer; border: 1px solid color-mix(in srgb, var(--text) 25%, transparent); border-radius: 11px; background: var(--bg); touch-action: manipulation; transition: background 150ms, transform 150ms; }
  dialog :global(button:hover) { background: var(--bg-alt-2); }
  dialog :global(button:active) { transform: translateY(2px); }
  dialog :global(button:focus-visible), dialog :global(input:focus-visible), dialog :global(canvas:focus-visible) { outline: 2px solid var(--text); outline-offset: 4px; }
  dialog :global(svg) { width: 22px; height: 22px; flex-shrink: 0; }
  dialog :global(.icon-button) { width: 44px; height: 44px; padding: 0; flex-shrink: 0; }
  dialog :global(.close) { border-color: transparent; }
  dialog :global(.playback) { background: var(--text); color: var(--bg); border-color: var(--text); }
  dialog :global(.playback:hover) { background: color-mix(in srgb, var(--text) 85%, var(--bg)); }
  @keyframes reveal { from { opacity: 0; transform: translateY(20px) scale(.97); } to { opacity: 1; transform: none; } }
  @media (max-width: 480px) { dialog { padding: 16px; } }
  @media (prefers-reduced-motion: reduce) { dialog { animation: none; } }
</style>
