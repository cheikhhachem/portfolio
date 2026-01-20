<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();
  let loaded = false;
  let progress = 0;
  let imageUrls: string[] = [];

  onMount(async () => {
    // Get all face animation images
    // Vite 5+ deprecated 'as' option, use standard import and access .default
    // We only load light assets now, as we invert them for dark mode
    const modules = import.meta.glob('../../assets/face-animation-light/*.png', { eager: true });
    const urls = Object.values(modules).map((mod: any) => {
      return typeof mod === 'string' ? mod : mod.default;
    });
    
    // Update the reactive variable so the template can see it
    imageUrls = urls;
    
    let loadedCount = 0;
    const total = urls.length;

    if (total === 0) {
      loaded = true;
      dispatch('loaded');
      return;
    }

    const loadPromises = urls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          loadedCount++;
          progress = Math.round((loadedCount / total) * 100);
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          loadedCount++; // Count errors as loaded to avoid hanging
          progress = Math.round((loadedCount / total) * 100);
          resolve();
        };
      });
    });

    await Promise.all(loadPromises);
    
    // Small delay to ensure smooth transition
    setTimeout(() => {
      loaded = true;
      dispatch('loaded');
    }, 500);
  });
</script>

{#if !loaded}
  <div class="preloader" out:fade={{ duration: 500 }}>
    <div class="loader-content">
      <div class="spinner"></div>
      <p>Loading Assets... {progress}%</p>
    </div>
  </div>
{/if}

<!-- 
  Render hidden images to force the browser to decode and cache them.
  Opacity is slightly above 0 to ensure the rendering pipeline processes them.
-->
<div class="cache-warmer">
  {#each imageUrls as url}
    <img src={url} alt="" />
  {/each}
</div>

<style>
  .cache-warmer {
    position: fixed;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    opacity: 0.01;
    pointer-events: none;
    z-index: -9999;
    overflow: hidden;
  }

  .preloader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--bg);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--text);
  }

  .loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid var(--bg-alt);
    border-top: 5px solid var(--text);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
