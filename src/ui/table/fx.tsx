// Toy-style visual effects for the table: comic word bursts, outlined pop-up
// numbers, debris, dust puffs and shockwave rings. Purely cosmetic: they are
// derived from engine events in playback.ts and never affect game state.

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
import Svg, { Polygon, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';

export type BurstWord = 'BONK!' | 'KABOOM!' | 'SMASH!' | 'FLIP!' | 'BACK!' | 'POW!' | 'ZAP!';

export type Fx =
  | { id: number; kind: 'text'; x: number; y: number; text: string; tone: 'gold' | 'value' | 'loss'; big?: boolean }
  | { id: number; kind: 'burst'; x: number; y: number; word: BurstWord; color: string; size?: number }
  | { id: number; kind: 'debris'; x: number; y: number; color: string }
  | { id: number; kind: 'dust'; x: number; y: number; delay: number }
  | { id: number; kind: 'ring'; x: number; y: number; color: string };

export const FX_LIFETIME = 1300;

interface LayerProps {
  items: Fx[];
  width: number;
  speed: number;
  reduceMotion: boolean;
}

/** Renders every live effect, positioned in table units (x,y scaled by width). */
export function FxLayer({ items, width, speed, reduceMotion }: LayerProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((fx) => {
        // Keep words and numbers inside the table so they never spill off-screen.
        const half = fx.kind === 'burst' ? (150 * (fx.size ?? 1)) / 2 : fx.kind === 'text' ? 56 : 0;
        const px = Math.min(Math.max(fx.x * width, half), width - half);
        const py = fx.kind === 'burst' ? Math.min(Math.max(fx.y * width, 48), width * 1.2 - 48) : fx.y * width;
        switch (fx.kind) {
          case 'text':
            return <PopText key={fx.id} fx={fx} px={px} py={py} speed={speed} still={reduceMotion} />;
          case 'burst':
            return <Burst key={fx.id} fx={fx} px={px} py={py} speed={speed} still={reduceMotion} />;
          case 'ring':
            return reduceMotion ? null : <Ring key={fx.id} fx={fx} px={px} py={py} speed={speed} />;
          case 'debris':
            return reduceMotion ? null : <Debris key={fx.id} px={px} py={py} color={fx.color} speed={speed} />;
          case 'dust':
            return reduceMotion ? null : <Dust key={fx.id} px={px} py={py + width * 0.07} delay={fx.delay} speed={speed} />;
        }
      })}
    </View>
  );
}

const dur = (ms: number, speed: number) => Math.max(120, ms / Math.sqrt(speed));

