---
name: keen-scrollytelling-tour
description: The chapter-synced scrollytelling "systems tour" used in showcase/, atmosphere/ and en/ on the Keen Comply site — sticky canvas, per-chapter particle sculptures, per-system color ambience, plateau scroll mapping, settle-based visibility, and the geometric zone that makes sculpture/content overlap impossible on stacked layouts. Use this skill WHENEVER touching the systems section, chapters, scroll-driven animation, sculpture placement or overlap bugs ("الشكل خلف البطاقات / في المنتصف / Scrollytelling / جولة الأنظمة"), adding or reordering a system chapter, changing ambience colors, or building a new scroll-driven journey page for this project.
---

# Keen Scrollytelling Tour

The tour = one sticky full-viewport canvas + N `.chapter` blocks inside
`#modules`. Each chapter carries its own accent theming; the canvas draws the
morphing sculpture synced to which chapter is centered. Three pages share this
system: `showcase/` (tour only), `atmosphere/` (tour + ambience — the flagship),
`en/` (LTR mirror of atmosphere).

## Layout skeleton

```html
<section id="modules" class="tour">
  <canvas>  <!-- position:sticky;top:0;height:100vh;margin-bottom:-100vh -->
  <div class="chapter" data-tint="#E4EAE2" data-acc="#2e9d5c" data-ch="0"
       style="--acc:...;--accbg:...;--accbd:...">
    <div class="panel">        <!-- sticky top:0; min-height:100vh; flex-centered -->
      <div class="panel-in">   <!-- .gnum watermark, .kick chip, .hx title,
                                    .px lead, .chips row, .scard readings -->
```

Chapters alternate sides on desktop via `.panel.left` and
`OFFX = [-0.24, 0.24, -0.24, ...]` (sculpture opposite the text). The owner
explicitly rejected center-position chapters and the chapter nav bar (pnav) in
atmosphere — right/left alternation ONLY. In `en/` the OFFX signs are negated.

## Scroll mapping (the plateau) — measure()

```js
const mid = scrollY + innerHeight/2;
centers[i] = rect.top + scrollY + rect.height/2;   // rect-based — NEVER offsetTop
// offsetTop is relative to the nearest positioned ancestor and gave wrong centers here.
for consecutive centers:  frac = (mid-centers[i])/(centers[i+1]-centers[i]);
scrollP = i + clamp((frac-0.38)/0.24, 0, 1);
```

The 0.38→0.62 window means the sculpture rests fully-formed while the reader
is anywhere near a chapter, and the whole morph happens in the middle 24% of
the gap. Earlier, wider windows (0.22–0.78) left sculptures mid-flight over
readable text — the owner flagged it repeatedly. Keep the window tight.

**Boundary dissolve (fadeK):** before the first / after the last center, fade
alpha out over `hold = 0.25·vh`, `span = 0.5·vh` so the sculpture never rides
over the stable sections before/after the tour (the radar once slid over the
"steps" section — this is the fix).

## Stacked-layout safety system (width < 1020)

Three independent layers make overlap with content impossible. All three exist
because timing-only fixes failed twice in production screenshots:

1. **Live breakpoint.** `let isMobile = innerWidth < 1020`, re-set inside
   `size()` on every resize. It was originally `const` — opening DevTools device
   emulation after load kept desktop math and drew the sculpture mid-screen.
   The threshold matches the CSS stacking breakpoint (1020), not phone width.

2. **Per-frame geometric zone (no smoothing, no stored state):**
```js
const dom = chapterEls[clamp(Math.round(smoothP), 0, CH-1)];
const zT = Math.max(dom.querySelector(".scard").getBoundingClientRect().bottom + 10, 0);
const zB = Math.min(dom.getBoundingClientRect().bottom - 10, H - 8);
const zone = zB - zT;
if (zone < 90) zoneK = 0; else {
  zoneK = Math.min(1, (zone-90)/70);
  cy = zT + zone*0.52;
  S  = Math.min(S, zone*0.16);        // half-extent ≈ 2.9S ≤ 0.46·zone → always inside
}
```
   Same-frame rects mean the sculpture rides its own chapter's empty band like
   an in-flow element. A previous version smoothed a stored `bandS` — the lag
   put particles over incoming cards. Do not reintroduce smoothing here.

3. **Settle-based visibility (visT/visS):** in `measure()`,
   `d = min(frac, 1-frac); visT = clamp((0.30-d)/0.12, 0, 1)` (1 before/after the
   tour edges — fadeK covers those). In the frame loop
   `visS += (visT-visS)*0.16; mobT = isMobile ? visS*zoneK : 1` multiplies alpha.
   The sculpture is fully visible only while its panel is settled at center,
   dissolves the moment the panel starts sliding, and hands off between
   chapters while fully hidden. (Fading on morph-`tt` alone was NOT enough:
   panels start moving before `tt` leaves the plateau.)

Transition amplitudes are also damped when stacked: rain fall 2.8→1.0,
burst 1.05→0.3.

## Per-system ambience (atmosphere/ and en/)

- Chapter carries `data-tint` (section background) and `data-acc` + inline
  `--acc/--accbg/--accbd` custom properties consumed by kick/chips/scard/rings.
- Scroll handler lerps `#modules` background-color toward the dominant
  chapter's tint; an IntersectionObserver clears it when the tour leaves view.
- `.t-aura` = fixed, `inset:-20%`, `blur(90px)` aurora blobs colored via
  `currentColor`; `.u1/.u2/...` drift with long keyframe animations.
- `.gnum` = giant watermark number, `position:absolute; z-index:-1`,
  `font-size:clamp(90px,18vw,300px)`, opacity .055 (.04 stacked).

## Readings card (.scard)

Three `.sc` tiles per chapter with system-specific metrics: SVG ring gauge
(r=24 → `stroke-dasharray:151`, animate `stroke-dashoffset` to `151·(1-pct)`),
count-up `b.kv` number, and `.sbars` growing bars (`direction:ltr` so bars read
left→right even in RTL). One IntersectionObserver animates on enter AND resets
on exit so the animation replays. Data comes from `data-pct/kv/suf/bars`
attributes. Every system must use metrics specific to its domain (the owner
replaced a generic "development index" — never reuse one metric across systems).

## Verification protocol for any tour change

Screenshot at true chapter centers AND mid-transitions, per viewport class:

```js
const c = chapterRect.top + scrollY + rect.height/2 - innerHeight/2;   // center
// capture at c, c + gap*0.27 (leaving), c + gap*0.5 (handoff)
// scroll gradually (8-10 steps, ~80ms apart), then waitForTimeout(≥1800)
```

Minimum matrix: 390×844, 430×932 (phones) · 820×1180, 768×1024 (tablets) ·
1280×590 (short laptop) · 1440×900 (desktop) — plus the emulation-switch case:
load at 1280 wide, `setViewportSize` to a phone size WITHOUT reload, then check.
Also run the overflow/error probe (see keen-responsive-hardening skill,
`scripts/probe-responsive.js`). Never report done without these screenshots.
