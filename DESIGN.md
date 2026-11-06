# Coinfall — Design

Coinfall is an original roguelike coin-toss bag builder. You are a moneylender at a crossroads bazaar where Humans, Orcs and Elves gamble. The Lenders' Guild demands dues at the end of every phase: pay, or lose the run.

## Rules

### Run structure
- A run is **8 phases** of **5 rounds**. After the 5th round of a phase the Guild collects **dues**. If your gold is short, the run is lost. Paying the 8th phase's dues wins the run.
- Dues per phase: **26, 47, 100, 195, 345, 515, 725, 970** gold (Golden Scales lowers them by 15%).
- A run starts with **0 gold**, **1 Reroll token** and the starting bag: **5 Copper, 1 Squire (Human), 1 Grunt (Orc), 1 Archer (Elf)**.
- Before the first round you choose one of three **starting race Charms** (Commons Banner, Tusk Warhorn, Silverleaf Brooch).

### Daily bazaar
- The title screen's **Daily** button starts a run seeded from the local date: everyone playing on the same day gets the same starters, offers and tosses, and a retry replays it exactly. The title shows the day's best result ("Best: phase 5", "Won today!") and the end screen offers **Retry daily**. Only the latest day is kept in the records; there is no network or leaderboard.

### Guild ranks
- Winning a run opens the next **Guild rank** (up to 5), chosen on the patron screen. Each rank adds to the ones below: **2** dues +4%; **3** bazaar prices +10%; **4** dues +9% in total; **5** coins 2% less likely to land heads. Daily bazaar runs are always rank 1.

### A round
1. **Draw**: coins are drawn at random from the bag into your **hand**: **5, 5, 6, 7, 8, 9, 10, 10** by phase (+1 with Deep Pockets, never more than **10** or than the bag holds), shown before the toss. The whole bag is available every round.
   - **Swap**: tap a coin in the hand and Swap to put it back and draw a different kind of coin from the rest of the bag (the same kind only if nothing else is left). The first swap each round is free (two with the Spare Purse Charm); each further swap costs a Reroll token. The hand is tossed left to right; **First** moves the selected coin to the front (free), which matters for coins like Seer that bless the coins tossed after them.
