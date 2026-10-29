<script lang="ts">
  import { language } from '../stores/language';
  import { t } from '../utils/translations';
  import { easterEggs } from '../utils/easterEggs';
  import EasterEggCard from './EasterEggCard.svelte';
  export let onClose: () => void;
</script>

<EasterEggCard title={t($language, 'cheatTitle')} {onClose}>
  <p class="intro">{t($language, 'cheatInstructions')}</p>
  <div class="numbering" aria-label={t($language, 'cheatLayout')}>
    <div class="column" dir="ltr">{#each [1, 2, 3, 4] as number}<span>{number}</span>{/each}</div>
    <span class="face">{t($language, 'cheatFace')}</span>
    <div class="column" dir="ltr">{#each [5, 6, 7, 8] as number}<span>{number}</span>{/each}</div>
  </div>
  <ul>
    {#each easterEggs as egg, index}
      <li style={`--delay: ${index * 55}ms`}>
        <span class="name">{egg.label ? t($language, egg.label) : egg.id}</span>
        <div class="combination">
          <code dir="ltr">{[...egg.code].join(' · ')}</code>
          {#if egg.face}<span class="finish">{t($language, 'cheatThenFace')}</span>{/if}
        </div>
      </li>
    {/each}
  </ul>
</EasterEggCard>

<style>
  .intro { margin: 18px 0; font-size: 13px; line-height: 1.6; opacity: .65; }
  .numbering { display: flex; direction: ltr; align-items: center; justify-content: center; gap: 32px; padding: 12px; margin-bottom: 16px; border-radius: 14px; background: var(--bg-alt-2); }
  .column { display: grid; gap: 5px; }
  .column span { display: grid; place-items: center; width: 25px; height: 25px; border: 1px solid color-mix(in srgb, var(--text) 30%, transparent); border-radius: 5px; font: 12px monospace; }
  .face { font-size: 12px; opacity: .6; }
  ul { margin: 0; padding: 0; list-style: none; }
  li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 0; border-top: 1px solid color-mix(in srgb, var(--text) 12%, transparent); animation: appear 300ms var(--delay) both; }
  .name { font-size: 13px; font-weight: 500; }
  .combination { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  code { font-size: 12px; letter-spacing: .04em; }
  .finish { font-size: 10px; opacity: .55; }
  @keyframes appear { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { li { animation: none; } }
</style>
