import React from 'react';
import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import type { Race } from '../../engine';

// Hand-drawn vector glyphs for every coin, drawn in a 100x100 box centred on 50,50.
// `ink` is the main stroke/fill colour, `accent` a secondary colour.

type GlyphFn = (ink: string, accent: string) => React.ReactNode;

const sw = { strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

export const GLYPHS: Record<string, GlyphFn> = {
  copper: (ink) => (
    <G>
      <Circle cx={50} cy={50} r={17} stroke={ink} {...sw} />
      <Rect x={44} y={44} width={12} height={12} fill={ink} rx={2} />
    </G>
  ),
  // ---------------------------------------------------------- Humans
  squire: (ink, accent) => (
    <G>
      <Path d="M30 62 L30 46 Q30 28 50 28 Q70 28 70 46 L70 62 Z" fill={ink} />
      <Rect x={36} y={44} width={28} height={6} rx={3} fill={accent} />
      <Path d="M50 22 L50 30" stroke={accent} {...sw} />
      <Rect x={28} y={62} width={44} height={8} rx={3} fill={ink} />
    </G>
  ),
  merchant: (ink) => (
    <G>
      <Line x1={50} y1={26} x2={50} y2={72} stroke={ink} {...sw} />
      <Line x1={28} y1={34} x2={72} y2={34} stroke={ink} {...sw} />
      <Path d="M22 52 Q28 62 34 52 Z" fill={ink} stroke={ink} strokeWidth={3} />
      <Path d="M66 52 Q72 62 78 52 Z" fill={ink} stroke={ink} strokeWidth={3} />
      <Line x1={28} y1={34} x2={24} y2={52} stroke={ink} strokeWidth={2} />
      <Line x1={28} y1={34} x2={32} y2={52} stroke={ink} strokeWidth={2} />
      <Line x1={72} y1={34} x2={68} y2={52} stroke={ink} strokeWidth={2} />
      <Line x1={72} y1={34} x2={76} y2={52} stroke={ink} strokeWidth={2} />
      <Rect x={40} y={70} width={20} height={5} rx={2} fill={ink} />
    </G>
  ),
  moneychanger: (ink, accent) => (
    <G>
      <Ellipse cx={50} cy={66} rx={20} ry={7} fill={ink} />
      <Ellipse cx={50} cy={56} rx={20} ry={7} fill={accent} stroke={ink} strokeWidth={3} />
      <Ellipse cx={50} cy={46} rx={20} ry={7} fill={ink} />
      <Ellipse cx={50} cy={36} rx={20} ry={7} fill={accent} stroke={ink} strokeWidth={3} />
    </G>
  ),
  captain: (ink, accent) => (
    <G>
      <Line x1={34} y1={24} x2={34} y2={76} stroke={ink} {...sw} />
      <Path d="M36 26 L70 32 L58 40 L70 48 L36 52 Z" fill={accent} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
      <Circle cx={34} cy={22} r={4} fill={ink} />
    </G>
  ),
  bard: (ink, accent) => (
    <G>
      <Ellipse cx={42} cy={60} rx={15} ry={14} fill={ink} />
      <Circle cx={42} cy={60} r={5} fill={accent} />
      <Line x1={50} y1={50} x2={70} y2={28} stroke={ink} {...sw} />
      <Rect x={66} y={20} width={10} height={10} rx={2} fill={ink} transform="rotate(42 71 25)" />
    </G>
  ),
  apprentice: (ink, accent) => (
    <G>
      <Path d="M70 24 Q44 30 36 64 L42 66 Q52 40 70 24 Z" fill={ink} />
      <Path d="M70 24 Q62 50 42 66" stroke={accent} strokeWidth={3} fill="none" />
      <Line x1={36} y1={64} x2={30} y2={76} stroke={ink} {...sw} />
    </G>
  ),
  patron: (ink, accent) => (
    <G>
      <Rect x={28} y={42} width={44} height={32} rx={4} fill={ink} />
      <Rect x={25} y={34} width={50} height={10} rx={3} fill={ink} />
      <Rect x={46} y={34} width={8} height={40} fill={accent} />
      <Path d="M50 34 Q38 20 34 30 Q34 36 50 34 Q62 36 66 30 Q62 20 50 34 Z" fill={accent} />
    </G>
  ),
  innkeeper: (ink, accent) => (
    <G>
      <Rect x={30} y={34} width={30} height={40} rx={4} fill={ink} />
      <Path d="M60 42 Q74 42 74 54 Q74 66 60 66" stroke={ink} {...sw} />
      <Path d="M28 34 Q32 24 40 28 Q46 20 52 28 Q60 24 62 34 Z" fill={accent} />
      <Line x1={38} y1={44} x2={38} y2={66} stroke={accent} strokeWidth={3} />
      <Line x1={52} y1={44} x2={52} y2={66} stroke={accent} strokeWidth={3} />
    </G>
  ),
  tinker: (ink, accent) => (
    <G>
      <Polygon
        points="50,22 56,30 66,26 66,36 76,40 70,48 76,58 66,62 66,72 56,70 50,78 44,70 34,72 34,62 24,58 30,50 24,40 34,36 34,26 44,30"
        fill={ink}
      />
      <Circle cx={50} cy={50} r={9} fill={accent} />
    </G>
  ),
  guildmaster: (ink, accent) => (
    <G>
      <Path d="M24 64 L28 32 L40 48 L50 26 L60 48 L72 32 L76 64 Z" fill={ink} strokeLinejoin="round" />
      <Rect x={24} y={64} width={52} height={10} rx={3} fill={ink} />
      <Circle cx={50} cy={58} r={5} fill={accent} />
      <Circle cx={36} cy={60} r={3} fill={accent} />
      <Circle cx={64} cy={60} r={3} fill={accent} />
    </G>
  ),
  // ---------------------------------------------------------- Orcs
  grunt: (ink, accent) => (
    <G>
      <Path d="M38 40 Q38 26 50 26 Q62 26 62 40" stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Circle cx={50} cy={58} r={20} fill={ink} />
      <Rect x={40} y={54} width={20} height={6} rx={3} fill={accent} />
    </G>
  ),
  berserker: (ink, accent) => (
    <G>
      <Line x1={50} y1={22} x2={50} y2={78} stroke={ink} {...sw} strokeWidth={6} />
      <Path d="M50 30 Q30 22 24 40 Q30 52 50 46 Z" fill={ink} />
      <Path d="M50 30 Q70 22 76 40 Q70 52 50 46 Z" fill={ink} />
      <Path d="M28 40 Q32 30 44 32" stroke={accent} strokeWidth={2} fill="none" />
      <Path d="M72 40 Q68 30 56 32" stroke={accent} strokeWidth={2} fill="none" />
    </G>
  ),
  charger: (ink, accent) => (
    <G>
      <Path d="M30 50 Q30 34 50 34 Q70 34 70 50 Q70 68 50 72 Q30 68 30 50 Z" fill={ink} />
      <Path d="M32 42 Q18 34 22 22 Q28 34 40 36 Z" fill={accent} />
      <Path d="M68 42 Q82 34 78 22 Q72 34 60 36 Z" fill={accent} />
      <Ellipse cx={50} cy={62} rx={9} ry={6} fill={accent} />
      <Circle cx={41} cy={48} r={3} fill={accent} />
      <Circle cx={59} cy={48} r={3} fill={accent} />
    </G>
  ),
  shaman: (ink, accent) => (
    <G>
      <Line x1={50} y1={40} x2={50} y2={80} stroke={ink} {...sw} />
      <Path d="M36 30 Q36 18 50 18 Q64 18 64 30 L64 40 Q50 48 36 40 Z" fill={ink} />
      <Circle cx={44} cy={30} r={3.5} fill={accent} />
      <Circle cx={56} cy={30} r={3.5} fill={accent} />
      <Path d="M36 44 L28 56 M64 44 L72 56" stroke={accent} strokeWidth={4} strokeLinecap="round" />
    </G>
  ),
  firebrand: (ink, accent) => (
    <G>
      <Path d="M50 20 Q66 38 64 54 Q70 48 70 42 Q80 60 68 72 Q60 80 50 80 Q36 80 30 70 Q22 56 34 42 Q34 52 40 56 Q36 36 50 20 Z" fill={ink} />
      <Path d="M50 48 Q60 58 56 68 Q52 74 48 74 Q40 72 42 62 Q44 56 50 48 Z" fill={accent} />
    </G>
  ),
  wrecker: (ink, accent) => (
    <G>
      <Line x1={36} y1={74} x2={58} y2={40} stroke={ink} strokeWidth={7} strokeLinecap="round" />
      <Rect x={44} y={20} width={34} height={20} rx={4} fill={ink} transform="rotate(33 61 30)" />
      <Rect x={50} y={24} width={8} height={12} rx={2} fill={accent} transform="rotate(33 61 30)" />
    </G>
  ),
  looter: (ink, accent) => (
    <G>
      <Path d="M40 34 Q26 46 28 62 Q30 76 50 76 Q70 76 72 62 Q74 46 60 34 Z" fill={ink} />
      <Path d="M40 34 L36 24 L64 24 L60 34 Z" fill={ink} />
      <Line x1={38} y1={34} x2={62} y2={34} stroke={accent} strokeWidth={4} strokeLinecap="round" />
      <Circle cx={50} cy={56} r={8} fill={accent} />
    </G>
  ),
  brawler: (ink, accent) => (
    <G>
      <Rect x={28} y={34} width={44} height={30} rx={10} fill={ink} />
      <Rect x={36} y={60} width={28} height={16} rx={4} fill={ink} />
      <Line x1={39} y1={36} x2={39} y2={48} stroke={accent} strokeWidth={3} strokeLinecap="round" />
      <Line x1={50} y1={36} x2={50} y2={48} stroke={accent} strokeWidth={3} strokeLinecap="round" />
      <Line x1={61} y1={36} x2={61} y2={48} stroke={accent} strokeWidth={3} strokeLinecap="round" />
      <Path d="M28 50 Q20 52 24 60 L34 60" fill={ink} />
    </G>
  ),
  warlord: (ink, accent) => (
    <G>
      <Path d="M30 66 L30 48 Q30 32 50 32 Q70 32 70 48 L70 66 Z" fill={ink} />
      <Path d="M32 44 Q18 36 20 18 Q26 32 38 36 Z" fill={accent} />
      <Path d="M68 44 Q82 36 80 18 Q74 32 62 36 Z" fill={accent} />
      <Rect x={46} y={46} width={8} height={20} fill={accent} />
      <Rect x={26} y={64} width={48} height={8} rx={3} fill={ink} />
    </G>
  ),
  // ---------------------------------------------------------- Elves
  archer: (ink, accent) => (
    <G>
      <Path d="M38 22 Q70 50 38 78" stroke={ink} {...sw} />
      <Line x1={38} y1={22} x2={38} y2={78} stroke={ink} strokeWidth={2} />
      <Line x1={30} y1={50} x2={74} y2={50} stroke={accent} strokeWidth={4} strokeLinecap="round" />
      <Polygon points="78,50 68,44 68,56" fill={accent} />
    </G>
  ),
  moonpriestess: (ink, accent) => (
    <G>
      <Path d="M58 22 A28 28 0 1 0 58 78 A22 22 0 1 1 58 22 Z" fill={ink} />
      <Polygon points="66,40 68,46 74,46 69,50 71,56 66,52 61,56 63,50 58,46 64,46" fill={accent} />
    </G>
  ),
  sentinel: (ink, accent) => (
    <G>
      <Path d="M50 22 L74 30 L72 54 Q66 70 50 78 Q34 70 28 54 L26 30 Z" fill={ink} />
      <Ellipse cx={50} cy={48} rx={13} ry={8} fill={accent} />
      <Circle cx={50} cy={48} r={5} fill={ink} />
    </G>
  ),
  bladedancer: (ink, accent) => (
    <G>
      <Line x1={28} y1={74} x2={72} y2={26} stroke={ink} strokeWidth={5} strokeLinecap="round" />
      <Line x1={72} y1={74} x2={28} y2={26} stroke={ink} strokeWidth={5} strokeLinecap="round" />
      <Line x1={30} y1={62} x2={40} y2={72} stroke={accent} strokeWidth={5} strokeLinecap="round" />
      <Line x1={70} y1={62} x2={60} y2={72} stroke={accent} strokeWidth={5} strokeLinecap="round" />
    </G>
  ),
  ranger: (ink, accent) => (
    <G>
      <Polygon points="50,20 68,46 58,46 72,64 28,64 42,46 32,46" fill={ink} />
      <Rect x={46} y={64} width={8} height={12} fill={accent} />
    </G>
  ),
  seer: (ink, accent) => (
    <G>
      <Path d="M20 50 Q50 20 80 50 Q50 80 20 50 Z" fill={ink} />
      <Circle cx={50} cy={50} r={12} fill={accent} />
      <Circle cx={50} cy={50} r={5} fill={ink} />
    </G>
  ),
  longbow: (ink, accent) => (
    <G>
      <Circle cx={50} cy={50} r={26} fill={ink} />
      <Circle cx={50} cy={50} r={17} fill={accent} />
      <Circle cx={50} cy={50} r={8} fill={ink} />
      <Line x1={50} y1={50} x2={78} y2={22} stroke={accent} strokeWidth={4} strokeLinecap="round" />
    </G>
  ),
  druid: (ink, accent) => (
    <G>
      <Line x1={50} y1={78} x2={50} y2={44} stroke={ink} {...sw} />
      <Path d="M50 50 Q28 50 24 30 Q46 28 50 50 Z" fill={ink} />
      <Path d="M50 44 Q72 44 76 24 Q54 22 50 44 Z" fill={ink} />
      <Path d="M50 50 Q36 44 30 34" stroke={accent} strokeWidth={2} fill="none" />
      <Path d="M50 44 Q64 38 70 28" stroke={accent} strokeWidth={2} fill="none" />
    </G>
  ),
  starweaver: (ink, accent) => (
    <G>
      <Polygon points="50,18 58,40 82,42 63,57 70,80 50,67 30,80 37,57 18,42 42,40" fill={ink} />
      <Circle cx={50} cy={52} r={7} fill={accent} />
    </G>
  ),
};

/** Race emblem used on tails faces and labels. */
export function raceEmblem(race: Race, ink: string): React.ReactNode {
  switch (race) {
    case 'human':
      return <Path d="M50 22 L74 30 Q74 62 50 78 Q26 62 26 30 Z" fill={ink} />;
    case 'orc':
      return (
        <G>
          <Path d="M30 72 Q22 40 40 24 Q34 46 42 70 Z" fill={ink} />
          <Path d="M70 72 Q78 40 60 24 Q66 46 58 70 Z" fill={ink} />
        </G>
      );
    case 'elf':
      return (
        <G>
          <Path d="M50 18 Q78 40 50 82 Q22 40 50 18 Z" fill={ink} />
          <Line x1={50} y1={30} x2={50} y2={76} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
        </G>
      );
    default:
      return <Circle cx={50} cy={50} r={18} stroke={ink} strokeWidth={6} fill="none" />;
  }
}
