import type { Race } from '../engine';

export const colors = {
  /** The chunky outline colour used on every toy-style shape. */
  ink: '#1E1033',
  bg: '#2E2170',
  bgDeep: '#1D1450',
  bgPattern: '#3A2C85',
  panel: '#43349A',
  panelLight: '#5546B5',
  border: '#1E1033',
  text: '#FFFFFF',
  textDim: '#DCD6FF',
  textMuted: '#AFA6E6',
  gold: '#FFD23F',
  goldDeep: '#E89B12',
  danger: '#FF4D5E',
  success: '#3EE07A',
  accent: '#FF8A1F',
  wood: '#E6A15A',
  woodLight: '#F2B872',
  woodDark: '#B86E2E',
  heads: '#FFD23F',
  overlay: 'rgba(20, 10, 45, 0.72)',
};

export const raceColors: Record<Race, { main: string; light: string; dark: string; label: string; plural: string }> = {
  human: { main: '#2F8CFF', light: '#9ACBFF', dark: '#1450B8', label: 'Human', plural: 'Humans' },
  orc: { main: '#FF4A3D', light: '#FFA096', dark: '#B0170E', label: 'Orc', plural: 'Orcs' },
  elf: { main: '#22CC66', light: '#8BF0B0', dark: '#0B8A3C', label: 'Elf', plural: 'Elves' },
  neutral: { main: '#E8873A', light: '#FFC48E', dark: '#9C4D12', label: 'Plain', plural: 'Plain coins' },
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
