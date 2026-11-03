import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import { charmDef, type Rarity } from '../../engine';
import { colors, raceColors } from '../theme';

// Original symbol for every Charm, drawn in a 100x100 box. The wrapper outlines
// everything in ink and fills it with paper unless a shape sets its own fill.

const GOLD = colors.gold;
const P = colors.paper;

export const CHARM_SYMBOLS: Record<string, () => React.ReactNode> = {
  banner: () => (
    <>
      <Line x1={34} y1={20} x2={34} y2={82} />
      <Path d="M36 24 L72 30 L60 40 L72 50 L36 54 Z" />
    </>
  ),
  warhorn: () => (
    <>
      <Path d="M24 70 Q30 34 70 26 L76 38 Q46 46 40 74 Z" />
      <Ellipse cx={73} cy={32} rx={6} ry={9} transform="rotate(-25 73 32)" fill={GOLD} />
    </>
  ),
  silverleaf: () => (
    <>
      <Path d="M50 18 Q80 42 50 84 Q20 42 50 18 Z" />
      <Line x1={50} y1={30} x2={50} y2={78} />
    </>
  ),
  clover: () => (
    <>
      <Circle cx={40} cy={38} r={12} />
      <Circle cx={60} cy={38} r={12} />
      <Circle cx={40} cy={58} r={12} />
      <Circle cx={60} cy={58} r={12} />
      <Path d="M50 54 Q56 70 64 82" fill="none" />
    </>
  ),
  pockets: () => (
    <>
      <Path d="M26 30 L74 30 L70 72 Q50 84 30 72 Z" />
      <Path d="M26 30 L74 30 L70 44 L30 44 Z" />
      <Circle cx={50} cy={60} r={9} fill={GOLD} />
    </>
  ),
  ledger: () => (
    <>
      <Rect x={26} y={22} width={48} height={58} rx={4} />
      <Line x1={36} y1={36} x2={64} y2={36} />
      <Line x1={36} y1={48} x2={64} y2={48} />
      <Line x1={36} y1={60} x2={56} y2={60} />
    </>
  ),
  haggler: () => (
    <>
      <Path d="M22 28 L78 28 L78 64 L46 64 L32 78 L34 64 L22 64 Z" />
      <Circle cx={50} cy={46} r={10} fill={GOLD} />
    </>
  ),
  whirlwind: () => (
    <>
      <Path d="M30 78 Q34 40 70 22 Q66 56 30 78 Z" />
      <Path d="M30 78 L60 36" fill="none" />
    </>
  ),
  spade: () => (
    <>
      <Line x1={50} y1={18} x2={50} y2={52} />
      <Rect x={42} y={14} width={16} height={8} rx={3} />
      <Path d="M34 52 L66 52 L62 74 Q50 86 38 74 Z" />
    </>
  ),
  scales: () => (
    <>
      <Line x1={50} y1={20} x2={50} y2={78} />
      <Line x1={26} y1={32} x2={74} y2={32} />
      <Path d="M18 54 Q26 66 34 54 Z" />
      <Path d="M66 54 Q74 66 82 54 Z" />
      <Rect x={38} y={76} width={24} height={6} rx={3} />
    </>
  ),
  longtable: () => (
    <>
      <Rect x={16} y={38} width={68} height={10} rx={3} />
      <Line x1={24} y1={48} x2={24} y2={74} />
      <Line x1={76} y1={48} x2={76} y2={74} />
      <Circle cx={36} cy={32} r={6} fill={GOLD} />
      <Circle cx={64} cy={32} r={6} fill={GOLD} />
    </>
  ),
  collector: () => (
    <>
      <Rect x={22} y={36} width={56} height={40} rx={6} />
      <Path d="M40 36 L40 28 L60 28 L60 36" fill="none" />
      <Circle cx={38} cy={56} r={7} fill={GOLD} />
      <Circle cx={54} cy={56} r={7} fill={GOLD} />
      <Circle cx={68} cy={62} r={5} fill={GOLD} />
    </>
  ),
  crown: () => <Path d="M22 70 L26 34 L40 52 L50 28 L60 52 L74 34 L78 70 Z" fill={GOLD} />,
  crucible: () => (
    <>
      <Path d="M50 16 Q62 30 56 40 Q52 32 50 36 Q46 30 44 40 Q38 30 50 16 Z" fill="#F28C28" />
      <Path d="M26 44 L74 44 L68 76 Q50 86 32 76 Z" />
    </>
  ),
  dice: () => (
    <>
      <Path d="M30 40 L70 40 L70 60 L30 60 Z" />
      <Circle cx={28} cy={38} r={8} />
      <Circle cx={28} cy={62} r={8} />
      <Circle cx={72} cy={38} r={8} />
      <Circle cx={72} cy={62} r={8} />
    </>
  ),
  tailwind: () => (
    <>
      <Path d="M18 40 Q34 28 50 40 Q66 52 82 40 L82 56 Q66 68 50 56 Q34 44 18 56 Z" />
      <Path d="M70 60 L76 80 L66 74 L60 82 L58 62" />
    </>
  ),
  firstlight: () => (
    <>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (Math.PI * 2 * i) / 8;
        return <Line key={i} x1={50 + Math.cos(a) * 24} y1={50 + Math.sin(a) * 24} x2={50 + Math.cos(a) * 36} y2={50 + Math.sin(a) * 36} />;
      })}
      <Circle cx={50} cy={50} r={16} fill={GOLD} />
    </>
  ),
  charter: () => (
    <>
      <Rect x={26} y={24} width={48} height={52} rx={4} />
      <Circle cx={26} cy={24} r={6} />
      <Circle cx={74} cy={76} r={6} />
      <Line x1={36} y1={38} x2={64} y2={38} />
      <Line x1={36} y1={50} x2={60} y2={50} />
    </>
  ),
  treaty: () => (
    <>
      <Path d="M40 62 L34 86 L44 80 L50 88 L50 66 Z M60 62 L66 86 L56 80 L50 88 L50 66 Z" fill="#D2394A" />
      <Circle cx={50} cy={46} r={22} fill="#D2394A" />
      <Path d="M40 46 L48 54 L62 38" fill="none" />
    </>
  ),
  rallyhorn: () => (
    <>
      <Path d="M20 54 L40 46 L74 26 L74 74 L40 58 Z" fill={GOLD} />
      <Rect x={14} y={46} width={10} height={12} rx={3} />
      <Path d="M82 38 Q88 50 82 62" fill="none" />
    </>
  ),
  loupe: () => (
    <>
      <Line x1={62} y1={62} x2={80} y2={80} />
      <Circle cx={44} cy={44} r={22} />
      <Polygon points="44,32 52,42 44,56 36,42" fill="#7CC4F2" />
    </>
  ),
  spintop: () => (
    <>
      <Line x1={50} y1={14} x2={50} y2={30} />
      <Path d="M24 40 Q50 24 76 40 L50 84 Z" fill="#F28C28" />
      <Path d="M26 42 Q50 52 74 42" fill="none" />
    </>
  ),
  skullcup: () => (
    <>
      <Path d="M28 24 L72 24 Q72 56 50 60 Q28 56 28 24 Z" />
      <Line x1={50} y1={60} x2={50} y2={74} />
      <Rect x={36} y={74} width={28} height={8} rx={3} />
      <Circle cx={42} cy={38} r={4} fill={colors.ink} />
      <Circle cx={58} cy={38} r={4} fill={colors.ink} />
    </>
  ),
  moonwell: () => (
    <>
      <Path d="M42 18 L58 18 L58 34 Q76 44 72 66 Q66 84 50 84 Q34 84 28 66 Q24 44 42 34 Z" />
      <Path d="M56 50 A12 12 0 1 0 56 74 A9 9 0 1 1 56 50 Z" fill="#7CC4F2" />
    </>
  ),
  lantern: () => (
    <>
      <Path d="M40 22 Q50 12 60 22" fill="none" />
      <Rect x={32} y={26} width={36} height={8} rx={3} />
      <Rect x={34} y={34} width={32} height={38} rx={8} fill={GOLD} />
      <Rect x={32} y={72} width={36} height={8} rx={3} />
    </>
  ),
  anvil: () => (
    <>
      <Path d="M18 34 L74 34 Q84 34 84 44 L64 48 L60 62 L40 62 L36 48 L22 46 Z" />
      <Rect x={30} y={62} width={40} height={14} rx={3} />
    </>
  ),
};

