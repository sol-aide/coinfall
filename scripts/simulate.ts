// Balance simulation: plays many bot runs and prints win rates.
// Usage: npm run simulate -- [runs]
import { DUES } from '../src/engine/economy';
import { simulateRun, type Strategy } from '../src/engine/sim';

const N = Number(process.argv[2] ?? 1000);
const strategies: Strategy[] = ['sensible', 'greedy', 'random'];
console.log(`Dues: ${DUES.join(', ')}`);
for (const strat of strategies) {
  const results = Array.from({ length: N }, (_, i) => simulateRun(`sim-${i}`, strat));
  const wins = results.filter((r) => r.won).length;
  const phaseHist = Array(9).fill(0);
  for (const r of results) if (!r.won) phaseHist[r.phaseReached]++;
  const byStarter: Record<string, { n: number; w: number }> = {};
  for (const r of results) {
    byStarter[r.starter] ??= { n: 0, w: 0 };
    byStarter[r.starter].n++;
    if (r.won) byStarter[r.starter].w++;
  }
  const avgBest = results.reduce((s, r) => s + r.bestRound, 0) / N;
  console.log(`\n${strat}: ${wins}/${N} wins (${((wins / N) * 100).toFixed(1)}%), avg best round ${avgBest.toFixed(1)}`);
  console.log('  lost in phase: ' + phaseHist.map((n, p) => (p ? `${p}:${n}` : '')).filter(Boolean).join(' '));
  console.log('  by starter: ' + Object.entries(byStarter).map(([k, v]) => `${k} ${((v.w / v.n) * 100).toFixed(1)}%`).join(', '));
}
