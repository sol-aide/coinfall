import { useEffect, useRef, useState } from 'react';
import { coinDef, type Face, type GameEvent, type RoundResult, type StageName } from '../../engine';

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
  scored: number;
}

export interface Popup {
  id: number;
  x: number;
  y: number;
  text: string;
  kind: 'gold' | 'value' | 'loss' | 'info';
}

export interface PlaybackState {
  coins: Record<string, DisplayCoin>;
  order: string[];
  stage: StageName | null;
  caption: string;
  total: number;
  index: number;
  done: boolean;
}

/** Base durations in ms at speed 1. */
const DURATION: Record<GameEvent['t'], number> = {
  stage: 320,
  draw: 150,
  land: 430,
  trigger: 300,
  flip: 360,
  reflip: 360,
  move: 340,
  value: 260,
  gold: 320,
  destroy: 460,
  revive: 360,
  token: 300,
  score: 230,
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
      scored: 0,
    };
  }
  return { coins, order: result.table.map((c) => c.uid), stage: null, caption: '', total: 0, index: 0, done: false };
}

/** Pure reducer: applies one engine event to the display state. */
export function applyEvent(s: PlaybackState, e: GameEvent): PlaybackState {
  const coins = { ...s.coins };
  const upd = (uid: string, patch: Partial<DisplayCoin>) => {
    if (coins[uid]) coins[uid] = { ...coins[uid], ...patch };
  };
  let { caption, total, stage } = s;
  switch (e.t) {
    case 'stage':
      stage = e.stage;
      caption = e.stage;
      break;
    case 'land':
      upd(e.uid, { x: e.x, y: e.y, face: e.face, value: e.value, landed: true });
      caption = `${coinDef(coins[e.uid]?.defId ?? 'copper').name} lands ${e.face}${e.blessed ? ' (blessed)' : ''}`;
      break;
    case 'trigger':
      if (e.uid) upd(e.uid, { pulse: (coins[e.uid]?.pulse ?? 0) + 1 });
      caption = e.label;
      break;
    case 'flip':
    case 'reflip':
      upd(e.uid, { face: e.face });
      if (e.t === 'reflip') upd(e.uid, { pulse: (coins[e.uid]?.pulse ?? 0) + 1 });
      break;
    case 'move':
      upd(e.uid, { x: e.x, y: e.y });
      break;
    case 'value':
      upd(e.uid, { value: e.value });
      break;
    case 'gold':
      total += e.amount;
      caption = `${e.label}: +${e.amount} gold`;
      break;
    case 'destroy':
      upd(e.uid, { destroyed: true });
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
  return { ...s, coins, caption, total, stage, index: s.index + 1 };
}

export function finalState(result: RoundResult): PlaybackState {
  let s = initial(result);
  for (const e of result.events) s = applyEvent(s, e);
  return { ...s, done: true, caption: '' };
}

function popupFor(e: GameEvent, s: PlaybackState, id: number): Popup | null {
  const at = (uid?: string) => (uid && s.coins[uid] ? s.coins[uid] : null);
  switch (e.t) {
    case 'score': {
      const c = at(e.uid);
      return c ? { id, x: c.x, y: c.y, text: `+${e.amount}`, kind: 'gold' } : null;
    }
    case 'gold': {
      const c = at(e.uid);
      return { id, x: c?.x ?? 0.5, y: c?.y ?? 0.15, text: `+${e.amount}`, kind: 'gold' };
    }
    case 'value': {
      const c = at(e.uid);
      if (!c) return null;
      return { id, x: c.x, y: c.y, text: `${e.delta > 0 ? '+' : ''}${e.delta}${e.permanent ? ' ★' : ''}`, kind: e.delta >= 0 ? 'value' : 'loss' };
    }
    default:
      return null;
  }
}

/**
 * Replays a round's events with timing. `key` identifies the round; when it
 * changes, playback restarts. If `instant` is set, jumps straight to the end.
 */
export function usePlayback(result: RoundResult | undefined, key: string, speed: number, reduceMotion: boolean, instant: boolean) {
  const [state, setState] = useState<PlaybackState | null>(() => (result ? (instant ? finalState(result) : initial(result)) : null));
  const [popups, setPopups] = useState<Popup[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupId = useRef(1);
  const keyRef = useRef(key);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    keyRef.current = key;
    if (timer.current) clearTimeout(timer.current);
    setPopups([]);
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
      const p = popupFor(e, next, popupId.current++);
      if (p) {
        setPopups((list) => [...list.slice(-14), p]);
        const pid = p.id;
        setTimeout(() => setPopups((list) => list.filter((x) => x.id !== pid)), 1100);
      }
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
    setPopups([]);
    setState(finalState(result));
  };

  return { state, popups, skip };
}
