import { Box, Text, useInput } from 'ink';
import type { PlayerState } from '../../engine/player.js';
import { VIRTUE_NAMES, VIRTUE_DISPLAY } from '../../engine/virtue/stats.js';
import { detectBuild } from '../../engine/virtue/builds.js';
import { VirtueBar } from '../components/VirtueBar.js';

type StatsProps = {
  player: PlayerState;
  onTabSwitch: () => void;
};

export function StatsScreen({ player, onTabSwitch }: StatsProps) {
  useInput((_input, key) => {
    if (key.tab) onTabSwitch();
  });

  const build = detectBuild(player.virtues);
  const theosisProgress = Math.round(
    (Math.min(...VIRTUE_NAMES.map(v => player.virtues[v])) / 10) * 100
  );

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box justifyContent="space-between">
        <Text color="#d4af37" bold>YOUR SOUL</Text>
        <Text color="#888888">Run {player.runCount} · Floor {player.floor}</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="#d4af37">Current Build: </Text>
        <Text color="#e8e8e8">{build.name}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        {VIRTUE_NAMES.map(v => (
          <Box key={v}>
            <VirtueBar
              name={VIRTUE_DISPLAY[v].label}
              value={player.virtues[v]}
              max={10}
              color={VIRTUE_DISPLAY[v].color}
              width={20}
            />
            <Text color="#555555">  baseline: {player.baseline[v]}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="#e8e8e8">Progress to Theosis: <Text color="#d4af37">{theosisProgress}%</Text></Text>
        <Text color="#555555">(all virtues must reach 10)</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="#555555">Tab: Dungeon  Q: Quit</Text>
      </Box>
    </Box>
  );
}
