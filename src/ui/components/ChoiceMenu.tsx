import { useState } from 'react';
import { Box, Text, useInput } from 'ink';

type Choice = {
  id: string;
  text: string;
  hoverHint?: string;
  disabled?: boolean;
  disabledHint?: string;
};

type ChoiceMenuProps = {
  choices: Choice[];
  onSelect: (id: string) => void;
  selectedIndex?: number;
};

export function ChoiceMenu({ choices, onSelect }: ChoiceMenuProps) {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setHoveredIndex(i => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setHoveredIndex(i => Math.min(choices.length - 1, i + 1));
    } else if (key.return) {
      if (!choices[hoveredIndex].disabled) onSelect(choices[hoveredIndex].id);
    } else {
      const num = parseInt(input, 10);
      if (num >= 1 && num <= choices.length) {
        if (!choices[num - 1].disabled) onSelect(choices[num - 1].id);
      }
    }
  });

  return (
    <Box flexDirection="column">
      {choices.map((choice, i) => {
        const isHovered = i === hoveredIndex;
        const isDisabled = !!choice.disabled;
        const textColor = isDisabled ? '#444444' : isHovered ? '#e8e8e8' : '#888888';
        const numColor = isDisabled ? '#333333' : isHovered ? '#d4af37' : '#888888';
        const arrow = isHovered ? '▶ ' : '  ';
        return (
          <Box key={choice.id}>
            <Text color={numColor}>{arrow}</Text>
            <Text color={textColor}>[{i + 1}] {choice.text}</Text>
            {isHovered && isDisabled && choice.disabledHint && (
              <Text color="#f87171">  {choice.disabledHint}</Text>
            )}
            {isHovered && !isDisabled && choice.hoverHint && (
              <Text color="#d4af3799">  {choice.hoverHint}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
