// Core data types for the Coinfall engine. Pure TypeScript, no UI imports.

export type Race = 'human' | 'orc' | 'elf' | 'neutral';
export type Face = 'heads' | 'tails';
export type Rarity = 'starter' | 'common' | 'uncommon' | 'rare';

export type Trigger =
  | 'onRoundStart'
  | 'onLand'
  | 'onFlip'
  | 'onAdjacent'
  | 'onDestroy'
  | 'onRoundEnd'
  | 'onPhaseStart'
  | 'onPhaseEnd';

/** Selects coins on the table relative to the acting coin. */
export interface Target {
  scope: 'self' | 'adjacent' | 'table' | 'nearest' | 'farthest';
  race?: Race;
  notRace?: Race;
  face?: Face;
  /** How to choose among matches. Default 'all'. */
  pick?: 'all' | 'highest' | 'lowest' | 'random';
  /** Only coins whose definition has at least one ability (retrigger/copy targets). */
  hasAbility?: boolean;
  /** Include the acting coin itself (default false except for scope 'self'). */
  includeSelf?: boolean;
}

/** What an amount is multiplied by. */
export type Count = { count: Target } | { bagRace: Race };

export type Action =
  | { kind: 'gold'; amount: number; per?: Count }
  | { kind: 'buff'; target: Target; amount: number; per?: Count; permanent?: boolean }
  | { kind: 'mult'; target: Target; factor: number }
  | { kind: 'flip'; target: Target }
  | { kind: 'reflip'; target: Target; amount?: number }
  | { kind: 'setHeads'; target: Target }
  | { kind: 'destroy'; target: Target; absorb?: boolean }
  | { kind: 'bump'; target: Target }
  | { kind: 'retrigger'; target: Target }
  | { kind: 'copy'; target: Target }
  | { kind: 'streak'; amount: number }
  | { kind: 'blessNext'; amount: number }
  | { kind: 'token'; token: 'melt' | 'reroll'; amount: number }
  | { kind: 'interest'; per: number; max: number };

export interface Effect {
  trigger: Trigger;
  /** Condition on the subject coin's face when the effect resolves. */
  when?: Face;
  /** Probability (0..1) that the effect happens. */
  chance?: number;
  /** For onDestroy/onFlip on coins: also fire when ANY other coin is destroyed/flipped. */
  any?: boolean;
  /** Amounts do not scale with fusion level. */
  noScale?: boolean;
  do: Action;
}

export interface CoinDef {
  id: string;
  name: string;
  race: Race;
  rarity: Rarity;
  value: number;
  /** Short rules text shown to the player. */
  text: string;
  effects: Effect[];
  /** Fixed heads chance (e.g. Sentinel = 1). */
  headsChance?: number;
  /** Not offered in rewards/shop. */
  unbuyable?: boolean;
}

/** Static run-wide modifiers granted by Charms. All optional and additive. */
export interface Mods {
  headsBonus: Partial<Record<Race | 'all', number>>;
  valueBonus: Partial<Record<Race | 'all', number>>;
  coinValueBonus: Record<string, number>;
  drawBonus: number;
  rewardChoices: number;
  radiusMult: number;
  shopDiscount: number;
  duesMult: number;
  rerollDiscount: number;
  tailsGold: number;
  meltPerPhase: number;
  rerollPerPhase: number;
  firstCoinHeads: boolean;
  rareBoost: number;
}

export interface CharmDef {
  id: string;
  name: string;
  text: string;
  rarity: Rarity;
  /** Starter race charms. */
  race?: Race;
  mods?: Partial<Mods>;
  effects?: Effect[];
  /** Starter charms are never sold in the shop. */
  starter?: boolean;
}

export interface EngravingDef {
  id: string;
  name: string;
  text: string;
  rarity: Rarity;
  mult?: number;
  headsChance?: number;
  echo?: boolean;
  secondWind?: boolean;
  /** Can't be destroyed. */
  sturdy?: boolean;
  /** Tails still scores this fraction of value. */
  tailsFraction?: number;
  effects?: Effect[];
}

/** A coin owned by the player. */
export interface CoinInstance {
  uid: string;
  defId: string;
  level: number;
  /** Permanent value gained during the run. */
  bonus: number;
  engraving?: string;
  streak: number;
  streakBonus: number;
}

export interface TableCoin {
  uid: string;
  defId: string;
  level: number;
  x: number;
  y: number;
  face: Face;
  landed: boolean;
  destroyed: boolean;
  temp: number;
  mult: number;
  order: number;
}

export type GameEvent =
  | { t: 'stage'; stage: StageName }
  | { t: 'draw'; uids: string[] }
  | { t: 'land'; uid: string; x: number; y: number; face: Face; blessed?: boolean }
  | { t: 'trigger'; uid?: string; charmId?: string; label: string }
  | { t: 'flip'; uid: string; face: Face }
  | { t: 'reflip'; uid: string; face: Face }
  | { t: 'move'; uid: string; x: number; y: number; by: string }
  | { t: 'value'; uid: string; delta: number; permanent: boolean; value: number }
  | { t: 'gold'; amount: number; uid?: string; charmId?: string; label: string }
  | { t: 'destroy'; uid: string; by?: string }
  | { t: 'revive'; uid: string }
  | { t: 'token'; token: 'melt' | 'reroll'; amount: number; uid?: string; charmId?: string }
  | { t: 'score'; uid: string; amount: number };

export type StageName = 'Round start' | 'Toss' | 'Adjacency' | 'Round end' | 'Scoring';

export interface BreakdownLine {
  label: string;
  amount: number;
  uid?: string;
  kind: 'coin' | 'ability' | 'charm';
}

export interface RoundResult {
  round: number;
  phase: number;
  events: GameEvent[];
  breakdown: BreakdownLine[];
  total: number;
  table: TableCoin[];
  destroyed: string[];
}

export type ShopItem =
  | { kind: 'coin'; defId: string; price: number; sold?: boolean }
  | { kind: 'charm'; charmId: string; price: number; sold?: boolean }
  | { kind: 'engraving'; engravingId: string; price: number; sold?: boolean }
  | { kind: 'token'; token: 'melt' | 'reroll'; price: number; sold?: boolean };

export type Screen = 'pickCharm' | 'ready' | 'reward' | 'dues' | 'shop' | 'won' | 'lost';

export interface PhaseReport {
  phase: number;
  events: GameEvent[];
  gold: number;
}

export interface RunStats {
  roundsPlayed: number;
  bestRound: number;
  goldEarned: number;
  coinsDestroyed: number;
  fusions: number;
}

export interface RunState {
  version: number;
  seed: number;
  rng: number;
  screen: Screen;
  phase: number; // 1-based
  round: number; // 1-based within phase; the round about to be played (or just played on reward)
  gold: number;
  bag: CoinInstance[];
  charms: string[];
  meltTokens: number;
  rerollTokens: number;
  nextUid: number;
  rewardChoices: string[];
  shop: ShopItem[];
  shopRerolls: number;
  lastRound?: RoundResult;
  phaseReport?: PhaseReport;
  starterChoices: string[];
  log: string[];
  stats: RunStats;
  fusionNotes: string[];
}
