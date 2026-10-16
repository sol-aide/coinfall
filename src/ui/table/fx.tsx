// Cosmetic table effects in a sticker/papercraft style: outlined cartoon smoke,
// slash rings with speed lines, and big outlined numbers that pop and linger.
// Derived from engine events in playback.ts; they never affect game state.
// Timings are given at 1x speed and divided by the animation speed setting.

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
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../theme';
import type { Projection } from './projection';

export type Fx =
  | { id: number; kind: 'number'; x: number; y: number; text: string; tone: 'gold' | 'value' | 'loss'; big?: boolean }
  | { id: number; kind: 'poof'; x: number; y: number; delay: number; big?: boolean; dust?: boolean }
  | { id: number; kind: 'hit'; x: number; y: number }
  | { id: number; kind: 'shards'; x: number; y: number; color: string }
  | { id: number; kind: 'ring'; x: number; y: number; color: string };

const ms = (base: number, speed: number) => Math.max(40, base / speed);

/** Renders every live effect, positioned in table units (x,y scaled by width). */
export function FxLayer({ items, proj, speed, reduceMotion }: { items: Fx[]; proj: Projection; speed: number; reduceMotion: boolean }) {
  const width = proj.width;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((fx) => {
        const pt = proj.project(fx.x, fx.y);
        const px = pt.x;
        const py = pt.y;
        switch (fx.kind) {
          case 'number':
            return <PopNumber key={fx.id} fx={fx} px={Math.min(px, width - 50)} py={py} speed={speed} still={reduceMotion} />;
          case 'poof':
            return reduceMotion ? null : <Poof key={fx.id} px={px} py={fx.dust ? py + 22 : py} delay={fx.delay} big={fx.big} dust={fx.dust} speed={speed} />;
          case 'hit':
            return reduceMotion ? null : <Hit key={fx.id} px={px} py={py} speed={speed} />;
          case 'shards':
            return reduceMotion ? null : <Shards key={fx.id} px={px} py={py} color={fx.color} speed={speed} />;
          case 'ring':
            return reduceMotion ? null : <Ring key={fx.id} px={px} py={py} color={fx.color} speed={speed} />;
        }
      })}
    </View>
  );
}

/**
 * Sticker text: an ink edge, a thick cream outline, then the fill.
 * Used for the floating numbers and the round card.
 */
