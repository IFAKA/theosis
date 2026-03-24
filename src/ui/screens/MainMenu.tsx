import { Box, Text, useInput, useApp } from 'ink';

type MainMenuProps = {
  soundEnabled: boolean;
  onStart: () => void;
  onToggleSound: () => void;
};

export function MainMenu({ soundEnabled, onStart, onToggleSound }: MainMenuProps) {
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.return || input === '\r') onStart();
    if (input === 's' || input === 'S') onToggleSound();
    if (input === 'q' || input === 'Q') exit();
  });

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" height={24}>
      <Text color="#d4af37" bold>████████╗██╗  ██╗███████╗ ██████╗ ███████╗██╗███████╗</Text>
      <Text color="#d4af37" bold>╚══██╔══╝██║  ██║██╔════╝██╔═══██╗██╔════╝██║██╔════╝</Text>
      <Text color="#d4af37" bold>     ██║   ███████║█████╗  ██║   ██║███████╗██║███████╗</Text>
      <Text color="#d4af37" bold>     ██║   ██╔══██║██╔══╝  ██║   ██║╚════██║██║╚════██║</Text>
      <Text color="#d4af37" bold>     ██║   ██║  ██║███████╗╚██████╔╝███████║██║███████║</Text>
      <Text color="#d4af37" bold>     ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝╚═╝╚══════╝</Text>

      <Box marginTop={1}>
        <Text color="#6b4ba0">─────────────────────────────────────────────────────</Text>
      </Box>
      <Box marginTop={1} flexDirection="column" alignItems="center">
        <Text color="#e8e8e8">The virtue that wins wars.</Text>
        <Text color="#e8e8e8">The kenosis that breaks demons.</Text>
      </Box>

      <Box marginTop={2} flexDirection="column" alignItems="flex-start">
        <Box>
          <Text color="#d4af37">[ENTER]  </Text>
          <Text color="#e8e8e8">Begin</Text>
        </Box>
        <Box>
          <Text color="#d4af37">[S]      </Text>
          <Text color="#e8e8e8">Sound: {soundEnabled ? 'ON' : 'OFF'}</Text>
        </Box>
        <Box>
          <Text color="#d4af37">[Q]      </Text>
          <Text color="#e8e8e8">Quit</Text>
        </Box>
      </Box>

      <Box marginTop={2}>
        <Text color="#333333">v0.1.0</Text>
      </Box>
    </Box>
  );
}
