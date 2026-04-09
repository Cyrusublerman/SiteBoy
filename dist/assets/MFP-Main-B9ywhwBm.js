const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/MFP-GridRenderer-Co5GUAQc.js","assets/MFP-Constants-DKzoQ60d.js","assets/sequences-BEQ5-fan.js","assets/chunk-DtRyYLXJ.js","assets/color-space-XZh92gwZ.js","assets/stl-generation-DONdHlW4.js","assets/index-Dq-NPXX2.js","assets/animation-foundation-CjDnqZPq.js","assets/Text-CdRabE3w.js","assets/foundation-C9ak9BLo.js","assets/index-DLEJXQML.css","assets/MFP-SourceActions-8kj27MLo.js","assets/color-utils-BFXF-Jio.js","assets/grid-layout-DwKSXOYB.js"])))=>i.map(i=>d[i]);
import{En as e,r as t,t as n}from"./index-Dq-NPXX2.js";import{i as r,n as i}from"./color-space-XZh92gwZ.js";import{a,o,s}from"./color-utils-BFXF-Jio.js";import{t as c}from"./sequences-BEQ5-fan.js";import"./stl-generation-DONdHlW4.js";import{t as l}from"./tool-base-Cvp4Jp_P.js";import{n as u,t as d}from"./MFP-Constants-DKzoQ60d.js";import{MFPSourceActions as f}from"./MFP-SourceActions-8kj27MLo.js";import{n as p,v as m}from"./ordered-B4163zd4.js";import{t as h}from"./nearest-color-s0_rGIm9.js";var g=class{constructor(e){this.state=e}_pointInQuad(e,t,n,r,i,a){let o=(e,t,n,r,i,a)=>(e-i)*(r-a)-(n-i)*(t-a),s=o(e,t,n.x,n.y,r.x,r.y),c=o(e,t,r.x,r.y,i.x,i.y),l=o(e,t,i.x,i.y,a.x,a.y),u=o(e,t,a.x,a.y,n.x,n.y);return!((s<0||c<0||l<0||u<0)&&(s>0||c>0||l>0||u>0))}async importProject(e,t){if(e)try{if(t.setValue(`gridLoadStatus`,`⏳ Importing project ZIP...`),!window.AssetLoader||!window.AssetLoader.ensureJSZip)throw Error(`AssetLoader not available — JSZip cannot be loaded.`);let n=await(await window.AssetLoader.ensureJSZip()).loadAsync(e),r=e=>Object.keys(n.files).find(t=>t.endsWith(e)||t.includes(e)),i=r(`grid-layout.json`)||r(`layout.json`);if(!i){t.setValue(`gridLoadStatus`,`❌ No grid-layout.json found in ZIP`);return}let a=await n.file(i).async(`string`),l=JSON.parse(a),u,d,f;if(l.tiles&&l.gridSize)u=l.tiles.map(e=>e.sequence),d=l.palette.map(e=>({n:e.name,h:e.hex})),f={rows:l.gridSize.rows,cols:l.gridSize.cols,tileSize:l.tileSize,gap:l.gap,layerCount:l.layerCount,baseLayers:l.baseLayers||2,sortMethod:l.sortMethod};else if(l.sequences&&l.colours)u=l.sequences,d=l.colours,f={rows:l.rows,cols:l.cols,tileSize:l.tileSize,gap:l.gap,layerCount:l.layerCount,baseLayers:l.baseLayers||2,sortMethod:l.sortMethod};else{t.setValue(`gridLoadStatus`,`❌ Unrecognised layout format`);return}this.state.referenceGridData={sequences:u,colours:d,rows:f.rows,cols:f.cols,tileSize:f.tileSize,gap:f.gap,width:f.cols*(f.tileSize+f.gap)-f.gap,height:f.rows*(f.tileSize+f.gap)-f.gap,layerCount:f.layerCount,baseLayers:f.baseLayers},this.state.gridData=this.state.referenceGridData,this.state.sequences=u,this.state.sequenceMap=c(u,d,f.cols,{simColour:s,rgb_to_key:o}),f.sortMethod&&t.setValue(`resortGrid`,f.sortMethod);let p=`${d.length}c${f.layerCount}L ${f.rows}×${f.cols}`;t.setValue(`gridLoadStatus`,`✅ Loaded: ${p} (${u.length} tiles)`);let m=r(`scans/scan.png`)||r(`scan.png`);if(m)try{let e=await n.file(m).async(`blob`),r=new Image;r.onload=()=>{this.state.scanImageElement=r;let e=t.canvasComponent;e&&e.resize(r.width,r.height),this._initializeGridCornersPixel(r.width,r.height,this.state.referenceGridData),t.setValue(`scanImageStatus`,`✅ Scan loaded: ${r.width}×${r.height}px`),t.draw()},r.src=URL.createObjectURL(e),console.log(`✅ Scan image loaded from ZIP`)}catch(e){console.warn(`Could not load scan image:`,e)}let h=r(`scans/analysis.json`)||r(`analysis.json`);if(h)try{let e=await n.file(h).async(`string`);this.state.scanAnalysis=JSON.parse(e),t.setValue(`scanStatus`,`✅ Analysis loaded: ${this.state.scanAnalysis.length} tiles`),console.log(`✅ Analysis data loaded from ZIP:`,this.state.scanAnalysis.length,`tiles`)}catch(e){console.warn(`Could not load analysis:`,e)}let g=r(`scans/grid-alignment.json`)||r(`grid-alignment.json`);if(g)try{let e=await n.file(g).async(`string`),t=JSON.parse(e);t.gridCornersPixel&&t.gridCornersPixel.length===4&&(this.state.gridCornersPixel=t.gridCornersPixel,console.log(`✅ Grid alignment restored from grid-alignment.json`))}catch(e){console.warn(`Could not load grid alignment:`,e)}else l.scanSettings?.gridCornersPixel&&(this.state.gridCornersPixel=l.scanSettings.gridCornersPixel,console.log(`✅ Grid corner positions restored from layout`));t.draw(),console.log(`✅ Project imported on SCAN tab`)}catch(e){console.error(`❌ Import error:`,e),t.setValue(`gridLoadStatus`,`❌ Import failed: ${e.message}`)}}async importCSV(e,t){if(e)try{t.setValue(`gridLoadStatus`,`⏳ Importing CSV...`);let n=(await e.text()).split(`
`).filter(e=>e.trim()&&!e.startsWith(`#`));if(n.length<2){t.setValue(`gridLoadStatus`,`❌ Invalid CSV format`);return}let r=n[0].split(`,`).map(e=>e.trim()).indexOf(`Sequence`);if(r===-1){t.setValue(`gridLoadStatus`,`❌ CSV missing Sequence column`);return}let i=[],a=new Set;for(let e=1;e<n.length;e++){let t=n[e].split(`,`)[r].replace(/"/g,``).split(``).map(e=>parseInt(e));i.push(t),t.forEach(e=>{e>0&&a.add(e)})}let l=Math.max(...Array.from(a)),d=[];for(let e=1;e<=l;e++)d.push(u[e-1]||{n:`Color${e}`,h:`#FFFFFF`});let f=Math.ceil(Math.sqrt(i.length)),p=Math.ceil(i.length/f);this.state.referenceGridData={sequences:i,colours:d,rows:p,cols:f,tileSize:10,gap:2,width:f*12-2,height:p*12-2,layerCount:i[0].length,baseLayers:2,emptyCells:[]},this.state.sequences=i,this.state.sequenceMap=c(i,d,f,{simColour:s,rgb_to_key:o}),t.setValue(`gridLoadStatus`,`✅ Imported ${i.length} sequences from CSV`),t.draw()}catch(e){console.error(`CSV import error:`,e),t.setValue(`gridLoadStatus`,`❌ Import failed: ${e.message}`)}}viewReferenceGrid(e){if(!this.state.referenceGridData){e.setValue(`gridLoadStatus`,`❌ No reference grid loaded`);return}let n=this.state.referenceGridData,r=n.width/25.4,i=n.height/25.4,a=document.createElement(`canvas`);a.width=Math.round(r*150),a.height=Math.round(i*150);let o=a.getContext(`2d`);t(async()=>{let{drawCalibrationGrid:e}=await import(`./MFP-GridRenderer-Co5GUAQc.js`);return{drawCalibrationGrid:e}},__vite__mapDeps([0,1])).then(({drawCalibrationGrid:t})=>{t(o,a,n,this.state.sequenceMap);let r=a.toDataURL(`image/png`);window.open().document.write(`
                <html>
                    <head><title>Reference Grid</title></head>
                    <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000;">
                        <img src="${r}" style="max-width:100%;max-height:100vh;" />
                    </body>
                </html>
            `),e.setValue(`scanStatus`,`✅ Reference grid opened in new window`)})}async applySortToGrid(e,n){if(!this.state.referenceGridData){n.setValue(`gridLoadStatus`,`❌ No grid loaded to re-sort`);return}let r=e.resortGrid||`Layer Count`,i={"Layer Count":`layercount`,"Base Color":`basecolor`,"Top Color":`topcolor`,Complexity:`complexity`,Lexicographic:`lexicographic`}[r]||`layercount`,a=this.state.referenceGridData.sequences.filter(e=>e&&e.length>0),{sortSequences:l}=await t(async()=>{let{sortSequences:e}=await import(`./sequences-BEQ5-fan.js`).then(e=>e.r);return{sortSequences:e}},__vite__mapDeps([2,3])),u=l(a,i),{rows:d,cols:f,tileSize:p,gap:m,emptyCells:h,colours:g,layerCount:_,baseLayers:v}=this.state.referenceGridData,y=f*(p+m)-m,b=d*(p+m)-m;this.state.referenceGridData={sequences:u,colours:g,rows:d,cols:f,tileSize:p,gap:m,width:y,height:b,emptyCells:h,layerCount:_,baseLayers:v,sortMethod:r},this.state.sequenceMap=c(u,g,f,{simColour:s,rgb_to_key:o}),n.setValue(`gridLoadStatus`,`✅ Grid re-sorted: ${r}`),n.draw()}async loadScanImage(e,t){if(!e)return;this.state.showingDocumentation&&this.hideDocumentation(t);let n=new Image;n.onload=()=>{this.state.scanImageElement=n;let r=t.canvasComponent;r&&(r.resize(n.width,n.height),console.log(`📐 Canvas resized to scan: ${n.width}×${n.height}px (1:1 mapping)`)),this.state.scanImageBounds={x:0,y:0,width:n.width,height:n.height};let i=this.state.gridData||this.state.referenceGridData;i&&this._initializeGridCornersPixel(n.width,n.height,i),t.draw();let a=(e.size/1024).toFixed(0);t.setValue(`scanImageStatus`,`✅ 1:1 loaded: ${n.width}×${n.height}px (${a}KB) - Use scroll/zoom to navigate`)},n.onerror=e=>{console.error(`❌ Image load error:`,e),t.setValue(`scanImageStatus`,`❌ Failed to load image`)},n.src=URL.createObjectURL(e)}_initializeGridCornersPixel(e,t,n){let{rows:r,cols:i,tileSize:a,gap:o}=n,s=i*(a+o)-o,c=r*(a+o)-o,l=e*.9/s,u=t*.9/c,d=Math.min(l,u),f=s*d,p=c*d,m=(e-f)/2,h=(t-p)/2;this.state.gridCornersPixel=[{x:m,y:h},{x:m+f,y:h},{x:m+f,y:h+p},{x:m,y:h+p}],console.log(`✅ Grid corners (pixel) initialized:`,this.state.gridCornersPixel)}resetGridAlignment(e){if(this.state.gridCalculated){let t=this.state.gridCalculated;this.state.gridAlignment={offsetX:0,offsetY:0,rotation:0,flipped:!1,autoCalculated:!0,corners:[{x:t.gridX,y:t.gridY},{x:t.gridX+t.gridWidth_px,y:t.gridY},{x:t.gridX+t.gridWidth_px,y:t.gridY+t.gridHeight_px},{x:t.gridX,y:t.gridY+t.gridHeight_px}]},e.setValue(`gridOffsetX`,0),e.setValue(`gridOffsetY`,0),e.setValue(`gridRotation`,0),e.setValue(`scanStatus`,`✅ Grid alignment reset to auto-calculated position`),e.draw()}}async analyzeScan(e,t){if(console.log(`🔬 analyzeScan called`),console.log(`  - scanImageElement:`,!!this.state.scanImageElement),console.log(`  - referenceGridData:`,!!this.state.referenceGridData),console.log(`  - gridCornersPixel:`,this.state.gridCornersPixel),!this.state.scanImageElement){console.log(`❌ No scan image`),t.setValue(`scanStatus`,`❌ Load scan image first`);return}if(!this.state.referenceGridData){console.log(`❌ No reference grid data`),t.setValue(`scanStatus`,`❌ Load grid first (CSV or generate)`);return}let n=this.state.gridCornersPixel;if(!n||n.length!==4){console.log(`❌ No grid corners`),t.setValue(`scanStatus`,`❌ Grid overlay not aligned. Drag corners to align with scan.`);return}console.log(`✅ All prerequisites met, starting analysis...`),t.setValue(`scanStatus`,`⏳ Analyzing scan (perspective-correct sampling)...`),await new Promise(e=>setTimeout(e,50));try{let r=this.state.referenceGridData,i=(e.deadzonePercent||20)/100,a=document.createElement(`canvas`);a.width=this.state.scanImageElement.width,a.height=this.state.scanImageElement.height;let o=a.getContext(`2d`);o.drawImage(this.state.scanImageElement,0,0);let s=o.getImageData(0,0,a.width,a.height),[c,l,u,d]=n,f=(e,t,n)=>e+(t-e)*n,p=(e,t)=>{let n=f(c.x,l.x,e),r=f(c.y,l.y,e),i=f(d.x,u.x,e),a=f(d.y,u.y,e);return{x:f(n,i,t),y:f(r,a,t)}},m=[],{rows:h,cols:g}=r,_=0;for(let e=0;e<r.sequences.length;e++){let t=Math.floor(e/g),n=e%g,o=n/g,c=(n+1)/g,l=t/h,u=(t+1)/h,d=(c-o)*i,f=(u-l)*i,v=o+d,y=c-d,b=l+f,x=u-f,S=p(v,b),C=p(y,b),w=p(v,x),T=p(y,x),E=Math.floor(Math.min(S.x,C.x,w.x,T.x)),D=Math.ceil(Math.max(S.x,C.x,w.x,T.x)),O=Math.floor(Math.min(S.y,C.y,w.y,T.y)),k=Math.ceil(Math.max(S.y,C.y,w.y,T.y)),A=[];for(let e=O;e<=k;e++)for(let t=E;t<=D;t++)if(this._pointInQuad(t,e,S,C,T,w)&&t>=0&&t<a.width&&e>=0&&e<a.height){let n=(e*a.width+t)*4,r=s.data[n],i=s.data[n+1],o=s.data[n+2];A.push({r,g:i,b:o})}if(_+=A.length,A.length===0){console.warn(`⚠️ Tile ${e} (${t},${n}) has no pixels - skipping`);continue}let j=A.reduce((e,t)=>e+t.r,0)/A.length,M=A.reduce((e,t)=>e+t.g,0)/A.length,N=A.reduce((e,t)=>e+t.b,0)/A.length,P=A.reduce((e,t)=>e+(t.r-j)**2,0)/A.length,F=A.reduce((e,t)=>e+(t.g-M)**2,0)/A.length,I=A.reduce((e,t)=>e+(t.b-N)**2,0)/A.length,L=Math.sqrt(P),R=Math.sqrt(F),z=Math.sqrt(I),B=Math.sqrt(P+F+I),V=Math.round(j),H=Math.round(M),U=Math.round(N),W=r.sequences[e],G=W.join(``),K=W.map((e,t)=>({layer:t,filamentIndex:e,filamentName:e>0?r.colours[e-1]?.n:`Empty`})).filter(e=>e.filamentIndex>0),q=Math.sqrt((C.x-S.x)**2+(C.y-S.y)**2)*Math.sqrt((w.x-S.x)**2+(w.y-S.y)**2);m.push({index:e,row:t,col:n,sequence:W,sequenceStr:G,filamentStack:K,rgb:{r:V,g:H,b:U},hex:`#${V.toString(16).padStart(2,`0`)}${H.toString(16).padStart(2,`0`)}${U.toString(16).padStart(2,`0`)}`,std:{r:L,g:R,b:z},variance:{r:P,g:F,b:I},colorDeviation:B,pixelsSampled:A.length,sampleArea_px:q})}this.state.scanAnalysis=m,console.log(`✅ Analysis data stored:`,m.length,`tiles`),typeof this._generateQuantizationConfig==`function`?(this.state.quantizationConfig=this._generateQuantizationConfig(m,r),console.log(`✅ Quantization config generated`)):console.warn(`⚠️ _generateQuantizationConfig not found`);let v=m.length>0?(m.reduce((e,t)=>e+t.colorDeviation,0)/m.length).toFixed(2):`N/A`;t.setValue(`scanStatus`,`✅ Analyzed ${m.length} tiles (${_.toLocaleString()} pixels) | Avg deviation: ${v}`),console.log(`📊 Scan analysis complete:`,{tilesAnalyzed:m.length,totalPixels:_,avgPixelsPerTile:m.length>0?Math.round(_/m.length):0,averageDeviation:v})}catch(e){t.setValue(`scanStatus`,`❌ Analysis failed: ${e.message}`),console.error(`Scan analysis error:`,e),console.error(`Stack:`,e.stack)}}viewAnalysis(e){if(console.log(`👁️ viewAnalysis called`),console.log(`  - scanAnalysis:`,this.state.scanAnalysis?.length,`tiles`),console.log(`  - referenceGridData:`,!!this.state.referenceGridData),!this.state.scanAnalysis||!this.state.referenceGridData){console.log(`❌ Missing analysis or grid data`),e.setValue(`scanStatus`,`❌ No analysis data available. Run "Analyze Scan" first.`);return}let t=this.state.referenceGridData,n=this.state.scanAnalysis;if(this.state.showingAnalysisView){this.hideAnalysisView(e);return}console.log(`📊 Showing analysis view with`,n.length,`tiles`);let r=e.container?.querySelector(`.tool-canvas-area`);if(!r){e.setValue(`scanStatus`,`❌ Canvas area not found`);return}let i=r.querySelector(`canvas`);i&&(i.style.display=`none`);let a=r.querySelector(`.analysis-view-container`);a?a.style.display=`block`:(a=document.createElement(`div`),a.className=`analysis-view-container`,a.style.cssText=`
                position: absolute; inset: 0; 
                background: var(--c-bg, #000); color: var(--c-text, #c0c0c0);
                font-family: 'Atkinson Hyperlegible', monospace; font-size: calc(var(--f) * 0.85);
                overflow: auto; padding: calc(var(--f) * 1);
                z-index: 50;
            `,r.appendChild(a));let o=Math.round(n.reduce((e,t)=>e+t.rgb.r,0)/n.length),s=Math.round(n.reduce((e,t)=>e+t.rgb.g,0)/n.length),c=Math.round(n.reduce((e,t)=>e+t.rgb.b,0)/n.length),l=(n.reduce((e,t)=>e+t.colorDeviation,0)/n.length).toFixed(2),u=n.reduce((e,t)=>e+t.pixelsSampled,0);a.innerHTML=`
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(var(--f) * 1); border-bottom: 1px solid var(--c-border); padding-bottom: calc(var(--f) * 0.5);">
                <h2 style="margin: 0; font-size: calc(var(--f) * 1.1);">SCAN ANALYSIS: ${t.colours.length}c${t.layerCount}L ${t.rows}×${t.cols} (${n.length} tiles)</h2>
                <button id="closeAnalysisBtn" style="background: var(--c-text); color: var(--c-bg); border: none; padding: calc(var(--f) * 0.4) calc(var(--f) * 0.8); cursor: pointer; font-family: inherit;">✕ CLOSE</button>
            </div>
            
            <div style="display: flex; gap: calc(var(--f) * 2); margin-bottom: calc(var(--f) * 1); flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: calc(var(--f) * 0.5);">
                    Sort:
                    <select id="analysisSort" style="background: var(--c-bg); color: var(--c-text); border: 1px solid var(--c-border); padding: calc(var(--f) * 0.3); font-family: inherit;">
                        <option value="index">Grid Order</option>
                        <option value="sequence">Sequence</option>
                        <option value="brightness">Brightness (L→D)</option>
                        <option value="brightness-rev">Brightness (D→L)</option>
                        <option value="hue">Hue</option>
                        <option value="deviation">Deviation (Low→High)</option>
                        <option value="deviation-rev">Deviation (High→Low)</option>
                    </select>
                </label>
                <label style="display: flex; align-items: center; gap: calc(var(--f) * 0.5);">
                    Size:
                    <select id="analysisCellSize" style="background: var(--c-bg); color: var(--c-text); border: 1px solid var(--c-border); padding: calc(var(--f) * 0.3); font-family: inherit;">
                        <option value="20">Tiny</option>
                        <option value="30" selected>Small</option>
                        <option value="40">Medium</option>
                        <option value="60">Large</option>
                    </select>
                </label>
            </div>
            
            <div style="background: var(--c-surface, #111); border: 1px solid var(--c-border); padding: calc(var(--f) * 0.5); margin-bottom: calc(var(--f) * 1);">
                <span style="display: inline-block; background: rgb(${o},${s},${c}); padding: 2px 8px; color: ${o+s+c>400?`#000`:`#fff`}; margin-right: calc(var(--f) * 1);">AVG RGB(${o}, ${s}, ${c})</span>
                Deviation: ${l} | Pixels: ${u.toLocaleString()}
            </div>
            
            <div id="analysisGrid" style="display: grid; gap: 1px; background: var(--c-border, #333);"></div>
            
            <div id="tileDetail" style="position: fixed; background: var(--c-bg, #000); border: 2px solid var(--c-text); padding: calc(var(--f) * 0.75); font-size: calc(var(--f) * 0.8); pointer-events: none; z-index: 1000; display: none; white-space: nowrap;"></div>
        `,this._analysisViewData={analysis:n,gridData:t},a.querySelector(`#closeAnalysisBtn`).addEventListener(`click`,()=>{this.hideAnalysisView(e)}),this._renderAnalysisGrid(a,`index`,30),a.querySelector(`#analysisSort`).addEventListener(`change`,e=>{let t=parseInt(a.querySelector(`#analysisCellSize`).value);this._renderAnalysisGrid(a,e.target.value,t)}),a.querySelector(`#analysisCellSize`).addEventListener(`change`,e=>{let t=a.querySelector(`#analysisSort`).value;this._renderAnalysisGrid(a,t,parseInt(e.target.value))}),this.state.showingAnalysisView=!0,e.setValue(`scanStatus`,`📊 Viewing analysis - click tiles for details`)}hideAnalysisView(e){let t=e.container?.querySelector(`.tool-canvas-area`);if(!t)return;let n=t.querySelector(`.analysis-view-container`);n&&(n.style.display=`none`);let r=t.querySelector(`canvas`);r&&(r.style.display=`block`),this.state.showingAnalysisView=!1,e.setValue(`scanStatus`,``),e.draw()}_renderAnalysisGrid(e,t,n){let{analysis:r,gridData:i}=this._analysisViewData,a=e.querySelector(`#analysisGrid`),o=e.querySelector(`#tileDetail`),s=[...r],c=(e,t,n)=>.299*e+.587*t+.114*n,l=(e,t,n)=>{e/=255,t/=255,n/=255;let r=Math.max(e,t,n),i=Math.min(e,t,n);if(r===i)return 0;let a=r-i,o;return o=r===e?((t-n)/a+(t<n?6:0))/6:r===t?((n-e)/a+2)/6:((e-t)/a+4)/6,o};switch(t){case`sequence`:s.sort((e,t)=>e.sequenceStr.localeCompare(t.sequenceStr));break;case`brightness`:s.sort((e,t)=>c(e.rgb.r,e.rgb.g,e.rgb.b)-c(t.rgb.r,t.rgb.g,t.rgb.b));break;case`brightness-rev`:s.sort((e,t)=>c(t.rgb.r,t.rgb.g,t.rgb.b)-c(e.rgb.r,e.rgb.g,e.rgb.b));break;case`hue`:s.sort((e,t)=>l(e.rgb.r,e.rgb.g,e.rgb.b)-l(t.rgb.r,t.rgb.g,t.rgb.b));break;case`deviation`:s.sort((e,t)=>e.colorDeviation-t.colorDeviation);break;case`deviation-rev`:s.sort((e,t)=>t.colorDeviation-e.colorDeviation);break;default:s.sort((e,t)=>e.index-t.index)}a.style.gridTemplateColumns=`repeat(${i.cols}, ${n}px)`,a.innerHTML=``,s.forEach(e=>{let t=document.createElement(`div`);t.style.cssText=`
                width: ${n}px; height: ${n}px;
                background: ${e.hex}; cursor: pointer;
            `,t.addEventListener(`mouseenter`,t=>{let n=e.filamentStack?.map(e=>`L${e.layer}: ${e.filamentName}`).join(`, `)||e.sequenceStr;o.innerHTML=`
                    <strong>Tile ${e.index}</strong> (R${e.row}/C${e.col})<br>
                    Sequence: ${e.sequenceStr}<br>
                    Layers: ${n}<br>
                    RGB: ${e.rgb.r}, ${e.rgb.g}, ${e.rgb.b}<br>
                    Hex: ${e.hex}<br>
                    Deviation: ${e.colorDeviation.toFixed(2)}<br>
                    Pixels: ${e.pixelsSampled.toLocaleString()}
                `,o.style.display=`block`,o.style.left=t.clientX+15+`px`,o.style.top=t.clientY+15+`px`}),t.addEventListener(`mousemove`,e=>{o.style.left=e.clientX+15+`px`,o.style.top=e.clientY+15+`px`}),t.addEventListener(`mouseleave`,()=>{o.style.display=`none`}),a.appendChild(t)})}exportPalette(e){if(!this.state.scanAnalysis){e.setValue(`scanStatus`,`❌ Analyze scan first`);return}let t=this.state.referenceGridData,n=this._generateUniquePaletteFromAnalysis(t),r=t.colours.map(e=>e.n).join(``),i=`GIMP Palette
`;i+=`Name: ${r}\n`,i+=`Columns: ${Math.min(n.length,16)}\n`,i+=`# Scanned from physical print calibration grid
`,i+=`# Generated: ${new Date().toISOString()}\n`,i+=`# Filaments: ${t.colours.map(e=>e.n).join(`, `)}\n`,i+=`# Tiles analyzed: ${this.state.scanAnalysis.length}\n`,i+=`# Color names are layer sequences (e.g., "1234" = filament 1+2+3+4)
`,i+=`#
`,n.forEach(e=>{i+=`${String(e.rgb.r).padStart(3)} ${String(e.rgb.g).padStart(3)} ${String(e.rgb.b).padStart(3)} ${e.sequenceStr}\n`});let a=new Blob([i],{type:`text/plain`}),o=URL.createObjectURL(a),s=document.createElement(`a`);s.href=o,s.download=`${r}-palette-${new Date().toISOString().slice(0,10)}.gpl`,s.click(),URL.revokeObjectURL(o),e.setValue(`scanStatus`,`✅ Exported palette: ${n.length} colors (${r})`)}exportQuantizationConfig(e){if(!this.state.quantizationConfig){e.setValue(`scanStatus`,`❌ Analyze scan first`);return}let t=JSON.stringify(this.state.quantizationConfig,null,2),n=new Blob([t],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${this.state.quantizationConfig.paletteName}-quantization-config-${new Date().toISOString().slice(0,10)}.json`,i.click(),URL.revokeObjectURL(r),e.setValue(`scanStatus`,`✅ Exported quantization config (${this.state.quantizationConfig.colorMap.length} colors)`)}exportComparisonCSV(e){if(!this.state.scanAnalysis||!this.state.referenceGridData){e.setValue(`scanStatus`,`❌ Analyze scan first`);return}let t=this._generateComparisonCSV(),n=this.state.referenceGridData,r=new Date().toISOString().slice(0,10).replace(/-/g,``),i=`cal-${n.colours.length}c${n.layerCount}L-${n.rows}x${n.cols}-comparison-${r}.csv`,a=new Blob([t],{type:`text/csv`}),o=URL.createObjectURL(a),s=document.createElement(`a`);s.href=o,s.download=i,s.click(),URL.revokeObjectURL(o),e.setValue(`scanStatus`,`✅ Exported ${i}`)}autoLoadLastGrid(e){try{let t=localStorage.getItem(`lastGridData`)||localStorage.getItem(`multifilament_last_grid`);if(t){let n=JSON.parse(t);this.state.referenceGridData=n,this.state.sequences=n.sequences,this.state.sequenceMap=c(this.state.sequences,n.colours,n.cols,{simColour:s,rgb_to_key:o});let r=n.timestamp?Math.round((Date.now()-n.timestamp)/1e3/60):`?`;e.setValue(`gridLoadStatus`,`✅ Auto-loaded: ${n.colours.length}c${n.layerCount}L ${n.rows}×${n.cols} grid (${r}min ago)`),e.setValue(`scanStatus`,`Grid loaded. Upload scanned image and align overlay.`),e.draw()}else e.setValue(`gridLoadStatus`,`No saved grid. Generate one in SOURCE tab or import CSV.`),e.setValue(`scanStatus`,`Load a grid first, then upload scan image.`)}catch(t){console.error(`Failed to load grid from localStorage:`,t),e.setValue(`gridLoadStatus`,`❌ Failed to load saved grid`)}}_autoCalculateGridOverlay(e){let t=e.values||{},n=t.scanWidth||210;if(t.scanHeight,!this.state.scanImageElement||!this.state.referenceGridData){console.warn(`Cannot auto-calculate: missing scan image or grid data`);return}let r=this.state.referenceGridData,i=this.state.scanImageElement.width/n,a=r.width*i,o=r.height*i,s=(this.state.scanImageElement.width-a)/2,c=(this.state.scanImageElement.height-o)/2;this.state.gridCalculated={pxPerMm:i,gridWidth_px:a,gridHeight_px:o,gridX:s,gridY:c},this.state.gridAlignment={offsetX:0,offsetY:0,rotation:0,flipped:!1,autoCalculated:!0,corners:[{x:s,y:c},{x:s+a,y:c},{x:s+a,y:c+o},{x:s,y:c+o}]},console.log(`✅ Grid overlay auto-calculated`)}_generateQuantizationConfig(e,t){let n=t.colours.map(e=>e.n).join(``),r=this._generateUniquePaletteFromAnalysis(t);return{version:`1.0.0`,generatedAt:new Date().toISOString(),paletteName:n,filaments:t.colours,colorMap:r.map(e=>({name:e.sequenceStr,rgb:e.rgb,hex:e.hex,sequence:e.sequence,filamentStack:e.filamentStack,tileCount:e.tileCount,deviation:e.averageDeviation})),tileData:e}}_generateUniquePaletteFromAnalysis(e){let t=new Map;this.state.scanAnalysis.forEach(e=>{let n=e.sequenceStr;t.has(n)||t.set(n,{sequence:e.sequence,sequenceStr:n,filamentStack:e.filamentStack,tiles:[]}),t.get(n).tiles.push(e)});let n=[];return t.forEach(({sequence:e,sequenceStr:t,filamentStack:r,tiles:i})=>{let a=Math.round(i.reduce((e,t)=>e+t.rgb.r,0)/i.length),o=Math.round(i.reduce((e,t)=>e+t.rgb.g,0)/i.length),s=Math.round(i.reduce((e,t)=>e+t.rgb.b,0)/i.length),c=i.reduce((e,t)=>e+t.colorDeviation,0)/i.length;n.push({sequence:e,sequenceStr:t,filamentStack:r,rgb:{r:a,g:o,b:s},hex:`#${a.toString(16).padStart(2,`0`)}${o.toString(16).padStart(2,`0`)}${s.toString(16).padStart(2,`0`)}`,tileCount:i.length,averageDeviation:c})}),n}_generateComparisonCSV(){if(!this.state.scanAnalysis||!this.state.referenceGridData)return``;let e=`# Expected vs Measured Color Comparison
`;return e+=`# Generated: ${new Date().toISOString()}\n#\n`,e+=`Index,Row,Col,Sequence,Expected_R,Expected_G,Expected_B,Measured_R,Measured_G,Measured_B,Delta_E,Std_R,Std_G,Std_B,Pixels_Sampled
`,this.state.scanAnalysis.forEach(t=>{let n=s(t.sequence,this.state.referenceGridData.colours),r=t.rgb.r-n.r,i=t.rgb.g-n.g,a=t.rgb.b-n.b,o=Math.sqrt(r**2+i**2+a**2);e+=`${t.index},${t.row},${t.col},"${t.sequenceStr}",`,e+=`${n.r},${n.g},${n.b},`,e+=`${t.rgb.r},${t.rgb.g},${t.rgb.b},`,e+=`${o.toFixed(2)},`,e+=`${t.std.r.toFixed(2)},${t.std.g.toFixed(2)},${t.std.b.toFixed(2)},`,e+=`${t.pixelsSampled}\n`}),e}};function _(e,t,n){let r=new Uint16Array(e);for(let i=0;i<n;i++)for(let a=0;a<t;a++){let o=i*t+a,s=e[o],c=[];if(a>0&&c.push(e[o-1]),a<t-1&&c.push(e[o+1]),i>0&&c.push(e[o-t]),i<n-1&&c.push(e[o+t]),c.length===0||c.some(e=>e===s))continue;let l=new Map;for(let e of c)l.set(e,(l.get(e)||0)+1);let u=c[0],d=0;for(let[e,t]of l)t>d&&(d=t,u=e);r[o]=u}return r}var v=class{constructor(e){this.state=e}_yield(){return new Promise(e=>setTimeout(e,0))}async loadSourceImage(e,t){if(!e)return;let n=new Image;n.onload=()=>{this.state.sourceImageElement=n;let e=t.components.get(`imageAdjust`);if(e&&typeof e.setSourceImage==`function`){let t=document.createElement(`canvas`);t.width=n.width,t.height=n.height;let r=t.getContext(`2d`);r.drawImage(n,0,0);let i=r.getImageData(0,0,n.width,n.height);e.setSourceImage(i),console.log(`✅ Source image loaded into adjustment bundle`)}t.draw(),t.setValue(`quantizeStatus`,`✅ Source image loaded (${n.width}×${n.height}px)`)},n.onerror=e=>{console.error(`❌ Image load error:`,e),t.setValue(`quantizeStatus`,`❌ Failed to load image`)},n.src=URL.createObjectURL(e)}async quantize(e,n){if(!this.state.sourceImageElement&&!this.state.sourceImageData){n.setValue(`quantizeStatus`,`❌ Load source image first`);return}if(!this.state.quantizationConfig){n.setValue(`quantizeStatus`,`❌ No palette available. Generate grid or analyze scan first.`);return}this.state.quantizedImageElement=null,this.state.quantizedImageData=null,this.state.quantizedSequenceMap=null,n.draw(),n.setValue(`quantizeStatus`,`⏳ [1/6] Scaling image…`),await this._yield();try{let i=this.state.quantizationConfig.colorMap,a=this.state.sourceImageElement,o=parseFloat(e.minDetail),s=o>0?o:this.state.gridData?.tileSize||this.state.referenceGridData?.tileSize||10,c=e.printWidth||170,l=Math.max(1,Math.round(c/s)),u,d,f=document.createElement(`canvas`);this.state.sourceImageData?(u=this.state.sourceImageData.width,d=this.state.sourceImageData.height,f.width=u,f.height=d,f.getContext(`2d`).putImageData(this.state.sourceImageData,0,0)):(u=a.width,d=a.height,f.width=u,f.height=d,f.getContext(`2d`).drawImage(a,0,0));let g=l/Math.max(u,d),v=Math.max(1,Math.round(u*g)),y=Math.max(1,Math.round(d*g)),b=document.createElement(`canvas`);b.width=v,b.height=y;let x=b.getContext(`2d`);x.imageSmoothingEnabled=!1,x.drawImage(f,0,0,v,y);let S=x.getImageData(0,0,v,y),{buildColorSpace:C}=await t(async()=>{let{buildColorSpace:e}=await import(`./color-space-XZh92gwZ.js`).then(e=>e.t);return{buildColorSpace:e}},__vite__mapDeps([4,3])),w=(e.colourSpace||`CIELAB`).toLowerCase(),T=w===`rgb`?`rgb`:w===`hsl`?`hsl`:`lab`,E=C(T,{w1:parseFloat(e.csWeight1)||1,w2:parseFloat(e.csWeight2)||1,w3:parseFloat(e.csWeight3)||1}),D=i.map(e=>e.hex),O=i.map(e=>{let{r:t,g:n,b:r}=typeof e.rgb==`object`&&!Array.isArray(e.rgb)?e.rgb:{r:e.rgb[0],g:e.rgb[1],b:e.rgb[2]};return E.convert(t,n,r)}),k=i.map(e=>{let{r:t,g:n,b:i}=typeof e.rgb==`object`&&!Array.isArray(e.rgb)?e.rgb:{r:e.rgb[0],g:e.rgb[1],b:e.rgb[2]};return r(t,n,i)});n.setValue(`quantizeStatus`,`⏳ [2/6] Dithering (${T.toUpperCase()})…`),await this._yield();let A=(e.ditherAlgorithm||`None`).toLowerCase(),j;j=A===`floyd-steinberg`?m(S,D,O,E):A===`bayer 4×4`||A===`bayer 4x4`?p(S,D,O,E):h(S,D,O,E);let M=new Map;i.forEach((e,t)=>{let{r:n,g:r,b:i}=typeof e.rgb==`object`&&!Array.isArray(e.rgb)?e.rgb:{r:e.rgb[0],g:e.rgb[1],b:e.rgb[2]};M.set(`${n},${r},${i}`,t)});let N=v*y,P=new Uint16Array(N),F=j.data;for(let e=0;e<N;e++){let t=e*4,n=`${F[t]},${F[t+1]},${F[t+2]}`;P[e]=M.get(n)??0}let I=e.analysisMode||`Fast`;n.setValue(`quantizeStatus`,`⏳ [3/6] Optimising (${I})…`),await this._yield();let L=await this._applyFormOptimisation(P,v,y,k,i,e);n.setValue(`quantizeStatus`,`⏳ [4/6] Simplifying…`),await this._yield();let R=parseInt(e.minimumClusterPx,10)||0,z=await this._mergeBelowThreshold(P,v,y,R),B=parseFloat(e.paletteMergeThreshold)||0,V=this._mergePalettePairs(P,k,i,B);n.setValue(`quantizeStatus`,`⏳ [5/6] Filtering detail…`),await this._yield(),P=_(P,v,y),n.setValue(`quantizeStatus`,`⏳ [6/6] Rendering…`),await this._yield();let H=document.createElement(`canvas`);H.width=v,H.height=y;let U=H.getContext(`2d`),W=U.createImageData(v,y),G=new Set;for(let e=0;e<N;e++){let t=P[e],n=i[t],{r,g:a,b:o}=typeof n.rgb==`object`&&!Array.isArray(n.rgb)?n.rgb:{r:n.rgb[0],g:n.rgb[1],b:n.rgb[2]},s=e*4;W.data[s]=r,W.data[s+1]=a,W.data[s+2]=o,W.data[s+3]=F[s+3],G.add(t)}U.putImageData(W,0,0),this.state.quantizedImageData=W,this.state.quantizedSequenceMap={width:v,height:y,map:P,palette:i};let K=new Set;i.forEach(e=>{let{r:t,g:n,b:r}=typeof e.rgb==`object`&&!Array.isArray(e.rgb)?e.rgb:{r:e.rgb[0],g:e.rgb[1],b:e.rgb[2]};K.add(`${t},${n},${r}`)});let q=i.length-K.size;this.state.quantizedImageElement=new Image,this.state.quantizedImageElement.onload=()=>{n.draw();let e=[];e.push(`${K.size} unique RGB`),q>0&&e.push(`${q} duplicate colours`),L>0&&e.push(`${L}px optimised`),z>0&&e.push(`${z}px merged`),V>0&&e.push(`${V}px pal-merged`);let t=e.length?` | ${e.join(` | `)}`:``;n.setValue(`quantizeStatus`,`✅ ${v}×${y}px | ${G.size}/${i.length} seq | ${s}mm/px | ${A}${t}`)},this.state.quantizedImageElement.src=H.toDataURL(),this.state.quantizeAnalysisMeta={width:v,height:y,tileSize:s,algo:A,usedCount:G.size,totalSeqs:i.length,uniqueRgbCount:K.size,duplicateSeqs:q,reassigned:L,merged:z,palMerged:V,colourSpace:T.toUpperCase(),weights:{w1:parseFloat(e.csWeight1)||1,w2:parseFloat(e.csWeight2)||1,w3:parseFloat(e.csWeight3)||1}}}catch(e){n.setValue(`quantizeStatus`,`❌ Quantization failed: ${e.message}`),console.error(`Quantization error:`,e)}}exportQuantizedImage(e){if(!this.state.quantizedImageElement){e.setValue(`quantizeStatus`,`❌ Quantize image first`);return}let t=document.createElement(`canvas`);t.width=this.state.quantizedImageElement.width,t.height=this.state.quantizedImageElement.height,t.getContext(`2d`).drawImage(this.state.quantizedImageElement,0,0),t.toBlob(t=>{let n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`quantized-${Date.now()}.png`,r.click(),URL.revokeObjectURL(n),e.setValue(`quantizeStatus`,`✅ Exported quantized image`)})}async _applyFormOptimisation(e,t,n,r,a,o){let s=Math.max(0,parseFloat(o.colourVariance)||0),c=Math.min(1,Math.max(0,parseFloat(o.groupingWeight)||0)),l=o.layerPreference||`None`;if(s===0&&c===0)return 0;let u=a.length,d=t*n,f=a.map(e=>e.sequence?e.sequence.filter(e=>e>0).length:0),p=Math.max(1,...f),m=a.map((e,t)=>{let n=r[t],a=[{ci:t,colourScore:1}];if(s>0)for(let e=0;e<u;e++){if(e===t)continue;let o=i(n,r[e]);o<=s&&a.push({ci:e,colourScore:1-o/s})}return a}),h=(e,t)=>{let n=a[e]?.sequence;if(!n||n.length===0||t.length===0)return 0;let r=0,i=0;for(let e=0;e<n.length;e++){let o=n[e];if(!o)continue;i++;let s=0;for(let n of t){let t=a[n]?.sequence;t&&t[e]===o&&s++}r+=s/t.length}return i>0?r/i:0},g=0;for(let n=0;n<d;n++){let r=m[e[n]];if(r.length<=1)continue;let i=n%t,a=Math.floor(n/t),o=[];i>0&&o.push(e[n-1]),a>0&&o.push(e[n-t]);let s=e[n],u=-1/0;for(let{ci:e,colourScore:t}of r){let n=h(e,o),r=f[e]/p,i=l===`More Layers`?r:l===`Fewer Layers`?1-r:0,a=n*.7+i*.3,d=(1-c)*t+c*a;d>u&&(u=d,s=e)}s!==e[n]&&(e[n]=s,g++)}if(c>0&&o.analysisMode!==`Fast`){let r=new Int32Array(d),i=[],a=!0,o=0;for(;a&&o<4;){a=!1,o++,await this._yield(),r.fill(-1);let s=[];for(let a=0;a<d;a++){if(r[a]!==-1)continue;let o=e[a],c=s.length,l=[];for(i.length=0,i.push(a);i.length>0;){let a=i.pop();if(r[a]!==-1||e[a]!==o)continue;r[a]=c,l.push(a);let s=a%t,u=Math.floor(a/t);s>0&&i.push(a-1),s<t-1&&i.push(a+1),u>0&&i.push(a-t),u<n-1&&i.push(a+t)}s.push({pixels:l,currentIdx:o})}for(let r of s){let i=m[r.currentIdx];if(i.length<=1)continue;let o=[];for(let i of r.pixels){let a=i%t,s=Math.floor(i/t);a>0&&e[i-1]!==r.currentIdx&&o.push(e[i-1]),a<t-1&&e[i+1]!==r.currentIdx&&o.push(e[i+1]),s>0&&e[i-t]!==r.currentIdx&&o.push(e[i-t]),s<n-1&&e[i+t]!==r.currentIdx&&o.push(e[i+t])}let s=r.currentIdx,u=-1/0;for(let{ci:e,colourScore:t}of i){let n=h(e,o),r=f[e]/p,i=l===`More Layers`?r:l===`Fewer Layers`?1-r:0,a=n*.7+i*.3,d=(1-c)*t+c*a;d>u&&(u=d,s=e)}if(s!==r.currentIdx){for(let t of r.pixels)e[t]=s;g+=r.pixels.length,a=!0}}}}return g}async _mergeBelowThreshold(e,t,n,r){if(r<=0)return 0;let i=t*n,a=new Int32Array(i),o=[],s=0,c=!0,l=0;for(;c&&l<30;){c=!1,l++,await this._yield(),a.fill(-1);let u=[];for(let r=0;r<i;r++){if(a[r]!==-1)continue;let i=e[r],s=u.length,c=[];for(o.length=0,o.push(r);o.length>0;){let r=o.pop();if(a[r]!==-1||e[r]!==i)continue;a[r]=s,c.push(r);let l=r%t,u=Math.floor(r/t);l>0&&o.push(r-1),l<t-1&&o.push(r+1),u>0&&o.push(r-t),u<n-1&&o.push(r+t)}u.push({pixels:c,currentIdx:i})}for(let i of u){if(i.pixels.length>=r)continue;let o=new Map;for(let e of i.pixels){let r=e%t,i=Math.floor(e/t);r>0&&a[e-1]!==a[e]&&o.set(a[e-1],(o.get(a[e-1])||0)+1),r<t-1&&a[e+1]!==a[e]&&o.set(a[e+1],(o.get(a[e+1])||0)+1),i>0&&a[e-t]!==a[e]&&o.set(a[e-t],(o.get(a[e-t])||0)+1),i<n-1&&a[e+t]!==a[e]&&o.set(a[e+t],(o.get(a[e+t])||0)+1)}if(o.size===0)continue;let l=-1,d=0;for(let[e,t]of o){if(e<0)continue;let n=u[e];n&&(t>d||t===d&&n.pixels.length>(l>=0?u[l].pixels.length:0))&&(d=t,l=e)}if(l>=0){let t=u[l].currentIdx;for(let n of i.pixels)e[n]=t;s+=i.pixels.length,c=!0}}}return s}_mergePalettePairs(e,t,n,r){if(r<=0)return 0;let a=n.length,o=e.length,s=Array.from({length:a},(e,t)=>t),c=e=>{for(;s[e]!==e;)s[e]=s[s[e]],e=s[e];return e},l=(e,t)=>{s[c(e)]=c(t)};for(let e=0;e<a;e++)for(let n=e+1;n<a;n++)i(t[e],t[n])<r&&l(e,n);let u=new Int32Array(a);for(let t=0;t<o;t++)u[e[t]]++;let d=new Int32Array(a).fill(-1);for(let e=0;e<a;e++){let t=c(e);(d[t]===-1||u[e]>u[d[t]])&&(d[t]=e)}let f=Array.from({length:a},(e,t)=>d[c(t)]),p=0;for(let t=0;t<o;t++){let n=f[e[t]];n!==-1&&n!==e[t]&&(e[t]=n,p++)}return p}async exportAnalysisImage(e,t){let n=this.state.quantizedSequenceMap;if(!n){t.setValue(`quantizeStatus`,`❌ Quantise image first`);return}try{t.setValue(`quantizeStatus`,`⏳ Computing layer maps for analysis…`),await this._yield();let{layerData:r,maxLayers:i,filamentCount:a,filamentColours:o}=this._computeLayerMapsInt(n);t.setValue(`quantizeStatus`,`⏳ Analysing layer quality…`),await this._yield();let s=this._analyseLayerQuality(r,i,n.width,n.height);t.setValue(`quantizeStatus`,`⏳ Rendering analysis image…`),await this._yield(),this._renderAnalysisCanvas({qsm:n,layerData:r,maxLayers:i,filamentCount:a,filamentColours:o,analysis:s,values:e,sourceImg:this.state.sourceImageElement,quantisedImg:this.state.quantizedImageElement,filaments:this.state.quantizationConfig?.filaments||[]}).toBlob(e=>{let t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`quantize-analysis-${Date.now()}.png`,n.click(),URL.revokeObjectURL(t)},`image/png`);let c=s.reduce((e,t)=>e+t.holes+t.thinStrips,0);t.setValue(`quantizeStatus`,`✅ Analysis downloaded | ${i} layers | ${c>0?c+` issues found`:`no issues`}`)}catch(e){t.setValue(`quantizeStatus`,`❌ Analysis failed: ${e.message}`),console.error(`Analysis error:`,e)}}_computeLayerMapsInt({width:e,height:t,map:n,palette:r}){let i=0,a=0;for(let e of r){let t=e.sequence||[];i=Math.max(i,t.filter(e=>e>0).length);for(let e of t)e>a&&(a=e)}i===0&&(i=1);let o=a,s=e*t,c=Array.from({length:i},()=>new Uint8Array(s));for(let e=0;e<s;e++){let t=r[n[e]]?.sequence;if(!t)continue;let a=0;for(let n of t)if(n>0&&(c[a][e]=n,a++),a>=i)break}let l=this.state.quantizationConfig?.filaments||[],u=[];for(let e=1;e<=o;e++){let t=l[e-1];if(t?.hex)u.push({r:parseInt(t.hex.slice(1,3),16),g:parseInt(t.hex.slice(3,5),16),b:parseInt(t.hex.slice(5,7),16),name:t.name||t.n||`F${e}`});else{let t=0,n=0,i=0,a=0;for(let o of r){if(!(o.sequence||[]).includes(e))continue;let r=Array.isArray(o.rgb)?{r:o.rgb[0],g:o.rgb[1],b:o.rgb[2]}:o.rgb;t+=r.r,n+=r.g,i+=r.b,a++}u.push(a>0?{r:Math.round(t/a),g:Math.round(n/a),b:Math.round(i/a),name:`F${e}`}:{r:128,g:128,b:128,name:`F${e}`})}}return{layerData:c,maxLayers:i,filamentCount:o,filamentColours:u}}_analyseLayerQuality(e,t,n,r){let i=n*r,a=[];return e.map(e=>{let t=0;for(let i=1;i<r-1;i++)for(let r=1;r<n-1;r++){let a=i*n+r;e[a]===0&&e[a-1]&&e[a+1]&&e[a-n]&&e[a+n]&&t++}let o=new Uint8Array(i),s=0,c=0,l=1/0,u=0,d=0;for(let t=0;t<i;t++){if(!e[t]||o[t])continue;let i=e[t];a.length=0,a.push(t),o[t]=1;let f=0,p=0;for(;a.length>0;){let t=a.pop(),s=t%n,c=Math.floor(t/n);if(f++,s>0){let n=t-1;e[n]===i&&!o[n]?(o[n]=1,a.push(n)):e[n]!==i&&p++}if(s<n-1){let n=t+1;e[n]===i&&!o[n]?(o[n]=1,a.push(n)):e[n]!==i&&p++}if(c>0){let r=t-n;e[r]===i&&!o[r]?(o[r]=1,a.push(r)):e[r]!==i&&p++}if(c<r-1){let r=t+n;e[r]===i&&!o[r]?(o[r]=1,a.push(r)):e[r]!==i&&p++}}s++,c+=f,f<l&&(l=f),f>u&&(u=f),p/f>3.5&&d++}return{holes:t,components:s,minSize:l===1/0?0:l,maxSize:u,avgSize:s>0?+(c/s).toFixed(1):0,thinStrips:d,coveredPx:c}})}_renderAnalysisCanvas({qsm:e,layerData:t,maxLayers:n,filamentCount:r,filamentColours:i,analysis:a,values:o,sourceImg:s,quantisedImg:c,filaments:l}){let{width:u,height:d,palette:f}=e,p=this.state.quantizeAnalysisMeta||{},m=`16px "Space Mono", monospace`,h=`13px "Space Mono", monospace`,g=`20px "Space Mono", monospace`,_=`#d0d0d0`,v=`#666666`,y=`#ffffff`,b=`#ff5555`,x=new Map;(f||[]).forEach((e,t)=>{let{r:n,g:r,b:i}=typeof e.rgb==`object`&&!Array.isArray(e.rgb)?e.rgb:{r:e.rgb[0],g:e.rgb[1],b:e.rgb[2]},a=`${n},${r},${i}`;x.has(a)||x.set(a,{r:n,g:r,b:i,hex:e.hex,entries:[]}),x.get(a).entries.push({index:t,name:e.name||``,sequence:e.sequence||[]})});let S=[...x.values()],C=u/d,w=C>=1?280:Math.round(280*C),T=C>=1?Math.round(280/C):280,E=Math.min(n,4),D=Math.ceil(S.length/3),O=D*26+22+24,k=T+22+48,A=Math.ceil(n/E)*(T+88+48)+22+24,j=Math.max(E*(w+24)+24,w*2+72,1068,800),M=224+k+O+A+24,N=document.createElement(`canvas`);N.width=j,N.height=M;let P=N.getContext(`2d`);P.imageSmoothingEnabled=!1,P.fillStyle=`#080808`,P.fillRect(0,0,j,M);let F=24;P.fillStyle=y,P.font=`bold 24px "Space Mono", monospace`,P.fillText(`QUANTISATION ANALYSIS`,24,F+22),F+=30,P.fillStyle=v,P.font=h,P.fillText(new Date().toISOString().slice(0,19).replace(`T`,` `),24,F+13),F+=22,P.fillStyle=_,P.font=m,P.fillText(`Palette: ${f?.length||0} sequences  ->  ${S.length} unique RGB colours`,24,F+16),F+=22,(p.duplicateSeqs||0)>0&&(P.fillStyle=b,P.font=m,P.fillText(`${p.duplicateSeqs} sequences share colours with other sequences (identical RGB output)`,24,F+16),F+=22),P.fillStyle=_,P.font=m,P.fillText(`Used: ${p.usedCount||`?`}/${p.totalSeqs||`?`} sequences  |  Space: ${p.colourSpace||`CIELAB`} [${p.weights?.w1??1}, ${p.weights?.w2??1}, ${p.weights?.w3??1}]`,24,F+16),F+=22,P.fillStyle=v,P.font=h,P.fillText(`${u}x${d}px  |  print: ${o.printWidth||170}mm  |  tile: ${p.tileSize||`?`}mm  |  dither: ${o.ditherAlgorithm||`None`}`,24,F+13),F+=18,P.fillText(`form-opt: ${o.analysisMode||`Fast`}  |  variance: ${o.colourVariance||0}  |  grouping: ${o.groupingWeight||0}  |  cluster: ${o.minimumClusterPx||0}px  |  pal-merge: ${o.paletteMergeThreshold||0}`,24,F+13),F+=42,P.fillStyle=_,P.font=m,P.fillText(`SOURCE`,24,F+16),P.fillText(`QUANTISED`,48+w,F+16),F+=22,s?P.drawImage(s,24,F,w,T):(P.fillStyle=`#1a1a1a`,P.fillRect(24,F,w,T)),c&&P.drawImage(c,48+w,F,w,T),F+=T+24,P.fillStyle=y,P.font=g,P.fillText(`PALETTE  (${S.length} unique colours from ${f?.length||0} sequences)`,24,F+20),F+=26,S.forEach((e,t)=>{let n=t%3,r=Math.floor(t/3),i=24+n*340,a=F+r*26;P.fillStyle=`rgb(${e.r},${e.g},${e.b})`,P.fillRect(i,a,20,20),P.strokeStyle=`#333`,P.strokeRect(i,a,20,20);let o=e.entries.length>1?` (x${e.entries.length})`:``,s=e.entries[0].name||e.entries[0].sequence.join(``);P.fillStyle=e.entries.length>1?b:_,P.font=h,P.fillText(`${e.hex} ${s}${o}`,i+20+6,a+13+2)}),F+=D*26+24,P.fillStyle=y,P.font=g,P.fillText(`LAYER MAPS  (red = holes | yellow = thin strips)`,24,F+20),F+=30;let I=document.createElement(`canvas`);I.width=u,I.height=d;let L=I.getContext(`2d`);for(let e=0;e<n;e+=E){let r=24;for(let o=e;o<Math.min(e+E,n);o++){let e=t[o],n=a[o],s=L.createImageData(u,d);for(let t=0;t<u*d;t++){let n=e[t],r=t*4;if(n>0&&n<=i.length){let{r:e,g:t,b:a}=i[n-1];s.data[r]=e,s.data[r+1]=t,s.data[r+2]=a,s.data[r+3]=255}else s.data[r]=14,s.data[r+1]=14,s.data[r+2]=14,s.data[r+3]=255}if(n.holes>0)for(let t=1;t<d-1;t++)for(let n=1;n<u-1;n++){let r=t*u+n;if(e[r]===0&&e[r-1]&&e[r+1]&&e[r-u]&&e[r+u]){let e=r*4;s.data[e]=255,s.data[e+1]=0,s.data[e+2]=0,s.data[e+3]=255}}L.putImageData(s,0,0),P.fillStyle=_,P.font=m,P.fillText(`LAYER ${o}`,r,F+16),P.drawImage(I,r,F+22,w,T);let c=F+22+T+6;P.fillStyle=n.holes>0||n.thinStrips>0||n.minSize===1?b:`#55ff55`,P.font=h,P.fillText(`coverage: ${n.coveredPx}px  components: ${n.components}`,r,c+13),P.fillStyle=n.holes>0?b:v,P.font=h,P.fillText(`holes: ${n.holes}`,r,c+13+18),P.fillStyle=n.thinStrips>0||n.minSize<3?b:v,P.fillText(`thin: ${n.thinStrips}  min: ${n.minSize}px  avg: ${n.avgSize}px`,r,c+13+36),r+=w+24}F+=T+88+48}return N}async loadPaletteFromJSON(e,t){if(e)try{t.setValue(`paletteStatus`,`⏳ Loading palette...`);let n=await e.text(),r=JSON.parse(n);if(!r.colors&&!r.colorMap)throw Error(`Invalid palette format: missing colors or colorMap`);let i=r.colors||r.colorMap;this.state.quantizationConfig={version:r.version||`1.0.0`,type:r.type||`imported`,generatedAt:r.generatedAt||new Date().toISOString(),paletteName:r.paletteName||r.filaments?.map(e=>e.name).join(``)||`Imported`,filaments:r.filaments||[],layerCount:r.layerCount||i[0]?.sequence?.length||4,baseLayers:r.baseLayers||0,topLayers:r.topLayers||0,colorMap:i.map(e=>({name:e.sequenceStr||e.name||e.sequence?.join(``),rgb:Array.isArray(e.rgb)?{r:e.rgb[0],g:e.rgb[1],b:e.rgb[2]}:e.rgb,hex:e.hex,sequence:e.sequence,filamentStack:e.filamentStack||null,tileCount:e.tileCount||1,deviation:e.deviation||null})),tileData:r.tileData||null};let a=this.state.quantizationConfig.colorMap.length;t.setValue(`paletteStatus`,`✅ Palette loaded: ${a} colours (${this.state.quantizationConfig.type})`),console.log(`✅ Palette loaded from JSON: ${a} colours`)}catch(e){console.error(`❌ Palette load error:`,e),t.setValue(`paletteStatus`,`❌ Failed to load palette: ${e.message}`)}}},y=class{constructor(e){this.state=e}_yield(){return new Promise(e=>setTimeout(e,0))}async generateArtworkSTL(e,n){let r=this.state.quantizedSequenceMap;if(!r){n.setValue(`exportArtworkStatus`,`❌ Quantise image first (QUANTIZE tab)`);return}try{n.setValue(`exportArtworkStatus`,`⏳ [1/2] Building layer maps…`),await this._yield();let{width:i,height:a,map:o,palette:s}=r,c=parseFloat(e.stlPrintWidth)||170,l=parseFloat(e.stlLayerHeight)||.08,u=c/i,d=this._deriveFilamentNames(s),f=d.length,p=this._expandQuantizedToLayers(o,i,a,s,f);this.state.exportSTLData={stls:{},layerMaps:p,filamentNames:d,palette:s,config:{imageWidth:i,imageHeight:a,printWidth:c,layerHeight:l}},n.draw();let m={simplifyTolerance:parseFloat(e.stlSimplifyTolerance)||.3,chaikinIterations:parseInt(e.stlSmoothIterations,10)??2,minContourArea:parseFloat(e.stlMinContourArea)||2},{contourSTL:h}=await t(async()=>{let{contourSTL:e}=await import(`./stl-generation-DONdHlW4.js`).then(e=>e.n);return{contourSTL:e}},__vite__mapDeps([5,6,3,7,8,9,10])),g={};for(let e=0;e<f;e++){n.setValue(`exportArtworkStatus`,`⏳ [2/3] Contouring filament ${e+1}/${f}…`),await this._yield();let t=[];for(let n=0;n<p.length;n++){let r=p[n][e];if(r.size===0)continue;let o=n*l,s=await h(r,i,a,o,o+l,u,m);for(let e=0;e<s.length;e++)t.push(s[e])}if(t.length>0){let n=d[e],r=`artwork_${n.replace(/[^a-zA-Z0-9]/g,`_`)}.stl`;g[r]=[`solid Artwork_${n}\n`,...t,`endsolid Artwork_${n}\n`]}}this.state.exportSTLData.stls=g;let _=Object.keys(g).length,v=p.length,y=m.chaikinIterations>0?` | smooth: ${m.chaikinIterations}× Chaikin`:` | no smoothing`;n.setValue(`exportArtworkStatus`,`✅ ${_} STL file${_===1?``:`s`} | ${v} layer${v===1?``:`s`} | ${i}×${a}px → ${c}mm wide${y}`),n.draw()}catch(e){n.setValue(`exportArtworkStatus`,`❌ STL generation failed: ${e.message}`),console.error(`STL generation error:`,e)}}_expandQuantizedToLayers(e,t,n,r,i){let a=0;for(let e of r)if(e.sequence){let t=e.sequence.filter(e=>e>0).length;a=Math.max(a,t)}a===0&&(a=1);let o=Array.from({length:a},()=>Array.from({length:i},()=>new Set));for(let s=0;s<n;s++)for(let n=0;n<t;n++){let c=r[e[s*t+n]];if(!c||!c.sequence)continue;let l=0;for(let e of c.sequence)if(e>0){let t=e-1;t<i&&l<a&&o[l][t].add(`${n},${s}`),l++}}return o}_deriveFilamentNames(e){let t=this.state.quantizationConfig?.filaments||[],n=0;for(let t of e)if(t.sequence)for(let e of t.sequence)e>n&&(n=e);let r=[];for(let e=1;e<=n;e++){let n=t[e-1];r.push(n?.name||n?.n||`Filament_${e}`)}return r.length>0?r:[`Filament_1`]}async downloadAllSTLs(e){let t=this.state.exportSTLData;if(!t||!t.stls||Object.keys(t.stls).length===0){e.setValue(`exportArtworkStatus`,`❌ Generate STLs first`);return}try{if(e.setValue(`exportArtworkStatus`,`⏳ Building ZIP…`),!window.AssetLoader?.ensureJSZip)throw Error(`AssetLoader not available — JSZip cannot be loaded`);let n=new(await(window.AssetLoader.ensureJSZip()));for(let[e,r]of Object.entries(t.stls))n.file(e,new Blob(r,{type:`text/plain`}));let r=await n.generateAsync({type:`blob`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`artwork-stls-${Date.now()}.zip`,a.click(),URL.revokeObjectURL(i);let o=Object.keys(t.stls).length;e.setValue(`exportArtworkStatus`,`✅ Downloaded ${o} STL file${o===1?``:`s`} as ZIP`)}catch(t){e.setValue(`exportArtworkStatus`,`❌ ZIP download failed: ${t.message}`),console.error(`ZIP download error:`,t)}}downloadIndividualSTLs(e){let t=this.state.exportSTLData;if(!t||!t.stls||Object.keys(t.stls).length===0){e.setValue(`exportArtworkStatus`,`❌ Generate STLs first`);return}try{let n=0;for(let[e,r]of Object.entries(t.stls)){let t=new Blob(r,{type:`text/plain`}),i=URL.createObjectURL(t),a=document.createElement(`a`);a.href=i,a.download=e,a.click(),URL.revokeObjectURL(i),n++}e.setValue(`exportArtworkStatus`,`✅ Downloaded ${n} STL file${n===1?``:`s`}`)}catch(t){e.setValue(`exportArtworkStatus`,`❌ Download failed: ${t.message}`),console.error(`Individual STL download error:`,t)}}exportJSON(e,t){if(!this.state.gridData){t.setValue(`outputsGridActionStatus`,`❌ No grid — generate grid first`);return}try{let e=this.state.gridData,n={version:`1.2.0`,palette:e.colours,tiles:e.sequences.map((t,n)=>({sequence:t,row:Math.floor(n/e.cols),col:n%e.cols})),metadata:{rows:e.rows,cols:e.cols,tileSize:e.tileSize,gap:e.gap,layerCount:e.layerCount,baseLayers:e.baseLayers,perimeterMargin:e.perimeterMargin||0,emptyCells:e.emptyCells||[],generatedAt:new Date().toISOString()}},r=JSON.stringify(n,null,2),i=new Blob([r],{type:`application/json`}),a=URL.createObjectURL(i),o=document.createElement(`a`);o.href=a,o.download=`grid-layout-${Date.now()}.json`,o.click(),URL.revokeObjectURL(a),t.setValue(`outputsGridActionStatus`,`✅ Downloaded grid-layout.json`)}catch(e){t.setValue(`outputsGridActionStatus`,`❌ JSON export failed: ${e.message}`),console.error(`JSON export error:`,e)}}async exportCompleteProject(e,n){if(!this.state.gridData){n.setValue(`exportProjectStatus`,`❌ Generate grid first`);return}try{n.setValue(`exportProjectStatus`,`⏳ Building project ZIP…`);let{MFPSourceActions:r}=await t(async()=>{let{MFPSourceActions:e}=await import(`./MFP-SourceActions-8kj27MLo.js`);return{MFPSourceActions:e}},__vite__mapDeps([11,6,3,7,8,9,10,12,2,5,13,1]));await new r(this.state).exportCompletePackage(e,n);let i=this.state.scanAnalysis?` (with scan data)`:``;n.setValue(`exportProjectStatus`,`✅ Exported complete project ZIP${i}`)}catch(e){n.setValue(`exportProjectStatus`,`❌ ZIP export failed: ${e.message}`),console.error(`ZIP export error:`,e)}}},b=class{constructor(t,r={}){console.log(`🏗️ MFP Constructor called`),this.container=t,this.deps={ComponentLibrary:n,MF:e,...r},this.sharedState={selectedFilaments:[],gridData:null,sequences:null,sequenceMap:null,scanImageElement:null,scanAnalysis:null,sourceImageElement:null,quantizedImage:null,importedState:null,showDocs:!1,exportSTLData:null},console.log(`🏗️ MFP sharedState initialized:`,this.sharedState),this.sourceActions=new f(this.sharedState),this.scanActions=new g(this.sharedState),this.quantizeActions=new v(this.sharedState),this.exportActions=new y(this.sharedState),console.log(`🏗️ MFP Action modules created`);let i={title:`Multifilament Print`,sidebar:this._getSidebarConfig(),canvas:{fillContainer:!0,displayMode:`fit`,enableZoom:!0,enablePan:!0,enabled:!0},onInit:e=>this._handleInit(e),onUpdate:(e,t,n)=>this._handleUpdate(e,t,n),onDraw:(e,t,n)=>this._handleDraw(e,t,n)};console.log(`🏗️ MFP Creating ToolBase with config:`,i),this.toolBase=new l(i,this.deps),console.log(`🏗️ MFP Mounting ToolBase to container`),this.toolBase.mount(t),console.log(`🏗️ MFP Mount complete`),this._addInfoButton(),this._addCanvasToolbar()}_addInfoButton(){let e=this.container.querySelector(`.tool-canvas-area`);if(!e){console.warn(`Canvas area not found, cannot add info button`);return}window.getComputedStyle(e).position===`static`&&(e.style.position=`relative`);let t=document.createElement(`button`);t.className=`info-button`,t.textContent=`i`,t.title=`Toggle Documentation`,t.style.cssText=`
            position: absolute;
            top: 0;
            right: 0;
            width: calc(var(--f) * 2);
            height: calc(var(--f) * 2);
            background: var(--c-bg);
            color: var(--c-text);
            border: 1px solid var(--c-border);
            border-top: none;
            border-right: none;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: calc(var(--f) * 1);
            font-weight: normal;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 200;
            margin: 0;
            padding: 0;
        `;let n=()=>{this.sharedState.showDocs?(t.style.background=`var(--c-text)`,t.style.color=`var(--c-bg)`):(t.style.background=`var(--c-bg)`,t.style.color=`var(--c-text)`)};t.addEventListener(`mouseenter`,()=>{t.style.background=`var(--c-text)`,t.style.color=`var(--c-bg)`}),t.addEventListener(`mouseleave`,n),t.addEventListener(`click`,()=>{this.sharedState.showDocs=!this.sharedState.showDocs,this._updateDocumentation(),n()}),e.appendChild(t),this.infoButton=t,this._setupTabChangeListener()}_addCanvasToolbar(){let e=this.container.querySelector(`.tool-canvas-area`);if(!e)return;let t=this.toolBase?.F||14,n=document.createElement(`div`);n.className=`mfp-canvas-toolbar`,n.style.cssText=`
            position: absolute;
            top: 0; left: 0; right: ${t*2}px;
            height: ${t*2}px;
            display: flex;
            flex-direction: row;
            align-items: stretch;
            z-index: 190;
            box-sizing: border-box;
            pointer-events: none;
        `;let r=(e,n)=>{let r=document.createElement(`button`);return r.type=`button`,r.textContent=e,r.style.cssText=`
                width: 25%;
                height: ${t*2}px;
                padding: 0 ${t}px;
                border: none;
                border-bottom: 1px solid var(--c-border);
                ${n?``:`border-right: 1px solid var(--c-border);`}
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${t}px;
                text-transform: uppercase;
                cursor: pointer;
                white-space: nowrap;
                box-sizing: border-box;
                pointer-events: auto;
            `,r.addEventListener(`mouseenter`,()=>{r.style.background=`var(--c-text)`,r.style.color=`var(--c-bg)`}),r.addEventListener(`mouseleave`,()=>{r.style.background=`var(--c-bg)`,r.style.color=`var(--c-text)`}),r},i=document.createElement(`div`);i.style.cssText=`
            width: 50%;
            position: relative;
            display: flex;
            align-items: stretch;
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            box-sizing: border-box;
            pointer-events: auto;
        `;let a=document.createElement(`button`);a.type=`button`,a.style.cssText=`
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: ${t*2}px;
            padding: 0 ${t}px;
            border: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${t}px;
            text-transform: uppercase;
            cursor: pointer;
        `;let o=document.createElement(`span`);o.textContent=`AUTO`;let s=document.createElement(`span`);s.textContent=`+`,s.style.marginLeft=`${t/2}px`,a.appendChild(o),a.appendChild(s),i.appendChild(a);let c=document.createElement(`div`);c.style.cssText=`
            display: none;
            position: absolute;
            top: 100%;
            left: 0; right: 0;
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            border-top: none;
            z-index: 200;
        `,i.appendChild(c);let l=!1,u=()=>{c.style.display=`block`,s.textContent=`-`,l=!0},d=()=>{c.style.display=`none`,s.textContent=`+`,l=!1};a.addEventListener(`click`,e=>{e.stopPropagation(),l?d():u()}),document.addEventListener(`click`,e=>{i.contains(e.target)||d()}),this._canvasToolbarViewLabel=o,this._canvasToolbarViewMenu=c,this._canvasToolbarCloseMenu=d;let f=r(`LOAD`,!1);f.addEventListener(`click`,()=>{this._triggerFileUpload(`.json,.zip`,async e=>{e.name.endsWith(`.zip`)?await this.sourceActions.importProject(e,this.toolBase):await this.quantizeActions.loadPaletteFromJSON(e,this.toolBase),this._refreshTabStatus(this._getCurrentTab()),this.toolBase.draw()})});let p=r(`SAVE`,!0);p.addEventListener(`click`,()=>{let e=this.toolBase.getValues();this.exportActions.exportCompleteProject(e,this.toolBase)}),n.appendChild(i),n.appendChild(f),n.appendChild(p),e.appendChild(n),this._canvasToolbar=n,this.sharedState.canvasToolbarView=`auto`,this._updateToolbarViewOptions()}_updateToolbarViewOptions(){let e=this._canvasToolbarViewMenu,t=this._canvasToolbarViewLabel;if(!e||!t)return;let n=this.toolBase?.F||14,r=this._getCurrentTab();e.innerHTML=``;let i={SOURCE:[[`auto`,`AUTO`],[`grid`,`GRID`]],SCAN:[[`auto`,`AUTO`],[`scan`,`SCAN IMAGE`],[`overlay`,`SCAN + GRID`]],QUANTIZE:[[`auto`,`AUTO`],[`source`,`SOURCE IMAGE`],[`adjusted`,`ADJUSTED IMAGE`],[`quantised`,`QUANTISED IMAGE`],[`analysis`,`ANALYSIS COMPOSITE`],[`artCombined`,`ARTWORK COMBINED`],[`artAll`,`ARTWORK ALL LAYERS`],[`artL0`,`ARTWORK LAYER 0`],[`artL1`,`ARTWORK LAYER 1`],[`artL2`,`ARTWORK LAYER 2`],[`artL3`,`ARTWORK LAYER 3`]],OUTPUTS:[[`auto`,`AUTO`],[`quantised`,`QUANTISED IMAGE`],[`gridCombined`,`GRID COMBINED`],[`gridL0`,`GRID LAYER 0`],[`gridL1`,`GRID LAYER 1`],[`gridL2`,`GRID LAYER 2`],[`gridL3`,`GRID LAYER 3`],[`artCombined`,`ARTWORK COMBINED`],[`artAll`,`ARTWORK ALL LAYERS`],[`artL0`,`ARTWORK LAYER 0`],[`artL1`,`ARTWORK LAYER 1`],[`artL2`,`ARTWORK LAYER 2`],[`artL3`,`ARTWORK LAYER 3`]]}[r]||[[`auto`,`AUTO`]],a=this.sharedState.canvasToolbarView||`auto`;i.map(e=>e[0]).includes(a)||(this.sharedState.canvasToolbarView=`auto`),t.textContent=(i.find(e=>e[0]===(this.sharedState.canvasToolbarView||`auto`))||i[0])[1],i.forEach(([t,r])=>{let i=document.createElement(`div`),a=t===(this.sharedState.canvasToolbarView||`auto`);i.textContent=r,i.style.cssText=`
                padding: ${n/2}px ${n}px;
                background: ${a?`var(--c-text)`:`var(--c-bg)`};
                color: ${a?`var(--c-bg)`:`var(--c-text)`};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${n}px;
                cursor: pointer;
                border-bottom: 1px solid var(--c-border);
                text-transform: uppercase;
            `,i.addEventListener(`mouseenter`,()=>{t!==(this.sharedState.canvasToolbarView||`auto`)&&(i.style.background=`var(--vga-gray, #555)`)}),i.addEventListener(`mouseleave`,()=>{let e=t===(this.sharedState.canvasToolbarView||`auto`);i.style.background=e?`var(--c-text)`:`var(--c-bg)`,i.style.color=e?`var(--c-bg)`:`var(--c-text)`}),i.addEventListener(`click`,()=>{this.sharedState.canvasToolbarView=t,this._updateToolbarViewOptions(),this._canvasToolbarCloseMenu(),this.toolBase.draw()}),e.appendChild(i)})}_setupTabChangeListener(){let e=this.container.querySelector(`.tool-tab-bar`);e&&e.querySelectorAll(`button`).forEach(e=>{e.addEventListener(`click`,()=>{this.currentTabName=e.textContent.trim(),this.sharedState.canvasToolbarView=`auto`,this._updateToolbarViewOptions(),this._refreshTabStatus(this.currentTabName),this.toolBase.draw(),this.sharedState.showDocs&&setTimeout(()=>this._updateDocumentation(),10)})}),this.currentTabName=`SOURCE`}_refreshTabStatus(e){if(e===`OUTPUTS`){let e=this.sharedState.gridData;e?this.toolBase.setValue(`outputsGridStatus`,`✅ ${e.sequences?.length||0} sequences | ${e.rows}×${e.cols} | ${e.tileSize}mm tiles`):this.toolBase.setValue(`outputsGridStatus`,`-- not generated (SOURCE tab)`);let t=this.sharedState.scanAnalysis,n=this.sharedState.quantizationConfig;if(t){let e=n?.filaments?.length||n?.colorMap?.length||0;this.toolBase.setValue(`outputsScanStatus`,`✅ ${t.length} tiles analysed | ${e} colours`)}else this.toolBase.setValue(`outputsScanStatus`,`-- no analysis (SCAN tab)`);let r=this.sharedState.quantizedSequenceMap;r?this.toolBase.setValue(`outputsQuantStatus`,`✅ ${r.width}×${r.height}px | ${r.palette?.length||0} colours`):this.toolBase.setValue(`outputsQuantStatus`,`-- not quantised (QUANTIZE tab)`);let i=this.sharedState.exportSTLData;if(i){let e=Object.keys(i.stls||{}).length,{layerMaps:t,config:n}=i;this.toolBase.setValue(`outputsArtworkStatus`,`✅ ${e} STL file${e===1?``:`s`} | ${t.length} layer${t.length===1?``:`s`} | ${n.printWidth}mm wide`)}else r?this.toolBase.setValue(`outputsArtworkStatus`,`⚡ Ready — click Generate Artwork STLs`):this.toolBase.setValue(`outputsArtworkStatus`,`-- quantise image first`)}else if(e===`QUANTIZE`){if(this.sharedState.quantizationConfig){let e=this.sharedState.quantizationConfig.colorMap?.length||0,t=this.sharedState.quantizationConfig.type||`loaded`;this.toolBase.setValue(`paletteStatus`,`✅ Palette ready: ${e} colours (${t})`)}else if(this.sharedState.gridData){this.sourceActions._generatePredictedQuantizationConfig(this.sharedState.gridData);let e=this.sharedState.quantizationConfig?.colorMap?.length||0;this.toolBase.setValue(`paletteStatus`,`✅ Palette ready: ${e} colours (predicted)`)}else this.toolBase.setValue(`paletteStatus`,`⚠️ No palette loaded. Generate or import a grid first.`);this._updatePaletteDisplay()}else e===`SCAN`&&(this.sharedState.scanAnalysis?this.toolBase.setValue(`scanStatus`,`✅ Analysis complete: ${this.sharedState.scanAnalysis.length} tiles`):this.sharedState.scanImageElement&&this.toolBase.setValue(`scanStatus`,`ℹ️ Scan loaded. Align grid and click "Analyze Scan".`))}_updatePaletteDisplay(){let e=this.sharedState.quantizationConfig,t=this.toolBase.getComponent(`paletteStatus`);if(!t||!t.element)return;let n=t.element.parentElement;if(!n)return;let r=n.querySelector(`.mfp-palette-display`);if(r||(r=document.createElement(`div`),r.className=`mfp-palette-display`,t.element.insertAdjacentElement(`afterend`,r)),!e||!e.colorMap||e.colorMap.length===0){r.style.display=`none`;return}let i=this.toolBase.F||14,a=i*2,o=Math.round(i*.25);r.style.cssText=`
            display: flex;
            flex-direction: column;
            gap: ${o}px;
        `,r.innerHTML=``;let s=document.createElement(`div`);s.style.cssText=`
            display: flex;
            flex-wrap: wrap;
            gap: ${o}px;
        `;let c=document.createElement(`div`);c.style.cssText=`
            display: none;
            align-items: center;
            gap: ${Math.round(i*.5)}px;
            padding: ${o}px 0;
            border-top: 1px solid var(--c-border);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${Math.round(i*.857)}px;
            color: var(--c-text);
        `;let l=null;e.colorMap.forEach((e,t)=>{let n=e.hex||(e.rgb?`#${e.rgb.r.toString(16).padStart(2,`0`)}${e.rgb.g.toString(16).padStart(2,`0`)}${e.rgb.b.toString(16).padStart(2,`0`)}`:`#888`),r=document.createElement(`div`);r.title=e.sequence?e.sequence.join(``):e.name||String(t),r.style.cssText=`
                width: ${a}px;
                height: ${a}px;
                background: ${n};
                border: 1px solid var(--c-border);
                cursor: pointer;
                flex-shrink: 0;
                box-sizing: border-box;
            `,r.addEventListener(`click`,()=>{if(l&&l!==r&&(l.style.outline=`none`),l===r){r.style.outline=`none`,c.style.display=`none`,l=null;return}l=r,r.style.outline=`2px solid var(--c-text)`,r.style.outlineOffset=`1px`;let t=e.sequence?e.sequence.join(``):e.name||`—`,a=e.rgb?`rgb(${e.rgb.r}, ${e.rgb.g}, ${e.rgb.b})`:`—`,o=e.deviation==null?``:`  Δ${e.deviation.toFixed(1)}`;c.innerHTML=``;let s=document.createElement(`div`);s.style.cssText=`width:${i}px;height:${i}px;background:${n};border:1px solid var(--c-border);flex-shrink:0;`,c.appendChild(s);let u=document.createElement(`span`);u.style.cssText=`white-space:pre;`,u.textContent=`${t}  ${a}${o}`,c.appendChild(u),c.style.display=`flex`}),s.appendChild(r)}),r.appendChild(s),r.appendChild(c)}_getCurrentTab(){return this.currentTabName||`SOURCE`}_updateDocumentation(){let e=this.container.querySelector(`.tool-canvas-area`);if(!e)return;let t=e.querySelector(`canvas`);if(this.sharedState.showDocs){t&&(t.style.display=`none`),this.docsContainer&&this.docsContainer.remove(),this.docsContainer=document.createElement(`div`),this.docsContainer.className=`tool-docs-viewer`,this.docsContainer.style.cssText=`
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                    overflow-y: auto;
                    padding: calc(var(--f) * 2);
                padding-top: calc(var(--f) * 3);
                    background: var(--c-bg);
                    color: var(--c-text);
                z-index: 50;
            `;let n=this._getCurrentTab(),r=this._getTabDocumentation(n);this.docsContainer.innerHTML=this._markdownToHtml(r),e.appendChild(this.docsContainer)}else t&&(t.style.display=`block`),this.docsContainer&&(this.docsContainer.remove(),this.docsContainer=null)}_getTabDocumentation(e){let t={SOURCE:`# SOURCE TAB — Grid Generation

## Purpose
Generate a calibration grid containing every valid filament layer combination. This grid is printed, scanned, and analysed to create a colour lookup table mapping RGB values to filament stacks.

---

## Sequence Generation Algorithm

### Valid Sequence Definition
A sequence is an array of length M (layer count) where:
- Values are 1-indexed filament references (1 = first filament, 2 = second, etc.)
- Value 0 = empty (no filament on this layer)
- At least one non-zero value exists
- No gaps: once a 0 appears, only 0s can follow

\`\`\`
Valid:   [1, 2, 0, 0]  — Red layer 0, Blue layer 1, empty layers 2-3
Valid:   [1, 1, 1, 1]  — Red on all layers
Invalid: [1, 0, 2, 0]  — Gap: Blue appears after empty
Invalid: [0, 0, 0, 0]  — All empty
\`\`\`

### Generation Process
File: \`algorithms/combinatorics/sequences.js\`

\`\`\`
function generateSequences(N, M):
    for height = 1 to M:
        stacks = generateStacksOfHeight(height)  // N^height combinations
        for each stack:
            pad to length M with zeros
            add to sequences
    return sequences
\`\`\`

### Sequence Count Formula
\`\`\`
Total = N × (N^M - 1) / (N - 1)

Example: 4 colours, 4 layers
= 4 × (4^4 - 1) / (4 - 1)
= 4 × 255 / 3
= 340 sequences
\`\`\`

---

## Colour Simulation (simColour)

Predicts the perceived colour of a filament stack by averaging RGB values.

File: \`algorithms/color/color-utils.js\`

\`\`\`
function simColour(sequence, colours):
    r = g = b = count = 0
    for each filamentIndex in sequence:
        if filamentIndex > 0:
            rgb = hex2rgb(colours[filamentIndex - 1].h)
            r += rgb.r
            g += rgb.g
            b += rgb.b
            count++
    if count == 0: return white
    return {r: r/count, g: g/count, b: b/count}
\`\`\`

This is a simple average — real print colours differ due to layer interaction, which is why we need calibration.

---

## Sequence Map (Critical Data Structure)

Maps RGB colours to their generating sequences for the quantization step.

\`\`\`
function buildSequenceMap(sequences, colours, cols):
    map = new Map()
    for each (sequence, index) in sequences:
        colour = simColour(sequence, colours)
        key = rgb_to_key(colour)  // "r,g,b" string
        map.set(key, {
            sequence: sequence,
            grid_position: {row, col, index}
        })
    return map
\`\`\`

---

## Grid Layout Calculation

File: \`algorithms/layout/grid-layout.js\`

Inputs: sequence count, bed dimensions, scan dimensions, tile size, gap

\`\`\`
cols = floor(scanWidth / (tileSize + gap))
rows = ceil(sequenceCount / cols)

gridWidth  = cols × tileSize + (cols - 1) × gap
gridHeight = rows × tileSize + (rows - 1) × gap
\`\`\`

Constraints enforced:
- gridWidth ≤ scanWidth ≤ bedWidth
- gridHeight ≤ scanHeight ≤ bedHeight

---

## Sorting Methods

Re-order sequences for easier visual comparison:

- **Layer Count** — Fewer layers first
- **Luminance** — L = 0.299R + 0.587G + 0.114B
- **Hue** — H from HSL conversion
- **Saturation** — S from HSL
- **Base Filament** — Group by first layer

---

## Key State Variables

\`\`\`
sharedState.selectedFilaments   // Array of filament indices
sharedState.gridData            // Generated grid metadata
sharedState.sequences           // Array of sequence arrays
sharedState.sequenceMap         // Map: rgb_key → sequence data
\`\`\`

---

## Files Modified
- \`MFP-SourceActions.js\` — generateGrid(), importProject()
- \`algorithms/combinatorics/sequences.js\` — generateSequences(), buildSequenceMap()
- \`algorithms/color/color-utils.js\` — simColour()
`,SCAN:`# SCAN TAB — Colour Extraction

## Purpose
Extract the actual RGB colour of each printed tile by aligning a photograph/scan with the reference grid, accounting for perspective distortion.

---

## Perspective-Correct Grid Mapping

### Problem
Photographed grids are never perfectly aligned. The image has:
- Rotation
- Perspective distortion (trapezoid shape)
- Non-uniform scaling

### Solution: Bilinear Interpolation
User positions 4 corner handles (TL, TR, BR, BL). Any point on the grid can be found by interpolating between corners.

File: \`MFP-ScanActions.js\` — analyzeScan()

\`\`\`
function gridToPixel(u, v):
    // u, v ∈ [0, 1] — normalised grid coordinates
    topX    = lerp(TL.x, TR.x, u)
    topY    = lerp(TL.y, TR.y, u)
    bottomX = lerp(BL.x, BR.x, u)
    bottomY = lerp(BL.y, BR.y, u)
    return {
        x: lerp(topX, bottomX, v),
        y: lerp(topY, bottomY, v)
    }

function lerp(a, b, t):
    return a + (b - a) * t
\`\`\`

### Mathematical Form
\`\`\`
P(u,v) = (1-v)·[(1-u)·TL + u·TR] + v·[(1-u)·BL + u·BR]
\`\`\`

---

## Tile Boundary Calculation

For tile at (row, col) in a rows × cols grid:

\`\`\`
u0 = col / cols         // Left edge
u1 = (col + 1) / cols   // Right edge
v0 = row / rows         // Top edge
v1 = (row + 1) / rows   // Bottom edge
\`\`\`

---

## Deadzone (Safe Sampling Region)

Edges are excluded to avoid:
- Gap/filler bleeding
- Printing artifacts
- Alignment errors

\`\`\`
du = (u1 - u0) × deadzoneFraction
dv = (v1 - v0) × deadzoneFraction

safeU0 = u0 + du    safeU1 = u1 - du
safeV0 = v0 + dv    safeV1 = v1 - dv
\`\`\`

For 20% deadzone: sample area = 60% × 60% = 36% of tile

---

## Point-in-Quadrilateral Test

The safe zone is a quadrilateral (not axis-aligned rectangle). Test if pixel (px, py) is inside using cross-product sign consistency.

File: \`MFP-ScanActions.js\` — _pointInQuad()

\`\`\`
function sign(p1, p2, p3):
    return (p1.x - p3.x) × (p2.y - p3.y) - (p2.x - p3.x) × (p1.y - p3.y)

function pointInQuad(px, py, TL, TR, BR, BL):
    d1 = sign(point, TL, TR)
    d2 = sign(point, TR, BR)
    d3 = sign(point, BR, BL)
    d4 = sign(point, BL, TL)
    
    hasNeg = any(d < 0)
    hasPos = any(d > 0)
    
    return NOT (hasNeg AND hasPos)  // Inside if all same sign
\`\`\`

---

## Pixel Sampling Loop

\`\`\`
// Bounding box for efficiency
minX = floor(min(safeTL.x, safeTR.x, safeBL.x, safeBR.x))
maxX = ceil(max(...))
// Similar for Y

pixels = []
for py = minY to maxY:
    for px = minX to maxX:
        if pointInQuad(px, py, safeTL, safeTR, safeBR, safeBL):
            if inBounds(px, py):
                pixels.push(getPixel(px, py))
\`\`\`

---

## Statistical Analysis Per Tile

\`\`\`
// Mean (average colour)
avgR = Σ(pixels.r) / N
avgG = Σ(pixels.g) / N
avgB = Σ(pixels.b) / N

// Variance
varR = Σ(r - avgR)² / N

// Standard Deviation
stdR = √varR

// Combined Colour Deviation
colorDeviation = √(varR + varG + varB)
\`\`\`

High colorDeviation indicates inconsistent printing (banding, under-extrusion).

---

## Output Data Structure

\`\`\`
{
    index: 42,
    row: 4,
    col: 2,
    sequence: [1, 2, 1, 3],
    sequenceStr: "1213",
    filamentStack: [{layer: 0, name: "Red"}, ...],
    rgb: {r: 142, g: 87, b: 103},
    hex: "#8e5767",
    std: {r: 12.3, g: 8.7, b: 9.2},
    colorDeviation: 17.6,
    pixelsSampled: 847
}
\`\`\`

---

## Key State Variables

\`\`\`
sharedState.scanImageElement    // HTMLImageElement of uploaded scan
sharedState.gridCornersPixel    // [{x,y}, ...] — 4 corner positions
sharedState.scanAnalysis        // Array of analysis results per tile
sharedState.referenceGridData   // Grid structure from SOURCE tab
\`\`\`

---

## Controls

- **Drag corners** — Position each corner handle
- **Flip H** — Mirror horizontally
- **Flip V** — Mirror vertically
- **Rotate 90°** — Rotate clockwise
- **Reset** — Return to default positions

## Keyboard Shortcuts
- **Arrow keys** — Pan view
- **+/-** — Zoom in/out
- **0 or Home** — Reset view

---

## View Analysis

After running "Analyze Scan", click "View Analysis Data" to see:
- Interactive grid of all analysed tile colours
- Sorting options: Grid Order, Sequence, Brightness, Hue, Deviation
- Cell size adjustment
- Hover for detailed tile info: sequence, RGB, deviation, pixel count
- Click tile for layer breakdown

The view displays in the canvas area (not a popup) and can be closed with the ✕ button.

---

## Project Export

All scan data is saved in the project ZIP:
- \`scans/scan.png\` — The uploaded scan image
- \`scans/grid-alignment.json\` — Grid corner positions for re-import
- \`scans/analysis.json\` — Full analysis data per tile
- \`scans/quantization-config.json\` — Palette mapping for quantization

---

## Files Modified
- \`MFP-ScanActions.js\` — loadScanImage(), analyzeScan(), viewAnalysis(), _pointInQuad()
- \`MFP-Main.js\` — _drawGridOverlay(), _setupScanCanvasInteraction()
`,QUANTIZE:`# QUANTIZE TAB — Image Conversion

## Purpose
Convert any source image to use only the colours available from the calibration grid, enabling it to be printed with the multifilament system.

---

## Colour Matching Algorithm

For each source pixel, find the nearest calibration colour.

File: \`MFP-QuantizeActions.js\` — quantize()

\`\`\`
for each pixel in sourceImage:
    minDist = infinity
    nearestColor = null
    
    for each color in calibrationPalette:
        dist = distance(pixel, color)
        if dist < minDist:
            minDist = dist
            nearestColor = color
    
    outputPixel = nearestColor
\`\`\`

---

## Distance Metrics

### Euclidean RGB
\`\`\`
d = √((r₁-r₂)² + (g₁-g₂)² + (b₁-b₂)²)
\`\`\`

Simple but doesn't match human perception.

### Weighted RGB (Redmean approximation)
\`\`\`
rmean = (r₁ + r₂) / 2
dr = r₁ - r₂
dg = g₁ - g₂
db = b₁ - b₂

d = √((2 + rmean/256)×dr² + 4×dg² + (2 + (255-rmean)/256)×db²)
\`\`\`

Better perceptual accuracy without colour space conversion.

### CIE LAB ΔE (if implemented)
\`\`\`
1. Convert RGB → XYZ → LAB
2. d = √((L₁-L₂)² + (a₁-a₂)² + (b₁-b₂)²)
\`\`\`

Perceptually uniform — 1 unit = 1 JND (just noticeable difference).

---

## Dithering Algorithms

Distribute quantization error to neighbouring pixels.

### None
Direct mapping — each pixel independently converted. Creates posterised/banded appearance.

### Floyd-Steinberg
Classic error diffusion (1976). Error distributed:
\`\`\`
        current    7/16 →
    3/16 ↙  5/16 ↓  1/16 ↘
\`\`\`

### Atkinson
Preserves detail, iconic Mac aesthetic. Only 6/8 of error diffused:
\`\`\`
        current    1/8 →  1/8 →
    1/8 ↙  1/8 ↓  1/8 ↘
           1/8 ↓↓
\`\`\`

### Ordered (Bayer)
Deterministic threshold matrix. No error propagation — good for animation.

---

## Quantization Config Structure

\`\`\`
{
    colorMap: [
        {
            rgb: {r, g, b},
            hex: "#rrggbb",
            sequence: [1, 2, 0, 0],
            sequenceStr: "1200"
        },
        ...
    ],
    filaments: [{name, hex}, ...],
    layerCount: 4,
    tileCount: 340
}
\`\`\`

---

## Expansion to 3D Layers

After quantization, each pixel maps to a sequence. The image expands to M layer images:

\`\`\`
for each pixel at (x, y):
    sequence = quantizationConfig.colorMap[pixelColor].sequence
    for layer = 0 to M-1:
        filamentIndex = sequence[layer]
        layerImages[layer][x, y] = filamentIndex
\`\`\`

---

## Key State Variables

\`\`\`
sharedState.sourceImageElement    // Original image to quantize
sharedState.quantizedImageElement // Result preview
sharedState.quantizationConfig    // Palette from scan analysis
\`\`\`

---

## Files Modified
- \`MFP-QuantizeActions.js\` — loadSourceImage(), quantize()
`,OUTPUTS:`# OUTPUTS TAB — Unified Output Dashboard

## Purpose
View and download every artifact produced by the tool. Status indicators show what is available. Canvas view selector previews any output. Artwork STL generation (quantised image → 3D print files) lives here exclusively.

---

## Output Sections

### CANVAS VIEW
Dropdown selects which output to preview on the canvas:
- **Quantised Image** — dithered pixel art from QUANTIZE tab
- **Grid Combined / Grid Layer N** — calibration grid from SOURCE tab
- **Scan Overlay** — scan photo with perspective-correct grid overlay from SCAN tab
- **Artwork Combined / Artwork Layer N** — generated STL geometry as 2D layer view

### CALIBRATION GRID
Requires: \`gridData\` (generate grid in SOURCE tab)

- **Grid PNG** — high-res 300 DPI raster image of the calibration grid
- **Grid STLs** — one STL file per filament, grid mode (explicit tile/gap spacing)
- **Grid CSV** — index, row, col, sequence, RGB, hex per tile
- **Grid JSON** — complete grid layout with all settings (\`grid-layout.json\` format)

### SCAN ANALYSIS
Requires: \`scanAnalysis\` (run Analyze Scan in SCAN tab)

- **Palette (GPL)** — GIMP/Inkscape palette of scanned tile colours
- **Quant Config (JSON)** — colour map for quantization: RGB → filament sequence
- **Comparison CSV** — expected vs measured colour per tile with Delta E

### QUANTISED IMAGE
Requires: \`quantizedImageElement\` (run Quantize Image in QUANTIZE tab)

- **Quantised PNG** — the dithered output image at tile resolution

### ARTWORK STLs
Requires: \`quantizedSequenceMap\` + \`quantizationConfig\`

Contour-based pipeline: pixel map → binary field → marching squares (sub-pixel contours) → Douglas-Peucker simplification → Chaikin smoothing → ear-clip triangulation + side walls → STL. Boundary smoothing happens here in geometry space, not in the pixel domain.

\`\`\`
quantizedSequenceMap
  map[pixelIdx] = paletteIdx
  palette[i].sequence = [1, 0, 3, 2]  // 1-indexed filament per layer
    ↓
layerMaps[layer][filament] = Set("x,y")
    ↓
contourSTL(pixelSet, w, h, z0, z1, pixelSize, { chaikinIterations, simplifyTolerance })
    ↓
{ "artwork_Red_PLA.stl": "solid ...", ... }
\`\`\`

**Key difference from grid STLs:** image mode uses \`pixelSize = printWidth / imageWidth\` — no gaps, no tile spacing. Adjacent same-filament pixels are merged into rectangles by the vectoriser before generating box geometry.

Layer view on canvas: **Combined** merges all layers (topmost filament per pixel wins); **Layer N** shows a single layer coloured by filament.

### COMPLETE PROJECT
Requires: \`gridData\`

Exports everything into one ZIP: grid layout JSON, STL files, layer PNGs, scan image and alignment, analysis data, quantization config, GPL palette, comparison CSV, quantized image, source image.

---

## Key State Variables

\`\`\`
sharedState.gridData              // Calibration grid
sharedState.scanAnalysis          // Per-tile measured colours
sharedState.quantizationConfig    // Palette: colour → sequence
sharedState.quantizedSequenceMap  // { width, height, map: Uint16Array, palette }
sharedState.exportSTLData         // { stls, layerMaps, filamentNames, config }
\`\`\`

---

## Files
- \`MFP-ExportActions.js\` — generateArtworkSTL(), downloadAllSTLs(), exportJSON(), exportCompleteProject()
- \`MFP-SourceActions.js\` — exportGridPNG(), exportGridSTL(), exportGridCSV(), exportCompletePackage()
- \`MFP-ScanActions.js\` — exportPalette(), exportQuantizationConfig(), exportComparisonCSV()
- \`MFP-QuantizeActions.js\` — exportQuantizedImage()
- \`algorithms/geometry/stl-generation.js\` — exportArtworkSTLs()
`};return t[e]||t.SOURCE}_markdownToHtml(e){return`
            <style>
                .tool-docs-viewer h1 { 
                    font-size: calc(var(--f) * 1.4);
                    font-weight: 700;
                    border-bottom: 1px solid var(--c-border); 
                    padding-bottom: calc(var(--f) * 0.5); 
                    margin-bottom: calc(var(--f) * 1.5);
                    color: var(--c-text);
                }
                .tool-docs-viewer h2 { 
                    font-size: calc(var(--f) * 1.1);
                    font-weight: 700;
                    margin-top: calc(var(--f) * 1.5); 
                    margin-bottom: calc(var(--f) * 0.5);
                    color: var(--c-text);
                    border-bottom: 1px solid var(--c-border-subtle, var(--c-border));
                    padding-bottom: calc(var(--f) * 0.25);
                }
                .tool-docs-viewer h3 { 
                    font-size: calc(var(--f));
                    font-weight: 700;
                    margin-top: calc(var(--f) * 1); 
                    margin-bottom: calc(var(--f) * 0.4);
                    color: var(--c-text-muted, var(--c-text));
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .tool-docs-viewer p { 
                    margin-bottom: calc(var(--f) * 0.6); 
                    line-height: 1.6;
                    color: var(--c-text-muted, var(--c-text));
                }
                .tool-docs-viewer code.doc-inline { 
                    background: var(--c-bg-elevated, var(--vga-gray)); 
                    color: var(--c-text); 
                    padding: 1px 4px; 
                    font-family: 'Space Mono', monospace;
                    font-size: calc(var(--f) * 0.85);
                }
                .tool-docs-viewer pre.doc-code { 
                    background: var(--c-bg-elevated, var(--vga-gray)); 
                    border: 1px solid var(--c-border); 
                    padding: calc(var(--f) * 0.75); 
                    margin: calc(var(--f) * 0.75) 0; 
                    overflow-x: auto; 
                    font-family: 'Space Mono', monospace; 
                    font-size: calc(var(--f) * 0.8);
                    line-height: 1.4;
                    color: var(--c-text);
                }
                .tool-docs-viewer pre.doc-code code { 
                    background: none; 
                    padding: 0; 
                    color: inherit;
                }
                .tool-docs-viewer ul { 
                    margin: calc(var(--f) * 0.4) 0 calc(var(--f) * 0.6) calc(var(--f) * 1.25); 
                    list-style-type: disc;
                    color: var(--c-text-muted, var(--c-text));
                }
                .tool-docs-viewer li { 
                    margin: calc(var(--f) * 0.2) 0;
                    line-height: 1.5;
                }
                .tool-docs-viewer hr { 
                    border: none; 
                    border-top: 1px solid var(--c-border); 
                    margin: calc(var(--f) * 1.25) 0; 
                }
                .tool-docs-viewer strong { 
                    color: var(--c-text);
                    font-weight: 700;
                }
            </style>
            ${e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/```(\w*)\n([\s\S]*?)```/g,(e,t,n)=>`<pre class="doc-code"><code>${n.trim()}</code></pre>`).replace(/`([^`]+)`/g,`<code class="doc-inline">$1</code>`).replace(/^### (.+)$/gm,`<h3>$1</h3>`).replace(/^## (.+)$/gm,`<h2>$1</h2>`).replace(/^# (.+)$/gm,`<h1>$1</h1>`).replace(/\*\*([^*]+)\*\*/g,`<strong>$1</strong>`).replace(/^---$/gm,`<hr>`).replace(/^- (.+)$/gm,`<li>$1</li>`).replace(/(<li>.*<\/li>\n?)+/g,`<ul>$&</ul>`).replace(/^(?!<[huplo]|<\/|<hr)(.+)$/gm,`<p>$1</p>`)}
        `}_getSelectedFilamentNames(){return!this.sharedState.selectedFilaments||this.sharedState.selectedFilaments.length===0?[`Select filaments first`]:this.sharedState.selectedFilaments.map(e=>u[e].n)}_updateFilamentDropdowns(){let e=this._getSelectedFilamentNames();console.log(`🔄 Updating filament dropdowns with options:`,e);for(let t of[`baseFilament`,`topFilament`,`gapFilament`]){let n=this.toolBase.components.get(t);n&&typeof n.setOptions==`function`?(n.setOptions(e),console.log(`✅ Updated ${t} dropdown`)):console.log(`⚠️ Dropdown ${t} not found or missing setOptions`)}}_getSidebarConfig(){let e=this.sharedState.importedState||{};return[[`SOURCE`,[[`PROJECT`,[[`file`,`Import Project (ZIP)`,{key:`importProject`,accept:`.zip`}],[`label`,`Import complete project ZIP or start new`,{key:`projectStatus`,variant:`caption`}]]],[`FILAMENT PICKER`,[[`filament-picker`,`Select Filament Colors (2-10)`,u,{key:`filamentPicker`,min:2,max:10,selectedIndices:this.sharedState.selectedFilaments}]]],[`PHYSICAL CONSTRAINTS`,[[`number`,`Bed Width (mm)`,100,400,1,{key:`bedWidth`,value:e.bedWidth||d.bedWidth,withNumber:!0}],[`number`,`Bed Height (mm)`,100,400,1,{key:`bedHeight`,value:e.bedHeight||d.bedHeight,withNumber:!0}],[`number`,`Scan Width (mm)`,100,300,1,{key:`scanWidth`,value:e.scanWidth||d.scanWidth,withNumber:!0}],[`number`,`Scan Height (mm)`,100,400,1,{key:`scanHeight`,value:e.scanHeight||d.scanHeight,withNumber:!0}]]],[`TILE CONFIGURATION`,[[`number`,`Layers per Tile`,1,10,1,{key:`layerCount`,value:e.layerCount||d.layerCount,withNumber:!0}],[`number`,`Layer Height (mm)`,.04,.4,.01,{key:`layerHeight`,value:e.layerHeight||d.layerHeight,withNumber:!0}],[`number`,`Tile Size (mm)`,2,20,.5,{key:`tileSize`,value:e.tileSize||d.tileSize,withNumber:!0}],[`number`,`Gap (mm)`,0,5,.5,{key:`gap`,value:e.gap===void 0?d.gap:e.gap,withNumber:!0}],[`number`,`Perimeter Margin (mm)`,0,10,.5,{key:`perimeterMargin`,value:e.perimeterMargin||d.perimeterMargin,withNumber:!0}],[`label`,`Border around entire grid (for scan edge tolerance)`,{variant:`caption`}]]],[`BASE & TOP LAYERS`,[[`number`,`Base Layers (bottom)`,0,10,1,{key:`baseLayers`,value:e.baseLayers===void 0?d.baseLayers:e.baseLayers,withNumber:!0}],[`dropdown`,`Base Filament`,this._getSelectedFilamentNames(),{key:`baseFilament`,value:e.baseFilament}],[`number`,`Top Layers (top)`,0,10,1,{key:`topLayers`,value:e.topLayers||d.topLayers,withNumber:!0}],[`dropdown`,`Top Filament`,this._getSelectedFilamentNames(),{key:`topFilament`,value:e.topFilament}]]],[`GAP & PERIMETER`,[[`toggle`,`Fill Gaps & Perimeter`,[`Fill Gaps`],{key:`gapFillOptions`,selectedValues:e.gapFillOptions||[]}],[`dropdown`,`Fill Filament`,this._getSelectedFilamentNames(),{key:`gapFilament`,value:e.gapFilament}],[`label`,`Fills gaps between tiles AND perimeter margin`,{variant:`caption`}]]],[`SORT & VIEW`,[[`dropdown`,`Sort Method`,[`Layer Count`,`Base Color`,`Top Color`,`Complexity`,`Lexicographic`],{value:e.sortMethod||d.sortMethod,key:`sortMethod`}],[`dropdown`,`Canvas View`,[`Combined`,`Layer 0`,`Layer 1`,`Layer 2`,`Layer 3`],{value:`Combined`,key:`canvasView`}]]],[`GENERATE GRID`,[[`button`,`Generate Grid`,null,{key:`generateGrid`,variant:`primary`}],[`button`,`Generate Split Grids`,null,{key:`generateSplitGrids`}],[`label`,``,{key:`sequenceCount`,variant:`caption`}],[`label`,`Select 2-10 filaments, then click Generate Grid`,{key:`gridStatus`,variant:`caption`}]]],[`EXPORT OPTIONS`,[[`toggle`,`Options`,[`STL Combined`,`STL Per Layer`,`Sorted Variants`,`Layer Visuals`],{key:`exportOptions`,selectedValues:[`STL Combined`,`STL Per Layer`,`Sorted Variants`,`Layer Visuals`]}]]],[`EXPORT ACTIONS`,[[`button`,`Export Grid PNG`,null,{key:`exportGridPNG`}],[`button`,`Export Grid STLs`,null,{key:`exportGridSTL`}],[`button`,`Export Grid CSV`,null,{key:`exportGridCSV`}],[`button`,`📦 Export Complete Package`,null,{key:`exportCompletePackage`,variant:`primary`}],[`label`,``,{key:`exportStatus`,variant:`caption`}]]]]],[`SCAN`,[[`GRID REFERENCE`,[[`file`,`Import Project (ZIP)`,{key:`importProjectScan`,accept:`.zip`}],[`file`,`Import Grid CSV`,{key:`importGridCSV`,accept:`.csv`}],[`button`,`Use Last Generated Grid`,null,{key:`useLastGrid`}],[`button`,`View Reference Grid`,null,{key:`viewReferenceGrid`}],[`dropdown`,`Re-sort Grid`,[`Layer Count`,`Base Color`,`Top Color`,`Complexity`,`Lexicographic`],{key:`resortGrid`,value:e.sortMethod||d.sortMethod}],[`button`,`Apply Sort`,null,{key:`applySortToGrid`}],[`label`,``,{key:`gridLoadStatus`,variant:`caption`}]]],[`SCAN IMAGE`,[[`file`,`Scan Image`,{key:`scanImage`,accept:`image/*`}],[`label`,``,{key:`scanImageStatus`,variant:`caption`}],[`button`,`Reset View`,null,{key:`resetView`}],[`label`,`1:1 pixels. Scroll=zoom, Drag=pan. Arrow keys + ±`,{variant:`caption`}]]],[`GRID OVERLAY`,[[`label`,`Grid auto-sized on image upload`,{key:`gridInfo`,variant:`caption`}],[`number`,`Fine Adjust X (px)`,-50,50,1,{key:`gridOffsetX`,value:0,withNumber:!0}],[`number`,`Fine Adjust Y (px)`,-50,50,1,{key:`gridOffsetY`,value:0,withNumber:!0}],[`number`,`Rotation (°)`,-5,5,.1,{key:`gridRotation`,value:0,withNumber:!0}],[`button`,`Flip H`,null,{key:`flipH`}],[`button`,`Flip V`,null,{key:`flipV`}],[`button`,`Rotate 90°`,null,{key:`rotate90`}],[`toggle`,`Options`,[`Show Sample Zones`,`Show Expected Colors`,`Show Analysed Colors`],{key:`gridOptions`,selectedValues:[`Show Sample Zones`]}],[`number`,`Expected Color Opacity (%)`,0,100,5,{key:`expectedOpacity`,value:50,withNumber:!0}],[`button`,`Reset Alignment`,null,{key:`resetGrid`}]]],[`SAMPLING`,[[`number`,`Deadzone (%)`,0,40,5,{key:`deadzonePercent`,value:d.deadzonePercent,withNumber:!0}],[`label`,`Edge border to exclude (20% = 40% total removed)`,{variant:`caption`}]]],[`ANALYSIS`,[[`button`,`Analyze Scan`,null,{key:`analyzeScan`,variant:`primary`}],[`button`,`View Analysis Data`,null,{key:`viewAnalysis`}],[`button`,`Export Palette (GPL)`,null,{key:`exportPalette`}],[`button`,`Export Quantization Config`,null,{key:`exportQuantConfig`}],[`button`,`Export Comparison CSV`,null,{key:`exportComparisonCSV`}],[`label`,``,{key:`scanStatus`,variant:`caption`}]]],[`SAVE PROJECT`,[[`button`,`Export Project ZIP`,null,{key:`exportCompleteProject`,variant:`primary`}],[`label`,`Saves all settings + scan alignment + analysis`,{variant:`caption`}]]]]],[`QUANTIZE`,[[`PALETTE STATUS`,[[`label`,`⚠️ No palette loaded. Generate or import a grid first.`,{key:`paletteStatus`,variant:`caption`}]]],[`PALETTE`,[[`file`,`Upload Palette JSON`,{key:`uploadPalette`,accept:`.json,application/json`}],[`button`,`Import Project ZIP`,null,{key:`importProjectQuantize`}],[`label`,`Import palette from calibration-palette.json or project ZIP`,{variant:`caption`}]]],[`IMAGE`,[[`file`,`Source Image`,{key:`sourceImage`,accept:`image/*`}]]],[`IMAGE ADJUSTMENTS`,[[`adjustment-bundle`,`professional`,null,{key:`imageAdjust`}]]],[`PROCESSING`,[[`number`,`Print Width (mm)`,50,300,1,{key:`printWidth`,value:170,withNumber:!0}],[`dropdown`,`Dither Algorithm`,[`None`,`Floyd-Steinberg`,`Bayer 4×4`,`Blue Noise`],{key:`ditherAlgorithm`,value:`Floyd-Steinberg`}],[`number`,`Min Detail (mm)`,0,2,.1,{key:`minDetail`,value:.8,withNumber:!0}]]],[`COLOUR SPACE`,[[`label`,`Distance metric for palette matching. CIELAB is perceptually uniform. RGB is direct. HSL separates hue/saturation/lightness. Weights scale each axis independently.`,{variant:`caption`}],[`dropdown`,`Space`,[`CIELAB`,`RGB`,`HSL`],{key:`colourSpace`,value:`CIELAB`}],[`number`,`Weight 1 (L / R / H)`,0,5,.1,{key:`csWeight1`,value:1,withNumber:!0}],[`number`,`Weight 2 (a* / G / S)`,0,5,.1,{key:`csWeight2`,value:1,withNumber:!0}],[`number`,`Weight 3 (b* / B / L)`,0,5,.1,{key:`csWeight3`,value:1,withNumber:!0}]]],[`OPTIMISATION`,[[`label`,`Within variance, prefer entries by print form over pure colour closeness. Deep runs multi-pass region consensus.`,{variant:`caption`}],[`dropdown`,`Analysis Mode`,[`Fast`,`Deep`],{key:`analysisMode`,value:`Fast`}],[`number`,`Colour Variance (ΔE)`,0,30,1,{key:`colourVariance`,value:0,withNumber:!0}],[`dropdown`,`Layer Preference`,[`None`,`More Layers`,`Fewer Layers`],{key:`layerPreference`,value:`None`}],[`number`,`Grouping Weight`,0,1,.05,{key:`groupingWeight`,value:.3,withNumber:!0}]]],[`SIMPLIFICATION`,[[`label`,`Topological cleanup. Min Cluster merges small regions. Palette Merge collapses near-identical sequences.`,{variant:`caption`}],[`number`,`Min Cluster (px)`,0,200,1,{key:`minimumClusterPx`,value:0,withNumber:!0}],[`number`,`Palette Merge (ΔE)`,0,15,.5,{key:`paletteMergeThreshold`,value:0,withNumber:!0}]]],[`ACTIONS`,[[`button`,`Quantize Image`,null,{key:`quantize`,variant:`primary`}],[`label`,``,{key:`quantizeStatus`,variant:`caption`}]]],[`STL GENERATION`,[[`label`,`Contour-based: marching squares extract sub-pixel boundaries, Douglas-Peucker simplifies, Chaikin smooths. Operates on geometry, not pixels.`,{variant:`caption`}],[`number`,`Smooth Iterations`,0,6,1,{key:`stlSmoothIterations`,value:2,withNumber:!0}],[`number`,`Simplify Tolerance (px)`,0,2,.05,{key:`stlSimplifyTolerance`,value:.3,withNumber:!0}],[`number`,`Min Contour Area (px²)`,0,20,1,{key:`stlMinContourArea`,value:2,withNumber:!0}],[`button`,`Generate Artwork STLs`,null,{key:`generateArtworkSTL`,variant:`primary`}],[`label`,``,{key:`exportArtworkStatus`,variant:`caption`}],[`button`,`Export Analysis Image`,null,{key:`exportAnalysisImage`}]]],[`SAVE PROJECT`,[[`button`,`Export Project ZIP`,null,{key:`exportCompleteProject`,variant:`primary`}],[`label`,`Saves all settings + quantized image`,{variant:`caption`}]]]]],[`OUTPUTS`,[[`CALIBRATION GRID`,[[`label`,``,{key:`outputsGridStatus`,variant:`caption`}],[`button`,`Download Grid PNG`,null,{key:`outputGridPNG`}],[`button`,`Download Grid STLs`,null,{key:`outputGridSTL`}],[`button`,`Download Grid CSV`,null,{key:`outputGridCSV`}],[`button`,`Download Grid JSON`,null,{key:`outputGridJSON`}],[`label`,``,{key:`outputsGridActionStatus`,variant:`caption`}]]],[`SCAN ANALYSIS`,[[`label`,``,{key:`outputsScanStatus`,variant:`caption`}],[`button`,`Download Palette (GPL)`,null,{key:`outputPaletteGPL`}],[`button`,`Download Quant Config (JSON)`,null,{key:`outputQuantConfig`}],[`button`,`Download Comparison CSV`,null,{key:`outputComparisonCSV`}],[`label`,``,{key:`outputsScanActionStatus`,variant:`caption`}]]],[`QUANTISED IMAGE`,[[`label`,``,{key:`outputsQuantStatus`,variant:`caption`}],[`button`,`Download Quantised PNG`,null,{key:`outputQuantPNG`}],[`label`,``,{key:`outputsQuantActionStatus`,variant:`caption`}]]],[`ARTWORK STLs`,[[`label`,``,{key:`outputsArtworkStatus`,variant:`caption`}],[`number`,`Print Width (mm)`,50,300,1,{key:`stlPrintWidth`,value:e.printWidth||170,withNumber:!0}],[`number`,`Layer Height (mm)`,.04,.4,.01,{key:`stlLayerHeight`,value:e.layerHeight||d.layerHeight,withNumber:!0}],[`button`,`Generate Artwork STLs`,null,{key:`generateArtworkSTL`,variant:`primary`}],[`button`,`Download All STLs (ZIP)`,null,{key:`downloadSTLZip`}],[`button`,`Download Individual STLs`,null,{key:`downloadSTLIndividual`}],[`label`,``,{key:`exportArtworkStatus`,variant:`caption`}]]],[`COMPLETE PROJECT`,[[`button`,`Export Complete Project ZIP`,null,{key:`exportCompleteProject`,variant:`primary`}],[`label`,``,{key:`exportProjectStatus`,variant:`caption`}]]]]]]}_handleInit(e){console.log(`🎬 MFP _handleInit called:`,{values:e}),window.debugLog(`TOOLS`,`MFP: Init`),console.log(`🎬 Initializing SOURCE tab`),this.sourceActions.updateSequenceCount(this.toolBase);let t=this.toolBase.components.get(`imageAdjust`);t&&(t.onTransform=e=>{this.sharedState.sourceImageData=e,this.toolBase.draw(),console.log(`✅ Image adjustments applied`)},console.log(`✅ AdjustmentBundle wired`)),this._setupScanCanvasInteraction()}_setupScanCanvasInteraction(){let e=this.toolBase.canvasComponent;if(!e||!e.canvasEl)return;let t=e.canvasEl;this.scanDragState={isDragging:!1,dragType:null,dragCornerIndex:-1,startX:0,startY:0,startCorners:null};let n=t=>e.screenToCanvas(t.clientX,t.clientY),r=()=>this.sharedState.gridCornersPixel,i=(e,t,n)=>{if(!n||n.length!==4)return!1;let r=(e,t,n)=>(e.x-n.x)*(t.y-n.y)-(t.x-n.x)*(e.y-n.y),i=r({x:e,y:t},n[0],n[1]),a=r({x:e,y:t},n[1],n[2]),o=r({x:e,y:t},n[2],n[3]),s=r({x:e,y:t},n[3],n[0]);return!((i<0||a<0||o<0||s<0)&&(i>0||a>0||o>0||s>0))},a=(t,n,r)=>{if(!r)return-1;let i=15/(e.transform?.scale||1);for(let e=0;e<r.length;e++){let a=r[e];if(!a)continue;let o=t-a.x,s=n-a.y;if(Math.sqrt(o*o+s*s)<=i)return e}return-1},o=e=>{if(e.button===2)return;let o=r(),{x:s,y:c}=n(e);if(!this.sharedState.scanImageElement||!o)return;let l=a(s,c,o);if(l!==-1){this.scanDragState.isDragging=!0,this.scanDragState.dragType=`corner`,this.scanDragState.dragCornerIndex=l,this.scanDragState.startX=s,this.scanDragState.startY=c,this.scanDragState.startCorners=o.map(e=>({...e})),t.style.cursor=`grabbing`,t.setPointerCapture(e.pointerId),e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation();return}if(i(s,c,o)){this.scanDragState.isDragging=!0,this.scanDragState.dragType=`body`,this.scanDragState.startX=s,this.scanDragState.startY=c,this.scanDragState.startCorners=o.map(e=>({...e})),t.style.cursor=`grabbing`,t.setPointerCapture(e.pointerId),e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation();return}},s=o=>{let s=r(),{x:c,y:l}=n(o);if(this.scanDragState.isDragging){let e=c-this.scanDragState.startX,t=l-this.scanDragState.startY;if(this.scanDragState.dragType===`corner`){let n=this.scanDragState.dragCornerIndex;this.sharedState.gridCornersPixel[n]={x:this.scanDragState.startCorners[n].x+e,y:this.scanDragState.startCorners[n].y+t}}else this.scanDragState.dragType===`body`&&(this.sharedState.gridCornersPixel=this.scanDragState.startCorners.map(n=>({x:n.x+e,y:n.y+t})));this.toolBase.draw(),o.preventDefault(),o.stopPropagation()}else s&&(a(c,l,s)===-1?i(c,l,s)?t.style.cursor=`move`:t.style.cursor=e.enablePan?`grab`:`default`:t.style.cursor=`crosshair`)},c=e=>{this.scanDragState.isDragging&&(this.scanDragState.wasDragging=!0,this.scanDragState.isDragging=!1,this.scanDragState.dragType=null,this.scanDragState.dragCornerIndex=-1,t.style.cursor=`default`,e.stopPropagation())};t.addEventListener(`pointerdown`,o,!0),t.addEventListener(`pointermove`,s,!0),t.addEventListener(`pointerup`,c,!0),t.addEventListener(`pointercancel`,c,!0),t.addEventListener(`click`,e=>{if(this.scanDragState.wasDragging){this.scanDragState.wasDragging=!1;return}let t=r();if(!t)return;let{x:o,y:s}=n(e);if(a(o,s,t)===-1&&i(o,s,t)){let e=this.sharedState.gridData||this.sharedState.referenceGridData;if(!e)return;let{rows:n,cols:r}=e,[i,a,c,l]=t,u=this._findTileAtPoint(o,s,t,n,r);u&&this._showTileDetails(u.row,u.col,e)}},!0)}_handleUpdate(e,t,n){switch(console.log(`🔄 MFP _handleUpdate called:`,{key:e,value:t,allValues:n}),window.debugLog(`TOOLS`,`MFP: Update ${e}`),e){case`importProject`:this.sourceActions.importProject(t,this.toolBase).then(()=>{this.sharedState.selectedFilaments&&this.sharedState.selectedFilaments.length>0&&(this._updateFilamentDropdowns(),this.sourceActions.updateSequenceCount(this.toolBase))});break;case`filamentPicker_indices`:console.log(`🎨 filamentPicker_indices changed:`,t),this.sharedState.selectedFilaments=t||[],console.log(`🎨 Updated sharedState.selectedFilaments:`,this.sharedState.selectedFilaments),this.sourceActions.updateSequenceCount(this.toolBase),this._updateFilamentDropdowns(),this.sharedState.selectedFilaments.length>=2?(console.log(`🎨 Triggering generateLivePreview...`),this.sourceActions.generateLivePreview(n,this.toolBase)):console.log(`🎨 Not enough filaments to preview (need 2+)`);break;case`layerCount`:case`baseLayers`:case`topLayers`:case`tileSize`:case`gap`:case`perimeterMargin`:case`maxWidth`:case`maxHeight`:case`bedWidth`:case`bedHeight`:case`sortMethod`:this.sharedState.selectedFilaments&&this.sharedState.selectedFilaments.length>=2&&this.sourceActions.generateLivePreview(n,this.toolBase);break;case`canvasView`:case`gapFillOptions`:case`gapFilament`:case`baseFilament`:case`topFilament`:break;default:this.sharedState.showDocs&&this.docsContainer&&(this.markdownComponent&&this.markdownComponent.destroy&&this.markdownComponent.destroy(),this.docsContainer.innerHTML=``,this.docsContainer.remove(),this.docsContainer=null,this.markdownComponent=null,this._toggleDocumentation());break;case`generateGrid`:this.sourceActions.generateGrid(n,this.toolBase);break;case`generateSplitGrids`:this.sourceActions.generateSplitGrids(n,this.toolBase);break;case`exportGridPNG`:this.sourceActions.exportGridPNG(n,this.toolBase);break;case`exportGridSTL`:this.sourceActions.exportGridSTL(n,this.toolBase);break;case`exportGridCSV`:this.sourceActions.exportGridCSV(n,this.toolBase);break;case`exportCompletePackage`:this.sourceActions.exportCompletePackage(n,this.toolBase);break;case`importProjectScan`:this.scanActions.importProject(t,this.toolBase);break;case`importGridCSV`:this.scanActions.importGridCSV(t,this.toolBase);break;case`useLastGrid`:this.scanActions.useLastGrid(this.toolBase);break;case`viewReferenceGrid`:this.scanActions.viewReferenceGrid(this.toolBase);break;case`applySortToGrid`:this.scanActions.applySortToGrid(n,this.toolBase);break;case`scanImage`:this.scanActions.loadScanImage(t,this.toolBase);break;case`resetGrid`:if(this.sharedState.scanImageElement){let e=this.sharedState.scanImageElement,t=this.sharedState.gridData||this.sharedState.referenceGridData;t&&this.scanActions._initializeGridCornersPixel(e.width,e.height,t)}this.scanActions.resetGrid(this.toolBase);break;case`flipH`:this._flipGridHorizontal();break;case`flipV`:this._flipGridVertical();break;case`rotate90`:this._rotateGrid90();break;case`resetView`:this.toolBase.canvasComponent&&(this.toolBase.canvasComponent.resetViewport(!0),console.log(`🔄 View reset to default`));break;case`gridOffsetX`:case`gridOffsetY`:case`gridRotation`:case`gridOptions`:case`expectedOpacity`:case`deadzonePercent`:let e=n.gridOptions||[];this.sharedState.gridOverlayOptions={showSampleZones:e.includes(`Show Sample Zones`),showExpected:e.includes(`Show Expected Colors`),showAnalysed:e.includes(`Show Analysed Colors`)},this.sharedState.gridAlignment={offsetX:n.gridOffsetX||0,offsetY:n.gridOffsetY||0,rotation:n.gridRotation||0,...this.sharedState.gridOverlayOptions};break;case`analyzeScan`:console.log(`🔘 Analyze Scan button clicked`),this.scanActions.analyzeScan(n,this.toolBase).then(()=>{if(this.sharedState.scanAnalysis&&this.sharedState.scanAnalysis.length>0){let e=n.gridOptions||[];if(!e.includes(`Show Analysed Colors`)){let t=[...e,`Show Analysed Colors`];this.toolBase.setValue(`gridOptions`,t),this.sharedState.gridOverlayOptions={showSampleZones:t.includes(`Show Sample Zones`),showExpected:t.includes(`Show Expected Colors`),showAnalysed:!0}}let t=this.toolBase.getComponent(`analyzeScan`);t&&t.element&&(t.element.textContent=`Analysed`,t.element.style.background=`var(--c-text)`,t.element.style.color=`var(--c-bg)`),this._refreshTabStatus(`QUANTIZE`),this._updatePaletteDisplay()}this.toolBase.draw()});break;case`viewAnalysis`:this.scanActions.viewAnalysis(this.toolBase);break;case`exportPalette`:this.scanActions.exportPalette(this.toolBase);break;case`exportQuantConfig`:this.scanActions.exportQuantizationConfig(this.toolBase);break;case`exportComparisonCSV`:this.scanActions.exportComparisonCSV(this.toolBase);break;case`uploadPalette`:this.quantizeActions.loadPaletteFromJSON(t,this.toolBase).then(()=>{this._refreshTabStatus(`QUANTIZE`)});break;case`importProjectQuantize`:this._triggerFileUpload(`.json,.zip`,async e=>{e.name.endsWith(`.zip`)?await this.sourceActions.importProject(e,this.toolBase):await this.quantizeActions.loadPaletteFromJSON(e,this.toolBase),this._refreshTabStatus(`QUANTIZE`),this.toolBase.draw()});break;case`sourceImage`:this.quantizeActions.loadSourceImage(t,this.toolBase);break;case`quantize`:this.quantizeActions.quantize(n,this.toolBase);break;case`outputsCanvasView`:break;case`outputGridPNG`:this.sourceActions.exportGridPNG(n,this.toolBase);break;case`outputGridSTL`:this.sourceActions.exportGridSTL(n,this.toolBase);break;case`outputGridCSV`:this.sourceActions.exportGridCSV(n,this.toolBase);break;case`outputGridJSON`:this.exportActions.exportJSON(n,this.toolBase);break;case`outputPaletteGPL`:this.scanActions.exportPalette(this.toolBase);break;case`outputQuantConfig`:this.scanActions.exportQuantizationConfig(this.toolBase);break;case`outputComparisonCSV`:this.scanActions.exportComparisonCSV(this.toolBase);break;case`outputQuantPNG`:this.quantizeActions.exportQuantizedImage(this.toolBase);break;case`exportAnalysisImage`:this.quantizeActions.exportAnalysisImage(n,this.toolBase);break;case`generateArtworkSTL`:this.exportActions.generateArtworkSTL(n,this.toolBase);break;case`downloadSTLZip`:this.exportActions.downloadAllSTLs(this.toolBase);break;case`downloadSTLIndividual`:this.exportActions.downloadIndividualSTLs(this.toolBase);break;case`exportCompleteProject`:this.exportActions.exportCompleteProject(n,this.toolBase);break}}_handleDraw(e,t,n){e.fillStyle=`#000000`,e.fillRect(0,0,t.width,t.height);let r=this._getCurrentTab(),i=this.sharedState.canvasToolbarView||`auto`;switch(r){case`SOURCE`:this._drawSourceTab(e,t,n,i);return;case`SCAN`:this._drawScanTab(e,t,n,i);return;case`QUANTIZE`:this._drawQuantize(e,t,n);return;case`OUTPUTS`:this._drawOutputsTab(e,t,n,i);return;default:this._drawPlaceholder(e,t,`Unknown tab`);return}}_drawSourceTab(e,t,n,r){(r===`auto`||r===`grid`)&&(this.sharedState.gridData?this._drawGrid(e,t,n):this._drawPlaceholder(e,t,`Select filaments to generate grid`))}_drawScanTab(e,t,n,r){if(r===`scan`){this.sharedState.scanImageElement?this._drawScanImage(e,t,this.sharedState.scanImageElement,n):this._drawPlaceholder(e,t,`Upload Scan Image`);return}this.sharedState.scanImageElement?(this._drawScanImage(e,t,this.sharedState.scanImageElement,n),(this.sharedState.gridData||this.sharedState.referenceGridData)&&this._drawGridOverlay(e,t,n)):this._drawPlaceholder(e,t,`Upload Scan Image`)}_drawOutputsTab(e,t,n,r){if(r===`quantised`){this.sharedState.quantizedImageElement?this._drawQuantize(e,t,n):this._drawPlaceholder(e,t,`No quantised image — run QUANTIZE first`);return}if(r.startsWith(`grid`)){if(this.sharedState.gridData){let i={gridCombined:`Combined`,gridL0:`Layer 0`,gridL1:`Layer 1`,gridL2:`Layer 2`,gridL3:`Layer 3`},a=n.canvasView;n.canvasView=i[r]||`Combined`,this._drawGrid(e,t,n),n.canvasView=a}else this._drawPlaceholder(e,t,`No grid — generate in SOURCE tab`);return}if(r.startsWith(`art`)){if(this.sharedState.exportSTLData){let i={artCombined:`Combined`,artAll:`All Layers`,artL0:`Layer 0`,artL1:`Layer 1`,artL2:`Layer 2`,artL3:`Layer 3`},a=n.exportLayerView;n.exportLayerView=i[r]||`Combined`,this._drawExportLayers(e,t,n),n.exportLayerView=a}else this._drawPlaceholder(e,t,`No artwork STLs — generate them below`);return}this.sharedState.exportSTLData?this._drawExportLayers(e,t,n):this.sharedState.quantizedImageElement?this._drawQuantize(e,t,n):this.sharedState.gridData?this._drawGrid(e,t,n):this._drawPlaceholder(e,t,`Complete earlier tabs to see outputs here`)}_drawScanImage(e,t,n,r){e.drawImage(n,0,0),this.sharedState.scanImageBounds={x:0,y:0,width:n.width,height:n.height}}_drawGridOverlay(e,t,n){let r=this.sharedState.gridData||this.sharedState.referenceGridData;if(!r)return;let{rows:i,cols:a,sequences:o,colours:c}=r,l=this.sharedState.gridCornersPixel;if(!l||l.length!==4)return;let u=n.gridOptions||[],d=this.sharedState.gridOverlayOptions||{},f=d.showSampleZones??u.includes(`Show Sample Zones`),p=d.showExpected??u.includes(`Show Expected Colors`),m=d.showAnalysed??u.includes(`Show Analysed Colors`),h=(n.deadzonePercent||10)/100,g=this.sharedState.scanAnalysis;g&&m&&console.log(`🎨 Drawing ${g.length} analysed tiles`);let _=(e,t,n)=>e+(t-e)*n,v=(e,t,n)=>({x:_(e.x,t.x,n),y:_(e.y,t.y,n)}),y=(e,t)=>{let n=e/a,r=t/i;return v(v(l[0],l[1],n),v(l[3],l[2],n),r)};e.save(),e.strokeStyle=`#000000`,e.lineWidth=1,e.beginPath();for(let t=0;t<=a;t++){let n=y(t,0),r=y(t,i);e.moveTo(n.x,n.y),e.lineTo(r.x,r.y)}for(let t=0;t<=i;t++){let n=y(0,t),r=y(a,t);e.moveTo(n.x,n.y),e.lineTo(r.x,r.y)}e.stroke();let b=(n.expectedOpacity??50)/100;if(f||p||m)for(let t=0;t<i;t++)for(let n=0;n<a;n++){let r=t*a+n,i=y(n,t),l=y(n+1,t),u=y(n,t+1),d=y(n+1,t+1),_=v(i,d,h),x=v(l,u,h),S=v(d,i,h),C=v(u,l,h);if(m&&g){let t=g.find(e=>e.index===r);if(t){let{r:n,g:r,b:i}=t.rgb;e.fillStyle=`rgba(${n}, ${r}, ${i}, ${b})`,e.beginPath(),e.moveTo(_.x,_.y),e.lineTo(x.x,x.y),e.lineTo(S.x,S.y),e.lineTo(C.x,C.y),e.closePath(),e.fill()}}if(p&&o&&o[r]&&c){let t=s(o[r],c);t&&(t.r!==255||t.g!==255||t.b!==255)&&(e.fillStyle=`rgba(${t.r}, ${t.g}, ${t.b}, ${b})`,e.beginPath(),e.moveTo(i.x,i.y),e.lineTo(l.x,l.y),e.lineTo(d.x,d.y),e.lineTo(u.x,u.y),e.closePath(),e.moveTo(_.x,_.y),e.lineTo(C.x,C.y),e.lineTo(S.x,S.y),e.lineTo(x.x,x.y),e.closePath(),e.fill(`evenodd`))}f&&(e.strokeStyle=`rgba(0, 255, 255, 0.5)`,e.lineWidth=1,e.beginPath(),e.moveTo(_.x,_.y),e.lineTo(x.x,x.y),e.lineTo(S.x,S.y),e.lineTo(C.x,C.y),e.closePath(),e.stroke())}let x=[`#ff0000`,`#00ff00`,`#0000ff`,`#ffff00`];l.forEach((t,n)=>{e.fillStyle=`#ffffff`,e.fillRect(t.x-2-1,t.y-2-1,6,6),e.fillStyle=x[n],e.fillRect(t.x-2,t.y-2,4,4),e.strokeStyle=`#000000`,e.lineWidth=1,e.strokeRect(t.x-2,t.y-2,4,4)}),e.restore(),e.fillStyle=`#000000`,e.font=`10px "Atkinson Hyperlegible", monospace`,e.textAlign=`left`,e.fillText(`${i}×${a} grid`,5,12)}_flipGridHorizontal(){let e=this.sharedState.gridCornersPixel;if(!e||e.length!==4)return;let t=e.reduce((e,t)=>e+t.x,0)/4;this.sharedState.gridCornersPixel=e.map(e=>({x:t+(t-e.x),y:e.y})),console.log(`🔄 Grid flipped horizontally`)}_flipGridVertical(){let e=this.sharedState.gridCornersPixel;if(!e||e.length!==4)return;let t=e.reduce((e,t)=>e+t.y,0)/4;this.sharedState.gridCornersPixel=e.map(e=>({x:e.x,y:t+(t-e.y)})),console.log(`🔄 Grid flipped vertically`)}_rotateGrid90(){let e=this.sharedState.gridCornersPixel;if(!e||e.length!==4)return;let t=e.reduce((e,t)=>e+t.x,0)/4,n=e.reduce((e,t)=>e+t.y,0)/4;this.sharedState.gridCornersPixel=e.map(e=>{let r=e.x-t;return{x:t+(e.y-n),y:n-r}}),console.log(`🔄 Grid rotated 90° clockwise`)}_flipGridCorners(){this._flipGridHorizontal()}_findTileAtPoint(e,t,n,r,i){let[a,o,s,c]=n,l={x:o.x-a.x,y:o.y-a.y},u={x:s.x-c.x,y:s.y-c.y};c.x-a.x,c.y-a.y,s.x-o.x,s.y-o.y;let d=.5,f=.5;for(let n=0;n<10;n++){let n={x:a.x+l.x*d,y:a.y+l.y*d},r={x:c.x+u.x*d,y:c.y+u.y*d},i={x:n.x+(r.x-n.x)*f,y:n.y+(r.y-n.y)*f},o=e-i.x,s=t-i.y,p=l.x*(1-f)+u.x*f,m=l.y*(1-f)+u.y*f,h=r.x-n.x,g=r.y-n.y,_=p*g-m*h;if(Math.abs(_)<.001)break;d+=(o*g-s*h)/_,f+=(p*s-m*o)/_}if(d<0||d>1||f<0||f>1)return null;let p=Math.floor(d*i),m=Math.floor(f*r);return p<0||p>=i||m<0||m>=r?null:{row:m,col:p}}_showTileDetails(e,t,n){let r=e*n.cols+t,i=n.sequences?.[r];if(!i){this.toolBase.setValue(`scanStatus`,`Tile (${e}, ${t}) - No sequence data`);return}i.map((e,t)=>e===0?`Layer ${t}: Empty`:`Layer ${t}: ${n.colours?.[e-1]?.n||`Filament ${e}`}`).join(`\\n`);let a=this.sharedState.scanAnalysis?.find(e=>e.index===r),o=`Tile (${e}, ${t}) - Sequence: ${i.join(``)}`;if(a){let{r:e,g:t,b:n}=a.rgb;o+=` | Scanned: RGB(${e}, ${t}, ${n}) = ${a.hex}`,o+=` | Deviation: ${a.colorDeviation.toFixed(2)}`}this.toolBase.setValue(`scanStatus`,o),console.log(`📊 Tile Details [${e}, ${t}]:`),console.log(`  Sequence: ${i.join(``)}`),i.forEach((e,t)=>{let r=n.colours?.[e-1];console.log(`  Layer ${t}: ${e===0?`Empty`:r?.n||`Fil ${e}`}`)}),a&&(console.log(`  Scanned RGB: ${a.hex} (${a.rgb.r}, ${a.rgb.g}, ${a.rgb.b})`),console.log(`  Pixels sampled: ${a.pixelsSampled}`),console.log(`  Color deviation: ${a.colorDeviation.toFixed(2)}`))}_triggerFileUpload(e,t){let n=document.createElement(`input`);n.type=`file`,n.accept=e,n.onchange=e=>{let n=e.target.files?.[0];n&&t(n)},n.click()}_drawGrid(e,t,n){let r=this.sharedState.gridData;if(!r){this._drawPlaceholder(e,t,`Click Generate Grid`);return}let{sequences:i,colours:o,rows:c,cols:l,tileSize:d,gap:f,width:p,height:m,emptyCells:h,perimeterMargin:g=0}=r,_=n.canvasView||`Combined`,v=n.gapFillOptions&&n.gapFillOptions.includes(`Fill Gaps`),y=t.width-80,b=t.height-80,x=y/p,S=b/m,C=Math.min(x,S),w=p*C,T=m*C,E=(t.width-w)/2,D=(t.height-T)/2;if(e.save(),e.translate(E,D),e.scale(C,C),g>0)if(v){let t=n.gapFilament||`Jade White`,r=u.find(e=>e.n===t);e.fillStyle=r?r.h:`#FFFFFF`,e.fillRect(0,0,p,g),e.fillRect(0,m-g,p,g),e.fillRect(0,g,g,m-g*2),e.fillRect(p-g,g,g,m-g*2)}else e.strokeStyle=`#808080`,e.lineWidth=.5,e.strokeRect(0,0,p,m),e.fillStyle=`#202020`,e.fillRect(0,0,p,g),e.fillRect(0,m-g,p,g),e.fillRect(0,g,g,m-g*2),e.fillRect(p-g,g,g,m-g*2);e.translate(g,g);let O=p-g*2,k=m-g*2;if(f>0&&v){let t=n.gapFilament||`Jade White`,r=u.find(e=>e.n===t);e.fillStyle=r?r.h:`#FFFFFF`,e.fillRect(0,0,O,k)}for(let t=0;t<c;t++)for(let n=0;n<l;n++){let r=t*l+n,c=n*(d+f),u=t*(d+f);if(h&&h.includes(r)){v||(e.fillStyle=`#404040`,e.fillRect(c,u,d,d),e.strokeStyle=`#808080`,e.lineWidth=.3,e.beginPath(),e.moveTo(c,u),e.lineTo(c+d,u+d),e.moveTo(c+d,u),e.lineTo(c,u+d),e.stroke());continue}if(r>=i.length)continue;let p=i[r],m;if(_===`Combined`||_===`combined`)m=a(s(p,o));else if(_.startsWith(`Layer `)){let e=_.match(/(\d+)/);if(e){let t=p[parseInt(e[1])];m=t===0||t===void 0?`#303030`:o[t-1].h}else m=`#404040`}else m=a(s(p,o));e.fillStyle=m,e.fillRect(c,u,d,d)}e.restore(),e.save(),e.font=`12px "Atkinson Hyperlegible", monospace`,e.textAlign=`center`;let A=t.height-15,j=t.width/2;e.fillStyle=r.fitsConstraints===!1?`#ff0000`:`#00ff00`;let M=`Sequences: ${i.length} | Grid: ${c}×${l} | Size: ${p.toFixed(1)}×${m.toFixed(1)}mm`;e.fillText(M,j,A),r.fitsConstraints===!1&&(e.fillStyle=`#ffff00`,e.fillText(`⚠ OVERSIZED - Reduce layers/colors/tilesize`,j,A-20)),e.restore(),this.sharedState.gridConstraints&&this._drawConstraintBounds(e,t,r,this.sharedState.gridConstraints)}_drawConstraintBounds(e,t,n,r){let{width:i,height:a}=n,{bedWidth:o,bedHeight:s,scanWidth:c,scanHeight:l}=r,u=t.width-80,d=t.height-80,f=u/i,p=d/a,m=Math.min(f,p),h=i*m,g=a*m,_=(t.width-h)/2,v=(t.height-g)/2;e.save();let y=o*m,b=s*m;e.strokeStyle=`#ff00ff`,e.lineWidth=2,e.setLineDash([10,5]),e.strokeRect(_,v,y,b),e.fillStyle=`#ff00ff`,e.font=`bold 10px "Atkinson Hyperlegible", monospace`,e.textAlign=`left`,e.fillText(`BED: ${o.toFixed(0)}×${s.toFixed(0)}mm`,_+5,v+15);let x=c*m,S=l*m;e.strokeStyle=`#00ffff`,e.lineWidth=2,e.setLineDash([5,5]),e.strokeRect(_,v,x,S),e.fillStyle=`#00ffff`,e.fillText(`SCAN: ${c.toFixed(0)}×${l.toFixed(0)}mm`,_+5,v+30),e.restore()}_drawScan(e,n,r){this.sharedState.scanImageElement?(e.drawImage(this.sharedState.scanImageElement,0,0,n.width,n.height),this.sharedState.referenceGridData&&this.sharedState.gridCalculated&&t(async()=>{let{drawScanOverlay:e}=await import(`./MFP-ScanRenderer-C5Z4W5mx.js`);return{drawScanOverlay:e}},[]).then(({drawScanOverlay:t})=>{t(e,n,this.sharedState)})):this._drawPlaceholder(e,n,`Upload Scan Image`)}_drawQuantize(e,t,n){let r=this.sharedState.canvasToolbarView||`auto`;if(r===`source`){this.sharedState.sourceImageElement?this._drawImageFit(e,t,this.sharedState.sourceImageElement):this._drawPlaceholder(e,t,`Load Source Image`);return}if(r===`adjusted`){this.sharedState.sourceImageData?this._drawImageDataFit(e,t,this.sharedState.sourceImageData):this.sharedState.sourceImageElement?this._drawImageFit(e,t,this.sharedState.sourceImageElement):this._drawPlaceholder(e,t,`Load Source Image`);return}if(r===`quantised`){this.sharedState.quantizedImageElement?this._drawImageFit(e,t,this.sharedState.quantizedImageElement,!0):this._drawPlaceholder(e,t,`Run Quantize first`);return}if(r===`analysis`){this._drawAnalysisComposite(e,t,n);return}if(r.startsWith(`art`)){if(this.sharedState.exportSTLData){let i={artCombined:`Combined`,artAll:`All Layers`,artL0:`Layer 0`,artL1:`Layer 1`,artL2:`Layer 2`,artL3:`Layer 3`},a=n.exportLayerView;n.exportLayerView=i[r]||`Combined`,this._drawExportLayers(e,t,n),n.exportLayerView=a}else this._drawPlaceholder(e,t,`Generate Artwork STLs first`);return}this.sharedState.quantizedImageElement?this._drawImageFit(e,t,this.sharedState.quantizedImageElement,!0):this.sharedState.sourceImageData?this._drawImageDataFit(e,t,this.sharedState.sourceImageData):this.sharedState.sourceImageElement?this._drawImageFit(e,t,this.sharedState.sourceImageElement):this._drawPlaceholder(e,t,`Load Source Image`)}_drawImageFit(e,t,n,r=!1){let i=n.naturalWidth||n.width,a=n.naturalHeight||n.height,o=Math.min(t.width/i,t.height/a),s=i*o,c=a*o,l=Math.round((t.width-s)/2),u=Math.round((t.height-c)/2);e.imageSmoothingEnabled=!r,e.drawImage(n,l,u,Math.round(s),Math.round(c))}_drawImageDataFit(e,t,n){if(!this._imgDataCache||this._imgDataCache.data!==n.data||this._imgDataCache.w!==n.width||this._imgDataCache.h!==n.height){let e=document.createElement(`canvas`);e.width=n.width,e.height=n.height,e.getContext(`2d`).putImageData(n,0,0),this._imgDataCache={canvas:e,data:n.data,w:n.width,h:n.height}}let r=Math.min(t.width/n.width,t.height/n.height),i=n.width*r,a=n.height*r,o=Math.round((t.width-i)/2),s=Math.round((t.height-a)/2);e.drawImage(this._imgDataCache.canvas,o,s,Math.round(i),Math.round(a))}_drawAnalysisComposite(e,t,n){let r=this.sharedState.quantizedSequenceMap;if(!r){this._drawPlaceholder(e,t,`Run Quantize first`);return}if(!this._analysisCache||this._analysisCache.qsm!==r){let{layerData:e,maxLayers:t,filamentCount:i,filamentColours:a}=this.quantizeActions._computeLayerMapsInt(r),o=this.quantizeActions._analyseLayerQuality(e,t,r.width,r.height);this._analysisCache={qsm:r,canvas:this.quantizeActions._renderAnalysisCanvas({qsm:r,layerData:e,maxLayers:t,filamentCount:i,filamentColours:a,analysis:o,values:n,sourceImg:this.sharedState.sourceImageElement,quantisedImg:this.sharedState.quantizedImageElement,filaments:this.sharedState.quantizationConfig?.filaments||[]})}}let i=this._analysisCache.canvas,a=Math.min(t.width/i.width,t.height/i.height),o=i.width*a,s=i.height*a,c=Math.round((t.width-o)/2),l=Math.round((t.height-s)/2);e.drawImage(i,c,l,Math.round(o),Math.round(s))}_getLayerCanvas(e,t){this._layerCanvasCache||(this._layerCanvasCache={});let n=`${t}`;if(this._layerCanvasCache[n]&&this._layerCanvasSrc===e)return this._layerCanvasCache[n];let{layerMaps:r,filamentNames:i,config:a}=e,{imageWidth:o,imageHeight:s}=a,c=i.length,l=r[t];if(!l)return null;let u=this._getFilamentRGB(e),d=document.createElement(`canvas`);d.width=o,d.height=s;let f=d.getContext(`2d`),p=f.createImageData(o,s);for(let e=0;e<o*s;e++){let t=e*4;p.data[t]=14,p.data[t+1]=14,p.data[t+2]=14,p.data[t+3]=255}for(let e=0;e<c;e++){if(!l[e]||l[e].size===0)continue;let t=u[e];for(let n of l[e]){let[e,r]=n.split(`,`).map(Number),i=(r*o+e)*4;p.data[i]=t.r,p.data[i+1]=t.g,p.data[i+2]=t.b,p.data[i+3]=255}}return f.putImageData(p,0,0),this._layerCanvasSrc=e,this._layerCanvasCache[n]=d,d}_getFilamentRGB(e){if(this._filRGBSrc===e)return this._filRGB;let{filamentNames:t,palette:n}=e,r=this.sharedState.quantizationConfig?.filaments||[];return this._filRGB=Array.from({length:t.length},(e,t)=>{let i=r[t];return i?.hex||i?.h?i.hex||i.h:n.find(e=>e.sequence?.some(e=>e>0&&e-1===t))?.hex||`#808080`}).map(e=>{let t=e.replace(`#`,``);return{r:parseInt(t.substring(0,2),16),g:parseInt(t.substring(2,4),16),b:parseInt(t.substring(4,6),16)}}),this._filRGBSrc=e,this._filRGB}_drawExportLayers(e,t,n){let r=this.sharedState.exportSTLData;if(!r)return;let{layerMaps:i,filamentNames:a,config:o}=r,{imageWidth:s,imageHeight:c,printWidth:l}=o,u=n.exportLayerView||`Combined`,d=i.length,f=n=>{e.save(),e.fillStyle=`#00ff00`,e.font=`11px "Space Mono", monospace`,e.textAlign=`center`,e.fillText(`${d} layers | ${Object.keys(r.stls).length} STLs | ${s}×${c}px → ${l}mm${n?` | `+n:``}`,t.width/2,t.height-6),e.restore()},p=(n,r)=>{let i=(t.width-40)/n.width,a=(t.height-40-20)/n.height,o=Math.min(i,a),s=Math.round(n.width*o),c=Math.round(n.height*o),l=Math.round((t.width-s)/2),u=Math.round((t.height-20-c)/2);e.save(),e.imageSmoothingEnabled=!1,e.drawImage(n,l,u,s,c),e.restore(),f(r)};if(u===`Combined`){let n=this.sharedState.quantizedImageElement;n?p(n,`Combined`):this._drawPlaceholder(e,t,`Quantised image not available — regenerate STLs`)}else if(u===`All Layers`){if(!this._allLayersCache||this._allLayersSrc!==r){this._allLayersSrc=r,this._getFilamentRGB(r),a.length;let e=Math.ceil(Math.sqrt(d)),t=Math.ceil(d/e),n=s+4,i=c+14+4,o=e*n+4,l=t*i+4,u=document.createElement(`canvas`);u.width=o,u.height=l;let f=u.getContext(`2d`);f.imageSmoothingEnabled=!1,f.fillStyle=`#0e0e0e`,f.fillRect(0,0,o,l);for(let t=0;t<d;t++){let a=this._getLayerCanvas(r,t);if(!a)continue;let o=t%e,c=Math.floor(t/e),l=4+o*n,u=4+c*i+14;f.drawImage(a,l,u),f.fillStyle=`#00ff00`,f.font=`10px "Space Mono", monospace`,f.textAlign=`center`,f.fillText(`L${t}`,l+s/2,u-3)}this._allLayersCache=u}p(this._allLayersCache,`All Layers`)}else{let n=u.match(/(\d+)/),o=n?parseInt(n[1]):0,s=this._getLayerCanvas(r,o);if(!s){this._drawPlaceholder(e,t,`Layer ${o} does not exist (${d} available)`),f(``);return}p(s,`Layer ${o}: ${a.filter((e,t)=>i[o][t]?.size>0).join(`, `)}`)}}_drawExport(e,n,r){let i=r.canvasMode||`Grid`;i===`Grid`&&this.sharedState.gridData?t(async()=>{let{drawCalibrationGrid:e}=await import(`./MFP-GridRenderer-Co5GUAQc.js`);return{drawCalibrationGrid:e}},__vite__mapDeps([0,1])).then(({drawCalibrationGrid:t})=>{t(e,n,this.sharedState.gridData,this.sharedState.sequenceMap,r)}):i===`Scan`&&this.sharedState.scanImageElement?e.drawImage(this.sharedState.scanImageElement,0,0,n.width,n.height):this._drawPlaceholder(e,n,`${i} View`)}_drawPlaceholder(e,t,n){e.fillStyle=`#808080`,e.font=`16px "Atkinson Hyperlegible", monospace`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(n,t.width/2,t.height/2)}destroy(){this.markdownComponent&&this.markdownComponent.destroy&&this.markdownComponent.destroy(),this.docsContainer&&this.docsContainer.parentNode&&this.docsContainer.parentNode.removeChild(this.docsContainer),this.infoButton&&this.infoButton.parentNode&&this.infoButton.parentNode.removeChild(this.infoButton),this.toolBase&&this.toolBase.destroy()}};typeof window<`u`&&(window.MultifilamentPrintTool=b),console.log(`✅ MultifilamentPrintTool loaded (FULL VERSION with ALL controls)`);export{b as MultifilamentPrintTool};