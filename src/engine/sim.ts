// Simple bot players used by tests and the balance simulation.

import { charmDef } from './content/charms';
import { coinDef } from './content/coins';
import { MAX_CHARMS, duesFor } from './economy';
import { displayValue, runMods } from './mods';
import * as R from './rng';
import {
  buyItem,
  canMelt,
  chooseReward,
  chooseStarter,
  currentDues,
  ensureHand,
  leaveShop,
  meltCoin,
  newRun,
  payDues,
  playRound,
  rerollRewards,
  rerollShop,
  shopRerollCost,
  swapCoin,
} from './run';
import type { CoinDef, RunState } from './types';

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
  tinker: 2.6,
  guildmaster: 4.4,
  caravan: 3,
  juggler: 2.4,
  towncrier: 3,
  gemcutter: 4.2,
  herald: 2.8,
  quartermaster: 2.2,
  grunt: 2.4,
  berserker: 3,
  charger: 2.4,
  shaman: 2.6,
  firebrand: 3.4,
  wrecker: 2.4,
  looter: 2.6,
  brawler: 2.6,
  warlord: 4.4,
  cutpurse: 2.6,
  raider: 2.8,
  mercenary: 2.6,
  powderkeg: 2.6,
  wardrummer: 3,
  bonebreaker: 2.8,
  wargrider: 2.4,
  archer: 2.6,
  moonpriestess: 3,
  sentinel: 2.6,
  bladedancer: 3,
  ranger: 2.6,
  seer: 2.2,
  longbow: 3,
  druid: 2.6,
  starweaver: 4.2,
  envoy: 4,
  wisp: 2.6,
  grovelder: 4.2,
  lorekeeper: 3,
  gladewarden: 2.6,
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
  treaty: 3,
  rallyhorn: 3,
  loupe: 2.5,
  spintop: 2,
  sparepurse: 3,
};

/** Build-around Charms are only worth their rating when the bag has coins they improve. */
function charmRating(run: RunState, id: string): number {
  const base = CHARM_RATING[id] ?? 2;
  const has = (pred: (e: CoinDef['effects'][number]) => boolean) => run.bag.some((c) => coinDef(c.defId).effects.some(pred));
  if (id === 'loupe') return has((e) => e.do.kind === 'mult') ? base + 1 : 0.5;
  if (id === 'rallyhorn') return has((e) => !!e.require && 'count' in e.require.per && !!e.require.per.count.race) ? base + 1 : 0.5;
  return base;
}

function starterRace(run: RunState) {
  const c = run.charms.map(charmDef).find((d) => d.starter);
  return c?.race;
}

/**
 * Reads a coin's conditions from its data: set bonuses are worth more the more
 * of that race the bag holds, mixed-table coins the more races it holds.
 */
function synergyBonus(run: RunState, def: ReturnType<typeof coinDef>): number {
  let bonus = 0;
  const share = (race: string) => run.bag.filter((c) => coinDef(c.defId).race === race).length / Math.max(1, run.bag.length);
  const racesHeld = new Set(run.bag.map((c) => coinDef(c.defId).race).filter((r) => r !== 'neutral'));
  for (const e of def.effects) {
    const per = e.require?.per ?? (e.do.kind === 'gold' || e.do.kind === 'buff' ? e.do.per : undefined);
    if (!per) continue;
    if ('races' in per) bonus += racesHeld.size >= 3 ? 1 : racesHeld.size === 2 ? 0 : -1;
    else if (e.require && 'count' in per && per.count.race) bonus += share(per.count.race) * 4 - 1;
  }
  return Math.max(-1.5, Math.min(1.5, bonus));
}

function rateCoin(run: RunState, defId: string): number {
  const def = coinDef(defId);
  let r = COIN_RATING[defId] ?? 2;
  if (def.race === starterRace(run)) r += 0.6;
  const raceCount = run.bag.filter((c) => coinDef(c.defId).race === def.race).length;
  r += Math.min(1, raceCount * 0.15);
  r += synergyBonus(run, def);
  const same = run.bag.filter((c) => c.defId === defId && c.level === 1).length;
  if (same === 2) r += 2.5;
  else if (same === 1) r += 0.5;
  return r;
}

