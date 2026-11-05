// Synergy tags, derived from a coin's own effect data so they never drift from
// the rules. Pure TypeScript (no React Native) so it can be unit-tested.

import { CHARM_MAP, ENGRAVING_MAP, coinDef, runMods, type Action, type CharmDef, type CoinDef, type Count, type Race, type RunState, type Target } from '../../engine';

export type TagId = 'gold' | 'grows' | 'flips' | 'tails' | 'heads' | 'wreck' | 'mult' | 'set' | 'mixed' | 'counts' | 'boost' | 'echo' | 'tokens' | 'swaps';

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
    if (a.kind === 'token') has.add('tokens');
    if (e.trigger === 'onSwap') has.add('swaps');
    if ((a.kind === 'buff' || a.kind === 'mult') && a.target.scope !== 'self') has.add('boost');
    const all: Count[] = [...counts(a), ...(e.require ? [e.require.per] : [])];
    // Tails payoffs (not coins that merely turn tails coins over to heads).
    const turnsTails = a.kind === 'reflip' || a.kind === 'setHeads' || ((a.kind === 'flip' || a.kind === 'bump') && a.target.face === 'tails');
    if (turnsTails) has.add('heads');
    // Culling tails coins (Bonebreaker) works against a tails build, so it isn't a tails tag either.
    if (e.when === 'tails' || [...targets(a), ...all.flatMap((c) => ('count' in c ? [c.count] : []))].some((t) => t.face === 'tails' && !turnsTails && a.kind !== 'destroy')) has.add('tails');
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
  const order: TagId[] = ['set', 'mixed', 'counts', 'mult', 'echo', 'boost', 'flips', 'tails', 'heads', 'wreck', 'grows', 'gold', 'tokens', 'swaps'];
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
      case 'tokens':
        return 'Tokens';
      case 'swaps':
        return 'Swaps';
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

interface Roles {
  makesFlips: boolean;
  paysFlips: boolean;
  paysTails: boolean;
  destroys: boolean;
  paysWreck: boolean;
  races: Set<Race>;
  mixed: boolean;
  swaps: boolean;
}

/** What a coin does for others and what it wants from them, read from its effects. */
function roles(def: CoinDef): Roles {
  const r: Roles = { makesFlips: false, paysFlips: false, paysTails: false, destroys: false, paysWreck: false, races: new Set(), mixed: false, swaps: false };
  for (const e of def.effects) {
    const a = e.do;
    if ((a.kind === 'flip' && a.target.face !== 'tails') || a.kind === 'bump') r.makesFlips = true;
    if (e.trigger === 'onFlip') r.paysFlips = true;
    const tailsCount = counts(a).some((c) => 'count' in c && c.count.face === 'tails');
    if (e.when === 'tails' || tailsCount) r.paysTails = true;
    if (a.kind === 'destroy' && a.target.scope !== 'self') r.destroys = true;
    if (e.trigger === 'onDestroy') r.paysWreck = true;
    if (e.trigger === 'onSwap') r.swaps = true;
    const ts: Target[] = [...targets(a), ...counts(a).flatMap((c) => ('count' in c ? [c.count] : []))];
    if (e.require && 'count' in e.require.per) ts.push(e.require.per.count);
    for (const t of ts) if (t.race && t.race !== 'neutral') r.races.add(t.race);
    if ([...counts(a), ...(e.require ? [e.require.per] : [])].some((c) => 'races' in c)) r.mixed = true;
  }
  return r;
}

function pairs(a: CoinDef, ra: Roles, b: CoinDef, rb: Roles): boolean {
  if (ra.makesFlips && (rb.paysFlips || rb.paysTails)) return true;
  if (ra.destroys && rb.paysWreck) return true;
  if (ra.races.has(b.race)) return true;
  if (ra.mixed && b.race !== a.race && b.race !== 'neutral') return true;
  if (ra.swaps && rb.swaps) return true;
  return false;
}

/**
 * Names of coins in the bag that combo with `def` (either direction), most
 * common first, for offers: "Works with: Squire, Captain +2 more".
 */
