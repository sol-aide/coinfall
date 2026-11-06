import { newInstance } from '../economy';
import { newCtx, type Ctx } from '../resolve';
import { newRun } from '../run';
import type { CoinInstance, Face, RunState, TableCoin } from '../types';

export function makeRun(bag: string[], charms: string[] = [], seed = 1): RunState {
  const run = newRun(seed);
  run.bag = bag.map((id) => newInstance(run, id));
  run.charms = charms;
  run.screen = 'ready';
  return run;
}

export interface Spot {
  defId: string;
  x?: number;
  y?: number;
  face?: Face;
  level?: number;
  engraving?: string;
  landed?: boolean;
}

/** Builds a resolution context with coins already placed on the table. */
export function table(spots: Spot[], charms: string[] = [], seed = 1): { ctx: Ctx; run: RunState; coins: TableCoin[]; inst: CoinInstance[] } {
  const run = makeRun(
    spots.map((s) => s.defId),
    charms,
    seed,
  );
  run.bag.forEach((c, i) => {
    c.level = spots[i].level ?? 1;
    c.engraving = spots[i].engraving;
  });
  const ctx = newCtx(run, 'end');
  ctx.table = run.bag.map((inst, i) => ({
    uid: inst.uid,
    defId: inst.defId,
    level: inst.level,
    x: spots[i].x ?? i * 0.1,
    y: spots[i].y ?? 0.5,
    face: spots[i].face ?? 'heads',
    landed: spots[i].landed ?? true,
    destroyed: false,
    temp: 0,
    mult: 1,
    order: i,
  }));
  return { ctx, run, coins: ctx.table, inst: run.bag };
}

export function goldEvents(ctx: Ctx): number {
  return ctx.events.reduce((s, e) => (e.t === 'gold' ? s + e.amount : s), 0);
}
