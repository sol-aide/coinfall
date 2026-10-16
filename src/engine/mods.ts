import { charmDef } from './content/charms';
import { coinDef } from './content/coins';
import { engravingDef } from './content/engravings';
import type { CoinDef, CoinInstance, Mods, Race, TableCoin } from './types';

export function emptyMods(): Mods {
  return {
    headsBonus: {},
    valueBonus: {},
    coinValueBonus: {},
    drawBonus: 0,
    rewardChoices: 0,
    radiusMult: 0,
    shopDiscount: 0,
    duesMult: 0,
    rerollDiscount: 0,
    tailsGold: 0,
    meltPerPhase: 0,
    rerollPerPhase: 0,
    firstCoinHeads: false,
    rareBoost: 0,
  };
}

function addRecord<K extends string>(into: Partial<Record<K, number>>, from?: Partial<Record<K, number>>) {
  if (!from) return;
  for (const k of Object.keys(from) as K[]) into[k] = (into[k] ?? 0) + (from[k] ?? 0);
}

/** Folds every owned Charm's static modifiers into one Mods object. */
export function computeMods(charmIds: readonly string[]): Mods {
  const m = emptyMods();
  for (const id of charmIds) {
    const c = charmDef(id).mods;
    if (!c) continue;
    addRecord(m.headsBonus, c.headsBonus);
    addRecord(m.valueBonus, c.valueBonus);
    addRecord(m.coinValueBonus, c.coinValueBonus);
    m.drawBonus += c.drawBonus ?? 0;
    m.rewardChoices += c.rewardChoices ?? 0;
    m.radiusMult += c.radiusMult ?? 0;
    m.shopDiscount += c.shopDiscount ?? 0;
    m.duesMult += c.duesMult ?? 0;
    m.rerollDiscount += c.rerollDiscount ?? 0;
    m.tailsGold += c.tailsGold ?? 0;
    m.meltPerPhase += c.meltPerPhase ?? 0;
    m.rerollPerPhase += c.rerollPerPhase ?? 0;
    m.firstCoinHeads = m.firstCoinHeads || !!c.firstCoinHeads;
    m.rareBoost += c.rareBoost ?? 0;
  }
  return m;
}

export function headsChance(inst: CoinInstance, mods: Mods): number {
  const def = coinDef(inst.defId);
  if (def.headsChance !== undefined && def.headsChance >= 1) return 1;
  const eng = inst.engraving ? engravingDef(inst.engraving) : undefined;
  let p = def.headsChance ?? eng?.headsChance ?? 0.5;
  p += (mods.headsBonus.all ?? 0) + (mods.headsBonus[def.race] ?? 0);
  return Math.max(0.05, Math.min(0.95, p));
}

/** The coin's value outside of a round (base + level + permanent bonus + charms). */
export function baseValue(inst: CoinInstance, mods: Mods): number {
  const def = coinDef(inst.defId);
  return def.value * inst.level + inst.bonus + raceBonus(def, mods);
}

export function raceBonus(def: CoinDef, mods: Mods): number {
  return (mods.valueBonus.all ?? 0) + (mods.valueBonus[def.race as Race] ?? 0) + (mods.coinValueBonus[def.id] ?? 0);
}

export function engravingMult(inst: CoinInstance): number {
  return inst.engraving ? (engravingDef(inst.engraving).mult ?? 1) : 1;
}

/** Current value of a coin on the table this round. */
export function tableValue(tc: TableCoin, inst: CoinInstance, mods: Mods): number {
  const v = (baseValue(inst, mods) + tc.temp) * tc.mult * engravingMult(inst);
  return Math.max(0, Math.floor(v));
}

/** Value shown in the bag / shop (no table effects). */
export function displayValue(inst: CoinInstance, mods: Mods): number {
  return Math.max(0, Math.floor(baseValue(inst, mods) * engravingMult(inst)));
}

export const ABILITY_TRIGGERS = ['onLand', 'onAdjacent', 'onRoundEnd'] as const;

export function hasTableAbility(def: CoinDef): boolean {
  return def.effects.some(
    (e) => (ABILITY_TRIGGERS as readonly string[]).includes(e.trigger) && e.do.kind !== 'retrigger' && e.do.kind !== 'copy',
  );
}
