import React from 'react';
import { Box, Text } from 'ink';

type VirtueBarProps = {
  name: string;
  value: number;
  max: number;
  color: string;
  width?: number;
};

export function VirtueBar({ name, value, max, color, width = 20 }: VirtueBarProps) {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  const filledStr = '█'.repeat(filled);
  const emptyStr = '░'.repeat(empty);

  return (
    <Box>
      <Text color="#e8e8e8">{name.padEnd(11)} </Text>
      <Text color={color}>{filledStr}</Text>
      <Text color="#333333">{emptyStr}</Text>
      <Text color="#888888"> {value}/{max}</Text>
    </Box>
  );
}
