// Dev helper: plays a bot run up to a given phase and prints the save JSON.
// Usage: npx tsx scripts/make-save.ts <seed> <phase> [starterIndex]
import { chooseStarter, newRun } from '../src/engine/run';
import { botStep, simulateRun } from '../src/engine/sim';

const [seedArg, phaseArg, starterArg] = process.argv.slice(2);
const target = Number(phaseArg ?? 8);
let seed = seedArg ?? 'win';
// Find a seed whose sensible-bot run wins, so the save is a winnable position.
for (let i = 0; i < 500 && !simulateRun(`${seed}`, 'sensible', Number(starterArg ?? 0)).won; i++) seed = `${seedArg ?? 'win'}-${i}`;
let run = chooseStarter(newRun(seed), newRun(seed).starterChoices[Number(starterArg ?? 0)]);
while (!(run.phase === target && run.screen === 'ready' && run.round === 1) && run.screen !== 'won' && run.screen !== 'lost') run = botStep(run);
process.stdout.write(JSON.stringify(run));
