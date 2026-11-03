import { COINS, coinDef } from '../../../engine';
import { newInstance } from '../../../engine/economy';
import { newRun } from '../../../engine/run';
import { bagFitNote, bagTagSummary, synergyTags } from '../tags';

const labels = (id: string) => synergyTags(coinDef(id)).map((t) => t.label);

describe('synergy tags', () => {
  it('are derived from the rules data', () => {
    expect(labels('towncrier')).toEqual(['Set: 3 Humans', 'Gold']);
    expect(labels('grovelder')).toEqual(['Set: 3 Elves', '×2']);
    expect(labels('caravan')).toEqual(['Mixed table', 'Gold']);
    expect(labels('mercenary')).toEqual(['Counts Humans', 'Gold']);
    expect(labels('cutpurse')).toEqual(['Tails', 'Gold']);
    expect(labels('wisp')).toEqual(['Heads control']);
    expect(labels('powderkeg')).toEqual(['Flips', 'Wreckage', 'Gold']);
    expect(labels('copper')).toEqual([]);
  });

  it('give almost every coin with an ability at least one tag', () => {
    const untagged = COINS.filter((c) => c.effects.length > 0 && synergyTags(c).length === 0).map((c) => c.id);
    expect(untagged).toEqual([]);
  });

  it('summarise the bag and how an offer fits it', () => {
    const run = newRun(1);
    run.bag = ['squire', 'merchant', 'moneychanger', 'grunt', 'wrecker', 'charger'].map((id) => newInstance(run, id));
    expect(bagFitNote(coinDef('towncrier'), run)).toBe('Your bag: 3 Humans');
    expect(bagFitNote(coinDef('envoy'), run)).toBe('Your bag: 2 of 3 races');
    expect(bagFitNote(coinDef('archer'), run)).toBeUndefined();
    expect(bagTagSummary(run)).toEqual([
      { label: 'Flips', count: 2 },
      { label: 'Gold', count: 2 },
    ]);
  });
});
