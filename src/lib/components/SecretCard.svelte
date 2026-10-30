<script lang="ts">
  import { onMount } from 'svelte';

  export let name: string;
  export let onClose: () => void;
  let dialog: HTMLDialogElement;

  onMount(() => {
    dialog.showModal();
    return () => dialog.close();
  });
</script>

<dialog bind:this={dialog} aria-labelledby="secret-name" on:cancel={(event) => { event.preventDefault(); onClose(); }}>
  <div class="card">
    <div class="grain" aria-hidden="true"></div>
    <header>
      <span class="eyebrow">A LITTLE SECRET</span>
      <button type="button" aria-label="Close secret card" title="Close" on:click={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
      </button>
    </header>
    <div class="reveal">
      <div class="orbit" aria-hidden="true"><span></span></div>
      <span class="caption">YOU FOUND ME</span>
      <h2 id="secret-name" aria-label={name} class:message={name.includes(' ')}>
        {#if name.includes(' ')}
          {#each name.split(' ') as word, index}
            <span class="letter word" aria-hidden="true" style={`--delay: ${260 + index * 160}ms`}>{word}</span>{' '}
          {/each}
        {:else}
          {#each [...name] as letter, index}
            <span class="letter" aria-hidden="true" style={`--delay: ${260 + index * 100}ms`}>{letter}</span>
          {/each}
        {/if}<span class="cursor" aria-hidden="true"></span>
      </h2>
      <div class="underline" aria-hidden="true"></div>
    </div>
    <footer><span>Some things are worth finding.</span><svg class="spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M12 2c0 7-3 10-10 10 7 0 10 3 10 10 0-7 3-10 10-10-7 0-10-3-10-10Z" /></svg></footer>
  </div>
</dialog>

<style>
  dialog { width: min(460px, calc(100vw - 40px)); max-height: calc(100dvh - 40px); padding: 0; margin: auto; overflow: auto; border: 1px solid color-mix(in srgb, var(--text) 25%, transparent); border-radius: 22px; background: var(--bg); color: var(--text); box-shadow: 0 32px 120px #0004; font-family: inherit; animation: card-enter 650ms cubic-bezier(.16, 1, .3, 1) both; }
  dialog::backdrop { background: #0007; backdrop-filter: blur(12px); animation: backdrop-enter 350ms ease both; }
  .card { position: relative; overflow: hidden; padding: 24px; isolation: isolate; }
  .grain { position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .25; background-image: radial-gradient(currentColor .5px, transparent .5px); background-size: 7px 7px; mask-image: linear-gradient(135deg, #000, transparent 65%); }
  header, footer { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
  .eyebrow, .caption { font-size: 10px; letter-spacing: .22em; opacity: .55; }
  button { display: grid; place-items: center; width: 44px; height: 44px; padding: 10px; border: 1px solid color-mix(in srgb, var(--text) 18%, transparent); border-radius: 13px; color: inherit; background: var(--bg); cursor: pointer; transition: transform 180ms, background 180ms; }
  button:hover { transform: rotate(8deg); background: var(--bg-alt-2); }
  button:active { transform: scale(.94); }
  button:focus-visible { outline: 2px solid var(--text); outline-offset: 4px; }
  svg { width: 22px; height: 22px; }
  .reveal { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; padding: 25px 0; }
  .orbit { position: absolute; width: 220px; height: 220px; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 50%; animation: orbit-enter 1s ease both, orbit-spin 24s 1s linear infinite; pointer-events: none; }
  .orbit::after { content: ''; position: absolute; inset: 12px; border: 1px dashed color-mix(in srgb, var(--text) 8%, transparent); border-radius: 50%; }
  .orbit span { position: absolute; top: 50%; left: -3px; width: 5px; height: 5px; border-radius: 50%; background: var(--text); }
  .caption { position: relative; margin-bottom: 14px; animation: caption-enter 600ms 150ms both; }
  h2 { display: flex; align-items: baseline; margin: 0; font-size: clamp(38px, 10vw, 64px); font-weight: 500; line-height: 1.25; letter-spacing: -.04em; direction: ltr; }
  h2.message { display: block; max-width: 100%; font-size: clamp(24px, 6vw, 36px); text-align: center; line-height: 1.5; }
  .word { white-space: nowrap; }
  .letter { display: inline-block; animation: letter-enter 650ms var(--delay) cubic-bezier(.16, 1, .3, 1) both; }
  .cursor { display: inline-block; align-self: center; height: .75em; width: 2px; margin-left: 8px; background: currentColor; animation: cursor-blink 1s 350ms steps(2, jump-none) 4 both; }
  .underline { width: 42px; height: 2px; margin-top: 22px; background: currentColor; transform-origin: left; animation: underline-enter 700ms 650ms both; }
  footer { padding-top: 16px; border-top: 1px solid color-mix(in srgb, var(--text) 14%, transparent); font-size: 11px; }
  footer span { opacity: .55; }
  .spark { animation: sparkle-enter 900ms 700ms both; }
  @keyframes card-enter { from { opacity: 0; transform: perspective(900px) translateY(35px) rotateX(12deg) scale(.94); } to { opacity: 1; transform: none; } }
  @keyframes backdrop-enter { from { opacity: 0; } to { opacity: 1; } }
  @keyframes letter-enter { from { opacity: 0; filter: blur(8px); transform: translateY(22px) rotate(7deg); } to { opacity: 1; filter: blur(0); transform: none; } }
  @keyframes caption-enter { from { opacity: 0; transform: translateY(6px); } to { opacity: .55; transform: none; } }
  @keyframes underline-enter { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes orbit-enter { from { opacity: 0; scale: .7; } to { opacity: 1; scale: 1; } }
  @keyframes orbit-spin { to { rotate: 360deg; } }
  @keyframes cursor-blink { from { opacity: 1; } to { opacity: 0; } }
  @keyframes sparkle-enter { from { opacity: 0; transform: rotate(-90deg) scale(.4); } to { opacity: 1; transform: none; } }
  @media (max-width: 480px) { .card { padding: 18px; } .reveal { min-height: 260px; } }
  @media (prefers-reduced-motion: reduce) {
    dialog, dialog::backdrop, .letter, .caption, .underline, .orbit, .cursor, .spark { animation: none; }
    .cursor { display: none; }
    button { transition: none; }
  }
</style>
