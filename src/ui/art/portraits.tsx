import React from 'react';
import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import type { Race } from '../../engine';

// Character portraits for the heads side of every coin: embossed busts, like
// the head on a real coin. Drawn in a 100x100 box centred on 50,50, in two
// tones: `ink` is the raised metal (the race colour), `accent` the bright
// engraved lines and highlights that separate shapes. `o` widens strokes for
// the relief passes (see CoinArt). All art is original.

export type PortraitFn = (ink: string, accent: string, o: number) => React.ReactNode;

const line = (o: number, w = 2.4) => ({ strokeWidth: w + o, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

/** Shoulders and neck, shared by every bust. `collar` adds a race-neutral collar line. */
function bust(ink: string, accent: string, o: number, collar = true) {
  return (
    <G>
      <Path d="M14 100 Q16 76 50 73 Q84 76 86 100 Z" fill={ink} />
      <Rect x={43} y={60} width={14} height={16} rx={4} fill={ink} />
      {collar && <Path d="M34 78 Q50 88 66 78" stroke={accent} fill="none" {...line(o, 2)} />}
    </G>
  );
}

/** Head shapes by race. Each returns the head (ink) with ears; the face is drawn separately. */
function head(race: Race, ink: string, accent: string, o: number) {
  switch (race) {
    case 'orc':
      return (
        <G>
          <Path d="M27 46 L17 39 L29 53 Z" fill={ink} />
          <Path d="M73 46 L83 39 L71 53 Z" fill={ink} />
          <Path d="M30 38 Q30 23 50 23 Q70 23 70 38 L72 52 Q70 68 50 69 Q30 68 28 52 Z" fill={ink} />
          {/* tusks */}
          <Path d="M41 63 L42 55 L45 62 Z" fill={accent} stroke={accent} {...line(o, 0.6)} />
          <Path d="M59 63 L58 55 L55 62 Z" fill={accent} stroke={accent} {...line(o, 0.6)} />
          {/* heavy brow */}
          <Path d="M36 41 Q43 37 47 42 M53 42 Q57 37 64 41" stroke={accent} fill="none" {...line(o, 1.8)} />
        </G>
      );
    case 'elf':
      return (
        <G>
          <Path d="M37 45 L16 27 L35 54 Z" fill={ink} />
          <Path d="M63 45 L84 27 L65 54 Z" fill={ink} />
          <Ellipse cx={50} cy={45} rx={14.5} ry={19.5} fill={ink} />
          <Path d="M36 44 L22 32 M64 44 L78 32" stroke={accent} fill="none" {...line(o, 1.2)} />
        </G>
      );
    default:
      return (
        <G>
          <Circle cx={34} cy={47} r={4.5} fill={ink} />
          <Circle cx={66} cy={47} r={4.5} fill={ink} />
          <Ellipse cx={50} cy={45} rx={16.5} ry={19} fill={ink} />
        </G>
      );
  }
}

type Eyes = 'dots' | 'closed' | 'patch' | 'glow' | 'blind' | 'squint' | 'glasses' | 'monocle' | 'goggles' | 'loupe' | 'none';

/** Eyes and a small mouth line. Orcs sit a little lower and wider. */
function face(race: Race, eyes: Eyes, accent: string, o: number, smile = false) {
  const y = race === 'orc' ? 46 : 46;
  const dx = race === 'orc' ? 8 : 6.5;
  const L = 50 - dx;
  const R = 50 + dx;
  const mouthY = race === 'orc' ? 58 : 56;
  const mouth = smile ? `M44 ${mouthY - 1} Q50 ${mouthY + 3} 56 ${mouthY - 1}` : `M46 ${mouthY} L54 ${mouthY}`;
  const eyePair = (r = 2.4) => (
    <G>
      <Circle cx={L} cy={y} r={r} fill={accent} />
      <Circle cx={R} cy={y} r={r} fill={accent} />
    </G>
  );
  let e: React.ReactNode = eyePair();
  switch (eyes) {
    case 'closed':
      e = <Path d={`M${L - 3} ${y} Q${L} ${y + 2.5} ${L + 3} ${y} M${R - 3} ${y} Q${R} ${y + 2.5} ${R + 3} ${y}`} stroke={accent} fill="none" {...line(o, 1.6)} />;
      break;
    case 'patch':
      e = (
        <G>
          <Circle cx={R} cy={y} r={2.4} fill={accent} />
          <Path d={`M${L - 5} ${y - 3} L${L + 4} ${y - 4} L${L + 3} ${y + 4} L${L - 4} ${y + 3} Z`} fill={accent} />
          <Path d={`M${L - 6} ${y - 4} L36 34 M${L + 4} ${y - 4} L64 36`} stroke={accent} {...line(o, 1)} />
        </G>
      );
      break;
    case 'glow':
      e = (
        <G>
          <Circle cx={L} cy={y} r={3.4} fill={accent} />
          <Circle cx={R} cy={y} r={3.4} fill={accent} />
        </G>
      );
      break;
    case 'blind':
      e = <Rect x={33} y={y - 3.5} width={34} height={7} rx={3} fill={accent} />;
      break;
    case 'squint':
      e = <Path d={`M${L - 3} ${y} L${L + 3} ${y - 1} M${R - 3} ${y - 1} L${R + 3} ${y}`} stroke={accent} fill="none" {...line(o, 1.8)} />;
      break;
    case 'glasses':
      e = (
        <G>
          {eyePair(1.6)}
          <Circle cx={L} cy={y} r={4.6} stroke={accent} fill="none" {...line(o, 1.3)} />
          <Circle cx={R} cy={y} r={4.6} stroke={accent} fill="none" {...line(o, 1.3)} />
          <Line x1={L + 4.6} y1={y} x2={R - 4.6} y2={y} stroke={accent} {...line(o, 1.3)} />
        </G>
      );
      break;
    case 'monocle':
      e = (
        <G>
          {eyePair(2)}
          <Circle cx={R} cy={y} r={5} stroke={accent} fill="none" {...line(o, 1.4)} />
          <Path d={`M${R + 3} ${y + 4} Q${R + 6} ${y + 14} ${R + 2} ${y + 22}`} stroke={accent} fill="none" {...line(o, 0.9)} />
        </G>
      );
      break;
    case 'goggles':
      e = (
        <G>
          <Rect x={33} y={y - 5} width={34} height={3} rx={1.5} fill={accent} />
          <Circle cx={L} cy={y} r={5} fill={accent} />
          <Circle cx={R} cy={y} r={5} fill={accent} />
        </G>
      );
      break;
    case 'loupe':
      e = (
        <G>
          <Circle cx={L} cy={y} r={2.4} fill={accent} />
          <Circle cx={R} cy={y} r={5.5} fill={accent} />
          <Rect x={R + 4} y={y - 1.5} width={6} height={3} rx={1.5} fill={accent} />
        </G>
      );
      break;
    case 'none':
      e = null;
      break;
  }
  return (
    <G>
      {e}
      {eyes !== 'none' && <Path d={mouth} stroke={accent} fill="none" {...line(o, 1.4)} />}
    </G>
  );
}

/** A complete bust: shoulders, head, then the character's own details on top. */
function portrait(race: Race, eyes: Eyes, details: PortraitFn, opts: { smile?: boolean; collar?: boolean; under?: PortraitFn } = {}): PortraitFn {
  return (ink, accent, o) => (
    <G>
      {opts.under?.(ink, accent, o)}
      {bust(ink, accent, o, opts.collar ?? true)}
      {head(race, ink, accent, o)}
      {face(race, eyes, accent, o, opts.smile)}
      {details(ink, accent, o)}
    </G>
  );
}

// ------------------------------------------------------------------ Humans

export const PORTRAITS: Record<string, PortraitFn> = {
  squire: portrait('human', 'dots', (ink, accent, o) => (
    <G>
      {/* kettle helm with a brim */}
      <Path d="M32 36 Q32 20 50 20 Q68 20 68 36 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Rect x={26} y={34} width={48} height={5} rx={2.5} fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Line x1={50} y1={21} x2={50} y2={34} stroke={accent} {...line(o, 1.2)} />
    </G>
  )),
  merchant: portrait(
    'human',
    'dots',
    (ink, accent, o) => (
      <G>
        {/* turban with a jewel */}
        <Path d="M31 38 Q30 22 50 21 Q70 22 69 38 Q50 31 31 38 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Path d="M34 32 Q50 25 66 32" stroke={accent} fill="none" {...line(o, 1.2)} />
        <Circle cx={50} cy={29} r={3} fill={accent} />
        {/* trimmed beard */}
        <Path d="M38 54 Q50 70 62 54 Q56 60 50 60 Q44 60 38 54 Z" fill={accent} />
      </G>
    ),
    { smile: true },
  ),
  moneychanger: portrait('human', 'monocle', (ink, accent, o) => (
    <G>
      {/* flat cap, sideburns */}
      <Path d="M32 33 Q34 22 50 22 Q66 22 70 31 L74 33 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M35 42 L35 52 M65 42 L65 52" stroke={accent} {...line(o, 1.6)} />
    </G>
  )),
  captain: portrait('human', 'dots', (ink, accent, o) => (
    <G>
      {/* plumed tricorne, moustache */}
      <Path d="M24 35 Q34 18 50 24 Q66 18 76 35 Q50 29 24 35 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M60 22 Q70 10 80 14 Q72 16 66 24" fill={accent} />
      <Path d="M42 53 Q46 50 50 53 Q54 50 58 53" stroke={accent} fill="none" {...line(o, 1.8)} />
    </G>
  )),
  bard: portrait(
    'human',
    'closed',
    (ink, accent, o) => (
      <G>
        {/* floppy cap with a long feather */}
        <Path d="M30 34 Q30 20 52 20 Q72 22 74 32 Q56 28 30 34 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Path d="M66 26 Q82 8 90 10 Q80 18 70 28" fill={accent} />
        {/* lute neck over the shoulder */}
        <Line x1={22} y1={98} x2={34} y2={70} stroke={accent} {...line(o, 2.4)} />
      </G>
    ),
    { smile: true },
  ),
  apprentice: portrait('human', 'dots', (ink, accent, o) => (
    <G>
      {/* small pointed hat, a star on it */}
      <Path d="M30 34 L52 4 L70 34 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Polygon points="51,18 53,23 58,23 54,26 55,31 51,28 47,31 48,26 44,23 49,23" fill={accent} />
    </G>
  )),
  patron: portrait(
    'human',
    'closed',
    (ink, accent, o) => (
      <G>
        {/* circlet and a full beard */}
        <Path d="M33 33 L37 24 L43 31 L50 22 L57 31 L63 24 L67 33 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Path d="M35 52 Q38 72 50 74 Q62 72 65 52 Q58 60 50 60 Q42 60 35 52 Z" fill={accent} />
      </G>
    ),
    { collar: false },
  ),
  innkeeper: portrait(
    'human',
    'dots',
    (ink, accent, o) => (
      <G>
        {/* headscarf knot, big moustache, apron strap */}
        <Path d="M32 36 Q32 22 50 22 Q68 22 68 36 Q50 30 32 36 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Path d="M68 30 L78 26 L76 34 Z" fill={ink} stroke={accent} {...line(o, 1.2)} />
        <Path d="M40 54 Q45 49 50 53 Q55 49 60 54 Q55 52 50 56 Q45 52 40 54 Z" fill={accent} />
        <Path d="M38 80 L38 100 M62 80 L62 100" stroke={accent} {...line(o, 1.6)} />
      </G>
    ),
    { smile: true, collar: false },
  ),
  tinker: portrait('human', 'goggles', (ink, accent, o) => (
    <G>
      {/* tousled hair, a wrench behind the shoulder */}
      <Path d="M33 36 Q30 22 40 22 Q44 16 52 20 Q60 16 64 22 Q72 24 67 36 Q58 28 50 30 Q42 28 33 36 Z" fill={ink} stroke={accent} {...line(o, 1.2)} />
      <Path d="M76 70 L86 92 M72 66 Q74 60 80 62 L78 68 Z" stroke={accent} fill={accent} {...line(o, 2)} />
    </G>
  )),
  guildmaster: portrait(
    'human',
    'dots',
    (ink, accent, o) => (
      <G>
        {/* tall chaperon hat, chain of office */}
        <Path d="M32 34 Q30 14 50 12 Q70 14 68 34 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Path d="M32 34 Q50 28 68 34" stroke={accent} fill="none" {...line(o, 1.4)} />
        <Path d="M30 80 Q50 98 70 80" stroke={accent} fill="none" strokeDasharray="3 3" {...line(o, 2)} />
        <Circle cx={50} cy={91} r={4} fill={accent} />
      </G>
    ),
    { collar: false },
  ),
  caravan: portrait('human', 'squint', (ink, accent, o) => (
    <G>
      {/* wide sun hat with a band, travel scarf */}
      <Path d="M18 36 Q50 26 82 36 Q66 38 50 38 Q34 38 18 36 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M34 34 Q34 20 50 20 Q66 20 66 34 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M35 31 Q50 27 65 31" stroke={accent} fill="none" {...line(o, 1.6)} />
      <Path d="M34 74 Q50 82 66 74 L70 86 Q50 92 30 86 Z" fill={accent} />
    </G>
  ), { collar: false }),
  juggler: portrait(
    'human',
    'dots',
    (ink, accent, o) => (
      <G>
        {/* two-pointed jester cap with bells, a ball in the air */}
        <Path d="M32 34 Q30 20 20 14 Q34 14 44 24 Q50 18 56 24 Q66 14 80 14 Q70 20 68 34 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Circle cx={20} cy={14} r={3.4} fill={accent} />
        <Circle cx={80} cy={14} r={3.4} fill={accent} />
        <Circle cx={84} cy={60} r={5} fill={accent} />
      </G>
    ),
    { smile: true },
  ),
  towncrier: portrait('human', 'dots', (ink, accent, o) => (
    <G>
      {/* tricorne and a hand bell */}
      <Path d="M26 34 Q36 20 50 25 Q64 20 74 34 Q50 28 26 34 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M44 57 Q50 62 56 57 Q50 60 44 57" stroke={accent} fill="none" {...line(o, 1.6)} />
      <Path d="M74 64 Q74 54 82 54 Q90 54 90 64 Z" fill={accent} />
      <Line x1={82} y1={54} x2={82} y2={48} stroke={accent} {...line(o, 2)} />
    </G>
  )),
  gemcutter: portrait('human', 'loupe', (ink, accent, o) => (
    <G>
      {/* close cap, a cut gem held up */}
      <Path d="M33 34 Q33 22 50 22 Q67 22 67 34 Q50 30 33 34 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Polygon points="76,62 82,56 88,62 82,72" fill={accent} />
      <Path d="M76 62 L88 62 M82 56 L82 72" stroke={accent} {...line(o, 0.6)} />
    </G>
  )),
  herald: portrait('human', 'dots', (ink, accent, o) => (
    <G>
      {/* winged helm, a long trumpet */}
      <Path d="M32 36 Q32 20 50 20 Q68 20 68 36 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M32 30 Q20 22 18 12 Q26 20 34 24 M68 30 Q80 22 82 12 Q74 20 66 24" stroke={accent} fill="none" {...line(o, 1.8)} />
      <Path d="M56 58 L84 52 L90 46 L90 64 L84 58 Z" fill={accent} />
    </G>
  )),
  quartermaster: portrait('human', 'glasses', (ink, accent, o) => (
    <G>
      {/* forage cap, quill behind the ear */}
      <Path d="M33 34 Q34 24 50 23 Q66 24 67 34 L70 36 L30 36 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Line x1={66} y1={44} x2={78} y2={26} stroke={accent} {...line(o, 1.8)} />
      <Path d="M76 28 Q84 22 86 14 Q78 18 74 26" fill={accent} />
    </G>
  )),
  vagabond: portrait(
    'human',
    'squint',
    (ink, accent, o) => (
      <G>
        {/* patched hood, stubble, a bindle over the shoulder */}
        <Path d="M28 50 Q26 18 50 16 Q74 18 72 50 L66 50 Q66 26 50 26 Q34 26 34 50 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Rect x={58} y={20} width={7} height={7} fill="none" stroke={accent} {...line(o, 1)} />
        <Path d="M42 58 L44 60 M47 59 L48 61 M52 59 L53 61 M56 58 L58 60" stroke={accent} {...line(o, 1)} />
        <Line x1={14} y1={96} x2={34} y2={64} stroke={accent} {...line(o, 2)} />
        <Circle cx={30} cy={62} r={6} fill={accent} />
      </G>
    ),
    { collar: false },
  ),

  // ---------------------------------------------------------------- Orcs

  grunt: portrait('orc', 'dots', (ink, accent, o) => (
    <G>
      {/* round helm with a nose guard */}
      <Path d="M29 38 Q29 18 50 18 Q71 18 71 38 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Rect x={47.5} y={34} width={5} height={14} rx={2} fill={ink} stroke={accent} {...line(o, 1.2)} />
      <Circle cx={38} cy={30} r={1.6} fill={accent} />
      <Circle cx={62} cy={30} r={1.6} fill={accent} />
    </G>
  )),
  berserker: portrait('orc', 'glow', (ink, accent, o) => (
    <G>
      {/* spiked crest, war paint, an axe raised */}
      <Path d="M38 26 L40 10 L45 24 L50 6 L55 24 L60 10 L62 26 Z" fill={ink} stroke={accent} {...line(o, 1.2)} />
      <Path d="M36 50 L44 52 M56 52 L64 50" stroke={accent} {...line(o, 2)} />
      <Line x1={82} y1={96} x2={82} y2={40} stroke={accent} {...line(o, 2.4)} />
      <Path d="M82 42 Q94 46 92 58 Q86 52 82 54 Z" fill={accent} />
    </G>
  )),
  charger: portrait('orc', 'dots', (ink, accent, o) => (
    <G>
      {/* horned helm, head down to charge */}
      <Path d="M30 36 Q30 20 50 20 Q70 20 70 36 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M32 28 Q18 26 14 10 Q24 20 34 22" fill={accent} />
      <Path d="M68 28 Q82 26 86 10 Q76 20 66 22" fill={accent} />
    </G>
  )),
  shaman: portrait(
    'orc',
    'closed',
    (ink, accent, o) => (
      <G>
        {/* feathered headdress, a staff with a glowing stone */}
        <Path d="M34 26 L30 8 L40 22 M44 22 L44 4 L50 20 M56 20 L60 4 L60 22 M66 22 L74 8 L68 26" stroke={accent} fill="none" {...line(o, 2)} />
        <Path d="M30 30 Q50 20 70 30 L70 34 Q50 26 30 34 Z" fill={ink} stroke={accent} {...line(o, 1.2)} />
        <Line x1={16} y1={98} x2={16} y2={40} stroke={accent} {...line(o, 2.2)} />
        <Circle cx={16} cy={36} r={6} fill={accent} />
        <Path d="M42 78 L50 84 L58 78" stroke={accent} fill="none" {...line(o, 1.6)} />
      </G>
    ),
    { collar: false },
  ),
  firebrand: portrait('orc', 'glow', (ink, accent, o) => (
    <G>
      {/* topknot and a burning torch */}
      <Path d="M44 24 Q44 14 50 12 Q56 14 56 24 Z" fill={ink} stroke={accent} {...line(o, 1.2)} />
      <Line x1={80} y1={98} x2={80} y2={58} stroke={accent} {...line(o, 2.6)} />
      <Path d="M80 58 Q70 50 76 40 Q78 46 81 44 Q80 36 86 30 Q86 40 90 46 Q92 54 80 58 Z" fill={accent} />
    </G>
  )),
  wrecker: portrait('orc', 'squint', (ink, accent, o) => (
    <G>
      {/* bandana, a sledgehammer over the shoulder */}
      <Path d="M30 34 Q30 20 50 20 Q70 20 70 34 Q50 28 30 34 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M30 32 L20 38 L24 30 Z" fill={accent} />
      <Line x1={70} y1={96} x2={86} y2={44} stroke={accent} {...line(o, 2.4)} />
      <Rect x={78} y={30} width={18} height={12} rx={2} fill={accent} transform="rotate(17 87 36)" />
    </G>
  )),
  looter: portrait(
    'orc',
    'dots',
    (ink, accent, o) => (
      <G>
        {/* rough hood, a bulging sack */}
        <Path d="M24 54 Q22 16 50 14 Q78 16 76 54 L72 54 Q72 24 50 24 Q28 24 28 54 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Path d="M66 80 Q60 66 72 62 L80 58 L82 64 Q96 72 88 92 Q76 98 66 80 Z" fill={accent} />
        <Path d="M74 62 L80 66" stroke={ink} {...line(o, 1.2)} />
      </G>
    ),
    { smile: true, collar: false },
  ),
  brawler: portrait('orc', 'dots', (ink, accent, o) => (
    <G>
      {/* bald, scarred, wrapped fists up */}
      <Path d="M58 28 L64 40 M60 34 L64 32" stroke={accent} {...line(o, 1.4)} />
      <Circle cx={22} cy={80} r={8} fill={accent} />
      <Circle cx={78} cy={80} r={8} fill={accent} />
      <Path d="M17 78 L27 78 M73 78 L83 78" stroke={ink} {...line(o, 1.2)} />
    </G>
  )),
  warlord: portrait(
    'orc',
    'glow',
    (ink, accent, o) => (
      <G>
        {/* spiked iron crown, spiked pauldrons */}
        <Path d="M30 30 L32 14 L38 24 L44 8 L50 22 L56 8 L62 24 L68 14 L70 30 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Circle cx={50} cy={26} r={2.6} fill={accent} />
        <Path d="M14 90 Q14 74 30 74 L36 82 Z M86 90 Q86 74 70 74 L64 82 Z" fill={accent} />
        <Path d="M20 76 L14 64 L26 74 M80 76 L86 64 L74 74" fill={accent} stroke={accent} {...line(o, 1)} />
      </G>
    ),
    { collar: false },
  ),
  cutpurse: portrait('orc', 'none', (ink, accent, o) => (
    <G>
      {/* bandit mask, smirk, a little knife */}
      <Path d="M30 40 Q50 36 70 40 L70 50 Q50 46 30 50 Z" fill={accent} />
      <Circle cx={42} cy={45} r={2} fill={ink} />
      <Circle cx={58} cy={45} r={2} fill={ink} />
      <Path d="M70 44 L78 40" stroke={accent} {...line(o, 1.6)} />
      <Path d="M45 58 Q52 60 56 56" stroke={accent} fill="none" {...line(o, 1.4)} />
      <Path d="M80 90 L88 62 L90 64 L84 92 Z" fill={accent} />
    </G>
  )),
  raider: portrait(
    'orc',
    'glow',
    (ink, accent, o) => (
      <G>
        {/* deep hood under a crescent moon */}
        <Path d="M24 56 Q20 14 50 12 Q80 14 76 56 L71 56 Q71 24 50 24 Q29 24 29 56 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Path d="M86 8 A11 11 0 1 0 90 28 A8 8 0 1 1 86 8 Z" fill={accent} />
      </G>
    ),
    { collar: false },
  ),
  mercenary: portrait('orc', 'patch', (ink, accent, o) => (
    <G>
      {/* cropped hair, a coin pouch on a baldric */}
      <Path d="M32 30 Q34 22 50 22 Q66 22 68 30 Q50 26 32 30 Z" fill={accent} />
      <Line x1={24} y1={78} x2={72} y2={100} stroke={accent} {...line(o, 2.4)} />
      <Path d="M58 86 Q56 96 64 98 Q72 98 72 90 Q66 84 58 86 Z" fill={accent} />
    </G>
  )),
  powderkeg: portrait('orc', 'goggles', (ink, accent, o) => (
    <G>
      {/* singed hair, a lit bomb */}
      <Path d="M36 26 L38 18 L42 24 L46 16 L50 23 L54 16 L58 24 L62 18 L64 26" stroke={accent} fill="none" {...line(o, 1.6)} />
      <Circle cx={80} cy={78} r={11} fill={accent} />
      <Path d="M86 68 Q90 60 86 56" stroke={accent} fill="none" {...line(o, 1.6)} />
      <Path d="M86 50 L88 54 L92 53 L89 56 L91 60 L86 58 L82 61 L83 56 L80 53 L84 53 Z" fill={accent} />
    </G>
  )),
  wardrummer: portrait(
    'orc',
    'closed',
    (ink, accent, o) => (
      <G>
        {/* a war drum on the chest, sticks raised */}
        <Rect x={32} y={78} width={36} height={22} rx={4} fill={accent} />
        <Path d="M34 84 L66 84 M38 84 L44 98 M50 84 L50 98 M62 84 L56 98" stroke={ink} {...line(o, 1.2)} />
        <Path d="M22 92 L14 66 M78 92 L86 66" stroke={accent} {...line(o, 2)} />
        <Circle cx={14} cy={64} r={3.4} fill={accent} />
        <Circle cx={86} cy={64} r={3.4} fill={accent} />
      </G>
    ),
    { smile: true, collar: false },
  ),
  bonebreaker: portrait(
    'orc',
    'squint',
    (ink, accent, o) => (
      <G>
        {/* skull cap, bone club, bone necklace */}
        <Path d="M31 34 Q31 18 50 18 Q69 18 69 34 Z" fill={accent} />
        <Circle cx={44} cy={27} r={2.6} fill={ink} />
        <Circle cx={56} cy={27} r={2.6} fill={ink} />
        <Line x1={84} y1={96} x2={84} y2={46} stroke={accent} {...line(o, 3)} />
        <Circle cx={80} cy={42} r={4.4} fill={accent} />
        <Circle cx={88} cy={42} r={4.4} fill={accent} />
        <Path d="M36 80 L38 86 M44 83 L45 89 M50 84 L50 90 M56 83 L55 89 M64 80 L62 86" stroke={accent} {...line(o, 1.8)} />
      </G>
    ),
    { collar: false },
  ),
  wargrider: portrait('orc', 'dots', (ink, accent, o) => (
    <G>
      {/* wolf-pelt hood with ears and a snout over the brow */}
      <Path d="M28 40 Q26 22 34 14 L38 22 Q50 16 62 22 L66 14 Q74 22 72 40 Q50 30 28 40 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M42 30 Q50 40 58 30" stroke={accent} fill="none" {...line(o, 1.4)} />
      <Circle cx={50} cy={34} r={2} fill={accent} />
      <Path d="M24 74 L18 98 M76 74 L82 98" stroke={accent} {...line(o, 2)} />
    </G>
  )),
  scrounger: portrait(
    'orc',
    'squint',
    (ink, accent, o) => (
      <G>
        {/* pot helmet, a dented spoon, a pack of scraps */}
        <Path d="M30 34 Q30 20 50 20 Q70 20 70 34 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Path d="M70 28 L82 24" stroke={accent} {...line(o, 2)} />
        <Path d="M40 26 L44 30" stroke={accent} {...line(o, 1.2)} />
        <Path d="M10 96 L16 70 L32 74 L28 98 Z" fill={accent} />
        <Path d="M14 80 L30 84" stroke={ink} {...line(o, 1.2)} />
      </G>
    ),
    { smile: true },
  ),

  // ---------------------------------------------------------------- Elves

  archer: portrait(
    'elf',
    'dots',
    (ink, accent, o) => (
      <G>
        {/* leaf cap, a bow behind the shoulder */}
        <Path d="M36 34 Q38 20 54 20 Q66 22 68 32 Q52 26 36 34 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Path d="M66 28 Q76 20 82 22 Q76 28 66 30" fill={accent} />
      </G>
    ),
    { under: (ink, accent, o) => <Path d="M12 96 Q2 62 26 34" stroke={accent} fill="none" {...line(o, 2.2)} /> },
  ),
  moonpriestess: portrait(
    'elf',
    'closed',
    (ink, accent, o) => (
      <G>
        {/* crescent diadem over long flowing hair */}
        <Path d="M36 32 Q36 22 50 22 Q64 22 64 32" stroke={accent} fill="none" {...line(o, 1.4)} />
        <Path d="M44 16 A8 8 0 1 0 56 16 A6 6 0 1 1 44 16 Z" fill={accent} />
      </G>
    ),
    {
      collar: false,
      under: (ink, accent, o) => <Path d="M34 36 Q26 70 30 92 L70 92 Q74 70 66 36 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />,
    },
  ),
  sentinel: portrait('elf', 'dots', (ink, accent, o) => (
    <G>
      {/* tall leaf-crested helm, a spear */}
      <Path d="M35 38 Q34 16 50 6 Q66 16 65 38 Q50 32 35 38 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M50 10 L50 32" stroke={accent} {...line(o, 1.2)} />
      <Line x1={86} y1={98} x2={86} y2={20} stroke={accent} {...line(o, 2)} />
      <Path d="M86 6 L91 20 L86 24 L81 20 Z" fill={accent} />
    </G>
  )),
  bladedancer: portrait('elf', 'squint', (ink, accent, o) => (
    <G>
      {/* streaming ponytail, twin curved blades */}
      <Path d="M36 32 Q40 22 50 22 Q60 22 64 32 Q50 28 36 32 Z" fill={accent} />
      <Path d="M62 26 Q76 20 90 30 Q78 28 66 32 Z" fill={accent} />
      <Path d="M12 88 Q14 64 30 56" stroke={accent} fill="none" {...line(o, 2.4)} />
      <Path d="M88 90 Q86 66 70 58" stroke={accent} fill="none" {...line(o, 2.4)} />
    </G>
  )),
  ranger: portrait(
    'elf',
    'squint',
    (ink, accent, o) => (
      <G>
        {/* pointed hood and a leaf clasp */}
        <Path d="M30 58 Q26 24 50 10 Q74 24 70 58 L64 58 Q66 30 50 26 Q34 30 36 58 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
        <Path d="M50 76 Q42 82 50 90 Q58 82 50 76 Z" fill={accent} />
      </G>
    ),
    { collar: false },
  ),
  seer: portrait('elf', 'blind', (ink, accent, o) => (
    <G>
      {/* blindfold, an open eye on the brow, rays */}
      <Path d="M44 31 Q50 26 56 31 Q50 36 44 31 Z" fill={accent} />
      <Circle cx={50} cy={31} r={1.4} fill={ink} />
      <Path d="M50 12 L50 20 M38 16 L41 22 M62 16 L59 22" stroke={accent} {...line(o, 1.6)} />
    </G>
  )),
  longbow: portrait(
    'elf',
    'dots',
    (ink, accent, o) => (
      <G>
        {/* braided hair band, quiver of arrows */}
        <Path d="M36 32 Q50 26 64 32" stroke={accent} fill="none" {...line(o, 1.6)} />
        <Path d="M74 98 L80 64 L88 66 L84 98 Z" fill={accent} />
        <Path d="M80 64 L78 52 M84 65 L84 52 M88 66 L90 54" stroke={accent} {...line(o, 1.4)} />
      </G>
    ),
    { under: (ink, accent, o) => <Path d="M24 98 Q-2 50 24 4 M24 98 L24 4" stroke={accent} fill="none" {...line(o, 1.8)} /> },
  ),
  druid: portrait(
    'elf',
    'closed',
    (ink, accent, o) => (
      <G>
        {/* antler crown with leaves */}
        <Path d="M42 28 Q38 16 30 10 M36 18 L28 18 M58 28 Q62 16 70 10 M64 18 L72 18" stroke={accent} fill="none" {...line(o, 2)} />
        <Path d="M44 26 Q50 18 56 26 Q50 30 44 26 Z" fill={accent} />
        <Path d="M30 84 Q38 76 44 82 M70 84 Q62 76 56 82" stroke={accent} fill="none" {...line(o, 1.6)} />
      </G>
    ),
    { smile: true, collar: false },
  ),
  starweaver: portrait(
    'elf',
    'glow',
    (ink, accent, o) => (
      <G>
        {/* star circlet, stars wheeling around */}
        <Path d="M36 32 Q50 24 64 32" stroke={accent} fill="none" {...line(o, 1.4)} />
        <Polygon points="50,14 52.5,21 60,21 54,25.5 56,33 50,28.5 44,33 46,25.5 40,21 47.5,21" fill={accent} />
        <Polygon points="16,40 17.5,44 22,44 18.5,46.5 20,51 16,48 12,51 13.5,46.5 10,44 14.5,44" fill={accent} />
        <Polygon points="84,40 85.5,44 90,44 86.5,46.5 88,51 84,48 80,51 81.5,46.5 78,44 82.5,44" fill={accent} />
        <Circle cx={22} cy={22} r={2} fill={accent} />
        <Circle cx={80} cy={20} r={2.4} fill={accent} />
      </G>
    ),
    { collar: false },
  ),
  envoy: portrait('elf', 'dots', (ink, accent, o) => (
    <G>
      {/* tall jewelled circlet, a sealed scroll */}
      <Path d="M36 32 L40 18 L46 28 L50 12 L54 28 L60 18 L64 32 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Circle cx={50} cy={24} r={2.4} fill={accent} />
      <Rect x={72} y={60} width={10} height={32} rx={4} fill={accent} transform="rotate(-20 77 76)" />
      <Circle cx={74} cy={80} r={3} fill={ink} />
    </G>
  )),
  wisp: (ink, accent, o) => (
    <G>
      {/* a forest spirit: a flame-shaped glow with a face, no body */}
      <Path d="M50 88 Q24 86 26 58 Q28 40 44 28 Q42 40 50 42 Q48 26 60 12 Q60 30 70 40 Q78 52 74 66 Q70 86 50 88 Z" fill={ink} stroke={accent} {...line(o, 1.6)} />
      <Circle cx={42} cy={62} r={4} fill={accent} />
      <Circle cx={58} cy={62} r={4} fill={accent} />
      <Path d="M46 72 Q50 75 54 72" stroke={accent} fill="none" {...line(o, 1.4)} />
      <Circle cx={18} cy={36} r={3} fill={accent} />
      <Circle cx={84} cy={28} r={2.4} fill={accent} />
      <Circle cx={82} cy={80} r={2} fill={accent} />
    </G>
  ),
  grovelder: portrait(
    'elf',
    'closed',
    (ink, accent, o) => (
      <G>
        {/* crown of branches, a long beard */}
        <Path d="M38 30 L32 12 M34 20 L26 16 M50 26 L50 6 M50 14 L56 10 M62 30 L68 12 M66 20 L74 16" stroke={accent} fill="none" {...line(o, 1.8)} />
        <Path d="M38 54 Q40 84 50 92 Q60 84 62 54 Q56 62 50 62 Q44 62 38 54 Z" fill={accent} />
        <Path d="M46 66 L48 84 M54 66 L52 84" stroke={ink} {...line(o, 1)} />
      </G>
    ),
    { collar: false },
  ),
  lorekeeper: portrait('elf', 'glasses', (ink, accent, o) => (
    <G>
      {/* scholar's cap, an open book */}
      <Path d="M36 30 Q38 20 50 20 Q62 20 64 30 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M30 84 Q40 78 50 84 Q60 78 70 84 L70 98 Q60 92 50 98 Q40 92 30 98 Z" fill={accent} />
      <Line x1={50} y1={84} x2={50} y2={98} stroke={ink} {...line(o, 1.2)} />
    </G>
  ), { collar: false }),
  gladewarden: portrait('elf', 'dots', (ink, accent, o) => (
    <G>
      {/* leaf helm, a round shield with a leaf */}
      <Path d="M35 36 Q34 18 50 18 Q66 18 65 36 Q50 30 35 36 Z" fill={ink} stroke={accent} {...line(o, 1.4)} />
      <Path d="M42 26 Q50 18 58 26 Q50 32 42 26 Z" fill={accent} />
      <Circle cx={20} cy={82} r={13} fill={accent} />
      <Path d="M20 72 Q12 82 20 92 Q28 82 20 72 Z" fill={ink} />
    </G>
  )),
};
