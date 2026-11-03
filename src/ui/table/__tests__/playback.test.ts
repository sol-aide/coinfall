import { chooseStarter, newRun, playRound } from '../../../engine';
import { finalState } from '../playback';

describe('playback reducer', () => {
  it('replaying a round reaches the engine total and final faces', () => {
    for (let i = 0; i < 40; i++) {
      const run = playRound(chooseStarter(newRun(`pb-${i}`), 'warhorn'));
      const lr = run.lastRound!;
      const s = finalState(lr);
      expect(s.total).toBe(lr.total);
      for (const c of lr.table) {
        expect(s.coins[c.uid].face).toBe(c.face);
        expect(s.coins[c.uid].destroyed).toBe(c.destroyed);
        expect(s.coins[c.uid].landed).toBe(true);
      }
    }
  });
});

describe('combo callouts', () => {
  it('call out set bonuses and all-three-races conditions, nothing else', () => {
    const { comboCallout } = require('../playback') as typeof import('../playback');
    expect(comboCallout({ t: 'trigger', uid: 'c1', label: 'War Drummer' }, 'wardrummer')).toBe('Orc set bonus!');
    expect(comboCallout({ t: 'trigger', uid: 'c1', label: 'Envoy' }, 'envoy')).toBe('All three races!');
    expect(comboCallout({ t: 'trigger', charmId: 'treaty', label: 'Treaty Seal' })).toBe('All three races!');
    expect(comboCallout({ t: 'trigger', uid: 'c1', label: 'Caravan Master' }, 'caravan')).toBeNull();
    expect(comboCallout({ t: 'trigger', uid: 'c1', label: 'Bard retriggers War Drummer' }, 'bard')).toBeNull();
  });
});

describe('round pacing', () => {
  it('leaves ordinary rounds alone and compresses long ones, within limits', () => {
    const { roundPace, ROUND_BUDGET } = require('../playback') as typeof import('../playback');
    const short = Array.from({ length: 10 }, () => ({ t: 'land' as const, uid: 'a', x: 0, y: 0, face: 'heads' as const, value: 1 }));
    expect(roundPace(short)).toBe(1);
    const long = Array.from({ length: 60 }, () => ({ t: 'land' as const, uid: 'a', x: 0, y: 0, face: 'heads' as const, value: 1 }));
    const p = roundPace(long);
    expect(p).toBeLessThan(1);
    expect(p).toBeGreaterThanOrEqual(0.45);
    expect(60 * 360 * p).toBeLessThanOrEqual(Math.max(ROUND_BUDGET, 60 * 360 * 0.45) + 1);
  });
});
