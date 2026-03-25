import { Box, Text, useInput, useApp } from 'ink';
import type { PlayerState } from '../../engine/player.js';
import { VIRTUE_NAMES } from '../../engine/virtue/stats.js';

const THEOLOGICAL_MAP: Record<string, { concept: string; meaning: string }> = {
  humility: { concept: 'Kenosis',  meaning: 'self-emptying that makes space for God' },
  courage:  { concept: 'Martyria', meaning: 'witness through sacrifice, not performance' },
  temperance: { concept: 'Nepsis', meaning: 'watchfulness over every passion and thought' },
  wisdom:   { concept: 'Theologia', meaning: 'knowledge of God through purified reason' },
  love:     { concept: 'Agape',    meaning: 'the love that would not break' },
};

type TheosisProps = {
  player: PlayerState;
  onNewRun: () => void;
};

export function TheosisScreen({ player, onNewRun }: TheosisProps) {
  const { exit } = useApp();

  useInput((input) => {
    if (input === 'r' || input === 'R') onNewRun();
    if (input === 'q' || input === 'Q') exit();
  });

  // The 3 highest virtues become the theological mapping
  const sorted = VIRTUE_NAMES
    .map(v => ({ v, val: player.virtues[v] }))
    .sort((a, b) => b.val - a.val)
    .slice(0, 3);

  return (
    <Box flexDirection="column" paddingY={1} alignItems="center">
      <Box flexDirection="column" width={72}>
        <Text color="#d4af37" bold>{'            ΘΕΩΣΙΣ            '}</Text>

        <Box marginTop={1} flexDirection="column">
          <Text color="#d4af37">"God became man so that man might become God."</Text>
          <Text color="#555555">                         — St. Athanasius</Text>
        </Box>

        <Box marginTop={1} flexDirection="column">
          <Text color="#e8e8e8" dimColor>What you built in this dungeon:</Text>
          {sorted.map(({ v }) => {
            const t = THEOLOGICAL_MAP[v];
            return (
              <Box key={v}>
                <Text color="#d4af37"> {t.concept.padEnd(12)}</Text>
                <Text color="#888888">→ </Text>
                <Text color="#e8e8e8">{t.meaning}</Text>
              </Box>
            );
          })}
        </Box>

        <Box marginTop={1} flexDirection="column">
          <Text color="#e8e8e8">These are not game mechanics.</Text>
          <Text color="#e8e8e8">They are the path the Orthodox have walked</Text>
          <Text color="#e8e8e8">for two thousand years.</Text>
        </Box>

        <Box marginTop={1} flexDirection="column">
          <Text color="#e8e8e8">Want to go deeper?</Text>
          <Text color="#6b4ba0">discord.gg/theosis   |   philokalia.io</Text>
        </Box>

        <Box marginTop={1}>
          <Text color="#d4af37">[R] Play again   </Text>
          <Text color="#888888">[Q] Quit</Text>
        </Box>
      </Box>
    </Box>
  );
}
