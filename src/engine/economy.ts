// Dues, prices, shop and reward generation, and fusion.

import { CHARMS, charmDef } from './content/charms';
import { COINS, coinDef } from './content/coins';
import { ENGRAVINGS } from './content/engravings';
import { computeMods } from './mods';
import * as R from './rng';
import type { CoinInstance, Mods, Rarity, RunState, ShopItem } from './types';

export const PHASES = 8;
export const ROUNDS_PER_PHASE = 5;
export const MAX_LEVEL = 3;
export const MIN_BAG = 5;

/** Guild dues owed at the end of each phase (before Charm discounts). */
export const DUES = [25, 45, 70, 105, 150, 205, 270, 350];

export function duesFor(phase: number, mods: Mods): number {
  const base = DUES[Math.min(phase, DUES.length) - 1];
  return Math.max(1, Math.round(base * (1 + mods.duesMult)));
}

export const SKIP_GOLD = 3;

const COIN_PRICE: Record<Rarity, number> = { starter: 3, common: 5, uncommon: 8, rare: 12 };
const CHARM_PRICE: Record<Rarity, number> = { starter: 0, common: 8, uncommon: 11, rare: 15 };
const ENGRAVING_PRICE: Record<Rarity, number> = { starter: 0, common: 6, uncommon: 9, rare: 12 };
export const TOKEN_PRICE = { melt: 4, reroll: 3 } as const;

function inflate(base: number, phase: number, mods: Mods): number {
  const p = base * (1 + 0.08 * (phase - 1)) * (1 - Math.min(0.6, mods.shopDiscount));
  return Math.max(1, Math.round(p));
}

export function coinPrice(defId: string, phase: number, mods: Mods) {
  return inflate(COIN_PRICE[coinDef(defId).rarity], phase, mods);
}
export function charmPrice(id: string, phase: number, mods: Mods) {
  return inflate(CHARM_PRICE[charmDef(id).rarity], phase, mods);
}
export function engravingPrice(rarity: Rarity, phase: number, mods: Mods) {
  return inflate(ENGRAVING_PRICE[rarity], phase, mods);
}

export function rerollCost(shopRerolls: number, mods: Mods): number {
  return Math.max(0, 2 + shopRerolls * 2 - mods.rerollDiscount);
}

function rarityWeight(r: Rarity, phase: number, mods: Mods): number {
  if (r === 'common') return 60;
  if (r === 'uncommon') return 28 + 3 * phase;
  if (r === 'rare') return (5 + 2 * phase) * (1 + mods.rareBoost);
  return 0;
}

const BUYABLE_COINS = COINS.filter((c) => !c.unbuyable);

/** Picks `n` distinct coin ids weighted by rarity. */
export function rollCoins(run: RunState, n: number, mods: Mods): string[] {
  const out: string[] = [];
  let pool = BUYABLE_COINS.slice();
  for (let i = 0; i < n && pool.length; i++) {
    const c = R.weightedPick(run, pool, (d) => rarityWeight(d.rarity, run.phase, mods));
    out.push(c.id);
    pool = pool.filter((d) => d.id !== c.id);
  }
  return out;
}

export function rollRewards(run: RunState): string[] {
  const mods = computeMods(run.charms);
  return rollCoins(run, 3 + mods.rewardChoices, mods);
}

export function rollShop(run: RunState): ShopItem[] {
  const mods = computeMods(run.charms);
  const items: ShopItem[] = [];
  for (const id of rollCoins(run, 3, mods)) items.push({ kind: 'coin', defId: id, price: coinPrice(id, run.phase, mods) });

  let charms = CHARMS.filter((c) => !c.starter && !run.charms.includes(c.id));
  for (let i = 0; i < 2 && charms.length; i++) {
    const c = R.weightedPick(run, charms, (d) => rarityWeight(d.rarity, run.phase, mods));
    items.push({ kind: 'charm', charmId: c.id, price: charmPrice(c.id, run.phase, mods) });
    charms = charms.filter((d) => d.id !== c.id);
  }

  let engs = ENGRAVINGS.slice();
  for (let i = 0; i < 2; i++) {
    const e = R.weightedPick(run, engs, (d) => rarityWeight(d.rarity, run.phase, mods));
    items.push({ kind: 'engraving', engravingId: e.id, price: engravingPrice(e.rarity, run.phase, mods) });
    engs = engs.filter((d) => d.id !== e.id);
  }
  items.push({ kind: 'token', token: 'melt', price: inflate(TOKEN_PRICE.melt, run.phase, mods) });
  return items;
}

export function newInstance(run: RunState, defId: string, level = 1): CoinInstance {
  return { uid: `c${run.nextUid++}`, defId, level, bonus: 0, streak: 0, streakBonus: 0 };
}

/**
 * Fuses any three identical coins (same type and level) into one coin a level
 * higher. Repeats until nothing more can fuse. Returns readable notes.
 */
export function applyFusion(run: RunState): string[] {
  const notes: string[] = [];
  for (;;) {
    const groups = new Map<string, CoinInstance[]>();
    for (const c of run.bag) {
      // Plain Copper never fuses (the starting bag holds five of them).
      if (c.level >= MAX_LEVEL || coinDef(c.defId).unbuyable) continue;
      const key = `${c.defId}@${c.level}`;
      groups.set(key, [...(groups.get(key) ?? []), c]);
    }
    const trio = [...groups.values()].find((g) => g.length >= 3);
    if (!trio) break;
    // Prefer fusing coins that carry engravings or bonuses so nothing is wasted.
    const parts = trio
      .slice()
      .sort((a, b) => (b.engraving ? 1 : 0) - (a.engraving ? 1 : 0) || b.bonus - a.bonus)
      .slice(0, 3);
    const fused = newInstance(run, parts[0].defId, parts[0].level + 1);
    fused.bonus = parts.reduce((s, p) => s + (p.bonus - p.streakBonus), 0);
    fused.engraving = parts.find((p) => p.engraving)?.engraving;
    const ids = new Set(parts.map((p) => p.uid));
    const firstIdx = run.bag.findIndex((c) => ids.has(c.uid));
    run.bag = run.bag.filter((c) => !ids.has(c.uid));
    run.bag.splice(Math.min(firstIdx, run.bag.length), 0, fused);
    run.stats.fusions++;
    notes.push(`Three ${coinDef(fused.defId).name} coins fused into a level ${fused.level} ${coinDef(fused.defId).name}!`);
  }
  return notes;
}
