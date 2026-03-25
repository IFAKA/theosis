import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import type { BuildArchetype } from '../../engine/virtue/builds.js';

const VIRTUE_NEMESIS: Record<string, string> = {
  humility:   'Prelest cannot survive your stillness.',
  courage:    'Porneia breaks against your witness.',
  temperance: 'Thymos is powerless before your discipline.',
  wisdom:     'Kenodoxia has no hold on one who seeks truth.',
  love:       'Acedia cannot drain a soul rooted in love.',
};

type BuildRevealProps = {
  build: BuildArchetype;
  onContinue: () => void;
};

export function BuildReveal({ build, onContinue }: BuildRevealProps) {
  const fullText = `YOU ARE A ${build.name.toUpperCase()}`;
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [fullText]);

  // Auto-advance 3s after typing completes
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(onContinue, 3000);
    return () => clearTimeout(timer);
  }, [done, onContinue]);

  useInput((_input, key) => {
    if (key.return || _input === ' ') onContinue();
  });

  const nemesis = VIRTUE_NEMESIS[build.dominantVirtue] ?? '';
  const border = '═'.repeat(34);

  return (
    <Box flexDirection="column" paddingX={4} paddingY={2}>
      <Text color="#888888">{border}</Text>
      <Box marginTop={1} flexDirection="column" alignItems="center">
        <Text color="#d4af37" bold>{displayed}</Text>
        {done && (
          <>
            <Text color="#888888">{build.description}</Text>
            <Box marginTop={1}>
              <Text color="#00d9ff">{nemesis}</Text>
            </Box>
          </>
        )}
      </Box>
      <Box marginTop={1}>
        <Text color="#888888">{border}</Text>
      </Box>
      {done && (
        <Box marginTop={1}>
          <Text color="#555555">[ENTER] Continue</Text>
        </Box>
      )}
    </Box>
  );
}