function bagAverage(run: RunState): number {
  const mods = runMods(run);
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
  const mods = runMods(run);
  const candidates = run.bag.filter((c) => !c.engraving);
  if (!candidates.length) return undefined;
  const inBag = (pred: (e: CoinDef['effects'][number]) => boolean) => run.bag.some((c) => coinDef(c.defId).effects.some(pred));
  const destroyers = inBag((e) => e.do.kind === 'destroy');
  const flipPayoff = inBag((e) => e.trigger === 'onFlip') || run.charms.some((id) => ['whirlwind', 'spintop'].includes(id));
  const score = (c: (typeof candidates)[number]) => {
    const def = coinDef(c.defId);
    let s = displayValue(c, mods) + (COIN_RATING[c.defId] ?? 1) * c.level;
    if (engravingId === 'lucky' && def.headsChance === 1) s = -1;
    if (engravingId === 'echo' && def.effects.length === 0) s = -1;
    if (engravingId === 'secondwind' && c.defId !== 'firebrand') s *= 0.5;
    if (engravingId === 'twofaced' && !def.effects.some((e) => e.when)) s = -1;
    // Hollow goes on cheap fodder, and only when something in the bag destroys coins.
    if (engravingId === 'hollow') s = destroyers ? 20 - displayValue(c, mods) : -1;
    // Spiked only helps when the bag pays for flips.
    if (engravingId === 'spiked' && !flipPayoff) s = -1;
    return s;
  };
  const best = candidates.slice().sort((a, b) => score(b) - score(a))[0];
  return score(best) > 0 ? best.uid : undefined;
}

function botShop(run: RunState, strategy: Strategy): RunState {
  const h = rngFor(run);
  const mods = runMods(run);
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
      if (choice.item.kind === 'charm' && run.charms.length >= MAX_CHARMS) break;
    } else {
      const rate = (o: (typeof options)[number]) => {
        const it = o.item;
        if (it.kind === 'charm') return run.charms.length >= MAX_CHARMS ? -1 : charmRating(run, it.charmId) * 1.2;
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
    const charm = run.shop.findIndex((it) => it.kind === 'charm' && run.charms.length < MAX_CHARMS && !it.sold && it.price <= run.gold - reserve && charmRating(run, it.charmId) >= 3);
    if (charm >= 0) {
      run = buyItem(run, charm);
      continue;
    }
    break;
  }
  return run;
}

/** Uses the free swap on the weakest coin in hand when it rates below the bag average. */
function botHand(run: RunState): RunState {
  run = ensureHand(run);
  if (!run.hand) return run;
  const rate = (uid: string) => {
    const c = run.bag.find((b) => b.uid === uid)!;
    return (COIN_RATING[c.defId] ?? 2) * c.level;
  };
  // Spend every free swap on the weakest coin while it is below the bag average.
  for (let i = 0; i < 4 && (run.freeSwaps ?? 0) > 0; i++) {
    const worst = run.hand!.slice().sort((a, b) => rate(a) - rate(b))[0];
    if (rate(worst) >= bagAverage(run) || run.bag.length <= run.hand!.length) break;
    run = swapCoin(run, worst);
  }
  return run;
}

/** Advances a run by one bot decision. */
export function botStep(run: RunState, strategy: Strategy = 'sensible'): RunState {
  switch (run.screen) {
    case 'pickCharm':
      return chooseStarter(run, run.starterChoices[R.int(rngFor(run), run.starterChoices.length)]);
    case 'ready':
      return playRound(strategy === 'random' ? run : botHand(run));
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
  /** Gold held when each phase's dues came due. */
  goldAtDues: number[];
  finalBag: string[];
  charms: string[];
}

export function simulateRun(seed: number | string, strategy: Strategy = 'sensible', starterIndex?: number, rank = 1): SimResult {
  let run = newRun(seed);
  const h = rngFor(run);
  const starter = run.starterChoices[starterIndex ?? R.int(h, run.starterChoices.length)];
  run = chooseStarter(run, starter);
  if (rank > 1) run.rank = rank;
  let guard = 0;
  const goldAtDues: number[] = [];
  while (run.screen !== 'won' && run.screen !== 'lost' && guard++ < 1000) {
    if (run.screen === 'dues') goldAtDues.push(run.gold);
    run = botStep(run, strategy);
  }
  return {
    won: run.screen === 'won',
    phaseReached: run.phase,
    gold: run.gold,
    bagSize: run.bag.length,
    starter,
    roundsPlayed: run.stats.roundsPlayed,
    bestRound: run.stats.bestRound,
    goldAtDues,
    finalBag: run.bag.map((c) => c.defId),
    charms: run.charms,
  };
}

export { currentDues };
