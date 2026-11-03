import React from 'react';
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type IconName = 'gold' | 'melt' | 'reroll' | 'bag' | 'gear' | 'charm' | 'engraving' | 'seal' | 'close' | 'info' | 'play';

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color?: string }) {
  const c = color ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {render(name, c)}
    </Svg>
  );
}

function render(name: IconName, c: string) {
  switch (name) {
    case 'gold':
      return (
        <>
          <Circle cx={50} cy={50} r={43} fill={colors.goldDeep} stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" />
          <Circle cx={48} cy={48} r={35} fill={colors.gold} />
          <Path d="M50 28 L56 44 L72 44 L59 54 L64 70 L50 60 L36 70 L41 54 L28 44 L44 44 Z" fill={colors.goldDeep} />
        </>
      );
    case 'melt':
      return (
        <>
          <Path d="M50 10 Q78 44 78 62 Q78 90 50 90 Q22 90 22 62 Q22 44 50 10 Z" fill="#F07A2C" stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" />
          <Path d="M50 46 Q64 62 64 70 Q64 80 50 80 Q36 80 36 70 Q36 62 50 46 Z" fill="#FFD36B" />
        </>
      );
    case 'reroll':
      return (
        <>
          <Path d="M78 46 A30 30 0 1 0 70 72" stroke="#2F7FD1" strokeWidth={12} fill="none" strokeLinecap="round" />
          <Polygon points="94,38 64,44 82,66" fill="#2F7FD1" stroke="#2F7FD1" strokeWidth={3} strokeLinejoin="round" />
        </>
      );
    case 'bag':
      return (
        <>
          <Path d="M36 26 Q20 44 20 64 Q20 88 50 88 Q80 88 80 64 Q80 44 64 26 Z" fill="#C98A4B" stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" />
          <Path d="M36 26 L30 12 L70 12 L64 26 Z" fill="#A86B32" stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" />
          <Rect x={32} y={24} width={36} height={7} rx={3} fill="#6B4226" />
          <Circle cx={50} cy={60} r={12} fill={colors.gold} />
        </>
      );
    case 'gear':
      return (
        <>
          <Polygon
            points="50,8 58,20 72,14 74,30 90,32 82,46 92,58 78,64 80,80 64,78 58,92 46,82 32,90 30,74 14,70 22,56 10,44 26,38 26,22 40,24"
            fill={c}
            stroke={c}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <Circle cx={50} cy={50} r={14} fill={colors.panel} />
        </>
      );
    case 'charm':
      return (
        <>
          <Path d="M30 14 Q50 34 70 14" stroke={colors.goldDeep} strokeWidth={6} fill="none" />
          <Path d="M50 30 L76 54 L50 92 L24 54 Z" fill="#9A6BEA" stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" />
          <Path d="M50 30 L60 54 L50 92 L40 54 Z" fill="#D9C2FF" />
        </>
      );
    case 'engraving':
      return (
        <>
          <Polygon points="50,8 84,50 50,92 16,50" fill="#9EE6F5" stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" />
          <Polygon points="50,8 62,50 50,92 38,50" fill="#5CC4DD" />
          <Line x1={16} y1={50} x2={84} y2={50} stroke="#1B5E7A" strokeWidth={4} />
        </>
      );
    case 'seal':
      return (
        <>
          <Circle cx={50} cy={46} r={34} fill="#C0392B" stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" />
          <Path d="M36 74 L30 96 L44 88 L50 96 L50 78 Z M64 74 L70 96 L56 88 L50 96 L50 78 Z" fill="#922B21" />
          <Path d="M50 24 L56 40 L72 40 L59 50 L64 66 L50 56 L36 66 L41 50 L28 40 L44 40 Z" fill={colors.gold} />
        </>
      );
    case 'close':
      return (
        <>
          <Line x1={24} y1={24} x2={76} y2={76} stroke={c} strokeWidth={11} strokeLinecap="round" />
          <Line x1={76} y1={24} x2={24} y2={76} stroke={c} strokeWidth={11} strokeLinecap="round" />
        </>
      );
    case 'info':
      return (
        <>
          <Circle cx={50} cy={50} r={42} stroke={c} strokeWidth={8} fill="none" />
          <Circle cx={50} cy={30} r={6} fill={c} />
          <Rect x={44} y={44} width={12} height={32} rx={5} fill={c} />
        </>
      );
    case 'play':
      return <Polygon points="28,16 84,50 28,84" fill={c} />;
  }
}
