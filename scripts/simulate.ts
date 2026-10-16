// Balance simulation: plays many bot runs and prints win rates and economy stats.
// Usage: npm run simulate -- [runs] [--detail]
import { DUES } from '../src/engine/economy';
import { simulateRun, type SimResult, type Strategy } from '../src/engine/sim';

const N = Number(process.argv[2] ?? 1000);
const detail = process.argv.includes('--detail');
const strategies: Strategy[] = ['sensible', 'greedy', 'random'];
const pct = (a: number, b: number) => `${((a / Math.max(1, b)) * 100).toFixed(1)}%`;

console.log(`Dues: ${DUES.join(', ')}`);
for (const strat of strategies) {
  const results: SimResult[] = Array.from({ length: N }, (_, i) => simulateRun(`sim-${i}`, strat));
  const wins = results.filter((r) => r.won).length;
  const lostIn = Array(9).fill(0);
  for (const r of results) if (!r.won) lostIn[r.phaseReached]++;
  const byStarter: Record<string, { n: number; w: number }> = {};
  for (const r of results) {
    byStarter[r.starter] ??= { n: 0, w: 0 };
    byStarter[r.starter].n++;
    if (r.won) byStarter[r.starter].w++;
  }
  console.log(`\n${strat}: ${wins}/${N} wins (${pct(wins, N)}), avg best round ${(results.reduce((s, r) => s + r.bestRound, 0) / N).toFixed(1)}`);
  console.log('  lost in phase: ' + lostIn.map((n, p) => (p ? `${p}:${n}` : '')).filter(Boolean).join(' '));
  console.log('  by starter: ' + Object.entries(byStarter).map(([k, v]) => `${k} ${pct(v.w, v.n)}`).join(', '));
  const medGold = DUES.map((_, p) => {
    const g = results.map((r) => r.goldAtDues[p]).filter((x) => x !== undefined).sort((a, b) => a - b);
    return g.length ? g[Math.floor(g.length / 2)] : NaN;
  });
  console.log('  median gold at dues: ' + medGold.map((g, p) => `${p + 1}:${g}/${DUES[p]}`).join(' '));
  if (detail && strat === 'sensible') {
    const coinWins: Record<string, { n: number; w: number }> = {};
    const charmWins: Record<string, { n: number; w: number }> = {};
    for (const r of results) {
      for (const c of new Set(r.finalBag)) {
        coinWins[c] ??= { n: 0, w: 0 };
        coinWins[c].n++;
        if (r.won) coinWins[c].w++;
      }
      for (const c of r.charms) {
        charmWins[c] ??= { n: 0, w: 0 };
        charmWins[c].n++;
        if (r.won) charmWins[c].w++;
      }
    }
    const fmt = (m: Record<string, { n: number; w: number }>) =>
      Object.entries(m)
        .sort((a, b) => b[1].w / b[1].n - a[1].w / a[1].n)
        .map(([k, v]) => `${k}(${v.n}) ${pct(v.w, v.n)}`)
        .join(', ');
    console.log('  win% when coin in final bag: ' + fmt(coinWins));
    console.log('  win% when charm owned: ' + fmt(charmWins));
  }
}
