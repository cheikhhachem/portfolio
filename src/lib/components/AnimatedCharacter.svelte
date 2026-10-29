<script lang="ts">
  import { onDestroy } from 'svelte';
  import { activeCorner, type Corner } from '../stores/navigation';
  import { theme } from '../stores/theme';

  const frames = import.meta.glob('../../assets/face-animation-light/*.png', {
    eager: true, query: '?url', import: 'default'
  }) as Record<string, string>;

  function sequence(prefix: string) {
    return Object.keys(frames)
      .filter(path => path.split('/').pop()?.startsWith(`${prefix}-`))
      .sort()
      .map(path => frames[path]!);
  }

  const sequences = {
    'top-left': sequence('tl'), 'top-right': sequence('tr'),
    'bottom-left': sequence('bl'), 'bottom-right': sequence('br')
  };
  let currentSequence = sequences['top-left'];
  let currentFrameIndex = 0;
  let animationInterval: ReturnType<typeof setInterval> | undefined;

  function animate(corner: Corner) {
    clearInterval(animationInterval);
    if (corner) {
      currentSequence = sequences[corner];
      currentFrameIndex = 0;
    }
    const reverse = corner === '';
    animationInterval = setInterval(() => {
      if (reverse ? currentFrameIndex > 0 : currentFrameIndex < currentSequence.length - 1) {
        currentFrameIndex += reverse ? -1 : 1;
      } else {
        clearInterval(animationInterval);
        activeCorner.faceFinished(corner);
      }
    }, 60);
  }

  $: animate($activeCorner);
  onDestroy(() => clearInterval(animationInterval));
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
    pointer-events: auto;
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