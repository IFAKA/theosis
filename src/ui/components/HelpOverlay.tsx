import { Box, Text } from 'ink';

type Screen = 'menu' | 'dungeon' | 'combat' | 'encounter' | 'stats' | 'death' | 'theosis';

type HelpOverlayProps = {
  screen: Screen;
};

const CONTROLS: Record<Screen, Array<{ key: string; action: string }>> = {
  menu: [
    { key: 'ENTER', action: 'Begin game' },
    { key: 'S', action: 'Toggle sound' },
    { key: 'Q', action: 'Quit' },
  ],
  dungeon: [
    { key: 'WASD / Arrows', action: 'Move' },
    { key: 'Tab', action: 'View stats' },
    { key: '?', action: 'Close help' },
    { key: 'Q', action: 'Quit' },
  ],
  combat: [
    { key: '1 / 2 / 3 / 4', action: 'Use ability' },
    { key: 'Up / Down', action: 'Navigate actions' },
    { key: 'Enter', action: 'Confirm action' },
    { key: '?', action: 'Close help' },
  ],
  encounter: [
    { key: '1 / 2 / 3', action: 'Make choice' },
    { key: 'Up / Down', action: 'Navigate choices' },
    { key: 'Enter', action: 'Confirm choice' },
    { key: '?', action: 'Close help' },
  ],
  stats: [
    { key: 'Tab', action: 'Back to dungeon' },
    { key: '?', action: 'Close help' },
    { key: 'Q', action: 'Quit' },
  ],
  death: [
    { key: 'Enter', action: 'Rise again (new run)' },
    { key: '?', action: 'Close help' },
  ],
  theosis: [
    { key: 'R', action: 'Play again' },
    { key: 'Q', action: 'Quit' },
  ],
};

export function HelpOverlay({ screen }: HelpOverlayProps) {
  const controls = CONTROLS[screen] ?? CONTROLS.dungeon;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="#6b4ba0"
      paddingX={2}
      paddingY={1}
      width={40}
    >
      <Text color="#d4af37" bold>CONTROLS</Text>
      <Box marginTop={1} flexDirection="column">
        {controls.map(({ key, action }) => (
          <Box key={key}>
            <Text color="#d4af37">{key.padEnd(18)}</Text>
            <Text color="#e8e8e8">{action}</Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color="#555555">Press ? or ESC to close</Text>
      </Box>
    </Box>
  );
}
