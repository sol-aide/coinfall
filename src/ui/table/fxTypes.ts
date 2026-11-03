// Plain data for table effects, kept free of React Native so playback.ts stays unit-testable.
import type { Face } from '../../engine';

export type Fx =
  | { id: number; kind: 'num'; x: number; y: number; text: string; tone: 'gold' | 'value' | 'loss'; big?: boolean; tilt: number }
  | { id: number; kind: 'puff'; x: number; y: number; delay: number }
  | { id: number; kind: 'pow'; x: number; y: number; color: string; size?: number }
  | { id: number; kind: 'confetti'; x: number; y: number; palette: string[]; count: number; seed: number }
  | { id: number; kind: 'tear'; x: number; y: number; defId: string; face: Face; level: number }
  | { id: number; kind: 'ring'; x: number; y: number; color: string };

export const FX_LIFETIME = 1200;
