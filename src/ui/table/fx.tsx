// Papercraft effects for the table: sticker numbers, paper puffs, a pow-star at
// contact points, confetti scraps, torn coin halves and dashed rings. Purely
// cosmetic: derived from engine events in playback.ts, never affect game state.
// Every effect has a Reduce Motion path (appear/fade in place, no particles).

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Polygon, Text as SvgText } from 'react-native-svg';
import { CoinArt } from '../art/CoinArt';
import { colors, display } from '../theme';
import type { Fx } from './fxTypes';

export type { Fx } from './fxTypes';
export { FX_LIFETIME } from './fxTypes';

/** Effect timings shrink with game speed, but never below what the eye can read. */
const dur = (ms: number, speed: number) => Math.max(110, ms / Math.sqrt(speed));

/** Deterministic per-effect noise so a replay looks the same each time. */
function rand(seed: number, i: number) {
  const x = Math.sin(seed * 91.17 + i * 47.31) * 43758.5453;
  return x - Math.floor(x);
}

interface LayerProps {
  items: Fx[];
  width: number;
  coinSize: number;
  speed: number;
  reduceMotion: boolean;
}

/** Renders every live effect, positioned in table units (x,y scaled by width). */
export function FxLayer({ items, width, coinSize, speed, reduceMotion }: LayerProps) {
  const height = width * 1.2;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((fx) => {
        const px = fx.x * width;
        const py = fx.y * width;
        switch (fx.kind) {
          case 'num': {
            // Keep numbers on the table so they never spill off-screen.
            const cx = Math.min(Math.max(px, 60), width - 60);
            const cy = Math.min(Math.max(py, 70), height);
            return <StickerNumber key={fx.id} fx={fx} px={cx} py={cy} speed={speed} still={reduceMotion} />;
          }
          case 'pow':
            return reduceMotion ? null : <Pow key={fx.id} fx={fx} px={px} py={py} speed={speed} />;
          case 'ring':
            return reduceMotion ? null : <Ring key={fx.id} color={fx.color} px={px} py={py} size={coinSize} speed={speed} />;
          case 'puff':
            return reduceMotion ? null : <Puff key={fx.id} px={px} py={py + coinSize * 0.42} delay={fx.delay} speed={speed} />;
          case 'confetti':
            return reduceMotion ? null : <Confetti key={fx.id} fx={fx} px={px} py={py} speed={speed} />;
          case 'tear':
            return reduceMotion ? null : <Tear key={fx.id} fx={fx} px={px} py={py} size={coinSize} speed={speed} />;
        }
      })}
    </View>
  );
}

/**
 * Text cut out as a sticker: a hard brown shadow, a fat white die-cut rim, then
 * the coloured letters with a thin ink line.
 */
export function StickerText({ text, size, fill, width, height }: { text: string; size: number; fill: string; width: number; height: number }) {
  const y = height / 2 + size * 0.36;
  const rim = Math.max(6, size * 0.3);
  const common = { x: width / 2, textAnchor: 'middle' as const, fontSize: size, fontWeight: '900' as const, fontFamily: display, strokeLinejoin: 'round' as const };
  return (
    <Svg width={width} height={height}>
      <SvgText {...common} y={y + 3} fill="#54341A" stroke="#54341A" strokeWidth={rim} opacity={0.3}>
        {text}
      </SvgText>
      <SvgText {...common} y={y} fill={colors.sticker} stroke={colors.sticker} strokeWidth={rim}>
        {text}
      </SvgText>
      <SvgText {...common} y={y} fill={fill} stroke={colors.ink} strokeWidth={Math.max(1.4, size * 0.05)}>
        {text}
      </SvgText>
    </Svg>
  );
}

const TONE = { gold: '#FFC93C', value: '#6EC1F2', loss: '#E8574A' };

