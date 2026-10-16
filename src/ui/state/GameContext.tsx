import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { ActionError, SAVE_VERSION, newRun, type RunState } from '../../engine';

const RUN_KEY = 'coinfall.run.v1';
const SETTINGS_KEY = 'coinfall.settings.v1';
const RECORDS_KEY = 'coinfall.records.v1';

export type Speed = 1 | 2 | 4;

export interface Settings {
  speed: Speed;
  tutorialSeen: boolean;
  haptics: boolean;
}

export interface Records {
  runs: number;
  wins: number;
  bestPhase: number;
}

const DEFAULT_SETTINGS: Settings = { speed: 1, tutorialSeen: false, haptics: true };
const DEFAULT_RECORDS: Records = { runs: 0, wins: 0, bestPhase: 0 };

interface GameApi {
  loaded: boolean;
  run: RunState | null;
  /** Bumps whenever a run is (re)loaded from storage so screens can skip replaying animations. */
  restoredAt: number;
  settings: Settings;
  records: Records;
  reduceMotion: boolean;
  act: (fn: (run: RunState) => RunState) => boolean;
  startNewRun: () => void;
  abandonRun: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  deleteAllData: () => void;
}

const Ctx = createContext<GameApi | null>(null);

export function useGame(): GameApi {
  const g = useContext(Ctx);
  if (!g) throw new Error('useGame outside provider');
  return g;
}

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [run, setRun] = useState<RunState | null>(null);
  const [restoredAt, setRestoredAt] = useState(0);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [records, setRecords] = useState<Records>(DEFAULT_RECORDS);
  const [reduceMotion, setReduceMotion] = useState(false);
  const runRef = useRef<RunState | null>(null);
  runRef.current = run;

  useEffect(() => {
    (async () => {
      const [r, s, rec] = await Promise.all([
        readJson<RunState>(RUN_KEY),
        readJson<Settings>(SETTINGS_KEY),
        readJson<Records>(RECORDS_KEY),
      ]);
      if (r && r.version === SAVE_VERSION) {
        setRun(r);
        setRestoredAt(Date.now());
      }
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...s });
      if (rec) setRecords({ ...DEFAULT_RECORDS, ...rec });
      setLoaded(true);
    })();
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const saveRun = useCallback((next: RunState | null) => {
    if (next) writeJson(RUN_KEY, next);
    else AsyncStorage.removeItem(RUN_KEY).catch(() => {});
  }, []);

  const recordEnd = useCallback((next: RunState) => {
    setRecords((prev) => {
      const rec: Records = {
        runs: prev.runs + 1,
        wins: prev.wins + (next.screen === 'won' ? 1 : 0),
        bestPhase: Math.max(prev.bestPhase, next.phase),
      };
      writeJson(RECORDS_KEY, rec);
      return rec;
    });
  }, []);

  const act = useCallback(
    (fn: (r: RunState) => RunState) => {
      const cur = runRef.current;
      if (!cur) return false;
      try {
        const next = fn(cur);
        runRef.current = next;
        setRun(next);
        saveRun(next);
        const ended = (s: RunState) => s.screen === 'won' || s.screen === 'lost';
        if (ended(next) && !ended(cur)) recordEnd(next);
        return true;
      } catch (e) {
        if (e instanceof ActionError) return false;
        throw e;
      }
    },
    [saveRun, recordEnd],
  );

  const startNewRun = useCallback(() => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    const r = newRun(seed);
    runRef.current = r;
    setRun(r);
    saveRun(r);
  }, [saveRun]);

  const abandonRun = useCallback(() => {
    runRef.current = null;
    setRun(null);
    saveRun(null);
  }, [saveRun]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const s = { ...prev, ...patch };
      writeJson(SETTINGS_KEY, s);
      return s;
    });
  }, []);

  const deleteAllData = useCallback(() => {
    runRef.current = null;
    setRun(null);
    setSettings(DEFAULT_SETTINGS);
    setRecords(DEFAULT_RECORDS);
    AsyncStorage.multiRemove([RUN_KEY, SETTINGS_KEY, RECORDS_KEY]).catch(() => {});
  }, []);

  const api = useMemo<GameApi>(
    () => ({ loaded, run, restoredAt, settings, records, reduceMotion, act, startNewRun, abandonRun, updateSettings, deleteAllData }),
    [loaded, run, restoredAt, settings, records, reduceMotion, act, startNewRun, abandonRun, updateSettings, deleteAllData],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
