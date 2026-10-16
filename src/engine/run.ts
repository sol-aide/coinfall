// The run state machine. Every action takes a RunState and returns a NEW
// RunState (the input is never mutated), so the UI can store states freely.

import { STARTER_CHARMS, charmDef } from './content/charms';
import { coinDef } from './content/coins';
import { engravingDef } from './content/engravings';
import {
  MIN_BAG,
  PHASES,
  ROUNDS_PER_PHASE,
  SKIP_GOLD,
  applyFusion,
  duesFor,
  newInstance,
  rerollCost,
  rollRewards,
  rollShop,
} from './economy';
import { computeMods } from './mods';
import { resolvePhaseTrigger, resolveRound } from './resolve';
import { seedFrom } from './rng';
import type { RunState } from './types';

export const SAVE_VERSION = 1;
export const STARTING_BAG = ['copper', 'copper', 'copper', 'copper', 'copper', 'squire', 'grunt', 'archer'];
export const BASE_MELT_PER_PHASE = 1;
export const BASE_REROLL_PER_PHASE = 1;

export class ActionError extends Error {}

function clone(s: RunState): RunState {
  return JSON.parse(JSON.stringify(s)) as RunState;
}

export function newRun(seed: number | string): RunState {
  const s = seedFrom(seed);
  const run: RunState = {
    version: SAVE_VERSION,
    seed: s,
    rng: s,
    screen: 'pickCharm',
    phase: 1,
    round: 1,
    gold: 0,
    bag: [],
    charms: [],
    meltTokens: 0,
    rerollTokens: 1,
    nextUid: 1,
    rewardChoices: [],
    shop: [],
    shopRerolls: 0,
    starterChoices: STARTER_CHARMS.slice(),
    log: [],
    stats: { roundsPlayed: 0, bestRound: 0, goldEarned: 0, coinsDestroyed: 0, fusions: 0 },
    fusionNotes: [],
  };
  run.bag = STARTING_BAG.map((id) => newInstance(run, id));
  return run;
}

function assertScreen(run: RunState, screen: RunState['screen']) {
  if (run.screen !== screen) throw new ActionError(`Expected screen ${screen}, got ${run.screen}`);
}

function startPhase(run: RunState) {
  const { events, gold } = resolvePhaseTrigger(run, 'onPhaseStart');
  run.phaseReport = { phase: run.phase, events, gold };
  run.screen = 'ready';
}

export function chooseStarter(prev: RunState, charmId: string): RunState {
  assertScreen(prev, 'pickCharm');
  if (!prev.starterChoices.includes(charmId)) throw new ActionError('Not a starter charm');
  const run = clone(prev);
  run.charms.push(charmId);
  run.log.push(`Chose ${charmDef(charmId).name}.`);
  startPhase(run);
  return run;
}

export function playRound(prev: RunState): RunState {
  assertScreen(prev, 'ready');
  const run = clone(prev);
  run.fusionNotes = [];
  run.lastRound = resolveRound(run);
  run.rewardChoices = rollRewards(run);
  run.screen = 'reward';
  return run;
}

export function rerollRewards(prev: RunState): RunState {
  assertScreen(prev, 'reward');
  if (prev.rerollTokens < 1) throw new ActionError('No Reroll tokens');
  const run = clone(prev);
  run.rerollTokens--;
  run.rewardChoices = rollRewards(run);
  return run;
}

/** Take one of the offered coins (by index) or skip with `null` for a little gold. */
export function chooseReward(prev: RunState, index: number | null): RunState {
  assertScreen(prev, 'reward');
  const run = clone(prev);
  run.fusionNotes = [];
  if (index === null) {
    run.gold += SKIP_GOLD;
  } else {
    const defId = run.rewardChoices[index];
    if (!defId) throw new ActionError('Bad reward index');
    run.bag.push(newInstance(run, defId));
    run.fusionNotes = applyFusion(run);
  }
  run.rewardChoices = [];
  if (run.round < ROUNDS_PER_PHASE) {
    run.round++;
    run.screen = 'ready';
  } else {
    endPhase(run);
  }
  return run;
}