2. **Round start** abilities fire (coins in hand, then Charms).
3. **Toss**: coins land one by one at random, non-overlapping spots on the table. Each lands heads with 50% (modified by Charms, Engravings and abilities). *On land* abilities fire immediately as each coin lands, so landing order matters.
4. **Adjacency**: each coin, in landing order, resolves its adjacency abilities. Coins are adjacent when their centres are within 0.4 table-widths (Long Table: +30%). The table shows adjacency as dashed lines.
5. **Round end**: each coin's round-end abilities resolve in landing order, then Charms.
6. **Scoring**: every heads coin pays its current value in gold. Tails coins pay nothing unless an ability, Engraving (Weighted) or Charm (Tailwind Sash) says otherwise. Ability gold is added to the round total. The round shows a full breakdown.
- **Reactive triggers**: *On flip* fires whenever a coin on the table changes face after landing; *On destroy* fires when a coin is destroyed. A coin's own reactive effects fire first, then other coins' "whenever any coin…" effects, then Charms.
- **Destroyed coins** leave the bag for good (Second Wind brings a coin back once; Ironclad coins can't be destroyed). The bag never drops below **5 coins**: at 5, coins hold firm.
- **Phase start / Phase end** abilities fire from the bag (the coin doesn't need to be drawn).

### Values
- Coin value = (base value × level) + permanent growth + Charm bonuses + this round's temporary buffs, then × Double (Engraving). Values never go below 0.
- "This round" buffs vanish after scoring; "permanently" changes stay with the coin for the rest of the run.

### After each round
- Choose **1 of 3** new coins (4 with Collector's Case) to add to your bag, or **skip for 3 gold**. A Reroll token re-rolls the choices.
- Offers (rewards and bazaar coins) are weighted by rarity, and a coin you already own below level 3 is **2.5× as likely** to be offered, so fusions and focused builds stay reachable.
- **Fusion**: three identical coins of the same level automatically fuse into one coin a level higher (max level 3). A level-*n* coin has *n*× base value and *n*× ability numbers (chances and "all tails" style effects don't scale). Fused coins keep the sum of their parts' permanent growth (minus streak growth) and the first engraving found. Plain Copper never fuses.

### Phase end, dues and the bazaar
- At phase end you gain **1 Melt token** and **1 Reroll token** (Crucible / Bone Knucklebones add more), and phase-end abilities pay out.
- After paying dues you visit the **bazaar**: 3 coins, 2 Charms, 2 Engravings and a Melt token are for sale. Prices rise 8% per phase. Rerolling the stock costs **2, 4, 6, 8…** gold within one visit (resets next visit), or one Reroll token.
- **Charms** are permanent run-wide passives; you can hold **6** (including the starting Charm).
- **Engravings** attach to one coin; a coin holds one engraving and a new one replaces the old.
- **Melt tokens** remove any coin from the bag (minimum bag size 5). They can be used in the bazaar.

### Prices
| Item | Common | Uncommon | Rare |
|---|---|---|---|
| Coin | 5 | 8 | 12 |
| Charm | 8 | 11 | 15 |
| Engraving | 6 | 9 | 12 |
| Melt token | 4 | | |

Base prices × (1 + 0.08 × (phase − 1)) × (1 − Haggler discount), rounded.

## Races

- **Humans — economy and teamwork.** Direct gold (Merchant, Moneychanger, Guildmaster, Innkeeper, Tinker), buffs for other Humans (Squire, Captain, Patron), copying and retriggering neighbours (Bard, Apprentice).
- **Orcs — big values and chaos.** High base values (Grunt, Firebrand, Warlord), smashing neighbours to absorb their value (Berserker), ramming and flipping (Charger, Wrecker), growth from chaos (Looter, Brawler) and risky self-destruction (Firebrand).
- **Elves — precision and control.** Forced heads (Sentinel, Seer), re-flipping tails (Moon Priestess, Starweaver), long-range buffs (Archer, Longbow, Ranger), streaks and growth (Bladedancer, Druid), turning neighbours heads (Wisp), and a heads-Elf set bonus (Grove Elder).

The Humans also gain a flip payoff (Juggler), a Human set bonus (Town Crier), a ×2 finisher (Gem Cutter) and a mixed-table coin (Caravan Master). The Orcs gain tails payoffs (Cutpurse, Night Raider), a Human-paid sellsword (Mercenary), destruction fodder (Powder Keg) and an Orc set bonus (War Drummer). The Elves' Envoy rewards fielding all three races.

## Synergies

Most strong builds pair two races, or lean on one of these cross-cutting engines (milestone 7). None of them is locked to a race.

| Engine | Enablers | Payoffs |
|---|---|---|
| **Flip chaos** | Charger, Wrecker, Powder Keg (when destroyed), Moon Priestess/Starweaver re-flips | Brawler (grows per flip), Juggler (+gold per flip), Whirlwind Feather, Spinning Top (+1 value to each coin that flips); the Spiked engraving passes flips on |
| **Tails market** | Wrecker and Charger turn heads to tails; low-heads coins | Cutpurse (tails +6), Night Raider (per tails coin), Tailwind Sash, Weighted engraving; Two-Faced lets a heads- or tails-only coin pay on either face |
| **Heads control** | Sentinel, Seer, Wisp, Moon Priestess, Starweaver, First Light, Silverleaf Brooch | Guildmaster, Ranger, Archer, Longbow, Grove Elder, Gem Cutter |
| **Wreckage** | Berserker, Firebrand | Looter, Powder Keg, Gravedigger's Spade, Tusk Warhorn, Hollow engraving (+5 gold when destroyed) |
| **Set bonuses** (3+ of a race on the table) | Race Charms (Commons Banner, Skull Cup, Moonwell Vial), extra draws (Deep Pockets), Rally Horn (sets need 2), Kinship engraving (counts as every race) | Town Crier (3+ Humans), War Drummer (3+ Orcs), Grove Elder (3+ heads Elves: ×2) |
| **Mixed table** (all three races) | A bag that holds every race, Kinship engraving | Caravan Master (per race), Envoy (+3 to heads coins), Treaty Seal, Mercenary (Orc paid per Human) |
| **Multipliers** | Big coins: Warlord, Berserker, buffed Squires | Gem Cutter (×2 the best adjacent heads coin), Grove Elder; Bard can retrigger either for ×4; Jeweler's Loupe makes every ×2 a ×3 |
| **Swapping** | Free swaps, Spare Purse, Reroll tokens (Quartermaster, Bone Knucklebones), the Anchored engraving (a chosen coin is always in the hand) | Vagabond (grows when swapped out), Scrounger (+gold per swap) |

The two engines that pull against each other are deliberate: **tails market** wants coins to land tails, **heads control** wants them heads, and Wrecker feeds one while starving the other.

## Content

All content is data in `src/engine/content/`, built from effect building blocks keyed by trigger (see CLAUDE.md). Tables below are generated by `npx tsx scripts/content-tables.ts`.

**Plain**

| Coin | Rarity | Value | Ability | Triggers |
|---|---|---|---|---|
| Copper | starter | 2 | A plain coin. No ability. | — |

**Humans**

| Coin | Rarity | Value | Ability | Triggers |
|---|---|---|---|---|
| Squire | common | 2 | Round end: +2 value for each other Human on the table. | onRoundEnd |
| Merchant | common | 2 | Heads: +2 gold for each adjacent coin. | onAdjacent |
| Moneychanger | common | 2 | Heads: +4 gold. | onRoundEnd |
| Captain | uncommon | 2 | Adjacent Humans get +4 value this round. | onAdjacent |
| Bard | uncommon | 2 | Retrigger the ability of the best adjacent coin. | onAdjacent |
| Apprentice | uncommon | 2 | Copies the ability of the nearest coin that has one. | onAdjacent |
| Patron | common | 2 | Heads: every other Human on the table gains +1 value permanently. | onRoundEnd |
| Innkeeper | uncommon | 2 | Phase end: +6 gold, even from the bag. | onPhaseEnd |
| Tinker | common | 2 | Phase end: +1 gold for each Human in your bag, even from the bag. | onPhaseEnd |
| Guildmaster | rare | 2 | Heads: +3 gold for each heads Human on the table (itself included). | onRoundEnd |
| Caravan Master | uncommon | 2 | Round end: +2 gold for each race on the table (Humans, Orcs, Elves). | onRoundEnd |
| Juggler | common | 2 | On land: flips an adjacent tails coin to heads. Whenever another coin on the table flips: +2 gold. | onLand, onFlip |
| Town Crier | uncommon | 2 | Round end: if 3 or more Humans are on the table, +8 gold. | onRoundEnd |
| Gem Cutter | rare | 2 | Round end: doubles the value of the highest-value adjacent heads coin. | onRoundEnd |
| Herald | uncommon | 2 | Round start: every Human drawn this round gets +2 value (itself included). | onRoundStart |
| Quartermaster | common | 2 | Phase end: +1 Reroll token and +1 Melt token, even from the bag. | onPhaseEnd |
| Vagabond | common | 2 | Whenever you swap this coin out of your hand: +3 value permanently. | onSwap |

**Orcs**

| Coin | Rarity | Value | Ability | Triggers |
|---|---|---|---|---|
| Grunt | common | 4 | No ability. Just heavy. | — |
| Berserker | uncommon | 3 | Destroys the lowest-value adjacent coin and permanently gains half its value. | onAdjacent |
| Charger | common | 4 | On land: rams the nearest coin, pushing it away and flipping it. | onLand |
| Shaman | common | 2 | Adjacent Orcs get +3 value this round. | onAdjacent |
| Firebrand | uncommon | 6 | Round end: 1 in 5 chance to blow up. When destroyed: +12 gold. | onRoundEnd, onDestroy |
| Wrecker | common | 4 | On land: flips every adjacent coin. | onLand |
| Looter | common | 2 | Whenever any coin on the table is destroyed: +2 value permanently. | onDestroy |
| Brawler | common | 2 | Whenever this coin is flipped: +3 value permanently. | onFlip |
| Warlord | rare | 4 | Round end: +3 value for each other Orc on the table. | onRoundEnd |
| Cutpurse | common | 2 | Tails: +6 gold. | onRoundEnd |
| Night Raider | uncommon | 2 | Round end: +2 gold for each tails coin on the table (itself included). | onRoundEnd |
| Mercenary | common | 3 | Round end: +2 gold for each Human on the table. | onRoundEnd |
| Powder Keg | uncommon | 2 | When destroyed: +8 gold and flips every adjacent coin. | onDestroy |
| War Drummer | uncommon | 2 | Round end: if 3 or more Orcs are on the table, every Orc gets +3 value. | onRoundEnd |
| Bonebreaker | uncommon | 3 | Round end: destroys the lowest-value tails coin on the table. | onRoundEnd |
| Warg Rider | common | 3 | On land: rams the farthest tails coin, pushing it away and flipping it to heads. | onLand |
| Scrounger | common | 3 | Whenever you swap any other coin out of your hand: +1 gold, even from the bag. | onSwap |

**Elfs**

| Coin | Rarity | Value | Ability | Triggers |
|---|---|---|---|---|
| Archer | common | 2 | Heads: +3 value to the highest-value other heads coin on the table. | onRoundEnd |
| Moon Priestess | uncommon | 1 | Round end: re-flips the 2 highest-value tails coins. | onRoundEnd |
| Sentinel | common | 3 | Always lands heads. | static |
| Bladedancer | uncommon | 2 | Round end: heads grows it permanently by its heads streak (+1, +2, +3…). Tails loses all streak growth. | onRoundEnd |
| Ranger | common | 2 | Heads: every other heads Elf on the table gets +3 value this round. | onRoundEnd |
| Seer | common | 1 | On land: the next 2 coins tossed land heads. | onLand |
| Longbow | uncommon | 2 | Heads: +5 value to the farthest heads coin. | onRoundEnd |
| Druid | common | 2 | Heads: the lowest-value other coin on the table gains +2 value permanently. | onRoundEnd |
| Starweaver | rare | 3 | Round end: re-flips every tails coin on the table. | onRoundEnd |
| Envoy | rare | 2 | Round end: if Humans, Orcs and Elves are all on the table, every heads coin gets +3 value. | onRoundEnd |
| Wisp | common | 3 | On land: turns the highest-value adjacent tails coin to heads. | onLand |
| Grove Elder | rare | 3 | Round end: if 3 or more heads Elves are on the table, they all get ×2 value. | onRoundEnd |
| Lorekeeper | uncommon | 2 | Round start: the first 2 coins tossed land heads. | onRoundStart |
| Glade Warden | common | 2 | Adjacent heads coins get +3 value this round. | onAdjacent |

**Charms**

| Charm | Rarity | Effect |
|---|---|---|
| Commons Banner | starter | Humans get +1 value and are 2% more likely to land heads. |
| Tusk Warhorn | starter | Orcs get +7 value. +1 gold whenever a coin is destroyed. |
| Silverleaf Brooch | starter | Elves land heads 68% of the time. |
| Four-Leaf Pin | uncommon | All coins are 6% more likely to land heads. |
| Deep Pockets | rare | Draw 1 extra coin every round. |
| Interest Ledger | uncommon | Phase end: +1 gold for every 10 gold you hold (up to +6). |
| Haggler's Tongue | common | Shop prices are 25% lower. |
| Whirlwind Feather | common | +1 gold whenever a coin on the table flips. |
| Gravedigger's Spade | common | +3 gold whenever a coin on the table is destroyed. |
| Golden Scales | rare | Guild dues are 15% lower. |
| Long Table | uncommon | Coins count as adjacent from 30% farther away. |
| Collector's Case | common | Coin rewards offer 4 choices instead of 3. |
| Copper Crown | common | Copper coins get +3 value. |
| Crucible | common | Gain 1 extra Melt token every phase. |
| Bone Knucklebones | common | Gain 2 extra Reroll tokens every phase. Shop rerolls cost 1 less. |
| Tailwind Sash | uncommon | Tails coins score 1 gold each. |
| First Light | uncommon | The first coin tossed each round always lands heads. |
| Guild Charter | uncommon | Round end: +1 gold for each heads Human on the table. |
| Treaty Seal | uncommon | Round end: +5 gold if Humans, Orcs and Elves are all on the table. |
| Rally Horn | rare | Set bonuses need one coin fewer (2 Humans, 2 Orcs or 2 heads Elves instead of 3). |
| Jeweler's Loupe | rare | Multipliers are one higher: ×2 becomes ×3. |
| Spinning Top | uncommon | Whenever a coin on the table flips, it gets +1 value this round. |
| Spare Purse | uncommon | One extra free swap in your hand every round. |
| Skull Cup | uncommon | Orcs get +2 value. |
| Moonwell Vial | uncommon | Elves get +1 value and are 5% more likely to land heads. |
| Seeker's Lantern | common | Rare coins show up much more often. |
| Tiny Anvil | rare | Phase start: a random coin in your bag gains +2 value permanently. |

**Engravings**

| Engraving | Rarity | Effect |
|---|---|---|
| Double | rare | This coin’s value is doubled. |
| Echo | uncommon | This coin’s ability triggers twice. |
| Lucky | common | Lands heads 65% of the time. |
| Second Wind | common | The first time this coin is destroyed, it returns to your bag. |
| Growth | uncommon | Round end: heads gives +1 value permanently. |
| Gilded | common | Heads: +2 gold. |
| Ironclad | common | This coin can’t be destroyed. |
| Kinship | rare | Counts as a Human, an Orc and an Elf for every ability that looks at races. |
| Two-Faced | rare | This coin’s “Heads:” and “Tails:” abilities work on either face. |
| Spiked | uncommon | Whenever this coin flips, it flips a random adjacent coin too. |
| Hollow | common | When this coin is destroyed: +5 gold. |
| Anchored | rare | This coin is always drawn into your hand (you can still swap it out). |
| Weighted | uncommon | Tails still scores half its value. |

## Balance

Balance is tuned with `npm run simulate -- 1000 --detail`, which plays 1,000 seeded runs for each of three bots:

- **sensible**: rates coins (with a bonus for its starting race and for completing a fusion), skips weak rewards, uses Reroll tokens on bad offers, melts the weakest coins, keeps a 20% gold reserve, buys good Charms first, engraves its best coin.
- **greedy**: always takes the best-looking reward (never skips) but otherwise shops like the sensible bot.
- **random**: picks rewards and purchases at random.

### Final results (1,000 runs each)

```
Dues: 26, 47, 100, 195, 345, 515, 725, 970

sensible: 321/1000 wins (32.1%), avg best round 196.0
  lost in phase: 1:12 2:2 3:10 4:77 5:159 6:155 7:148 8:116
  by starter: warhorn 32.7%, silverleaf 28.5%, banner 35.2%
  median gold at dues: 1:56/26 2:105/47 3:194/100 4:326/195 5:504/345 6:727/515 7:983/725 8:1272/970
  win% when coin in final bag: grovelder(168) 56.0%, patron(149) 50.3%, starweaver(198) 46.5%, wardrummer(151) 45.7%, envoy(226) 45.1%, raider(123) 44.7%, herald(145) 43.4%, gemcutter(204) 43.1%, towncrier(242) 42.1%, warlord(222) 40.5%, shaman(88) 39.8%, caravan(367) 39.5%, guildmaster(241) 38.6%, lorekeeper(197) 38.1%, wargrider(45) 37.8%, tinker(153) 37.3%, juggler(86) 37.2%, captain(202) 36.1%, bladedancer(184) 35.9%, gladewarden(159) 35.8%, innkeeper(200) 35.5%, druid(161) 35.4%, mercenary(133) 35.3%, looter(138) 34.8%, ranger(156) 34.6%, cutpurse(104) 34.6%, moonpriestess(188) 34.6%, moneychanger(155) 33.5%, merchant(316) 33.2%, longbow(188) 32.4%, powderkeg(60) 31.7%, squire(593) 30.9%, charger(66) 30.3%, seer(66) 30.3%, brawler(107) 29.9%, archer(552) 28.6%, firebrand(135) 27.4%, scrounger(43) 25.6%, wrecker(67) 25.4%, sentinel(177) 24.3%, wisp(167) 22.8%, apprentice(58) 22.4%, vagabond(95) 22.1%, grunt(525) 21.3%, quartermaster(33) 21.2%, bard(80) 20.0%, berserker(258) 19.0%, bonebreaker(126) 14.3%, copper(158) 0.0%
  win% when charm owned: scales(68) 64.7%, loupe(21) 52.4%, lantern(110) 51.8%, anvil(70) 50.0%, collector(97) 47.4%, clover(251) 47.4%, pockets(87) 46.0%, rallyhorn(16) 43.8%, firstlight(249) 43.0%, longtable(221) 42.1%, skullcup(241) 41.5%, moonwell(209) 40.2%, sparepurse(229) 39.7%, spintop(51) 39.2%, charter(236) 39.0%, tailwind(258) 38.0%, crown(378) 37.8%, ledger(263) 37.6%, spade(109) 36.7%, dice(55) 36.4%, crucible(114) 36.0%, banner(335) 35.2%, haggler(274) 33.9%, treaty(230) 33.9%, whirlwind(110) 33.6%, warhorn(321) 32.7%, silverleaf(344) 28.5%

greedy: 138/1000 wins (13.8%), avg best round 129.1
  lost in phase: 1:14 2:3 3:20 4:100 5:225 6:208 7:159 8:133
  by starter: warhorn 20.2%, silverleaf 9.0%, banner 12.5%
  median gold at dues: 1:56/26 2:102/47 3:187/100 4:300/195 5:438/345 6:601/515 7:800/725 8:963/970

random: 0/1000 wins (0.0%), avg best round 27.5
  lost in phase: 1:27 2:98 3:480 4:311 5:79 6:5 7:0 8:0
  by starter: warhorn 0.0%, silverleaf 0.0%, banner 0.0%
  median gold at dues: 1:45/26 2:66/47 3:95/100 4:148/195 5:222/345 6:321/515 7:NaN/725 8:NaN/970
```

### Guild ranks (1,000 sensible runs each)
| Rank | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Win rate | 32.2% | 25.0% | 23.6% | 17.3% | 13.1% |

A first pass (dues +10% per step, prices +15%, heads −4%) fell off a cliff: 30% → 13.5% at rank 2 and 2.6% at rank 5. The steps were softened so each rank is a noticeable but fair step.

### What changed during tuning
1. **First pass** (dues 25/45/70/105/150/205/270/350, original numbers): sensible bot won ~7%; Orcs dominated (Warhorn 12.6% vs Banner 3%).
2. **Degenerate Berserker**: a Berserker could eat the whole bag and win with a single 60+ value coin. Fix: the bag can't drop below 5 coins through destruction (same floor as melting). Win rate fell to 3.6%, which showed how much the exploit carried.
3. **Human and Elf numbers were too small to keep up with dues**, so median gold fell behind dues from phase 4. Buffs: Squire +2 per Human, Merchant +2 gold per neighbour, Moneychanger +4, Captain +3, Guildmaster +3 per Human, Patron grows *every* other Human, Innkeeper +6, Tinker became a Human-count economy coin; Archer +3, Ranger +3, Longbow +5, Druid +2 permanent, Moon Priestess re-flips 2 coins, Seer blesses 2 coins, Sentinel/Starweaver value 3; Bladedancer's streak now grows (+1, +2, +3…). Orcs: Shaman +3, Wrecker value 4, Brawler +3 per flip.
4. **Charm hoarding**: the bot ended runs with 16 Charms. Added a 6-slot Charm cap, which makes Charm choices matter.
5. **Starter parity**: Tusk Warhorn raised to Orcs +2 value, Silverleaf to 68% heads. Starters now win 28–31% each.
6. **Curve**: dues softened early (22/40/65) so ~2% of sensible runs die in phase 1, and raised late (150/210/285/375) so runs are decided in phases 5–8.
7. **Synergy expansion** (12 coins, 1 Charm; 29 → 41 coins). The first pass dropped the sensible bot from 28.8% to 19.5% (Silverleaf 12.8%): with a bigger pool, duplicate offers and three-of-a-kind fusions became rare, and the tails coin in the Elf pool worked against Elf heads-control. Fixes: owned coins are offered twice as often; the tails-counting coin moved from Elves to Orcs as Night Raider and pays whatever its own face; Cutpurse tails +4 → +6; Powder Keg +6 → +8 gold and value 1 → 2.
8. **Berserker and bot synergy sense** (milestone 8). Berserker runs still won 47% against a 27% average: it thins Copper out of the bag for free *and* grows by the full value of what it eats. It now gains **half** the victim's value. That pulled Tusk Warhorn to 23%, so the Orc starter became Orcs +3 value and +3 gold per destruction (was +2/+2). The sensible bot now reads set-bonus and mixed-table conditions from coin data (more of a race in the bag makes a set coin worth more; three races make a mixed-table coin worth more). Juggler +1 → +2 gold per flip. Starters now win within one point of each other.
9. **Rule-bending items** (milestone 11): Rally Horn, Jeweler's Loupe, Spinning Top and the Kinship engraving. The bot first bought Jeweler's Loupe with no ×2 coins (14% win rate when owned); it now rates Loupe and Rally Horn by whether the bag holds coins they improve, and buys them only then.
10. **Synergy engravings** (milestone 15): Two-Faced, Spiked and Hollow. With 12 engravings competing for the shop's two engraving slots, Double and Echo turn up less often and the sensible bot fell from 31% to about 29%, still inside the target. The bot places them by rule (Two-Faced only on face-conditioned coins, Hollow on cheap fodder when the bag has destroyers, Spiked only with flip payoffs).
11. **Weak-coin pass** (milestone 20, 2,000-run samples): Juggler (13.6%), Captain and Firebrand (15.3%), Wisp (18.4%) and Charger (18.9%) trailed coins at ~37%. Juggler now also flips an adjacent tails coin to heads on landing (starting its own flip payouts); Captain +4; Firebrand 1-in-5 for +12 gold; Wisp and Charger +1 value. They now sit at 21–23% (Charger ~17%, small sample). Tusk Warhorn's destruction gold went back to +2 to keep the Orc starter level.
12. **Six more coins** (milestone 27; 41 → 47): Herald, Quartermaster, Bonebreaker, Warg Rider, Lorekeeper, Glade Warden, using the round-start trigger, tokens and tails culling. The pool grew again and the sensible bot fell to 24%; owned coins are now offered 2.5× as often (was 2×), Herald +2, Glade Warden +3, Quartermaster also gives a Melt token, and Warg Rider rams the farthest *tails* coin (flipping it to heads) instead of any coin. Result: 32.6% over 2,000 runs, starters within one point.
13. **Hand and swap** (milestone 30): seeing the 5 drawn coins and swapping one for free each round lifted the sensible bot from 32.6% to 52.3% (it mostly swaps out Copper). Dues were raised about 21% (22/40/65/100/150/210/285/375 → 27/48/78/119/179/250/339/446); swaps draw a different kind of coin when possible; Tusk Warhorn became Orcs +4 value and +2 gold per destruction. Result over 2,000 runs: sensible 30.6%, starters 29.8–31.2%, greedy 9.8%, random 0%.
14. **Spare Purse** (milestone 32): a Charm with one extra free swap per round (wins 31.5% when owned). Adding it reshuffled the bazaar and the starters drifted apart (Commons Banner 27%, Tusk Warhorn 33%). Commons Banner now also gives Humans +3% heads chance (a +2 value version overshot to 42%); Tusk Warhorn pays +1 gold per destruction (was +2). Starters 29.5–32.3% over 2,000 runs.
15. **Swap coins** (milestone 34): a new On swap trigger, with Vagabond (grows +3 when swapped out) and Scrounger (+1 gold for every other swap, even from the bag). The first Vagabond (+2, never swapped on purpose by the bot) won 13.6% when owned; at +3, with the bot swapping it first when it holds a free swap, 31.6%. 48 coins dilute offers a little more (sensible fell to about 27%), so dues eased about 2% (to 26/47/76/117/175/245/332/437) and Commons Banner's heads bonus went from +3% to +2%. Result over 3,000 runs: sensible 30.4%, starters 28.8–31.8%.
16. **Coins in play grow to 10** (milestone 40): 5,5,6,7,8,9,10,10 by phase. On the old dues the sensible bot won 82% (92% once it learned to grow its bag; it used to skip rewards to keep the bag small, which left late tables half empty). Dues now ramp from phase 3: 26/47/100/195/345/515/725/970. Orcs' flat value bonus scaled worst with big tables (18% vs 35%), so Tusk Warhorn became Orcs +7 value. Result over 2,000 runs: sensible 30.8%, starters 28.6–33.4%, greedy 13.5% (a bigger bag now genuinely helps), random 0%.

Result: a sensible strategy wins about **31%** of runs (after the hand-and-swap change, with dues raised to match), the greedy bot about **6%**, and random play essentially never. The three starters are within one point of each other. Runs usually end in phases 4–8, so most runs reach the interesting mid-game.

### Known strengths to watch
- **Druid, Berserker and Tinker** lead the final-bag win rates (~37–39% against a ~33% average); no coin is far out on its own any more. Deep Pockets and Golden Scales remain the strongest Charms (rare, 15 gold).
- **Charger, Powder Keg and Bard** trail (~17–20%): they need a flip, wreckage or strong-neighbour build, and the bot doesn't plan for them.
- Copper in the final bag correlates with losing, as intended: melting and outgrowing Copper is part of the strategy.

## Art direction

Inspired by the sticker-craft look of tabletop toy battlers (reference screenshots and notes supplied by the project owner), drawn entirely from scratch for Coinfall. Nothing was traced or extracted; no characters, icons, layouts or fonts from any other game are used.

- **Semi-3D table and coins (current).** The table is drawn in perspective (`src/ui/table/projection.ts`): a lacquered tray with a visible front edge and a lamp-lit cloth, with every coin, link and effect placed through the same projection. Coins are thick metal discs (`Coin3D.tsx`): the face is foreshortened by cos(angle) and a stack of edge slices offset by sin(angle) forms the reeded rim, so resting coins lie tilted away and show their thickness. Coin faces are embossed metal (beveled reeded rim, recessed gradient face, raised relief, specular highlight). Heads shows a **character portrait** for every coin (`src/ui/art/portraits.tsx`): an embossed bust like the head on a real coin, built from a race head (round-eared Humans, broad tusked Orcs, long-eared Elves), the character's own headgear, eyes and a prop (Archer's bow, Powder Keg's bomb, Lorekeeper's book). Portraits are two-tone (race colour plus white engraved lines) so they read at 40px, and are clipped to the coin face. Plain Copper keeps its glyph; tails shows the race emblem.
- **Coin motion.** A tossed coin rises from below the table tumbling 2–3 full turns end over end, shows its edge as it passes edge-on, swaps faces, drops onto the cloth with a small bounce and a decaying settling wobble, and kicks up a little dust. An ability flip makes the coin hop and turn one and a half times onto its new face; bumps skid with a hop and a lean; a lamp glint sweeps the face as it turns.
- **Sticker build (UI).** Badges, the logo is a die-cut sticker: soft drop shadow, white border, warm ink outline (`colors.ink` `#2B2320`, never pure black), then flat cel shading: one base tone, one hard-edged shadow crescent, a white specular highlight. Glyphs are inked by drawing them twice (fat in ink, then in colour). See `src/ui/art/CoinArt.tsx`.
- **Diorama.** Stickers sit on a soft, low-contrast scene: a night bazaar stall with a moonlit window, lantern glow (gently breathing), shelves, bunting and a vignette (`src/ui/components/Backdrop.tsx`). The table is a lacquered wooden tray with a teal cloth runner, an original coin-and-diamond print and a stitched hem (`src/ui/table/Table.tsx`).
- **Stitched UI.** Buttons are card-stock pills with a dashed stitch inset on a dark backing tab that compresses when pressed; panels and sheets are dark rounded plaques with pale stitching; page titles sit on a folded ribbon; the HUD is a wood-framed plaque. Type is Fredoka (rounded, SIL Open Font License), bundled with `@expo-google-fonts/fredoka`.
- **Motion** (1x speed; divided by the speed setting; Reduce Motion fades in place instead):
  - Landing: the coin arcs in and drops into an outlined cream smoke poof that reaches full size in ~130 ms, then breaks into puffs drifting out and down, gone by ~650 ms.
  - Hits (bumps, smashes): a cream slash ring with yellow-white speed lines (~250 ms) and a white flash on the struck coin (~100 ms). Destruction adds shards, a bigger poof and a short shake.
  - Numbers: big rounded numerals with an ink edge and a thick cream outline (gold for gold, green for growth, red for losses) pop in at 130%, settle in ~100 ms, linger ~650 ms and fade instead of flying away.
  - Neighbours: a glowing orange-white link beam joins adjacent coins.
  - Prompts and sheets pop in from ~30% with a small overshoot; the end-of-round card (cream sunburst, scalloped stitched bottom) drops in with the round's total before the reward sheet.

## Playtest log

All playtests were run on the web build in headless Chromium at iPhone sizes (390×844, plus 375×667 and 440×956), driving the real UI and reading the screenshots.

| Milestone | What I saw | Change |
|---|---|---|
| 2 | HUD gold jumped to the round's final total while coins were still landing. | HUD shows gold counted so far during playback. |
| 2 | Starting race label read "Elfs". | Added proper plurals. |
| 2 | Reward sheet hid the final table. | Added "See table" / "Pick a coin" toggle. |
| 3 | A scripted player died in phase 2 after ~8 gold rounds; early rounds felt flat. | Rebalanced economy (see Balance). The same script now reaches phase 5. |
| 3 | Bot win state had a single 63-value Berserker as the whole bag. | 5-coin bag floor for destruction. |
| 3 | Shop HUD still showed the already-paid dues. | Shop HUD shows next phase's dues. |
| 3 | Coin value chip looked like a price tag next to the buy button. | Value chip restyled with a "value" caption. |
| 4 | 375×667: "Humans" wrapped on the title screen; "4 toke…" truncated on the reward reroll button; the fusion toast covered the reward header. | Wider label, "4 left", toast moved to the top. |
| 4 | Playback caption repeated the stage name ("ADJACENCY / Adjacency") and abilities only showed the coin's name. | Stage captions explain the step; resolving abilities show their rules text under the name. |
| 4 | Copper heads and tails looked almost the same. | Tails faces are dimmed for every coin. |
| 4 | The Moon Priestess glyph rendered blank (degenerate SVG arc). | Redrew the crescent. Added a full Coin/Charm/Engraving guide to How to play, which also made it easy to check every glyph. |
| 4 | Glyphs were small at 54px. | Glyph scale increased. |
| 4 | Toss animation felt slow (~0.43s per coin). | Event durations trimmed ~15%; Fast/Turbo speeds available; Skip button. |
| 4 | Reduce Motion (emulated): coins fade in place, no arcs/spins, and the game is fully playable. | — |
| Art | First toy pass (thick black outlines, BONK!/KABOOM! words) judged ugly by the owner. | Restyled to the sticker/stitch direction from reference screenshots; old pass kept on `toy-style-wip`. |
| Art | Bursts and numbers spilled past the table edge; on web, absolutely-positioned SVG painted over its text. | Effects are clamped to the table; text layers are positioned above their SVG backgrounds. |
| Art | Page titles and the dues caption sat on top of the busy backdrop (moon, bunting). | Titles moved onto ribbon plates; the dues caption has its own dark pill. |
| Art | Glyphs were small inside the new sticker coins. | Larger face and glyph scale. |
| Art | Owner: right direction but not enough; wanted semi-3D with better coin flips. | Perspective table, thick 3D coins with real end-over-end flips, settling wobble, glints; embossed coin faces. |
| Art | The cloth rendered orange on web: its SVG gradient id clashed with the backdrop's. | Prefixed every SVG id per component. |
| Art | The landing smoke poof hid the new 3D landing. | Landing uses a small dust puff at the coin's base. |
| Art | Frame-by-frame playtest (120 ms frames, 390×844): the landing dust puff was drawn over the coin, sitting on its face like a stain, because every effect rendered in one layer above the coins. | Effects layer split: landing dust renders on the cloth under the coins and kicks out sideways past the rim; everything else stays above. |
| 7 | Synergy expansion, web playtest with injected bags (all 5 coins drawn, frames every 150 ms): a mixed table (Envoy, Caravan Master, Mercenary, Gem Cutter, Warlord) scored +50 in phase 3, and a heads-Elf table with Grove Elder +54. Breakdowns matched the rules. New glyphs read at table size. | — |
| 7 | Gem Cutter's and Grove Elder's doubling popped as "+6", which hid that it was a multiplier. | Value events carry the factor; multipliers pop as a large "×2". |
| 7 | Players had no in-game hint that mixing races or flipping to tails is a strategy. | New "Combos" section in How to play. |
| 9 | Title coins frame by frame: edge-on, the 3D rim broke into separate thin lines with gaps; at the lamp-glint angle the whole face washed out pale. | Rim slices never thinner than their spacing (solid reeded band edge-on); glint 65% → 35%. |
| 9 | Patron screen: the intro text and starting bag sat directly on the busy backdrop (window, moon, a lantern behind the Archer coin). | Intro on its own dark plate. Checked at 375×667 and 440×956. |
| 9 | End of round: a lingering "+11" score number drew over the round-total card on the web (the table's transform makes its own stacking context). | The card's layer sits above the table (`zIndex`). |
| 10 | Rewards and shop showed only rules text, so spotting which coins combine meant reading every line. | Synergy tags derived from each coin's data (e.g. "Set: 3 Humans", "Mixed table", "Counts Humans", "Flips", "Tails", "×2") as coloured chips; set and mixed-table offers say how well they fit the bag ("Your bag: 3 Humans"); the bag view summarises the build. Checked at 390×844 and 375×667. |
| 12 | All 26 Charms shared one generic gem icon, so owned Charms and shop offers were hard to tell apart. | Each Charm has its own symbol on a hanging-tag sticker (tag colour = rarity, race colour for starters), used in the shop, the Charms list and How to play. Symbols enlarged after a first pass read too small at 38px. |
| 13 | Set bonuses and mixed-table effects fired silently: only numbers changed, so the moment a combo came together went unnoticed. | A sticker callout ("Orc set bonus!", "All three races!") when a gated effect fires. A first pass drew it over the triggering coin, where it collided with that coin's numbers; it now sits in one fixed spot at the top of the table. Reduce Motion: fades in place. |
| 14 | Daily bazaar: title layout at 390×844 and 375×667 with the new New run / Daily row; a retry of the daily run offers the same three starters in the same order. | — |
| 16 | Recapturing store screenshots frame by frame: when a round ended, the reward sheet started popping in for one frame before the round-total card covered it (the card is switched on in an effect, one render late). | The sheet waits while the card is pending. Store set (6.9", 1320×2868, RGB) retaken with the new features; App Store text counts updated (40 coins, 26 Charms, 12 Engravings) and the Daily bazaar added. |
| 18 | Collection log: How to play shows "6 of 40 coins found" with a tick on each found coin and Charm; the title adds "6/40 coins" to the records line. At 375×667 that line fell below the screen. | Shorter records text; smaller title coin area and top padding on short screens. |
| 19 | Guild ranks at 375×667: the rank picker sits under the patron cards with its rules listed; "+" is disabled at the highest open rank; the HUD reads "Phase 1/8 · Rank 3" and dues show 23 instead of 22. | — |
| 22 | Choosing between offers still meant cross-checking your bag by memory. | Offers (rewards, shop) and the coin detail list the bag coins they combo with, e.g. "Works with: Berserker" on a Looter; derived from effect data (flip makers ↔ flip/tails payoffs, destroyers ↔ wreckage, race payoffs ↔ that race, mixed-table ↔ other races). Checked at 375×667. |
| 23 | Charms had no tags, so their role in a build was only in their text. | Charm tags derived from effects and static modifiers (Rally Horn "Set bonuses", Jeweler's Loupe "×2", Skull Cup "Orcs · Boosts others"); utility Charms stay untagged. Shown in the shop and the Charms list. Combo callouts add a haptic tap on device. |
| 25 | Fuzzing showed late-game rounds of up to 62 events (~19 s of playback at normal speed). The end screen didn't say what kind of bag won. | Rounds whose playback would exceed 9 s are compressed to fit (never below 45% of normal step time). The end screen lists the build's top tags ("Gold: 3 · Counts Humans: 2"). Checked a winning run at 375×667, which also showed the "Guild rank 2 is now open" note. |
| 26 | Soak test: two full runs driven through the web UI (35 rounds, 7 dues, both endings) with no console errors. All 12 Engravings still shared one icon. | Each Engraving has its own symbol on a faceted gem sticker (colour by rarity), in the shop and How to play. |
| 28 | A combo callout didn't show which coins formed the combo. First pass: thin pale rings on each member, too faint and quick to read (420 ms, pale on the cloth). | Members get a thick ring in their race colour, held ~750 ms: every Orc for "Orc set bonus!", one coin per race for "All three races!". Skipped under Reduce Motion (the callout still fades in place). |
| 30 | Hand and swap at 390×844 and 375×667: the hand strip sits above Toss; tapping a coin shows its ability; Swap reads "free", then "1 token". The tossed coins matched the final hand. A Copper was first swapped for another Copper (wasted swap). | Swaps draw a different kind of coin whenever the bag has one. |
| 31 | Whether to swap depended on combos you had to work out yourself. | The hand shows its gated combos ("War Drummer: 2/3 Orcs", "Envoy: 3/3 races ✓"), counting Rally Horn and Kinship. A first pass printed "5/3 Orcs"; counts are now capped at the target. Checked at 375×667, including a save from before hands existed (a hand is dealt on load). |
| 36 | Toss order already mattered (Seer blesses later tosses; Charger and Wisp act on coins already landed) but couldn't be chosen. | A First button on the selected hand coin moves it to the front; shown only when the coin isn't already first. Fits at 375×667. Sim (bot leads with Seer): sensible 30.6% over 3,000 runs, unchanged. |
| 39 | A swap's odds depended on what was left in the bag, which wasn't shown. | The hand shows "Left in your bag: Copper ×2, Squire" while a swap is possible (first worded "Swap draws from", which overstated it: swaps prefer a different kind). The table hint was shortened now that the hand explains swaps. A UI soak run (two full runs) found no errors. |
| 40 | Ten coins in play (phase 7 save) at 375×667 and 390×844: the hand wraps into two rows of five; full tables read well. At 375 the two-row hand squeezed the table so the "Round 1" hint spilled out, and three-digit dues wrapped the HUD's dues pill. | Small tables show just "Round N"; on narrow phones the dues pill drops "need N" (the dues bar below shows progress). |
| 41 | Character portraits, contact sheet of all 48 coins at 140px and 44px, the coin guide and a live table at 375×667. Each character is distinct at full size; at hand size race colour, head shape and silhouette props (hats, weapons) still tell them apart. No console errors. | — |
| Art | The effects module pulled React Native into the pure playback test. | Moved the shared constant into `playback.ts`. |

## Decisions

- **Art direction (after owner feedback):** a first "toy" pass with heavy black outlines and comic word bursts (BONK!/KABOOM!) was rejected as ugly and parked on branch `toy-style-wip`. The game was restyled from the owner's reference screenshots and notes into the sticker-and-stitch look described under Art direction. Comic words were dropped in favour of smoke, slash rings and outlined numbers.
- **Semi-3D in 2.5D:** the 3D coin is built from transformed Views (scaleY/translateY per slice) rather than a 3D engine, so it runs in Expo Go and on web with no native modules and stays cheap with 6–8 coins.
- **Character portraits over icons (owner request):** every coin's heads shows its own embossed bust rather than a symbol, so the coins feel like a cast of characters. Busts share race heads and a face kit (eye styles such as goggles, monocle, blindfold) and differ in headgear and props; the old glyphs stay for Copper and as a fallback.
- **Fredoka font** is bundled (SIL Open Font License 1.1) for the rounded, friendly type; it is the only third-party asset and is free to ship in a commercial app.

- **Expo SDK 58** (latest stable on npm at the time), blank TypeScript template, **no Expo Router**: the game is a single-screen state machine, so a router adds weight without benefit.
- **Plain Copper never fuses.** The starting bag holds five Coppers; by the letter of the fusion rule they would fuse instantly. Copper is treated as plain currency so fusion is reserved for character coins.
- **Engine actions are pure** (`(state) => newState`, input never mutated); the RNG state lives on the run, so a saved run continues with identical randomness and runs are reproducible from a seed.
- **The whole round resolves at once** in the engine and produces an ordered event log; the UI only replays it. This keeps rules out of the UI and makes Skip / speed / Reduce Motion trivial.
- **Draws are from the whole bag each round** (no discard pile). Simpler to understand on a phone, and bag size still matters because only part of the bag is drawn.
- **The table grows each phase, up to 10 coins** (milestone 40, at the owner's request): early rounds stay readable, late rounds become big combo tables, and growing the bag to fill them is part of the plan.
- **Adjacency** uses a fixed radius in table units (0.4 table widths, table is 1 × 1.2) so it is independent of screen size.
- **Retrigger/copy** replays a coin's On land / Adjacency / Round end effects once (no chains; streak effects are excluded so Bladedancer can't double-count).
- **Charm cap of 6** (incl. starter) — added after the bot hoarded 16 Charms.
- **Bag floor of 5 coins** for both melting and destruction (destroy "holds firm" at 5).
- **Synergy expansion (milestone 7)**, inspired by how coin-tossing roguelikes in the genre reward cross-faction builds. All names, rules and art are original. 12 coins (4 per race) and the Treaty Seal Charm, built on two new engine blocks: `Effect.require` (an effect fires only when a count reaches a minimum: set bonuses) and `Count.races` (number of different races among matching coins: mixed-table payoffs). See the Synergies section.
- **Owned coins are offered more often** (2× at 41 coins, 2.5× at 47). With 41 coins, three-of-a-kind fusions had become rare and the sensible bot fell to 19.5%. Weighting offers toward coins you already own (below level 3) restored fusions and focused builds without trimming the pool.
- **Multipliers apply to the final value** (`(base + bonuses) × mult`), so a ×2 placed early still doubles buffs that land later in the same round. Bard can retrigger a ×2 for ×4, a rare high-roll the sim shows is not dominant.
- **Synergy tags are derived, not authored** (`src/ui/content/tags.ts`): they are computed from each coin's effects, so a rules change can never leave a stale tag, and a test checks that every coin with an ability has at least one.
- **Rule-bending items over more coins (milestone 11).** With 41 coins the pool is wide enough; depth now comes from Charms and engravings that change how synergies work (Rally Horn lowers set thresholds, Jeweler's Loupe raises multipliers, Spinning Top rewards flips, Kinship makes one coin every race). Two engine hooks support them: `Mods.setDiscount` / `Mods.multBonus`, and a `subject` target for reactive Charm effects (the coin that flipped or was destroyed).
- **Daily bazaar is offline** (milestone 14): the seed is `daily-YYYY-MM-DD` from the device's local date, so it needs no network, accounts or server, in line with the App Store rules above. `RunState.daily` is optional, so older saves still load without a `SAVE_VERSION` bump.
- **Collection log, not unlocks** (milestone 18): every coin and Charm is available from the first run; the log only records what you have owned (`records.found`). The guide never hides anything, so the rules stay fully readable.
- **Guild ranks are modifiers, not new rules** (milestone 19): a rank only feeds `Mods` (dues, prices, heads chance) through `runMods(run)`, so every system that reads modifiers picks it up and the engine stays data-driven. `RunState.rank` is optional (missing = 1).
- **Engine fuzzing** (milestone 24): `fuzz.test.ts` resolves 600 rounds with random bags (every coin, levels 1–3, random engravings, up to 6 random Charms, random rank) and checks that the breakdown sums to the total, gold adds up, the bag never drops below 5, values stay finite and every event names a real coin. A one-off 20,000-round run found no violations; the longest round produced 62 events.
- **Hand and swap** (milestone 30): the round's coins are drawn when the round becomes ready (`RunState.hand`), shown, and tossed in order, so the player gets one decision every round. Draws and swaps use the run's RNG, so saves and the Daily bazaar replay exactly. Older saves get a hand dealt on load (`ensureHand`). Swaps beyond the first cost a Reroll token, which gives Quartermaster and Bone Knucklebones a second use.
- **Skipping a reward pays 3 gold** so skipping is a real choice rather than a pure loss.
- **Reroll tokens also work on round rewards**, not only the shop, to give them more uses.
- **Starting race Charms** only change their race's coins (they don't add extra coins), keeping the starting bag exactly as specified.
- **iPhone only on iOS** (`supportsTablet: false`), portrait, dark interface. iPad would need its own screenshots and layout pass.
- **No Android config** in app.json (`platforms: ["ios", "web"]`), so nothing in the app or metadata mentions other platforms.
- **Play money only**: no purchases, ads, accounts or network calls. A Settings option deletes all saved data on the device.
- **The table is wood, not felt**, and coins are characters, not chips, to read as a fantasy bazaar rather than a casino.
- **Web build** is used for automated playtesting and GitHub Pages; the base URL is `/coinfall` (from the git remote).
