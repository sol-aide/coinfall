import React, { useId } from 'react';
import Svg, { Circle, Defs, G, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { coinDef, type Face } from '../../engine';
import { raceColors } from '../theme';
import { GLYPHS, raceEmblem } from './glyphs';

interface Props {
  defId: string;
  face?: Face;
  size: number;
  level?: number;
  engraved?: boolean;
}

/** A coin drawn entirely in SVG: race-coloured rim, golden heads face with the
 * character glyph, or a race-coloured tails face with the race emblem. */
function CoinArtImpl({ defId, face = 'heads', size, level = 1, engraved }: Props) {
  const def = coinDef(defId);
  const rc = raceColors[def.race];
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const glyph = GLYPHS[defId] ?? GLYPHS.copper;
  const heads = face === 'heads';
  const isCopper = def.race === 'neutral';
  const faceA = heads ? (isCopper ? '#F2B27A' : '#FFE9A3') : rc.light;
  const faceB = heads ? (isCopper ? '#B8692E' : '#E7A92E') : rc.main;
  const ink = heads ? rc.dark : 'rgba(255,255,255,0.9)';
  const accent = heads ? (isCopper ? '#FFD9B0' : '#FFF6D6') : rc.dark;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`f${id}`} cx="40%" cy="35%" r="70%">
          <Stop offset="0" stopColor={faceA} />
          <Stop offset="1" stopColor={faceB} />
        </RadialGradient>
      </Defs>
      <Circle cx={50} cy={52} r={47} fill="rgba(0,0,0,0.28)" />
      <Circle cx={50} cy={50} r={47} fill={rc.dark} />
      <Circle cx={50} cy={50} r={42} fill={rc.main} />
      <Circle cx={50} cy={50} r={36} fill={`url(#f${id})`} />
      <Circle cx={50} cy={50} r={36} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
      {!heads && <Circle cx={50} cy={50} r={42} fill="rgba(10,12,30,0.32)" />}
      {heads ? (
        <G transform="translate(50 50) scale(0.74) translate(-50 -50)">{glyph(ink, accent)}</G>
      ) : (
        <G transform="translate(50 50) scale(0.55) translate(-50 -50)" opacity={0.9}>
          {raceEmblem(def.race, ink)}
        </G>
      )}
      {level > 1 &&
        Array.from({ length: level }).map((_, i) => {
          const cx = 50 + (i - (level - 1) / 2) * 13;
          return (
            <Polygon
              key={i}
              points={star(cx, 8.5, 6)}
              fill="#FFE27A"
              stroke="#7A4E00"
              strokeWidth={1.2}
            />
          );
        })}
      {engraved && <Polygon points="86,64 93,72 86,80 79,72" fill="#B9F3FF" stroke="#1B5E7A" strokeWidth={1.5} />}
    </Svg>
  );
}

function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

export const CoinArt = React.memo(CoinArtImpl);

export function RaceBadge({ race, size }: { race: keyof typeof raceColors; size: number }) {
  const rc = raceColors[race];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={48} fill={rc.main} />
      <G transform="translate(50 50) scale(0.7) translate(-50 -50)">{raceEmblem(race, '#FFFFFF')}</G>
    </Svg>
  );
}
