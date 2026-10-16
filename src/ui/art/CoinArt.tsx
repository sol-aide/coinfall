import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { coinDef, type Face, type Race } from '../../engine';
import { colors, raceColors } from '../theme';
import { GLYPHS, raceEmblem } from './glyphs';

interface Props {
  defId: string;
  face?: Face;
  size: number;
  level?: number;
  engraved?: boolean;
}

const INK = colors.ink;
const OUTLINE = 7;
const STUDS = Array.from({ length: 12 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 12;
  return { x: 50 + Math.cos(a) * 41.5, y: 50 + Math.sin(a) * 41.5 };
});

/**
 * A chunky toy coin drawn in SVG: thick ink outline, a studded race-coloured rim,
 * a candy face with a glossy highlight, and the character glyph drawn twice
 * (once fat in ink for the outline, once in colour on top).
 */
function CoinArtImpl({ defId, face = 'heads', size, level = 1, engraved }: Props) {
  const def = coinDef(defId);
  const rc = raceColors[def.race];
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const glyph = GLYPHS[defId] ?? GLYPHS.copper;
  const heads = face === 'heads';
  const isCopper = def.race === 'neutral';
  const faceA = heads ? (isCopper ? '#FFD2A6' : '#FFF3B0') : rc.light;
  const faceB = heads ? (isCopper ? '#E07B30' : '#FFC21F') : rc.main;
  const glyphInk = heads ? (isCopper ? '#9C4D12' : rc.main) : '#FFFFFF';
  const glyphAccent = heads ? '#FFFFFF' : rc.dark;

  return (
    <Svg width={size} height={size} viewBox="-3 -3 106 106">
      <Defs>
        <RadialGradient id={`f${id}`} cx="38%" cy="30%" r="75%">
          <Stop offset="0" stopColor={faceA} />
          <Stop offset="1" stopColor={faceB} />
        </RadialGradient>
      </Defs>
      {/* drop shadow + rim */}
      <Circle cx={50} cy={55} r={47} fill="rgba(20,8,40,0.45)" />
      <Circle cx={50} cy={50} r={47} fill={heads ? rc.main : rc.dark} stroke={INK} strokeWidth={4} />
      {STUDS.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3.1} fill={heads ? rc.light : rc.main} stroke={INK} strokeWidth={1.4} />
      ))}
      {/* face */}
      <Circle cx={50} cy={50} r={35} fill={`url(#f${id})`} stroke={INK} strokeWidth={3.5} />
      <Path d="M24 58 A27 27 0 0 0 76 58" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth={5} strokeLinecap="round" />
      {heads ? (
        <G transform="translate(50 51) scale(0.6) translate(-50 -50)">
          <G stroke={INK} strokeWidth={OUTLINE} strokeLinejoin="round" strokeLinecap="round">
            {glyph(INK, INK, OUTLINE)}
          </G>
          {glyph(glyphInk, glyphAccent, 0)}
        </G>
      ) : (
        <G transform="translate(50 51) scale(0.5) translate(-50 -50)">
          <G stroke={INK} strokeWidth={9} strokeLinejoin="round">
            {raceEmblem(def.race as Race, INK, 9)}
          </G>
          {raceEmblem(def.race as Race, '#FFFFFF')}
        </G>
      )}
      {/* gloss */}
      <Ellipse cx={34} cy={30} rx={13} ry={6.5} fill="#FFFFFF" opacity={0.6} transform="rotate(-32 34 30)" />
      <Circle cx={24} cy={41} r={2.6} fill="#FFFFFF" opacity={0.55} />
      {level > 1 &&
        Array.from({ length: level }).map((_, i) => {
          const cx = 50 + (i - (level - 1) / 2) * 15;
          return <Polygon key={i} points={star(cx, 7, 8)} fill="#FFE04A" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />;
        })}
      {engraved && <Polygon points="86,62 95,72 86,82 77,72" fill="#8FF3FF" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />}
    </Svg>
  );
}

export function star(cx: number, cy: number, r: number, points = 5, inner = 0.48): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

export const CoinArt = React.memo(CoinArtImpl);

export function RaceBadge({ race, size }: { race: keyof typeof raceColors; size: number }) {
  const rc = raceColors[race];
  return (
    <Svg width={size} height={size} viewBox="-3 -3 106 106">
      <Circle cx={50} cy={54} r={47} fill="rgba(20,8,40,0.45)" />
      <Circle cx={50} cy={50} r={47} fill={rc.main} stroke={INK} strokeWidth={5} />
      <G transform="translate(50 50) scale(0.66) translate(-50 -50)">
        <G stroke={INK} strokeWidth={10} strokeLinejoin="round">
          {raceEmblem(race as Race, INK, 10)}
        </G>
        {raceEmblem(race as Race, '#FFFFFF')}
      </G>
      <Ellipse cx={33} cy={27} rx={13} ry={6} fill="#FFFFFF" opacity={0.45} transform="rotate(-32 33 27)" />
    </Svg>
  );
}
