// Random-content rounds: every coin, Charm and engraving mixed together, checked
// against invariants that must hold whatever combination turns up.

import { CHARMS } from '../content/charms';
import { COINS } from '../content/coins';
import { ENGRAVINGS } from '../content/engravings';
import { MIN_BAG, newInstance } from '../economy';
import { tableValue, runMods } from '../mods';
import { resolveRound } from '../resolve';
import * as R from '../rng';
import { newRun } from '../run';
import type { RunState } from '../types';

function randomRun(seed: number): RunState {
  const run = newRun(`fuzz-${seed}`);
  const pick = <T,>(xs: readonly T[]) => xs[R.int(run, xs.length)];
  const size = MIN_BAG + R.int(run, 10);
  run.bag = Array.from({ length: size }, () => {
    const c = newInstance(run, pick(COINS).id, 1 + R.int(run, 3));
    if (R.chance(run, 0.4)) c.engraving = pick(ENGRAVINGS).id;
    return c;
  });
  const charms = new Set<string>();
  for (let i = 0; i < R.int(run, 7); i++) charms.add(pick(CHARMS).id);
  run.charms = [...charms];
  run.rank = 1 + R.int(run, 5);
  run.screen = 'ready';
  return run;
}

describe('engine fuzz', () => {
  it('keeps its invariants across 600 random rounds', () => {
    for (let seed = 0; seed < 600; seed++) {
      const run = randomRun(seed);
      const uids = new Set(run.bag.map((c) => c.uid));
      const goldBefore = run.gold;
      const result = resolveRound(run);

      expect(Number.isFinite(result.total)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.reduce((s, l) => s + l.amount, 0)).toBe(result.total);
      expect(run.gold).toBe(goldBefore + result.total);
      expect(run.bag.length).toBeGreaterThanOrEqual(MIN_BAG);

      for (const e of result.events) {
        if ('uid' in e && e.uid) expect(uids.has(e.uid)).toBe(true);
        if (e.t === 'value') expect(Number.isFinite(e.value)).toBe(true);
      }
      const mods = runMods(run);
      for (const tc of result.table) {
        const inst = run.bag.find((c) => c.uid === tc.uid);
        if (inst) expect(Number.isFinite(tableValue(tc, inst, mods))).toBe(true);
      }
    }
  });
});

describe('hand fuzz', () => {
  it('random swaps keep the hand valid and toss exactly the hand', () => {
    const { ActionError, chooseStarter, ensureHand, swapCoin, playRound } = require('../run') as typeof import('../run');
    for (let seed = 0; seed < 300; seed++) {
      let run = chooseStarter(newRun(`hfuzz-${seed}`), 'banner');
      const pick = <T,>(xs: readonly T[]) => xs[R.int(run, xs.length)];
      // A random bag with swap coins mixed in, and some Reroll tokens to spend.
      run = { ...run, bag: [...run.bag, ...Array.from({ length: R.int(run, 6) }, () => newInstance(run, pick(COINS).id))] };
      run.bag.push(newInstance(run, 'vagabond'), newInstance(run, 'scrounger'));
      run.rerollTokens = R.int(run, 3);
      run = ensureHand({ ...run, hand: undefined });
      const swaps = R.int(run, 4);
      for (let i = 0; i < swaps; i++) {
        const gold = run.gold;
        try {
          run = swapCoin(run, pick(run.hand!));
        } catch (e) {
          if (!(e instanceof ActionError)) throw e;
          break; // out of free swaps and tokens
        }
        expect(run.gold).toBeGreaterThanOrEqual(gold);
        expect(new Set(run.hand).size).toBe(run.hand!.length);
        expect(run.hand!.every((u) => run.bag.some((c) => c.uid === u))).toBe(true);
      }
      const hand = run.hand!.slice();
      const after = playRound(run);
      expect(after.lastRound!.table.map((c) => c.uid)).toEqual(hand);
      expect(after.lastRound!.breakdown.reduce((s, l) => s + l.amount, 0)).toBe(after.lastRound!.total);
    }
  });
});
