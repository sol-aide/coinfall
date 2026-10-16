# Coinfall — project conventions

Roguelike coin-toss bag builder. Expo SDK 58, React Native, TypeScript (strict). Targets iPhone (Expo Go / EAS builds) and web (GitHub Pages). See DESIGN.md for the rules and README.md for commands.

## Must pass before finishing any change
```bash
npx tsc --noEmit
npm test
npx expo export -p web
```
For rule/number changes also run `npm run simulate -- 1000 --detail` and update the Balance section of DESIGN.md. Target: sensible bot ~25–35% wins, greedy well below, random ~0%, starters within a few points of each other.

## Architecture
- `src/engine/` is **pure TypeScript**: no React/React Native/Expo imports. All randomness goes through `rng.ts` using the `rng` field on `RunState` (never `Math.random()`), so runs are reproducible and saves resume identically.
- Engine actions in `run.ts` take a `RunState` and return a **new** one (input is cloned, never mutated). Invalid actions throw `ActionError`; the UI's `act()` swallows those.
- A round is resolved completely by `resolveRound()` and returns an ordered `GameEvent[]`. The UI (`src/ui/table/playback.ts`) only **replays** events; never compute game rules in the UI.
- Resolution order: Round start → Toss (On land per coin, in landing order) → Adjacency → Round end (coins, then Charms) → Scoring. Reactive: On flip, On destroy. Bag-level: On phase start/end.

## Content is data
- Coins: `src/engine/content/coins.ts`; Charms: `charms.ts`; Engravings: `engravings.ts`.
- Build abilities from the `Effect`/`Action`/`Target` building blocks in `types.ts` (gold, buff, mult, flip, reflip, setHeads, destroy, bump, retrigger, copy, streak, blessNext, token, interest). Adding a coin should be data only; add a new `Action` kind to `resolve.ts` only when no combination works.
- Ability numbers scale with fusion level unless `noScale`. In coin `text`, write scaling numbers as `{n}`; render with `abilityText(def, level)`.
- A new coin also needs: a glyph in `src/ui/art/glyphs.tsx` (a test enforces this), a rating in `src/engine/sim.ts` (`COIN_RATING`), and the DESIGN.md content table (`npx tsx scripts/content-tables.ts`).
- All names and text must be original. Never mention other platforms or app stores (a test scans the text).

## UI conventions
- No router: `src/ui/Root.tsx` switches on `run.screen` plus a few routes (title/settings/how-to/privacy).
- Use `Txt`, `Button`, `IconButton`, `Panel`, `Overlay`, `Ribbon`, `Stitch`, `PopIn` from `src/ui/components/ui.tsx`. Colors, fonts (Fredoka via `Txt`), font sizes and `TOUCH` (44pt) live in `src/ui/theme.ts`.
- Follow the art direction in DESIGN.md: stickers (shadow → white border → warm ink outline → flat cel shading), stitched dark panels and card-stock buttons, a soft low-contrast backdrop, no pure black and no comic word bursts. Cosmetic effects belong in `src/ui/table/fx.tsx` and are derived from events in `playback.ts` (keep `playback.ts` free of React Native imports so it stays testable).
- Every interactive element needs an `accessibilityLabel` (and role). Respect safe areas (`useSafeAreaInsets`). Touch targets ≥44pt, text ≥13pt.
- Animations use react-native-reanimated and must have a Reduce Motion path (`reduceMotion` from `useGame()`): fade in place, no arcs/spins.
- Art is drawn in SVG (react-native-svg). No external images except the icon/splash generated from `assets/source/*.svg`. Use other games only as inspiration; never trace or extract their assets.
- Saves: AsyncStorage keys `coinfall.run.v1`, `coinfall.settings.v1`, `coinfall.records.v1`. Bump `SAVE_VERSION` in `run.ts` if `RunState` changes incompatibly.

## App Store rules to keep
- No accounts, ads, analytics, tracking, network calls or purchases. Gold is play money only. If monetization is ever added it must use Apple In-App Purchase, and PRIVACY.md, the in-app privacy text (`src/ui/content/text.ts`, kept identical to PRIVACY.md by a test) and APP_STORE.md must be updated.
- Keep the fantasy bazaar look: no slot machines, playing cards, poker chips or casino felt.
- `app.json` stays iOS + web only (no Android section), bundle id `com.solaide.coinfall`, privacy manifest under `ios.privacyManifests`.

## Playtesting
Build the web version, serve `dist/` under `/coinfall/` (the base URL), and drive it with Playwright at 390×844 (also 375×667 and 440×956). Use the `testID`s on buttons (`new-run`, `starter-<id>`, `begin`, `toss`, `skip`, `reward-<i>`, `reward-take`, `reward-skip`, `pay`, `buy-<i>`, `shop-melt`, `leave-shop`, `end-new`…). `scripts/make-save.ts` generates mid-run saves to inject. Log notable findings in DESIGN.md's playtest log.

## Git
Work in milestones with descriptive commits. Don't include model identifiers in commits or files.
