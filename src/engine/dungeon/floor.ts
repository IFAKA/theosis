import { generateDungeon } from './generator.js';
import type { GeneratorResult } from './generator.js';

export type EnemyOnFloor = {
  id: string;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
};

export type FloorState = {
  map: GeneratorResult;
  enemies: EnemyOnFloor[];
  playerX: number;
  playerY: number;
  floorNumber: number;
  exitReached: boolean;
};

export function createFloor(floorNumber: number, seed?: number): FloorState {
  const map = generateDungeon(60, 25, seed);
  return {
    map,
    enemies: [],
    playerX: map.playerStart.x,
    playerY: map.playerStart.y,
    floorNumber,
    exitReached: false,
  };
}

export function isExitReached(floor: FloorState): boolean {
  return (
    floor.playerX === floor.map.exitPos.x &&
    floor.playerY === floor.map.exitPos.y
  );
}
