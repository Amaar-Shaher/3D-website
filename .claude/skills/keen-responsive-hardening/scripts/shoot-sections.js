#!/usr/bin/env node
/* Screenshots hero + main sections + tour chapters (rest / leaving / handoff)
 * at one viewport, with the gradual-scroll + settle-wait discipline.
 * Usage: node shoot-sections.js <page-path-or-url> <width> <height> [outPrefix] */
const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const [target, w = '390', h = '844', prefix = 'shot'] = process.argv.slice(2);
  if (!target) { console.error('usage: node shoot-sections.js <page> <w> <h> [prefix]'); process.exit(2); }
  const url = target.startsWith('http') || target.startsWith('file:')
    ? target : 'file://' + path.resolve(target);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await browser.newPage({ viewport: { width: +w, height: +h } });
  p.on('pageerror', e => console.log('PAGE ERR:', e.message));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `${prefix}-hero.png` });

  for (const sel of ['#engine', '#legislation', '#roi', '#contact']) {
    const ok = await p.evaluate(s => !!document.querySelector(s), sel);
    if (!ok) continue;
    await p.evaluate(s => document.querySelector(s).scrollIntoView(), sel);
    await p.waitForTimeout(1400);
    await p.screenshot({ path: `${prefix}-${sel.slice(1)}.png` });
  }

  // tour chapters: rest, leaving (frac .27), handoff (frac .5) for ch1 + middle chapter
  const centers = await p.evaluate(() =>
    [...document.querySelectorAll('.chapter')].map(el => {
      const r = el.getBoundingClientRect();
      return r.top + scrollY + r.height / 2 - innerHeight / 2;
    }));
  if (centers.length > 1) {
    const gap = centers[1] - centers[0];
    const targets = [
      ['ch1-rest', centers[0]], ['ch1-leaving', centers[0] + gap * 0.27],
      ['handoff', centers[0] + gap * 0.5],
      [`ch${Math.ceil(centers.length / 2)}-rest`, centers[Math.floor(centers.length / 2)]],
    ];
    for (const [name, y] of targets) {
      for (let k = 0; k <= 9; k++) { await p.evaluate(v => scrollTo(0, v), y - 220 + 220 * k / 9); await p.waitForTimeout(80); }
      await p.waitForTimeout(2000);
      await p.screenshot({ path: `${prefix}-${name}.png` });
    }
  }
  await browser.close();
  console.log('DONE — screenshots written with prefix', prefix);
})().catch(e => { console.error(e); process.exit(2); });
