// Synergy tags, derived from a coin's own effect data so they never drift from
// the rules. Pure TypeScript (no React Native) so it can be unit-tested.

import { coinDef, type Action, type CoinDef, type Count, type Race, type RunState, type Target } from '../../engine';

export type TagId = 'gold' | 'grows' | 'flips' | 'tails' | 'heads' | 'wreck' | 'mult' | 'set' | 'mixed' | 'counts' | 'boost' | 'echo';

export interface SynergyTag {
  id: TagId;
  label: string;
}

const PLURAL: Record<Race, string> = { human: 'Humans', orc: 'Orcs', elf: 'Elves', neutral: 'Plain coins' };

function targets(a: Action): Target[] {
  return 'target' in a ? [a.target] : [];
}

function counts(a: Action): Count[] {
  return 'per' in a && a.per && typeof a.per === 'object' ? [a.per] : [];
}

/** The tags for a coin, in a stable display order. */
export function synergyTags(def: CoinDef): SynergyTag[] {
  const has = new Set<TagId>();
  let setRace: Race | undefined;
  let setMin = 0;
  let countRace: Race | undefined;
  if (def.headsChance === 1) has.add('heads');
  for (const e of def.effects) {
    const a = e.do;
    if (a.kind === 'gold' || a.kind === 'interest') has.add('gold');
    if ((a.kind === 'buff' && a.permanent) || a.kind === 'streak' || (a.kind === 'destroy' && a.absorb)) has.add('grows');
    if (a.kind === 'flip' || a.kind === 'bump' || e.trigger === 'onFlip') has.add('flips');
    if (a.kind === 'setHeads' || a.kind === 'reflip' || a.kind === 'blessNext') has.add('heads');
    if (a.kind === 'destroy' || e.trigger === 'onDestroy') has.add('wreck');
    if (a.kind === 'mult') has.add('mult');
    if (a.kind === 'retrigger' || a.kind === 'copy') has.add('echo');
    if ((a.kind === 'buff' || a.kind === 'mult') && a.target.scope !== 'self') has.add('boost');
    const all: Count[] = [...counts(a), ...(e.require ? [e.require.per] : [])];
    // Tails payoffs (not coins that merely turn tails coins over to heads).
    const turnsTails = a.kind === 'reflip' || a.kind === 'setHeads';
    if (e.when === 'tails' || [...targets(a), ...all.flatMap((c) => ('count' in c ? [c.count] : []))].some((t) => t.face === 'tails' && !turnsTails)) has.add('tails');
    const raceCount = counts(a).find((c) => 'count' in c && c.count.race);
    if (raceCount && 'count' in raceCount && !e.require) {
      has.add('counts');
      countRace = raceCount.count.race;
    }
    if (all.some((c) => 'races' in c)) has.add('mixed');
    if (e.require && 'count' in e.require.per && e.require.per.count.race) {
      has.add('set');
      setRace = e.require.per.count.race;
      setMin = e.require.min;
    }
  }
  if (has.has('mult')) has.delete('boost'); // ×2 already says it
  const order: TagId[] = ['set', 'mixed', 'counts', 'mult', 'echo', 'boost', 'flips', 'tails', 'heads', 'wreck', 'grows', 'gold'];
  const label = (id: TagId): string => {
    switch (id) {
      case 'set':
        return `Set: ${setMin} ${PLURAL[setRace ?? 'neutral']}`;
      case 'mixed':
        return 'Mixed table';
      case 'counts':
        return `Counts ${PLURAL[countRace ?? 'neutral']}`;
      case 'echo':
        return 'Retrigger';
      case 'boost':
        return 'Boosts others';
      case 'mult':
        return '×2';
      case 'flips':
        return 'Flips';
      case 'tails':
        return 'Tails';
      case 'heads':
        return 'Heads control';
      case 'wreck':
        return 'Wreckage';
      case 'grows':
        return 'Grows';
      case 'gold':
        return 'Gold';
    }
  };
  return order.filter((id) => has.has(id)).map((id) => ({ id, label: label(id) }));
}

/**
 * A one-line note on how well a set or mixed-table coin fits the current bag,
 * e.g. "Your bag: 4 Humans" or "Your bag: 2 of 3 races". Undefined for other coins.
 */
export function bagFitNote(def: CoinDef, run: RunState): string | undefined {
  const tags = synergyTags(def);
  if (tags.some((t) => t.id === 'mixed')) {
    const races = new Set(run.bag.map((c) => coinDef(c.defId).race).filter((r) => r !== 'neutral'));
    return `Your bag: ${races.size} of 3 races`;
  }
  const set = def.effects.find((e) => e.require && 'count' in e.require.per && e.require.per.count.race);
  if (set?.require && 'count' in set.require.per && set.require.per.count.race) {
    const race = set.require.per.count.race;
    const n = run.bag.filter((c) => coinDef(c.defId).race === race).length;
    return `Your bag: ${n} ${n === 1 ? coinLabel(race) : PLURAL[race]}`;
  }
  return undefined;
}

function coinLabel(race: Race): string {
  return { human: 'Human', orc: 'Orc', elf: 'Elf', neutral: 'Plain coin' }[race];
}

/** The bag's most common synergy tags (2+ coins), most common first: a quick read of the build. */
export function bagTagSummary(run: RunState, max = 5): { label: string; count: number }[] {
  const tally = new Map<string, number>();
  for (const c of run.bag) for (const t of synergyTags(coinDef(c.defId))) tally.set(t.label, (tally.get(t.label) ?? 0) + 1);
  return [...tally.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([label, count]) => ({ label, count }));
}
