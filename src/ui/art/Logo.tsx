import React, { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Text as SvgText, TSpan } from 'react-native-svg';
import { colors } from '../theme';

const LETTERS = 'Coinfall'.split('');
const FILLS = ['#FFD23F', '#FF8A1F', '#FFD23F', '#2F8CFF', '#FF4A3D', '#22CC66', '#FFD23F', '#FF8A1F'];
// Bouncy baseline: relative vertical offsets per letter.
const DY = [0, -5, 7, -6, 5, -7, 6, -4];

/** The chunky outlined "Coinfall" wordmark. Drops in with a squash, then gently bobs. */
export function Logo({ width = 330, still = false }: { width?: number; still?: boolean }) {
  const h = width * 0.34;
  const size = width * 0.215;
  const s = useSharedValue(still ? 1 : 0.3);
  const y = useSharedValue(still ? 0 : -60);
  const bob = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    y.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.back(2.2)) });
    s.value = withSequence(withTiming(1.12, { duration: 380, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 220 }));
    bob.value = withDelay(700, withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value + bob.value * 5 }, { scale: s.value }, { rotate: `${-3 + bob.value * 2}deg` }] }));
  const base = h * 0.72;
  const layer = (fill: string | null, stroke: number, dy0: number) => (
    <SvgText
      x={width / 2}
      y={base + dy0}
      textAnchor="middle"
      fontSize={size}
      fontWeight="900"
      letterSpacing={1}
      stroke={fill ? undefined : colors.ink}
      strokeWidth={fill ? 0 : stroke}
      strokeLinejoin="round"
      fill={fill ?? colors.ink}
    >
      {LETTERS.map((l, i) => (
        <TSpan key={i} dy={i === 0 ? DY[0] : DY[i] - DY[i - 1]} fill={fill ? FILLS[i] : colors.ink}>
          {l}
        </TSpan>
      ))}
    </SvgText>
  );
  return (
    <Animated.View style={style} accessible accessibilityRole="header" accessibilityLabel="Coinfall">
      <Svg width={width} height={h}>
        {layer(null, size * 0.24, 7)}
        {layer(null, size * 0.24, 0)}
        {layer('fill', 0, 0)}
      </Svg>
    </Animated.View>
  );
}
