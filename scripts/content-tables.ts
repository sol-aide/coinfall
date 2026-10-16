// Prints Markdown tables of all content, for DESIGN.md.
// Usage: npx tsx scripts/content-tables.ts
import { CHARMS } from '../src/engine/content/charms';
import { COINS, abilityText } from '../src/engine/content/coins';
import { ENGRAVINGS } from '../src/engine/content/engravings';

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
for (const race of ['neutral', 'human', 'orc', 'elf'] as const) {
  console.log(`\n**${race === 'neutral' ? 'Plain' : cap(race) + 's'}**\n`);
  console.log('| Coin | Rarity | Value | Ability | Triggers |');
  console.log('|---|---|---|---|---|');
  for (const c of COINS.filter((x) => x.race === race))
    console.log(`| ${c.name} | ${c.rarity} | ${c.value} | ${abilityText(c)} | ${[...new Set(c.effects.map((e) => e.trigger))].join(', ') || (c.headsChance ? 'static' : '—')} |`);
}
console.log('\n**Charms**\n\n| Charm | Rarity | Effect |\n|---|---|---|');
for (const c of CHARMS) console.log(`| ${c.name} | ${c.starter ? 'starter' : c.rarity} | ${c.text} |`);
console.log('\n**Engravings**\n\n| Engraving | Rarity | Effect |\n|---|---|---|');
for (const e of ENGRAVINGS) console.log(`| ${e.name} | ${e.rarity} | ${e.text} |`);
