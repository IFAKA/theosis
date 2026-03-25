import { Box, Text, useInput } from 'ink';
import type { PlayerState } from '../../engine/player.js';
import { VIRTUE_NAMES, VIRTUE_DISPLAY } from '../../engine/virtue/stats.js';

const ORTHODOX_LORE: Record<string, string> = {
  Prelest:   'Spiritual self-delusion — the Fathers called it the most dangerous passion, for it disguises itself as virtue.',
  Acedia:    'The noonday demon — it drains meaning from prayer until devotion feels like noise.',
  Kenodoxia: 'Vainglory — the corruption of genuine virtue into performance for an audience.',
  Thymos:    'Anger — righteous in origin, but the Fathers warn it burns indiscriminately once unmoored.',
  Porneia:   'Disordered desire — the confusion of love with consumption, intimacy with possession.',
};

type DeathProps = {
  player: PlayerState;
  killedBy: string;
  killedByOrthodoxName: string;
  floorReached: number;
  baselineRise: { virtue: string; from: number; to: number } | null;
  onNewRun: () => void;
};

function getVirtueAnalysis(player: PlayerState, killedBy: string): string {
  const virtues = player.virtues;
  const values = VIRTUE_NAMES.map(v => ({ name: v, label: VIRTUE_DISPLAY[v].label, value: virtues[v] }));
  const sorted = [...values].sort((a, b) => a.value - b.value);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];

  if (highest.value > 7 && lowest.value < 3) {
    return `Your ${highest.label} was formidable, but imbalance became the wound. ${killedBy} found the gap you left.`;
  }
  if (lowest.value < 3) {
    return `You neglected ${lowest.label}. The ${killedBy} exploited this absence without mercy.`;
  }
  return `The ${killedBy} found a crack in your foundation. Each virtue must hold.`;
}

export function DeathScreen({ player, killedBy, killedByOrthodoxName, floorReached, baselineRise, onNewRun }: DeathProps) {
  useInput((_input, key) => {
    if (key.return) onNewRun();
  });

  const analysis = getVirtueAnalysis(player, killedBy);

  return (
    <Box flexDirection="column" paddingY={1} alignItems="center">
    <Box flexDirection="column" paddingX={2} width={72}>
      <Text color="#f87171" bold>YOU HAVE FALLEN</Text>

      <Box marginTop={1}>
        <Text color="#888888">Killed by: </Text>
        <Text color="#f87171">{killedBy}</Text>
        <Text color="#888888"> — Floor {floorReached}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="#e8e8e8" dimColor>What the run revealed:</Text>
        <Text color="#e8e8e8">{analysis}</Text>
      </Box>

      {ORTHODOX_LORE[killedByOrthodoxName] && (
        <Box marginTop={1} flexDirection="column">
          <Text color="#d4af37">{killedByOrthodoxName}</Text>
          <Text color="#888888">{ORTHODOX_LORE[killedByOrthodoxName]}</Text>
        </Box>
      )}

      {baselineRise && (
        <Box marginTop={1}>
          <Text color="#888888">Baseline rises:  </Text>
          <Text color="#d4af37">{VIRTUE_DISPLAY[baselineRise.virtue as keyof typeof VIRTUE_DISPLAY]?.label ?? baselineRise.virtue} {baselineRise.from} → {baselineRise.to}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="#333333">discord.gg/theosis — if this world interests you.</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="#888888">Run {player.runCount + 1} begins.  </Text>
        <Text color="#d4af37">[ENTER] Rise Again</Text>
      </Box>
    </Box>
    </Box>
  );
}
