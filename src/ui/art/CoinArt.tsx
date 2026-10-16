import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { coinDef, type Face, type Race } from '../../engine';
import { colors, raceColors } from '../theme';
import { GLYPHS, raceEmblem } from './glyphs';

interface Props {
  defId: string;
  face?: Face;
  size: number;
  level?: number;
  engraved?: boolean;
  /** Skip the drop shadow (the 3D table coin draws its own). */
  bare?: boolean;
}

const TICKS = Array.from({ length: 40 }, (_, i) => (Math.PI * 2 * i) / 40);

/** Mixes a hex colour toward black (t<0) or white (t>0). */
export function tone(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (c: number) => Math.round(t < 0 ? c * (1 + t) : c + (255 - c) * t);
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Face colours for a coin: gold heads, copper for plain coins, race colour for tails. */
export function coinPalette(race: Race, heads: boolean) {
  const rc = raceColors[race];
  const copper = race === 'neutral';
  const face = heads
    ? copper
      ? { hi: '#FFD9B3', mid: '#E2914F', lo: '#A85B22' }
      : { hi: '#FFF2B8', mid: '#F7C643', lo: '#D18D16' }
    : { hi: tone(rc.main, 0.35), mid: rc.main, lo: rc.dark };
  const rim = heads ? { hi: rc.light, mid: rc.main, lo: rc.dark } : { hi: rc.main, mid: rc.dark, lo: tone(rc.dark, -0.35) };
  return { face, rim, edge: tone(rim.lo, -0.15), edgeHi: rim.mid };
}

/**
 * A coin drawn as embossed metal: a beveled, reeded rim in the race colour, a
 * recessed gradient face, the character glyph raised in relief, and a soft
 * specular highlight. Heads shows the character, tails the race emblem.
 */
function CoinArtImpl({ defId, face = 'heads', size, level = 1, engraved, bare }: Props) {
  const def = coinDef(defId);
  const rc = raceColors[def.race];
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const glyph = GLYPHS[defId] ?? GLYPHS.copper;
  const heads = face === 'heads';
  const copper = def.race === 'neutral';
  const p = coinPalette(def.race, heads);
  const glyphFill = heads ? (copper ? '#8E4E1C' : rc.main) : colors.paper;
  const glyphAccent = heads ? '#FFFFFF' : rc.dark;
  const relief = heads ? (copper ? '#7A3F12' : '#9A6510') : tone(rc.dark, -0.4);

  return (
    <Svg width={size} height={size} viewBox="-6 -6 112 112">
      <Defs>
        <LinearGradient id={`rim${id}`} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
          <Stop offset="0" stopColor={p.rim.hi} />
          <Stop offset="0.5" stopColor={p.rim.mid} />
          <Stop offset="1" stopColor={p.rim.lo} />
        </LinearGradient>
        <LinearGradient id={`bev${id}`} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
          <Stop offset="0" stopColor={p.rim.lo} />
          <Stop offset="1" stopColor={p.rim.hi} />
        </LinearGradient>
        <RadialGradient id={`face${id}`} cx="38%" cy="32%" r="75%">
          <Stop offset="0" stopColor={p.face.hi} />
          <Stop offset="0.55" stopColor={p.face.mid} />
          <Stop offset="1" stopColor={p.face.lo} />
        </RadialGradient>
        <RadialGradient id={`spec${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.85} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {!bare && <Ellipse cx={51} cy={57} rx={49} ry={46} fill="rgba(15,8,15,0.35)" />}
      {/* rim with reeding */}
      <Circle cx={50} cy={50} r={48} fill={`url(#rim${id})`} stroke={tone(p.rim.lo, -0.35)} strokeWidth={1.6} />
      {TICKS.map((a, i) => (
        <Line
          key={i}
          x1={50 + Math.cos(a) * 43.5}
          y1={50 + Math.sin(a) * 43.5}
          x2={50 + Math.cos(a) * 47}
          y2={50 + Math.sin(a) * 47}
          stroke={tone(p.rim.lo, -0.2)}
          strokeOpacity={0.45}
          strokeWidth={1.1}
        />
      ))}
      {/* inset bevel, then the recessed face */}
      <Circle cx={50} cy={50} r={40} fill={`url(#bev${id})`} />
      <Circle cx={50} cy={50} r={37} fill={`url(#face${id})`} />
      <Circle cx={50} cy={50} r={37} fill="none" stroke={tone(p.face.lo, -0.3)} strokeOpacity={0.5} strokeWidth={1} />
      {heads ? (
        <G transform="translate(50 51) scale(0.74) translate(-50 -50)">
          {/* relief: a soft shadow below-right and a highlight above-left */}
          <G transform="translate(1.6 2)" opacity={0.5} stroke={relief} strokeWidth={2.5} strokeLinejoin="round">
            {glyph(relief, relief, 2.5)}
          </G>
          <G transform="translate(-1.1 -1.2)" opacity={0.55} stroke="#FFFFFF" strokeWidth={1.5} strokeLinejoin="round">
            {glyph('#FFFFFF', '#FFFFFF', 1.5)}
          </G>
          {glyph(glyphFill, glyphAccent, 0)}
        </G>
      ) : (
        <G transform="translate(50 51) scale(0.58) translate(-50 -50)">
          <G transform="translate(1.8 2.2)" opacity={0.5}>
            {raceEmblem(def.race as Race, relief)}
          </G>
          {raceEmblem(def.race as Race, glyphFill)}
        </G>
      )}
      {/* specular highlight */}
      <Ellipse cx={34} cy={27} rx={18} ry={10} fill={`url(#spec${id})`} transform="rotate(-35 34 27)" />
      <Circle cx={24} cy={38} r={2.2} fill="#FFFFFF" opacity={0.7} />
      {level > 1 &&
        Array.from({ length: level }).map((_, i) => {
          const cx = 50 + (i - (level - 1) / 2) * 15;
          return (
            <G key={i}>
              <Polygon points={star(cx, 5, 9.5)} fill={tone(colors.gold, -0.45)} transform="translate(0.8 1.2)" />
              <Polygon points={star(cx, 5, 9)} fill={colors.gold} stroke="#FFF3C4" strokeWidth={1.2} strokeLinejoin="round" />
            </G>
          );
        })}
      {engraved && (
        <G>
          <Polygon points="88,61 98,72 88,83 78,72" fill="#2E7C8C" />
          <Polygon points="88,61 98,72 88,72 78,72" fill="#9BEAF5" />
          <Polygon points="88,61 98,72 88,83 78,72" fill="none" stroke="#1E4E58" strokeWidth={1.4} strokeLinejoin="round" />
        </G>
      )}
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

/** A round race medallion (title screen, charm cards) in the same embossed style. */
export function RaceBadge({ race, size }: { race: keyof typeof raceColors; size: number }) {
  const rc = raceColors[race];
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg width={size} height={size} viewBox="-6 -6 112 112">
      <Defs>
        <LinearGradient id={`b${id}`} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
          <Stop offset="0" stopColor={rc.light} />
          <Stop offset="0.5" stopColor={rc.main} />
          <Stop offset="1" stopColor={rc.dark} />
        </LinearGradient>
        <RadialGradient id={`s${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.8} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={51} cy={57} rx={49} ry={46} fill="rgba(15,8,15,0.35)" />
      <Circle cx={50} cy={50} r={48} fill={`url(#b${id})`} stroke={tone(rc.dark, -0.35)} strokeWidth={1.6} />
      <G transform="translate(50 51) scale(0.62) translate(-50 -50)">
        <G transform="translate(1.8 2.2)" opacity={0.45}>
          {raceEmblem(race as Race, tone(rc.dark, -0.45))}
        </G>
        {raceEmblem(race as Race, colors.paper)}
      </G>
      <Ellipse cx={34} cy={27} rx={18} ry={10} fill={`url(#s${id})`} transform="rotate(-35 34 27)" />
    </Svg>
  );
}
