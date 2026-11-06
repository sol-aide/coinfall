import React from 'react';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import { engravingDef, type Rarity } from '../../engine';
import { colors } from '../theme';

// Original symbol for every Engraving, drawn in a 100x100 box and outlined in
// ink by the wrapper. Engravings are cut gems, so the sticker is a faceted gem.

const GOLD = colors.gold;

export const ENGRAVING_SYMBOLS: Record<string, () => React.ReactNode> = {
  double: () => (
    <>
      <Circle cx={40} cy={50} r={16} fill={GOLD} />
      <Circle cx={60} cy={50} r={16} fill={GOLD} />
    </>
  ),
  echo: () => (
    <>
      <Path d="M30 30 Q50 50 30 70" fill="none" />
      <Path d="M46 24 Q70 50 46 76" fill="none" />
      <Path d="M62 18 Q90 50 62 82" fill="none" />
    </>
  ),
  lucky: () => <Path d="M50 28 L56 44 L72 44 L59 54 L64 70 L50 60 L36 70 L41 54 L28 44 L44 44 Z" fill={GOLD} />,
  secondwind: () => (
    <>
      <Path d="M70 40 A22 22 0 1 0 72 58" fill="none" />
      <Polygon points="78,30 64,40 80,48" fill={colors.paper} />
    </>
  ),
  growth: () => (
    <>
      <Line x1={50} y1={76} x2={50} y2={46} />
      <Path d="M50 52 Q30 52 28 34 Q48 32 50 52 Z" fill="#6CC24A" />
      <Path d="M50 46 Q70 46 72 28 Q52 26 50 46 Z" fill="#6CC24A" />
    </>
  ),
  gilded: () => (
    <>
      <Circle cx={50} cy={52} r={20} fill={GOLD} />
      <Path d="M30 30 L34 36 M70 30 L66 36 M50 22 L50 28" fill="none" />
    </>
  ),
  ironclad: () => <Path d="M50 22 L74 30 Q74 62 50 78 Q26 62 26 30 Z" fill="#B8C2CC" />,
  kinship: () => (
    <>
      <Circle cx={50} cy={36} r={11} fill="#4B8FE0" />
      <Circle cx={36} cy={60} r={11} fill="#E0564A" />
      <Circle cx={64} cy={60} r={11} fill="#4FB06A" />
    </>
  ),
  twofaced: () => (
    <>
      <Path d="M50 24 A26 26 0 0 0 50 76 Z" fill={GOLD} />
      <Path d="M50 24 A26 26 0 0 1 50 76 Z" fill="#6A5A7A" />
    </>
  ),
  spiked: () => (
    <Polygon points="50,20 57,38 76,32 64,48 80,60 60,62 58,80 48,66 34,78 36,60 20,56 36,46 26,30 44,36" fill="#F28C28" />
  ),
  hollow: () => (
    <>
      <Circle cx={50} cy={50} r={22} fill={GOLD} />
      <Circle cx={50} cy={50} r={9} fill="#2B2320" />
    </>
  ),
  anchored: () => (
    <>
      <Line x1={50} y1={22} x2={50} y2={72} />
      <Circle cx={50} cy={22} r={7} fill="none" />
      <Line x1={38} y1={36} x2={62} y2={36} />
      <Path d="M28 58 Q30 76 50 78 Q70 76 72 58" fill="none" />
      <Path d="M24 62 L28 54 L34 62 M66 62 L72 54 L76 62" fill="none" />
    </>
  ),
  weighted: () => (
    <>
      <Path d="M36 40 L64 40 L72 76 L28 76 Z" fill="#8C7A6A" />
      <Rect x={44} y={28} width={12} height={12} rx={4} fill="none" />
    </>
  ),
};

const RARITY_GEM: Record<Rarity, string> = {
  starter: '#5E6B85',
  common: '#3F7FA6',
  uncommon: '#2F8F86',
  rare: '#83508F',
};

/** An Engraving as a faceted gem sticker with its symbol inside. */
export function EngravingArt({ id, size }: { id: string; size: number }) {
  const def = engravingDef(id);
  const fill = RARITY_GEM[def.rarity];
  const symbol = ENGRAVING_SYMBOLS[id];
  const gem = '50,4 92,30 92,70 50,96 8,70 8,30';
  return (
    <Svg width={size} height={size} viewBox="-6 -6 112 112">
      <Polygon points={gem} transform="translate(2 6)" fill="rgba(15,8,15,0.35)" />
      <Polygon points={gem} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={8} strokeLinejoin="round" />
      <Polygon points={gem} fill={fill} stroke={colors.ink} strokeWidth={3} strokeLinejoin="round" />
      <Polygon points="50,4 92,30 50,22 8,30" fill="#FFFFFF" opacity={0.18} />
      <G transform="translate(50 52) scale(0.85) translate(-50 -50)" stroke={colors.ink} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" fill={colors.paper}>
        {symbol ? symbol() : <Circle cx={50} cy={50} r={18} />}
      </G>
    </Svg>
  );
}