/** Two-layer SVG text: a fat ink stroke underneath, the fill on top. */
export function OutlinedText({
  text,
  size,
  fill,
  width,
  height,
  stroke = colors.ink,
  strokeWidth,
}: {
  text: string;
  size: number;
  fill: string;
  width: number;
  height: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  const sw = strokeWidth ?? Math.max(4, size * 0.22);
  const y = height / 2 + size * 0.36;
  return (
    <Svg width={width} height={height}>
      <SvgText x={width / 2} y={y + size * 0.08} textAnchor="middle" fontSize={size} fontWeight="900" fill={stroke} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
        {text}
      </SvgText>
      <SvgText x={width / 2} y={y} textAnchor="middle" fontSize={size} fontWeight="900" fill={stroke} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
        {text}
      </SvgText>
      <SvgText x={width / 2} y={y} textAnchor="middle" fontSize={size} fontWeight="900" fill={fill}>
        {text}
      </SvgText>
    </Svg>
  );
}

const TONE = { gold: colors.gold, value: '#7FF0FF', loss: colors.danger };

function PopText({ fx, px, py, speed, still }: { fx: Extract<Fx, { kind: 'text' }>; px: number; py: number; speed: number; still: boolean }) {
  const s = useSharedValue(still ? 1 : 0.2);
  const rise = useSharedValue(0);
  const op = useSharedValue(1);
  useEffect(() => {
    const d = dur(900, speed);
    if (!still) {
      s.value = withSequence(withTiming(1.3, { duration: d * 0.18, easing: Easing.out(Easing.back(3)) }), withTiming(1, { duration: d * 0.15 }));
      rise.value = withDelay(d * 0.3, withTiming(-42, { duration: d * 0.7, easing: Easing.out(Easing.quad) }));
    }
    op.value = withDelay(d * 0.55, withTiming(0, { duration: d * 0.45 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: rise.value }, { scale: s.value }] }));
  const size = fx.big ? 34 : 26;
  const w = 140;
  const h = 56;
  return (
    <Animated.View style={[styles.abs, { left: px - w / 2, top: py - h - 8, width: w, height: h }, style]}>
      <OutlinedText text={fx.text} size={size} fill={TONE[fx.tone]} width={w} height={h} />
    </Animated.View>
  );
}

function burstPoints(w: number, h: number, spikes: number, seed: number): string {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (Math.PI * i) / spikes;
    const jitter = 0.86 + ((Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1 + 1) % 1 * 0.22;
    const r = i % 2 === 0 ? jitter : 0.66;
    pts.push(`${(w / 2 + Math.cos(a) * (w / 2 - 4) * r).toFixed(1)},${(h / 2 + Math.sin(a) * (h / 2 - 4) * r).toFixed(1)}`);
  }
  return pts.join(' ');
}

function Burst({ fx, px, py, speed, still }: { fx: Extract<Fx, { kind: 'burst' }>; px: number; py: number; speed: number; still: boolean }) {
  const s = useSharedValue(still ? 1 : 0);
  const rot = useSharedValue(still ? 0 : -14);
  const op = useSharedValue(still ? 0 : 1);
  useEffect(() => {
    const d = dur(820, speed);
    if (still) {
      op.value = withSequence(withTiming(1, { duration: 120 }), withDelay(d * 0.5, withTiming(0, { duration: d * 0.3 })));
      return;
    }
    s.value = withSequence(
      withTiming(1.25, { duration: d * 0.16, easing: Easing.out(Easing.back(2.5)) }),
      withTiming(1, { duration: d * 0.12 }),
      withDelay(d * 0.4, withTiming(0.6, { duration: d * 0.3, easing: Easing.in(Easing.quad) })),
    );
    rot.value = withTiming(fx.word === 'KABOOM!' ? 6 : 0, { duration: d * 0.3, easing: Easing.out(Easing.back(2)) });
    op.value = withDelay(d * 0.68, withTiming(0, { duration: d * 0.3 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: s.value }, { rotate: `${rot.value}deg` }] }));
  const scale = fx.size ?? 1;
  const w = 150 * scale;
  const h = 96 * scale;
  const pts = useMemo(() => burstPoints(w, h, fx.word === 'KABOOM!' ? 14 : 11, fx.id), [w, h, fx.word, fx.id]);
  const fontSize = (fx.word.length > 5 ? 25 : 29) * scale;
  return (
    <Animated.View style={[styles.abs, { left: px - w / 2, top: py - h / 2 - 6, width: w, height: h }, style]}>
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        <Polygon points={pts} fill={colors.ink} transform={`translate(0 ${4 * scale})`} />
        <Polygon points={pts} fill={fx.color} stroke={colors.ink} strokeWidth={4} strokeLinejoin="round" />
      </Svg>
      <View style={styles.layer}>
        <OutlinedText text={fx.word} size={fontSize} fill="#FFFFFF" width={w} height={h} strokeWidth={6 * scale} />
      </View>
    </Animated.View>
  );
}

function Ring({ fx, px, py, speed }: { fx: Extract<Fx, { kind: 'ring' }>; px: number; py: number; speed: number }) {
  const s = useSharedValue(0.6);
  const op = useSharedValue(0.9);
  useEffect(() => {
    const d = dur(480, speed);
    s.value = withTiming(1.9, { duration: d, easing: Easing.out(Easing.quad) });
    op.value = withTiming(0, { duration: d });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: s.value }] }));
  const size = 64;
  return (
    <Animated.View
      style={[styles.abs, { left: px - size / 2, top: py - size / 2, width: size, height: size, borderRadius: size / 2, borderWidth: 5, borderColor: fx.color }, style]}
    />
  );
}

