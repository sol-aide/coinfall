import { chooseStarter, newRun, playRound } from '../../../engine';
import { applyEvent, finalState, fxFor, initial } from '../playback';

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

describe('playback effects', () => {
  it('derives cosmetic effects from events without touching the replay', () => {
    let numbers = 0;
    for (let i = 0; i < 40; i++) {
      const run = playRound(chooseStarter(newRun(`fx-${i}`), 'warhorn'));
      const lr = run.lastRound!;
      let s = initial(lr);
      let id = 1;
      const seen = new Set<number>();
      for (const [k, e] of lr.events.entries()) {
        const next = applyEvent(s, e);
        const out = fxFor(e, s, next, () => id++, 1, k > 0 ? lr.events[k - 1] : undefined);
        for (const f of out.fx) {
          expect(seen.has(f.id)).toBe(false);
          seen.add(f.id);
          if (f.kind === 'tear') expect(e.t).toBe('destroy');
          if (f.kind === 'num') numbers++;
        }
        if (e.t === 'destroy') expect(out.shake).toBeGreaterThan(0);
        s = next;
      }
      expect(s.total).toBe(lr.total);
    }
    expect(numbers).toBeGreaterThan(0);
  });
});
