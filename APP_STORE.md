# Coinfall — App Store submission draft

Everything here describes features the game actually has (Guideline 2.3.1). Re-check it against the build you submit.

## Metadata

| Field | Draft |
|---|---|
| App name (≤30) | **Coinfall** (fallback if taken: *Coinfall: Bazaar Coin Toss*) |
| Subtitle (≤30) | **Toss coins. Pay the Guild.** |
| Bundle ID | `com.solaide.coinfall` |
| Primary category | Games → Strategy |
| Secondary category | Games → Board |
| Price | Free, no in-app purchases |
| Privacy policy URL | Host `PRIVACY.md`, e.g. `https://github.com/sol-aide/coinfall/blob/main/PRIVACY.md` |
| Support URL | `https://github.com/sol-aide/coinfall/issues` |
| Copyright | 2026 sol-aide |

### Promotional text (≤170)
Build a bag of Human, Orc and Elf coins, toss them onto your table and earn enough gold to pay the Lenders' Guild for eight phases.

### Description
You are a moneylender at a crossroads bazaar where Humans, Orcs and Elves gamble at your table. Every five rounds the Lenders' Guild comes to collect its dues. Pay them, or lose your stall.

Each round you draw five coins from your bag and toss them onto the table. Heads pay their value in gold, tails pay nothing — unless a coin's ability says otherwise. Every coin is a character with its own ability:

• Humans run the economy: Merchants earn from their neighbours, Squires grow stronger together, Bards retrigger the coin beside them.
• Orcs bring big numbers and chaos: Berserkers smash neighbours to absorb their value, Chargers ram coins and flip them, Firebrands might blow up for a pile of gold.
• Elves bring control: Sentinels always land heads, the Moon Priestess re-flips tails, Bladedancers build streaks.

After every round, add a new coin to your bag or skip it for gold. Three identical coins fuse into a stronger one. After paying dues, visit the bazaar for new coins, Charms that last the whole run and Engravings that upgrade a single coin. Melt away weak coins, reroll the stock, and plan for dues that keep climbing.

• 28 coins across three races, 22 Charms and 8 Engravings
• Every run is different: random draws, landings and offers
• Clear animated resolution with a full score breakdown, tap any coin to read it
• Short tutorial, full coin guide, adjustable animation speed, respects Reduce Motion
• Your run is saved automatically on your device
• No ads, no accounts, no tracking, no purchases — play money only

### Keywords (≤100 characters)
`roguelike,deckbuilder,bag builder,coin toss,strategy,fantasy,orcs,elves,single player,offline,run`
(97 characters)

## Age rating questionnaire (suggested answers)

Gold in Coinfall is play money: it is only earned in the game, can never be bought and can never be cashed out. Players don't place bets; coins land heads or tails as part of scoring. Because the theme involves gamblers and chance, answer conservatively:

| Question | Answer |
|---|---|
| Simulated Gambling | **Infrequent/Mild** |
| Gambling (real money) / Contests | No / No |
| Cartoon or Fantasy Violence | **Infrequent/Mild** (Orc coins "smash" and "destroy" other coins; no characters are hurt on screen) |
| Realistic Violence, Prolonged Violence | None |
| Sexual Content, Nudity, Profanity, Horror/Fear, Drugs/Alcohol/Tobacco, Mature/Suggestive Themes, Medical | None (the Innkeeper glyph is a mug; there is no alcohol content) |
| Unrestricted web access | No |
| User-generated content, messaging, chat | No |
| Loot boxes / paid random items | No (nothing is purchasable) |
| Advertising | No |

Apple computes the final rating. With Simulated Gambling = Infrequent/Mild, expect a teen-level rating (12+/13+ depending on the current scale). If App Review agrees there is no simulated gambling, the game would otherwise qualify for the youngest rating.

## App Privacy ("nutrition label")
- Data collection: **Data Not Collected**.
- Tracking: **No**.
- The iOS privacy manifest is set through `expo.ios.privacyManifests` in `app.json` (required-reason APIs used by React Native/Expo: UserDefaults `CA92.1`, file timestamps `C617.1`, system boot time `35F9.1`; no collected data types; no tracking).
- Export compliance: `ITSAppUsesNonExemptEncryption = false` (no encryption beyond the OS).

## App Review notes
> Coinfall is a single-player, offline roguelike game. No login, account or network connection is required, and there are no ads, analytics or in-app purchases.
>
> Gold, Melt tokens and Reroll tokens are play money. They are earned only by playing, cannot be bought, and cannot be exchanged for money or anything of value. Players do not wager: coins land heads or tails as part of the scoring rules.
>
> How to review: tap New run → choose a patron Charm → Begin run → follow the 5-step tutorial → Toss coins. After each round pick a coin (or Skip). After 5 rounds pay the Guild dues and visit the Bazaar. Tap any coin on the table to read its ability. How to play (title screen) includes a full rules page and a guide to every coin, Charm and Engraving. Settings has animation speed, haptics, and "Delete all saved data". The Privacy screen is on the title screen and in Settings.