export function synergyPartners(def: CoinDef, run: RunState): string[] {
  const ra = roles(def);
  const tally = new Map<string, number>();
  for (const c of run.bag) {
    if (c.defId === def.id) continue;
    const other = coinDef(c.defId);
    if (other.race === 'neutral' && !other.effects.length) continue;
    const rb = roles(other);
    if (pairs(def, ra, other, rb) || pairs(other, rb, def, ra)) tally.set(other.name, (tally.get(other.name) ?? 0) + 1);
  }
  return [...tally.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).map(([name]) => name);
}

/** "Works with: A, B +2 more", or undefined when nothing in the bag combos with the coin. */
export function partnerNote(def: CoinDef, run: RunState, max = 2): string | undefined {
  const names = synergyPartners(def, run);
  if (!names.length) return undefined;
  const more = names.length - max;
  return `Works with: ${names.slice(0, max).join(', ')}${more > 0 ? ` +${more} more` : ''}`;
}

/**
 * Tags for a Charm: its effects are read like a coin's, and its static
 * modifiers add the matching families (sets, ×2, heads, tails, gold…).
 */
export function charmTags(def: CharmDef): SynergyTag[] {
  const fromEffects = synergyTags({ id: def.id, name: def.name, race: def.race ?? 'neutral', rarity: def.rarity, value: 0, text: def.text, effects: def.effects ?? [] });
  const out = new Map(fromEffects.map((t) => [t.id, t]));
  const m = def.mods ?? {};
  const add = (id: TagId, label: string) => {
    if (!out.has(id)) out.set(id, { id, label });
  };
  if (m.setDiscount) add('set', 'Set bonuses');
  if (m.multBonus) add('mult', '×2');
  if (m.firstCoinHeads || m.headsBonus) add('heads', 'Heads control');
  if (m.tailsGold) add('tails', 'Tails');
  if (m.valueBonus || m.coinValueBonus) add('boost', 'Boosts others');
  const race = def.race ?? (Object.keys(m.valueBonus ?? {}).find((k) => k !== 'all') as Race | undefined);
  if (race && race !== 'neutral') add('counts', PLURAL[race]);
  const order: TagId[] = ['set', 'mixed', 'counts', 'mult', 'echo', 'boost', 'flips', 'tails', 'heads', 'wreck', 'grows', 'gold', 'tokens', 'swaps'];
  return order.filter((id) => out.has(id)).map((id) => out.get(id)!);
}

/**
 * Progress of the hand's gated combos (set bonuses, all-three-races), since
 * every coin in the hand lands on the table: "War Drummer: 2/3 Orcs". Counts a
 * Kinship coin as every race and applies Rally Horn's lower threshold.
 */
export function handComboNotes(run: RunState): { text: string; ready: boolean }[] {
  const hand = (run.hand ?? []).map((u) => run.bag.find((c) => c.uid === u)).filter((c): c is NonNullable<typeof c> => !!c);
  const racesOf = (c: (typeof hand)[number]): Race[] =>
    c.engraving && ENGRAVING_MAP[c.engraving]?.allRaces ? ['human', 'orc', 'elf'] : [coinDef(c.defId).race];
  const discount = runMods(run).setDiscount;
  const out: { text: string; ready: boolean }[] = [];
  const seen = new Set<string>();
  const sources: { name: string; effects: CoinDef['effects'] }[] = [
    ...hand.map((c) => ({ name: coinDef(c.defId).name, effects: coinDef(c.defId).effects })),
    ...run.charms.map((id) => ({ name: CHARM_MAP[id].name, effects: CHARM_MAP[id].effects ?? [] })),
  ];
  for (const src of sources) {
    const req = src.effects.find((e) => e.require)?.require;
    if (!req || seen.has(src.name)) continue;
    seen.add(src.name);
    if ('races' in req.per) {
      const n = new Set(hand.flatMap(racesOf).filter((r) => r !== 'neutral')).size;
      out.push({ text: `${src.name}: ${Math.min(n, 3)}/3 races`, ready: n >= req.min });
    } else if ('count' in req.per && req.per.count.race) {
      const race = req.per.count.race;
      const min = Math.max(1, req.min - discount);
      const n = hand.filter((c) => racesOf(c).includes(race)).length;
      const heads = req.per.count.face === 'heads' ? ' (if heads)' : '';
      out.push({ text: `${src.name}: ${Math.min(n, min)}/${min} ${PLURAL[race]}${heads}`, ready: n >= min });
    }
  }
  return out;
}
