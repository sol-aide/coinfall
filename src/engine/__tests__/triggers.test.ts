import { COIN_MAP } from '../content/coins';
import { computeMods, tableValue } from '../mods';
import { destroyCoin, resolvePhaseTrigger, resolveRound, runCharmTrigger, runCoinTrigger, setFace, valueOf } from '../resolve';
import type { CoinDef } from '../types';
import { goldEvents, makeRun, table } from './helpers';

const PAD = Array.from({ length: 5 }, () => ({ defId: 'copper', x: 0.95, y: 1.1 }));

describe('onRoundStart', () => {
  const testCoin: CoinDef = {
    id: 'test_rs',
    name: 'Test Starter',
    race: 'human',
    rarity: 'common',
    value: 1,
    text: 'Round start: +2 gold.',
    effects: [{ trigger: 'onRoundStart', do: { kind: 'gold', amount: 2 } }],
    unbuyable: true,
  };
  beforeAll(() => {
    COIN_MAP[testCoin.id] = testCoin;
  });
  afterAll(() => {
    delete COIN_MAP[testCoin.id];
  });

  it('fires for every drawn coin before the toss', () => {
    const run = makeRun(['test_rs', 'test_rs', 'copper']);
    const result = resolveRound(run);
    const firstLand = result.events.findIndex((e) => e.t === 'land');
    const golds = result.events.filter((e, i) => e.t === 'gold' && i < firstLand);
    expect(golds).toHaveLength(2);
    expect(result.breakdown.filter((b) => b.kind === 'ability').reduce((s, b) => s + b.amount, 0)).toBe(4);
  });
});

describe('onLand', () => {
  it('Charger rams the nearest landed coin, pushing and flipping it', () => {
    const { ctx, coins } = table([
      { defId: 'copper', x: 0.5, y: 0.5, face: 'heads' },
      { defId: 'copper', x: 0.9, y: 0.9, face: 'heads' },
      { defId: 'charger', x: 0.4, y: 0.5 },
    ]);
    runCoinTrigger(ctx, coins[2], 'onLand');
    expect(coins[0].face).toBe('tails');
    expect(coins[0].x).toBeGreaterThan(0.5);
    expect(coins[1].face).toBe('heads');
    expect(ctx.events.some((e) => e.t === 'move' && e.uid === coins[0].uid)).toBe(true);
  });

  it('Wrecker flips every adjacent coin', () => {
    const { ctx, coins } = table([
      { defId: 'copper', x: 0.5, y: 0.5, face: 'heads' },
      { defId: 'copper', x: 0.6, y: 0.5, face: 'tails' },
      { defId: 'copper', x: 1, y: 1.2, face: 'heads' },
      { defId: 'wrecker', x: 0.55, y: 0.6 },
    ]);
    runCoinTrigger(ctx, coins[3], 'onLand');
    expect(coins.map((c) => c.face)).toEqual(['tails', 'heads', 'heads', 'heads']);
  });

  it('Seer makes the next tossed coin land heads', () => {
    let headsAfterSeer = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const run = makeRun(['seer', 'copper'], [], seed);
      const result = resolveRound(run);
      const lands = result.events.filter((e) => e.t === 'land');
      const seerIdx = lands.findIndex((e) => e.t === 'land' && result.table.find((c) => c.uid === e.uid)?.defId === 'seer');
      if (seerIdx === 0) {
        const nextLand = lands[1];
        if (nextLand.t === 'land') {
          expect(nextLand.face).toBe('heads');
          headsAfterSeer++;
        }
      }
    }
    expect(headsAfterSeer).toBeGreaterThan(5);
  });
});

describe('onFlip', () => {
  it('Brawler gains permanent value when flipped', () => {
    const { ctx, coins, inst } = table([{ defId: 'brawler', face: 'heads' }]);
    setFace(ctx, coins[0], 'tails');
    expect(inst[0].bonus).toBe(2);
    setFace(ctx, coins[0], 'tails'); // no change, no trigger
    expect(inst[0].bonus).toBe(2);
  });

  it('Whirlwind Feather pays 1 gold per flip', () => {
    const { ctx, coins } = table([{ defId: 'copper' }, { defId: 'copper' }], ['whirlwind']);
    setFace(ctx, coins[0], 'tails');
    setFace(ctx, coins[1], 'tails');
    expect(goldEvents(ctx)).toBe(2);
  });
});

