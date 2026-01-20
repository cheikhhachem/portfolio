<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { activeCorner, type Corner } from '../stores/navigation';
  import { theme } from '../stores/theme';

  // Import all animation images eagerly
  // Vite 5+ deprecated 'as' option, use standard import and access .default
  const lightModules = import.meta.glob('../../assets/face-animation-light/*.png', { eager: true });

  // Helper to extract sequences
  function getSequence(modules: Record<string, any>, prefix: string): string[] {
    const keys = Object.keys(modules)
      .filter(key => {
        // Normalize path separators and get filename
        const normalizedKey = key.replace(/\\/g, '/');
        const fileName = normalizedKey.split('/').pop();
        // Check if filename starts with prefix followed by - or .
        return fileName && (fileName.startsWith(`${prefix}-`) || fileName.startsWith(`${prefix}.`));
      })
      .sort();
    
    if (keys.length > 0) {
      console.log(`[AnimatedCharacter] Found ${keys.length} frames for prefix "${prefix}"`);
      // Log the first module to verify structure
      console.log(`[AnimatedCharacter] Sample module for ${keys[0]}:`, modules[keys[0]]);
    } else {
      console.warn(`[AnimatedCharacter] No frames found for prefix "${prefix}"`);
    }

    return keys.map(key => {
      // Handle both ES module (with .default) and direct string formats
      const mod = modules[key];
      return typeof mod === 'string' ? mod : mod.default;
    });
  }

  // Define animation sequences for both themes
  // We now use the light assets for both themes, inverting them via CSS for dark mode
  const sequences = {
    light: {
      default: getSequence(lightModules, 'tl-1'), // Default idle state
      'top-left': getSequence(lightModules, 'tl'),
      'top-right': getSequence(lightModules, 'tr'),
      'bottom-left': getSequence(lightModules, 'bl'),
      'bottom-right': getSequence(lightModules, 'br')
    },
    dark: {
      default: getSequence(lightModules, 'tl-1'), // Default idle state
      'top-left': getSequence(lightModules, 'tl'),
      'top-right': getSequence(lightModules, 'tr'),
      'bottom-left': getSequence(lightModules, 'bl'),
      'bottom-right': getSequence(lightModules, 'br')
    }
  };

  let currentFrameIndex = 0;
  let currentSequence: string[] = [];
  let animationInterval: any;
  let isReverse = false;
  
  // Track previous state to prevent infinite loops in reactive statements
  let lastMode: string = '';
  let lastCorner: string | null = null;

  // React to theme and active corner changes
  $: {
    const mode = $theme === 'dark' ? 'dark' : 'light';
    const corner = $activeCorner as Exclude<Corner, ''> | '';
    
    // Only run logic if inputs actually changed
    if (mode !== lastMode || corner !== lastCorner) {
      console.log(`[AnimatedCharacter] State changed - Mode: ${mode}, Corner: "${corner}" (was: ${lastMode}, ${lastCorner})`);
      
      lastMode = mode;
      lastCorner = corner;

      if (corner === '') {
        // If closing, reverse the previous animation back to frame 0
        if (currentSequence.length > 0 && currentFrameIndex > 0) {
          console.log('[AnimatedCharacter] Reversing animation');
          isReverse = true;
          playAnimation();
        } else {
          // Idle state
          console.log('[AnimatedCharacter] Resetting to idle');
          currentSequence = sequences[mode].default;
          currentFrameIndex = 0;
          stopAnimation();
        }
      } else {
        // Start new animation
        const nextSequence = sequences[mode][corner];
        console.log(`[AnimatedCharacter] Starting animation for ${corner}. Frames: ${nextSequence?.length}`);
        
        if (nextSequence && nextSequence.length > 0) {
          currentSequence = nextSequence;
          isReverse = false;
          currentFrameIndex = 0;
          playAnimation();
        } else {
          console.error(`[AnimatedCharacter] Sequence not found or empty for ${corner}`);
        }
      }
    }
  }

  function playAnimation() {
    stopAnimation();
    
    // Frame duration (ms) - adjust to match CSS duration (0.3s total / 5 frames = 60ms)
    const frameDuration = 60; 
    
    console.log(`[AnimatedCharacter] Playing animation. Reverse: ${isReverse}, Frames: ${currentSequence.length}`);

    animationInterval = setInterval(() => {
      if (isReverse) {
        if (currentFrameIndex > 0) {
          currentFrameIndex--;
        } else {
          stopAnimation();
        }
      } else {
        if (currentFrameIndex < currentSequence.length - 1) {
          currentFrameIndex++;
        } else {
          stopAnimation();
        }
      }
    }, frameDuration);
  }

  function stopAnimation() {
    if (animationInterval) clearInterval(animationInterval);
  }

  onDestroy(() => {
    stopAnimation();
  });
</script>

<div class="hero-animation">
    {#if currentSequence.length > 0}
      <img 
        src={currentSequence[currentFrameIndex]} 
        class:invert={$theme === 'dark'}
        alt="Character Animation"
        class="hero-animation__img"
        on:mouseenter
        on:mouseleave
      />
    {/if}
  </div>

<style>
  .hero-animation {
    animation-name: hover;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    height: 35rem;
    width: 35rem;
    max-height: 100vh;
    max-width: 100vw;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @media screen and (max-width: 768px) {
    .hero-animation {
      height: 30rem;
      width: 30rem;
    }
  }

  @media screen and (max-width: 480px) {
    .hero-animation {
      height: 22rem;
      width: 22rem;
    }
  }

  .hero-animation__img {
    height: 100%;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    display: block;
    transition: filter 0.3s ease;
    /*background-color: rgba(255, 0, 0, 0.3); /* Debug: visualize hit area */
    clip-path: ellipse(22% 28% at 50% 50%); /* Trim hit area to face shape */
  }

  .hero-animation__img.invert {
    filter: invert(1);
    will-change: transform; /* Hint to browser to promote to layer */
  }
  
  @keyframes hover {
    0% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0); }
  }
</style>