#!/usr/bin/env node
/* Finds the elements actually causing horizontal overflow: rect exceeds the
 * viewport AND no ancestor clips (clipped decorations are harmless).
 * Usage: node find-overflow.js <page-path-or-url> <width> [height] */
const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const [target, w = '390', h = '844'] = process.argv.slice(2);
  if (!target) { console.error('usage: node find-overflow.js <page> <width> [height]'); process.exit(2); }
  const url = target.startsWith('http') || target.startsWith('file:')
    ? target : 'file://' + path.resolve(target);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await browser.newPage({ viewport: { width: +w, height: +h } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  const bad = await p.evaluate(() => {
    const cw = document.documentElement.clientWidth, out = [];
    const clipped = el => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement)
        if (/(hidden|clip|scroll|auto)/.test(getComputedStyle(a).overflowX)) return true;
      return false;
    };
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if ((r.right > cw + 1 || r.left < -1) && !clipped(el)) {
        if (getComputedStyle(el).position === 'fixed') return; // fixed doesn't grow scrollWidth
        out.push({ tag: el.tagName, cls: String(el.className).slice(0, 60),
                   left: Math.round(r.left), right: Math.round(r.right) });
      }
    });
    return out.slice(0, 25);
  });
  console.log(JSON.stringify(bad, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(2); });
