import { Box, Text, useInput } from 'ink';
import type { VirtueName } from '../../engine/virtue/stats.js';
import { VIRTUE_DISPLAY } from '../../engine/virtue/stats.js';

const VIRTUE_SCRIPTURE: Record<VirtueName, string> = {
  humility:   '"He emptied himself, taking the form of a servant." — Phil 2:7',
  courage:    '"Be strong and courageous. Do not be afraid." — Josh 1:9',
  temperance: '"Everyone who competes in the games exercises self-control in all things." — 1 Cor 9:25',
  wisdom:     '"The fear of the Lord is the beginning of wisdom." — Prov 9:10',
  love:       '"God is love, and whoever abides in love abides in God." — 1 John 4:16',
};

const VIRTUE_CONCEPT: Record<VirtueName, { name: string; description: string }> = {
  humility:   { name: 'KENOSIS', description: 'The self-emptying the Orthodox have practiced for two thousand years.' },
  courage:    { name: 'MARTYRIA', description: 'Witness unto death — the refusal to deny truth before any earthly power.' },
  temperance: { name: 'NEPSIS', description: 'Watchfulness — the sober guarding of the heart against distraction.' },
  wisdom:     { name: 'THEORIA', description: 'Vision of God — the intellect purified until it perceives divine light.' },
  love:       { name: 'AGAPE',   description: 'Unconditional love — the opposite of Acedia, the ground of all virtues.' },
};

type VirtueMilestoneProps = {
  virtue: VirtueName;
  onContinue: () => void;
};

export function VirtueMilestone({ virtue, onContinue }: VirtueMilestoneProps) {
  const display = VIRTUE_DISPLAY[virtue];
  const concept = VIRTUE_CONCEPT[virtue];
  const scripture = VIRTUE_SCRIPTURE[virtue];
  const border = '═'.repeat(38);

  useInput((_input, key) => {
    if (key.return || _input === ' ') onContinue();
  });

  return (
    <Box flexDirection="column" paddingX={4} paddingY={2}>
      <Text color="#888888">{border}</Text>
      <Box marginTop={1} flexDirection="column" alignItems="center">
        <Text color={display.color} bold>{display.label.toUpperCase()}: PERFECTED</Text>
        <Box marginTop={1}>
          <Text color="#d4af37" bold>{concept.name}</Text>
        </Box>
        <Box marginTop={1} width={38}>
          <Text color="#888888" wrap="wrap">{scripture}</Text>
        </Box>
        <Box marginTop={1} width={38}>
          <Text color="#e8e8e8" wrap="wrap">{concept.description}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="#00d9ff">discord.gg/theosis</Text>
        </Box>
      </Box>
      <Box marginTop={1}>
        <Text color="#888888">{border}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="#555555">[ENTER] Continue</Text>
      </Box>
    </Box>
  );
}
