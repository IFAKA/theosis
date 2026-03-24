export const VIRTUE_NAMES = ['humility', 'courage', 'temperance', 'wisdom', 'love'] as const;
export type VirtueName = typeof VIRTUE_NAMES[number];

export const VIRTUE_DISPLAY: Record<VirtueName, { label: string; color: string }> = {
  humility:   { label: 'Humility',   color: '#a78bfa' },
  courage:    { label: 'Courage',    color: '#f87171' },
  temperance: { label: 'Temperance', color: '#34d399' },
  wisdom:     { label: 'Wisdom',     color: '#60a5fa' },
  love:       { label: 'Love',       color: '#f472b6' },
};

export const MAX_VIRTUE = 10;
export const THEOSIS_THRESHOLD = 10;
