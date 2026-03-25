import { Box, Text } from 'ink';
import { ChoiceMenu } from '../components/ChoiceMenu.js';
import type { VirtueName } from '../../engine/virtue/stats.js';

const FOCUS_OPTIONS: { virtue: VirtueName; buildName: string; tagline: string }[] = [
  { virtue: 'humility',   buildName: 'Hesychast',   tagline: 'Strike through silence and self-emptying' },
  { virtue: 'courage',    buildName: 'Martyr',       tagline: 'Suffer without flinching. Wounds are strength.' },
  { virtue: 'temperance', buildName: 'Ascetic',      tagline: 'Discipline the passions. Master your body.' },
  { virtue: 'wisdom',     buildName: 'Theologian',   tagline: 'See through every deception.' },
  { virtue: 'love',       buildName: 'Philokalos',   tagline: 'Beauty wounds what hatred cannot touch.' },
];

type FocusPickProps = {
  onSelect: (virtue: VirtueName) => void;
};

export function FocusPick({ onSelect }: FocusPickProps) {
  const choices = FOCUS_OPTIONS.map(o => ({
    id: o.virtue,
    text: `${o.buildName} — ${o.tagline}`,
  }));

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text color="#d4af37" bold>CHOOSE YOUR PATH</Text>
      <Box marginTop={1}>
        <Text color="#888888">Your dominant virtue shapes your build from the first fight.</Text>
      </Box>
      <Box marginTop={1}>
        <ChoiceMenu choices={choices} onSelect={id => onSelect(id as VirtueName)} />
      </Box>
      <Box marginTop={1}>
        <Text color="#444444">Starting virtue set to 3. Others begin at 1.</Text>
      </Box>
    </Box>
  );
}
