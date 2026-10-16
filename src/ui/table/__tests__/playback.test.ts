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
