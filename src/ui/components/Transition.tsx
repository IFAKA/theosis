import React, { useState, useEffect } from 'react';
import { Box } from 'ink';

type TransitionProps = {
  show: boolean;
  children: React.ReactNode;
};

export function Transition({ show, children }: TransitionProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setVisible(true), 200);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [show]);

  if (!visible) return <Box />;
  return <>{children}</>;
}
