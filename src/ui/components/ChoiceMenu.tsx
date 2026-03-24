import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

type Choice = {
  id: string;
  text: string;
  hoverHint?: string;
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
      onSelect(choices[hoveredIndex].id);
    } else {
      const num = parseInt(input, 10);
      if (num >= 1 && num <= choices.length) {
        onSelect(choices[num - 1].id);
      }
    }
  });

  return (
    <Box flexDirection="column">
      {choices.map((choice, i) => {
        const isHovered = i === hoveredIndex;
        return (
          <Box key={choice.id}>
            <Text color={isHovered ? '#d4af37' : '#888888'}>{isHovered ? '▶ ' : '  '}</Text>
            <Text color={isHovered ? '#e8e8e8' : '#888888'}>[{i + 1}] {choice.text}</Text>
            {isHovered && choice.hoverHint && (
              <Text color="#d4af3799">  {choice.hoverHint}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
