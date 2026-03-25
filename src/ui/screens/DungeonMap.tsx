import { Box, Text, useInput, useStdout } from 'ink';
import type { FloorState } from '../../engine/dungeon/floor.js';
import type { PlayerState } from '../../engine/player.js';
import type { VisibleTiles } from '../../engine/dungeon/fov.js';
import { Grid } from '../components/Grid.js';
import { detectBuild } from '../../engine/virtue/builds.js';
import { computeFOV } from '../../engine/dungeon/fov.js';
import { useCallback } from 'react';

type DungeonMapProps = {
  floor: FloorState;
  player: PlayerState;
  playerX: number;
  playerY: number;
  onMove: (x: number, y: number) => void;
  onFloorComplete: () => void;
  onCombatStart: (enemyId: string) => void;
  onTabSwitch: () => void;
  virtueGainFlash?: { label: string; virtue: string; amount: number } | null;
};

export function DungeonMap({ floor, player, playerX, playerY, onMove, onFloorComplete, onCombatStart, onTabSwitch, virtueGainFlash }: DungeonMapProps) {
  const { stdout } = useStdout();
  const cols = stdout?.columns ?? 80;
  const rows = stdout?.rows ?? 24;

  const narrow = cols < 100;
  const mapWidth = Math.min(floor.map.width, narrow ? 40 : Math.floor(cols * 0.7));
  const mapHeight = Math.min(floor.map.height, rows - 4);
  const sidebarWidth = Math.max(16, cols - mapWidth - 3);

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

    onMove(nx, ny);

    if (floor.map.exitPos.x === nx && floor.map.exitPos.y === ny) {
      if (floor.enemies.length === 0) {
        onFloorComplete();
      }
    }
  }, [playerX, playerY, floor, onMove, onCombatStart, onFloorComplete]);

  useInput((input, key) => {
    if (key.tab) { onTabSwitch(); return; }
    if (input === 'w' || key.upArrow)    tryMove(0, -1);
    if (input === 's' || key.downArrow)  tryMove(0, 1);
    if (input === 'a' || key.leftArrow)  tryMove(-1, 0);
    if (input === 'd' || key.rightArrow) tryMove(1, 0);
  });

  const enemyCount = floor.enemies.length;
  const exitLocked = enemyCount > 0;
  const standingOnLockedExit = exitLocked && playerX === floor.map.exitPos.x && playerY === floor.map.exitPos.y;
  const build = detectBuild(player.virtues);
  const barWidth = Math.max(8, Math.min(24, Math.floor((sidebarWidth - 14) * 0.8)));
  const hpFilled = Math.round((player.hp / player.maxHp) * barWidth);
  const hpEmpty = barWidth - hpFilled;

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
            exitLocked={exitLocked}
          />
        </Box>
        <Box width={1}><Text> </Text></Box>
        <Box flexDirection="column" width={sidebarWidth}>
          {!narrow && <Text color="#d4af37" bold>THEOSIS</Text>}
          <Box marginTop={narrow ? 0 : 1} flexDirection="column">
            <Box>
              <Text color="#e8e8e8">HP: </Text>
              <Text color="#ef4444">{'█'.repeat(Math.max(0, hpFilled))}</Text>
              <Text color="#333333">{'░'.repeat(Math.max(0, hpEmpty))}</Text>
              <Text color="#888888"> {player.hp}/{player.maxHp}</Text>
            </Box>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text color="#888888">Build:</Text>
            <Text color="#d4af37" bold>{build.name}</Text>
          </Box>
          <Box marginTop={1} flexDirection="column">
            {exitLocked
              ? <Text color="#f87171">{enemyCount} enem{enemyCount === 1 ? 'y' : 'ies'} remain</Text>
              : <Text color="#00d9ff">Floor clear — exit open</Text>
            }
          </Box>
          {virtueGainFlash && (
            <Box marginTop={1}>
              <Text color="#6b4ba0" bold>+{virtueGainFlash.amount} {virtueGainFlash.label}</Text>
            </Box>
          )}
        </Box>
      </Box>
      <Box>
        {standingOnLockedExit
          ? <Text color="#f87171">Defeat all enemies to open the exit.</Text>
          : exitLocked
            ? <Text color="#555555">WASD: Move  <Text color="#f87171">[EXIT LOCKED]</Text>  Tab: Stats  ?: Help  Q: Quit</Text>
            : <Text color="#555555">WASD: Move  {'>'}: Exit  Tab: Stats  ?: Help  Q: Quit</Text>
        }
      </Box>
    </Box>
  );
}
