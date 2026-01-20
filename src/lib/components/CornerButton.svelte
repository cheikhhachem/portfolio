<script lang="ts">
  import { language } from '../stores/language';
  import { t } from '../utils/translations';
  
  export let title: string;
  export let corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  export let isActive: boolean = false;
  export let onClick: () => void;

  $: rotation = {
    'top-left': -45,
    'top-right': 45,
    'bottom-left': 45,
    'bottom-right': -45
  }[corner];

  $: position = {
    'top-left': { top: 'var(--btn-offset)', left: 'var(--btn-offset)' },
    'top-right': { top: 'var(--btn-offset)', right: 'var(--btn-offset)' },
    'bottom-left': { bottom: 'var(--btn-offset)', left: 'var(--btn-offset)' },
    'bottom-right': { bottom: 'var(--btn-offset)', right: 'var(--btn-offset)' }
  }[corner];

  // Shadow positioning based on corner
  $: boxShadow = {
    'top-left': '6px 6px 0 var(--text)',
    'top-right': '-6px 6px 0 var(--text)',
    'bottom-left': '6px -6px 0 var(--text)',
    'bottom-right': '-6px -6px 0 var(--text)'
  }[corner];

  $: boxShadowHover = {
    'top-left': '8px 8px 0 var(--text)',
    'top-right': '-8px 8px 0 var(--text)',
    'bottom-left': '8px -8px 0 var(--text)',
    'bottom-right': '-8px -8px 0 var(--text)'
  }[corner];

  $: boxShadowActive = {
    'top-left': '3px 3px 0 var(--text)',
    'top-right': '-3px 3px 0 var(--text)',
    'bottom-left': '3px -3px 0 var(--text)',
    'bottom-right': '-3px -3px 0 var(--text)'
  }[corner];

  $: alignment = corner.includes('top') ? 'flex-end' : 'flex-start';
  $: padding = corner.includes('top') ? '0 0 0.5rem 0' : '0.5rem 0 0 0';
</script>

<button
  class="corner-btn"
  class:active={isActive}
  style="
    {Object.entries(position).map(([k, v]) => `${k}: ${v}`).join('; ')};
    transform: rotate({rotation}deg);
    align-items: {alignment};
    padding: {padding};
    --box-shadow: {boxShadow};
    --box-shadow-hover: {boxShadowHover};
    --box-shadow-active: {boxShadowActive};
  "
  on:click={onClick}
  aria-label="{title}"
>
  {title}
</button>

<style>
  .corner-btn {
    --btn-size: 18.75rem;
    --btn-offset: -11.5rem;
    --btn-font-size: 1.5rem;

    height: var(--btn-size);
    width: var(--btn-size);
    background: var(--bg);
    color: var(--text);
    border: 2px solid var(--text);
    position: fixed;
    display: flex;
    justify-content: center;
    cursor: pointer;
    text-align: center;
    font-weight: 800;
    font-size: var(--btn-font-size);
    z-index: 110;
    border-radius: 40%;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    font-family: inherit;
    box-shadow: var(--box-shadow);
  }

  @media screen and (max-width: 1024px) {
    .corner-btn {
      --btn-size: 16rem;
      --btn-offset: -9.5rem;
      --btn-font-size: 1.3rem;
    }
  }

  @media screen and (max-width: 768px) {
    .corner-btn {
      --btn-size: 14rem;
      --btn-offset: -8rem;
      --btn-font-size: 1.2rem;
    }
  }

  @media screen and (max-width: 480px) {
    .corner-btn {
      --btn-size: 12rem;
      --btn-offset: -7rem;
      --btn-font-size: 1rem;
    }
  }

  .corner-btn.active {
    z-index: 300;
  }

  .corner-btn:hover {
    box-shadow: var(--box-shadow-hover);
    cursor: pointer;
    transform: rotate(var(--rotation)) translateY(-2px);
  }

  .corner-btn:active {
    box-shadow: var(--box-shadow-active);
    transform: rotate(var(--rotation)) translateY(0) scale(0.98) !important;
  }
</style>
