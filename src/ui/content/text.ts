// Player-facing long-form text. PRIVACY_TEXT is mirrored verbatim in PRIVACY.md.

export const PRIVACY_CONTACT = 'https://github.com/sol-aide/coinfall/issues';

export const PRIVACY_TEXT = [
  'Coinfall does not collect, transmit or share any personal data or usage data.',
  'There are no accounts, no sign-in, no ads, no analytics, no tracking and no third-party SDKs that receive data. The game does not use the internet to play.',
  'What is stored: your current run, your settings (animation speed, haptics, whether you have seen the tutorial) and your run records (runs played, wins, best phase). This is saved only on this device, in the app’s local storage, so that closing the app keeps your progress. It never leaves the device and is not shared with anyone, including the developer.',
  'Keeping and deleting it: the data stays on the device until you remove it. You can delete it at any time with Settings → Delete all saved data, by abandoning a run, or by deleting the app. Because nothing is sent to the developer, there is no copy anywhere else to request or delete.',
  'Gold, Melt tokens, Reroll tokens and every other currency in Coinfall are play money. They can only be earned by playing, can never be bought with real money, and can never be exchanged for money or anything of real-world value. Coinfall contains no in-app purchases.',
  'If this policy changes, the new version will ship with an app update before it takes effect. Questions: ' + PRIVACY_CONTACT,
];

export interface HelpSection {
  title: string;
  body: string[];
}

export const HOW_TO_PLAY: HelpSection[] = [
  {
    title: 'The goal',
    body: [
      'You are a moneylender at a crossroads bazaar. Every 5 rounds is a phase, and at the end of each phase the Lenders’ Guild demands its dues. Pay them 8 times to win. If you can’t pay, the run is over.',
    ],
  },
  {
    title: 'Tossing coins',
    body: [
      'Each round you draw 5 coins from your bag and toss them onto the table. Each coin lands heads or tails, usually 50/50.',
      'Heads coins pay their value in gold. Tails coins pay nothing unless an ability says otherwise.',
      'Tap any coin to read its ability.',
    ],
  },
  {
    title: 'Abilities and order',
    body: [
      'Abilities resolve in a fixed order: Round start → each coin lands (On land) → Adjacency → Round end → Scoring.',
      'Coins are adjacent when they land close together. Dashed lines on the table show which coins are adjacent.',
      'Some abilities react to events: when a coin is flipped, or when a coin is destroyed. Phase start and Phase end abilities work even from the bag.',
      'Destroyed coins leave your bag for good.',
    ],
  },
  {
    title: 'The three races',
    body: [
      'Humans: economy and teamwork. Extra gold, buffs for other Humans, copying and retriggering neighbours.',
      'Orcs: big values and chaos. They smash neighbours to absorb their value, ram coins around and sometimes blow themselves up.',
      'Elves: precision and control. They force heads, re-flip tails, buff from long range and build streaks.',
    ],
  },
  {
    title: 'Growing your bag',
    body: [
      'After each round, add one of three coins to your bag, or skip for 3 gold. A bigger bag means each coin is drawn less often, so choose carefully.',
      'Three identical coins of the same level fuse automatically into one stronger coin (up to level 3). Fused coins have doubled or tripled values and ability numbers. Plain Copper never fuses.',
    ],
  },
  {
    title: 'The bazaar',
    body: [
      'After paying dues you visit the bazaar. Buy coins, Charms (passive bonuses for the whole run) and Engravings (upgrades for a single coin).',
      'Rerolling the stock costs gold and gets pricier each time. Reroll tokens reroll for free, also on coin rewards.',
      'Melt tokens remove a coin from your bag for good. You earn one Melt token and one Reroll token at the end of every phase.',
    ],
  },
  {
    title: 'Play money only',
    body: ['All gold and tokens are earned in the game. Nothing can be bought with real money and nothing can be cashed out.'],
  },
];

export const TUTORIAL_STEPS: { title: string; body: string }[] = [
  {
    title: 'Welcome, moneylender',
    body: 'Humans, Orcs and Elves gamble at your table. Every 5 rounds the Lenders’ Guild collects dues. Pay 8 times to win.',
  },
  {
    title: 'Toss your coins',
    body: 'Each round, 5 coins from your bag land on the table. Heads pay their value in gold. Tails pay nothing.',
  },
  {
    title: 'Abilities',
    body: 'Every character coin has an ability. Tap a coin to read it. Dashed lines show which coins are adjacent.',
  },
  {
    title: 'Build your bag',
    body: 'After each round, pick a new coin or skip for gold. Three identical coins fuse into a stronger one.',
  },
  {
    title: 'Keep an eye on dues',
    body: 'The Dues badge at the top shows what the Guild wants at the end of this phase, and how much more you need.',
  },
];
