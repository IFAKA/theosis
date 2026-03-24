import { Map as ROTMap, RNG } from 'rot-js';

export type TileType = 'wall' | 'floor';
export type DungeonMap = Map<string, TileType>;

export type GeneratorResult = {
  map: DungeonMap;
  width: number;
  height: number;
  rooms: Array<{ cx: number; cy: number }>;
  playerStart: { x: number; y: number };
  exitPos: { x: number; y: number };
};

export function generateDungeon(width = 60, height = 25, seed?: number): GeneratorResult {
  if (seed !== undefined) RNG.setSeed(seed);

  const map: DungeonMap = new Map();
  const digger = new ROTMap.Digger(width, height);

  digger.create((x, y, value) => {
    map.set(`${x},${y}`, value === 0 ? 'floor' : 'wall');
  });

  const rotRooms = digger.getRooms();
  const rooms = rotRooms.map(r => ({
    cx: Math.floor((r.getLeft() + r.getRight()) / 2),
    cy: Math.floor((r.getTop() + r.getBottom()) / 2),
  }));

  const playerStart = rooms.length > 0
    ? { x: rooms[0].cx, y: rooms[0].cy }
    : { x: 1, y: 1 };

  const exitPos = rooms.length > 1
    ? { x: rooms[rooms.length - 1].cx, y: rooms[rooms.length - 1].cy }
    : { x: width - 2, y: height - 2 };

  return { map, width, height, rooms, playerStart, exitPos };
}
