# Coinfall — Design

Coinfall is an original roguelike coin-toss bag builder. You are a moneylender at a crossroads bazaar where Humans, Orcs and Elves gamble. The Lenders' Guild demands dues at the end of every phase: pay, or lose the run.

## Rules

### Run structure
- A run is **8 phases** of **5 rounds**. After the 5th round of a phase the Guild collects **dues**. If your gold is short, the run is lost. Paying the 8th phase's dues wins the run.
- Dues per phase: **22, 40, 65, 100, 150, 210, 285, 375** gold (Golden Scales lowers them by 15%).
- A run starts with **0 gold**, **1 Reroll token** and the starting bag: **5 Copper, 1 Squire (Human), 1 Grunt (Orc), 1 Archer (Elf)**.
- Before the first round you choose one of three **starting race Charms** (Commons Banner, Tusk Warhorn, Silverleaf Brooch).

### A round
1. **Draw**: 5 coins (6 with Deep Pockets) are drawn at random from the bag. The whole bag is available every round.
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
- Offers (rewards and bazaar coins) are weighted by rarity, and a coin you already own below level 3 is **twice as likely** to be offered, so fusions and focused builds stay reachable.
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
| **Flip chaos** | Charger, Wrecker, Powder Keg (when destroyed), Moon Priestess/Starweaver re-flips | Brawler (grows per flip), Juggler (+gold per flip), Whirlwind Feather |
| **Tails market** | Wrecker and Charger turn heads to tails; low-heads coins | Cutpurse (tails +6), Night Raider (per tails coin), Tailwind Sash, Weighted engraving |
| **Heads control** | Sentinel, Seer, Wisp, Moon Priestess, Starweaver, First Light, Silverleaf Brooch | Guildmaster, Ranger, Archer, Longbow, Grove Elder, Gem Cutter |
| **Wreckage** | Berserker, Firebrand | Looter, Powder Keg, Gravedigger's Spade, Tusk Warhorn |
| **Set bonuses** (3+ of a race on the table) | Race Charms (Commons Banner, Skull Cup, Moonwell Vial), extra draws (Deep Pockets) | Town Crier (3+ Humans), War Drummer (3+ Orcs), Grove Elder (3+ heads Elves: ×2) |
| **Mixed table** (all three races) | A bag that holds every race | Caravan Master (per race), Envoy (+3 to heads coins), Treaty Seal, Mercenary (Orc paid per Human) |
| **Multipliers** | Big coins: Warlord, Berserker, buffed Squires | Gem Cutter (×2 the best adjacent heads coin), Grove Elder; Bard can retrigger either for ×4 |

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
| Captain | uncommon | 2 | Adjacent Humans get +3 value this round. | onAdjacent |
| Bard | uncommon | 2 | Retrigger the ability of the best adjacent coin. | onAdjacent |
| Apprentice | uncommon | 2 | Copies the ability of the nearest coin that has one. | onAdjacent |
| Patron | common | 2 | Heads: every other Human on the table gains +1 value permanently. | onRoundEnd |
| Innkeeper | uncommon | 2 | Phase end: +6 gold, even from the bag. | onPhaseEnd |
| Tinker | common | 2 | Phase end: +1 gold for each Human in your bag, even from the bag. | onPhaseEnd |
| Guildmaster | rare | 2 | Heads: +3 gold for each heads Human on the table (itself included). | onRoundEnd |
| Caravan Master | uncommon | 2 | Round end: +2 gold for each race on the table (Humans, Orcs, Elves). | onRoundEnd |
| Juggler | common | 2 | Whenever another coin on the table flips: +2 gold. | onFlip |
| Town Crier | uncommon | 2 | Round end: if 3 or more Humans are on the table, +8 gold. | onRoundEnd |
| Gem Cutter | rare | 2 | Round end: doubles the value of the highest-value adjacent heads coin. | onRoundEnd |

**Orcs**