describe('onAdjacent', () => {
  it('Merchant on heads earns 1 gold per adjacent coin', () => {
    const { ctx, coins } = table([
      { defId: 'merchant', x: 0.5, y: 0.5, face: 'heads' },
      { defId: 'copper', x: 0.6, y: 0.5 },
      { defId: 'copper', x: 0.4, y: 0.6 },
      { defId: 'copper', x: 1.0, y: 1.2 },
    ]);
    runCoinTrigger(ctx, coins[0], 'onAdjacent');
    expect(goldEvents(ctx)).toBe(2);
  });

  it('Merchant on tails earns nothing', () => {
    const { ctx, coins } = table([
      { defId: 'merchant', x: 0.5, y: 0.5, face: 'tails' },
      { defId: 'copper', x: 0.6, y: 0.5 },
    ]);
    runCoinTrigger(ctx, coins[0], 'onAdjacent');
    expect(goldEvents(ctx)).toBe(0);
  });

  it('Shaman buffs adjacent Orcs only; Captain buffs adjacent Humans', () => {
    const { ctx, coins } = table([
      { defId: 'shaman', x: 0.5, y: 0.5 },
      { defId: 'grunt', x: 0.6, y: 0.5 },
      { defId: 'squire', x: 0.4, y: 0.5 },
      { defId: 'captain', x: 0.45, y: 0.6 },
    ]);
    runCoinTrigger(ctx, coins[0], 'onAdjacent');
    runCoinTrigger(ctx, coins[3], 'onAdjacent');
    expect(coins[1].temp).toBe(2);
    expect(coins[2].temp).toBe(2);
    expect(coins[0].temp).toBe(0);
  });

  it('Berserker destroys the lowest adjacent coin and absorbs its value', () => {
    const { ctx, coins, inst, run } = table([
      { defId: 'berserker', x: 0.5, y: 0.5 },
      { defId: 'grunt', x: 0.6, y: 0.5 },
      { defId: 'copper', x: 0.4, y: 0.5 },
      ...PAD,
    ]);
    runCoinTrigger(ctx, coins[0], 'onAdjacent');
    expect(coins[2].destroyed).toBe(true);
    expect(coins[1].destroyed).toBe(false);
    expect(inst[0].bonus).toBe(2);
    expect(valueOf(ctx, coins[0])).toBe(5);
    expect(run.bag).toHaveLength(3 + PAD.length); // removed from bag only when the round settles
  });

  it('Bard retriggers the best adjacent ability', () => {
    const { ctx, coins } = table([
      { defId: 'bard', x: 0.5, y: 0.5 },
      { defId: 'merchant', x: 0.6, y: 0.5, face: 'heads' },
      { defId: 'copper', x: 0.7, y: 0.5 },
    ]);
    runCoinTrigger(ctx, coins[1], 'onAdjacent');
    const once = goldEvents(ctx);
    runCoinTrigger(ctx, coins[0], 'onAdjacent');
    expect(goldEvents(ctx)).toBe(once * 2);
  });

  it('Apprentice copies the nearest ability as itself', () => {
    const { ctx, coins } = table([
      { defId: 'apprentice', x: 0.5, y: 0.5, face: 'heads' },
      { defId: 'moneychanger', x: 0.6, y: 0.5, face: 'tails' },
    ]);
    runCoinTrigger(ctx, coins[0], 'onAdjacent');
    // Moneychanger: heads +3 gold. The Apprentice is heads, so it earns it.
    expect(goldEvents(ctx)).toBe(3);
  });
});

