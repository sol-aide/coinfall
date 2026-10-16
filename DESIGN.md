# Coinfall — Design

_Work in progress; filled in as milestones land._

## Decisions

- **Expo SDK 58** (latest stable at time of writing), blank TypeScript template, no Expo Router: the game is a single-screen state machine, so a router adds weight without benefit.
- **Plain Copper never fuses.** The starting bag holds five Coppers; by the letter of the fusion rule they would fuse instantly. Copper is treated as plain currency instead, so fusion is reserved for character coins.
- **Engine actions are pure** (`(state) => newState`); the RNG state lives on the run so a saved run continues with identical randomness.