export function StickerText({
  text,
  size,
  fill,
  width,
  height,
  outline = colors.paper,
  anchor = 'middle',
}: {
  text: string;
  size: number;
  fill: string;
  width: number;
  height: number;
  outline?: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  const x = anchor === 'middle' ? width / 2 : anchor === 'start' ? size * 0.2 : width - size * 0.2;
  const y = height / 2 + size * 0.35;
  const common = { x, y, textAnchor: anchor, fontSize: size, fontFamily: fonts.bold, strokeLinejoin: 'round' as const };
  return (
    <Svg width={width} height={height}>
      <SvgText {...common} y={y + size * 0.07} fill="rgba(25,15,25,0.35)" stroke="rgba(25,15,25,0.35)" strokeWidth={size * 0.38}>
        {text}
      </SvgText>
      <SvgText {...common} fill={colors.ink} stroke={colors.ink} strokeWidth={size * 0.38}>
        {text}
      </SvgText>
      <SvgText {...common} fill={outline} stroke={outline} strokeWidth={size * 0.26}>
        {text}
      </SvgText>
      <SvgText {...common} fill={fill}>
        {text}
      </SvgText>
    </Svg>
  );
}

const TONE = { gold: '#E39A0B', value: '#4E9E36', loss: '#C0283A' };

/** A number that pops in oversized beside the coin, settles, lingers, then fades. */
function PopNumber({ fx, px, py, speed, still }: { fx: Extract<Fx, { kind: 'number' }>; px: number; py: number; speed: number; still: boolean }) {
  const s = useSharedValue(still ? 1 : 0.4);
  const drift = useSharedValue(0);
  const op = useSharedValue(still ? 0 : 1);
  useEffect(() => {
    if (still) {
      op.value = withSequence(withTiming(1, { duration: 120 }), withDelay(ms(600, speed), withTiming(0, { duration: 200 })));
      return;
    }
    s.value = withSequence(withTiming(1.3, { duration: ms(90, speed), easing: Easing.out(Easing.quad) }), withTiming(1, { duration: ms(110, speed) }));
    drift.value = withTiming(-10, { duration: ms(900, speed), easing: Easing.out(Easing.quad) });
    op.value = withDelay(ms(650, speed), withTiming(0, { duration: ms(280, speed) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: drift.value }, { scale: s.value }] }));
  const size = fx.big ? 40 : fx.tone === 'gold' ? 32 : 26;
  const w = 120;
  const h = size * 1.6;
  return (
    <Animated.View style={[styles.abs, { left: px + 8, top: py - h - 2, width: w, height: h }, style]}>
      <StickerText text={fx.text} size={size} fill={TONE[fx.tone]} width={w} height={h} anchor="start" />
    </Animated.View>
  );
}

/** Lumpy cartoon cloud: ink silhouette, cream body, one hard shade tone. */
function Cloud({ size }: { size: number }) {
  const lumps = [
    [50, 58, 24],
    [30, 54, 17],
    [70, 54, 17],
    [40, 38, 18],
    [62, 38, 17],
    [50, 30, 14],
  ];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        {lumps.map(([x, y, r], i) => (
          <Circle key={`o${i}`} cx={x} cy={y} r={r + 3.5} fill={colors.ink} />
        ))}
        {lumps.map(([x, y, r], i) => (
          <Circle key={`s${i}`} cx={x} cy={y} r={r} fill={colors.paperShade} />
        ))}
        {lumps.map(([x, y, r], i) => (
          <Circle key={`b${i}`} cx={x - r * 0.18} cy={y - r * 0.2} r={r * 0.82} fill={colors.paper} />
        ))}
      </G>
    </Svg>
  );
}

interface PuffSpec {
  vx: number;
  vy: number;
  g: number;
  size: number;
  spin: number;
}

function Puff({ p, spec, px, py, shard, color }: { p: SharedValue<number>; spec: PuffSpec; px: number; py: number; shard?: boolean; color?: string }) {
  const style = useAnimatedStyle(() => {
    const t = p.value;
    return {
      opacity: t <= 0 ? 0 : t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4,
      transform: [
        { translateX: spec.vx * t },
        { translateY: spec.vy * t + spec.g * t * t },
        { rotate: `${spec.spin * t}deg` },
        { scale: shard ? 1 : 1 - t * 0.6 },
      ],
    };
  });
  if (shard)
    return (
      <Animated.View
        style={[
          styles.abs,
          {
            left: px - spec.size / 2,
            top: py - spec.size / 2,
            width: spec.size,
            height: spec.size * 0.7,
            borderRadius: 3,
            backgroundColor: color,
            borderWidth: 2,
            borderColor: colors.ink,
          },
          style,
        ]}
      />
    );
  return (
    <Animated.View style={[styles.abs, { left: px - spec.size / 2, top: py - spec.size / 2, width: spec.size, height: spec.size }, style]}>
      <Cloud size={spec.size} />
    </Animated.View>
  );
}

/**
 * Summon poof: the cloud reaches full size (~130 ms), holds while the coin
 * lands inside it, then breaks into small puffs drifting out and down (~650 ms).
 */
/** `dust` is the small landing puff kicked up around a coin's base (it must not hide the coin). */
function Poof({ px, py, delay, big, dust, speed }: { px: number; py: number; delay: number; big?: boolean; dust?: boolean; speed: number }) {
  const s = useSharedValue(0);
  const op = useSharedValue(0);
  const p = useSharedValue(0);
  const size = big ? 120 : dust ? 44 : 86;
  const specs = useMemo<PuffSpec[]>(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 7 + 0.3;
        const v = size * (0.38 + (i % 3) * 0.08);
        return { vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6 + 8, g: 18, size: size * (0.3 + (i % 2) * 0.08), spin: 0 };
      }),
    [size],
  );
  useEffect(() => {
    op.value = withDelay(delay, withSequence(withTiming(1, { duration: 1 }), withDelay(ms(250, speed), withTiming(0, { duration: ms(90, speed) }))));
    s.value = withDelay(delay, withTiming(1, { duration: ms(130, speed), easing: Easing.out(Easing.back(1.8)) }));
    p.value = withDelay(delay + ms(250, speed), withTiming(1, { duration: ms(400, speed), easing: Easing.out(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: 0.3 + s.value * 0.7 }] }));
  return (
    <>
      <Animated.View style={[styles.abs, { left: px - size / 2, top: py - size * 0.58, width: size, height: size }, style]}>
        <Cloud size={size} />
      </Animated.View>
      {specs.map((spec, i) => (
        <Puff key={i} p={p} spec={spec} px={px} py={py} />
      ))}
    </>
  );
}

