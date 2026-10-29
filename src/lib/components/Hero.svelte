<script lang="ts">
  import { language } from '../stores/language';
  import { t } from '../utils/translations';
  import AnimatedCharacter from './AnimatedCharacter.svelte';
  import Icons3DScene from './Icons3DScene.svelte';

  import SnakeGame from './SnakeGame.svelte';

  let hovered = false;
  let gameOpen = false;
  const secret = [4, 2, 6, 5];
  let secretProgress = 0;

  function enterCube(number: number) {
    secretProgress = number === secret[secretProgress]
      ? secretProgress + 1
      : number === secret[0] ? 1 : 0;
  }

  function enterHead() {
    if (secretProgress === secret.length) gameOpen = true;
    secretProgress = 0;
  }
</script>

<div class="hero-wrapper">
  <div class="three-d-background">
    <Icons3DScene masterHover={hovered} onCubeEnter={enterCube} />
  </div>
  
  <div id="hero"
    role="region"
    aria-label="Hero section"
  >
    <h5 class:hero-hovered={hovered}>{t($language, 'greeting')}</h5>
    <h1 class:hero-hovered={hovered}>{t($language, 'name')}</h1>
    <p class:hero-hovered={hovered}>{t($language, 'role')}</p>
    <button type="button" class="head-trigger" aria-label="Animated character" on:click={enterHead}>
      <AnimatedCharacter
        on:mouseenter={() => { hovered = true; enterHead(); }}
        on:mouseleave={() => { hovered = false; }}
      />
    </button>
  </div>
</div>

{#if gameOpen}
  <SnakeGame onClose={() => { gameOpen = false; hovered = false; }} />
{/if}

<style>
  .head-trigger {
    display: block;
    margin: auto;
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    cursor: pointer;
    pointer-events: none;
  }
  .head-trigger:focus-visible { outline: 2px solid var(--text); outline-offset: 4px; }
  .hero-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }
  
  .three-d-background {
    position: absolute;
    top: 5%;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 1.0;
    pointer-events: auto;
  }
  
  #hero {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    overflow: visible; /* allow floating/hovered text to show fully */
    z-index: 2;
    pointer-events: none;
  }

  @keyframes heroFloat {
    0% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-10px) scale(1.03); }
    100% { transform: translateY(0) scale(1); }
  }

  @keyframes heroFloatPause {
    0% {
      /* Start from current float position */
      /* This will be overridden by browser, but helps with intent */
    }
    100% {
      transform: scale(1.13) rotate(-2deg);
    }
  }

  #hero h5,
  #hero h1,
  #hero p {
    position: relative;
    transition: transform 0.3s ease;
    animation: heroFloat 3.2s ease-in-out infinite;
    will-change: transform;
    transition: transform 0.4s cubic-bezier(.4,2,.3,1), filter 0.4s cubic-bezier(.4,2,.3,1), animation 0.4s cubic-bezier(.4,2,.3,1);
  }

  #hero h5 {
    font-size: 1.2rem;
    font-weight: 400;
  }

  #hero h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0.5rem 0;
  }

  #hero p {
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--text);
    opacity: 0.8;
  }

  #hero h5.hero-hovered,
  #hero h1.hero-hovered,
  #hero p.hero-hovered {
    animation: heroFloatPause 0.4s forwards;
    transform: scale(1.13) rotate(-2deg);
    filter: drop-shadow(0 2px 8px var(--text));
    transition: transform 0.4s cubic-bezier(.4,2,.3,1), filter 0.4s cubic-bezier(.4,2,.3,1), animation 0.4s cubic-bezier(.4,2,.3,1);
  }

  @media screen and (max-width: 768px) {
    #hero h1 {
      font-size: 2rem;
    }
    
    #hero h5, #hero p {
      font-size: 1rem;
    }
  }

  @media screen and (max-width: 480px) {
    #hero h1 {
      font-size: 1.5rem;
      margin: 0.25rem 0;
    }
    
    #hero h5 {
      font-size: 0.9rem;
    }
    
    #hero p {
      font-size: 0.9rem;
    }
  }
</style>
