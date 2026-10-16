// Round resolution: draws, tosses, triggers and scoring. Produces an ordered
// event log the UI replays as animation.

import { charmDef } from './content/charms';
import { coinDef } from './content/coins';
import { engravingDef } from './content/engravings';
import { ABILITY_TRIGGERS, computeMods, hasTableAbility, headsChance, tableValue } from './mods';
import * as R from './rng';
import type {
  Action,
  BreakdownLine,
  CoinInstance,
  Count,
  Effect,
  Face,
  GameEvent,
  Mods,
  RoundResult,
  RunState,
  TableCoin,
  Target,
  Trigger,
} from './types';

export const TABLE_W = 1;
export const TABLE_H = 1.2;
export const COIN_R = 0.09;
export const BASE_RADIUS = 0.4;
export const BUMP_DIST = 0.22;
export const BASE_DRAW = 5;

type Stage = 'start' | 'toss' | 'adjacent' | 'end' | 'phase';

export interface Ctx {
  run: RunState;
  mods: Mods;
  table: TableCoin[];
  inst: Map<string, CoinInstance>;
  events: GameEvent[];
  breakdown: BreakdownLine[];
  total: number;
  bless: number;
  depth: number;
  flipDepth: number;
  destroyed: string[];
  stage: Stage;
  /** Phase-trigger mode: gold goes straight to the purse. */
  phaseMode: boolean;
}

export function radius(mods: Mods): number {
  return BASE_RADIUS * (1 + mods.radiusMult);
}

function dist(a: TableCoin, b: TableCoin): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const opposite = (f: Face): Face => (f === 'heads' ? 'tails' : 'heads');

export function valueOf(ctx: Ctx, tc: TableCoin): number {
  return tableValue(tc, ctx.inst.get(tc.uid)!, ctx.mods);
}

function nameOf(tc: TableCoin): string {
  return coinDef(tc.defId).name;
}

function active(ctx: Ctx): TableCoin[] {
  if (ctx.stage === 'start') return ctx.table.filter((c) => !c.destroyed);
  return ctx.table.filter((c) => c.landed && !c.destroyed);
}

export function resolveTargets(ctx: Ctx, self: TableCoin | undefined, t: Target, count = 1): TableCoin[] {
  if (t.scope === 'self') return self && !self.destroyed ? [self] : [];
  let pool = active(ctx);
  const includeSelf = t.includeSelf ?? false;
  if (self && !includeSelf) pool = pool.filter((c) => c !== self);
  if (t.race) pool = pool.filter((c) => coinDef(c.defId).race === t.race);
  if (t.notRace) pool = pool.filter((c) => coinDef(c.defId).race !== t.notRace);
  if (t.face) pool = pool.filter((c) => c.face === t.face);
  if (t.hasAbility) pool = pool.filter((c) => hasTableAbility(coinDef(c.defId)));

  if (t.scope === 'adjacent') {
    if (!self) return [];
    const r = radius(ctx.mods);
    pool = pool.filter((c) => c !== self && dist(self, c) <= r);
  } else if (t.scope === 'nearest' || t.scope === 'farthest') {
    if (!self) return [];
    pool = pool.filter((c) => c !== self);
    if (pool.length === 0) return [];
    const sorted = pool.slice().sort((a, b) => dist(self, a) - dist(self, b) || a.order - b.order);
    return [t.scope === 'nearest' ? sorted[0] : sorted[sorted.length - 1]];
  }

  const pick = t.pick ?? 'all';
  if (pick === 'all' || pool.length === 0) return pool;
  if (pick === 'random') {
    const out: TableCoin[] = [];
    const rest = pool.slice();
    for (let i = 0; i < count && rest.length; i++) out.push(rest.splice(R.int(ctx.run, rest.length), 1)[0]);
    return out;
  }
  const sorted = pool
    .slice()
    .sort((a, b) => (pick === 'highest' ? valueOf(ctx, b) - valueOf(ctx, a) : valueOf(ctx, a) - valueOf(ctx, b)) || a.order - b.order);
  return sorted.slice(0, count);
}

function countOf(ctx: Ctx, self: TableCoin | undefined, per: Count): number {
  if ('bagRace' in per) return ctx.run.bag.filter((c) => coinDef(c.defId).race === per.bagRace).length;
  return resolveTargets(ctx, self, per.count).length;
}