function StickerNumber({ fx, px, py, speed, still }: { fx: Extract<Fx, { kind: 'num' }>; px: number; py: number; speed: number; still: boolean }) {
  const s = useSharedValue(still ? 1 : 0.1);
  const rise = useSharedValue(0);
  const op = useSharedValue(still ? 0 : 1);
  useEffect(() => {
    const d = dur(950, speed);
    if (still) {
      op.value = withSequence(withTiming(1, { duration: 120 }), withDelay(d * 0.5, withTiming(0, { duration: d * 0.3 })));
      return;
    }
    // Slap it down: overshoot, a little squash, settle; then peel up and away.
    s.value = withSequence(
      withTiming(1.35, { duration: d * 0.12, easing: Easing.out(Easing.quad) }),
      withTiming(0.92, { duration: d * 0.08 }),
      withTiming(1, { duration: d * 0.08 }),
    );
    rise.value = withDelay(d * 0.45, withTiming(-34, { duration: d * 0.55, easing: Easing.in(Easing.quad) }));
    op.value = withDelay(d * 0.62, withTiming(0, { duration: d * 0.38 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: rise.value }, { rotate: `${fx.tilt}deg` }, { scale: s.value }],
  }));
  const size = fx.big ? 36 : 28;
  const w = 130;
  const h = 58;
  return (
    <Animated.View style={[styles.abs, { left: px - w / 2, top: py - h - 10, width: w, height: h }, style]}>
      <StickerText text={fx.text} size={size} fill={TONE[fx.tone]} width={w} height={h} />
    </Animated.View>
  );
}