interface ParticleSpec {
  vx: number;
  vy: number;
  g: number;
  size: number;
  color: string;
  round: boolean;
  spin: number;
}

function Particle({ p, spec, px, py }: { p: SharedValue<number>; spec: ParticleSpec; px: number; py: number }) {
  const style = useAnimatedStyle(() => {
    const t = p.value;
    return {
      opacity: t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35,
      transform: [
        { translateX: spec.vx * t },
        { translateY: spec.vy * t + spec.g * t * t },
        { rotate: `${spec.spin * t}deg` },
        { scale: spec.round && spec.g === 0 ? 0.6 + t * 0.9 : 1 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.abs,
        {
          left: px - spec.size / 2,
          top: py - spec.size / 2,
          width: spec.size,
          height: spec.size,
          borderRadius: spec.round ? spec.size / 2 : 3,
          backgroundColor: spec.color,
          borderWidth: 2.5,
          borderColor: colors.ink,
        },
        style,
      ]}
    />
  );
}

function Debris({ px, py, color, speed }: { px: number; py: number; color: string; speed: number }) {
  const p = useSharedValue(0);
  const specs = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 11 + Math.random() * 0.5;
        const v = 70 + Math.random() * 60;
        return {
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 50,
          g: 150,
          size: 8 + Math.random() * 9,
          color: i % 3 === 0 ? colors.gold : i % 3 === 1 ? color : '#FFFFFF',
          round: i % 2 === 0,
          spin: (Math.random() - 0.5) * 720,
        };
      }),
    [color],
  );
  useEffect(() => {
    p.value = withTiming(1, { duration: dur(760, speed), easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {specs.map((s, i) => (
        <Particle key={i} p={p} spec={s} px={px} py={py} />
      ))}
    </>
  );
}

function Dust({ px, py, delay, speed }: { px: number; py: number; delay: number; speed: number }) {
  const p = useSharedValue(0);
  const specs = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        return { vx: side * (24 + i * 7), vy: -6 - (i % 3) * 5, g: 0, size: 10 + (i % 3) * 3, color: '#FFF4DE', round: true, spin: 0 };
      }),
    [],
  );
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: dur(520, speed), easing: Easing.out(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: p.value > 0 ? 1 : 0 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      {specs.map((s, i) => (
        <Particle key={i} p={p} spec={s} px={px} py={py} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  // Absolutely positioned so it paints above the absolute SVG burst on every platform.
  layer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});

/** Big end-of-round celebration shown over the table for a moment. */
export function HaulBanner({ total, speed, still }: { total: number; speed: number; still: boolean }) {
  const s = useSharedValue(still ? 1 : 0);
  const rot = useSharedValue(still ? 0 : -20);
  useEffect(() => {
    if (still) return;
    const d = dur(700, speed);
    s.value = withSequence(withTiming(1.2, { duration: d * 0.35, easing: Easing.out(Easing.back(2.5)) }), withTiming(1, { duration: d * 0.2 }));
    rot.value = withTiming(-4, { duration: d * 0.5, easing: Easing.out(Easing.back(2)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }, { rotate: `${rot.value}deg` }] }));
  const word = total >= 60 ? 'HUGE HAUL!' : total >= 30 ? 'BIG HAUL!' : total >= 12 ? 'NICE!' : total > 0 ? 'OK!' : 'OOF!';
  const w = 280;
  const h = 170;
  const pts = burstPoints(w, h, 16, total + 7);
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ width: w, height: h, alignItems: 'center', justifyContent: 'center' }, style]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${word} plus ${total} gold`}
    >
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        <Polygon points={pts} fill={colors.ink} transform="translate(0 6)" />
        <Polygon points={pts} fill={total > 0 ? colors.gold : '#8C83C9'} stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" />
      </Svg>
      <View style={styles.layer}>
        <OutlinedText text={word} size={30} fill="#FFFFFF" width={w} height={44} strokeWidth={8} />
        <OutlinedText text={`+${total}`} size={46} fill={total > 0 ? '#FFFFFF' : colors.gold} width={w} height={58} strokeWidth={10} />
      </View>
    </Animated.View>
  );
}