| Coin | Rarity | Value | Ability | Triggers |
|---|---|---|---|---|
| Grunt | common | 4 | No ability. Just heavy. | — |
| Berserker | uncommon | 3 | Destroys the lowest-value adjacent coin and permanently gains half its value. | onAdjacent |
| Charger | common | 3 | On land: rams the nearest coin, pushing it away and flipping it. | onLand |
| Shaman | common | 2 | Adjacent Orcs get +3 value this round. | onAdjacent |
| Firebrand | uncommon | 6 | Round end: 1 in 4 chance to blow up. When destroyed: +10 gold. | onRoundEnd, onDestroy |
| Wrecker | common | 4 | On land: flips every adjacent coin. | onLand |
| Looter | common | 2 | Whenever any coin on the table is destroyed: +2 value permanently. | onDestroy |
| Brawler | common | 2 | Whenever this coin is flipped: +3 value permanently. | onFlip |
| Warlord | rare | 4 | Round end: +3 value for each other Orc on the table. | onRoundEnd |
| Cutpurse | common | 2 | Tails: +6 gold. | onRoundEnd |
| Night Raider | uncommon | 2 | Round end: +2 gold for each tails coin on the table (itself included). | onRoundEnd |
| Mercenary | common | 3 | Round end: +2 gold for each Human on the table. | onRoundEnd |
| Powder Keg | uncommon | 2 | When destroyed: +8 gold and flips every adjacent coin. | onDestroy |
| War Drummer | uncommon | 2 | Round end: if 3 or more Orcs are on the table, every Orc gets +3 value. | onRoundEnd |

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
| Wisp | common | 2 | On land: turns the highest-value adjacent tails coin to heads. | onLand |
| Grove Elder | rare | 3 | Round end: if 3 or more heads Elves are on the table, they all get ×2 value. | onRoundEnd |

**Charms**

| Charm | Rarity | Effect |
|---|---|---|
| Commons Banner | starter | Humans get +1 value. |
| Tusk Warhorn | starter | Orcs get +3 value. +3 gold whenever a coin is destroyed. |
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
| Weighted | uncommon | Tails still scores half its value. |

## Balance

Balance is tuned with `npm run simulate -- 1000 --detail`, which plays 1,000 seeded runs for each of three bots:

- **sensible**: rates coins (with a bonus for its starting race and for completing a fusion), skips weak rewards, uses Reroll tokens on bad offers, melts the weakest coins, keeps a 20% gold reserve, buys good Charms first, engraves its best coin.
- **greedy**: always takes the best-looking reward (never skips) but otherwise shops like the sensible bot.
- **random**: picks rewards and purchases at random.

### Final results (1,000 runs each)

```
Dues: 22, 40, 65, 100, 150, 210, 285, 375

sensible: 327/1000 wins (32.7%), avg best round 73.7
  lost in phase: 1:14 2:10 3:10 4:43 5:102 6:176 7:156 8:162
  by starter: warhorn 32.7%, silverleaf 32.8%, banner 32.5%
  median gold at dues: 1:44/22 2:80/40 3:118/65 4:166/100 5:223/150 6:283/210 7:366/285 8:431/375
  win% when coin in final bag: druid(148) 38.5%, berserker(194) 38.1%, tinker(149) 36.9%, wardrummer(168) 35.7%, patron(150) 35.3%, towncrier(256) 34.8%, grovelder(197) 34.5%, gemcutter(198) 32.8%, moonpriestess(162) 32.7%, raider(86) 32.6%, starweaver(193) 32.1%, bladedancer(160) 30.6%, warlord(258) 30.6%, caravan(458) 30.3%, innkeeper(203) 29.1%, envoy(273) 28.9%, longbow(179) 28.5%, moneychanger(164) 28.0%, guildmaster(232) 28.0%, looter(126) 27.8%, ranger(156) 26.9%, mercenary(124) 26.6%, seer(64) 26.6%, archer(710) 26.1%, squire(701) 26.0%, merchant(306) 25.5%, cutpurse(123) 25.2%, shaman(88) 25.0%, grunt(611) 23.9%, sentinel(149) 22.1%, captain(176) 21.6%, wrecker(56) 21.4%, firebrand(89) 21.3%, wisp(155) 21.3%, brawler(113) 20.4%, apprentice(55) 20.0%, powderkeg(59) 18.6%, bard(76) 17.1%, charger(49) 16.3%, juggler(89) 15.7%, copper(214) 11.2%
  win% when charm owned: pockets(91) 83.5%, scales(87) 72.4%, anvil(73) 52.1%, firstlight(267) 47.6%, clover(266) 46.2%, tailwind(270) 44.1%, moonwell(251) 43.4%, crucible(67) 43.3%, lantern(58) 43.1%, crown(402) 42.8%, collector(68) 41.2%, haggler(340) 39.7%, longtable(284) 39.1%, skullcup(265) 38.9%, charter(281) 38.8%, ledger(297) 38.4%, treaty(272) 36.4%, whirlwind(61) 34.4%, silverleaf(344) 32.8%, warhorn(321) 32.7%, banner(335) 32.5%, spade(56) 30.4%, dice(8) 12.5%

greedy: 61/1000 wins (6.1%), avg best round 51.1
  lost in phase: 1:14 2:11 3:17 4:89 5:193 6:283 7:227 8:105
  by starter: warhorn 9.3%, silverleaf 2.0%, banner 7.2%
  median gold at dues: 1:44/22 2:79/40 3:115/65 4:151/100 5:187/150 6:225/210 7:262/285 8:314/375

random: 0/1000 wins (0.0%), avg best round 21.4
  lost in phase: 1:10 2:44 3:235 4:504 5:194 6:12 7:1 8:0
  by starter: warhorn 0.0%, silverleaf 0.0%, banner 0.0%
  median gold at dues: 1:43/22 2:66/40 3:79/65 4:85/100 5:96/150 6:121/210 7:119/285 8:NaN/375
```

