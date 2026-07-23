# Tour engine internals — canonical code (extracted from atmosphere/index.html)

This is the reference implementation of the scroll mapping + draw loop with
the stacked-layout safety system. When behavior diverges from this, THIS is
the approved baseline (as of the session that built these skills).

```js
    canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const lerp=(a,b,t)=>a+(b-a)*t;

  let scrollP=0,smoothP=0,t=0,fadeK=1,visT=1,visS=1;
  const chapterEls=document.querySelectorAll(".tour .chapter");
  function measure(){
    const mid=window.scrollY+window.innerHeight/2, centers=[];
    chapterEls.forEach(s=>{const r=s.getBoundingClientRect();centers.push(r.top+window.scrollY+r.height/2);});
    // dissolve the sculpture at the tour boundaries so it never rides over
    // the stable sections before/after the tour
    const hold=window.innerHeight*0.25, span=window.innerHeight*0.5;
    if(mid<=centers[0]){scrollP=0;visT=1;fadeK=Math.max(0,Math.min(1,1-((centers[0]-mid)-hold)/span));return;}
    if(mid>=centers[centers.length-1]){scrollP=CH-1;visT=1;fadeK=Math.max(0,Math.min(1,1-((mid-centers[centers.length-1])-hold)/span));return;}
    fadeK=1;
    for(let i=0;i<centers.length-1;i++){
      if(mid>=centers[i]&&mid<centers[i+1]){
        const frac=(mid-centers[i])/(centers[i+1]-centers[i]);
        scrollP=i+Math.max(0,Math.min(1,(frac-0.38)/0.24));
        // on mobile the sculpture only lives while its chapter is settled
        // near the viewport center; it dissolves as the panel moves
        const d=Math.min(frac,1-frac);
        visT=Math.max(0,Math.min(1,(0.30-d)/0.12));
        break;
      }
    }
  }
  window.addEventListener("scroll",measure,{passive:true});
  measure();

  function frame(){
    if(!running){raf=null;return;}
    t+=0.016;
    smoothP+=(scrollP-smoothP)*0.12;
    ctx.clearRect(0,0,W,H);
    if(fadeK<=0.005){raf=requestAnimationFrame(frame);return;}
    const a=Math.max(0,Math.min(CH-1,Math.floor(smoothP))), b=Math.min(CH-1,a+1);
    const tt=ease(Math.min(1,Math.max(0,smoothP-a)));
    const SA=SHAPES[a],SB=SHAPES[b];
    const style=TRANS[b];
    smx+=(mx-smx)*0.05; smy+=(my-smy)*0.05;
    const ry=lerp(rotOf(a,t),rotOf(b,t),tt)+smx*0.4;
    const rx=-0.2+smy*0.28+Math.sin(t*0.2)*0.04;
    const sY=Math.sin(ry),cY=Math.cos(ry),sX=Math.sin(rx),cX=Math.cos(rx);
    let S=Math.min(W,H)*(isMobile?0.14:0.19)*lerp(SCALE[a],SCALE[b],tt);
    const dimF=lerp(DIM[a],DIM[b],tt);
    const cx=W*0.5+lerp(OFFX[a],OFFX[b],tt)*(W<=1020?0:W);
    let cy=H*(0.5+lerp(OFFY[a],OFFY[b],tt));
    let zoneK=1;
    if(isMobile){
      // geometric guarantee: the sculpture lives strictly inside the free
      // zone of its own chapter — below the readings card, above the
      // chapter bottom — measured fresh every frame with no smoothing,
      // so overlap with content is impossible at any scroll position
      const dom=chapterEls[Math.max(0,Math.min(CH-1,Math.round(smoothP)))];
      const sc0=dom.querySelector(".scard");
      const chB=dom.getBoundingClientRect().bottom;
      const zT=Math.max((sc0?sc0.getBoundingClientRect().bottom:H*0.55)+10,0);
      const zB=Math.min(chB-10,H-8);
      const zone=zB-zT;
      if(zone<90){zoneK=0;}
      else{
        zoneK=Math.min(1,(zone-90)/70);
        cy=zT+zone*0.52;
        S=Math.min(S,zone*0.16);
      }
    }
    const persp=4.1;
    visS+=(visT-visS)*0.16;
    const mobT=isMobile?visS*zoneK:1;
    const spiralAng=(1-tt)*2.3, burstK=1+Math.sin(Math.PI*tt)*(isMobile?0.3:1.05), depthZ=(1-tt)*6;
    const cosA=Math.cos(spiralAng),sinA=Math.sin(spiralAng);
    for(let i=0;i<N;i++){
      const p=parts[i],pa=SA[i],pb=SB[i];
      let ttp=tt;
      if(style==="rain"&&tt<1){const stag=(p.tw/6.28318)*0.4;ttp=Math.max(0,Math.min(1,(tt-stag)/0.6));ttp=ease(ttp);}
      let x=lerp(pa.x,pb.x,ttp), y=lerp(pa.y,pb.y,ttp), z=lerp(pa.z,pb.z,ttp);
      if(tt>0.0005&&tt<0.9995){
        if(style==="spiral"){const xr=x*cosA-y*sinA,yr=x*sinA+y*cosA;x=xr;y=yr;}
        else if(style==="rain"){y-=(1-ttp)*(isMobile?1.0:2.8);}
        else if(style==="depth"){z+=depthZ;}
        else if(style==="burst"){x*=burstK;y*=burstK;z*=burstK;}
      }
      const x1=x*cY+z*sY, z1=-x*sY+z*cY, y1=y*cX-z1*sX, z2=y*sX+z1*cX;
      const sc=persp/(persp+z2);
      const depth=Math.max(0,Math.min(1,(z2+2.2)/4.4));
      const rr=lerp(pa.col[0],pb.col[0],tt)|0, gg=lerp(pa.col[1],pb.col[1],tt)|0, bb=lerp(pa.col[2],pb.col[2],tt)|0;
      const alpha=((0.22+depth*0.6+0.08*Math.sin(t*2+p.tw))*(W<=1020?0.45:1)*mobT*dimF*fadeK).toFixed(3);
      ctx.fillStyle="rgba("+rr+","+gg+","+bb+","+alpha+")";
      ctx.beginPath();ctx.arc(cx+x1*S*sc,cy+y1*S*sc,p.sz*sc*(0.55+depth*0.65),0,6.28318);ctx.fill();
    }
    raf=requestAnimationFrame(frame);
  }

  size();
  window.addEventListener("resize",()=>{size();measure();});
  window.addEventListener("mousemove",e=>{mx=(e.clientX/W-.5)*0.5;my=(e.clientY/H-.5)*0.4;},{passive:true});
  const tourEl=document.getElementById("modules");
```
