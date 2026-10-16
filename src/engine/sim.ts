// Simple bot players used by tests and the balance simulation.

import { charmDef } from './content/charms';
import { coinDef } from './content/coins';
import { duesFor } from './economy';
import { computeMods, displayValue } from './mods';
import * as R from './rng';
import {
  buyItem,
  canMelt,
  chooseReward,
  chooseStarter,
  currentDues,
  leaveShop,
  meltCoin,
  newRun,
  payDues,
  playRound,
  rerollRewards,
  rerollShop,
  shopRerollCost,
} from './run';
import type { RunState } from './types';

export type Strategy = 'sensible' | 'random' | 'greedy';

/** Hand-tuned rough worth of each coin for the bot. */
export const COIN_RATING: Record<string, number> = {
  copper: 1,
  squire: 2.6,
  merchant: 3,
  moneychanger: 2.6,
  captain: 3,
  bard: 2.6,
  apprentice: 2.4,
  patron: 2.6,
  innkeeper: 3,
  tinker: 1.6,
  guildmaster: 4.4,
  grunt: 2.4,
  berserker: 3,
  charger: 2.4,
  shaman: 2.6,
  firebrand: 3.4,
  wrecker: 2,
  looter: 2.6,
  brawler: 2.6,
  warlord: 4.4,
  archer: 2.6,
  moonpriestess: 3,
  sentinel: 2.6,
  bladedancer: 3,
  ranger: 2.6,
  seer: 2.2,
  longbow: 3,
  druid: 2.6,
  starweaver: 4.2,
};

export const CHARM_RATING: Record<string, number> = {
  clover: 3,
  pockets: 5,
  ledger: 3.5,
  haggler: 2.5,
  whirlwind: 2,
  spade: 2,
  scales: 4.5,
  longtable: 3,
  collector: 2,
  crown: 3,
  crucible: 2,
  dice: 1.5,
  tailwind: 3.5,
  firstlight: 3,
  charter: 3,
  skullcup: 3,
  moonwell: 3,
  lantern: 2,
  anvil: 3.5,
};

function starterRace(run: RunState) {
  const c = run.charms.map(charmDef).find((d) => d.starter);
  return c?.race;
}

function rateCoin(run: RunState, defId: string): number {
  const def = coinDef(defId);
  let r = COIN_RATING[defId] ?? 2;
  if (def.race === starterRace(run)) r += 0.6;
  const raceCount = run.bag.filter((c) => coinDef(c.defId).race === def.race).length;
  r += Math.min(1, raceCount * 0.15);
  const same = run.bag.filter((c) => c.defId === defId && c.level === 1).length;
  if (same === 2) r += 2.5;
  else if (same === 1) r += 0.5;
  return r;
}

function bagAverage(run: RunState): number {
  const mods = computeMods(run.charms);
  const vals = run.bag.map((c) => (COIN_RATING[c.defId] ?? 2) * c.level + displayValue(c, mods) * 0.15);
  return vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
}

function rngFor(run: RunState) {
  // A separate stream so the bot's choices don't disturb game randomness.
  return { rng: (run.rng ^ 0x9e3779b9) >>> 0 };
}

function botReward(run: RunState, strategy: Strategy): RunState {
  if (strategy === 'random') {
    const h = rngFor(run);
    const i = R.int(h, run.rewardChoices.length + 1);
    return chooseReward(run, i === run.rewardChoices.length ? null : i);
  }
  let rated = run.rewardChoices.map((id, i) => ({ i, r: rateCoin(run, id) })).sort((a, b) => b.r - a.r);
  if (strategy === 'sensible' && rated[0].r < 2.8 && run.rerollTokens > 1) {
    run = rerollRewards(run);
    rated = run.rewardChoices.map((id, i) => ({ i, r: rateCoin(run, id) })).sort((a, b) => b.r - a.r);
  }
  const threshold = strategy === 'greedy' ? 0 : bagAverage(run) + 0.4;
  if (rated[0].r >= threshold) return chooseReward(run, rated[0].i);
  return chooseReward(run, null);
}

function bestCoinFor(run: RunState, engravingId: string): string | undefined {
  const mods = computeMods(run.charms);
  const candidates = run.bag.filter((c) => !c.engraving);
  if (!candidates.length) return undefined;
  const score = (c: (typeof candidates)[number]) => {
    const def = coinDef(c.defId);
    let s = displayValue(c, mods) + (COIN_RATING[c.defId] ?? 1) * c.level;
    if (engravingId === 'lucky' && def.headsChance === 1) s = -1;
    if (engravingId === 'echo' && def.effects.length === 0) s = -1;
    if (engravingId === 'secondwind' && c.defId !== 'firebrand') s *= 0.5;
    return s;
  };
  const best = candidates.slice().sort((a, b) => score(b) - score(a))[0];
  return score(best) > 0 ? best.uid : undefined;
}

