import { destroyCoin, runCharmTrigger, runCoinTrigger, setFace, valueOf } from '../resolve';
import { goldEvents, table } from './helpers';

// Coins far apart enough not to be adjacent to anything at x≈0.5.
const PAD = Array.from({ length: 5 }, () => ({ defId: 'copper', x: 0.95, y: 1.1 }));

describe('race diversity (Count.races)', () => {
  it('Caravan Master pays per race on the table, ignoring plain coins', () => {
    const { ctx, coins } = table([
      { defId: 'caravan', x: 0.1, y: 0.1 },
      { defId: 'grunt', x: 0.9, y: 0.1 },
      { defId: 'copper', x: 0.5, y: 0.9 },
    ]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(4); // Human + Orc, Copper doesn't count

    const all = table([
      { defId: 'caravan', x: 0.1, y: 0.1 },
      { defId: 'grunt', x: 0.9, y: 0.1 },
      { defId: 'archer', x: 0.5, y: 0.9 },
    ]);
    runCoinTrigger(all.ctx, all.coins[0], 'onRoundEnd');
    expect(goldEvents(all.ctx)).toBe(6);
  });
});

describe('set bonuses (Effect.require)', () => {
  it('Town Crier pays only with 3+ Humans on the table', () => {
    const two = table([
      { defId: 'towncrier', x: 0.1, y: 0.1 },
      { defId: 'squire', x: 0.9, y: 0.1 },
      { defId: 'grunt', x: 0.5, y: 0.9 },
    ]);
    runCoinTrigger(two.ctx, two.coins[0], 'onRoundEnd');
    expect(goldEvents(two.ctx)).toBe(0);

    const three = table([
      { defId: 'towncrier', x: 0.1, y: 0.1 },
      { defId: 'squire', x: 0.9, y: 0.1 },
      { defId: 'merchant', x: 0.5, y: 0.9 },
    ]);
    runCoinTrigger(three.ctx, three.coins[0], 'onRoundEnd');
    expect(goldEvents(three.ctx)).toBe(8);
  });

  it('War Drummer buffs every Orc (itself included) with 3+ Orcs', () => {
    const { ctx, coins } = table([
      { defId: 'wardrummer', x: 0.1, y: 0.1 },
      { defId: 'grunt', x: 0.9, y: 0.1 },
      { defId: 'grunt', x: 0.5, y: 0.9 },
      { defId: 'squire', x: 0.5, y: 0.5 },
    ]);
    const before = coins.map((c) => valueOf(ctx, c));
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(coins.map((c, i) => valueOf(ctx, c) - before[i])).toEqual([3, 3, 3, 0]);
  });

  it('Grove Elder doubles heads Elves only when 3+ of them are heads', () => {
    const { ctx, coins } = table([
      { defId: 'grovelder', x: 0.1, y: 0.1, face: 'heads' },
      { defId: 'archer', x: 0.9, y: 0.1, face: 'heads' },
      { defId: 'ranger', x: 0.5, y: 0.9, face: 'heads' },
      { defId: 'druid', x: 0.5, y: 0.5, face: 'tails' },
    ]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(coins.map((c) => c.mult)).toEqual([2, 2, 2, 1]);

    const two = table([
      { defId: 'grovelder', x: 0.1, y: 0.1, face: 'heads' },
      { defId: 'archer', x: 0.9, y: 0.1, face: 'heads' },
      { defId: 'ranger', x: 0.5, y: 0.9, face: 'tails' },
    ]);
    runCoinTrigger(two.ctx, two.coins[0], 'onRoundEnd');
    expect(two.coins.map((c) => c.mult)).toEqual([1, 1, 1]);
  });

  it('Envoy and Treaty Seal need all three races', () => {
    const { ctx, coins } = table(
      [
        { defId: 'envoy', x: 0.1, y: 0.1, face: 'heads' },
        { defId: 'grunt', x: 0.9, y: 0.1, face: 'heads' },
        { defId: 'squire', x: 0.5, y: 0.9, face: 'tails' },
      ],
      ['treaty'],
    );
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(coins.map((c) => c.temp)).toEqual([3, 3, 0]);
    runCharmTrigger(ctx, 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(5);

    const two = table([{ defId: 'envoy', x: 0.1, y: 0.1 }, { defId: 'grunt', x: 0.9, y: 0.1 }], ['treaty']);
    runCoinTrigger(two.ctx, two.coins[0], 'onRoundEnd');
    runCharmTrigger(two.ctx, 'onRoundEnd');
    expect(two.coins.map((c) => c.temp)).toEqual([0, 0]);
    expect(goldEvents(two.ctx)).toBe(0);
  });
});

describe('tails and flip payoffs', () => {
  it('Cutpurse pays on tails only; Night Raider pays per tails coin', () => {
    const { ctx, coins } = table([
      { defId: 'cutpurse', x: 0.1, y: 0.1, face: 'tails' },
      { defId: 'raider', x: 0.9, y: 0.1, face: 'tails' },
      { defId: 'copper', x: 0.5, y: 0.9, face: 'tails' },
      { defId: 'copper', x: 0.5, y: 0.5, face: 'heads' },
    ]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(6);
    runCoinTrigger(ctx, coins[1], 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(6 + 6);
  });

  it('Juggler pays when other coins flip, not when it flips itself', () => {
    const { ctx, coins } = table([
      { defId: 'juggler', x: 0.1, y: 0.1 },
      { defId: 'copper', x: 0.9, y: 0.1 },
    ]);
    setFace(ctx, coins[1], 'tails');
    setFace(ctx, coins[1], 'heads');
    setFace(ctx, coins[0], 'tails');
    expect(goldEvents(ctx)).toBe(4);
  });

  it('Wisp turns the best adjacent tails coin to heads', () => {
    const { ctx, coins } = table([
      { defId: 'grunt', x: 0.5, y: 0.5, face: 'tails' },
      { defId: 'copper', x: 0.6, y: 0.5, face: 'tails' },
      { defId: 'wisp', x: 0.55, y: 0.6 },
    ]);
    runCoinTrigger(ctx, coins[2], 'onLand');
    expect(coins.map((c) => c.face)).toEqual(['heads', 'tails', 'heads']);
  });
});

describe('destruction and multipliers', () => {
  it('Powder Keg pays and flips its neighbours when destroyed', () => {
    const { ctx, coins } = table([
      { defId: 'powderkeg', x: 0.5, y: 0.5 },
      { defId: 'copper', x: 0.6, y: 0.5, face: 'heads' },
      { defId: 'copper', x: 0.5, y: 0.6, face: 'tails' },
      ...PAD,
    ]);
    destroyCoin(ctx, coins[0]);
    expect(goldEvents(ctx)).toBe(8);
    expect([coins[1].face, coins[2].face]).toEqual(['tails', 'heads']);
  });

  it('Gem Cutter doubles the best adjacent heads coin after every buff', () => {
    const { ctx, coins } = table([
      { defId: 'gemcutter', x: 0.5, y: 0.5 },
      { defId: 'grunt', x: 0.6, y: 0.5, face: 'heads' },
      { defId: 'copper', x: 0.5, y: 0.6, face: 'heads' },
    ]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(coins[1].mult).toBe(2);
    expect(coins[2].mult).toBe(1);
    coins[1].temp += 2;
    expect(valueOf(ctx, coins[1])).toBe((4 + 2) * 2);
  });
});

describe('rule-bending Charms and Kinship', () => {
  it('Rally Horn lets a set bonus fire with one coin fewer', () => {
    const { ctx, coins } = table(
      [
        { defId: 'towncrier', x: 0.1, y: 0.1 },
        { defId: 'squire', x: 0.9, y: 0.1 },
        { defId: 'grunt', x: 0.5, y: 0.9 },
      ],
      ['rallyhorn'],
    );
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(8);
  });

  it("Jeweler's Loupe turns ×2 into ×3", () => {
    const { ctx, coins } = table(
      [
        { defId: 'gemcutter', x: 0.5, y: 0.5 },
        { defId: 'grunt', x: 0.6, y: 0.5, face: 'heads' },
      ],
      ['loupe'],
    );
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(coins[1].mult).toBe(3);
    expect(valueOf(ctx, coins[1])).toBe(12);
  });

  it('Spinning Top buffs the coin that flipped', () => {
    const { ctx, coins } = table(
      [
        { defId: 'copper', x: 0.1, y: 0.1, face: 'heads' },
        { defId: 'copper', x: 0.9, y: 0.1, face: 'heads' },
      ],
      ['spintop'],
    );
    setFace(ctx, coins[1], 'tails');
    expect(coins.map((c) => c.temp)).toEqual([0, 1]);
  });

  it('a Kinship coin counts as every race', () => {
    const { ctx, coins } = table([
      { defId: 'caravan', x: 0.1, y: 0.1 },
      { defId: 'copper', x: 0.9, y: 0.1, engraving: 'kinship' },
    ]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(6); // Human + (Human, Orc, Elf) = 3 races

    const set = table([
      { defId: 'wardrummer', x: 0.1, y: 0.1 },
      { defId: 'grunt', x: 0.9, y: 0.1 },
      { defId: 'squire', x: 0.5, y: 0.9, engraving: 'kinship' },
    ]);
    runCoinTrigger(set.ctx, set.coins[0], 'onRoundEnd');
    expect(set.coins.map((c) => c.temp)).toEqual([3, 3, 3]);
  });
});

describe('synergy engravings', () => {
  it('Two-Faced lets a heads-only ability fire on tails', () => {
    const { ctx, coins } = table([{ defId: 'moneychanger', x: 0.1, y: 0.1, face: 'tails', engraving: 'twofaced' }]);
    runCoinTrigger(ctx, coins[0], 'onRoundEnd');
    expect(goldEvents(ctx)).toBe(4);
    const plain = table([{ defId: 'moneychanger', x: 0.1, y: 0.1, face: 'tails' }]);
    runCoinTrigger(plain.ctx, plain.coins[0], 'onRoundEnd');
    expect(goldEvents(plain.ctx)).toBe(0);
  });

  it('Spiked passes a flip on to a neighbour', () => {
    const { ctx, coins } = table([
      { defId: 'copper', x: 0.5, y: 0.5, face: 'heads', engraving: 'spiked' },
      { defId: 'copper', x: 0.6, y: 0.5, face: 'heads' },
    ]);
    setFace(ctx, coins[0], 'tails');
    expect(coins[1].face).toBe('tails');
  });

  it('Hollow pays when its coin is destroyed', () => {
    const { ctx, coins } = table([{ defId: 'copper', x: 0.5, y: 0.5, engraving: 'hollow' }, ...PAD]);
    destroyCoin(ctx, coins[0]);
    expect(goldEvents(ctx)).toBe(5);
  });
});
