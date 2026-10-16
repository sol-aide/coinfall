import type { Race } from '../engine';

export const colors = {
  bg: '#1B2340',
  bgDeep: '#121830',
  panel: '#26305A',
  panelLight: '#323E70',
  border: '#46549A',
  text: '#F4F1E8',
  textDim: '#B9BEDA',
  textMuted: '#8890B8',
  gold: '#F7C548',
  goldDeep: '#C9921B',
  danger: '#F0605D',
  success: '#5BD18B',
  accent: '#FF9F43',
  wood: '#8A5A34',
  woodLight: '#A26C40',
  woodDark: '#6B4226',
  heads: '#F7D774',
  overlay: 'rgba(8, 10, 24, 0.72)',
};

export const raceColors: Record<Race, { main: string; light: string; dark: string; label: string; plural: string }> = {
  human: { main: '#3C7BE0', light: '#8DB6F5', dark: '#22489A', label: 'Human', plural: 'Humans' },
  orc: { main: '#D94A3A', light: '#F39486', dark: '#8E2418', label: 'Orc', plural: 'Orcs' },
  elf: { main: '#2FA866', light: '#86DDA8', dark: '#176238', label: 'Elf', plural: 'Elves' },
  neutral: { main: '#B87333', light: '#E0A672', dark: '#7A4818', label: 'Plain', plural: 'Plain coins' },
};

export const rarityColors = {
  starter: '#B9BEDA',
  common: '#B9BEDA',
  uncommon: '#6FC3FF',
  rare: '#FFB648',
} as const;

export const font = {
  title: 34,
  h1: 26,
  h2: 20,
  body: 17,
  small: 15,
  tiny: 13,
};

export const radius = { sm: 8, md: 14, lg: 20 };

/** Minimum touch target (Apple HIG: 44pt). */
export const TOUCH = 44;
