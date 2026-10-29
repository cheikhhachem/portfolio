<script lang="ts">
  import { useTask } from '@threlte/core';
  import type { CubePhysics } from '../utils/cubePhysics';

  export let physics: CubePhysics;
  useTask(physics.taskKey, (delta) => physics.step(delta));
</script>