function starPoints(r: number, spikes: number, inner: number, seed: number) {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    const rr = i % 2 === 0 ? r * (0.85 + rand(seed, i) * 0.15) : r * inner;
    pts.push(`${(r + Math.cos(a) * rr).toFixed(1)},${(r + Math.sin(a) * rr).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** A cut-paper star slapped at a point of contact. No words, just the shape. */
function Pow({ fx, px, py, speed }: { fx: Extract<Fx, { kind: 'pow' }>; px: number; py: number; speed: number }) {
  const s = useSharedValue(0);
  const op = useSharedValue(1);
  useEffect(() => {
    const d = dur(520, speed);
    s.value = withSequence(withTiming(1.2, { duration: d * 0.18, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: d * 0.14 }));
    op.value = withDelay(d * 0.5, withTiming(0, { duration: d * 0.5 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const r = 26 * (fx.size ?? 1);
  const pts = useMemo(() => starPoints(r - 4, 8, 0.55, fx.id), [r, fx.id]);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: s.value }, { rotate: `${(fx.id % 5) * 9 - 18}deg` }] }));
  return (
    <Animated.View style={[styles.abs, { left: px - r, top: py - r, width: r * 2, height: r * 2 }, style]}>
      <Svg width={r * 2} height={r * 2}>
        <Polygon points={pts} transform="translate(5 6)" fill="#54341A" opacity={0.25} />
        <Polygon points={pts} transform="translate(4 4)" fill={colors.sticker} stroke={colors.sticker} strokeWidth={6} strokeLinejoin="round" />
        <Polygon points={pts} transform="translate(4 4)" fill={fx.color} stroke={colors.ink} strokeWidth={1.5} strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

/** A dashed paper circle that opens outwards from a coin when its ability fires. */
function Ring({ color, px, py, size, speed }: { color: string; px: number; py: number; size: number; speed: number }) {
  const s = useSharedValue(0.9);
  const op = useSharedValue(1);
  useEffect(() => {
    const d = dur(520, speed);
    s.value = withTiming(1.55, { duration: d, easing: Easing.out(Easing.cubic) });
    op.value = withDelay(d * 0.35, withTiming(0, { duration: d * 0.65 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: s.value }] }));
  const d = size + 8;
  return (
    <Animated.View style={[styles.abs, { left: px - d / 2, top: py - d / 2, width: d, height: d }, style]}>
      <Svg width={d} height={d}>
        <Circle cx={d / 2} cy={d / 2} r={d / 2 - 4} stroke={colors.sticker} strokeWidth={7} fill="none" />
        <Circle cx={d / 2} cy={d / 2} r={d / 2 - 4} stroke={color} strokeWidth={3.5} strokeDasharray="7 6" strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}

interface Scrap {
  vx: number;
  vy: number;
  g: number;
  w: number;
  h: number;
  color: string;
  spin: number;
  flutter: number;
  tri: boolean;
}

/** One paper scrap: flies out, tumbles and flutters as it falls. */
function ScrapView({ p, sc, px, py }: { p: SharedValue<number>; sc: Scrap; px: number; py: number }) {
  const style = useAnimatedStyle(() => {
    const t = p.value;
    return {
      opacity: t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3,
      transform: [
        { translateX: sc.vx * t + Math.sin(t * 9) * sc.flutter },
        { translateY: sc.vy * t + sc.g * t * t },
        { rotate: `${sc.spin * t}deg` },
        // Paper turning over: its width collapses and opens as it tumbles.
        { scaleX: Math.cos(t * sc.spin * 0.03) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.abs, { left: px - sc.w / 2, top: py - sc.h / 2, width: sc.w, height: sc.h }, style]}>
      {sc.tri ? (
        <Svg width={sc.w} height={sc.h}>
          <Polygon points={`0,${sc.h} ${sc.w / 2},0 ${sc.w},${sc.h}`} fill={sc.color} />
        </Svg>
      ) : (
        <View style={{ flex: 1, backgroundColor: sc.color, borderRadius: 1.5 }} />
      )}
    </Animated.View>
  );
}

function Confetti({ fx, px, py, speed }: { fx: Extract<Fx, { kind: 'confetti' }>; px: number; py: number; speed: number }) {
  const p = useSharedValue(0);
  const scraps = useMemo<Scrap[]>(
    () =>
      Array.from({ length: fx.count }, (_, i) => {
        const a = (Math.PI * 2 * i) / fx.count + rand(fx.seed, i) * 0.6;
        const v = 60 + rand(fx.seed, i + 40) * 70;
        return {
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 55,
          g: 170,
          w: 6 + rand(fx.seed, i + 80) * 7,
          h: 4 + rand(fx.seed, i + 120) * 6,
          color: fx.palette[i % fx.palette.length],
          spin: (rand(fx.seed, i + 160) - 0.5) * 900,
          flutter: 3 + rand(fx.seed, i + 200) * 6,
          tri: i % 3 === 0,
        };
      }),
    [fx],
  );
  useEffect(() => {
    p.value = withTiming(1, { duration: dur(900, speed), easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {scraps.map((sc, i) => (
        <ScrapView key={i} p={p} sc={sc} px={px} py={py} />
      ))}
    </>
  );
}

/** Little paper clouds that puff out sideways where a coin lands. */
function Puff({ px, py, delay, speed }: { px: number; py: number; delay: number; speed: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: dur(420, speed), easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {[-1, 1].map((side) =>
        [0, 1].map((k) => <PuffBall key={`${side}${k}`} p={p} px={px} py={py} side={side} k={k} />),
      )}
    </>
  );
}

function PuffBall({ p, px, py, side, k }: { p: SharedValue<number>; px: number; py: number; side: number; k: number }) {
  const r = 7 - k * 2;
  const style = useAnimatedStyle(() => {
    const t = p.value;
    return {
      opacity: t === 0 ? 0 : t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5,
      transform: [{ translateX: side * (10 + t * (22 + k * 14)) }, { translateY: -t * (4 + k * 5) }, { scale: 0.5 + t * 0.7 }],
    };
  });
  return <Animated.View style={[styles.abs, styles.puff, { left: px - r, top: py - r, width: r * 2, height: r * 2, borderRadius: r }, style]} />;
}

/** The coin sticker tears down the middle and both halves fall away. */
function Tear({ fx, px, py, size, speed }: { fx: Extract<Fx, { kind: 'tear' }>; px: number; py: number; size: number; speed: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(1, { duration: dur(720, speed), easing: Easing.in(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {(['left', 'right'] as const).map((half) => (
        <TearHalf key={half} p={p} half={half} fx={fx} px={px} py={py} size={size} />
      ))}
    </>
  );
}

function TearHalf({ p, half, fx, px, py, size }: { p: SharedValue<number>; half: 'left' | 'right'; fx: Extract<Fx, { kind: 'tear' }>; px: number; py: number; size: number }) {
  const dir = half === 'left' ? -1 : 1;
  const style = useAnimatedStyle(() => {
    const t = p.value;
    return {
      opacity: t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25,
      transform: [{ translateX: dir * t * size * 0.55 }, { translateY: t * t * size * 0.9 - t * size * 0.15 }, { rotate: `${dir * t * 38}deg` }],
    };
  });
  return (
    <Animated.View style={[styles.abs, { left: px - size / 2, top: py - size / 2, width: size, height: size }, style]}>
      <CoinArt defId={fx.defId} face={fx.face} level={fx.level} size={size} half={half} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  puff: { backgroundColor: '#FFF8EA', borderWidth: 1.5, borderColor: 'rgba(59, 37, 22, 0.35)' },
});
