<script lang="ts">
  import { activeCorner, navigation, visibleCorner, type Corner } from '../stores/navigation';
  import { language } from '../stores/language';
  import { t } from '../utils/translations';
  import { onMount } from 'svelte';
  import CornerButton from './CornerButton.svelte';
  import AboutContent from './AboutContent.svelte';
  import ExperienceContent from './ExperienceContent.svelte';
  import ProjectsContent from './ProjectsContent.svelte';
  import ContactContent from './ContactContent.svelte';

  type ContentPanel = Exclude<Corner, ''>;

  /**
   * MOBILE SCALE FACTOR - Adjust this value to resize all mobile sections
   * 
   * Values:
   * - 1.0 = 100% (normal size)
   * - 0.8 = 80% (recommended for most phones)
   * - 0.7 = 70% (smaller, more content fits)
   * - 0.6 = 60% (very compact)
   * - 0.5 = 50% (very small, use carefully)
   * 
   * This affects all fonts, padding, margins, and element sizes on mobile screens
   */
  const MOBILE_SCALE_FACTOR = 0.65;

  let windowWidth = 0;

  function togglePanel(corner: ContentPanel) {
    activeCorner.toggle(corner);
  }

  function isActive(corner: ContentPanel): boolean {
    return $visibleCorner === corner;
  }

  function panelTransitionEnd(event: TransitionEvent) {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
    const corner = (event.currentTarget as HTMLDivElement).dataset.corner as ContentPanel;
    activeCorner.panelFinished(corner);
  }

  onMount(() => {
    windowWidth = window.innerWidth;
    
    const handleResize = () => {
      windowWidth = window.innerWidth;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

<svelte:window bind:innerWidth={windowWidth} />

<nav id="grid" style="--mobile-scale: {MOBILE_SCALE_FACTOR}">
  <!-- Top Left - About -->
  <CornerButton
    corner="top-left"
    title={t($language, 'about')}
    isActive={$navigation.target === 'top-left' || $navigation.corner === 'top-left'}
    onClick={() => togglePanel('top-left')}
  />
  <div 
    class="content-panel top-left"
    data-corner="top-left"
    class:closing={$navigation.phase === 'closing' && $navigation.corner === 'top-left'}
    on:transitionend={panelTransitionEnd}
    class:active={isActive('top-left')}
    class:mobile={windowWidth <= 1100}
  >
    <AboutContent />
  </div>

  <!-- Top Right - Experience -->
  <CornerButton
    corner="top-right"
    title={t($language, 'experience')}
    isActive={$navigation.target === 'top-right' || $navigation.corner === 'top-right'}
    onClick={() => togglePanel('top-right')}
  />
  <div 
    class="content-panel top-right"
    data-corner="top-right"
    class:closing={$navigation.phase === 'closing' && $navigation.corner === 'top-right'}
    on:transitionend={panelTransitionEnd}
    class:active={isActive('top-right')}
    class:mobile={windowWidth <= 1100}
  >
    <ExperienceContent />
  </div>

  <!-- Bottom Left - Projects -->
  <CornerButton
    corner="bottom-left"
    title={t($language, 'projects')}
    isActive={$navigation.target === 'bottom-left' || $navigation.corner === 'bottom-left'}
    onClick={() => togglePanel('bottom-left')}
  />
  <div 
    class="content-panel bottom-left"
    data-corner="bottom-left"
    class:closing={$navigation.phase === 'closing' && $navigation.corner === 'bottom-left'}
    on:transitionend={panelTransitionEnd}
    class:active={isActive('bottom-left')}
    class:mobile={windowWidth <= 1100}
  >
    <ProjectsContent />
  </div>

  <!-- Bottom Right - Contact -->
  <CornerButton
    corner="bottom-right"
    title={t($language, 'contact')}
    isActive={$navigation.target === 'bottom-right' || $navigation.corner === 'bottom-right'}
    onClick={() => togglePanel('bottom-right')}
  />
  <div 
    class="content-panel bottom-right"
    data-corner="bottom-right"
    class:closing={$navigation.phase === 'closing' && $navigation.corner === 'bottom-right'}
    on:transitionend={panelTransitionEnd}
    class:active={isActive('bottom-right')}
    class:mobile={windowWidth <= 1100}
  >
    <ContactContent />
  </div>
</nav>

<style>
  #grid {
    position: absolute;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    pointer-events: none;
  }

  #grid > :global(*) {
    pointer-events: auto;
  }

  .content-panel {
    position: fixed;
    text-align: center;
    transition: transform 0.3s ease-in-out;
    color: var(--text);
    width: 30vw;
    min-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    background: transparent;
    z-index: 100;
    padding: 1rem;
    box-sizing: border-box;
  }

  /* Top Left */
  .content-panel.top-left {
    top: 10vh;
    left: 0;
    transform: translateX(-100vw) translateY(-100vh);
  }

  .content-panel.top-left.active {
    transform: translateX(5vw) translateY(0);
  }

  /* Top Right */
  .content-panel.top-right {
    top: 10vh;
    right: 0;
    transform: translateX(100vw) translateY(-100vh);
  }

  .content-panel.top-right.active {
    transform: translateX(-5vw) translateY(0);
  }

  /* Bottom Left */
  .content-panel.bottom-left {
    bottom: 5vh;
    left: 0;
    transform: translateX(-100vw) translateY(100vh);
  }

  .content-panel.bottom-left.active {
    transform: translateX(5vw) translateY(0);
  }

  /* Bottom Right */
  .content-panel.bottom-right {
    bottom: 10vh;
    right: 0;
    transform: translateX(100vw) translateY(100vh);
  }

  .content-panel.bottom-right.active {
    transform: translateX(-5vw) translateY(0);
  }

  /* Mobile styles */
  @media screen and (max-width: 1100px) {
    .content-panel {
      width: 90vw;
      min-width: auto;
      padding: 0.5rem;
      font-size: calc(1rem * var(--mobile-scale));
    }

    .content-panel.mobile.active,
    .content-panel.mobile.closing {
      width: 100vw;
      height: 100vh;
      max-height: 100vh;
      top: 0 !important;
      left: 0 !important;
      right: auto !important;
      bottom: auto !important;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-transparent);
      z-index: 200;
      padding: calc(1rem * var(--mobile-scale));
      overflow-y: auto;
    }
  }

  .content-panel.mobile.active {
    transform: translateX(0) translateY(0) !important;
  }

  @media screen and (max-width: 768px) {
    .content-panel {
      min-width: 300px;
      font-size: calc(0.9rem * var(--mobile-scale));
    }
  }
</style>
