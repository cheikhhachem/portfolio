<script lang="ts">
  import { language, type Language } from '../stores/language';

  let isOpen = false;
  const languages: { value: Language; label: string }[] = [
    { value: 'fr', label: 'FR' },
    { value: 'ar', label: 'AR' },
    { value: 'en', label: 'EN' }
  ];

  $: currentLang = languages.find(l => l.value === $language)?.label || 'FR';

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function selectLanguage(lang: Language) {
    language.set(lang);
    isOpen = false;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#language-selector')) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div id="language-selector">
  <div class="custom-select">
    <button 
      class="select-selected" 
      on:click|stopPropagation={toggleDropdown}
      aria-label="Select language"
      aria-expanded={isOpen}
    >
      {currentLang}
    </button>
    {#if isOpen}
      <div class="select-items">
        {#each languages as lang}
          <button
            data-value={lang.value}
            on:click={() => selectLanguage(lang.value)}
            class:active={$language === lang.value}
          >
            {lang.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  #language-selector {
    position: fixed;
    top: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }

  .custom-select {
    position: relative;
    width: 70px;
  }

  .select-selected {
    box-sizing: border-box;
    background: var(--bg);
    color: var(--text);
    border: 2px solid var(--text);
    border-radius: 8px;
    box-shadow: 4px 4px 0 var(--text);
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    width: 100%;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    font-family: inherit;
  }

  .select-selected:hover {
    box-shadow: 6px 6px 0 var(--text);
    transform: translateY(-2px);
  }

  .select-selected:active {
    box-shadow: 2px 2px 0 var(--text);
    transform: translateY(0);
  }

  .select-items {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background: var(--bg);
    border: 2px solid var(--text);
    border-radius: 8px;
    box-shadow: 4px 4px 0 var(--text);
    overflow: hidden;
    animation: slideDown 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .select-items button {
    background: transparent;
    color: var(--text);
    border: none;
    border-bottom: 1px solid var(--text);
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    width: 100%;
    text-align: center;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .select-items button:last-child {
    border-bottom: none;
  }

  .select-items button:hover {
    background: var(--text);
    color: var(--bg);
  }

  .select-items button.active {
    background: var(--text);
    color: var(--bg);
    font-weight: 700;
  }
</style>
