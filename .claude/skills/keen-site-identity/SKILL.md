---
name: keen-site-identity
description: Brand identity, repo map, RTL/EN mirroring rules, and delivery conventions for the Keen Comply 3D marketing site (Amaar-Shaher/3D-website). Use this skill at the START of ANY work on this project — new pages, edits, translations, colors, fonts, logo, deployment, "الهوية / الألوان / الخطوط / الشعار / النسخة الإنجليزية / انشر / ارفع التعديلات" — and whenever deciding where a change belongs among the pages or how to commit/push it.
---

# Keen Comply Site Identity & Conventions

Single source of truth for the Keen Comply (Tamkeen GRC) marketing-site
project. Consult before changing anything; owner approvals below are binding.

## Brand tokens

| Token | Value | Use |
|---|---|---|
| crimson `--crimson` | `#C10230` | primary accent, CTA, check mark |
| deep | `#7A0220` | crimson gradients' dark end |
| gold `--gold` | `#F9A11B` | logo arcs, highlights, underlines |
| paper | `#FBFAF8` / section alt `#F4F1EE` | backgrounds |
| line | `#EBE6E2` | borders |
| ink | `#17110D` | headings |
| slate | `#57493D`-family | body text |
| green | `#2E9D5C` | success/compliance metrics |

Fonts: **IBM Plex Sans Arabic** (body/AR) + **Sora** (numbers/latin display),
self-hosted as base64 woff2 in `assets/fonts/fonts.css` — CDNs are blocked;
never add a Google Fonts `<link>`. Numbers/KPIs use Sora with `direction:ltr`.

Logo: amber/gold broken circle of TWO arcs (thicker lower-left, gap upper-right)
+ red check anchored right-of-center; gray "Keen Comply" wordmark, tagline
"أتمتة وحوكمة سيادية" / "Sovereign automation & governance". The owner rejected
a redrawn "accurate" version — keep the original construction everywhere
(header SVG, footer, particle S_logo).

Per-system accents (tour chapters 01–10): green #2e9d5c, crimson #C10230,
purple, orange/gold, teal, blue-gray, magenta, indigo, amber, orange-red —
each chapter sets `data-acc`, `data-tint` and `--acc/--accbg/--accbd` inline.

## Repo map (github.com/Amaar-Shaher/3D-website, branch `main`)

| Path | Status | What it is |
|---|---|---|
| `index.html` | stable V1 | approved main site: hero 3D cards, marquee, stats, engine, legislation tabs, systems explorer, steps, ROI calc, contact, sectors |
| `showcase/` | stable | V1 + sculpture tour inside #modules only |
| `atmosphere/` | **flagship** | showcase + per-system ambience; the version the owner iterates on |
| `en/` | flagship EN | full LTR English edition of atmosphere |
| `v3/` | kept | scroll-interactive variant |
| `systems/`, `systems/01..10/` | kept | collective + standalone per-system journeys |
| `journey/`, `experience/` | kept | light/dark immersive editions |
| `assets/fonts/fonts.css` | shared | base64 fonts |
| `.claude/skills/` | — | these skills |

Shared-CSS rule: index, v3, showcase, atmosphere, en share the same base
structure — bug fixes in shared areas (hero, sections, breakpoints) must be
applied to ALL of them (tour-engine fixes to the 3 tour pages). Never modify
`showcase/` when the request targets `atmosphere/` behavior differences.

## RTL ↔ EN mirroring checklist (when syncing atmosphere → en)

- Negate tour `OFFX` array signs; hero motif `cx` flips to `W/2 + min(W,1400)*0.335`.
- Reverse the hero-veil gradient direction; `#progress` anchors left.
- `.leg-tab` text-align flips; keep `.sbars`/KPIs `direction:ltr` in BOTH.
- Translate EVERY string, then sweep for leftovers with an Arabic-script regex
  (`[؀-ۿ]`) — expect only the intentional "عربي" switch button.
  (Two sweep rounds were needed historically; always re-grep.)
- Language switch buttons: `EN` in header of AR pages ↔ `عربي` on en/.

## Delivery conventions

- Work in `/workspace/3d-website`; push to `origin main`
  (`git push -u origin main`, retry on network errors with backoff).
- Committer identity must be `Claude <noreply@anthropic.com>` (stop-hook
  requirement): `git config user.email noreply@anthropic.com && git config user.name Claude`.
- Do NOT touch the Hello-World- repo — the owner cancelled it; it is read-only.
- The owner communicates in Arabic — reply in Arabic, lead with the outcome,
  attach reproduction/verification screenshots via SendUserFile for every
  visual change, and only report after the full verification matrix passes
  (see keen-responsive-hardening). Remind about hard-refresh (Ctrl+Shift+R)
  when they view the deployed site.
- Owner-approved design decisions (do not revisit without being asked):
  original logo only · no center-position tour chapters · no pnav in
  atmosphere · V2 deleted · system-specific metrics per readings card ·
  tight morph window (sculptures rest while text is readable).