const RARITY_TAG: Record<Rarity, string> = {
  starter: '#5E6B85',
  common: '#4E6E8E',
  uncommon: '#2F7F78',
  rare: '#83508F',
};

/** A Charm as a hanging tag sticker: shadow, white edge, coloured tag, inked symbol. */
export function CharmArt({ id, size }: { id: string; size: number }) {
  const def = charmDef(id);
  const fill = def.race ? raceColors[def.race].main : RARITY_TAG[def.rarity];
  const symbol = CHARM_SYMBOLS[id];
  return (
    <Svg width={size} height={size} viewBox="-6 -6 112 112">
      <Rect x={4} y={9} width={92} height={92} rx={24} fill="rgba(15,8,15,0.35)" />
      <Rect x={2} y={2} width={92} height={92} rx={24} fill="#FFFFFF" />
      <Rect x={7} y={7} width={82} height={82} rx={20} fill={fill} stroke={colors.ink} strokeWidth={3} />
      <Circle cx={48} cy={15} r={4} fill={colors.ink} />
      <G transform="translate(48 52) scale(0.86) translate(-50 -50)" stroke={colors.ink} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" fill={P}>
        {symbol ? symbol() : <Circle cx={50} cy={50} r={20} />}
      </G>
    </Svg>
  );
}