function endPhase(run: RunState) {
  const { events, gold } = resolvePhaseTrigger(run, 'onPhaseEnd');
  const mods = computeMods(run.charms);
  const melt = BASE_MELT_PER_PHASE + mods.meltPerPhase;
  const reroll = BASE_REROLL_PER_PHASE + mods.rerollPerPhase;
  run.meltTokens += melt;
  run.rerollTokens += reroll;
  events.push({ t: 'token', token: 'melt', amount: melt });
  events.push({ t: 'token', token: 'reroll', amount: reroll });
  run.phaseReport = { phase: run.phase, events, gold };
  run.screen = 'dues';
}

export function currentDues(run: RunState): number {
  return duesFor(run.phase, computeMods(run.charms));
}

export function canPayDues(run: RunState): boolean {
  return run.gold >= currentDues(run);
}

/** Pays the Guild. If the purse is short, the run is lost. */
export function payDues(prev: RunState): RunState {
  assertScreen(prev, 'dues');
  const run = clone(prev);
  const dues = currentDues(run);
  if (run.gold < dues) {
    run.screen = 'lost';
    run.log.push(`Could not pay ${dues} gold in phase ${run.phase}.`);
    return run;
  }
  run.gold -= dues;
  run.log.push(`Paid ${dues} gold dues for phase ${run.phase}.`);
  if (run.phase >= PHASES) {
    run.screen = 'won';
    return run;
  }
  run.shopRerolls = 0;
  run.shop = rollShop(run);
  run.screen = 'shop';
  return run;
}

export function shopRerollCost(run: RunState): number {
  return rerollCost(run.shopRerolls, computeMods(run.charms));
}

export function rerollShop(prev: RunState, useToken = false): RunState {
  assertScreen(prev, 'shop');
  const run = clone(prev);
  if (useToken) {
    if (run.rerollTokens < 1) throw new ActionError('No Reroll tokens');
    run.rerollTokens--;
  } else {
    const cost = shopRerollCost(run);
    if (run.gold < cost) throw new ActionError('Not enough gold');
    run.gold -= cost;
    run.shopRerolls++;
  }
  run.shop = rollShop(run);
  return run;
}

/** Buys shop item `index`. Engravings need `targetUid` (the coin to engrave). */
export function buyItem(prev: RunState, index: number, targetUid?: string): RunState {
  assertScreen(prev, 'shop');
  const run = clone(prev);
  const item = run.shop[index];
  if (!item || item.sold) throw new ActionError('Item unavailable');
  if (run.gold < item.price) throw new ActionError('Not enough gold');
  run.fusionNotes = [];
  switch (item.kind) {
    case 'coin':
      run.bag.push(newInstance(run, item.defId));
      run.fusionNotes = applyFusion(run);
      break;
    case 'charm':
      if (run.charms.includes(item.charmId)) throw new ActionError('Already owned');
      run.charms.push(item.charmId);
      break;
    case 'engraving': {
      const coin = run.bag.find((c) => c.uid === targetUid);
      if (!coin) throw new ActionError('Choose a coin to engrave');
      coin.engraving = item.engravingId;
      run.log.push(`Engraved ${engravingDef(item.engravingId).name} on ${coinDef(coin.defId).name}.`);
      break;
    }
    case 'token':
      if (item.token === 'melt') run.meltTokens++;
      else run.rerollTokens++;
      break;
  }
  run.gold -= item.price;
  item.sold = true;
  return run;
}

export function canMelt(run: RunState): boolean {
  return run.meltTokens > 0 && run.bag.length > MIN_BAG && (run.screen === 'shop' || run.screen === 'ready');
}

/** Spends a Melt token to remove a coin from the bag for good. */
export function meltCoin(prev: RunState, uid: string): RunState {
  if (!canMelt(prev)) throw new ActionError('Cannot melt now');
  const run = clone(prev);
  const coin = run.bag.find((c) => c.uid === uid);
  if (!coin) throw new ActionError('No such coin');
  run.bag = run.bag.filter((c) => c.uid !== uid);
  run.meltTokens--;
  run.log.push(`Melted ${coinDef(coin.defId).name}.`);
  return run;
}

export function leaveShop(prev: RunState): RunState {
  assertScreen(prev, 'shop');
  const run = clone(prev);
  run.phase++;
  run.round = 1;
  run.shop = [];
  run.fusionNotes = [];
  startPhase(run);
  return run;
}

export function isOver(run: RunState): boolean {
  return run.screen === 'won' || run.screen === 'lost';
}
