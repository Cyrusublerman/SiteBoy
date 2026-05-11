const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/marching-squares-BuVLBh1w.js","assets/chunk-62oNxeRG.js","assets/curve-geometry-CZ4bR6Um.js","assets/polygon-operations-7-O0nbjO.js","assets/index-DcgRvGZg.js","assets/animation-foundation-CjDnqZPq.js","assets/Text-fKAgHefr.js","assets/foundation-BEfhACXy.js","assets/index-DLEJXQML.css"])))=>i.map(i=>d[i]);
import{n as e}from"./chunk-62oNxeRG.js";import{o as t}from"./index-DcgRvGZg.js";var n=e({contourSTL:()=>o,exportArtworkSTLs:()=>c,generateBox:()=>i,vectorizePixels:()=>r});function r(e,t,n){let r=[],i=new Set,a=Array(n).fill(null).map(()=>Array(t).fill(!1));for(let r of e){let[e,i]=r.split(`,`).map(Number);i>=0&&i<n&&e>=0&&e<t&&(a[i][e]=!0)}for(let e=0;e<n;e++)for(let o=0;o<t;o++){let s=`${o},${e}`;if(!a[e][o]||i.has(s))continue;let c=1,l=1;for(;o+c<t&&a[e][o+c]&&!i.has(`${o+c},${e}`);)c++;let u=!0;for(;u&&e+l<n;){for(let t=0;t<c;t++)if(!a[e+l][o+t]||i.has(`${o+t},${e+l}`)){u=!1;break}u&&l++}for(let t=0;t<l;t++)for(let n=0;n<c;n++)i.add(`${o+n},${e+t}`);r.push({x:o,y:e,w:c,h:l})}return r}function i(e,t,n,r,i,a){return`facet normal 0 0 -1
  outer loop
    vertex ${e} ${t} ${n}
    vertex ${r} ${t} ${n}
    vertex ${r} ${i} ${n}
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex ${e} ${t} ${n}
    vertex ${r} ${i} ${n}
    vertex ${e} ${i} ${n}
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex ${e} ${t} ${a}
    vertex ${r} ${i} ${a}
    vertex ${r} ${t} ${a}
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex ${e} ${t} ${a}
    vertex ${e} ${i} ${a}
    vertex ${r} ${i} ${a}
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex ${e} ${t} ${n}
    vertex ${r} ${t} ${n}
    vertex ${r} ${t} ${a}
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex ${e} ${t} ${n}
    vertex ${r} ${t} ${a}
    vertex ${e} ${t} ${a}
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex ${e} ${i} ${n}
    vertex ${r} ${i} ${a}
    vertex ${r} ${i} ${n}
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex ${e} ${i} ${n}
    vertex ${e} ${i} ${a}
    vertex ${r} ${i} ${a}
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex ${e} ${t} ${n}
    vertex ${e} ${i} ${a}
    vertex ${e} ${i} ${n}
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex ${e} ${t} ${n}
    vertex ${e} ${t} ${a}
    vertex ${e} ${i} ${a}
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex ${r} ${t} ${n}
    vertex ${r} ${i} ${n}
    vertex ${r} ${i} ${a}
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex ${r} ${t} ${n}
    vertex ${r} ${i} ${a}
    vertex ${r} ${t} ${a}
  endloop
endfacet
`}function a(e,t,n){let r=t+2,i=n+2,a=new Float32Array(r*i);for(let i of e){let[e,o]=i.split(`,`).map(Number);e>=0&&e<t&&o>=0&&o<n&&(a[(o+1)*r+(e+1)]=1)}return{field:a,fieldW:r,fieldH:i}}async function o(e,n,r,i,o,c,l={}){let{simplifyTolerance:u=.3,chaikinIterations:d=2,minContourArea:f=2}=l;if(e.size===0)return``;let[{extractContours:p,simplifyContour:m},{chaikinSmooth:h},{earClipTriangulate:g,polygonArea:_,ensureCCW:v}]=await Promise.all([t(()=>import(`./marching-squares-BuVLBh1w.js`).then(e=>e.s),__vite__mapDeps([0,1])),t(()=>import(`./curve-geometry-CZ4bR6Um.js`).then(e=>e.s),__vite__mapDeps([2,1])),t(()=>import(`./polygon-operations-7-O0nbjO.js`).then(e=>e.o),__vite__mapDeps([3,4,1,5,6,7,8]))]),{field:y,fieldW:b,fieldH:x}=a(e,n,r),S=p(y,b,x,.5,{cellSize:1});if(S.length===0)return[];let C=[];for(let e of S){if(e=e.map(e=>({x:e.x-1,y:r-(e.y-1)})),Math.abs(_(e))<f||(u>0&&e.length>4&&(e=m(e,u)),d>0&&e.length>=3&&(e=h(e,d,!0)),e.length<3))continue;e=v(e);let t=s(e.map(e=>({x:e.x*c,y:e.y*c})),i,o,g);for(let e=0;e<t.length;e++)C.push(t[e])}return C}function s(e,t,n,r){let i=[],a=e.length,o=r(e);for(let[e,t,r]of o)i.push(`facet normal 0 0 1
  outer loop
    vertex ${e.x} ${e.y} ${n}
    vertex ${t.x} ${t.y} ${n}
    vertex ${r.x} ${r.y} ${n}
  endloop
endfacet
`);for(let[e,n,r]of o)i.push(`facet normal 0 0 -1
  outer loop
    vertex ${e.x} ${e.y} ${t}
    vertex ${r.x} ${r.y} ${t}
    vertex ${n.x} ${n.y} ${t}
  endloop
endfacet
`);for(let r=0;r<a;r++){let o=e[r],s=e[(r+1)%a],c=s.x-o.x,l=s.y-o.y,u=Math.sqrt(c*c+l*l),d=u>1e-8?l/u:0,f=u>1e-8?-c/u:0;i.push(`facet normal ${d} ${f} 0
  outer loop
    vertex ${o.x} ${o.y} ${t}
    vertex ${s.x} ${s.y} ${t}
    vertex ${s.x} ${s.y} ${n}
  endloop
endfacet
facet normal ${d} ${f} 0
  outer loop
    vertex ${o.x} ${o.y} ${t}
    vertex ${s.x} ${s.y} ${n}
    vertex ${o.x} ${o.y} ${n}
  endloop
endfacet
`)}return i}function c(e,t,n){let{imageWidth:a,imageHeight:o,printWidth:s,layerHeight:c,isGrid:u=!1,tileSize:d,gap:f=0,perimeterMargin:p=0,gapFillEnabled:m=!1,gapFilamentName:h=null,baseLayers:g=0,totalLayers:_=null}=n,v=_||e.length,y={},b=e[0].length;for(let n=0;n<b;n++){let _=[],b=0;for(let t=0;t<e.length;t++){let l=e[t][n];if(l.size===0)continue;let m=r(l,a,o);b+=m.length;let h=t*c,g=h+c;for(let e of m)if(u)for(let t=0;t<e.h;t++)for(let n=0;n<e.w;n++){let r=e.x+n,a=e.y+t,o=p+r*(d+f),s=p+a*(d+f),c=o+d,l=s+d;_.push(i(o,s,h,c,l,g))}else{let t=s/a,n=e.x*t,r=e.y*t,o=(e.x+e.w)*t,c=(e.y+e.h)*t;_.push(i(n,r,h,o,c,g))}}if(u&&m&&h&&t[n]===h&&_.push(l(a,o,d,f,p,c,g,v)),_.length>0){let e=`Artwork_${t[n]}`,r=`artwork_${t[n].replace(/[^a-zA-Z0-9]/g,`_`)}.stl`;y[r]=[`solid ${e}\n`,..._,`endsolid ${e}\n`]}}return y}function l(e,t,n,r,a,o,s,c){let l=``;if(r===0&&a===0)return l;let u=e*n+(e-1)*r+2*a,d=t*n+(t-1)*r+2*a,f=Math.min(s,c);for(let s=0;s<f;s++){let c=s*o,f=c+o;if(a>0&&(l+=i(0,0,c,u,a,f),l+=i(0,d-a,c,u,d,f),l+=i(0,a,c,a,d-a,f),l+=i(u-a,a,c,u,d-a,f)),r>0)for(let e=0;e<t-1;e++){let t=a+(e+1)*n+e*r,o=t+r;l+=i(a,t,c,u-a,o,f)}if(r>0)for(let o=0;o<e-1;o++){let e=a+(o+1)*n+o*r,s=e+r;for(let o=0;o<t;o++){let t=a+o*(n+r),u=t+n;l+=i(e,t,c,s,u,f)}}}return l}export{n,c as t};