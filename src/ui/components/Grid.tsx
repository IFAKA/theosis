import React from 'react';
import { Box, Text } from 'ink';
import type { GeneratorResult } from '../../engine/dungeon/generator.js';
import type { EnemyOnFloor } from '../../engine/dungeon/floor.js';
import type { VisibleTiles } from '../../engine/dungeon/fov.js';

type GridProps = {
  map: GeneratorResult;
  playerX: number;
  playerY: number;
  enemies: EnemyOnFloor[];
  visibleTiles: VisibleTiles;
  width: number;
  height: number;
};

export function Grid({ map, playerX, playerY, enemies, visibleTiles, width, height }: GridProps) {
  const enemyMap = new Map(enemies.map(e => [`${e.x},${e.y}`, e]));

  const rows: React.ReactNode[] = [];
  for (let y = 0; y < height; y++) {
    const cells: React.ReactNode[] = [];
    for (let x = 0; x < width; x++) {
      const key = `${x},${y}`;
      const visible = visibleTiles.has(key);

      if (!visible) {
        cells.push(<Text key={key}> </Text>);
        continue;
      }

      if (x === playerX && y === playerY) {
        cells.push(<Text key={key} color="#d4af37" bold>@</Text>);
      } else if (enemyMap.has(key)) {
        cells.push(<Text key={key} color="#f87171">ε</Text>);
      } else if (map.exitPos.x === x && map.exitPos.y === y) {
        cells.push(<Text key={key} color="#00d9ff">{'>'}</Text>);
      } else {
        const tile = map.map.get(key);
        if (tile === 'wall') {
          cells.push(<Text key={key} color="#555555">#</Text>);
        } else {
          cells.push(<Text key={key} color="#333333">.</Text>);
        }
      }
    }
    rows.push(<Box key={y}>{cells}</Box>);
  }

  return <Box flexDirection="column">{rows}</Box>;
}
