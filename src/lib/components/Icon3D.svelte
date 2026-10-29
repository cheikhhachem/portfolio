<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { spring } from 'svelte/motion';
  import { Texture, RepeatWrapping, type Mesh, type Group, BoxGeometry, EdgesGeometry } from 'three';
  import { onMount, onDestroy } from 'svelte';
  import type { CubePhysics } from '../utils/cubePhysics';

  // Shared geometry for all icons to improve performance
  const geometry = new BoxGeometry(0.22, 0.22, 0.22);
  const edgesGeometry = new EdgesGeometry(geometry);
  
  export let iconPath: string;
  export let basePosition: [number, number, number];
  export let index: number;
  export let hovered = false;
  export let masterHover = false;
  export let rotationSpeed: number;
  export let physics: CubePhysics;
  export let isDark = false;
  
  let meshRef: Mesh;
  let groupRef: Group;
  const cube = physics.add(basePosition, (body) => {
    if (!groupRef) return;
    groupRef.position.copy(body.position);
    groupRef.quaternion.copy(body.quaternion);
  });
  onDestroy(() => physics.remove(cube));
  let loadedTexture: Texture | null = null;
  
  // Expose mesh for position tracking
  export function getMesh() {
    return meshRef;
  }
  
  let time = 0;
  
  // Rotation and growth keep their original easing; position is now physical.
  const rotation = spring<[number, number, number]>([0, 0, 0], { stiffness: 0.1, damping: 0.4 });
  const scale = spring(1, { stiffness: 0.15, damping: 0.5 });
  
  let loadedImage: HTMLImageElement | null = null;
  
  // Load image and create texture once on mount
  onMount(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImage = img;
      createTexture();
    };
    img.src = iconPath;
    return () => {
      img.onload = null;
      loadedTexture?.dispose();
    };
  });
  
  // Recreate texture when theme changes to invert colors
  $: if (loadedImage && (isDark !== undefined)) {
    createTexture();
  }
  
  function createTexture() {
    if (!loadedImage) return;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // High resolution canvas
    const squareSize = 512;
    canvas.width = squareSize;
    canvas.height = squareSize;
    
    // Calculate scaling to cover the inner square
    const padding = 0; 
    const innerSize = squareSize - padding * 2;
    const scale = Math.max(innerSize / loadedImage.width, innerSize / loadedImage.height);
    const scaledWidth = loadedImage.width * scale;
    const scaledHeight = loadedImage.height * scale;
    
    // Center the scaled image
    const offsetX = padding + (innerSize - scaledWidth) / 2;
    const offsetY = padding + (innerSize - scaledHeight) / 2;
    
    // Draw background and icon
    if (isDark) {
      ctx.fillStyle = '#202124';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Invert icon only
      ctx.save();
      ctx.filter = 'invert(1)';
      ctx.drawImage(loadedImage, offsetX, offsetY, scaledWidth, scaledHeight);
      ctx.restore();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(loadedImage, offsetX, offsetY, scaledWidth, scaledHeight);
    }
    
    // Create texture from canvas
    const texture = new Texture(canvas);
    texture.needsUpdate = true;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.colorSpace = 'srgb';
    texture.magFilter = 1006; // THREE.LinearFilter
    texture.minFilter = 1006; // THREE.LinearFilter
    texture.anisotropy = 16;
    loadedTexture?.dispose();
    loadedTexture = texture;
  }
  
  // Random offsets for variety
  const offsetX = (Math.random() - 0.5) * 0.3;
  const offsetY = (Math.random() - 0.5) * 0.3;
  
  // Capture the physical position for freeze-on-hover
  let hoverPosition: [number, number, number] | null = null;

  // Use Threlte's useTask for animation loop instead of requestAnimationFrame
  useTask((delta) => {
    time += Math.min(delta, 0.05) * 0.33;
    cube.pinned = hovered && !masterHover;
    
    if (hovered && !masterHover) {
      // Individual hover: freeze, scale up, fast spin
      if (!hoverPosition) {
        hoverPosition = [cube.body.position.x, cube.body.position.y, cube.body.position.z];
      }
      cube.target.set(...hoverPosition);
      
      rotation.set([
        time * rotationSpeed * 8,
        time * rotationSpeed * 8,
        time * rotationSpeed * 8
      ]);
      scale.set(1.3);
    } else if (masterHover) {
      // Master hover: oval orbit around center
      hoverPosition = null;
      
      const angle = time * 0.8 + index * (Math.PI / 4);
      const radiusX = 0.85;
      const radiusY = 1.2;
      
      const orbitPos: [number, number, number] = [
        Math.cos(angle) * radiusX,
        Math.sin(angle) * radiusY,
        basePosition[2] + Math.sin(time * 2) * 0.3
      ];
      
      cube.target.set(...orbitPos);
      
      rotation.set([
        Math.sin(time * 2 + index) * 0.5,
        time * rotationSpeed * 4,
        Math.cos(time * 2 + index) * 0.5
      ]);
      scale.set(1.3);
    } else {
      // Reset hover capture
      hoverPosition = null;

      // Normal floating animation
      const newPos: [number, number, number] = [
        basePosition[0] + Math.sin(time * 1.5 + index * 2) * 0.05 + Math.sin(time + index * Math.PI) * 0.1 + offsetX,
        basePosition[1] + Math.sin(time * 2 + index) * 0.1 + offsetY,
        basePosition[2] + Math.cos(time * 1.5 + index * 2) * 0.05
      ];
      cube.target.set(...newPos);
      
      rotation.set([
        time * rotationSpeed,
        time * rotationSpeed,
        time * rotationSpeed
      ]);
      scale.set(1);
    }
    cube.rotation.setFromEuler(...$rotation, 'XYZ');
    cube.scale = $scale;
  }, { before: physics.taskKey });
  
  // Edge line color based on theme
  $: edgeColor = isDark ? 0xFFFFFF : 0x000000;
  
  // Define edge offsets for thick lines
  const edgeOffsets = [
    { x: 0, y: 0 }, { x: 0.002, y: 0.002 }, { x: -0.002, y: -0.002 },
    { x: 0.004, y: 0.004 }, { x: -0.004, y: -0.004 }, { x: 0.002, y: -0.002 },
    { x: -0.002, y: 0.002 }, { x: 0.004, y: 0 }, { x: -0.004, y: 0 },
    { x: 0, y: 0.004 }, { x: 0, y: -0.004 }
  ];
</script>

  <T.Group
    bind:ref={groupRef}
    position={basePosition}
    scale={$scale}
  >
    {#if loadedTexture}
      <T.Mesh bind:ref={meshRef} geometry={geometry}>
        <T.MeshBasicMaterial 
          map={loadedTexture}
          transparent={false}
          toneMapped={false}
        />
      </T.Mesh>
      
      <!-- Thick edges using multiple offset LineSegments -->
      {#each edgeOffsets as offset}
        <T.LineSegments 
          geometry={edgesGeometry}
          position={[offset.x, offset.y, 0]}
        >
          <T.LineBasicMaterial color={edgeColor} />
        </T.LineSegments>
      {/each}
    {/if}
  </T.Group>