function addGold(ctx: Ctx, amount: number, label: string, uid?: string, charmId?: string) {
  if (amount === 0) return;
  ctx.total += amount;
  if (ctx.phaseMode) ctx.run.gold += amount;
  ctx.events.push({ t: 'gold', amount, uid, charmId, label });
  ctx.breakdown.push({ label, amount, uid, kind: charmId ? 'charm' : 'ability' });
}

function changeValue(ctx: Ctx, tc: TableCoin, delta: number, permanent: boolean) {
  if (delta === 0) return;
  const inst = ctx.inst.get(tc.uid)!;
  if (permanent) inst.bonus += delta;
  else tc.temp += delta;
  ctx.events.push({ t: 'value', uid: tc.uid, delta, permanent, value: valueOf(ctx, tc) });
}

export function setFace(ctx: Ctx, tc: TableCoin, face: Face) {
  if (tc.face === face || tc.destroyed) return;
  tc.face = face;
  ctx.events.push({ t: 'flip', uid: tc.uid, face });
  if (ctx.flipDepth > 6) return;
  ctx.flipDepth++;
  fireOn(ctx, 'onFlip', tc);
  ctx.flipDepth--;
}

export function destroyCoin(ctx: Ctx, tc: TableCoin, by?: TableCoin) {
  if (tc.destroyed) return;
  const inst = ctx.inst.get(tc.uid)!;
  if (inst.engraving && engravingDef(inst.engraving).sturdy) {
    ctx.events.push({ t: 'trigger', uid: tc.uid, label: `${nameOf(tc)} is Ironclad` });
    return;
  }
  tc.destroyed = true;
  ctx.destroyed.push(tc.uid);
  ctx.events.push({ t: 'destroy', uid: tc.uid, by: by?.uid });
  fireOn(ctx, 'onDestroy', tc);
}

/** Fires a reactive trigger (onFlip / onDestroy): the subject's own effects, other coins' `any` effects, then Charms. */
function fireOn(ctx: Ctx, trigger: 'onFlip' | 'onDestroy', subject: TableCoin) {
  runCoinTrigger(ctx, subject, trigger, false);
  for (const other of ctx.table) {
    if (other === subject || other.destroyed || !other.landed) continue;
    runCoinTrigger(ctx, other, trigger, true);
  }
  runCharmTrigger(ctx, trigger, subject);
}

/** All effects a coin has for a trigger: its own (twice with Echo) plus its engraving's. */
function coinEffects(inst: CoinInstance, trigger: Trigger): { effects: Effect[]; fromDef: boolean }[] {
  const def = coinDef(inst.defId);
  const eng = inst.engraving ? engravingDef(inst.engraving) : undefined;
  const own = def.effects.filter((e) => e.trigger === trigger);
  const out = [{ effects: own, fromDef: true }];
  if (eng?.echo && own.length) out.push({ effects: own, fromDef: true });
  const engEffects = (eng?.effects ?? []).filter((e) => e.trigger === trigger);
  if (engEffects.length) out.push({ effects: engEffects, fromDef: false });
  return out;
}

export function runCoinTrigger(ctx: Ctx, tc: TableCoin, trigger: Trigger, anyOnly = false) {
  const inst = ctx.inst.get(tc.uid);
  if (!inst) return;
  for (const group of coinEffects(inst, trigger)) {
    for (const e of group.effects) {
      if (anyOnly !== !!e.any) continue;
      // A destroyed coin may still resolve its own onDestroy effects.
      if (tc.destroyed && !(trigger === 'onDestroy' && !anyOnly)) continue;
      execute(ctx, e, tc, tc.level, nameOf(tc), tc);
    }
  }
}

export function runCharmTrigger(ctx: Ctx, trigger: Trigger, subject?: TableCoin) {
  for (const id of ctx.run.charms) {
    const c = charmDef(id);
    for (const e of c.effects ?? []) {
      if (e.trigger !== trigger) continue;
      execute(ctx, e, undefined, 1, c.name, subject, id);
    }
  }
}

function scaled(e: Effect, n: number, level: number): number {
  return e.noScale ? n : n * level;
}

