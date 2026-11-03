import type { CoinDef } from '../types';

// Every coin is pure data built from the effect building blocks in ../types.ts.
// Numbers in effects scale with fusion level unless `noScale` is set. In `text`,
// numbers that scale are written as {n}; abilityText() renders them for a level.

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
    text: 'Round end: +{2} value for each other Human on the table.',
    effects: [
      {
        trigger: 'onRoundEnd',
        do: { kind: 'buff', target: { scope: 'self' }, amount: 2, per: { count: { scope: 'table', race: 'human' } } },
      },
    ],
  },
  {
    id: 'merchant',
    name: 'Merchant',
    race: 'human',
    rarity: 'common',
    value: 2,
    text: 'Heads: +{2} gold for each adjacent coin.',
    effects: [
      {
        trigger: 'onAdjacent',
        when: 'heads',
        do: { kind: 'gold', amount: 2, per: { count: { scope: 'adjacent' } } },
      },
    ],
  },
  {
    id: 'moneychanger',
    name: 'Moneychanger',
    race: 'human',
    rarity: 'common',
    value: 2,
    text: 'Heads: +{4} gold.',
    effects: [{ trigger: 'onRoundEnd', when: 'heads', do: { kind: 'gold', amount: 4 } }],
  },
  {
    id: 'captain',
    name: 'Captain',
    race: 'human',
    rarity: 'uncommon',
    value: 2,
    text: 'Adjacent Humans get +{3} value this round.',
    effects: [
      {
        trigger: 'onAdjacent',
        do: { kind: 'buff', target: { scope: 'adjacent', race: 'human' }, amount: 3 },
      },
    ],
  },
  {
    id: 'bard',
    name: 'Bard',
    race: 'human',
    rarity: 'uncommon',
    value: 2,
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
    value: 2,
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
    text: 'Heads: every other Human on the table gains +{1} value permanently.',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'buff', target: { scope: 'table', race: 'human' }, amount: 1, permanent: true },
      },
    ],
  },
  {
    id: 'innkeeper',
    name: 'Innkeeper',
    race: 'human',
    rarity: 'uncommon',
    value: 2,
    text: 'Phase end: +{6} gold, even from the bag.',
    effects: [{ trigger: 'onPhaseEnd', do: { kind: 'gold', amount: 6 } }],
  },
  {
    id: 'tinker',
    name: 'Tinker',
    race: 'human',
    rarity: 'common',
    value: 2,
    text: 'Phase end: +{1} gold for each Human in your bag, even from the bag.',
    effects: [{ trigger: 'onPhaseEnd', do: { kind: 'gold', amount: 1, per: { bagRace: 'human' } } }],
  },
  {
    id: 'guildmaster',
    name: 'Guildmaster',
    race: 'human',
    rarity: 'rare',
    value: 2,
    text: 'Heads: +{3} gold for each heads Human on the table (itself included).',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'gold', amount: 3, per: { count: { scope: 'table', race: 'human', face: 'heads', includeSelf: true } } },
      },
    ],
  },

  // Cross-race and set-bonus Humans.
  {
    id: 'caravan',
    name: 'Caravan Master',
    race: 'human',
    rarity: 'uncommon',
    value: 2,
    text: 'Round end: +{2} gold for each race on the table (Humans, Orcs, Elves).',
    effects: [
      { trigger: 'onRoundEnd', do: { kind: 'gold', amount: 2, per: { races: { scope: 'table', includeSelf: true } } } },
    ],
  },
  {
    id: 'juggler',
    name: 'Juggler',
    race: 'human',
    rarity: 'common',
    value: 2,
    text: 'Whenever another coin on the table flips: +{1} gold.',
    effects: [{ trigger: 'onFlip', any: true, do: { kind: 'gold', amount: 1 } }],
  },
  {
    id: 'towncrier',
    name: 'Town Crier',
    race: 'human',
    rarity: 'uncommon',
    value: 2,
    text: 'Round end: if 3 or more Humans are on the table, +{8} gold.',
    effects: [
      {
        trigger: 'onRoundEnd',
        require: { per: { count: { scope: 'table', race: 'human', includeSelf: true } }, min: 3 },
        do: { kind: 'gold', amount: 8 },
      },
    ],
  },
  {
    id: 'gemcutter',
    name: 'Gem Cutter',
    race: 'human',
    rarity: 'rare',
    value: 2,
    text: 'Round end: doubles the value of the highest-value adjacent heads coin.',
    effects: [
      { trigger: 'onRoundEnd', do: { kind: 'mult', target: { scope: 'adjacent', face: 'heads', pick: 'highest' }, factor: 2 } },
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
    text: 'Adjacent Orcs get +{3} value this round.',
    effects: [
      { trigger: 'onAdjacent', do: { kind: 'buff', target: { scope: 'adjacent', race: 'orc' }, amount: 3 } },
    ],
  },
  {
    id: 'firebrand',
    name: 'Firebrand',
    race: 'orc',
    rarity: 'uncommon',
    value: 6,
    text: 'Round end: 1 in 4 chance to blow up. When destroyed: +{10} gold.',
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
    value: 4,
    text: 'On land: flips every adjacent coin.',
    effects: [{ trigger: 'onLand', do: { kind: 'flip', target: { scope: 'adjacent' } } }],
  },
  {
    id: 'looter',
    name: 'Looter',
    race: 'orc',
    rarity: 'common',
    value: 2,
    text: 'Whenever any coin on the table is destroyed: +{2} value permanently.',
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
    text: 'Whenever this coin is flipped: +{3} value permanently.',
    effects: [
      { trigger: 'onFlip', do: { kind: 'buff', target: { scope: 'self' }, amount: 3, permanent: true } },
    ],
  },
  {
    id: 'warlord',
    name: 'Warlord',
    race: 'orc',
    rarity: 'rare',
    value: 4,
    text: 'Round end: +{3} value for each other Orc on the table.',
    effects: [
      {
        trigger: 'onRoundEnd',
        do: { kind: 'buff', target: { scope: 'self' }, amount: 3, per: { count: { scope: 'table', race: 'orc' } } },
      },
    ],
  },

  // Cross-race, tails and set-bonus Orcs.
  {
    id: 'cutpurse',
    name: 'Cutpurse',
    race: 'orc',
    rarity: 'common',
    value: 2,
    text: 'Tails: +{6} gold.',
    effects: [{ trigger: 'onRoundEnd', when: 'tails', do: { kind: 'gold', amount: 6 } }],
  },
  {
    id: 'raider',
    name: 'Night Raider',
    race: 'orc',
    rarity: 'uncommon',
    value: 2,
    text: 'Round end: +{2} gold for each tails coin on the table (itself included).',
    effects: [
      { trigger: 'onRoundEnd', do: { kind: 'gold', amount: 2, per: { count: { scope: 'table', face: 'tails', includeSelf: true } } } },
    ],
  },
  {
    id: 'mercenary',
    name: 'Mercenary',
    race: 'orc',
    rarity: 'common',
    value: 3,
    text: 'Round end: +{2} gold for each Human on the table.',
    effects: [
      { trigger: 'onRoundEnd', do: { kind: 'gold', amount: 2, per: { count: { scope: 'table', race: 'human' } } } },
    ],
  },
  {
    id: 'powderkeg',
    name: 'Powder Keg',
    race: 'orc',
    rarity: 'uncommon',
    value: 2,
    text: 'When destroyed: +{8} gold and flips every adjacent coin.',
    effects: [
      { trigger: 'onDestroy', do: { kind: 'gold', amount: 8 } },
      { trigger: 'onDestroy', do: { kind: 'flip', target: { scope: 'adjacent' } } },
    ],
  },
  {
    id: 'wardrummer',
    name: 'War Drummer',
    race: 'orc',
    rarity: 'uncommon',
    value: 2,
    text: 'Round end: if 3 or more Orcs are on the table, every Orc gets +{3} value.',
    effects: [
      {
        trigger: 'onRoundEnd',
        require: { per: { count: { scope: 'table', race: 'orc', includeSelf: true } }, min: 3 },
        do: { kind: 'buff', target: { scope: 'table', race: 'orc', includeSelf: true }, amount: 3 },
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
    text: 'Heads: +{3} value to the highest-value other heads coin on the table.',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'buff', target: { scope: 'table', face: 'heads', pick: 'highest' }, amount: 3 },
      },
    ],
  },
  {
    id: 'moonpriestess',
    name: 'Moon Priestess',
    race: 'elf',
    rarity: 'uncommon',
    value: 1,
    text: 'Round end: re-flips the {2} highest-value tails coins.',
    effects: [
      {
        trigger: 'onRoundEnd',
        do: { kind: 'reflip', target: { scope: 'table', face: 'tails', pick: 'highest', includeSelf: true }, amount: 2 },
      },
    ],
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    race: 'elf',
    rarity: 'common',
    value: 3,
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
    text: 'Round end: heads grows it permanently by its heads streak (+{1}, +{2}, +{3}…). Tails loses all streak growth.',
    effects: [{ trigger: 'onRoundEnd', do: { kind: 'streak', amount: 1 } }],
  },
  {
    id: 'ranger',
    name: 'Ranger',
    race: 'elf',
    rarity: 'common',
    value: 2,
    text: 'Heads: every other heads Elf on the table gets +{3} value this round.',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'buff', target: { scope: 'table', race: 'elf', face: 'heads' }, amount: 3 },
      },
    ],
  },
  {
    id: 'seer',
    name: 'Seer',
    race: 'elf',
    rarity: 'common',
    value: 1,
    text: 'On land: the next {2} coins tossed land heads.',
    effects: [{ trigger: 'onLand', do: { kind: 'blessNext', amount: 2 } }],
  },
  {
    id: 'longbow',
    name: 'Longbow',
    race: 'elf',
    rarity: 'uncommon',
    value: 2,
    text: 'Heads: +{5} value to the farthest heads coin.',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'buff', target: { scope: 'farthest', face: 'heads' }, amount: 5 },
      },
    ],
  },
  {
    id: 'druid',
    name: 'Druid',
    race: 'elf',
    rarity: 'common',
    value: 2,
    text: 'Heads: the lowest-value other coin on the table gains +{2} value permanently.',
    effects: [
      {
        trigger: 'onRoundEnd',
        when: 'heads',
        do: { kind: 'buff', target: { scope: 'table', pick: 'lowest' }, amount: 2, permanent: true },
      },
    ],
  },
  {
    id: 'starweaver',
    name: 'Starweaver',
    race: 'elf',
    rarity: 'rare',
    value: 3,
    text: 'Round end: re-flips every tails coin on the table.',
    effects: [
      {
        trigger: 'onRoundEnd',
        noScale: true,
        do: { kind: 'reflip', target: { scope: 'table', face: 'tails', includeSelf: true } },
      },
    ],
  },
  // Cross-race, control and set-bonus Elves.
  {
    id: 'envoy',
    name: 'Envoy',
    race: 'elf',
    rarity: 'rare',
    value: 2,
    text: 'Round end: if Humans, Orcs and Elves are all on the table, every heads coin gets +{3} value.',
    effects: [
      {
        trigger: 'onRoundEnd',
        require: { per: { races: { scope: 'table', includeSelf: true } }, min: 3 },
        do: { kind: 'buff', target: { scope: 'table', face: 'heads', includeSelf: true }, amount: 3 },
      },
    ],
  },
  {
    id: 'wisp',
    name: 'Wisp',
    race: 'elf',
    rarity: 'common',
    value: 2,
    text: 'On land: turns the highest-value adjacent tails coin to heads.',
    effects: [{ trigger: 'onLand', do: { kind: 'setHeads', target: { scope: 'adjacent', face: 'tails', pick: 'highest' } } }],
  },
  {
    id: 'grovelder',
    name: 'Grove Elder',
    race: 'elf',
    rarity: 'rare',
    value: 3,
    text: 'Round end: if 3 or more heads Elves are on the table, they all get ×2 value.',
    effects: [
      {
        trigger: 'onRoundEnd',
        require: { per: { count: { scope: 'table', race: 'elf', face: 'heads', includeSelf: true } }, min: 3 },
        do: { kind: 'mult', target: { scope: 'table', race: 'elf', face: 'heads', includeSelf: true }, factor: 2 },
      },
    ],
  },
];

/** Rules text for a coin at a fusion level, with {n} numbers multiplied by the level. */
export function abilityText(def: CoinDef, level = 1): string {
  return def.text.replace(/\{(\d+)\}/g, (_, n: string) => String(Number(n) * level));
}

export const COIN_MAP: Record<string, CoinDef> = Object.fromEntries(COINS.map((c) => [c.id, c]));

export function coinDef(id: string): CoinDef {
  const d = COIN_MAP[id];
  if (!d) throw new Error(`Unknown coin ${id}`);
  return d;
}
