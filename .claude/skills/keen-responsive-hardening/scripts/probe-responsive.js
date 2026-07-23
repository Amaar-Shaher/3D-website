#!/usr/bin/env node
/* Overflow + JS-error probe across the standard viewport matrix.
 * Usage: node probe-responsive.js <page-path-or-url> [more pages...]
 * Paths are resolved to file:// URLs. Exit code 1 if any page/viewport fails. */
const { chromium } = require('playwright-core');
const path = require('path');

const MATRIX = [
  [390, 844], [430, 932],            // phones
  [768, 1024], [820, 1180],          // tablets portrait
  [1180, 820],                       // tablet landscape
  [1280, 590], [1366, 690], [1536, 700], // short laptops / OS scaling
  [1440, 900], [1920, 1080],         // desktop
];

(async () => {
  const pages = process.argv.slice(2);
  if (!pages.length) { console.error('usage: node probe-responsive.js <page> ...'); process.exit(2); }
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  let failed = false;
  for (const target of pages) {
    const url = target.startsWith('http') || target.startsWith('file:')
      ? target : 'file://' + path.resolve(target);
    for (const [w, h] of MATRIX) {
      const p = await browser.newPage({ viewport: { width: w, height: h } });
      let errs = 0;
      p.on('pageerror', e => { errs++; console.log(`  ERR ${target} ${w}x${h}: ${e.message}`); });
      await p.goto(url, { waitUntil: 'networkidle' });
      await p.waitForTimeout(1000);
      for (let i = 1; i <= 10; i++) {
        await p.evaluate(k => scrollTo(0, document.body.scrollHeight * k / 10), i);
        await p.waitForTimeout(180);
      }
      const ov = await p.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const ok = ov === 0 && errs === 0;
      if (!ok) failed = true;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${target} ${w}x${h} | overflow: ${ov} | errors: ${errs}`);
      await p.close();
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