function botShop(run: RunState, strategy: Strategy): RunState {
  const h = rngFor(run);
  const mods = computeMods(run.charms);
  const nextDues = duesFor(Math.min(run.phase + 1, 8), mods);
  const reserve = strategy === 'random' ? 0 : Math.round(nextDues * 0.2);

  // Melt the weakest coins.
  if (strategy !== 'random') {
    while (canMelt(run) && run.bag.length > 8) {
      const weakest = run.bag.slice().sort((a, b) => (COIN_RATING[a.defId] ?? 2) * a.level - (COIN_RATING[b.defId] ?? 2) * b.level)[0];
      if ((COIN_RATING[weakest.defId] ?? 2) * weakest.level > bagAverage(run) * 0.8) break;
      run = meltCoin(run, weakest.uid);
    }
  }

  for (let pass = 0; pass < 3; pass++) {
    const options = run.shop
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => !item.sold && item.price <= run.gold - reserve);
    if (!options.length) break;
    let choice: (typeof options)[number] | undefined;
    if (strategy === 'random') {
      if (R.chance(h, 0.3)) break;
      choice = options[R.int(h, options.length)];
    } else {
      const rate = (o: (typeof options)[number]) => {
        const it = o.item;
        if (it.kind === 'charm') return (CHARM_RATING[it.charmId] ?? 2) * 1.2;
        if (it.kind === 'coin') return rateCoin(run, it.defId) - bagAverage(run);
        if (it.kind === 'engraving') return bestCoinFor(run, it.engravingId) ? 2.5 : -1;
        return run.bag.length > 10 ? 0.8 : -1;
      };
      const best = options.map((o) => ({ o, r: rate(o) })).sort((a, b) => b.r - a.r)[0];
      if (best.r <= 0.5) break;
      choice = best.o;
    }
    const it = choice.item;
    let target: string | undefined;
    if (it.kind === 'engraving') {
      target = strategy === 'random' ? run.bag[R.int(h, run.bag.length)].uid : bestCoinFor(run, it.engravingId);
      if (!target) continue;
    }
    run = buyItem(run, choice.i, target);
  }

  if (strategy === 'sensible' && run.rerollTokens > 0) {
    run = rerollShop(run, true);
    return botShopBuyOnly(run, reserve);
  }
  if (strategy === 'random' && run.gold > shopRerollCost(run) && R.chance(h, 0.2)) {
    run = rerollShop(run);
  }
  return run;
}

function botShopBuyOnly(run: RunState, reserve: number): RunState {
  for (let pass = 0; pass < 2; pass++) {
    const charm = run.shop.findIndex((it) => it.kind === 'charm' && !it.sold && it.price <= run.gold - reserve && (CHARM_RATING[it.charmId] ?? 0) >= 3);
    if (charm >= 0) {
      run = buyItem(run, charm);
      continue;
    }
    break;
  }
  return run;
}

/** Advances a run by one bot decision. */
export function botStep(run: RunState, strategy: Strategy = 'sensible'): RunState {
  switch (run.screen) {
    case 'pickCharm':
      return chooseStarter(run, run.starterChoices[R.int(rngFor(run), run.starterChoices.length)]);
    case 'ready':
      return playRound(run);
    case 'reward':
      return botReward(run, strategy);
    case 'dues':
      return payDues(run);
    case 'shop':
      return leaveShop(botShop(run, strategy));
    default:
      return run;
  }
}

export interface SimResult {
  won: boolean;
  phaseReached: number;
  gold: number;
  bagSize: number;
  starter: string;
  roundsPlayed: number;
  bestRound: number;
}

export function simulateRun(seed: number | string, strategy: Strategy = 'sensible', starterIndex?: number): SimResult {
  let run = newRun(seed);
  const h = rngFor(run);
  const starter = run.starterChoices[starterIndex ?? R.int(h, run.starterChoices.length)];
  run = chooseStarter(run, starter);
  let guard = 0;
  while (run.screen !== 'won' && run.screen !== 'lost' && guard++ < 1000) run = botStep(run, strategy);
  return {
    won: run.screen === 'won',
    phaseReached: run.phase,
    gold: run.gold,
    bagSize: run.bag.length,
    starter,
    roundsPlayed: run.stats.roundsPlayed,
    bestRound: run.stats.bestRound,
  };
}

export { currentDues };
