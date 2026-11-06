import type { Race } from '../engine';

export const colors = {
  /** Warm charcoal used for every sticker outline (never pure black). */
  ink: '#2B2320',
  bg: '#241E2B',
  bgDeep: '#17131D',
  /** Dark stitched panels (HUD plaques, lists, sheets). */
  panel: '#2D2A36',
  panelLight: '#3A3646',
  border: '#2B2320',
  /** Pale stitch dashes on dark panels. */
  stitch: '#9EA8C8',
  /** Cream card stock for buttons, banners and the round card. */
  paper: '#F1E7D0',
  paperShade: '#DCCDAE',
  paperStitch: '#4F86B8',
  text: '#FFF8EC',
  textDim: '#D9D0C2',
  textMuted: '#A79E95',
  gold: '#F2B41E',
  goldDeep: '#C9820E',
  danger: '#D2394A',
  success: '#6CC24A',
  accent: '#F28C28',
  wood: '#8C4A22',
  woodLight: '#B9703A',
  woodDark: '#5A2E14',
  cloth: '#1F6670',
  clothDark: '#174E56',
  heads: '#F2B41E',
  night: '#1E2B47',
  ribbon: '#7FC1BA',
  overlay: 'rgba(14, 10, 18, 0.55)',
};

export const raceColors: Record<Race, { main: string; light: string; dark: string; label: string; plural: string }> = {
  human: { main: '#4B8FE0', light: '#9CC6F5', dark: '#2F63AE', label: 'Human', plural: 'Humans' },
  orc: { main: '#E0564A', light: '#F5A096', dark: '#A8342B', label: 'Orc', plural: 'Orcs' },
  elf: { main: '#4FB06A', light: '#9EDDA9', dark: '#327D47', label: 'Elf', plural: 'Elves' },
  neutral: { main: '#D08440', light: '#F0B987', dark: '#9A5A24', label: 'Plain', plural: 'Plain coins' },
};

export const rarityColors = {
  starter: '#E6DED2',
  common: '#E6DED2',
  uncommon: '#7CC4F2',
  rare: '#F7B53A',
} as const;

/** Bundled rounded typeface (Fredoka, SIL Open Font License). */
export const fonts = {
  regular: 'Fredoka_500Medium',
  semibold: 'Fredoka_600SemiBold',
  bold: 'Fredoka_700Bold',
};

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
