# Bug → root cause → fix catalog (institutional memory)

Every production issue hit while building this site, so future sessions
recognize the pattern instead of re-diagnosing from scratch.

| Symptom reported | Root cause | Fix |
|---|---|---|
| Sculpture "في المنتصف" over cards on DevTools phone emulation | `const isMobile` frozen at load; page loaded wide | `let isMobile`, re-set in `size()` on resize |
| Sculpture rides over cards while chapter scrolls away | visibility tied to morph `tt`, but panels move before `tt` leaves plateau; smoothed band lagged | settle-based `visT` from frac distance + per-frame geometric zone, no smoothing |
| Sculpture mid-flight over readable text | morph window too wide (0.22–0.78) | plateau mapping `(frac-0.38)/0.24` |
| Radar/council flatten into a line | continuous spin shows flat shapes edge-on | `MODE:"osc"` with small AMP |
| Intro logo shifted up at rest | rain transition offset applied at tt=0 | gate all transition offsets `tt>0.0005 && tt<0.9995` |
| Sculpture slides over the section after the tour | sticky canvas outlives chapters | boundary `fadeK` dissolve (hold .25vh, span .5vh) |
| Red check upside down (∧) | canvas Y-down vs math Y-up | negate Y anchors |
| Hero 3D cards = broken 54px slivers on iPad | `.hero` flex → `.wrap` shrink-to-fit; `.stage` (all-absolute children) collapsed to width 0 | `.hero>.wrap{width:100%}`; `.stage{width:100%}` at stacked sizes |
| Hero cards overlap as strips on phones | 3D transforms at tiny widths | `<620px`: static stacked full-width cards, transforms off |
| Everything huge on small laptop | vw-only clamps on wide-but-short viewport (OS scaling 125–150%) | compact-desktop layer `(min-width:1021px) and (max-height:880px)` with vh clamps |
| 6px horizontal overflow only on EN | grid blowout from `white-space:nowrap` chip; RTL hid it from scrollWidth | `.split>*{min-width:0}`, `.pnode{flex-wrap:wrap}`; always probe EN too |
| Wrong chapter centers | `offsetTop` inside positioned ancestor | rect-based: `rect.top + scrollY` |
| Sticky stopped working (V3 steps, leg-tabs) | `html{overflow-x:clip}` kills descendant sticky | remove; contain bleeds locally (`.sectors{overflow:hidden}`) |
| Page jumped to systems on load | explorer init used `scrollIntoView` | list-internal `scrollTo`, only when horizontally scrollable |
| Gold band painted across whole tagline | `.w g` wrapping applied to a full-line span | split per-word `.w` inside `.g` |
| GitHub 403 on all writes | stale GitHub App installation | user reinstalled the Claude GitHub App; nothing fixable code-side |
| Commit rejected by stop-hook | wrong committer identity | `git config user.email noreply@anthropic.com`, `user.name Claude` |
| Arabic leftovers in EN page | manual translation misses | regex-sweep `[؀-ۿ]` until only the intentional "عربي" button remains |

## Owner-rejected directions (never re-propose)

- peachweb-style abstract design (V2) — deleted entirely
- redrawn/"corrected" logo — original two-arc mark only
- centered tour chapters with sculpture behind content
- chapter navigation bar (pnav) inside atmosphere
- generic "development index" metric reused across systems
