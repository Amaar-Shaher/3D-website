# Shape recipes — builders and exemplar sculptures

Canonical helpers and two representative shapes, extracted verbatim from
atmosphere/index.html. Every shape returns `fit(points)` (pads/trims to N).
Coordinates live in roughly ±1.7 units; canvas Y is DOWN (negate hand-drawn
Y anchors). Colors are [r,g,b] arrays; hx("#hex") converts.

## Builder helpers
```js
  const R2 = () => Math.random() * 6.28318;
  const hx = h => { const n = parseInt(h.slice(1),16); return [n>>16&255,n>>8&255,n&255]; };
  const GOLD=hx("#F9A11B"), CRIM=hx("#C10230"), DEEP=hx("#7A0220"), INK=[46,36,28], SLATE=[125,112,100],
        GREEN=hx("#2e9d5c"), VIOLET=hx("#7c3aed"), ORANGE=hx("#e2790f"), TEAL=hx("#0d9488"),
        ROSE=hx("#e11d48"), INDIGO=hx("#4f46e5"), AMBER=hx("#C77A05");

  function tube(P,Q,n,rj,col,out){
    for(let i=0;i<=n;i++){const t=i/n,a=R2(),r=Math.random()*rj;
      out.push({x:P.x+(Q.x-P.x)*t+Math.cos(a)*r,y:P.y+(Q.y-P.y)*t+Math.sin(a)*r*0.8,z:(Math.random()-.5)*rj*1.6,col});}
  }
  function blob(cx,cy,cz,r,n,col,out){
    for(let i=0;i<n;i++){const rr=Math.pow(Math.random(),.55)*r,th=R2(),ph=Math.acos(2*Math.random()-1);
      out.push({x:cx+rr*Math.sin(ph)*Math.cos(th),y:cy+rr*Math.sin(ph)*Math.sin(th),z:cz+rr*Math.cos(ph),col});}
  }
  function arc(cx,cy,r,a0,a1,n,rj,col,out){
    for(let i=0;i<n;i++){const a=a0+Math.random()*(a1-a0),j=()=> (Math.random()-.5)*rj;
      out.push({x:cx+Math.cos(a)*r+j(),y:cy+Math.sin(a)*r+j(),z:j()*1.6,col});}
  }
  function fit(pts){
    while(pts.length<N){const p=pts[Math.floor(Math.random()*pts.length)];
      pts.push({x:p.x+(Math.random()-.5)*.05,y:p.y+(Math.random()-.5)*.05,z:p.z+(Math.random()-.5)*.05,col:p.col});}
    return pts.slice(0,N);
  }

```

## Exemplar: S_shield (outline arcs + interior check in brand colors)
```js
  function S_shield(){
    const p=[];
    for(let i=0;i<N*0.5;i++){const a=(i/(N*0.5))*6.28318,ca=Math.cos(a);
      const x=1.05*Math.sin(a)*(0.78+0.22*ca), y=-ca*(ca>0?0.92:1.22), j=()=> (Math.random()-.5)*0.09;
      p.push({x:x+j(),y:y+j(),z:(Math.random()-.5)*0.22,col:GREEN});}
    for(let i=0;i<N*0.14;i++) p.push({x:(Math.random()-.5)*1.55,y:-0.92+(Math.random()-.5)*0.09,z:(Math.random()-.5)*0.2,col:GREEN});
    tube({x:-0.5,y:0.12},{x:-0.08,y:0.52},Math.floor(N*0.12),0.07,CRIM,p);
    tube({x:-0.08,y:0.52},{x:0.66,y:-0.34},Math.floor(N*0.2),0.07,CRIM,p);
    return fit(p);
  }
  function S_matrix(){
    const p=[]; const per=Math.floor(N/25);
    const ramp=[GREEN,hx("#8CC63F"),hx("#f3c04c"),hx("#E07B23"),CRIM];
    for(let r=0;r<5;r++)for(let c=0;c<5;c++){
      const sev=Math.min(4,Math.round((c+(4-r))/2));
      blob((c-2)*0.78,(r-2)*0.6,0,0.21,per,ramp[sev],p);
    }
    return fit(p);
  }
  function S_flow(){
    const p=[]; const A={x:-1.55,y:-0.7},B={x:0,y:0.1},C={x:1.55,y:-0.55};
    tube(A,B,Math.floor(N*0.22),0.07,SLATE,p);
```

## Exemplar: S_radar (flat rings — MUST use MODE "osc", never "spin")
```js
  function S_radar(){
    const p=[];
    arc(0,0,0.55,0,6.28318,Math.floor(N*0.1),0.05,SLATE,p);
    arc(0,0,1.05,0,6.28318,Math.floor(N*0.14),0.05,SLATE,p);
    arc(0,0,1.55,0,6.28318,Math.floor(N*0.18),0.05,GOLD,p);
    for(let i=0;i<N*0.2;i++){const ang=-0.45+Math.random()*0.55,r=Math.random()*1.55;
      p.push({x:Math.cos(ang)*r,y:Math.sin(ang)*r,z:(Math.random()-.5)*0.08,col:CRIM});}
    [[0.7,2.2],[1.25,3.6],[0.9,5.1],[1.45,0.9]].forEach(([r,ang])=>blob(Math.cos(ang)*r,Math.sin(ang)*r,0,0.09,Math.floor(N*0.02),DEEP,p));
    return fit(p);
  }
  function S_globe(){
    const p=[]; const GA=Math.PI*(3-Math.sqrt(5));
    for(let i=0;i<N;i++){const yy=1-(i/(N-1))*2,rad=Math.sqrt(1-yy*yy),th=GA*i;
      p.push({x:Math.cos(th)*rad*1.6,y:yy*1.6,z:Math.sin(th)*rad*1.6,col:Math.abs(yy%0.28)<0.03?CRIM:GOLD});}
    return p;
  }

  
  function S_target(){
    const p=[];
    arc(0,0,1.18,0,6.28318,Math.floor(N*0.3),0.07,CRIM,p);
    arc(0,0,0.76,0,6.28318,Math.floor(N*0.24),0.06,GOLD,p);
```

## Adding a new shape
1. Write `S_name()` near the library, composing tube/arc/blob; return `fit(p)`.
2. Append to SHAPES, MODE ("osc" unless clearly volumetric), SPIN, AMP, OFFX
   (alternate sign), OFFY (0), SCALE (1), DIM (1), TRANS (vary the sequence).
3. Screenshot it at rest at 1440×900 AND 390×844 before committing —
   check orientation (Y-down!), readability at the osc extremes, and color mix.
