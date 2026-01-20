<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { theme } from './lib/stores/theme';
  import { language } from './lib/stores/language';
  import Hero from './lib/components/Hero.svelte';
  import GridNavigation from './lib/components/GridNavigation.svelte';
  import ThemeToggle from './lib/components/ThemeToggle.svelte';
  import LanguageSelector from './lib/components/LanguageSelector.svelte';
  import ImagePreloader from './lib/components/ImagePreloader.svelte';

  let isLoaded = false;

  function handleLoaded() {
    isLoaded = true;
  }

  onMount(() => {
    // Initialize theme on mount
    const initialTheme = typeof window !== 'undefined' && localStorage.getItem('color-mode');
    if (initialTheme === 'dark' || initialTheme === 'dark-mode') {
      theme.set('dark');
    } else {
      theme.set('light');
    }

    // Initialize language on mount
    const initialLang = typeof window !== 'undefined' && localStorage.getItem('selected-language');
    if (initialLang && ['fr', 'ar', 'en'].includes(initialLang)) {
      language.set(initialLang as any);
    }
  });
</script>

<ImagePreloader on:loaded={handleLoaded} />

{#if isLoaded}
  <main in:fade={{ duration: 500 }}>
    <Hero />
    <GridNavigation />
    <ThemeToggle />
    <LanguageSelector />
  </main>
{/if}

<style>
  main {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
</style>
