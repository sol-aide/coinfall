import React, { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Text as SvgText, TSpan } from 'react-native-svg';
import { colors, fonts } from '../theme';

const LETTERS = 'Coinfall'.split('');
// A gentle bouncy baseline (relative offsets per letter).
const DY = [0, -4, 5, -5, 4, -5, 5, -3];

/**
 * The "Coinfall" wordmark as a die-cut sticker: soft shadow, white border,
 * warm ink outline and a gold fill. Drops in with a small overshoot, then idles.
 */
export function Logo({ width = 320, still = false }: { width?: number; still?: boolean }) {
  const h = width * 0.36;
  const size = width * 0.205;
  const y = useSharedValue(still ? 0 : -40);
  const s = useSharedValue(still ? 1 : 0.4);
  const bob = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    y.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.back(1.8)) });
    s.value = withSequence(withTiming(1.1, { duration: 220, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 140 }));
    bob.value = withDelay(600, withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value + bob.value * 3 }, { scale: s.value }, { rotate: `${-2 + bob.value}deg` }] }));
  const base = h * 0.7;
  const layer = (fill: string, stroke: string | null, sw: number, dy = 0) => (
    <SvgText
      x={width / 2}
      y={base + dy}
      textAnchor="middle"
      fontSize={size}
      fontFamily={fonts.bold}
      letterSpacing={1}
      fill={fill}
      stroke={stroke ?? undefined}
      strokeWidth={stroke ? sw : 0}
      strokeLinejoin="round"
    >
      {LETTERS.map((l, i) => (
        <TSpan key={i} dy={i === 0 ? DY[0] : DY[i] - DY[i - 1]}>
          {l}
        </TSpan>
      ))}
    </SvgText>
  );
  return (
    <Animated.View style={style} accessible accessibilityRole="header" accessibilityLabel="Coinfall">
      <Svg width={width} height={h}>
        {layer('rgba(10,6,12,0.45)', 'rgba(10,6,12,0.45)', size * 0.42, 6)}
        {layer('#FFFFFF', '#FFFFFF', size * 0.42)}
        {layer(colors.ink, colors.ink, size * 0.2)}
        {layer(colors.gold, null, 0)}
        {layer('#FFE59A', null, 0, -size * 0.04)}
        {layer(colors.gold, null, 0, size * 0.02)}
      </Svg>
    </Animated.View>
  );
}
