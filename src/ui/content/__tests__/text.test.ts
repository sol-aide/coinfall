import { readFileSync } from 'fs';
import { join } from 'path';
import { CHARMS, COINS, ENGRAVINGS, abilityText } from '../../../engine';
import { HOW_TO_PLAY, PRIVACY_TEXT, TUTORIAL_STEPS } from '../text';

const root = join(__dirname, '../../../..');

describe('player-facing text', () => {
  it('PRIVACY.md matches the in-app privacy screen word for word', () => {
    const md = readFileSync(join(root, 'PRIVACY.md'), 'utf8');
    for (const p of PRIVACY_TEXT) expect(md).toContain(p);
  });

  it('never mentions other platforms or stores (Guideline 2.3.10)', () => {
    const banned = /android|google play|play store|windows|steam/i;
    const all = [
      ...PRIVACY_TEXT,
      ...HOW_TO_PLAY.flatMap((s) => [s.title, ...s.body]),
      ...TUTORIAL_STEPS.flatMap((s) => [s.title, s.body]),
      ...COINS.flatMap((c) => [c.name, c.text]),
      ...CHARMS.flatMap((c) => [c.name, c.text]),
      ...ENGRAVINGS.flatMap((e) => [e.name, e.text]),
      readFileSync(join(root, 'app.json'), 'utf8'),
    ];
    for (const t of all) expect(t).not.toMatch(banned);
  });

  it('has no placeholder text (Guideline 2.1)', () => {
    const all = [...COINS.map((c) => c.text), ...CHARMS.map((c) => c.text), ...ENGRAVINGS.map((e) => e.text)];
    for (const t of all) {
      expect(t.trim().length).toBeGreaterThan(5);
      expect(t).not.toMatch(/lorem|todo|tbd|placeholder|xxx/i);
    }
  });

  it('every coin has its own hand-drawn glyph', () => {
    const src = readFileSync(join(root, 'src/ui/art/glyphs.tsx'), 'utf8');
    for (const c of COINS) expect(src).toMatch(new RegExp(`\\b${c.id}: \\(`));
  });

  it('ability text renders scaled numbers for fused coins', () => {
    const merchant = COINS.find((c) => c.id === 'merchant')!;
    expect(abilityText(merchant)).toBe('Heads: +2 gold for each adjacent coin.');
    expect(abilityText(merchant, 3)).toBe('Heads: +6 gold for each adjacent coin.');
    for (const c of COINS) expect(abilityText(c, 2)).not.toMatch(/[{}]/);
  });

  it('content is complete: 8+ coins per race, 15+ charms, 5+ engravings, unique ids', () => {
    for (const race of ['human', 'orc', 'elf'] as const) expect(COINS.filter((c) => c.race === race).length).toBeGreaterThanOrEqual(8);
    expect(CHARMS.length).toBeGreaterThanOrEqual(15);
    expect(ENGRAVINGS.length).toBeGreaterThanOrEqual(5);
    const ids = [...COINS, ...CHARMS, ...ENGRAVINGS].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