## Screenshots

Use real gameplay, not only the title screen. Draft 6.9" screenshots (1320×2868) generated from the build are in `store/screenshots/`:

1. `3-round-in-play.png` — **lead image**: coins on the table mid-round, abilities firing, value pop-ups, the ability text under the caption.
2. `4-pick-a-coin.png` — the round result and the "Add a coin to your bag" choice.
3. `5-bazaar.png` — the Bazaar with coins and Charms for sale.
4. `2-choose-patron.png` — choosing a starting race Charm.
5. `1-title.png` — title screen with the three races.

Optional extras worth capturing on a device: a fusion toast ("Three Captain coins fused…"), the Dues screen, and the coin detail sheet. Retake the set on an iOS Simulator before submitting, since these were captured from the web build. A 6.5" set (1242×2688) can be generated the same way if App Store Connect asks for it.

## Compliance checklist

| # | Requirement | Status | Where |
|---|---|---|---|
| 1 | Complete and polished: no placeholder text, empty screens, crashes or debug UI (2.1) | **Pass** | Every screen has content; no dev menus or debug UI; playtested every screen at 375×667, 390×844 and 440×956 with no console errors; test checks content text for placeholders |
| 2 | Real native app with lasting value, not a website wrapper (4.2) | **Pass** | React Native app with native rendering, haptics, local saves, and a replayable roguelike loop (8 phases, 28 coins, 22 Charms, 8 Engravings) |
| 3 | Distinct name, icon and art; nothing copied (4.1, 4.3, 5.2) | **Pass** | Original name, original SVG icon/splash (`assets/source/`), every coin glyph hand-drawn in `src/ui/art/glyphs.tsx`, all text original; no third-party art or fonts |
| 4 | Play money only; can't be bought or cashed out; no real money (5.3) | **Pass** | No purchase code or IAP libraries; stated in How to play, Privacy, Settings footer and review notes |
| 5 | Fantasy coin-toss look, not a casino (no slots, cards, chips) | **Pass** | Wooden bazaar table, character coins with race emblems; no slot machines, playing cards, chips, roulette or felt |
| 6 | No accounts, ads, analytics, tracking or data collection; saves on device (5.1.1) | **Pass** | Only AsyncStorage on device; no network code; no SDKs that collect data |
| 7 | In-app Privacy screen + PRIVACY.md with the same text (5.1.1) | **Pass** | Title → Privacy and Settings → Privacy; a unit test asserts PRIVACY.md contains every paragraph of the in-app text |
| 8 | Privacy policy covers collection, third parties, retention/deletion, how to delete (5.1.1(i)) | **Pass** | `PRIVACY.md`; in-app "Delete all saved data" |
| 9 | iOS privacy manifest for required-reason APIs (`ios.privacyManifests`) | **Pass** | `app.json` |
| 10 | Never mention other platforms or stores in app or metadata (2.3.10) | **Pass** | No such text in the app; `app.json` has no Android section (`platforms: ["ios","web"]`); a unit test scans in-app text and `app.json` |
| 11 | Safe areas (notch/Dynamic Island, home indicator) | **Pass** | `react-native-safe-area-context` insets on every screen |
| 12 | All current iPhone sizes | **Pass** | Layout measured, table sized to available space; checked at 375×667 (SE), 390×844, 440×956 (Pro Max) |
| 13 | 44pt minimum touch targets | **Pass** | Buttons ≥48pt tall, icon buttons 44×44, coins on the table ≥60pt |
| 14 | Readable text sizes | **Pass** | Body 17pt, secondary text ≥13pt (only badge counts and the "value" caption are 11–12pt); Dynamic Type allowed up to 1.35× |
| 15 | VoiceOver labels on interactive elements | **Pass** | Every button, coin, card and pill has `accessibilityLabel`/role; headers marked; playback caption is a live region |
| 16 | Shorter/simpler animations with Reduce Motion | **Pass** | Reads `AccessibilityInfo.isReduceMotionEnabled`; coins fade in place, no arcs/spins/pulses; durations shortened |
| 17 | Original 1024×1024 icon, no transparency; splash screen; set in app.json; bundle id `com.solaide.coinfall` | **Pass** | `assets/icon.png` (RGB, no alpha), `assets/splash-icon.png` via `expo-splash-screen` plugin |
| 18 | Any future monetization must use Apple IAP (3.1.1); none now | **Pass** | No purchases of any kind; noted in CLAUDE.md for future work |
| 19 | Metadata describes only real features (2.3.1) | **Pass** | Description above matches the build (counts generated from the data files) |
| 20 | Runs in Expo Go and on web | **Pass** | Only Expo Go–bundled native modules are used (reanimated, svg, async-storage, safe-area, haptics, splash-screen) |

Items to do at submission time (need an Apple Developer account): create the app record, host the privacy policy URL, upload screenshots retaken on the simulator, fill in the questionnaire above.
