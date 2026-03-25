import { useState, useEffect, useRef } from 'react';
import { Box, Text } from 'ink';

type VirtueBarProps = {
  name: string;
  value: number;
  max: number;
  color: string;
  width?: number;
};

export function VirtueBar({ name, value, max, color, width = 20 }: VirtueBarProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value <= prevValue.current) {
      setDisplayValue(value);
      prevValue.current = value;
      return;
    }
    const diff = value - prevValue.current;
    let current = prevValue.current;
    const interval = setInterval(() => {
      current++;
      setDisplayValue(current);
      if (current >= value) {
        clearInterval(interval);
        prevValue.current = value;
      }
    }, Math.floor(300 / diff));
    return () => clearInterval(interval);
  }, [value]);

  const filled = Math.round((displayValue / max) * width);
  const empty = width - filled;
  const filledStr = '█'.repeat(Math.max(0, filled));
  const emptyStr = '░'.repeat(Math.max(0, empty));

  return (
    <Box>
      <Text color="#e8e8e8">{name.padEnd(11)} </Text>
      <Text color={color}>{filledStr}</Text>
      <Text color="#555555">{emptyStr}</Text>
      <Text color="#888888"> {value}/{max}</Text>
    </Box>
  );
}
