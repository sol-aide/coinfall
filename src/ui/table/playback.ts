import { useEffect, useRef, useState } from 'react';
import { colors, raceColors } from '../theme';
import type { Fx } from './fx';

/** How long a cosmetic effect stays mounted (ms). */
export const FX_LIFETIME = 1400;
import { abilityText, charmDef, coinDef, type Face, type GameEvent, type RoundResult, type StageName } from '../../engine';

export interface DisplayCoin {
  uid: string;
  defId: string;
  level: number;
  x: number;
  y: number;
  face: Face;
  value: number;
  landed: boolean;
  destroyed: boolean;
  /** Increments each time the coin's ability fires (drives a pulse). */
  pulse: number;
  /** Increments when the coin is hit (bumped or destroyed): drives a white flash. */
  flash: number;
  scored: number;
}

export interface PlaybackState {
  coins: Record<string, DisplayCoin>;
  order: string[];
  stage: StageName | null;
  caption: string;
  /** Rules text of the ability currently resolving, if any. */
  detail: string;
  total: number;
  index: number;
  done: boolean;
}

const STAGE_HINT: Record<StageName, string> = {
  'Round start': 'Drawing coins from your bag',
  Toss: 'Coins land heads or tails',
  Adjacency: 'Neighbouring coins interact',
  'Round end': 'End-of-round abilities',
  Scoring: 'Heads coins pay their value',
};

/** Base durations in ms at speed 1. */
const DURATION: Record<GameEvent['t'], number> = {
  stage: 280,
  draw: 120,
  land: 360,
  trigger: 280,
  flip: 340,
  reflip: 340,
  move: 460,
  value: 240,
  gold: 300,
  destroy: 640,
  revive: 460,
  token: 280,
  score: 200,
};

export function eventDuration(e: GameEvent, speed: number, reduceMotion: boolean): number {
  const base = DURATION[e.t] * (reduceMotion ? 0.7 : 1);
  return Math.max(30, base / speed);
}

function initial(result: RoundResult): PlaybackState {
  const coins: Record<string, DisplayCoin> = {};
  for (const c of result.table) {
    coins[c.uid] = {
      uid: c.uid,
      defId: c.defId,
      level: c.level,
      x: 0.5,
      y: 1.2,
      face: 'heads',
      value: 0,
      landed: false,
      destroyed: false,
      pulse: 0,
      flash: 0,
      scored: 0,
    };
  }
  return { coins, order: result.table.map((c) => c.uid), stage: null, caption: '', detail: '', total: 0, index: 0, done: false };
}

/** Pure reducer: applies one engine event to the display state. */
export function applyEvent(s: PlaybackState, e: GameEvent): PlaybackState {
  const coins = { ...s.coins };
  const upd = (uid: string, patch: Partial<DisplayCoin>) => {
    if (coins[uid]) coins[uid] = { ...coins[uid], ...patch };
  };
  let { caption, total, stage } = s;
  let detail = '';
  switch (e.t) {
    case 'stage':
      stage = e.stage;
      caption = STAGE_HINT[e.stage];
      break;
    case 'land':
      upd(e.uid, { x: e.x, y: e.y, face: e.face, value: e.value, landed: true });
      caption = `${coinDef(coins[e.uid]?.defId ?? 'copper').name} lands ${e.face}${e.blessed ? ' (blessed)' : ''}`;
      break;
    case 'trigger':
      if (e.uid) upd(e.uid, { pulse: (coins[e.uid]?.pulse ?? 0) + 1 });
      caption = e.label;
      if (e.uid && coins[e.uid]) detail = abilityText(coinDef(coins[e.uid].defId), coins[e.uid].level);
      else if (e.charmId) detail = charmDef(e.charmId).text;
      break;
    case 'flip':
    case 'reflip':
      upd(e.uid, { face: e.face });
      if (e.t === 'reflip') upd(e.uid, { pulse: (coins[e.uid]?.pulse ?? 0) + 1 });
      detail = s.detail;
      break;
    case 'move':
      upd(e.uid, { x: e.x, y: e.y, flash: (coins[e.uid]?.flash ?? 0) + 1 });
      detail = s.detail;
      break;
    case 'value':
      upd(e.uid, { value: e.value });
      detail = s.detail;
      break;
    case 'gold':
      total += e.amount;
      caption = `${e.label}: +${e.amount} gold`;
      detail = s.detail;
      break;
    case 'destroy':
      upd(e.uid, { destroyed: true, flash: (coins[e.uid]?.flash ?? 0) + 1 });
      caption = `${coinDef(coins[e.uid]?.defId ?? 'copper').name} is destroyed`;
      break;
    case 'revive':
      caption = `${coinDef(coins[e.uid]?.defId ?? 'copper').name} gets a Second Wind`;
      break;
    case 'token':
      caption = `+${e.amount} ${e.token === 'melt' ? 'Melt' : 'Reroll'} token`;
      break;
    case 'score':
      total += e.amount;
      upd(e.uid, { scored: e.amount });
      break;
    case 'draw':
      break;
  }
  return { ...s, coins, caption, detail, total, stage, index: s.index + 1 };
}

