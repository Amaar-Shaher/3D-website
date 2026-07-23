---
name: keen-particle-engine
description: Zero-dependency canvas-2D 3D particle sculpture engine used across the Keen Comply marketing sites (index, showcase, atmosphere, en, journey pages). Use this skill WHENEVER building, editing, or debugging any particle sculpture, morphing shape, hero logo motif, 3D point cloud, canvas animation, or "الشكل المتحرك / التشكيل الجسيمي / المجسم" on these sites — including adding a new system icon shape, changing transition choreography, fixing rotation/flattening issues, or building a similar engine for a new page. CDN libraries (Three.js etc.) are BLOCKED by the environment proxy; this hand-rolled engine is the only approach that works.
---

# Keen Particle Engine

A self-contained canvas-2D engine that renders morphing 3D point-cloud sculptures
(shields, radars, folders, people…) with zero external dependencies. It lives
inline in a `<script>` IIFE in each page. This skill documents its exact math,
conventions, and hard-won gotchas so changes stay consistent.

## Core architecture

- **Shapes** are arrays of exactly `N` points `{x,y,z,col:[r,g,b]}` in a roughly
  ±1.7 unit space. `N = 850` when `innerWidth < 1020` at load, else `1400`.
  Do not rebuild shapes on resize — density staying constant is fine.
- **Particles** carry per-point randomness: `parts[i] = {tw: R2(), sz: 0.9+rand*1.7}`
  (`tw` = phase twist used for stagger + alpha shimmer, `R2()` = `Math.random()*6.28318`).
- **Every frame**: interpolate point positions/colors between shape A and B,
  apply transition choreography, rotate (Y then X), project with perspective,
  draw depth-shaded dots.

## Projection & rotation (exact formulas)

```js
const ry = lerp(rotOf(a,t), rotOf(b,t), tt) + smx*0.4;         // mouse parallax smx/smy eased *0.05
const rx = -0.2 + smy*0.28 + Math.sin(t*0.2)*0.04;
const sY=Math.sin(ry), cY=Math.cos(ry), sX=Math.sin(rx), cX=Math.cos(rx);
// per point: Y-rotation then X-rotation
const x1 = x*cY + z*sY, z1 = -x*sY + z*cY, y1 = y*cX - z1*sX, z2 = y*sX + z1*cX;
const persp = 4.1;
const sc = persp/(persp + z2);                                  // perspective scale
const depth = clamp((z2+2.2)/4.4, 0, 1);                        // 0 far → 1 near
// draw at (cx + x1*S*sc, cy + y1*S*sc), radius p.sz*sc*(0.55+depth*0.65)
// alpha = (0.22 + depth*0.6 + 0.08*sin(t*2+p.tw)) * dimFactor * fades
```

`S` (world→px scale) is `Math.min(W,H) * 0.19` on desktop. A shape's practical
half-extent on screen is ≈ **2.9·S** (radius 1.7 × near-perspective ≈ 1.7) —
use this to fit shapes into bounded areas.

### Rotation modes — critical for readability

`MODE[i]` per chapter: `"osc"` → `Math.sin(t*SPIN[i])*AMP[i]` (oscillates, never
shows the shape edge-on) vs `"spin"` → `t*SPIN[i]` (continuous). **Flat shapes
(radar rings, council arcs, target) MUST use `osc`** — continuous spin turns
them into an unreadable line every half-turn. Typical `SPIN` 0.3–0.45,
`AMP` 0.12–0.5 (smaller AMP for wide flat shapes).

## Morphing & transition choreography

Scroll progress `smoothP` eases toward `scrollP` at `*0.12/frame`. Per frame:
`a = floor(smoothP)`, `b = a+1`, `tt = ease(frac)` with
`ease = t<.5 ? 4t³ : 1-((-2t+2)³)/2`.

`TRANS[b]` picks the incoming chapter's choreography. **All transition offsets
must be gated** with `if(tt>0.0005 && tt<0.9995){...}` — without the gate,
rest states leak the effect (e.g. the intro logo rendered shifted up because
rain's offset applied at tt=0).

```js
const spiralAng=(1-tt)*2.3, burstK=1+Math.sin(Math.PI*tt)*(stacked?0.3:1.05), depthZ=(1-tt)*6;
// rain:  per-particle stagger  stag=(p.tw/6.28318)*0.4; ttp=ease(clamp((tt-stag)/0.6));  y -= (1-ttp)*(stacked?1.0:2.8)
// spiral: rotate xy by spiralAng      | depth: z += depthZ      | burst: xyz *= burstK
```

On stacked layouts (width<1020) amplitudes are damped (values above) so
particles never fly over content; see the keen-scrollytelling-tour skill for
the full mobile visibility system.

## Shape library & builders

Shapes live as `S_*()` functions returning `fit(points)` (`fit` pads/trims to
exactly N by jittering random existing points ±0.05). Existing library:
`S_logo, S_shield, S_matrix, S_flow, S_docs, S_audit, S_org, S_alert,
S_council, S_bcm, S_radar, S_globe, S_chaos, S_gyro, S_bars, S_target,
S_merge, S_folder, S_clip, S_building, S_mega, S_users, S_pulse`.

Builder helpers (use these when adding a shape):
- `tube(x1,y1,z1, x2,y2,z2, count, col, out)` — particle line segment with jitter
- `arc(cx,cy,r, a0,a1, count, col, out, z)` — arc in the XY plane
- `blob(cx,cy,cz, radius, count, col, out)` — fuzzy sphere cluster

Color constants are `[r,g,b]` arrays matching the brand (crimson `[193,2,48]`,
gold `[249,161,27]`, green `[46,157,92]`, ink-gray `[87,73,61]`). During morphs
colors lerp per-channel with `tt` (not `ttp`).

### Canvas Y is DOWN

Math intuition says +y is up; canvas +y is down. **Negate y anchors** when
transcribing a drawn figure or the checkmark renders upside-down (this bug
shipped once — the red check appeared as ∧). Test any new shape visually
before committing.

### The Keen logo shape (S_logo) — do not "improve" it

The approved mark is the ORIGINAL two-arc broken circle (gold, thicker lower-left
arc, gap upper-right) with the red check anchored slightly right of center.
A previous attempt to redraw it "more accurately" was rejected by the owner —
if asked to touch the logo, revert toward the original two-arc construction,
never invent geometry.

## Performance & lifecycle rules

- One `requestAnimationFrame` loop per canvas; gate with an IntersectionObserver
  (`rootMargin:"20% 0px 20% 0px"`) setting `running`, and `visibilitychange`.
  When not running, let the raf handle exit (`if(!running){raf=null;return;}`).
- `dpr = Math.min(devicePixelRatio, 2)`; canvas sized `W*dpr × H*dpr` with
  `ctx.setTransform(dpr,0,0,dpr,0,0)`. Re-run `size()` on resize.
- `prefers-reduced-motion`: render one static frame and stop.
- One `getBoundingClientRect()` read per frame is fine; never write layout
  from the draw loop.

## Environment constraints

- **No CDNs**: cdnjs/unpkg/jsdelivr are blocked by the proxy. Everything inline.
- Fonts are self-hosted base64 woff2 in `assets/fonts/fonts.css` (Google Fonts
  CSS is reachable via curl for building that file, but pages must not link it).
- Verify visually with Playwright: executable `/opt/pw-browsers/chromium`,
  `args:['--no-sandbox']`, `playwright-core` installed in the scratchpad.
  Screenshot after `waitForTimeout(≥1800)` so `smoothP` settles (~1s at 0.12).