export function execute(
  ctx: Ctx,
  e: Effect,
  self: TableCoin | undefined,
  level: number,
  label: string,
  subject?: TableCoin,
  charmId?: string,
) {
  const s = subject ?? self;
  if (e.when && (!s || s.face !== e.when)) return;
  if (e.chance !== undefined && !R.chance(ctx.run, e.chance)) return;
  const a: Action = e.do;
  const uid = self?.uid;
  const trig = () => ctx.events.push({ t: 'trigger', uid, charmId, label });

  switch (a.kind) {
    case 'gold': {
      const n = scaled(e, a.amount, level) * (a.per ? countOf(ctx, self, a.per) : 1);
      if (n > 0) {
        trig();
        addGold(ctx, n, label, uid, charmId);
      }
      return;
    }
    case 'interest': {
      const n = Math.min(a.max, Math.floor(ctx.run.gold / a.per));
      if (n > 0) {
        trig();
        addGold(ctx, n, label, uid, charmId);
      }
      return;
    }
    case 'buff': {
      const n = scaled(e, a.amount, level) * (a.per ? countOf(ctx, self, a.per) : 1);
      if (n === 0) return;
      const targets = resolveTargets(ctx, self, a.target);
      if (!targets.length) return;
      trig();
      for (const t of targets) changeValue(ctx, t, n, !!a.permanent);
      return;
    }
    case 'mult': {
      const targets = resolveTargets(ctx, self, a.target);
      if (!targets.length) return;
      trig();
      for (const t of targets) {
        const before = valueOf(ctx, t);
        t.mult *= a.factor;
        ctx.events.push({ t: 'value', uid: t.uid, delta: valueOf(ctx, t) - before, permanent: false, value: valueOf(ctx, t) });
      }
      return;
    }
    case 'flip': {
      const targets = resolveTargets(ctx, self, a.target);
      if (!targets.length) return;
      trig();
      for (const t of targets) setFace(ctx, t, opposite(t.face));
      return;
    }
    case 'setHeads': {
      const targets = resolveTargets(ctx, self, a.target).filter((t) => t.face === 'tails');
      if (!targets.length) return;
      trig();
      for (const t of targets) setFace(ctx, t, 'heads');
      return;
    }
    case 'reflip': {
      const n = a.amount === undefined ? Infinity : scaled(e, a.amount, level);
      const targets = resolveTargets(ctx, self, a.target, n === Infinity ? 99 : n);
      const chosen = a.target.pick ? targets : targets.slice(0, n);
      if (!chosen.length) return;
      trig();
      for (const t of chosen) {
        const face: Face = R.chance(ctx.run, headsChance(ctx.inst.get(t.uid)!, ctx.mods)) ? 'heads' : 'tails';
        if (face === t.face) ctx.events.push({ t: 'reflip', uid: t.uid, face });
        else setFace(ctx, t, face);
      }
      return;
    }
    case 'destroy': {
      const targets = resolveTargets(ctx, self, a.target);
      if (!targets.length) return;
      trig();
      for (const t of targets) {
        const gained = valueOf(ctx, t);
        const wasDestroyed = t.destroyed;
        destroyCoin(ctx, t, self);
        if (a.absorb && self && !self.destroyed && !wasDestroyed && t.destroyed && gained > 0) {
          changeValue(ctx, self, gained, true);
        }
      }
      return;
    }
    case 'bump': {
      const targets = resolveTargets(ctx, self, a.target);
      if (!targets.length || !self) return;
      trig();
      for (const t of targets) {
        let dx = t.x - self.x;
        let dy = t.y - self.y;
        let d = Math.hypot(dx, dy);
        if (d < 1e-6) {
          const ang = R.next(ctx.run) * Math.PI * 2;
          dx = Math.cos(ang);
          dy = Math.sin(ang);
          d = 1;
        }
        t.x = clamp(t.x + (dx / d) * BUMP_DIST, COIN_R, TABLE_W - COIN_R);
        t.y = clamp(t.y + (dy / d) * BUMP_DIST, COIN_R, TABLE_H - COIN_R);
        ctx.events.push({ t: 'move', uid: t.uid, x: t.x, y: t.y, by: self.uid });
        setFace(ctx, t, opposite(t.face));
      }
      return;
    }
    case 'retrigger':
    case 'copy': {
      if (ctx.depth > 0 || !self) return;
      const [target] = resolveTargets(ctx, self, a.target);
      if (!target) return;
      const tInst = ctx.inst.get(target.uid)!;
      const tDef = coinDef(target.defId);
      ctx.events.push({
        t: 'trigger',
        uid,
        label: a.kind === 'retrigger' ? `${label} retriggers ${tDef.name}` : `${label} copies ${tDef.name}`,
      });
      ctx.depth++;
      const actor = a.kind === 'retrigger' ? target : self;
      const lvl = a.kind === 'retrigger' ? tInst.level : level;
      for (const te of tDef.effects) {
        if (!(ABILITY_TRIGGERS as readonly string[]).includes(te.trigger)) continue;
        if (te.do.kind === 'streak' || te.do.kind === 'retrigger' || te.do.kind === 'copy') continue;
        execute(ctx, te, actor, lvl, a.kind === 'retrigger' ? tDef.name : `${label} (as ${tDef.name})`);
      }
      ctx.depth--;
      return;
    }
    case 'streak': {
      if (!self) return;
      const inst = ctx.inst.get(self.uid)!;
      if (self.face === 'heads') {
        inst.streak += 1;
        const gain = scaled(e, a.amount, level);
        inst.streakBonus += gain;
        trig();
        changeValue(ctx, self, gain, true);
      } else if (inst.streak > 0 || inst.streakBonus > 0) {
        const lost = inst.streakBonus;
        inst.streak = 0;
        inst.streakBonus = 0;
        trig();
        changeValue(ctx, self, -lost, true);
      }
      return;
    }
    case 'blessNext': {
      trig();
      ctx.bless += scaled(e, a.amount, level);
      return;
    }
    case 'token': {
      const n = scaled(e, a.amount, level);
      trig();
      if (a.token === 'melt') ctx.run.meltTokens += n;
      else ctx.run.rerollTokens += n;
      ctx.events.push({ t: 'token', token: a.token, amount: n, uid, charmId });
      return;
    }
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function newCtx(run: RunState, stage: Stage, phaseMode = false): Ctx {
  return {
    run,
    mods: computeMods(run.charms),
    table: [],
    inst: new Map(run.bag.map((c) => [c.uid, c])),
    events: [],
    breakdown: [],
    total: 0,
    bless: 0,
    depth: 0,
    flipDepth: 0,
    destroyed: [],
    stage,
    phaseMode,
  };
}

function landingSpot(ctx: Ctx): { x: number; y: number } {
  const placed = ctx.table.filter((c) => c.landed && !c.destroyed);
  let best = { x: 0.5, y: 0.6, d: -1 };
  for (let i = 0; i < 24; i++) {
    const x = COIN_R + R.next(ctx.run) * (TABLE_W - 2 * COIN_R);
    const y = COIN_R + R.next(ctx.run) * (TABLE_H - 2 * COIN_R);
    const d = placed.length ? Math.min(...placed.map((p) => Math.hypot(p.x - x, p.y - y))) : 1;
    if (d >= COIN_R * 2.15) return { x, y };
    if (d > best.d) best = { x, y, d };
  }
  return { x: best.x, y: best.y };
}

/** Removes destroyed coins from the bag (Second Wind brings a coin back once). */
function settleDestroyed(ctx: Ctx) {
  for (const uid of ctx.destroyed) {
    const inst = ctx.inst.get(uid);
    if (!inst) continue;
    ctx.run.stats.coinsDestroyed++;
    if (inst.engraving && engravingDef(inst.engraving).secondWind) {
      inst.engraving = undefined;
      ctx.events.push({ t: 'revive', uid });
      continue;
    }
    ctx.run.bag = ctx.run.bag.filter((c) => c.uid !== uid);
  }
}

/** Plays one full round on `run` (mutated) and returns the animated result. */
export function resolveRound(run: RunState): RoundResult {
  const ctx = newCtx(run, 'start');
  const drawN = Math.min(run.bag.length, BASE_DRAW + ctx.mods.drawBonus);
  const drawn = R.shuffle(run, run.bag).slice(0, drawN);
  ctx.table = drawn.map((inst, i) => ({
    uid: inst.uid,
    defId: inst.defId,
    level: inst.level,
    x: 0.5,
    y: TABLE_H,
    face: 'heads' as Face,
    landed: false,
    destroyed: false,
    temp: 0,
    mult: 1,
    order: i,
  }));

  ctx.events.push({ t: 'stage', stage: 'Round start' });
  ctx.events.push({ t: 'draw', uids: ctx.table.map((c) => c.uid) });
  for (const tc of ctx.table) runCoinTrigger(ctx, tc, 'onRoundStart');
  runCharmTrigger(ctx, 'onRoundStart');

  ctx.stage = 'toss';
  ctx.events.push({ t: 'stage', stage: 'Toss' });
  ctx.table.forEach((tc, i) => {
    if (tc.destroyed) return;
    const spot = landingSpot(ctx);
    tc.x = spot.x;
    tc.y = spot.y;
    let blessed = false;
    if (i === 0 && ctx.mods.firstCoinHeads) blessed = true;
    else if (ctx.bless > 0) {
      ctx.bless--;
      blessed = true;
    }
    const p = headsChance(ctx.inst.get(tc.uid)!, ctx.mods);
    tc.face = blessed || R.chance(run, p) ? 'heads' : 'tails';
    tc.landed = true;
    ctx.events.push({ t: 'land', uid: tc.uid, x: tc.x, y: tc.y, face: tc.face, blessed: blessed && p < 1 });
    runCoinTrigger(ctx, tc, 'onLand');
  });

  ctx.stage = 'adjacent';
  ctx.events.push({ t: 'stage', stage: 'Adjacency' });
  for (const tc of ctx.table) if (!tc.destroyed) runCoinTrigger(ctx, tc, 'onAdjacent');

  ctx.stage = 'end';
  ctx.events.push({ t: 'stage', stage: 'Round end' });
  for (const tc of ctx.table) if (!tc.destroyed) runCoinTrigger(ctx, tc, 'onRoundEnd');
  runCharmTrigger(ctx, 'onRoundEnd');

  ctx.events.push({ t: 'stage', stage: 'Scoring' });
  const coinLines: BreakdownLine[] = [];
  for (const tc of ctx.table) {
    if (tc.destroyed) continue;
    const inst = ctx.inst.get(tc.uid)!;
    const v = valueOf(ctx, tc);
    let amount = 0;
    if (tc.face === 'heads') amount = v;
    else {
      const frac = inst.engraving ? (engravingDef(inst.engraving).tailsFraction ?? 0) : 0;
      amount = Math.floor(v * frac) + ctx.mods.tailsGold;
    }
    if (amount > 0) {
      ctx.events.push({ t: 'score', uid: tc.uid, amount });
      coinLines.push({ label: `${nameOf(tc)} (${tc.face})`, amount, uid: tc.uid, kind: 'coin' });
      ctx.total += amount;
    }
  }
  const breakdown = [...coinLines, ...ctx.breakdown];

  settleDestroyed(ctx);
  run.gold += ctx.total;
  run.stats.roundsPlayed++;
  run.stats.goldEarned += ctx.total;
  run.stats.bestRound = Math.max(run.stats.bestRound, ctx.total);

  return {
    round: run.round,
    phase: run.phase,
    events: ctx.events,
    breakdown,
    total: ctx.total,
    table: ctx.table,
    destroyed: ctx.destroyed,
  };
}

/** Resolves onPhaseStart / onPhaseEnd for every coin in the bag and every Charm. */
export function resolvePhaseTrigger(run: RunState, trigger: 'onPhaseStart' | 'onPhaseEnd'): { events: GameEvent[]; gold: number } {
  const ctx = newCtx(run, 'phase', true);
  // In phase mode the "table" is the whole bag.
  ctx.table = run.bag.map((inst, i) => ({
    uid: inst.uid,
    defId: inst.defId,
    level: inst.level,
    x: 0,
    y: 0,
    face: 'heads' as Face,
    landed: true,
    destroyed: false,
    temp: 0,
    mult: 1,
    order: i,
  }));
  for (const tc of ctx.table) runCoinTrigger(ctx, tc, trigger);
  runCharmTrigger(ctx, trigger);
  return { events: ctx.events, gold: ctx.total };
}