### What changed during tuning
1. **First pass** (dues 25/45/70/105/150/205/270/350, original numbers): sensible bot won ~7%; Orcs dominated (Warhorn 12.6% vs Banner 3%).
2. **Degenerate Berserker**: a Berserker could eat the whole bag and win with a single 60+ value coin. Fix: the bag can't drop below 5 coins through destruction (same floor as melting). Win rate fell to 3.6%, which showed how much the exploit carried.
3. **Human and Elf numbers were too small to keep up with dues**, so median gold fell behind dues from phase 4. Buffs: Squire +2 per Human, Merchant +2 gold per neighbour, Moneychanger +4, Captain +3, Guildmaster +3 per Human, Patron grows *every* other Human, Innkeeper +6, Tinker became a Human-count economy coin; Archer +3, Ranger +3, Longbow +5, Druid +2 permanent, Moon Priestess re-flips 2 coins, Seer blesses 2 coins, Sentinel/Starweaver value 3; Bladedancer's streak now grows (+1, +2, +3…). Orcs: Shaman +3, Wrecker value 4, Brawler +3 per flip.
4. **Charm hoarding**: the bot ended runs with 16 Charms. Added a 6-slot Charm cap, which makes Charm choices matter.
5. **Starter parity**: Tusk Warhorn raised to Orcs +2 value, Silverleaf to 68% heads. Starters now win 28–31% each.
6. **Curve**: dues softened early (22/40/65) so ~2% of sensible runs die in phase 1, and raised late (150/210/285/375) so runs are decided in phases 5–8.
7. **Synergy expansion** (12 coins, 1 Charm; 29 → 41 coins). The first pass dropped the sensible bot from 28.8% to 19.5% (Silverleaf 12.8%): with a bigger pool, duplicate offers and three-of-a-kind fusions became rare, and the tails coin in the Elf pool worked against Elf heads-control. Fixes: owned coins are offered twice as often; the tails-counting coin moved from Elves to Orcs as Night Raider and pays whatever its own face; Cutpurse tails +4 → +6; Powder Keg +6 → +8 gold and value 1 → 2.
8. **Berserker and bot synergy sense** (milestone 8). Berserker runs still won 47% against a 27% average: it thins Copper out of the bag for free *and* grows by the full value of what it eats. It now gains **half** the victim's value. That pulled Tusk Warhorn to 23%, so the Orc starter became Orcs +3 value and +3 gold per destruction (was +2/+2). The sensible bot now reads set-bonus and mixed-table conditions from coin data (more of a race in the bag makes a set coin worth more; three races make a mixed-table coin worth more). Juggler +1 → +2 gold per flip. Starters now win within one point of each other.

Result: a sensible strategy wins about **33%** of runs, the greedy bot about **6%**, and random play essentially never. The three starters are within one point of each other. Runs usually end in phases 4–8, so most runs reach the interesting mid-game.

### Known strengths to watch
- **Druid, Berserker and Tinker** lead the final-bag win rates (~37–39% against a ~33% average); no coin is far out on its own any more. Deep Pockets and Golden Scales remain the strongest Charms (rare, 15 gold).
- **Juggler, Charger and Bard** trail (~16%): they need a flip build or strong neighbours, and the bot doesn't plan for them.
- Copper in the final bag correlates with losing, as intended: melting and outgrowing Copper is part of the strategy.

## Art direction

Inspired by the sticker-craft look of tabletop toy battlers (reference screenshots and notes supplied by the project owner), drawn entirely from scratch for Coinfall. Nothing was traced or extracted; no characters, icons, layouts or fonts from any other game are used.