/** Melee-style impact: a cream slash ring with speed lines that expands and breaks up (~250 ms). */
function Hit({ px, py, speed }: { px: number; py: number; speed: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: ms(260, speed), easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ring = useAnimatedStyle(() => ({ opacity: t.value < 0.55 ? 1 : 1 - (t.value - 0.55) / 0.45, transform: [{ scale: 0.55 + t.value * 0.75 }] }));
  const lines = useAnimatedStyle(() => ({ opacity: t.value < 0.4 ? 1 : 1 - (t.value - 0.4) / 0.6, transform: [{ scale: 0.7 + t.value * 0.6 }, { rotate: `${t.value * 18}deg` }] }));
  const size = 110;
  const rays = Array.from({ length: 9 }, (_, i) => (Math.PI * 2 * i) / 9 + (i % 2) * 0.15);
  return (
    <>
      <Animated.View style={[styles.abs, { left: px - size / 2, top: py - size / 2, width: size, height: size }, lines]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {rays.map((a, i) => (
            <Line
              key={i}
              x1={50 + Math.cos(a) * 30}
              y1={50 + Math.sin(a) * 30}
              x2={50 + Math.cos(a) * (44 + (i % 3) * 4)}
              y2={50 + Math.sin(a) * (44 + (i % 3) * 4)}
              stroke={i % 2 ? '#FFF6C8' : '#FFE07A'}
              strokeWidth={i % 3 === 0 ? 4 : 2.5}
              strokeLinecap="round"
            />
          ))}
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.abs, { left: px - size / 2, top: py - size / 2, width: size, height: size }, ring]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx={50} cy={50} r={30} fill="none" stroke="#FFFFFF" strokeWidth={9} opacity={0.35} />
          <Circle cx={50} cy={50} r={30} fill="none" stroke="#FFF8E6" strokeWidth={4} strokeDasharray="38 10 22 12" />
        </Svg>
      </Animated.View>
    </>
  );
}

/** Broken bits flying out of a destroyed coin, in its rim colour and gold. */
function Shards({ px, py, color, speed }: { px: number; py: number; color: string; speed: number }) {
  const p = useSharedValue(0);
  const specs = useMemo<PuffSpec[]>(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 8 + 0.4;
        const v = 60 + (i % 3) * 22;
        return { vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, g: 140, size: 9 + (i % 3) * 4, spin: (i % 2 ? 1 : -1) * 420 };
      }),
    [],
  );
  useEffect(() => {
    p.value = withTiming(1, { duration: ms(700, speed), easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {specs.map((spec, i) => (
        <Puff key={i} p={p} spec={spec} px={px} py={py} shard color={i % 3 === 0 ? colors.gold : color} />
      ))}
    </>
  );
}

/** Soft ring when a coin's ability fires. */
function Ring({ px, py, color, speed }: { px: number; py: number; color: string; speed: number }) {
  const s = useSharedValue(0.7);
  const op = useSharedValue(0.9);
  useEffect(() => {
    s.value = withTiming(1.6, { duration: ms(420, speed), easing: Easing.out(Easing.quad) });
    op.value = withTiming(0, { duration: ms(420, speed) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: s.value }] }));
  const size = 72;
  return (
    <Animated.View
      style={[styles.abs, { left: px - size / 2, top: py - size / 2, width: size, height: size, borderRadius: size / 2, borderWidth: 4, borderColor: color }, style]}
    />
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
});
