// Dev helper for playtesting: plays a sensible-bot run until it reaches a given
// phase and screen, and prints the save JSON (inject it as `coinfall.run.v1`).
// Usage: npx tsx scripts/make-save.ts <seed> <phase> <ready|shop|dues> [starterIndex]
import { chooseStarter, newRun } from '../src/engine/run';
import { botStep, simulateRun } from '../src/engine/sim';
import type { RunState } from '../src/engine/types';

const [seedArg = 'win', phaseArg = '8', screen = 'ready', starterArg = '0'] = process.argv.slice(2);
const target = Number(phaseArg);
const starter = Number(starterArg);
let seed = seedArg;
// Prefer a seed whose bot run wins, so the save is a healthy position.
for (let i = 0; i < 500 && !simulateRun(seed, 'sensible', starter).won; i++) seed = `${seedArg}-${i}`;
let run: RunState = chooseStarter(newRun(seed), newRun(seed).starterChoices[starter]);
const done = (r: RunState) =>
  r.phase === target && r.screen === screen && (screen !== 'ready' || r.round === 1);
while (!done(run) && run.screen !== 'won' && run.screen !== 'lost') {
  // Stop in the shop before the bot spends anything.
  if (run.screen === 'shop' && done(run)) break;
  run = botStep(run);
}
process.stdout.write(JSON.stringify(run));