export function finalState(result: RoundResult): PlaybackState {
  let s = initial(result);
  for (const e of result.events) s = applyEvent(s, e);
  return { ...s, done: true, caption: '', detail: '' };
}

/** Cosmetic effects for one event. `prev` is the state before the event, `next` after. */
export function fxFor(e: GameEvent, prev: PlaybackState, next: PlaybackState, nextId: () => number, speed: number): { fx: Fx[]; shake: number } {
  const at = (st: PlaybackState, uid?: string) => (uid && st.coins[uid] ? st.coins[uid] : null);
  const rim = (uid?: string) => {
    const c = at(next, uid) ?? at(prev, uid);
    return c ? raceColors[coinDef(c.defId).race].main : colors.gold;
  };
  const none = { fx: [] as Fx[], shake: 0 };
  switch (e.t) {
    case 'score': {
      const c = at(next, e.uid);
      return c ? { fx: [{ id: nextId(), kind: 'number', x: c.x, y: c.y, text: `+${e.amount}`, tone: 'gold', big: e.amount >= 10 }], shake: 0 } : none;
    }
    case 'gold': {
      const c = at(next, e.uid);
      return { fx: [{ id: nextId(), kind: 'number', x: c?.x ?? 0.42, y: c?.y ?? 0.22, text: `+${e.amount}`, tone: 'gold', big: e.amount >= 10 }], shake: 0 };
    }
    case 'value': {
      const c = at(next, e.uid);
      if (!c) return none;
      return {
        fx: [{ id: nextId(), kind: 'number', x: c.x, y: c.y, text: `${e.delta > 0 ? '+' : ''}${e.delta}`, tone: e.delta >= 0 ? 'value' : 'loss' }],
        shake: 0,
      };
    }
    case 'land':
      // The coin drops into a cartoon smoke poof as it lands.
      return { fx: [{ id: nextId(), kind: 'poof', x: e.x, y: e.y, delay: Math.max(10, 520 / speed), dust: true }], shake: 0 };
    case 'trigger': {
      const c = at(next, e.uid);
      return c ? { fx: [{ id: nextId(), kind: 'ring', x: c.x, y: c.y, color: '#FFF3C4' }], shake: 0 } : none;
    }
    case 'move': {
      const target = at(prev, e.uid);
      return target ? { fx: [{ id: nextId(), kind: 'hit', x: target.x, y: target.y }], shake: 0 } : none;
    }
    case 'destroy': {
      const c = at(prev, e.uid);
      if (!c) return none;
      return {
        fx: [
          { id: nextId(), kind: 'hit', x: c.x, y: c.y },
          { id: nextId(), kind: 'shards', x: c.x, y: c.y, color: rim(e.uid) },
          { id: nextId(), kind: 'poof', x: c.x, y: c.y, delay: Math.max(10, 120 / speed), big: true },
        ],
        shake: 2,
      };
    }
    case 'revive': {
      const c = at(prev, e.uid);
      return c ? { fx: [{ id: nextId(), kind: 'poof', x: c.x, y: c.y, delay: 0 }], shake: 0 } : none;
    }
    default:
      return none;
  }
}

/**
 * Replays a round's events with timing. `key` identifies the round; when it
 * changes, playback restarts. If `instant` is set, jumps straight to the end.
 */
export function usePlayback(result: RoundResult | undefined, key: string, speed: number, reduceMotion: boolean, instant: boolean) {
  const [state, setState] = useState<PlaybackState | null>(() => (result ? (instant ? finalState(result) : initial(result)) : null));
  const [fx, setFx] = useState<Fx[]>([]);
  const [shake, setShake] = useState({ n: 0, power: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fxId = useRef(1);
  const keyRef = useRef(key);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    keyRef.current = key;
    if (timer.current) clearTimeout(timer.current);
    setFx([]);
    if (!result) {
      setState(null);
      return;
    }
    if (instant) {
      setState(finalState(result));
      return;
    }
    let s = initial(result);
    setState(s);
    const myKey = key;
    const step = () => {
      if (keyRef.current !== myKey) return;
      if (s.index >= result.events.length) {
        s = { ...s, done: true, caption: '' };
        setState(s);
        return;
      }
      const e = result.events[s.index];
      const next = applyEvent(s, e);
      const out = fxFor(e, s, next, () => fxId.current++, speedRef.current);
      if (out.fx.length) {
        setFx((list) => [...list.slice(-24), ...out.fx]);
        const ids = new Set(out.fx.map((f) => f.id));
        setTimeout(() => setFx((list) => list.filter((x) => !ids.has(x.id))), FX_LIFETIME);
      }
      if (out.shake && !reduceMotion) setShake((v) => ({ n: v.n + 1, power: out.shake }));
      s = next;
      setState(s);
      timer.current = setTimeout(step, eventDuration(e, speedRef.current, reduceMotion));
    };
    timer.current = setTimeout(step, 120);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const skip = () => {
    if (!result) return;
    keyRef.current = `${key}-skipped`;
    if (timer.current) clearTimeout(timer.current);
    setFx([]);
    setState(finalState(result));
  };

  return { state, fx, shake, skip };
}
