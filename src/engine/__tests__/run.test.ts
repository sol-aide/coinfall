import {
  DUES,
  PHASES,
  applyFusion,
  coinPrice,
  charmPrice,
  duesFor,
  newInstance,
  rerollCost,
  rollShop,
} from '../economy';
import { computeMods } from '../mods';
import * as R from '../rng';
import {
  ActionError,
  buyItem,
  canPayDues,
  chooseReward,
  chooseStarter,
  currentDues,
  leaveShop,
  meltCoin,
  newRun,
  payDues,
  playRound,
  rerollRewards,
  rerollShop,
  shopRerollCost,
} from '../run';
import { simulateRun } from '../sim';
import type { RunState } from '../types';
import { makeRun } from './helpers';

describe('rng', () => {
  it('is reproducible and in range', () => {
    const a = { rng: 123 };
    const b = { rng: 123 };
    for (let i = 0; i < 100; i++) {
      const x = R.next(a);
      expect(x).toBe(R.next(b));
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
    expect(R.seedFrom('abc')).toBe(R.seedFrom('abc'));
    expect(R.seedFrom('abc')).not.toBe(R.seedFrom('abd'));
  });
});

describe('new run', () => {
  it('starts with 5 Copper plus one coin of each race', () => {
    const run = newRun(1);
    expect(run.screen).toBe('pickCharm');
    expect(run.bag.map((c) => c.defId).sort()).toEqual(['archer', 'copper', 'copper', 'copper', 'copper', 'copper', 'grunt', 'squire']);
    expect(run.starterChoices).toEqual(['banner', 'warhorn', 'silverleaf']);
  });

  it('actions never mutate their input', () => {
    const run = newRun(5);
    const snapshot = JSON.stringify(run);
    const next = chooseStarter(run, 'banner');
    expect(JSON.stringify(run)).toBe(snapshot);
    expect(next.charms).toEqual(['banner']);
    const played = playRound(next);
    expect(next.screen).toBe('ready');
    expect(played.screen).toBe('reward');
  });

  it('rejects actions on the wrong screen', () => {
    const run = newRun(5);
    expect(() => playRound(run)).toThrow(ActionError);
    expect(() => chooseStarter(run, 'clover')).toThrow(ActionError);
  });
});

describe('rewards', () => {
  it('offers 3 distinct non-Copper coins (4 with Collector), skip gives gold', () => {
    let run = chooseStarter(newRun(9), 'banner');
    run = playRound(run);
    expect(run.rewardChoices).toHaveLength(3);
    expect(new Set(run.rewardChoices).size).toBe(3);
    expect(run.rewardChoices).not.toContain('copper');
    const gold = run.gold;
    const skipped = chooseReward(run, null);
    expect(skipped.gold).toBe(gold + 3);
    expect(skipped.bag).toHaveLength(run.bag.length);
    const took = chooseReward(run, 0);
    expect(took.bag).toHaveLength(run.bag.length + 1);
    expect(took.round).toBe(2);

    const c = makeRun(['copper'], ['collector']);
    c.screen = 'ready';
    expect(playRound(c).rewardChoices).toHaveLength(4);
  });

  it('reroll tokens re-roll the reward choices', () => {
    let run = playRound(chooseStarter(newRun(9), 'banner'));
    expect(run.rerollTokens).toBe(1);
    run = rerollRewards(run);
    expect(run.rerollTokens).toBe(0);
    expect(() => rerollRewards(run)).toThrow(ActionError);
  });
});

describe('fusion', () => {
  it('fuses three identical coins into a higher level coin', () => {
    const run = makeRun(['squire', 'squire', 'copper', 'squire']);
    run.bag[0].bonus = 2;
    run.bag[1].engraving = 'lucky';
    const notes = applyFusion(run);
    expect(notes).toHaveLength(1);
    expect(run.bag).toHaveLength(2);
    const fused = run.bag.find((c) => c.defId === 'squire')!;
    expect(fused.level).toBe(2);
    expect(fused.bonus).toBe(2);
    expect(fused.engraving).toBe('lucky');
    expect(run.stats.fusions).toBe(1);
  });

  it('chains up to level 3 and stops there', () => {
    const run = makeRun(Array(9).fill('grunt'));
    applyFusion(run);
    expect(run.bag.map((c) => c.level)).toEqual([3]);
    const big = makeRun(Array(27).fill('grunt'));
    applyFusion(big);
    expect(big.bag.map((c) => c.level)).toEqual([3, 3, 3]);
  });

  it('never fuses plain Copper', () => {
    const run = makeRun(Array(6).fill('copper'));
    expect(applyFusion(run)).toEqual([]);
    expect(run.bag).toHaveLength(6);
  });

  it('does not fuse different levels', () => {
    const run = makeRun(['grunt', 'grunt', 'grunt']);
    run.bag[0].level = 2;
    applyFusion(run);
    expect(run.bag).toHaveLength(3);
  });

  it('fusion happens automatically when a reward is taken', () => {
    let run = playRound(makeRun(['merchant', 'merchant', 'copper', 'copper', 'copper']));
    run.rewardChoices = ['merchant', 'grunt', 'archer'];
    run = chooseReward(run, 0);
    expect(run.bag.filter((c) => c.defId === 'merchant').map((c) => c.level)).toEqual([2]);
    expect(run.fusionNotes[0]).toMatch(/Merchant/);
  });
});

describe('dues', () => {
  it('escalates every phase', () => {
    expect(DUES).toHaveLength(PHASES);
    for (let i = 1; i < DUES.length; i++) expect(DUES[i]).toBeGreaterThan(DUES[i - 1]);
    expect(DUES[0]).toBeGreaterThanOrEqual(20);
    expect(DUES[0]).toBeLessThanOrEqual(30);
  });

  it('Golden Scales lowers dues', () => {
    expect(duesFor(4, computeMods(['scales']))).toBeLessThan(duesFor(4, computeMods([])));
  });

  function atDues(gold: number, phase = 1): RunState {
    const run = makeRun(['copper', 'copper', 'copper', 'copper', 'copper']);
    run.screen = 'dues';
    run.phase = phase;
    run.gold = gold;
    return run;
  }

  it('paying moves to the shop and deducts gold', () => {
    const run = payDues(atDues(100));
    expect(run.screen).toBe('shop');
    expect(run.gold).toBe(100 - DUES[0]);
    expect(run.shop.length).toBeGreaterThan(0);
  });

  it('failing to pay loses the run', () => {
    const run = atDues(DUES[0] - 1);
    expect(canPayDues(run)).toBe(false);
    expect(payDues(run).screen).toBe('lost');
  });

  it('paying phase 8 dues wins the run', () => {
    const run = payDues(atDues(DUES[7] + 5, 8));
    expect(run.screen).toBe('won');
  });

  it('the fifth round leads to dues with tokens granted', () => {
    let run = chooseStarter(newRun(77), 'warhorn');
    for (let i = 0; i < 5; i++) {
      expect(run.screen).toBe('ready');
      run = chooseReward(playRound(run), null);
    }
    expect(run.screen).toBe('dues');
    expect(run.meltTokens).toBe(1);
    expect(run.rerollTokens).toBe(2);
    expect(currentDues(run)).toBe(DUES[0]);
  });
});

describe('shop', () => {
  function shopRun(gold = 200, charms: string[] = []): RunState {
    const run = makeRun(['copper', 'copper', 'copper', 'copper', 'copper', 'grunt', 'squire'], charms);
    run.screen = 'shop';
    run.gold = gold;
    run.shop = rollShop(run);
    return run;
  }

  it('prices rise with phase and fall with Haggler', () => {
    const plain = computeMods([]);
    expect(coinPrice('grunt', 1, plain)).toBe(5);
    expect(coinPrice('grunt', 8, plain)).toBeGreaterThan(5);
    expect(coinPrice('guildmaster', 1, plain)).toBeGreaterThan(coinPrice('merchant', 1, plain));
    expect(coinPrice('grunt', 1, computeMods(['haggler']))).toBeLessThan(5);
    expect(charmPrice('pockets', 1, plain)).toBeGreaterThan(charmPrice('crown', 1, plain));
  });

  it('reroll gets pricier each time in a visit', () => {
    let run = shopRun();
    const costs: number[] = [];
    for (let i = 0; i < 4; i++) {
      costs.push(shopRerollCost(run));
      run = rerollShop(run);
    }
    expect(costs).toEqual([2, 4, 6, 8]);
    expect(run.gold).toBe(200 - 20);
    expect(rerollCost(0, computeMods(['dice']))).toBe(1);
  });

  it('reroll tokens reroll for free', () => {
    let run = shopRun(0);
    run.rerollTokens = 1;
    run = rerollShop(run, true);
    expect(run.rerollTokens).toBe(0);
    expect(() => rerollShop(run)).toThrow(ActionError);
  });

  it('stocks coins, charms, engravings and a token', () => {
    const run = shopRun();
    const kinds = run.shop.map((i) => i.kind);
    expect(kinds.filter((k) => k === 'coin')).toHaveLength(3);
    expect(kinds.filter((k) => k === 'charm')).toHaveLength(2);
    expect(kinds.filter((k) => k === 'engraving')).toHaveLength(2);
    expect(kinds).toContain('token');
    for (const it of run.shop) if (it.kind === 'charm') expect(['banner', 'warhorn', 'silverleaf']).not.toContain(it.charmId);
  });

  it('buys coins, charms and engravings', () => {
    let run = shopRun();
    const coinIdx = run.shop.findIndex((i) => i.kind === 'coin');
    const charmIdx = run.shop.findIndex((i) => i.kind === 'charm');
    const engIdx = run.shop.findIndex((i) => i.kind === 'engraving');
    const gold = run.gold;
    run = buyItem(run, coinIdx);
    run = buyItem(run, charmIdx);
    expect(() => buyItem(run, engIdx)).toThrow(ActionError);
    run = buyItem(run, engIdx, run.bag[0].uid);
    expect(run.bag).toHaveLength(8);
    expect(run.charms).toHaveLength(1);
    expect(run.bag[0].engraving).toBeDefined();
    const spent = [coinIdx, charmIdx, engIdx].reduce((s, i) => s + run.shop[i].price, 0);
    expect(run.gold).toBe(gold - spent);
    expect(() => buyItem(run, coinIdx)).toThrow(ActionError);
  });

  it('cannot buy without gold', () => {
    const run = shopRun(0);
    expect(() => buyItem(run, 0)).toThrow(ActionError);
  });

  it('melting removes a coin but never below 5 coins', () => {
    let run = shopRun();
    run.meltTokens = 5;
    run = meltCoin(run, run.bag[0].uid);
    run = meltCoin(run, run.bag[0].uid);
    expect(run.bag).toHaveLength(5);
    expect(run.meltTokens).toBe(3);
    expect(() => meltCoin(run, run.bag[0].uid)).toThrow(ActionError);
  });

  it('leaving the shop starts the next phase', () => {
    const run = leaveShop(shopRun());
    expect(run.phase).toBe(2);
    expect(run.round).toBe(1);
    expect(run.screen).toBe('ready');
  });

  it('new instances get unique ids', () => {
    const run = makeRun([]);
    const ids = new Set(Array.from({ length: 50 }, () => newInstance(run, 'copper').uid));
    expect(ids.size).toBe(50);
  });
});

describe('full simulated runs', () => {
  it('is reproducible with a fixed seed', () => {
    expect(simulateRun('fixed-seed-1')).toEqual(simulateRun('fixed-seed-1'));
    expect(simulateRun('fixed-seed-2', 'random')).toEqual(simulateRun('fixed-seed-2', 'random'));
  });

  it('every run ends in a win or a loss within 8 phases', () => {
    for (let i = 0; i < 40; i++) {
      const r = simulateRun(`t-${i}`, i % 2 ? 'sensible' : 'random');
      expect(r.phaseReached).toBeGreaterThanOrEqual(1);
      expect(r.phaseReached).toBeLessThanOrEqual(8);
      expect(r.roundsPlayed).toBeLessThanOrEqual(40);
    }
  });

  it('a sensible bot sometimes wins and sometimes loses; a random bot rarely wins', () => {
    const sensible = Array.from({ length: 150 }, (_, i) => simulateRun(`b-${i}`, 'sensible'));
    const wins = sensible.filter((r) => r.won).length;
    expect(wins).toBeGreaterThan(0);
    expect(wins).toBeLessThan(150);
    const random = Array.from({ length: 100 }, (_, i) => simulateRun(`r-${i}`, 'random'));
    expect(random.filter((r) => r.won).length).toBeLessThan(wins);
  });

  it('a whole run survives a save/load round-trip through JSON', () => {
    let run = chooseStarter(newRun('save-test'), 'silverleaf');
    run = playRound(run);
    const restored = JSON.parse(JSON.stringify(run)) as RunState;
    expect(chooseReward(restored, 0)).toEqual(chooseReward(run, 0));
  });
});
