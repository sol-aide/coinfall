import type { CharmDef } from '../types';

export const CHARMS: CharmDef[] = [
  // ------------------------------------------------ Starter race charms
  {
    id: 'banner',
    name: 'Commons Banner',
    rarity: 'starter',
    race: 'human',
    starter: true,
    text: 'Humans get +1 value.',
    mods: { valueBonus: { human: 1 } },
  },
  {
    id: 'warhorn',
    name: 'Tusk Warhorn',
    rarity: 'starter',
    race: 'orc',
    starter: true,
    text: 'Orcs get +1 value. +2 gold whenever a coin is destroyed.',
    mods: { valueBonus: { orc: 1 } },
    effects: [{ trigger: 'onDestroy', noScale: true, do: { kind: 'gold', amount: 2 } }],
  },
  {
    id: 'silverleaf',
    name: 'Silverleaf Brooch',
    rarity: 'starter',
    race: 'elf',
    starter: true,
    text: 'Elves land heads 65% of the time.',
    mods: { headsBonus: { elf: 0.15 } },
  },

  // ------------------------------------------------ Shop charms
  {
    id: 'clover',
    name: 'Four-Leaf Pin',
    rarity: 'uncommon',
    text: 'All coins are 6% more likely to land heads.',
    mods: { headsBonus: { all: 0.06 } },
  },
  {
    id: 'pockets',
    name: 'Deep Pockets',
    rarity: 'rare',
    text: 'Draw 1 extra coin every round.',
    mods: { drawBonus: 1 },
  },
  {
    id: 'ledger',
    name: 'Interest Ledger',
    rarity: 'uncommon',
    text: 'Phase end: +1 gold for every 10 gold you hold (up to +6).',
    effects: [{ trigger: 'onPhaseEnd', noScale: true, do: { kind: 'interest', per: 10, max: 6 } }],
  },
  {
    id: 'haggler',
    name: "Haggler's Tongue",
    rarity: 'common',
    text: 'Shop prices are 25% lower.',
    mods: { shopDiscount: 0.25 },
  },
  {
    id: 'whirlwind',
    name: 'Whirlwind Feather',
    rarity: 'common',
    text: '+1 gold whenever a coin on the table flips.',
    effects: [{ trigger: 'onFlip', noScale: true, do: { kind: 'gold', amount: 1 } }],
  },
  {
    id: 'spade',
    name: "Gravedigger's Spade",
    rarity: 'common',
    text: '+3 gold whenever a coin on the table is destroyed.',
    effects: [{ trigger: 'onDestroy', noScale: true, do: { kind: 'gold', amount: 3 } }],
  },
  {
    id: 'scales',
    name: 'Golden Scales',
    rarity: 'rare',
    text: 'Guild dues are 15% lower.',
    mods: { duesMult: -0.15 },
  },
  {
    id: 'longtable',
    name: 'Long Table',
    rarity: 'uncommon',
    text: 'Coins count as adjacent from 30% farther away.',
    mods: { radiusMult: 0.3 },
  },
  {
    id: 'collector',
    name: "Collector's Case",
    rarity: 'common',
    text: 'Coin rewards offer 4 choices instead of 3.',
    mods: { rewardChoices: 1 },
  },
  {
    id: 'crown',
    name: 'Copper Crown',
    rarity: 'common',
    text: 'Copper coins get +3 value.',
    mods: { coinValueBonus: { copper: 3 } },
  },
  {
    id: 'crucible',
    name: 'Crucible',
    rarity: 'common',
    text: 'Gain 1 extra Melt token every phase.',
    mods: { meltPerPhase: 1 },
  },
  {
    id: 'dice',
    name: 'Bone Knucklebones',
    rarity: 'common',
    text: 'Gain 2 extra Reroll tokens every phase. Shop rerolls cost 1 less.',
    mods: { rerollPerPhase: 2, rerollDiscount: 1 },
  },
  {
    id: 'tailwind',
    name: 'Tailwind Sash',
    rarity: 'uncommon',
    text: 'Tails coins score 1 gold each.',
    mods: { tailsGold: 1 },
  },
  {
    id: 'firstlight',
    name: 'First Light',
    rarity: 'uncommon',
    text: 'The first coin tossed each round always lands heads.',
    mods: { firstCoinHeads: true },
  },
  {
    id: 'charter',
    name: 'Guild Charter',
    rarity: 'uncommon',
    text: 'Round end: +1 gold for each heads Human on the table.',
    effects: [
      {
        trigger: 'onRoundEnd',
        noScale: true,
        do: { kind: 'gold', amount: 1, per: { count: { scope: 'table', race: 'human', face: 'heads', includeSelf: true } } },
      },
    ],
  },
  {
    id: 'skullcup',
    name: 'Skull Cup',
    rarity: 'uncommon',
    text: 'Orcs get +2 value.',
    mods: { valueBonus: { orc: 2 } },
  },
  {
    id: 'moonwell',
    name: 'Moonwell Vial',
    rarity: 'uncommon',
    text: 'Elves get +1 value and are 5% more likely to land heads.',
    mods: { valueBonus: { elf: 1 }, headsBonus: { elf: 0.05 } },
  },
  {
    id: 'lantern',
    name: "Seeker's Lantern",
    rarity: 'common',
    text: 'Rare coins show up much more often.',
    mods: { rareBoost: 2 },
  },
  {
    id: 'anvil',
    name: 'Tiny Anvil',
    rarity: 'rare',
    text: 'Phase start: a random coin in your bag gains +2 value permanently.',
    effects: [{ trigger: 'onPhaseStart', noScale: true, do: { kind: 'buff', target: { scope: 'table', pick: 'random' }, amount: 2, permanent: true } }],
  },
];

export const CHARM_MAP: Record<string, CharmDef> = Object.fromEntries(CHARMS.map((c) => [c.id, c]));

export function charmDef(id: string): CharmDef {
  const d = CHARM_MAP[id];
  if (!d) throw new Error(`Unknown charm ${id}`);
  return d;
}

export const STARTER_CHARMS = CHARMS.filter((c) => c.starter).map((c) => c.id);
