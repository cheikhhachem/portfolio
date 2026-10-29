<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import Icon3D from './Icon3D.svelte';
  import CubePhysicsStep from './CubePhysicsStep.svelte';
  import { CubePhysics } from '../utils/cubePhysics';

  import HoverSync from './HoverSync.svelte';
  import { theme } from '../stores/theme';
  import { onMount } from 'svelte';
  import { Color, WebGLRenderer } from 'three';
  import lang1 from '../../assets/icons-lang/lang1.png';
  import lang2 from '../../assets/icons-lang/lang2.png';
  import lang3 from '../../assets/icons-lang/lang3.png';
  import lang4 from '../../assets/icons-lang/lang4.png';
  import lang5 from '../../assets/icons-lang/lang5.png';
  import lang6 from '../../assets/icons-lang/lang6.png';
  import lang7 from '../../assets/icons-lang/lang7.png';
  import lang8 from '../../assets/icons-lang/lang8.png';
  
  const physics = new CubePhysics();

  export let masterHover = false;
  export let onCubeEnter: (number: number) => void = () => {};
  let hoveredIndex = -1;
  let iconRefs: any[] = [];
  let hoverSquares: HTMLButtonElement[] = [];
  
  // Background color based on theme
  $: backgroundColor = new Color($theme === 'dark' ? '#202124' : '#ffffff');
  
  // 4 left, 4 right vertical stack layout
  // Adjust positions based on screen size
  let isSmallScreen = false;
  
  function updateScreenSize() {
    isSmallScreen = window.innerWidth < 768;
  }
  
  onMount(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  });
  
  // Responsive vertical stack layout for icons
  const iconImages = [lang1, lang2, lang3, lang4, lang5, lang6, lang7, lang8];
  
  // 4 left, 4 right vertical stack layout
  function getSideStackPositions(countPerSide: number, xOffset: number, ySpread: number) {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < countPerSide; i++) {
      const y = ySpread * ((countPerSide - 1) / 2 - i);
      positions.push([xOffset, y, 0]);
    }
    return positions;
  }
  
  $: leftX = isSmallScreen ? -1 : -1.1;
  $: rightX = isSmallScreen ? 1 : 1.1;
  
  // Dynamically calculate minimum vertical spacing based on cube size and add margin
  const CUBE_SIZE = 0.22; // must match Icon3D.svelte
  const CUBE_MARGIN = 0.15; // extra margin between cubes

  function getDynamicYSpread(countPerSide: number, isSmall: boolean) {
    // Total height needed for all cubes and margins
    const totalHeight = countPerSide * CUBE_SIZE + (countPerSide - 1) * CUBE_MARGIN;
    // Spread so cubes are centered vertically
    return totalHeight / (countPerSide - 1) * (isSmall ? 1 : 1.2);
  }

  $: ySpread = getDynamicYSpread(4, isSmallScreen);
  
  $: leftPositions = getSideStackPositions(4, leftX, ySpread);
  $: rightPositions = getSideStackPositions(4, rightX, ySpread);
  $: iconPositions = [...leftPositions, ...rightPositions];
  
  $: icons = iconImages.map((img, i) => ({
    path: img,
    position: iconPositions[i],
    rotationSpeed: 0.3 + 0.15 * (i % 4)
  }));
</script>

<div class="scene-container">
  <!-- Hover squares for each icon -->
  {#each icons as _, i}
    <button
      type="button"
      aria-label={`Cube ${i + 1}`}
      class="hover-square"
      class:disabled={masterHover}
      bind:this={hoverSquares[i]}
      on:pointerenter={(event) => {
        hoveredIndex = i;
        if (event.pointerType !== 'touch') onCubeEnter(i + 1);
      }}
      on:pointerdown={(event) => {
        if (event.pointerType === 'touch') onCubeEnter(i + 1);
      }}
      on:keydown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onCubeEnter(i + 1);
        }
      }}
      on:mouseleave={() => hoveredIndex = -1}
    ></button>
  {/each}
  
  <Canvas createRenderer={(canvas) => new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', precision: 'mediump', alpha: true })} dpr={Math.min(window.devicePixelRatio, 2)}>
    <T.PerspectiveCamera makeDefault position={[0, 0, 7]} fov={50}>
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </T.PerspectiveCamera>
    
    <T.Scene background={backgroundColor} />
    
    <T.AmbientLight intensity={0.6} />
    <T.DirectionalLight position={[3, 3, 5]} intensity={0.8} />
    
    {#each icons as icon, i}
      <Icon3D 
        iconPath={icon.path}
        basePosition={icon.position}
        index={i}
        rotationSpeed={icon.rotationSpeed}
        {physics}
        hovered={hoveredIndex === i}
        {masterHover}
        isDark={$theme === 'dark'}
        bind:this={iconRefs[i]}
      />
    {/each}
    
    <CubePhysicsStep {physics} />

    <!-- Sync hover squares with 3D positions -->
    <HoverSync {iconRefs} {hoverSquares} />
  </Canvas>
</div>

<style>
  .scene-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 600px;
  }
  
  .hover-square {
    position: absolute;
    padding: 0;
    border: 0;
    background: transparent;
    width: 60px;
    height: 60px;
    pointer-events: auto;
    cursor: pointer;
    z-index: 12;
    border-radius: 8px;
    /* Debug: uncomment to see hover areas */
    /* background: rgba(255, 0, 0, 0.2); */
    /* border: 2px solid red; */
  }

  .hover-square.disabled {
    pointer-events: none;
  }
  
  @media screen and (max-width: 768px) {
    .scene-container {
      min-height: 400px;
    }
    
    .hover-square {
      width: 50px;
      height: 50px;
    }
  }
</style>
