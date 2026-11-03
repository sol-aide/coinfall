import type { ViewStyle } from 'react-native';
import type { Race } from '../engine';

// Papercraft palette: a kraft-paper desk, cream card stock, warm brown ink.
// Coloured text only ever sits on cream paper (all ≥4.5:1 there); on bare
// kraft use `text` or `textDim`.
export const colors = {
  bg: '#E9D4AE', // kraft paper
  bgDeep: '#DCC293', // darker kraft, for wells and tracks
  panel: '#FFF8EA', // cream card stock
  panelLight: '#F7EAD0', // tinted card, rows inside panels
  border: '#C9A97C', // pencil line on cream
  ink: '#3B2516', // outlines and shadows
  text: '#3B2516',
  textDim: '#674A33',
  textMuted: '#7C5E45',
  /** Fill gold (coins, bars). Use `goldInk` for gold-coloured text. */
  gold: '#F6BE3A',
  goldDeep: '#C98A12',
  goldInk: '#9A5B00',
  danger: '#B8322A',
  dangerFill: '#D2453A',
  success: '#23794A',
  successFill: '#4DB872',
  accent: '#A8500C',
  accentFill: '#F08A3C',
  sticker: '#FFFFFF', // die-cut rim
  shadow: 'rgba(84, 52, 22, 0.28)', // hard paper shadow
  wood: '#B9773F',
  woodLight: '#CC8B4E',
  woodDark: '#8C5528',
  heads: '#F7D774',
  overlay: 'rgba(59, 37, 22, 0.55)',
};

export const raceColors: Record<Race, { main: string; light: string; dark: string; ink: string; label: string; plural: string }> = {
  human: { main: '#3C7BE0', light: '#A9C8F7', dark: '#22489A', ink: '#1F55B5', label: 'Human', plural: 'Humans' },
  orc: { main: '#D94A3A', light: '#F6AFA4', dark: '#8E2418', ink: '#B02E20', label: 'Orc', plural: 'Orcs' },
  elf: { main: '#2FA866', light: '#9CE0B6', dark: '#176238', ink: '#17703F', label: 'Elf', plural: 'Elves' },
  neutral: { main: '#C07A3A', light: '#EBC193', dark: '#7A4818', ink: '#8A4F1C', label: 'Plain', plural: 'Plain coins' },
};

/** Rarity text colours (on cream paper). */
export const rarityColors = {
  starter: '#7C5E45',
  common: '#7C5E45',
  uncommon: '#1867A8',
  rare: '#A35A00',
} as const;

export const font = {
  title: 34,
  h1: 26,
  h2: 20,
  body: 17,
  small: 15,
  tiny: 13,
};

/** Rounded system face on the web build (SF Rounded on Apple devices); the native default elsewhere. */
export const display = typeof document !== 'undefined' ? 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif' : undefined;

export const radius = { sm: 8, md: 14, lg: 20 };

/** Minimum touch target (Apple HIG: 44pt). */
export const TOUCH = 44;

/** A hard, unblurred paper shadow: the sticker sits slightly above the page. */
export function paperShadow(lift = 3): ViewStyle {
  return {
    shadowColor: '#54341A',
    shadowOpacity: 0.3,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: lift },
    elevation: lift,
  };
}