describe('onDestroy', () => {
  it('Firebrand pays out when destroyed and Looter grows', () => {
    const { ctx, coins, inst } = table([{ defId: 'firebrand' }, { defId: 'looter' }, ...PAD]);
    destroyCoin(ctx, coins[0]);
    expect(goldEvents(ctx)).toBe(10);
    expect(inst[1].bonus).toBe(2);
  });

  it('coins hold firm when the bag is at the minimum size', () => {
    const { ctx, coins } = table([{ defId: 'berserker', x: 0.5 }, { defId: 'copper', x: 0.6 }, { defId: 'copper' }, { defId: 'copper' }, { defId: 'copper' }, { defId: 'copper' }]);
    destroyCoin(ctx, coins[2]);
    expect(coins[2].destroyed).toBe(true);
    destroyCoin(ctx, coins[3]);
    expect(coins[3].destroyed).toBe(false);
  });

  it('Ironclad coins cannot be destroyed', () => {
    const { ctx, coins } = table([{ defId: 'copper', engraving: 'ironclad' }]);
    destroyCoin(ctx, coins[0]);
    expect(coins[0].destroyed).toBe(false);
  });

  it('Tusk Warhorn and Spade pay gold on destroy', () => {
    const { ctx, coins } = table([{ defId: 'copper' }, ...PAD], ['warhorn', 'spade']);
    destroyCoin(ctx, coins[0]);
    expect(goldEvents(ctx)).toBe(5);
  });

  it('Second Wind returns a destroyed coin to the bag once', () => {
    // Firebrand self-destructs 25% of the time; find a seed where it blows up.
    for (let seed = 1; seed < 200; seed++) {
      const run = makeRun(['firebrand'], [], seed);
      run.bag[0].engraving = 'secondwind';
      const result = resolveRound(run);
      if (result.destroyed.length) {
        expect(run.bag).toHaveLength(1);
        expect(run.bag[0].engraving).toBeUndefined();
        expect(result.events.some((e) => e.t === 'revive')).toBe(true);
        return;
      }
    }
    throw new Error('no explosion found');
  });

  it('Destroyed coins without Second Wind leave the bag', () => {
    for (let seed = 1; seed < 200; seed++) {
      const run = makeRun(['firebrand', 'copper', 'copper', 'copper', 'copper', 'copper'], [], seed);
      const result = resolveRound(run);
      if (result.destroyed.length) {
        expect(run.bag.map((c) => c.defId)).toEqual(['copper', 'copper', 'copper', 'copper', 'copper']);
        expect(result.total).toBeGreaterThanOrEqual(10);
        return;
      }
    }
    throw new Error('no explosion found');
  });
});

