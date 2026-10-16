import React, { useId } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Polygon } from 'react-native-svg';
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
const BORDER = '#FFFFFF';
/** Extra stroke width for the glyph outline pass (in glyph units). */
const GLYPH_OUTLINE = 4.5;

/**
 * A coin drawn as a die-cut sticker: soft shadow, white border, warm ink
 * outline, then flat cel-shaded colour (one base tone, one hard-edged shadow
 * tone, a white specular). The character glyph is inked the same way.
 */
function CoinArtImpl({ defId, face = 'heads', size, level = 1, engraved }: Props) {
  const def = coinDef(defId);
  const rc = raceColors[def.race];
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const glyph = GLYPHS[defId] ?? GLYPHS.copper;
  const heads = face === 'heads';
  const copper = def.race === 'neutral';

  const rimBase = heads ? rc.main : rc.dark;
  const rimShade = heads ? rc.dark : shade(rc.dark);
  const faceBase = heads ? (copper ? '#F3B47A' : '#FFDF7E') : rc.main;
  const faceShade = heads ? (copper ? '#DB8C4A' : '#F2B41E') : rc.dark;
  const glyphFill = heads ? (copper ? '#9A5A24' : rc.main) : colors.paper;
  const glyphAccent = heads ? '#FFFFFF' : rc.dark;

  return (
    <Svg width={size} height={size} viewBox="-9 -9 118 118">
      <Defs>
        <ClipPath id={`r${id}`}>
          <Circle cx={50} cy={50} r={45} />
        </ClipPath>
        <ClipPath id={`f${id}`}>
          <Circle cx={50} cy={50} r={36} />
        </ClipPath>
      </Defs>
      {/* soft shadow, die-cut white border, ink outline */}
      <Ellipse cx={50} cy={57} rx={53} ry={51} fill="rgba(25,15,25,0.3)" />
      <Circle cx={50} cy={50} r={54} fill={BORDER} />
      <Circle cx={50} cy={50} r={48} fill={INK} />
      {/* rim: base + hard-edged shadow crescent */}
      <G clipPath={`url(#r${id})`}>
        <Circle cx={50} cy={50} r={45} fill={rimShade} />
        <Circle cx={46} cy={45} r={45} fill={rimBase} />
      </G>
      {/* face */}
      <Circle cx={50} cy={50} r={38.5} fill={INK} />
      <G clipPath={`url(#f${id})`}>
        <Circle cx={50} cy={50} r={36} fill={faceShade} />
        <Circle cx={47} cy={46} r={36} fill={faceBase} />
      </G>
      {heads ? (
        <G transform="translate(50 51) scale(0.76) translate(-50 -50)">
          <G stroke={INK} strokeWidth={GLYPH_OUTLINE} strokeLinejoin="round" strokeLinecap="round">
            {glyph(INK, INK, GLYPH_OUTLINE)}
          </G>
          {glyph(glyphFill, glyphAccent, 0)}
        </G>
      ) : (
        <G transform="translate(50 51) scale(0.6) translate(-50 -50)">
          <G stroke={INK} strokeWidth={7} strokeLinejoin="round">
            {raceEmblem(def.race as Race, INK, 7)}
          </G>
          {raceEmblem(def.race as Race, colors.paper)}
        </G>
      )}
      {/* specular highlights */}
      <Ellipse cx={30} cy={25} rx={8} ry={4.2} fill="#FFFFFF" opacity={0.85} transform="rotate(-38 30 25)" />
      <Circle cx={22} cy={35} r={2.4} fill="#FFFFFF" opacity={0.85} />
      {level > 1 &&
        Array.from({ length: level }).map((_, i) => {
          const cx = 50 + (i - (level - 1) / 2) * 16;
          return (
            <G key={i}>
              <Polygon points={star(cx, 4, 10.5)} fill={BORDER} stroke={BORDER} strokeWidth={5} strokeLinejoin="round" />
              <Polygon points={star(cx, 4, 9)} fill={colors.gold} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
            </G>
          );
        })}
      {engraved && (
        <G>
          <Polygon points="88,60 99,72 88,84 77,72" fill={BORDER} stroke={BORDER} strokeWidth={6} strokeLinejoin="round" />
          <Polygon points="88,60 99,72 88,84 77,72" fill="#8FE3F0" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        </G>
      )}
    </Svg>
  );
}

/** Darkens a hex colour by ~25% (for a second cel tone). */
function shade(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(c * 0.75);
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
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

/** A round race sticker (used on the title screen and charm cards). */
export function RaceBadge({ race, size }: { race: keyof typeof raceColors; size: number }) {
  const rc = raceColors[race];
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg width={size} height={size} viewBox="-9 -9 118 118">
      <Defs>
        <ClipPath id={`b${id}`}>
          <Circle cx={50} cy={50} r={45} />
        </ClipPath>
      </Defs>
      <Ellipse cx={50} cy={57} rx={53} ry={51} fill="rgba(25,15,25,0.3)" />
      <Circle cx={50} cy={50} r={54} fill={BORDER} />
      <Circle cx={50} cy={50} r={48} fill={INK} />
      <G clipPath={`url(#b${id})`}>
        <Circle cx={50} cy={50} r={45} fill={rc.dark} />
        <Circle cx={46} cy={45} r={45} fill={rc.main} />
      </G>
      <G transform="translate(50 50) scale(0.62) translate(-50 -50)">
        <G stroke={INK} strokeWidth={8} strokeLinejoin="round">
          {raceEmblem(race as Race, INK, 8)}
        </G>
        {raceEmblem(race as Race, colors.paper)}
      </G>
      <Ellipse cx={30} cy={24} rx={9} ry={4.5} fill="#FFFFFF" opacity={0.8} transform="rotate(-38 30 24)" />
    </Svg>
  );
}
