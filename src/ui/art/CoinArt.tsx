import React, { useId } from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { coinDef, type Face } from '../../engine';
import { colors, raceColors } from '../theme';
import { GLYPHS, raceEmblem } from './glyphs';

interface Props {
  defId: string;
  face?: Face;
  size: number;
  level?: number;
  engraved?: boolean;
  /** Draw the hard paper shadow under the sticker (off when the caller animates its own). */
  shadow?: boolean;
  /** Only draw one torn half (for the destruction effect). */
  half?: 'left' | 'right';
}

/** A zig-zag tear down the middle of the coin. */
const TEAR = [50, 0, 56, 12, 46, 24, 55, 36, 45, 48, 56, 60, 46, 72, 54, 84, 48, 100];
const tearPoints = (side: 'left' | 'right') => {
  const zig: string[] = [];
  for (let i = 0; i < TEAR.length; i += 2) zig.push(`${TEAR[i]},${TEAR[i + 1]}`);
  return side === 'left' ? `0,0 ${zig.join(' ')} 0,100` : `100,0 ${zig.join(' ')} 100,100`;
};

const INK = colors.ink;

/** Rim notches, pre-computed once: little cuts around the edge make it read as a coin. */
const NOTCHES = Array.from({ length: 16 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 16;
  return { x: 50 + Math.cos(a) * 40.5, y: 50 + Math.sin(a) * 40.5, deg: (a * 180) / Math.PI };
});

/**
 * A coin drawn as a cut-paper sticker: white die-cut edge, thin brown ink line,
 * flat colours with one hard-edged shadow crescent (cel shading, no gradients)
 * and a single highlight stroke. Heads is a bright gold (or copper) face with the
 * character glyph; tails is a dark race-coloured face with the race emblem.
 */
function CoinArtImpl({ defId, face = 'heads', size, level = 1, engraved, shadow = true, half }: Props) {
  const clipId = `tear${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const def = coinDef(defId);
  const rc = raceColors[def.race];
  const glyph = GLYPHS[defId] ?? GLYPHS.copper;
  const heads = face === 'heads';
  const isCopper = def.race === 'neutral';
  const faceFill = heads ? (isCopper ? '#F1AE72' : '#FFD45C') : rc.dark;
  const faceShade = heads ? (isCopper ? '#CF8447' : '#EBA92A') : '#00000000';
  const glyphInk = heads ? rc.dark : rc.light;
  const glyphAccent = heads ? (isCopper ? '#FFE3C4' : '#FFF4CF') : rc.dark;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {half && (
        <Defs>
          <ClipPath id={clipId}>
            <Polygon points={tearPoints(half)} />
          </ClipPath>
        </Defs>
      )}
      <G clipPath={half ? `url(#${clipId})` : undefined}>
        {shadow && <Circle cx={51.5} cy={54} r={48} fill="#54341A" opacity={0.26} />}
        {/* die-cut sticker edge */}
        <Circle cx={50} cy={50} r={48} fill={colors.sticker} />
        {/* rim with a hard shadow crescent toward the lower right */}
        <Circle cx={50} cy={50} r={44} fill={rc.dark} />
        <Circle cx={48.6} cy={48.4} r={42.2} fill={rc.main} />
        {NOTCHES.map((n, i) => (
          <Rect key={i} x={n.x - 2.6} y={n.y - 0.9} width={5.2} height={1.8} rx={0.9} fill={rc.dark} opacity={0.45} transform={`rotate(${n.deg} ${n.x} ${n.y})`} />
        ))}
        <Circle cx={50} cy={50} r={44} fill="none" stroke={INK} strokeWidth={2.2} />
        {/* face */}
        <Circle cx={50} cy={50} r={34} fill={heads ? faceShade : rc.dark} />
        <Circle cx={48.8} cy={48.6} r={32.6} fill={faceFill} />
        {!heads && <Circle cx={50} cy={50} r={33} fill="#1C120A" opacity={0.28} />}
        <Circle cx={50} cy={50} r={34} fill="none" stroke={INK} strokeWidth={1.6} />
        {heads ? (
          <G transform="translate(50 50) scale(0.74) translate(-50 -50)">{glyph(glyphInk, glyphAccent)}</G>
        ) : (
          <G transform="translate(50 50) scale(0.55) translate(-50 -50)">{raceEmblem(def.race, glyphInk)}</G>
        )}
        {/* one hand-cut highlight on the rim */}
        <Path d="M17.5 38 A34 34 0 0 1 34 17.5" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" fill="none" opacity={heads ? 0.75 : 0.45} />
        {level > 1 &&
          Array.from({ length: level }).map((_, i) => {
            const cx = 50 + (i - (level - 1) / 2) * 14;
            const pts = star(cx, 8.5, 7);
            return (
              <G key={i}>
                <Polygon points={pts} fill={colors.sticker} stroke={colors.sticker} strokeWidth={4} strokeLinejoin="round" />
                <Polygon points={pts} fill="#FFD45C" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
              </G>
            );
          })}
        {engraved && (
          <G>
            <Polygon points="86,63 94,72 86,81 78,72" fill={colors.sticker} stroke={colors.sticker} strokeWidth={4} strokeLinejoin="round" />
            <Polygon points="86,63 94,72 86,81 78,72" fill="#9EE6F5" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
            <Polygon points="86,63 89,72 86,81 83,72" fill="#5CC4DD" />
          </G>
        )}
        {half && <Polyline points={tearEdge} stroke={colors.sticker} strokeWidth={3} fill="none" strokeLinejoin="round" />}
      </G>
    </Svg>
  );
}

const tearEdge = TEAR.reduce<string[]>((acc, v, i) => (i % 2 ? acc : [...acc, `${v},${TEAR[i + 1]}`]), []).join(' ');

function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.48;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

export const CoinArt = React.memo(CoinArtImpl);

/** Small race sticker: white die-cut edge, race colour, cream emblem. */
export function RaceBadge({ race, size }: { race: keyof typeof raceColors; size: number }) {
  const rc = raceColors[race];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={51} cy={53} r={47} fill="#54341A" opacity={0.25} />
      <Circle cx={50} cy={50} r={47} fill={colors.sticker} />
      <Circle cx={50} cy={50} r={40} fill={rc.dark} />
      <Circle cx={48.5} cy={48.5} r={38.5} fill={rc.main} />
      <Circle cx={50} cy={50} r={40} fill="none" stroke={INK} strokeWidth={2.5} />
      <G transform="translate(50 50) scale(0.62) translate(-50 -50)">{raceEmblem(race, '#FFF8EA')}</G>
    </Svg>
  );
}