describe('onRoundEnd', () => {
  it('Squire gains +1 per other Human on the table', () => {
    const { ctx, coins } = table([{ defId: 'squire' }, { defId: 'merchant' }, { defId: 'patron' }, { defId: 'grunt' }]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(coins[0].temp).toBe(2);
  });

  it('Archer buffs the highest-value heads coin', () => {
    const { ctx, coins } = table([
      { defId: 'archer', face: 'heads' },
      { defId: 'grunt', face: 'tails' },
      { defId: 'merchant', face: 'heads' },
      { defId: 'firebrand', face: 'heads', x: 0.9 },
    ]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(coins[3].temp).toBe(2);
    expect(coins[1].temp).toBe(0);
  });

  it('Moon Priestess re-flips the highest-value tails coin', () => {
    let flippedToHeads = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const { ctx, coins } = table(
        [{ defId: 'moonpriestess', face: 'heads' }, { defId: 'grunt', face: 'tails' }, { defId: 'copper', face: 'tails' }],
        [],
        seed,
      );
      runCoinTrigger(ctx, coins[0], 'onRoundEnd');
      expect(coins[2].face).toBe('tails');
      expect(ctx.events.some((e) => (e.t === 'reflip' || e.t === 'flip') && e.uid === coins[1].uid)).toBe(true);
      if (coins[1].face === 'heads') flippedToHeads++;
    }
    expect(flippedToHeads).toBeGreaterThan(5);
    expect(flippedToHeads).toBeLessThan(25);
  });

  it('Starweaver re-flips every tails coin', () => {
    const { ctx, coins } = table([
      { defId: 'starweaver', face: 'heads' },
      { defId: 'grunt', face: 'tails' },
      { defId: 'copper', face: 'tails' },
      { defId: 'copper', face: 'heads' },
    ]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    const touched = new Set(ctx.events.filter((e) => e.t === 'reflip' || e.t === 'flip').map((e) => (e as { uid: string }).uid));
    expect(touched).toEqual(new Set([coins[1].uid, coins[2].uid]));
  });

  it('Bladedancer streak grows on heads and resets on tails', () => {
    const { ctx, coins, inst } = table([{ defId: 'bladedancer', face: 'heads' }]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(inst[0].bonus).toBe(3);
    expect(inst[0].streak).toBe(3);
    coins[0].face = 'tails';
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(inst[0].bonus).toBe(0);
    expect(inst[0].streak).toBe(0);
  });

  it('Guildmaster pays 2 per heads Human including itself', () => {
    const { ctx, coins } = table([
      { defId: 'guildmaster', face: 'heads' },
      { defId: 'squire', face: 'heads' },
      { defId: 'merchant', face: 'tails' },
    ]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(4);
  });

  it('Druid grows the lowest other coin; Longbow hits the farthest heads coin', () => {
    const { ctx, coins, inst } = table([
      { defId: 'druid', face: 'heads', x: 0 },
      { defId: 'longbow', face: 'heads', x: 0.1 },
      { defId: 'grunt', face: 'heads', x: 0.2 },
      { defId: 'moneychanger', face: 'heads', x: 0.9 },
    ]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(inst[3].bonus).toBe(1);
    runCoinTrigger(ctx, coins[1], 'onRoundEnd');
    expect(coins[3].temp).toBe(3);
  });

  it('Ranger buffs other heads Elves; Patron grows another Human', () => {
    const { ctx, coins, inst } = table([
      { defId: 'ranger', face: 'heads' },
      { defId: 'archer', face: 'heads' },
      { defId: 'sentinel', face: 'tails' },
      { defId: 'patron', face: 'heads' },
      { defId: 'squire', face: 'tails' },
    ]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(coins[1].temp).toBe(2);
    expect(coins[2].temp).toBe(0);
    runCoinTrigger(ctx, coins[3], 'onRoundEnd');
    expect(inst[4].bonus).toBe(1);
  });

  it('Guild Charter pays per heads Human', () => {
    const { ctx } = table([{ defId: 'squire', face: 'heads' }, { defId: 'merchant', face: 'heads' }, { defId: 'grunt' }], ['charter']);
    runCharmTrigger(ctx, 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(2);
  });

  it('Warlord grows with other Orcs', () => {
    const { ctx, coins } = table([{ defId: 'warlord' }, { defId: 'grunt' }, { defId: 'shaman' }, { defId: 'archer' }]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(coins[0].temp).toBe(6);
  });
});

describe('phase triggers', () => {
  it('onPhaseStart: Tinker grants a Reroll token from the bag', () => {
    const run = makeRun(['tinker', 'copper']);
    const before = run.rerollTokens;
    resolvePhaseTrigger(run, 'onPhaseStart');
    expect(run.rerollTokens).toBe(before + 1);
  });

  it('onPhaseStart: Tiny Anvil grows a random bag coin', () => {
    const run = makeRun(['copper', 'copper'], ['anvil']);
    resolvePhaseTrigger(run, 'onPhaseStart');
    expect(run.bag.reduce((s, c) => s + c.bonus, 0)).toBe(2);
  });

  it('onPhaseEnd: Innkeeper pays 4 gold (8 at level 2); Interest Ledger pays interest', () => {
    const run = makeRun(['innkeeper', 'innkeeper'], ['ledger']);
    run.bag[1].level = 2;
    run.gold = 45;
    const r = resolvePhaseTrigger(run, 'onPhaseEnd');
    // 4 + 8 = 12 -> 57 gold -> ledger 5
    expect(r.gold).toBe(17);
    expect(run.gold).toBe(62);
  });
});

describe('engravings and statics', () => {
  it('Double doubles value', () => {
    const run = makeRun(['grunt']);
    run.bag[0].engraving = 'double';
    const mods = computeMods([]);
    expect(
      tableValue({ uid: run.bag[0].uid, defId: 'grunt', level: 1, x: 0, y: 0, face: 'heads', landed: true, destroyed: false, temp: 1, mult: 1, order: 0 }, run.bag[0], mods),
    ).toBe(10);
  });

  it('Echo triggers abilities twice', () => {
    const { ctx, coins } = table([{ defId: 'moneychanger', face: 'heads', engraving: 'echo' }]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(6);
  });

  it('Growth and Gilded fire on heads only', () => {
    const { ctx, coins, inst } = table([
      { defId: 'copper', face: 'heads', engraving: 'growth' },
      { defId: 'copper', face: 'tails', engraving: 'growth' },
      { defId: 'copper', face: 'heads', engraving: 'gilded' },
    ]);
    coins.forEach((c) => runCoinTrigger(ctx, c, 'onRoundEnd'));
    expect(inst[0].bonus).toBe(1);
    expect(inst[1].bonus).toBe(0);
    expect(goldEvents(ctx)).toBe(2);
  });

  it('Sentinel always lands heads; Lucky lands heads more often', () => {
    let luckyHeads = 0;
    let plainHeads = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const run = makeRun(['sentinel', 'copper', 'copper'], [], seed);
      run.bag[1].engraving = 'lucky';
      const r = resolveRound(run);
      expect(r.table.find((c) => c.defId === 'sentinel')!.face).toBe('heads');
      if (r.table.find((c) => c.uid === run.bag[1].uid)!.face === 'heads') luckyHeads++;
      if (r.table.find((c) => c.uid === run.bag[2].uid)!.face === 'heads') plainHeads++;
    }
    expect(luckyHeads).toBeGreaterThan(plainHeads);
    expect(luckyHeads / 400).toBeGreaterThan(0.58);
  });

  it('Weighted tails scores half; Tailwind gives 1 per tails coin', () => {
    for (let seed = 1; seed < 100; seed++) {
      const run = makeRun(['grunt'], ['tailwind'], seed);
      run.bag[0].engraving = 'weighted';
      const r = resolveRound(run);
      if (r.table[0].face === 'tails') {
        expect(r.total).toBe(2 + 1);
        return;
      }
    }
    throw new Error('never tails');
  });

  it('First Light makes the first coin land heads', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const run = makeRun(['copper', 'copper', 'copper'], ['firstlight'], seed);
      const r = resolveRound(run);
      const first = r.events.find((e) => e.t === 'land');
      expect(first && first.t === 'land' && first.face).toBe('heads');
    }
  });

  it('Fusion level scales base value and ability amounts', () => {
    const { ctx, coins } = table([{ defId: 'moneychanger', face: 'heads', level: 2 }]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(6);
    expect(valueOf(ctx, coins[0])).toBe(2);
  });
});

describe('round resolution', () => {
  it('is deterministic for a seed', () => {
    const a = resolveRound(makeRun(['squire', 'merchant', 'charger', 'archer', 'copper', 'berserker'], [], 42));
    const b = resolveRound(makeRun(['squire', 'merchant', 'charger', 'archer', 'copper', 'berserker'], [], 42));
    expect(a.events).toEqual(b.events);
    expect(a.total).toBe(b.total);
  });

  it('total equals the score breakdown and is added to gold', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const run = makeRun(['squire', 'merchant', 'charger', 'archer', 'copper', 'shaman', 'grunt'], ['whirlwind'], seed);
      const r = resolveRound(run);
      expect(r.breakdown.reduce((s, l) => s + l.amount, 0)).toBe(r.total);
      expect(run.gold).toBe(r.total);
    }
  });

  it('draws 5 coins, or 6 with Deep Pockets', () => {
    const bag = Array(10).fill('copper');
    expect(resolveRound(makeRun(bag)).table).toHaveLength(5);
    expect(resolveRound(makeRun(bag, ['pockets'])).table).toHaveLength(6);
  });

  it('coins land inside the table', () => {
    const r = resolveRound(makeRun(Array(8).fill('charger'), ['pockets'], 3));
    for (const c of r.table) {
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x).toBeLessThanOrEqual(1);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.y).toBeLessThanOrEqual(1.2);
    }
  });
});
