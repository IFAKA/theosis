import { Box, Text, useInput, useStdout } from 'ink';
import type { FloorState } from '../../engine/dungeon/floor.js';
import type { PlayerState } from '../../engine/player.js';
import type { VisibleTiles } from '../../engine/dungeon/fov.js';
import { Grid } from '../components/Grid.js';
import { VirtueBar } from '../components/VirtueBar.js';
import { VIRTUE_NAMES, VIRTUE_DISPLAY } from '../../engine/virtue/stats.js';
import { detectBuild } from '../../engine/virtue/builds.js';
import { computeFOV } from '../../engine/dungeon/fov.js';
import { useState, useCallback } from 'react';

type DungeonMapProps = {
  floor: FloorState;
  player: PlayerState;
  onFloorComplete: () => void;
  onCombatStart: (enemyId: string) => void;
  onTabSwitch: () => void;
};

export function DungeonMap({ floor, player, onFloorComplete, onCombatStart, onTabSwitch }: DungeonMapProps) {
  const { stdout } = useStdout();
  const cols = stdout?.columns ?? 80;
  const rows = stdout?.rows ?? 24;

  const mapWidth = Math.min(floor.map.width, Math.floor(cols * 0.7));
  const mapHeight = Math.min(floor.map.height, rows - 4);
  const sidebarWidth = cols - mapWidth - 3;

  const [playerX, setPlayerX] = useState(floor.playerX);
  const [playerY, setPlayerY] = useState(floor.playerY);

  const visibleTiles: VisibleTiles = computeFOV(floor.map.map, playerX, playerY);

  const tryMove = useCallback((dx: number, dy: number) => {
    const nx = playerX + dx;
    const ny = playerY + dy;
    const tile = floor.map.map.get(`${nx},${ny}`);
    if (tile !== 'floor') return;

    const enemy = floor.enemies.find(e => e.x === nx && e.y === ny);
    if (enemy) {
      onCombatStart(enemy.id);
      return;
    }

    setPlayerX(nx);
    setPlayerY(ny);

    if (floor.map.exitPos.x === nx && floor.map.exitPos.y === ny) {
      onFloorComplete();
    }
  }, [playerX, playerY, floor, onCombatStart, onFloorComplete]);

  useInput((input, key) => {
    if (key.tab) { onTabSwitch(); return; }
    if (input === 'w' || key.upArrow)    tryMove(0, -1);
    if (input === 's' || key.downArrow)  tryMove(0, 1);
    if (input === 'a' || key.leftArrow)  tryMove(-1, 0);
    if (input === 'd' || key.rightArrow) tryMove(1, 0);
  });

  const build = detectBuild(player.virtues);
  const hpFilled = Math.round((player.hp / player.maxHp) * (sidebarWidth - 6));
  const hpEmpty = (sidebarWidth - 6) - hpFilled;
  const barWidth = Math.max(8, Math.floor((sidebarWidth - 14) * 0.8));

  return (
    <Box flexDirection="column" height={rows}>
      <Box flexGrow={1}>
        <Box flexDirection="column" width={mapWidth}>
          <Text color="#888888">Floor {floor.floorNumber}</Text>
          <Grid
            map={floor.map}
            playerX={playerX}
            playerY={playerY}
            enemies={floor.enemies}
            visibleTiles={visibleTiles}
            width={mapWidth}
            height={mapHeight}
          />
        </Box>
        <Box width={1}><Text> </Text></Box>
        <Box flexDirection="column" width={sidebarWidth}>
          <Text color="#d4af37" bold>THEOSIS</Text>
          <Box marginTop={1} flexDirection="column">
            <Box>
              <Text color="#e8e8e8">HP: </Text>
              <Text color="#ef4444">{'█'.repeat(Math.max(0, hpFilled))}</Text>
              <Text color="#333333">{'░'.repeat(Math.max(0, hpEmpty))}</Text>
              <Text color="#888888"> {player.hp}/{player.maxHp}</Text>
            </Box>
          </Box>
          <Box marginTop={1} flexDirection="column">
            {VIRTUE_NAMES.map(v => (
              <VirtueBar
                key={v}
                name={VIRTUE_DISPLAY[v].label}
                value={player.virtues[v]}
                max={10}
                color={VIRTUE_DISPLAY[v].color}
                width={barWidth}
              />
            ))}
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text color="#888888">Build:</Text>
            <Text color="#d4af37">{build.name}</Text>
          </Box>
        </Box>
      </Box>
      <Box>
        <Text color="#555555">WASD: Move  {'>'}: Exit  Tab: Stats  Q: Quit</Text>
      </Box>
    </Box>
  );
}
