# The compact-desktop CSS layer (canonical)

Applied identically to index, v3, showcase, atmosphere, en. Height-based
clamps for wide-but-short screens. Tour pages additionally carry the .hx/.px
block in their tour styles.

```css
  /* ============ compact desktop: wide but short screens
     (small laptops, 125-150% OS scaling) — scale type and
     rhythm by available height, not just width ============ */
  @media (min-width:1021px) and (max-height:880px){
    h1{font-size:clamp(28px,4.6vh,44px);margin:16px 0}
    .lead{font-size:15.5px;margin-bottom:20px;max-width:500px}
    .hero{padding:120px 0 64px}
    .hero-feats{gap:12px;padding:16px 0;margin-bottom:22px}
    .stage{height:min(540px,64vh)}
    section{padding:64px 0}
    .head{margin-bottom:40px}
    .head h2,.split h2{font-size:clamp(22px,3.6vh,32px)}
    .split-h{font-size:clamp(22px,3.6vh,32px) !important}
    .stat b{font-size:clamp(22px,3.4vh,32px)}
    .stats{padding:48px 0}
    .xpl-inner h3{font-size:clamp(19px,2.9vh,25px)}
    .roi-result .rnum{font-size:clamp(40px,7vh,58px)}
    .roi-result .rrisk{font-size:clamp(30px,5.4vh,44px)}
    .contact-band h2{font-size:clamp(21px,3.4vh,30px)}
  }
  @media (max-width:620px){
    .wrap{padding:0 20px}
    section{padding:68px 0}
```
