import type { CoinDef } from '../types';

// Every coin is pure data built from the effect building blocks in ../types.ts.
// Numbers in effects scale with fusion level unless `noScale` is set.

export const COINS: CoinDef[] = [
  // ---------------------------------------------------------------- Neutral
  {
    id: 'copper',
    name: 'Copper',
    race: 'neutral',
    rarity: 'starter',
    value: 2,
    text: 'A plain coin. No ability.',
    effects: [],
    unbuyable: true,
  },

  // ---------------------------------------------------------------- Humans
  {
    id: 'squire',
    name: 'Squire',
    race: 'human',
    rarity: 'common',
    value: 2,
    text: 'Round end: +1 value for each other Human on the table.',
    effects: [
      {
        trigger: 'onRoundEnd',
        do: { kind: 'buff', target: { scope: 'self' }, amount: 1, per: { count: { scope: 'table', race: 'human' } } },
      },
    ],
  },
  {
    id: 'merchant',
    name: 'Merchant',
    race: 'human',
    rarity: 'common',
    value: 2,
    text: 'Heads: +1 gold for each adjacent coin.',
    effects: [
      {
        trigger: 'onAdjacent',
        when: 'heads',
        do: { kind: 'gold', amount: 1, per: { count: { scope: 'adjacent' } } },
      },
    ],
  },
  {
    id: 'moneychanger',
    name: 'Moneychanger',
    race: 'human',
    rarity: 'common',
    value: 1,
    text: 'Heads: +3 gold.',
    effects: [{ trigger: 'onRoundEnd', when: 'heads', do: { kind: 'gold', amount: 3 } }],
  },
  {
    id: 'captain',
    name: 'Captain',
    race: 'human',
    rarity: 'uncommon',
    value: 2,
    text: 'Adjacent Humans get +2 value this round.',
    effects: [
      {
        trigger: 'onAdjacent',
        do: { kind: 'buff', target: { scope: 'adjacent', race: 'human' }, amount: 2 },
      },
    ],
  },
  {
    id: 'bard',
    name: 'Bard',
    race: 'human',
    rarity: 'uncommon',
    value: 1,
    text: "Retrigger the ability of the best adjacent coin.",
    effects: [
      {
        trigger: 'onAdjacent',
        do: { kind: 'retrigger', target: { scope: 'adjacent', hasAbility: true, pick: 'highest' } },
      },
    ],
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    race: 'human',
    rarity: 'uncommon',
    value: 1,
    text: 'Copies the ability of the nearest coin that has one.',
    effects: [
      { trigger: 'onAdjacent', do: { kind: 'copy', target: { scope: 'nearest', hasAbility: true } } },
    ],
  },
  {
    id: 'patron',
    name: 'Patron',
    race: 'human',
    rarity: 'common',
    value: 2,
    text: 'Heads: a random other Human on the table gains +1 value permanently.',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'buff', target: { scope: 'table', race: 'human', pick: 'random' }, amount: 1, permanent: true },
      },
    ],
  },
  {
    id: 'innkeeper',
    name: 'Innkeeper',
    race: 'human',
    rarity: 'uncommon',
    value: 2,
    text: 'Phase end: +4 gold, even from the bag.',
    effects: [{ trigger: 'onPhaseEnd', do: { kind: 'gold', amount: 4 } }],
  },
  {
    id: 'tinker',
    name: 'Tinker',
    race: 'human',
    rarity: 'common',
    value: 2,
    text: 'Phase start: gain 1 Reroll token.',
    effects: [{ trigger: 'onPhaseStart', do: { kind: 'token', token: 'reroll', amount: 1 } }],
  },
  {
    id: 'guildmaster',
    name: 'Guildmaster',
    race: 'human',
    rarity: 'rare',
    value: 2,
    text: 'Heads: +2 gold for each heads Human on the table (itself included).',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'gold', amount: 2, per: { count: { scope: 'table', race: 'human', face: 'heads', includeSelf: true } } },
      },
    ],
  },

  // ---------------------------------------------------------------- Orcs
  {
    id: 'grunt',
    name: 'Grunt',
    race: 'orc',
    rarity: 'common',
    value: 4,
    text: 'No ability. Just heavy.',
    effects: [],
  },
  {
    id: 'berserker',
    name: 'Berserker',
    race: 'orc',
    rarity: 'uncommon',
    value: 3,
    text: 'Destroys the lowest-value adjacent coin and permanently gains its value.',
    effects: [
      {
        trigger: 'onAdjacent',
        do: { kind: 'destroy', target: { scope: 'adjacent', pick: 'lowest' }, absorb: true },
      },
    ],
  },
  {
    id: 'charger',
    name: 'Charger',
    race: 'orc',
    rarity: 'common',
    value: 3,
    text: 'On land: rams the nearest coin, pushing it away and flipping it.',
    effects: [{ trigger: 'onLand', do: { kind: 'bump', target: { scope: 'nearest' } } }],
  },
  {
    id: 'shaman',
    name: 'Shaman',
    race: 'orc',
    rarity: 'common',
    value: 2,
    text: 'Adjacent Orcs get +2 value this round.',
    effects: [
      { trigger: 'onAdjacent', do: { kind: 'buff', target: { scope: 'adjacent', race: 'orc' }, amount: 2 } },
    ],
  },
  {
    id: 'firebrand',
    name: 'Firebrand',
    race: 'orc',
    rarity: 'uncommon',
    value: 6,
    text: 'Round end: 1 in 4 chance to blow up. When destroyed: +10 gold.',
    effects: [
      { trigger: 'onRoundEnd', chance: 0.25, noScale: true, do: { kind: 'destroy', target: { scope: 'self' } } },
      { trigger: 'onDestroy', do: { kind: 'gold', amount: 10 } },
    ],
  },
  {
    id: 'wrecker',
    name: 'Wrecker',
    race: 'orc',
    rarity: 'common',
    value: 3,
    text: 'On land: flips every adjacent coin.',
    effects: [{ trigger: 'onLand', do: { kind: 'flip', target: { scope: 'adjacent' } } }],
  },
  {
    id: 'looter',
    name: 'Looter',
    race: 'orc',
    rarity: 'common',
    value: 2,
    text: 'Whenever any coin on the table is destroyed: +2 value permanently.',
    effects: [
      { trigger: 'onDestroy', any: true, do: { kind: 'buff', target: { scope: 'self' }, amount: 2, permanent: true } },
    ],
  },
  {
    id: 'brawler',
    name: 'Brawler',
    race: 'orc',
    rarity: 'common',
    value: 2,
    text: 'Whenever this coin is flipped: +2 value permanently.',
    effects: [
      { trigger: 'onFlip', do: { kind: 'buff', target: { scope: 'self' }, amount: 2, permanent: true } },
    ],
  },
  {
    id: 'warlord',
    name: 'Warlord',
    race: 'orc',
    rarity: 'rare',
    value: 4,
    text: 'Round end: +3 value for each other Orc on the table.',
    effects: [
      {
        trigger: 'onRoundEnd',
        do: { kind: 'buff', target: { scope: 'self' }, amount: 3, per: { count: { scope: 'table', race: 'orc' } } },
      },
    ],
  },

  // ---------------------------------------------------------------- Elves
  {
    id: 'archer',
    name: 'Archer',
    race: 'elf',
    rarity: 'common',
    value: 2,
    text: 'Heads: +2 value to the highest-value heads coin anywhere.',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'buff', target: { scope: 'table', face: 'heads', pick: 'highest' }, amount: 2 },
      },
    ],
  },
  {
    id: 'moonpriestess',
    name: 'Moon Priestess',
    race: 'elf',
    rarity: 'uncommon',
    value: 1,
    text: 'Round end: re-flips the highest-value tails coin.',
    effects: [
      {
        trigger: 'onRoundEnd',
        do: { kind: 'reflip', target: { scope: 'table', face: 'tails', pick: 'highest', includeSelf: true }, amount: 1 },
      },
    ],
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    race: 'elf',
    rarity: 'common',
    value: 2,
    headsChance: 1,
    text: 'Always lands heads.',
    effects: [],
  },
  {
    id: 'bladedancer',
    name: 'Bladedancer',
    race: 'elf',
    rarity: 'uncommon',
    value: 2,
    text: 'Round end: heads gives +1 value permanently per heads in a row. Tails resets it.',
    effects: [{ trigger: 'onRoundEnd', do: { kind: 'streak', amount: 1 } }],
  },
  {
    id: 'ranger',
    name: 'Ranger',
    race: 'elf',
    rarity: 'common',
    value: 2,
    text: 'Heads: every other heads Elf on the table gets +2 value this round.',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'buff', target: { scope: 'table', race: 'elf', face: 'heads' }, amount: 2 },
      },
    ],
  },
  {
    id: 'seer',
    name: 'Seer',
    race: 'elf',
    rarity: 'common',
    value: 1,
    text: 'On land: the next coin tossed lands heads.',
    effects: [{ trigger: 'onLand', do: { kind: 'blessNext', amount: 1 } }],
  },
  {
    id: 'longbow',
    name: 'Longbow',
    race: 'elf',
    rarity: 'uncommon',
    value: 2,
    text: 'Heads: +3 value to the farthest heads coin.',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'buff', target: { scope: 'farthest', face: 'heads' }, amount: 3 },
      },
    ],
  },
  {
    id: 'druid',
    name: 'Druid',
    race: 'elf',
    rarity: 'common',
    value: 2,
    text: 'Heads: the lowest-value other coin on the table gains +1 value permanently.',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'buff', target: { scope: 'table', pick: 'lowest' }, amount: 1, permanent: true },
      },
    ],
  },
  {
    id: 'starweaver',
    name: 'Starweaver',
    race: 'elf',
    rarity: 'rare',
    value: 2,
    text: 'Round end: re-flips every tails coin on the table.',
    effects: [
      {
        trigger: 'onRoundEnd',
        noScale: true,
        do: { kind: 'reflip', target: { scope: 'table', face: 'tails', includeSelf: true } },
      },
    ],
  },
];

export const COIN_MAP: Record<string, CoinDef> = Object.fromEntries(COINS.map((c) => [c.id, c]));

export function coinDef(id: string): CoinDef {
  const d = COIN_MAP[id];
  if (!d) throw new Error(`Unknown coin ${id}`);
  return d;
}
