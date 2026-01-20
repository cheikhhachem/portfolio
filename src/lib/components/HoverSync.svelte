<script lang="ts">
  import { useThrelte } from '@threlte/core';
  import { Vector3 } from 'three';
  import { onMount, onDestroy } from 'svelte';
  
  export let iconRefs: any[];
  export let hoverSquares: HTMLDivElement[];
  
  const threlte = useThrelte();
  
  const tempVector = new Vector3();
  let animationFrame: number;
  
  function updatePositions() {
    const renderer = threlte.renderer;
    const camera = threlte.camera.current;
    
    if (!iconRefs || !hoverSquares || !camera || !renderer) {
      animationFrame = requestAnimationFrame(updatePositions);
      return;
    }
    
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const widthHalf = rect.width / 2;
    const heightHalf = rect.height / 2;
    
    iconRefs.forEach((iconRef, i) => {
      if (!iconRef || !hoverSquares[i]) return;
      
      // Get the icon's world position
      const mesh = iconRef.getMesh?.();
      if (!mesh) return;
      
      mesh.getWorldPosition(tempVector);
      
      // Project to screen space
      tempVector.project(camera);
      
      // Convert to pixel coordinates
      const x = (tempVector.x * widthHalf) + widthHalf;
      const y = -(tempVector.y * heightHalf) + heightHalf;
      
      // Position the hover square (centered on the cube)
      const square = hoverSquares[i];
      const squareSize = parseFloat(getComputedStyle(square).width) || 60;
      square.style.left = `${x - squareSize / 2}px`;
      square.style.top = `${y - squareSize / 2}px`;
    });
    
    animationFrame = requestAnimationFrame(updatePositions);
  }
  
  onMount(() => {
    updatePositions();
  });
  
  onDestroy(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });
</script>
