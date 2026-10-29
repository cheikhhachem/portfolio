import { Body, Box, Quaternion, Vec3, World } from 'cannon-es';

type Position = [number, number, number];

export class CubePhysics {
  readonly taskKey = Symbol('cube physics');
  readonly world = new World({ gravity: new Vec3(0, 0, 0) });
  private cubes = new Set<ReturnType<CubePhysics['add']>>();
  private accumulator = 0;

  constructor() {
    this.world.defaultContactMaterial.friction = 0.15;
    this.world.defaultContactMaterial.restitution = 0.35;
  }

  add(position: Position, render: (body: Body) => void) {
    const shape = new Box(new Vec3(0.11, 0.11, 0.11));
    const body = new Body({ mass: 1, shape, position: new Vec3(...position), linearDamping: 0.1, angularDamping: 0.2 });
    const cube = { body, shape, target: new Vec3(...position), rotation: new Quaternion(), scale: 1, pinned: false, render };
    this.cubes.add(cube);
    this.world.addBody(body);
    return cube;
  }

  remove(cube: ReturnType<CubePhysics['add']>) {
    this.world.removeBody(cube.body);
    this.cubes.delete(cube);
  }

  step(delta: number) {
    const dt = 1 / 120;
    this.accumulator += Math.min(Math.max(delta, 0), 0.05);
    for (const cube of this.cubes) {
      const { body, shape } = cube;
      const halfSize = 0.11 * cube.scale;
      if (Math.abs(shape.halfExtents.x - halfSize) > 0.00001) {
        shape.halfExtents.set(halfSize, halfSize, halfSize);
        shape.updateConvexPolyhedronRepresentation();
        shape.updateBoundingSphereRadius();
        body.updateBoundingRadius();
        body.updateMassProperties();
        body.aabbNeedsUpdate = true;
      }
      const type = cube.pinned ? Body.KINEMATIC : Body.DYNAMIC;
      if (body.type !== type) {
        body.type = type;
        body.updateMassProperties();
        body.velocity.setZero();
        body.angularVelocity.setZero();
      }
      if (cube.pinned) {
        body.position.copy(cube.target);
        body.quaternion.copy(cube.rotation);
        body.aabbNeedsUpdate = true;
      }
    }
    while (this.accumulator >= dt) {
      for (const cube of this.cubes) {
        if (cube.pinned) continue;
        const { body, target, rotation } = cube;
        // Springs retain the animated layout while contacts can displace each box.
        body.force.set(
          60 * (target.x - body.position.x) - 12 * body.velocity.x,
          60 * (target.y - body.position.y) - 12 * body.velocity.y,
          60 * (target.z - body.position.z) - 12 * body.velocity.z
        );
        const error = rotation.mult(body.quaternion.conjugate());
        const sign = error.w < 0 ? -1 : 1;
        body.torque.set(
          0.5 * sign * error.x - 0.045 * body.angularVelocity.x,
          0.5 * sign * error.y - 0.045 * body.angularVelocity.y,
          0.5 * sign * error.z - 0.045 * body.angularVelocity.z
        );
      }
      this.world.step(dt);
      this.accumulator -= dt;
    }
    for (const cube of this.cubes) cube.render(cube.body);
  }
}
