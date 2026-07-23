---
name: keen-responsive-hardening
description: The five-tier responsive system of the Keen Comply sites and the Playwright screenshot-verification methodology that guards it. Use this skill WHENEVER fixing layout on any screen size, when the user reports "الريسبونسيف لا يعمل / مشاكل في وضع الجوال / شاشات الايباد / شاشتي / التصميم كبير أو مكسور", when adding a breakpoint or media query, when text/cards collapse or overflow horizontally, and BEFORE declaring any visual change complete — completion requires the verification matrix in this skill, not a single screenshot.
---

# Keen Responsive Hardening

Hard-won responsive architecture for the Keen Comply pages (index, v3,
showcase, atmosphere, en — they share one CSS structure). Read the tier table
first, then the root-cause catalog: most "new" bugs reported here are one of
these known classes.

## The five tiers

| Tier | Condition | Behavior |
|---|---|---|
| Phone | `max-width:620px` | 3D hero stage → static full-width stacked cards; tight type |
| Phone/large + small tablet | `max-width:760px` (tour extras) | compact chapter type (`.hx` 22–27px), smaller chips/cards |
| Stacked / tablet | `max-width:1020px` | all grids → `1fr`; horizontal scroll lists; tour JS uses stacked math (`isMobile = W<1020`) |
| Compact desktop | `min-width:1021px) and (max-height:880px` | **vh-based** type clamps (small laptops, 125–150% OS scaling) |
| Full desktop | wider AND taller | original design |

Key principle: **width alone is not enough.** Wide-but-short screens
(1280×590, 1366×690, 1536×700) hit max font sizes via `vw` clamps with no
height to hold them — the compact-desktop tier re-derives the scale from
height instead: `h1{font-size:clamp(28px,4.6vh,44px)}`,
`.hx{clamp(24px,4.6vh,36px)}`, section padding 96→64px, `.stage{height:min(540px,64vh)}` etc.

## Root-cause catalog (check these FIRST)

1. **Frozen breakpoint JS.** Any `const isMobile = innerWidth < X` computed at
   load breaks DevTools device emulation, rotation, and window resizing.
   Always `let` + re-assign inside the resize handler. (Shipped bug: sculpture
   used desktop math at 430px because the page loaded wide.)

2. **Flex shrink-to-fit collapse.** `.hero` is `display:flex`; its `.wrap`
   child shrank to the text column's width, and `.stage` — whose children are
   all `position:absolute` — collapsed to **width 0**, rendering cards as 54px
   slivers on iPad. Fix: `.hero>.wrap{width:100%}` and explicit `width:100%`
   on the stage at stacked sizes. Suspect this whenever percent-width children
   of an absolutely-positioned stack look "crushed".

3. **Grid blowout via nowrap.** Grid children default `min-width:auto`; a
   `white-space:nowrap` chip (`.tagx`) forced a column wider than the viewport
   → 6px horizontal overflow, visible only in LTR (RTL hides start-side
   overflow from scrollWidth, so ALWAYS test overflow on the EN page too).
   Fix: `.split>*{min-width:0}` + let flex rows wrap.

4. **`overflow-x:clip` on html kills position:sticky** descendants. Contain
   real bleeds locally (`.sectors{overflow:hidden}`) instead.

5. **offsetTop lies** inside positioned ancestors — compute scroll anchors
   with `getBoundingClientRect().top + scrollY`.

6. **3D hero cards on phones**: `<620px` replace the perspective stage with
   `.stage{height:auto;perspective:none} .stage-inner{position:static;transform:none!important}
   .fcard{position:static;transform:none!important;animation:none;width:100%!important}`.

## Verification matrix (mandatory before "done")

Viewports: **390×844, 430×932** (phones) · **768×1024, 820×1180** (tablets
portrait) · **1180×820** (tablet landscape) · **1280×590, 1366×690, 1536×700**
(short laptops / OS scaling) · **1440×900, 1920×1080** (desktop). Plus the
**emulation-switch scenario**: load at 1280+, `page.setViewportSize()` to a
phone WITHOUT reload, verify again — this catches every frozen-breakpoint bug.

Bundled scripts (run with `node`, playwright-core + `/opt/pw-browsers/chromium`
`--no-sandbox`; install playwright-core in the scratchpad if missing):

- `scripts/probe-responsive.js <file-url|path>...` — for each page × the
  matrix: scroll the full page, report `scrollWidth-clientWidth` (must be 0)
  and count `pageerror`s (must be 0).
- `scripts/find-overflow.js <url> <width>` — when overflow ≠ 0: lists elements
  whose rect exceeds the viewport AND whose ancestors don't clip — the actual
  contributors, not the harmless clipped decorations.
- `scripts/shoot-sections.js <url> <w> <h>` — screenshots hero + each major
  section (`#engine #legislation #modules #roi #contact`) after settle waits.

Screenshot rules: scroll in 8–10 steps (~80ms apart) so scroll handlers fire,
then `waitForTimeout(1800+)` for eased state to settle; read the images —
never trust "it should be fine". Send the user before/after screenshots of
THEIR reported case reproduced at THEIR viewport.

## Reporting discipline

The owner requires 100% verification before reporting back. A fix report must
state: root cause, what changed, the exact viewports verified, and attach the
reproduction screenshots. If the user views the deployed site, remind them to
hard-refresh (Ctrl+Shift+R).
