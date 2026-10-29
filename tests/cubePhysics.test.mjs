// Run with Node 22.18+: node --test tests/cubePhysics.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { CubePhysics } from '../src/lib/utils/cubePhysics.ts';

test('solid cubes collide, grow on hover, recover their layout, and clean up', () => {
  const physics = new CubePhysics();
  const left = physics.add([-0.3, 0, 0], () => {});
  const right = physics.add([0.3, 0, 0], () => {});
  let contacts = 0;
  left.body.addEventListener('collide', () => contacts++);

  // Force both cubes toward the same point: contacts must stop interpenetration.
  left.target.setZero();
  right.target.setZero();
  for (let i = 0; i < 240; i++) physics.step(1 / 120);
  assert.ok(contacts > 0);
  assert.ok(left.body.position.distanceTo(right.body.position) > 0.21);

  // A hovered cube stays under the pointer and its collider grows with the mesh.
  left.pinned = true;
  left.target.copy(left.body.position);
  left.scale = 1.3;
  for (let i = 0; i < 120; i++) physics.step(1 / 120);
  assert.ok(left.body.position.almostEquals(left.target));
  assert.ok(Math.abs(left.shape.halfExtents.x - 0.143) < 1e-8);
  assert.ok(left.body.position.distanceTo(right.body.position) > 0.24);

  left.pinned = false;
  left.scale = 1;
  left.target.set(-0.3, 0, 0);
  right.target.set(0.3, 0, 0);
  for (let i = 0; i < 300; i++) physics.step(i % 2 ? 1 / 30 : 1 / 144);
  assert.ok(left.body.position.distanceTo(left.target) < 0.01);
  assert.ok(right.body.position.distanceTo(right.target) < 0.01);

  physics.remove(left);
  physics.remove(right);
  assert.equal(physics.world.bodies.length, 0);
});

test('eight spinning boxes remain stable through orbit and hover transitions', () => {
  const physics = new CubePhysics();
  const cubes = Array.from({ length: 8 }, (_, i) => physics.add([i < 4 ? -1.1 : 1.1, 0.532 * (1.5 - i % 4), 0], () => {}));
  let time = 0;
  let contacts = 0;
  for (const cube of cubes) cube.body.addEventListener('collide', () => contacts++);
  for (let frame = 0; frame < 2400; frame++) {
    const delta = frame % 9 === 0 ? 0.04 : 1 / 60;
    time += delta * 0.33;
    cubes.forEach((cube, i) => {
      const orbit = frame % 600 < 300;
      cube.pinned = !orbit && i === 0;
      cube.scale = orbit || cube.pinned ? 1.3 : 1;
      if (!cube.pinned) {
        const angle = time * 0.8 + i * Math.PI / 4;
        cube.target.set(orbit ? Math.cos(angle) * 0.85 : i < 4 ? -1.1 : 1.1, orbit ? Math.sin(angle) * 1.2 : 0.532 * (1.5 - i % 4), Math.sin(time * 2) * 0.3);
      }
      cube.rotation.setFromEuler(time * (i + 1), time, time * 0.5, 'XYZ');
    });
    physics.step(delta);
    for (const { body } of cubes) {
      assert.ok(Number.isFinite(body.position.length()));
      assert.ok(body.position.length() < 3);
      assert.ok(Math.abs(Math.hypot(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w) - 1) < 1e-5);
    }
  }
  assert.ok(contacts > 0, 'orbit transitions must exercise collisions');
});
