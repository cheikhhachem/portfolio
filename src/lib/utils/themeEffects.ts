export const CUBE_EXIT_MS = 420;
export const CUBE_ENTER_MS = 520;
export const LIQUID_REVEAL_MS = 780;
export type Position = [number, number, number];
export type CubeFlight = { points: [Position, Position, Position, Position]; delay: number };

export function createCubeFlight(from: Position, to: Position, random = Math.random): CubeFlight {
  const control = (amount: number): Position => [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount + (random() - 0.5) * 2.2,
    from[2] + (to[2] - from[2]) * amount + (random() - 0.5) * 0.6
  ];
  return { points: [[...from], control(0.3), control(0.72), [...to]], delay: random() * 90 };
}

export function sampleCubeFlight(flight: CubeFlight, elapsed: number, duration: number, returning: boolean): Position {
  const progress = Math.max(0, Math.min(1, (elapsed - flight.delay) / (duration - 90)));
  const t = returning ? 1 - (1 - progress) ** 3 : progress * progress * (3 - 2 * progress);
  const u = 1 - t;
  const [a, b, c, d] = flight.points;
  return ([0, 1, 2] as const).map(i => u**3 * a[i] + 3*u*u*t * b[i] + 3*u*t*t * c[i] + t**3 * d[i]) as Position;
}

// Same cubic commands in every frame let the browser morph this soft, rippling
// outline. Its origin is just below the bottom-center theme switch.
export function liquidPath(width: number, height: number, progress: number): string {
  const cx = width / 2;
  const cy = height + 12;
  const radius = Math.hypot(cx, cy) * 1.36 * progress;
  const points: [number, number][] = Array.from({ length: 12 }, (_, i) => {
    const angle = i * Math.PI / 6;
    const ripple = 1 + 0.075 * Math.sin(angle * 3 + progress * 7) + 0.04 * Math.sin(angle * 5 - progress * 12);
    return [cx + Math.cos(angle) * radius * ripple, cy + Math.sin(angle) * radius * ripple];
  });
  const point = (i: number) => points[(i + points.length) % points.length]!;
  const n = (value: number) => value.toFixed(2);
  let path = `M ${n(point(0)[0])} ${n(point(0)[1])}`;
  for (let i = 0; i < points.length; i++) {
    const previous = point(i - 1);
    const current = point(i);
    const next = point(i + 1);
    const following = point(i + 2);
    path += ` C ${n(current[0] + (next[0] - previous[0]) / 6)} ${n(current[1] + (next[1] - previous[1]) / 6)}`;
    path += ` ${n(next[0] - (following[0] - current[0]) / 6)} ${n(next[1] - (following[1] - current[1]) / 6)}`;
    path += ` ${n(next[0])} ${n(next[1])}`;
  }
  return `path('${path} Z')`;
}

export function liquidKeyframes(width: number, height: number): Keyframe[] {
  return Array.from({ length: 25 }, (_, i) => ({ clipPath: liquidPath(width, height, i / 24), offset: i / 24 }));
}
