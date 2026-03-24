import { Box, Text } from 'ink';
import type { Encounter } from '../../engine/encounter/types.js';
import { ChoiceMenu } from '../components/ChoiceMenu.js';

type EncounterProps = {
  encounter: Encounter;
  onChoiceSelected: (choiceId: string) => void;
};

export function EncounterScreen({ encounter, onChoiceSelected }: EncounterProps) {

  const choices = encounter.choices.map(c => ({
    id: c.id,
    text: c.text,
    hoverHint: c.hoverHint,
  }));

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box>
        <Text color="#d4af37" bold>{encounter.title}</Text>
        <Text color="#555555">{'  '}[{encounter.orthodoxConcept}]</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="#e8e8e8" wrap="wrap">{encounter.narrative}</Text>
      </Box>
      <Box marginTop={2}>
        <ChoiceMenu choices={choices} onSelect={onChoiceSelected} />
      </Box>
    </Box>
  );
}
