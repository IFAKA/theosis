import { FOV } from 'rot-js';
import type { DungeonMap } from './generator.js';

export type VisibleTiles = Set<string>;

export function computeFOV(
  map: DungeonMap,
  originX: number,
  originY: number,
  radius = 8
): VisibleTiles {
  const visible: VisibleTiles = new Set();
  const fov = new FOV.PreciseShadowcasting((x, y) => map.get(`${x},${y}`) === 'floor');
  fov.compute(originX, originY, radius, (x, y) => {
    visible.add(`${x},${y}`);
  });
  return visible;
}
