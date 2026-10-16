import type { EngravingDef } from '../types';

export const ENGRAVINGS: EngravingDef[] = [
  { id: 'double', name: 'Double', rarity: 'rare', text: 'This coin’s value is doubled.', mult: 2 },
  { id: 'echo', name: 'Echo', rarity: 'uncommon', text: 'This coin’s ability triggers twice.', echo: true },
  { id: 'lucky', name: 'Lucky', rarity: 'common', text: 'Lands heads 65% of the time.', headsChance: 0.65 },
  {
    id: 'secondwind',
    name: 'Second Wind',
    rarity: 'common',
    text: 'The first time this coin is destroyed, it returns to your bag.',
    secondWind: true,
  },
  {
    id: 'growth',
    name: 'Growth',
    rarity: 'uncommon',
    text: 'Round end: heads gives +1 value permanently.',
    effects: [
      { trigger: 'onRoundEnd', when: 'heads', noScale: true, do: { kind: 'buff', target: { scope: 'self' }, amount: 1, permanent: true } },
    ],
  },
  {
    id: 'gilded',
    name: 'Gilded',
    rarity: 'common',
    text: 'Heads: +2 gold.',
    effects: [{ trigger: 'onRoundEnd', when: 'heads', noScale: true, do: { kind: 'gold', amount: 2 } }],
  },
  { id: 'ironclad', name: 'Ironclad', rarity: 'common', text: 'This coin can’t be destroyed.', sturdy: true },
  { id: 'weighted', name: 'Weighted', rarity: 'uncommon', text: 'Tails still scores half its value.', tailsFraction: 0.5 },
];

export const ENGRAVING_MAP: Record<string, EngravingDef> = Object.fromEntries(ENGRAVINGS.map((e) => [e.id, e]));

export function engravingDef(id: string): EngravingDef {
  const d = ENGRAVING_MAP[id];
  if (!d) throw new Error(`Unknown engraving ${id}`);
  return d;
}
