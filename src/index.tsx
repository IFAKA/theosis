import { render, Text, Box } from "ink";

function App() {
  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height={24}
    >
      <Text color="#d4af37" bold>
        ████████╗██╗  ██╗███████╗ ██████╗ ███████╗██╗███████╗
      </Text>
      <Text color="#d4af37" bold>
        ╚══██╔══╝██║  ██║██╔════╝██╔═══██╗██╔════╝██║██╔════╝
      </Text>
      <Text color="#d4af37" bold>
           ██║   ███████║█████╗  ██║   ██║███████╗██║███████╗
      </Text>
      <Text color="#d4af37" bold>
           ██║   ██╔══██║██╔══╝  ██║   ██║╚════██║██║╚════██║
      </Text>
      <Text color="#d4af37" bold>
           ██║   ██║  ██║███████╗╚██████╔╝███████║██║███████║
      </Text>
      <Text color="#d4af37" bold>
           ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝╚═╝╚══════╝
      </Text>
      <Box marginTop={1}>
        <Text color="#6b4ba0">
          ─────────────────────────────────────────────────────
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="#e8e8e8">
          The virtue that wins wars. The kenosis that breaks demons.
        </Text>
      </Box>
      <Box marginTop={2}>
        <Text color="#d4af37">[ENTER] </Text>
        <Text color="#e8e8e8">Begin  </Text>
        <Text color="#d4af37">  [Q] </Text>
        <Text color="#e8e8e8">Quit</Text>
      </Box>
    </Box>
  );
}

render(<App />);