- **Semi-3D table and coins (current).** The table is drawn in perspective (`src/ui/table/projection.ts`): a lacquered tray with a visible front edge and a lamp-lit cloth, with every coin, link and effect placed through the same projection. Coins are thick metal discs (`Coin3D.tsx`): the face is foreshortened by cos(angle) and a stack of edge slices offset by sin(angle) forms the reeded rim, so resting coins lie tilted away and show their thickness. Coin faces are embossed metal (beveled reeded rim, recessed gradient face, raised glyph, specular highlight).
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
| Art | The effects module pulled React Native into the pure playback test. | Moved the shared constant into `playback.ts`. |

## Decisions

- **Art direction (after owner feedback):** a first "toy" pass with heavy black outlines and comic word bursts (BONK!/KABOOM!) was rejected as ugly and parked on branch `toy-style-wip`. The game was restyled from the owner's reference screenshots and notes into the sticker-and-stitch look described under Art direction. Comic words were dropped in favour of smoke, slash rings and outlined numbers.
- **Semi-3D in 2.5D:** the 3D coin is built from transformed Views (scaleY/translateY per slice) rather than a 3D engine, so it runs in Expo Go and on web with no native modules and stays cheap with 6–8 coins.
- **Fredoka font** is bundled (SIL Open Font License 1.1) for the rounded, friendly type; it is the only third-party asset and is free to ship in a commercial app.

- **Expo SDK 58** (latest stable on npm at the time), blank TypeScript template, **no Expo Router**: the game is a single-screen state machine, so a router adds weight without benefit.
- **Plain Copper never fuses.** The starting bag holds five Coppers; by the letter of the fusion rule they would fuse instantly. Copper is treated as plain currency so fusion is reserved for character coins.
- **Engine actions are pure** (`(state) => newState`, input never mutated); the RNG state lives on the run, so a saved run continues with identical randomness and runs are reproducible from a seed.
- **The whole round resolves at once** in the engine and produces an ordered event log; the UI only replays it. This keeps rules out of the UI and makes Skip / speed / Reduce Motion trivial.
- **Draws are from the whole bag each round** (no discard pile). Simpler to understand on a phone, and bag size still matters because only 5 coins are drawn.
- **Adjacency** uses a fixed radius in table units (0.4 table widths, table is 1 × 1.2) so it is independent of screen size.
- **Retrigger/copy** replays a coin's On land / Adjacency / Round end effects once (no chains; streak effects are excluded so Bladedancer can't double-count).
- **Charm cap of 6** (incl. starter) — added after the bot hoarded 16 Charms.
- **Bag floor of 5 coins** for both melting and destruction (destroy "holds firm" at 5).
- **Synergy expansion (milestone 7)**, inspired by how coin-tossing roguelikes in the genre reward cross-faction builds. All names, rules and art are original. 12 coins (4 per race) and the Treaty Seal Charm, built on two new engine blocks: `Effect.require` (an effect fires only when a count reaches a minimum: set bonuses) and `Count.races` (number of different races among matching coins: mixed-table payoffs). See the Synergies section.
- **Owned coins are offered twice as often.** With 41 coins, three-of-a-kind fusions had become rare and the sensible bot fell to 19.5%. Weighting offers toward coins you already own (below level 3) restored fusions and focused builds without trimming the pool.
- **Multipliers apply to the final value** (`(base + bonuses) × mult`), so a ×2 placed early still doubles buffs that land later in the same round. Bard can retrigger a ×2 for ×4, a rare high-roll the sim shows is not dominant.
- **Skipping a reward pays 3 gold** so skipping is a real choice rather than a pure loss.
- **Reroll tokens also work on round rewards**, not only the shop, to give them more uses.
- **Starting race Charms** only change their race's coins (they don't add extra coins), keeping the starting bag exactly as specified.
- **iPhone only on iOS** (`supportsTablet: false`), portrait, dark interface. iPad would need its own screenshots and layout pass.
- **No Android config** in app.json (`platforms: ["ios", "web"]`), so nothing in the app or metadata mentions other platforms.
- **Play money only**: no purchases, ads, accounts or network calls. A Settings option deletes all saved data on the device.
- **The table is wood, not felt**, and coins are characters, not chips, to read as a fantasy bazaar rather than a casino.
- **Web build** is used for automated playtesting and GitHub Pages; the base URL is `/coinfall` (from the git remote).
