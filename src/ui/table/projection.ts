// Maps engine table coordinates (x in [0,1], y in [0, TABLE_H]) onto a table
// seen from above and in front, so the scene reads as semi-3D: the far edge is
// narrower, depth is foreshortened, and coins resting on it are tilted away.

import { TABLE_H } from '../../engine';

/** Vertical foreshortening of the table plane (1 = straight top-down). */
export const FORESHORTEN = 0.8;
/** Width scale at the far edge relative to the near edge. */
export const FAR_SCALE = 0.84;
/** How far a coin lying on the table is tilted away from the viewer (degrees). */
export const REST_TILT = 40;

export interface Projection {
  width: number;
  height: number;
  /** Inner plane box, in pixels: the playing cloth. */
  plane: { top: number; bottom: number; nearHalf: number; farHalf: number };
  project: (x: number, y: number) => { x: number; y: number; s: number };
}

export function makeProjection(width: number): Projection {
  const marginX = width * 0.05;
  const top = width * 0.07;
  const planeH = TABLE_H * width * FORESHORTEN;
  const front = width * 0.11; // visible front edge of the table
  const height = top + planeH + width * 0.05 + front;
  const nearHalf = width / 2 - marginX;
  const project = (x: number, y: number) => {
    const d = Math.max(0, Math.min(1, y / TABLE_H));
    const s = FAR_SCALE + (1 - FAR_SCALE) * d;
    return { x: width / 2 + (x - 0.5) * 2 * nearHalf * s, y: top + y * width * FORESHORTEN, s };
  };
  return {
    width,
    height,
    plane: { top: top - width * 0.035, bottom: top + planeH + width * 0.035, nearHalf: nearHalf + width * 0.03, farHalf: (nearHalf + width * 0.03) * FAR_SCALE },
    project,
  };
}
