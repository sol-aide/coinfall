import { COINS, coinDef } from '../../../engine';
import { newInstance } from '../../../engine/economy';
import { newRun } from '../../../engine/run';
import { bagFitNote, bagTagSummary, partnerNote, synergyPartners, synergyTags } from '../tags';

const labels = (id: string) => synergyTags(coinDef(id)).map((t) => t.label);

describe('synergy tags', () => {
  it('are derived from the rules data', () => {
    expect(labels('towncrier')).toEqual(['Set: 3 Humans', 'Gold']);
    expect(labels('grovelder')).toEqual(['Set: 3 Elves', '×2']);
    expect(labels('caravan')).toEqual(['Mixed table', 'Gold']);
    expect(labels('mercenary')).toEqual(['Counts Humans', 'Gold']);
    expect(labels('cutpurse')).toEqual(['Tails', 'Gold']);
    expect(labels('wisp')).toEqual(['Heads control']);
    expect(labels('juggler')).toEqual(['Flips', 'Heads control', 'Gold']);
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

describe('synergy partners', () => {
  const run = newRun(2);
  run.bag = ['copper', 'squire', 'grunt', 'archer', 'wrecker', 'berserker'].map((id) => newInstance(run, id));

  it('pair flip makers with flip and tails payoffs, destroyers with wreckage', () => {
    expect(synergyPartners(coinDef('cutpurse'), run)).toEqual(['Wrecker']);
    expect(synergyPartners(coinDef('brawler'), run)).toEqual(['Wrecker']);
    expect(synergyPartners(coinDef('looter'), run)).toEqual(['Berserker']);
  });

  it('pair race payoffs with that race, both ways, and never list plain Copper', () => {
    expect(synergyPartners(coinDef('mercenary'), run)).toEqual(['Squire']);
    expect(synergyPartners(coinDef('warlord'), run)).toEqual(['Berserker', 'Grunt', 'Wrecker']);
    expect(synergyPartners(coinDef('moneychanger'), run)).toEqual(['Squire']); // Squire counts Humans
    expect(synergyPartners(coinDef('caravan'), run)).not.toContain('Copper');
  });

  it('shorten long lists', () => {
    expect(partnerNote(coinDef('warlord'), run)).toBe('Works with: Berserker, Grunt +1 more');
    expect(partnerNote(coinDef('sentinel'), run)).toBeUndefined();
  });
});

describe('charm tags', () => {
  it('read effects and static modifiers', () => {
    const { CHARMS } = require('../../../engine') as typeof import('../../../engine');
    const { charmTags } = require('../tags') as typeof import('../tags');
    const tags = (id: string) => charmTags(CHARMS.find((c) => c.id === id)!).map((t) => t.label);
    expect(tags('rallyhorn')).toEqual(['Set bonuses']);
    expect(tags('loupe')).toEqual(['×2']);
    expect(tags('skullcup')).toEqual(['Orcs', 'Boosts others']);
    expect(tags('treaty')).toEqual(['Mixed table', 'Gold']);
    expect(tags('haggler')).toEqual([]);
  });
});
