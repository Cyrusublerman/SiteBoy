(function(){let e={preview:{previewScale:.35},draft:{previewScale:.65},final:{previewScale:1}};var t=class{constructor(){this.sourceImage=null,this.sourcePixels=null,this.sourceW=0,this.sourceH=0,this.outputWidth=1024,this.outputHeight=1024,this.previewScale=e.preview.previewScale,this.quality=`preview`,this.globalSeed=42,this.stack=[],this.soloNodeId=null,this.selectedNodeIdx=-1,this.zoom=`fit`,this.zoomLevel=1,this.panX=0,this.panY=0,this.lastRenderTime=0,this.needsRender=!0,this.rendering=!1,this.modulationMaps={},this.frames=[],this.frameCount=1,this.currentFrame=0,this.fps=24,this.isPlaying=!1,this.renderProgress=0,this._bridge=null}setBridge(e){this._bridge=e}scheduleRender(e=80){this.needsRender=!0,this._bridge&&this._bridge.scheduleRender(e)}setQuality(t){let n=e[t];n&&(this.quality=t,this.previewScale=n.previewScale,this.invalidateAllCaches())}get frame(){return this.currentFrame}get time(){return this.frameCount>1?this.currentFrame/this.frameCount:0}setSource(e,t,n){this.sourcePixels=e,this.sourceW=t,this.sourceH=n,this.outputWidth=t,this.outputHeight=n,this.frames=[e],this.frameCount=1,this.currentFrame=0,this._previewCache=null}getPreviewPixels(){let e=this.previewScale,t=Math.max(1,Math.round(this.sourceW*e)),n=Math.max(1,Math.round(this.sourceH*e)),r=t*n*4;if(this._previewCache&&this._previewCache.length===r)return{pixels:this._previewCache,w:t,h:n};let i=this.sourcePixels,a=new Uint8ClampedArray(r),o=this.sourceW/t,s=this.sourceH/n;for(let e=0;e<n;e++){let n=Math.min(this.sourceH-1,Math.round(e*s))*this.sourceW,r=e*t;for(let e=0;e<t;e++){let t=(n+Math.min(this.sourceW-1,Math.round(e*o)))*4,s=(r+e)*4;a[s]=i[t],a[s+1]=i[t+1],a[s+2]=i[t+2],a[s+3]=i[t+3]}}return this._previewCache=a,{pixels:a,w:t,h:n}}setStack(e){this.stack=Array.isArray(e)?e:[],this.invalidateAllCaches(),this.needsRender=!0}setFrames(e,t,n){this.frames=e,this.frameCount=e.length,this.currentFrame=0,this.sourceW=t,this.sourceH=n,this.sourcePixels=e[0]}seekFrame(e){this.currentFrame=Math.max(0,Math.min(this.frameCount-1,e)),this.frames[this.currentFrame]&&(this.sourcePixels=this.frames[this.currentFrame],this.invalidateAllCaches(),this.needsRender=!0)}addModulationMap(e,t,n,r){this.modulationMaps[e]={sourcePixels:t,sourceW:n,sourceH:r,name:e}}removeModulationMap(e){delete this.modulationMaps[e]}getModMapNames(){return Object.keys(this.modulationMaps)}invalidateAllCaches(){for(let e of this.stack)e._cacheValid=!1}invalidateCachesFrom(e){for(let t=e;t<this.stack.length;t++)this.stack[t]._cacheValid=!1}},n=class{constructor(e){this.seed=e>>>0}next(){return this.seed=this.seed*1664525+1013904223>>>0,this.seed/4294967296}nextRange(e,t){return e+this.next()*(t-e)}nextInt(e,t){return Math.floor(this.nextRange(e,t))}};function r(e,t,n=0){let r=e^t*2654435761^n*2246822519;return r=Math.imul(r^r>>>16,2246822507),r=Math.imul(r^r>>>13,3266489909),(r^r>>>16)>>>0}let i=new class{constructor(){this._pool=new Map}acquire(e){let t=this._pool.get(e);if(t&&t.length>0){let e=t.pop();return e.fill(0),e}return new Uint8ClampedArray(e)}release(e){if(!e||!e.length)return;let t=e.length,n=this._pool.get(t);n||(n=[],this._pool.set(t,n)),n.length<8&&n.push(e)}clear(){this._pool.clear()}};function a(e){return e<0?0:e>255?255:e}function o(e,t,n,r,i,o,s,c){if(r<0||i<0||r>=t||i>=n)return;let l=(i*t+r)*4,u=c?c[i*t+r]/255:1,d=Math.max(0,Math.min(1,o[3]/255*s*u)),f=1-d;e[l]=a(e[l]*f+o[0]*d),e[l+1]=a(e[l+1]*f+o[1]*d),e[l+2]=a(e[l+2]*f+o[2]*d),e[l+3]=a(255*d+e[l+3]*f)}function s(e,t,n,r,i,a,s,c,l=1){let u=Math.round(r),d=Math.round(i),f=Math.max(1,Math.round(l||1));if(f<=1){o(e,t,n,u,d,a,s,c);return}let p=Math.floor(f/2);for(let r=-p;r<=p;r++)for(let i=-p;i<=p;i++)i*i+r*r<=p*p+.01&&o(e,t,n,u+i,d+r,a,s,c)}function c(e,t,n,r,i,a,o,c,l=1){let u=Math.round(r.x),d=Math.round(r.y),f=Math.round(i.x),p=Math.round(i.y),m=Math.abs(f-u),h=-Math.abs(p-d),g=u<f?1:-1,_=d<p?1:-1,v=m+h;for(;s(e,t,n,u,d,a,o,c,l),!(u===f&&d===p);){let e=2*v;e>=h&&(v+=h,u+=g),e<=m&&(v+=m,d+=_)}}function l({basePixels:e,width:t,height:n,lines:r,strokeRGBA:i=[0,0,0,255],strokeWidth:a=1,opacity:o=1,mask:l=null,clearRGBA:u=null}){let d=u?new Uint8ClampedArray(t*n*4):new Uint8ClampedArray(e);if(u)for(let e=0;e<d.length;e+=4)d[e]=u[0],d[e+1]=u[1],d[e+2]=u[2],d[e+3]=u[3]??255;for(let e of r||[])if(e?.length){s(d,t,n,e[0].x,e[0].y,i,o,l,a);for(let r=1;r<e.length;r++)c(d,t,n,e[r-1],e[r],i,o,l,a)}return d}let u=new Set([`x`,`y`,`nx`,`ny`,`lum`,`r`,`g`,`b`,`a`]),d=new Set([`seed`,`frame`,`frameCount`,`time`]);function f(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=e-r,o=t-i,s=a*a*(3-2*a),c=o*o*(3-2*o);function l(e,t){let r=(n^e*374761393^t*668265263)>>>0;return r^=r>>>13,r=Math.imul(r,1540483477)>>>0,r^=r>>>15,(r>>>0)/4294967295}return(l(r,i)*(1-s)+l(r+1,i)*s)*(1-c)+(l(r,i+1)*(1-s)+l(r+1,i+1)*s)*c}let p={fract:e=>e-Math.floor(e),clamp:(e,t,n)=>e<t?t:e>n?n:e,lerp:(e,t,n)=>e+(t-e)*n,map:(e,t,n,r,i)=>r+(i-r)*(e-t)/(n-t||1),smoothstep:(e,t,n)=>{let r=Math.max(0,Math.min(1,(n-e)/(t-e||1)));return r*r*(3-2*r)},tri:e=>Math.abs(2*(e-Math.floor(e))-1),saw:e=>e-Math.floor(e),pulse:(e,t)=>+(e-Math.floor(e)<t),noise:(e,t,n=42)=>f(e,t,n)},m=`seed.frame.frameCount.time.PI.E.TAU.sin.cos.tan.abs.floor.ceil.round.min.max.pow.sqrt.log.exp.fract.clamp.lerp.map.smoothstep.tri.saw.pulse.noise`.split(`.`),h=[`x`,`y`,`nx`,`ny`,`lum`,`r`,`g`,`b`,`a`,...m];var g=class e{static isExpression(e){return typeof e==`string`&&e.startsWith(`=`)}static classify(e){if(typeof e!=`string`)return`constant`;for(let t of u)if(RegExp(`\\b${t}\\b`).test(e))return`pixel`;for(let t of d)if(RegExp(`\\b${t}\\b`).test(e))return`frame`;return`constant`}static evaluate(t,n={}){return e._run(t,m,[n.seed??0,n.frame??0,n.frameCount??1,n.time??0,Math.PI,Math.E,Math.PI*2,Math.sin,Math.cos,Math.tan,Math.abs,Math.floor,Math.ceil,Math.round,Math.min,Math.max,Math.pow,Math.sqrt,Math.log,Math.exp,p.fract,p.clamp,p.lerp,p.map,p.smoothstep,p.tri,p.saw,p.pulse,p.noise])}static evaluatePixel(t,n={}){return e._run(t,h,[n.x??0,n.y??0,n.nx??0,n.ny??0,n.lum??0,n.r??0,n.g??0,n.b??0,n.a??1,n.seed??0,n.frame??0,n.frameCount??1,n.time??0,Math.PI,Math.E,Math.PI*2,Math.sin,Math.cos,Math.tan,Math.abs,Math.floor,Math.ceil,Math.round,Math.min,Math.max,Math.pow,Math.sqrt,Math.log,Math.exp,p.fract,p.clamp,p.lerp,p.map,p.smoothstep,p.tri,p.saw,p.pulse,p.noise])}static compilePixel(e){let t;try{t=Function(...h,`"use strict"; return (${e});`)}catch{return()=>null}return e=>{try{let n=t(e.x??0,e.y??0,e.nx??0,e.ny??0,e.lum??0,e.r??0,e.g??0,e.b??0,e.a??1,e.seed??0,e.frame??0,e.frameCount??1,e.time??0,Math.PI,Math.E,Math.PI*2,Math.sin,Math.cos,Math.tan,Math.abs,Math.floor,Math.ceil,Math.round,Math.min,Math.max,Math.pow,Math.sqrt,Math.log,Math.exp,p.fract,p.clamp,p.lerp,p.map,p.smoothstep,p.tri,p.saw,p.pulse,p.noise);return typeof n==`number`&&isFinite(n)?n:null}catch{return null}}}static _run(e,t,n){try{let r=Function(...t,`"use strict"; return (${e});`)(...n);return typeof r==`number`&&isFinite(r)?r:null}catch{return null}}};let _=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);function v(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=t*16777619>>>0;return t.toString(16)}var y=class e{static async detect(){if(e._cached)return e._cached;if(typeof navigator<`u`&&navigator.gpu)try{let t=await navigator.gpu.requestAdapter({powerPreference:`high-performance`});if(t){let n=await t.requestDevice(),r=null;try{r=await t.requestAdapterInfo?.()}catch{}n.lost.then(t=>{console.warn(`[GPUFoundation] WebGPU device lost:`,t.reason,t.message),e._cached=null});let i={tier:`webgpu`,adapter:t,device:n,adapterInfo:r,gl:null};return e._cached=i,i}}catch(e){console.warn(`[GPUFoundation] WebGPU probe failed:`,e.message)}try{let t=document.createElement(`canvas`);t.width=1,t.height=1;let n=t.getContext(`webgl2`,{antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1});if(n){let t={tier:`webgl2`,adapter:null,device:null,adapterInfo:null,gl:n};return e._cached=t,t}}catch(e){console.warn(`[GPUFoundation] WebGL2 probe failed:`,e.message)}let t={tier:`cpu`,adapter:null,device:null,adapterInfo:null,gl:null};return e._cached=t,t}static reset(){e._cached=null}};y._cached=null;var b=class{constructor(){this._cache=new Map}getComputePipeline(e,t,n){let r=`wgpu:compute:`+v(t);if(this._cache.has(r))return this._cache.get(r);let i=e.createShaderModule({code:t}),a={layout:n?e.createPipelineLayout({bindGroupLayouts:[n]}):`auto`,compute:{module:i,entryPoint:`main`}},o=e.createComputePipeline(a);return this._cache.set(r,o),o}getFragmentProgram(e,t){let n=`webgl2:frag:`+v(t);if(this._cache.has(n))return this._cache.get(n);let r=S(e,`#version 300 es
in vec2 aPos;
out vec2 vUV;
void main() {
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,t);return r?(this._cache.set(n,r),r):null}evict(e){let t=e===`webgpu`?`wgpu:`:`webgl2:`;for(let e of this._cache.keys())e.startsWith(t)&&this._cache.delete(e)}destroy(){this._cache.clear()}};function x(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(`[GPUFoundation] Shader compile error:`,e.getShaderInfoLog(r)),e.deleteShader(r),null)}function S(e,t,n){let r=x(e,e.VERTEX_SHADER,t),i=x(e,e.FRAGMENT_SHADER,n);if(!r||!i)return null;let a=e.createProgram();return e.attachShader(a,r),e.attachShader(a,i),e.linkProgram(a),e.deleteShader(r),e.deleteShader(i),e.getProgramParameter(a,e.LINK_STATUS)?a:(console.error(`[GPUFoundation] Program link error:`,e.getProgramInfoLog(a)),e.deleteProgram(a),null)}var C=class{constructor(e,t,n,r){if(this._tier=e,this._handle=t,this._width=n,this._height=r,this._destroyed=!1,e===`webgpu`)this._texA=this._createWebGPUTexture(t,n,r),this._texB=this._createWebGPUTexture(t,n,r);else{let e=t;this._texA=this._createWebGLTexture(e,n,r),this._fboA=this._createWebGLFBO(e,this._texA),this._texB=this._createWebGLTexture(e,n,r),this._fboB=this._createWebGLFBO(e,this._texB)}this._front=0,this._back=1}get readTex(){return this._front===0?this._texA:this._texB}get writeTex(){return this._back===0?this._texA:this._texB}get writeFBO(){return this._tier===`webgl2`?this._back===0?this._fboA:this._fboB:null}get readFBO(){return this._tier===`webgl2`?this._front===0?this._fboA:this._fboB:null}swap(){[this._front,this._back]=[this._back,this._front]}resize(e,t){if(e===this._width&&t===this._height)return;this.destroy(),this._destroyed=!1,this._width=e,this._height=t,this._front=0,this._back=1;let n=this._handle;this._tier===`webgpu`?(this._texA=this._createWebGPUTexture(n,e,t),this._texB=this._createWebGPUTexture(n,e,t)):(this._texA=this._createWebGLTexture(n,e,t),this._fboA=this._createWebGLFBO(n,this._texA),this._texB=this._createWebGLTexture(n,e,t),this._fboB=this._createWebGLFBO(n,this._texB))}destroy(){if(!this._destroyed){if(this._destroyed=!0,this._tier===`webgpu`)this._texA?.destroy(),this._texB?.destroy();else{let e=this._handle;this._fboA&&e.deleteFramebuffer(this._fboA),this._fboB&&e.deleteFramebuffer(this._fboB),this._texA&&e.deleteTexture(this._texA),this._texB&&e.deleteTexture(this._texB)}this._texA=this._texB=this._fboA=this._fboB=null}}_createWebGPUTexture(e,t,n){return e.createTexture({size:[t,n,1],format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.COPY_SRC|GPUTextureUsage.COPY_DST})}_createWebGLTexture(e,t,n){let r=e.createTexture();return e.bindTexture(e.TEXTURE_2D,r),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,null),r}_createWebGLFBO(e,t){let n=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,n),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0),e.bindFramebuffer(e.FRAMEBUFFER,null),n}},w=class{constructor(e,t){if(this.tier=e.tier,this._device=e.device,this._gl=e.gl,this._compiler=t,this._destroyed=!1,this.tier===`webgl2`){let e=this._gl;this._quadVAO=e.createVertexArray(),this._quadVBO=e.createBuffer(),e.bindVertexArray(this._quadVAO),e.bindBuffer(e.ARRAY_BUFFER,this._quadVBO),e.bufferData(e.ARRAY_BUFFER,_,e.STATIC_DRAW),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.enableVertexAttribArray(0),e.bindVertexArray(null),this._pbo=e.createBuffer()}}uploadPixels(e,t,n,r){if(!this._destroyed)if(e.resize(n,r),this.tier===`webgpu`)this._device.queue.writeTexture({texture:e.writeTex},t,{bytesPerRow:n*4,rowsPerImage:r},[n,r,1]);else{let i=this._gl;i.bindTexture(i.TEXTURE_2D,e.writeTex),i.texSubImage2D(i.TEXTURE_2D,0,0,0,n,r,i.RGBA,i.UNSIGNED_BYTE,t),i.bindTexture(i.TEXTURE_2D,null)}}async readbackPixels(e,t,n){return this._destroyed?new Uint8ClampedArray(t*n*4):this.tier===`webgpu`?this._readbackWebGPU(e.readTex,t,n):this._readbackWebGL2(e.readFBO,t,n)}async _readbackWebGPU(e,t,n){let r=this._device,i=Math.ceil(t*4/256)*256,a=i*n,o=r.createBuffer({size:a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),s=r.createCommandEncoder();s.copyTextureToBuffer({texture:e},{buffer:o,bytesPerRow:i,rowsPerImage:n},[t,n,1]),r.queue.submit([s.finish()]),await o.mapAsync(GPUMapMode.READ);let c=new Uint8Array(o.getMappedRange()),l=new Uint8ClampedArray(t*n*4),u=t*4;for(let e=0;e<n;e++)l.set(c.subarray(e*i,e*i+u),e*u);return o.unmap(),o.destroy(),l}_readbackWebGL2(e,t,n){let r=this._gl,i=new Uint8ClampedArray(t*n*4);return r.bindFramebuffer(r.FRAMEBUFFER,e),r.readPixels(0,0,t,n,r.RGBA,r.UNSIGNED_BYTE,i),r.bindFramebuffer(r.FRAMEBUFFER,null),T(i,t,n),Promise.resolve(i)}dispatchCompute(e,t,n,r,i={},a){if(this._destroyed||this.tier!==`webgpu`)return;let o=this._device,s=this._compiler.getComputePipeline(o,e,a),c=E(o,i),l=o.createBindGroup({layout:s.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:t.readTex.createView()},{binding:2,resource:t.writeTex.createView()}]}),u=o.createCommandEncoder(),d=u.beginComputePass();d.setPipeline(s),d.setBindGroup(0,l),d.dispatchWorkgroups(Math.ceil(n/16),Math.ceil(r/16)),d.end(),o.queue.submit([u.finish()]),c.destroy(),t.swap()}drawFragment(e,t,n,r,i={}){if(this._destroyed||this.tier!==`webgl2`)return;let a=this._gl,o=this._compiler.getFragmentProgram(a,e);if(!o)return;a.bindFramebuffer(a.FRAMEBUFFER,t.writeFBO),a.viewport(0,0,n,r),a.useProgram(o),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,t.readTex);let s=a.getUniformLocation(o,`uTex`);s!==null&&a.uniform1i(s,0),D(a,o,i),a.bindVertexArray(this._quadVAO),a.drawArrays(a.TRIANGLES,0,6),a.bindVertexArray(null),a.bindFramebuffer(a.FRAMEBUFFER,null),t.swap()}createBufferRing(e,t){return this.tier===`webgpu`?new C(`webgpu`,this._device,e,t):new C(`webgl2`,this._gl,e,t)}destroy(){if(!this._destroyed){if(this._destroyed=!0,this.tier===`webgl2`){let e=this._gl;this._quadVAO&&e.deleteVertexArray(this._quadVAO),this._quadVBO&&e.deleteBuffer(this._quadVBO),this._pbo&&e.deleteBuffer(this._pbo)}this._compiler.evict(this.tier),this._device=null,this._gl=null,this._compiler=null}}};function T(e,t,n){let r=t*4,i=new Uint8Array(r);for(let t=0;t<Math.floor(n/2);t++){let a=t*r,o=(n-1-t)*r;i.set(e.subarray(a,a+r)),e.set(e.subarray(o,o+r),a),e.set(i,o)}}function E(e,t){let n=Object.keys(t).map(e=>{let n=t[e];return typeof n==`number`?n:0});for(;n.length%4!=0;)n.push(0);let r=new Float32Array(n),i=e.createBuffer({size:Math.max(16,r.byteLength),usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return new Float32Array(i.getMappedRange()).set(r),i.unmap(),i}function D(e,t,n){for(let[r,i]of Object.entries(n)){let n=e.getUniformLocation(t,r);if(n!==null){if(typeof i==`number`)Number.isInteger(i)?e.uniform1i(n,i):e.uniform1f(n,i);else if(Array.isArray(i))switch(i.length){case 2:e.uniform2fv(n,i);break;case 3:e.uniform3fv(n,i);break;case 4:e.uniform4fv(n,i);break}}}}typeof window<`u`&&(window.GPUFoundation={GPU_MIN_PIXELS:65536,detect:()=>y.detect(),resetDetect:()=>y.reset(),createContext(e){if(e.tier===`cpu`)throw Error(`[GPUFoundation] Cannot create GPUContext for CPU tier — check tier before calling createContext()`);return new w(e,new b)},FeatureDetector:y,ShaderCompiler:b,BufferRing:C,GPUContext:w});let O=2e3,k=new Float32Array(256),A=new Uint8Array(65536);for(let e=0;e<256;e++){let t=e/255;k[e]=t<=.04045?t/12.92:((t+.055)/1.055)**2.4}for(let e=0;e<65536;e++){let t=e/65535,n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;A[e]=Math.round(Math.max(0,Math.min(255,n*255)))}function j(e){return k[Math.max(0,Math.min(255,e|0))]}function M(e){return A[Math.round(Math.max(0,Math.min(1,e))*65535)]}function N(e,t,n,r,i){let a=r*i,o=1-a,s=j(e),c=j(t),l;switch(n){case`screen`:l=1-(1-s)*(1-c);break;case`multiply`:l=s*c;break;case`overlay`:l=s<.5?2*s*c:1-2*(1-s)*(1-c);break;case`add`:l=Math.min(1,s+c);break;case`difference`:l=Math.abs(s-c);break;case`lighten`:l=Math.max(s,c);break;case`darken`:l=Math.min(s,c);break;case`softlight`:l=s<.5?s-(1-2*c)*s*(1-s):s+(2*c-1)*((s>.25?Math.sqrt(s):((16*s-12)*s+4)*s)-s);break;case`hardlight`:l=c<.5?2*s*c:1-2*(1-s)*(1-c);break;case`colordodge`:l=c>=1?1:Math.min(1,s/(1-c));break;case`colorburn`:l=c<=0?0:Math.max(0,1-(1-s)/c);break;default:l=c}return M(s*o+l*a)}var P=class{constructor(e,t=null){this.s=e,this._nodeTimings=new Map,this._gpuPath=t??null}get timings(){return this._nodeTimings}render(){let e=this.s;if(!e.sourcePixels||e.rendering)return null;e.rendering=!0;let t=e.quality===`preview`,n=!!e._preScaled,a=t&&!n?e.previewScale:1,o=Math.max(1,n?e.sourceW:Math.round(e.sourceW*a)),s=Math.max(1,n?e.sourceH:Math.round(e.sourceH*a)),c=o*s*4,l;t&&a<1&&!n?(l=i.acquire(c),this._downsample(e.sourcePixels,e.sourceW,e.sourceH,o,s,l)):(l=i.acquire(e.sourcePixels.length),l.set(e.sourcePixels));let u;if(e.soloNodeId!==null){u=[];for(let t of e.stack)if(t.enabled&&u.push(t),t.id===e.soloNodeId)break}else u=e.stack.filter(e=>e.enabled);if(u.length===0)return e.lastRenderTime=0,e.rendering=!1,e.needsRender=!1,{pixels:l,width:o,height:s,_pooled:!1};let d=this._buildModMaps(o,s),f=this._buildPixelVars(l,o,s,u),p=u.length;for(let e=0;e<u.length;e++)if(!u[e]._cacheValid||!u[e]._cache||u[e]._cache.length!==c){p=e;break}let m=u.filter(e=>e._cacheValid&&e._cache);if(m.length>12){let e=m.length-12;for(let t=0;t<e;t++)m[t]._cache=null,m[t]._cacheValid=!1;p=Math.min(p,u.findIndex(t=>t===m[e]))}let h;p>0&&p<=u.length?(h=i.acquire(c),h.set(u[p-1]._cache),i.release(l)):(h=l,p=0);let g=i.acquire(c),_=performance.now(),v=e.frame??0,y=e.frameCount??1,b=y>1?v/y:0,x={width:o,height:s,quality:e.quality,globalSeed:e.globalSeed,previewScale:a,pixelVars:f,frame:v,frameCount:y,time:b},S=u.slice(p),C=this._gpuPath?this._gpuPath.partitionNodes(S):[{gpu:!1,nodes:S}],w=p;for(let t of C)if(t.gpu&&this._gpuPath){let n=performance.now();this._pendingGPU=this._gpuPath.execute(h,t.nodes,o,s,x).then(e=>{h.set(e);for(let e of t.nodes)(!e._cache||e._cache.length!==c)&&(e._cache=new Uint8ClampedArray(c)),e._cache.set(h),e._cacheValid=!0}).catch(e=>{console.warn(`[DISTORT] GPU run failed, node(s) will be re-run on CPU next frame:`,e.message);for(let e of t.nodes)e._cacheValid=!1});let r=performance.now()-n;for(let e of t.nodes)e._lastMs=r/t.nodes.length,this._nodeTimings.set(e.id,e._lastMs);w+=t.nodes.length,e.renderProgress=w/u.length}else{for(let n=0;n<t.nodes.length;n++){let a=w+n,l=t.nodes[n],f=l.mask?.enabled&&l.mask.source!==`none`,p=Object.keys(l.modulation??{}).length>0,m=l.blendMode??`normal`,_={...x,nodeSeed:r(e.globalSeed,a,l.id),nodeIndex:a,modMaps:p?d:null};f&&l.buildMask(h,o,s);let v=performance.now(),y=l.opacity<1||f||m!==`normal`,b=this._applyNodeModulation(l,_,o,s);if(y){let e=i.acquire(c);this._runNode(l,h,e,o,s,_,f);let t=f?l.mask.data:null;for(let n=0;n<c;n+=4){let r=t?t[n>>2]/255:1,i=l.opacity*r;g[n]=N(h[n],e[n],m,l.opacity,r),g[n+1]=N(h[n+1],e[n+1],m,l.opacity,r),g[n+2]=N(h[n+2],e[n+2],m,l.opacity,r),g[n+3]=Math.round(h[n+3]+(e[n+3]-h[n+3])*i)}i.release(e)}else this._runNode(l,h,g,o,s,_,f);let S=performance.now()-v;l._lastMs=S,this._nodeTimings.set(l.id,S),S>O&&(console.warn(`[DISTORT] Node "${l.type}" exceeded ${O}ms — worker preview forced next frame`),l._forceWorkerPreviewNext=!0),b?.(),(!l._cache||l._cache.length!==c)&&(l._cache=new Uint8ClampedArray(c)),l._cache.set(g),l._cacheValid=!0,e.renderProgress=(a+1)/u.length,[h,g]=[g,h]}w+=t.nodes.length}return i.release(g),e.lastRenderTime=performance.now()-_,e.rendering=!1,e.needsRender=!1,{pixels:h,width:o,height:s,_pooled:!1}}get pendingGPU(){return this._pendingGPU??null}releaseResult(e){e?._pooled&&i.release(e.pixels)}renderFinal(){let e=this.s.quality;this.s.quality=`final`;let t=this.render();return this.s.quality=e,t}_buildModMaps(e,t){let n={},r=this.s.modulationMaps??{};for(let[i,a]of Object.entries(r)){let r=e*t,o=new Uint8Array(r),s=a.sourceW/e,c=a.sourceH/t,l=a.sourcePixels;for(let n=0;n<t;n++)for(let t=0;t<e;t++){let r=Math.min(a.sourceW-1,Math.round(t*s)),i=(Math.min(a.sourceH-1,Math.round(n*c))*a.sourceW+r)*4;o[n*e+t]=Math.round(l[i]*.299+l[i+1]*.587+l[i+2]*.114)}n[i]=o}return n}_buildPixelVars(e,t,n,r){let i=!1;for(let e of r)if(e?.modulation){for(let t of Object.values(e.modulation))if(t&&(t.mode||t.type)===`expr`){let e=(t.expr||``).replace(/^=/,``);if(g.classify(e)===`pixel`){i=!0;break}}if(i)break}if(!i)return null;let a=Array(t*n);for(let r=0;r<n;r++)for(let i=0;i<t;i++){let o=r*t+i,s=o*4,c=e[s]/255,l=e[s+1]/255,u=e[s+2]/255,d=e[s+3]/255;a[o]={x:i,y:r,nx:i/Math.max(1,t-1),ny:r/Math.max(1,n-1),lum:c*.299+l*.587+u*.114,r:c,g:l,b:u,a:d}}return a}_applyNodeModulation(e,t,n,r){if(!e?.modulation)return null;let i=Object.keys(e.modulation);if(!i.length)return null;let a={},o=Math.floor(r/2)*n+Math.floor(n/2),s=!1;for(let n of i){if(n===`__opacity__`){a[n]=e.opacity;let r=e.getModulated(n,o,t);typeof r==`number`&&isFinite(r)&&(e.opacity=Math.max(0,Math.min(1,r)),s=!0);continue}if(!(n in e.params))continue;a[n]=e.params[n];let r=e.getModulated(n,o,t);typeof r==`number`&&isFinite(r)&&(e.params[n]=r,s=!0)}return s?()=>{for(let[t,n]of Object.entries(a))t===`__opacity__`?e.opacity=n:e.params[t]=n}:null}_downsample(e,t,n,r,i,a){let o=t/r,s=n/i;for(let c=0;c<i;c++){let i=Math.min(n-1,Math.round(c*s))*t,l=c*r;for(let n=0;n<r;n++){let r=(i+Math.min(t-1,Math.round(n*o)))*4,s=(l+n)*4;a[s]=e[r],a[s+1]=e[r+1],a[s+2]=e[r+2],a[s+3]=e[r+3]}}}_runNode(e,t,n,r,i,a,o){e.apply(t,n,r,i,a)}},F=class e{static _id=0;constructor(t,n,r){this.id=e._id++,this.type=t,this.name=n,this.enabled=!0,this.solo=!1,this.opacity=1,this.blendMode=`normal`,this.expanded=!0,this.params={},this.paramDefs={...r,__opacity__:{min:0,max:1,step:.01,value:1,label:`OPACITY`}};for(let[e,t]of Object.entries(r))this.params[e]=t.value;this._cache=null,this._cacheValid=!1,this.isLUT=!1,this.mask={enabled:!1,source:`none`,invert:!1,feather:0,data:null,_sourcePixels:null,_sourceW:0,_sourceH:0,_drawPixels:null,_drawW:0,_drawH:0},this.modulation={}}getParamDefs(){return this.paramDefs}apply(e,t,n,r,i){t.set(e)}buildGeometry(e,t,n,r){return[]}buildLUT(e,t,n){}glsl(){return null}wgsl(){return null}gpuBindings(){return null}get gpuCapable(){return this.wgsl()!==null||this.glsl()!==null}getModulated(e,t,n){let r=e===`__opacity__`?this.opacity:this.params[e],i=this.modulation[e];if(!i||!n)return r;let a=i.mode||i.type||`none`;if(a===`none`)return r;let o=this.paramDefs?.[e],s=typeof o?.min==`number`?o.min:-1/0,c=typeof o?.max==`number`?o.max:1/0;if(a===`image`&&i.mapId&&n.modMaps?.[i.mapId]){let e=n.modMaps[i.mapId],a=e[Math.max(0,Math.min(e.length-1,t|0))]/255;i.invert&&(a=1-a);let o=typeof i.amount==`number`?i.amount:1,l=s+a*(c-s),u=r*(1-o)+l*o;return Math.max(s,Math.min(c,u))}if(a===`source`){let e=n?.pixelVars?.[t];if(!e)return r;let a=e.lum;i.invert&&(a=1-a);let o=typeof i.amount==`number`?i.amount:1,l=s+a*(c-s),u=r*(1-o)+l*o;return Math.max(s,Math.min(c,u))}if(a===`expr`&&typeof i.expr==`string`&&i.expr.trim()){let e=i.expr.startsWith(`=`)?i.expr.slice(1):i.expr,a={seed:n.nodeSeed??0,frame:n.frame??0,frameCount:n.frameCount??1,time:n.time??0},o=n.pixelVars?.[t],l=o?g.evaluatePixel(e,{...a,...o}):g.evaluate(e,a);return typeof l!=`number`||!isFinite(l)?r:Math.max(s,Math.min(c,l))}return r}invalidate(e){if(this._cacheValid=!1,this._cache=null,e){let t=e.indexOf(this);if(t>=0)for(let n=t+1;n<e.length;n++)e[n]._cacheValid=!1,e[n]._cache=null}}buildMask(e,t,n){if(!this.mask.enabled||this.mask.source===`none`){this.mask.data=null;return}let r=t*n,i=new Uint8Array(r);if(this.mask.source===`luminance`)for(let t=0;t<r;t++){let n=t*4;i[t]=Math.round(e[n]*.299+e[n+1]*.587+e[n+2]*.114)}else if(this.mask.source===`gradient`){let e=t/2,r=n/2,a=Math.sqrt(e*e+r*r);for(let o=0;o<n;o++)for(let n=0;n<t;n++){let s=Math.sqrt((n-e)**2+(o-r)**2);i[o*t+n]=Math.round((1-Math.min(1,s/a))*255)}}else if(this.mask.source===`upload`&&this.mask._sourcePixels)this._resizeMask(i,t,n);else if(this.mask.source===`draw`){if(!this.mask._drawPixels){this.mask.data=null;return}this._resizeRaw(this.mask._drawPixels,this.mask._drawW,this.mask._drawH,i,t,n)}if(this.mask.invert)for(let e=0;e<r;e++)i[e]=255-i[e];this.mask.feather>0&&(i=this._featherMask(i,t,n,this.mask.feather)),this.mask.data=i}_resizeMask(e,t,n){let r=this.mask._sourcePixels,i=this.mask._sourceW,a=this.mask._sourceH,o=i/t,s=a/n;for(let c=0;c<n;c++)for(let n=0;n<t;n++){let l=Math.min(i-1,Math.round(n*o)),u=(Math.min(a-1,Math.round(c*s))*i+l)*4;e[c*t+n]=Math.round(r[u]*.299+r[u+1]*.587+r[u+2]*.114)}}_resizeRaw(e,t,n,r,i,a){let o=t/i,s=n/a;for(let c=0;c<a;c++)for(let a=0;a<i;a++){let l=Math.min(t-1,Math.round(a*o)),u=Math.min(n-1,Math.round(c*s));r[c*i+a]=e[u*t+l]}}_featherMask(e,t,n,r){let i=Math.ceil(r),a=new Float32Array(i*2+1),o=0;for(let e=-i;e<=i;e++)a[e+i]=Math.exp(-(e*e)/(2*r*r)),o+=a[e+i];for(let e=0;e<a.length;e++)a[e]/=o;let s=new Float32Array(t*n),c=new Uint8Array(t*n);for(let r=0;r<n;r++)for(let n=0;n<t;n++){let o=0;for(let s=-i;s<=i;s++){let c=Math.max(0,Math.min(t-1,n+s));o+=e[r*t+c]*a[s+i]}s[r*t+n]=o}for(let e=0;e<t;e++)for(let r=0;r<n;r++){let o=0;for(let c=-i;c<=i;c++){let l=Math.max(0,Math.min(n-1,r+c));o+=s[l*t+e]*a[c+i]}c[r*t+e]=Math.round(Math.max(0,Math.min(255,o)))}return c}toJSON(){return{type:this.type,enabled:this.enabled,opacity:this.opacity,blendMode:this.blendMode,params:{...this.params},mask:{enabled:this.mask.enabled,source:this.mask.source,invert:this.mask.invert,feather:this.mask.feather},modulation:{...this.modulation}}}fromJSON(e){this.enabled=e.enabled??!0,this.opacity=e.opacity??1,this.blendMode=e.blendMode??`normal`;for(let t in e.params)t in this.params&&(this.params[t]=e.params[t]);if(e.params){let t=e.params.internalBlend??e.params.blendMode;t!==void 0&&(`combineMode`in this.params&&!(`combineMode`in e.params)&&(this.params.combineMode=t),`blendMode`in this.params&&!(`blendMode`in e.params)&&(this.params.blendMode=t))}e.mask&&(this.mask.enabled=e.mask.enabled??!1,this.mask.source=e.mask.source??`none`,this.mask.invert=e.mask.invert??!1,this.mask.feather=e.mask.feather??0),e.modulation&&(this.modulation={...e.modulation})}destroy(){this._cache=null,this.mask.data=null,this.mask._sourcePixels=null,this.mask._drawPixels=null,this.mask._drawW=0,this.mask._drawH=0}};function I(e){te(e),ee(e.params);class t extends F{static type=e.type;static label=e.name;static category=e.category;constructor(){super(e.type,e.name,e.params),this.category=e.category,this.isLUT=e.isLUT??!1,this.isVector=e.isVector??!1,this.blendMode=`normal`}apply(t,n,r,i,a){if(!e.apply){n.set(t);return}let o=this._resolveParams(a),s=this._makeModulate(o,a);e.apply(t,n,r,i,o,a,s)}wgsl(){return e.wgsl??null}glsl(){return e.glsl??null}gpuBindings(){return e.gpuBindings??null}applyVector(t,n,r,i){if(!e.applyVector)return null;let a=this._resolveParams(i);return e.applyVector(t,n,r,a,i)}buildGeometry(t,n,r,i){if(!e.buildGeometry)return[];let a=this._resolveParams(r);return e.buildGeometry(t,n,a,r,i)||[]}destroy(){e.destroy?.call(this),super.destroy()}_resolveParams(e){let t={},n=e?.quality===`preview`;for(let[e,r]of Object.entries(this.paramDefs)){if(e===`__opacity__`)continue;let i=this.params[e];n&&(r.previewMax!==void 0&&(i=Math.min(i,r.previewMax)),r.previewMin!==void 0&&(i=Math.max(i,r.previewMin))),t[e]=i}return t}_makeModulate(e,t){return(n,r)=>{if(n===`__opacity__`){let e=this.modulation[n];if(!e)return this.opacity;let i=e.mode||e.type||`none`;return i===`none`||i===`image`&&(!e.mapId||!t?.modMaps)?this.opacity:this.getModulated(n,r,t)}let i=this.modulation[n];if(!i)return e[n];let a=i.mode||i.type||`none`;return a===`none`||a===`image`&&(!i.mapId||!t?.modMaps)?e[n]:this.getModulated(n,r,t)}}}return t.hasVectorExport=typeof e.buildGeometry==`function`,t.forceWorkerPreview=e.forceWorkerPreview===!0,t.extendedControls=e.extendedControls??[],t}function L(e,t){let n=e.toLowerCase(),r=(t.label||``).toUpperCase();return n===`centrex`||n===`centrey`||n.includes(`centre`)?`0–1`:n===`passes`||n===`samples`||n===`octaves`?`n`:n.includes(`sigma`)||r.includes(`SIGMA`)?`σ`:n.includes(`angle`)||r.includes(`ANGLE`)?`deg`:(n.includes(`phase`)||r.includes(`PHASE`))&&t.max<=7&&t.min>=0?`rad`:n.includes(`frame`)||r.includes(`FRAME`)?`frames`:r.includes(`THRESH`)||n.includes(`threshold`)?t.max<=1?`0–1`:`lvl`:t.max===255&&t.min===0&&Number(t.step)>=1?`lvl`:t.max<=1&&t.min>=0&&t.step<=.05||r.includes(`WEIGHT`)||n.endsWith(`r`)||n.endsWith(`g`)||n.endsWith(`b`)?`0–1`:n.includes(`freq`)||r.includes(`FREQ`)?`Hz`:n.includes(`speed`)||r.includes(`SPEED`)?`0–1`:t.max>=50&&t.max<=1e4?`px`:`0–1`}function ee(e){for(let[t,n]of Object.entries(e)){let e=n.type??`range`;e!==`internal`&&e===`range`&&(n.driveable===void 0&&(n.driveable=!0),(!n.unit||n.unit===``)&&(n.unit=L(t,n)))}}function te(e){if(!e.type||typeof e.type!=`string`)throw Error(`[EffectModule] config.type is required and must be a string`);if(!e.name||typeof e.name!=`string`)throw Error(`[EffectModule] config.name is required and must be a string`);if(!e.category)throw Error(`[EffectModule] config.category is required`);if(!e.params||typeof e.params!=`object`)throw Error(`[EffectModule] config.params is required`);if(e.isVector&&!e.applyVector)throw Error(`[EffectModule] ${e.type}: isVector=true requires applyVector()`);!e.isVector&&!e.apply&&!e.applyVector&&console.warn(`[EffectModule] ${e.type}: no apply() or applyVector() — node will pass through`);for(let[t,n]of Object.entries(e.params)){if(!n.label)throw Error(`[EffectModule] ${e.type}.params.${t}: label is required`);if(n.tier===2)throw Error(`[EffectModule] ${e.type}.params.${t}: tier 2 is reserved for universal controls (opacity, blendMode)`);let r=n.type??`range`;if(r!==`internal`){if(r===`range`&&(n.min===void 0||n.max===void 0||n.step===void 0))throw Error(`[EffectModule] ${e.type}.params.${t}: range params require min, max, step`);if(r===`select`&&(!Array.isArray(n.options)||n.options.length===0))throw Error(`[EffectModule] ${e.type}.params.${t}: select params require options array`)}}}function R(e){return e<0?0:e>255?255:e}function z(e,t){return e[t]*.299+e[t+1]*.587+e[t+2]*.114}function B(e,t,n,r=1){let i=t*n,a=new Uint32Array(256);for(let t=0;t<i*4;t+=4)a[Math.round(z(e,t))]++;let o=new Float32Array(256);o[0]=a[0];for(let e=1;e<256;e++)o[e]=o[e-1]+a[e];let s=o.find(e=>e>0)||0,c=i-s||1,l=new Uint8Array(256);for(let e=0;e<256;e++)l[e]=Math.round((o[e]-s)/c*255);let u=new Uint8ClampedArray(e.length);for(let t=0;t<i*4;t+=4){for(let n=0;n<3;n++)u[t+n]=Math.round(e[t+n]*(1-r)+l[e[t+n]]*r);u[t+3]=e[t+3]}return u}function V(e,t,n,r=32,i=3){let a=Math.ceil(t/r),o=Math.ceil(n/r),s=Math.round(i*r*r/256),c=Array(a*o);for(let i=0;i<o;i++)for(let o=0;o<a;o++){let l=new Uint32Array(256),u=o*r,d=i*r,f=Math.min(u+r,t),p=Math.min(d+r,n),m=0;for(let n=d;n<p;n++)for(let r=u;r<f;r++)l[Math.round(z(e,(n*t+r)*4))]++,m++;let h=0;for(let e=0;e<256;e++)l[e]>s&&(h+=l[e]-s,l[e]=s);let g=Math.floor(h/256);for(let e=0;e<256;e++)l[e]+=g;let _=new Uint8Array(256),v=0,y=m||1;for(let e=0;e<256;e++)v+=l[e],_[e]=Math.round(v/y*255);c[i*a+o]=_}let l=new Uint8ClampedArray(e.length);for(let i=0;i<n;i++)for(let n=0;n<t;n++){let s=(i*t+n)*4,u=(n-r/2)/r,d=(i-r/2)/r,f=Math.max(0,Math.min(a-1,Math.floor(u))),p=Math.max(0,Math.min(o-1,Math.floor(d))),m=Math.min(a-1,f+1),h=Math.min(o-1,p+1),g=Math.max(0,Math.min(1,u-f)),_=Math.max(0,Math.min(1,d-p)),v=1-g,y=1-_;for(let t=0;t<3;t++){let n=e[s+t],r=c[p*a+f][n],i=c[p*a+m][n],o=c[h*a+f][n],u=c[h*a+m][n];l[s+t]=Math.round((r*v+i*g)*y+(o*v+u*g)*_)}l[s+3]=e[s+3]}return l}function H(e,t,n,r){let{rr:i=1,rg:a=0,rb:o=0,gr:s=0,gg:c=1,gb:l=0,br:u=0,bg:d=0,bb:f=1}=r,p=new Uint8ClampedArray(e.length);for(let r=0,m=t*n*4;r<m;r+=4){let t=e[r],n=e[r+1],m=e[r+2];p[r]=R(Math.round(t*i+n*a+m*o)),p[r+1]=R(Math.round(t*s+n*c+m*l)),p[r+2]=R(Math.round(t*u+n*d+m*f)),p[r+3]=e[r+3]}return p}function U(e,t,n,r){let i=new Uint8ClampedArray(e.length);for(let a=0,o=t*n*4;a<o;a+=4){let t=e[a]/255,n=e[a+1]/255,o=e[a+2]/255,s=Math.max(t,n,o)-Math.min(t,n,o),c=r*(1-s)*(1-s),l=(t+n+o)/3;i[a]=R(Math.round((t+(t-l)*c)*255)),i[a+1]=R(Math.round((n+(n-l)*c)*255)),i[a+2]=R(Math.round((o+(o-l)*c)*255)),i[a+3]=e[a+3]}return i}function W(e,t,n,r,i){let a=new Uint8Array(256),o=new Uint8Array(256),s=new Uint8Array(256),c=.5;for(let e=0;e<256;e++)a[e]=R(Math.round(e+r*c)),o[e]=R(Math.round(e-i*c)),s[e]=R(Math.round(e-r*c));let l=new Uint8ClampedArray(e.length);for(let r=0,i=t*n*4;r<i;r+=4)l[r]=a[e[r]],l[r+1]=o[e[r+1]],l[r+2]=s[e[r+2]],l[r+3]=e[r+3];return l}function ne(e,t,n,r){let{shadowR:i=0,shadowG:a=0,shadowB:o=0,midR:s=0,midG:c=0,midB:l=0,highR:u=0,highG:d=0,highB:f=0}=r,p=.5,m=new Uint8ClampedArray(e.length);for(let r=0,h=t*n*4;r<h;r+=4){let t=e[r],n=e[r+1],h=e[r+2],g=(t*.299+n*.587+h*.114)/255,_=Math.max(0,1-g*2),v=1-Math.abs(g-.5)*2,y=Math.max(0,(g-.5)*2);m[r]=R(t+(i*_+s*v+u*y)*p),m[r+1]=R(n+(a*_+c*v+d*y)*p),m[r+2]=R(h+(o*_+l*v+f*y)*p),m[r+3]=e[r+3]}return m}function G(e,t,n,r=.299,i=.587,a=.114){let o=new Uint8ClampedArray(e.length);for(let s=0,c=t*n*4;s<c;s+=4){let t=e[s]*r+e[s+1]*i+e[s+2]*a;o[s]=o[s+1]=o[s+2]=t,o[s+3]=e[s+3]}return o}function K(e,t,n){let r=new Uint8ClampedArray(e.length);for(let i=0,a=t*n*4;i<a;i+=4)r[i]=255-e[i],r[i+1]=255-e[i+1],r[i+2]=255-e[i+2],r[i+3]=e[i+3];return r}function q(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*(2/3-n)*6:e}function re(e,t,n){let r=e/255,i=t/255,a=n/255,o=Math.max(r,i,a),s=Math.min(r,i,a),c=o-s,l=(o+s)/2;if(c===0)return[0,0,l];let u=l>.5?c/(2-o-s):c/(o+s),d;return d=o===r?(i-a)/c+(i<a?6:0):o===i?(a-r)/c+2:(r-i)/c+4,[d/6,u,l]}function ie(e,t,n){if(t===0){let e=Math.round(n*255);return[e,e,e]}let r=n<.5?n*(1+t):n+t-n*t,i=2*n-r;return[Math.round(q(i,r,e+1/3)*255),Math.round(q(i,r,e)*255),Math.round(q(i,r,e-1/3)*255)]}function ae(e,t,n,r){if(r===`all`)return K(e,t,n);let i=new Uint8ClampedArray(e.length);for(let a=0,o=t*n*4;a<o;a+=4){let[t,n,o]=re(e[a],e[a+1],e[a+2]),s,c,l;r===`luminosity`?[s,c,l]=ie(t,n,1-o):[s,c,l]=ie((t+.5)%1,n,o),i[a]=s,i[a+1]=c,i[a+2]=l,i[a+3]=e[a+3]}return i}function oe(e,t,n,r=0,i=1,a=1,o=0,s=.5){let c=1/Math.max(i,.001),l=new Uint8Array(256);for(let e=0;e<256;e++){let t=e/255*a+r;t=Math.max(0,t)**+c,o&&(t=s+(t-s)*(1+o)),l[e]=R(Math.round(t*255))}let u=new Uint8ClampedArray(e.length);for(let r=0,i=t*n*4;r<i;r+=4)u[r]=l[e[r]],u[r+1]=l[e[r+1]],u[r+2]=l[e[r+2]],u[r+3]=e[r+3];return u}function se(e,t,n,r=0,i=255,a=1,o=0,s=255){let c=Math.max(i-r,1),l=s-o,u=1/Math.max(a,.001),d=new Uint8Array(256);for(let e=0;e<256;e++)d[e]=R(Math.round(o+Math.max(0,Math.min(1,(e-r)/c))**+u*l));let f=new Uint8ClampedArray(e.length);for(let r=0,i=t*n*4;r<i;r+=4)f[r]=d[e[r]],f[r+1]=d[e[r+1]],f[r+2]=d[e[r+2]],f[r+3]=e[r+3];return f}function ce(e,t,n,r,i,a){let o=[{x:e,y:t},{x:n,y:r},{x:i,y:a}].sort((e,t)=>e.x-t.x),s=new Uint8Array(256);for(let e=0;e<256;e++){let t;if(e<=o[0].x)t=o[0].y;else if(e>=o[o.length-1].x)t=o[o.length-1].y;else{let n=0;for(let t=0;t<o.length-1;t++)if(e>=o[t].x&&e<=o[t+1].x){n=t;break}let r=(e-o[n].x)/Math.max(1,o[n+1].x-o[n].x),i=r*r*(3-2*r);t=o[n].y+(o[n+1].y-o[n].y)*i}s[e]=R(Math.round(t))}return s}function le(e,t,n,r){let i=new Uint8ClampedArray(e.length);for(let a=0,o=t*n*4;a<o;a+=4)i[a]=r[e[a]],i[a+1]=r[e[a+1]],i[a+2]=r[e[a+2]],i[a+3]=e[a+3];return i}function ue(e,t,n,r=0,i=1,a=0){let o=r/360;function s(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<.5?t:n<2/3?e+(t-e)*(2/3-n)*6:e}let c=new Uint8ClampedArray(e.length);for(let r=0,l=t*n*4;r<l;r+=4){let t=e[r]/255,n=e[r+1]/255,l=e[r+2]/255,u=Math.max(t,n,l),d=Math.min(t,n,l),f,p,m=(u+d)/2;if(u===d)f=p=0;else{let e=u-d;p=m>.5?e/(2-u-d):e/(u+d),f=u===t?((n-l)/e+(n<l?6:0))/6:u===n?((l-t)/e+2)/6:((t-n)/e+4)/6}if(f=(f+o+1)%1,p=Math.max(0,Math.min(1,p*i)),m=Math.max(0,Math.min(1,m+a)),p===0)t=n=l=m;else{let e=m<.5?m*(1+p):m+p-m*p,r=2*m-e;t=s(r,e,f+1/3),n=s(r,e,f),l=s(r,e,f-1/3)}c[r]=Math.round(t*255),c[r+1]=Math.round(n*255),c[r+2]=Math.round(l*255),c[r+3]=e[r+3]}return c}let de=new Uint8Array([0,48,12,60,3,51,15,63,32,16,44,28,35,19,47,31,8,56,4,52,11,59,7,55,40,24,36,20,43,27,39,23,2,50,14,62,1,49,13,61,34,18,46,30,33,17,45,29,10,58,6,54,9,57,5,53,42,26,38,22,41,25,37,21]);function fe(e,t,n,r=2,i=1){let a=255/(r-1),o=new Uint8ClampedArray(e.length);for(let r=0;r<n;r++)for(let n=0;n<t;n++){let s=(r*t+n)*4,c=(de[(r&7)*8+(n&7)]/64-.5)*a*i;for(let t=0;t<3;t++)o[s+t]=R(Math.round((e[s+t]+c)/a)*a);o[s+3]=e[s+3]}return o}function pe(e,t,n,r=2,i=1){let a=255/(r-1),o=new Float32Array(t*n*3);for(let r=0,i=0;r<t*n*4;r+=4,i+=3)o[i]=e[r],o[i+1]=e[r+1],o[i+2]=e[r+2];for(let e=0;e<n;e++)for(let r=0;r<t;r++){let s=(e*t+r)*3;for(let c=0;c<3;c++){let l=o[s+c],u=Math.round(l/a)*a;o[s+c]=u;let d=(l-u)*i;r+1<t&&(o[s+3+c]+=d*7/16),e+1<n&&(r>0&&(o[((e+1)*t+r-1)*3+c]+=d*3/16),o[((e+1)*t+r)*3+c]+=d*5/16,r+1<t&&(o[((e+1)*t+r+1)*3+c]+=d*1/16))}}let s=new Uint8ClampedArray(e.length);for(let r=0,i=0;r<t*n*4;r+=4,i+=3)s[r]=R(o[i]),s[r+1]=R(o[i+1]),s[r+2]=R(o[i+2]),s[r+3]=e[r+3];return s}function me(e,t,n,r){let i=new Uint8ClampedArray(e.length);for(let a=0,o=t*n*4;a<o;a+=4){let t=e[a],n=e[a+1],o=e[a+2],s=1/0,c=0;for(let e=0;e<r.length;e++){let i=(t-r[e][0])**2+(n-r[e][1])**2+(o-r[e][2])**2;i<s&&(s=i,c=e)}i[a]=r[c][0],i[a+1]=r[c][1],i[a+2]=r[c][2],i[a+3]=e[a+3]}return i}function he(e){let t=Math.max(2,e),n=1/t,r=new Uint8Array(256);for(let e=0;e<256;e++){let i=Math.min(Math.floor(e/255/n),t-1);r[e]=Math.round(i/(t-1)*255)}return r}function ge(e,t,n,r=4,i=4,a=4){let o=he(r),s=he(i),c=he(a),l=new Uint8ClampedArray(e.length);for(let r=0,i=t*n*4;r<i;r+=4)l[r]=o[e[r]],l[r+1]=s[e[r+1]],l[r+2]=c[e[r+2]],l[r+3]=e[r+3];return l}function _e(e,t){let n=Math.max(2,t);return Math.round(Math.min(Math.floor(e*n),n-1)/(n-1)*1e3)/1e3}function ve(e,t,n,r=4,i=4,a=4){let o=new Uint8ClampedArray(e.length);for(let s=0,c=t*n*4;s<c;s+=4){let[t,n,c]=re(e[s],e[s+1],e[s+2]),[l,u,d]=ie(_e(t,r),_e(n,i),_e(c,a));o[s]=l,o[s+1]=u,o[s+2]=d,o[s+3]=e[s+3]}return o}function ye(e,t,n,r){let i=r.map(e=>{if(typeof e==`string`){let t=e.replace(`#`,``);return[parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16)]}return e}),a=i.length-1,o=new Uint8Array(256*3);for(let e=0;e<256;e++){let t=e/255*a,n=Math.floor(t),r=Math.min(a,n+1),s=t-n,c=i[n],l=i[r];o[e*3]=Math.round(c[0]+(l[0]-c[0])*s),o[e*3+1]=Math.round(c[1]+(l[1]-c[1])*s),o[e*3+2]=Math.round(c[2]+(l[2]-c[2])*s)}let s=new Uint8ClampedArray(e.length);for(let r=0,i=t*n*4;r<i;r+=4){let t=Math.round(z(e,r));s[r]=o[t*3],s[r+1]=o[t*3+1],s[r+2]=o[t*3+2],s[r+3]=e[r+3]}return s}let be=I({type:`greyscale`,name:`GREYSCALE`,category:`COLOUR / TONE`,params:{wr:{value:.299,min:0,max:1,step:.01,label:`R WEIGHT`,tier:3,driveable:!0,unit:`0–1`},wg:{value:.587,min:0,max:1,step:.01,label:`G WEIGHT`,tier:3,driveable:!0,unit:`0–1`},wb:{value:.114,min:0,max:1,step:.01,label:`B WEIGHT`,tier:4,driveable:!0,unit:`0–1`}},apply(e,t,n,r,i){t.set(G(e,n,r,i.wr,i.wg,i.wb))},wgsl:`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uWr     : f32,
  uWg     : f32,
  uWb     : f32,
  _pad    : f32,
  _pad2   : f32,
  _pad3   : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px  = textureLoad(tIn, vec2i(x, y), 0);
  let lum = px.r * uni.uWr + px.g * uni.uWg + px.b * uni.uWb;
  textureStore(tOut, vec2i(x, y), vec4f(lum, lum, lum, px.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uWr;
uniform float uWg;
uniform float uWb;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4 px  = texture(uTex, vUV);
  float lum = px.r * uWr + px.g * uWg + px.b * uWb;
  fragColor = vec4(lum, lum, lum, px.a);
}
`,gpuBindings:{uniforms:{uWr:`f32`,uWg:`f32`,uWb:`f32`},multiPass:!1,uniformMap:e=>({uWr:e.wr,uWg:e.wg,uWb:e.wb})}}),xe=I({type:`levels`,name:`LEVELS`,category:`COLOUR / TONE`,isLUT:!0,params:{blackPoint:{value:0,min:0,max:255,step:1,label:`BLACK IN`,tier:3,driveable:!0,unit:`lvl`},whitePoint:{value:255,min:0,max:255,step:1,label:`WHITE IN`,tier:3,driveable:!0,unit:`lvl`},midGamma:{value:1,min:.1,max:3,step:.01,label:`GAMMA`,tier:4,driveable:!0,unit:`n`},outBlack:{value:0,min:0,max:255,step:1,label:`BLACK OUT`,tier:4,driveable:!0,unit:`lvl`},outWhite:{value:255,min:0,max:255,step:1,label:`WHITE OUT`,tier:4,driveable:!0,unit:`lvl`}},apply(e,t,n,r,i){t.set(se(e,n,r,i.blackPoint,i.whitePoint,i.midGamma,i.outBlack,i.outWhite))},wgsl:`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uBlackPoint : f32,
  uWhitePoint : f32,
  uMidGamma   : f32,
  uOutBlack   : f32,
  uOutWhite   : f32,
  _pad        : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn levelsChannel(c: f32, bp: f32, wp: f32, g: f32, ob: f32, ow: f32) -> f32 {
  let range = max(wp - bp, 0.001);
  let norm  = clamp((c - bp) / range, 0.0, 1.0);
  let g2    = pow(norm, 1.0 / max(g, 0.001));
  return clamp(ob + g2 * (ow - ob), 0.0, 1.0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let bp = uni.uBlackPoint / 255.0;
  let wp = uni.uWhitePoint / 255.0;
  let ob = uni.uOutBlack   / 255.0;
  let ow = uni.uOutWhite   / 255.0;
  let g  = uni.uMidGamma;
  textureStore(tOut, vec2i(x, y), vec4f(
    levelsChannel(px.r, bp, wp, g, ob, ow),
    levelsChannel(px.g, bp, wp, g, ob, ow),
    levelsChannel(px.b, bp, wp, g, ob, ow),
    px.a,
  ));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uBlackPoint;
uniform float uWhitePoint;
uniform float uMidGamma;
uniform float uOutBlack;
uniform float uOutWhite;

in  vec2 vUV;
out vec4 fragColor;

float levelsChannel(float c, float bp, float wp, float g, float ob, float ow) {
  float range = max(wp - bp, 0.001);
  float norm  = clamp((c - bp) / range, 0.0, 1.0);
  float g2    = pow(norm, 1.0 / max(g, 0.001));
  return clamp(ob + g2 * (ow - ob), 0.0, 1.0);
}

void main() {
  vec4  px = texture(uTex, vUV);
  float bp = uBlackPoint / 255.0;
  float wp = uWhitePoint / 255.0;
  float ob = uOutBlack   / 255.0;
  float ow = uOutWhite   / 255.0;
  fragColor = vec4(
    levelsChannel(px.r, bp, wp, uMidGamma, ob, ow),
    levelsChannel(px.g, bp, wp, uMidGamma, ob, ow),
    levelsChannel(px.b, bp, wp, uMidGamma, ob, ow),
    px.a
  );
}
`,gpuBindings:{uniforms:{uBlackPoint:`f32`,uWhitePoint:`f32`,uMidGamma:`f32`,uOutBlack:`f32`,uOutWhite:`f32`},multiPass:!1,uniformMap:e=>({uBlackPoint:e.blackPoint,uWhitePoint:e.whitePoint,uMidGamma:e.midGamma,uOutBlack:e.outBlack,uOutWhite:e.outWhite})}}),Se=I({type:`contrast`,name:`LIFT/GAM/GAIN`,category:`COLOUR / TONE`,params:{lift:{value:0,min:-.5,max:.5,step:.01,label:`LIFT`,tier:3,driveable:!0,unit:`n`},gamma:{value:1,min:.2,max:3,step:.01,label:`GAMMA`,tier:3,driveable:!0,unit:`n`},gain:{value:1,min:0,max:3,step:.01,label:`GAIN`,tier:3,driveable:!0,unit:`n`},contrast:{value:0,min:-1,max:1,step:.01,label:`CONTRAST`,tier:4,driveable:!0,unit:`n`},pivot:{value:.5,min:0,max:1,step:.01,label:`PIVOT`,tier:4,driveable:!0,unit:`n`},vibrance:{value:0,min:-1,max:1,step:.01,label:`VIBRANCE`,tier:4,driveable:!0,unit:`n`}},apply(e,t,n,r,i){let a=oe(e,n,r,i.lift,i.gamma,i.gain,i.contrast,i.pivot);t.set(i.vibrance===0?a:U(a,n,r,i.vibrance))},wgsl:`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uLift     : f32,
  uGamma    : f32,
  uGain     : f32,
  uContrast : f32,
  uPivot    : f32,
  uVibrance : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn applyLGG(c: f32, lift: f32, gamma: f32, gain: f32) -> f32 {
  let lifted = c + lift;
  let gained = lifted * gain;
  return clamp(pow(max(gained, 0.0), 1.0 / max(gamma, 0.001)), 0.0, 1.0);
}

fn applyContrast(c: f32, contrast: f32, pivot: f32) -> f32 {
  return clamp(pivot + (c - pivot) * (1.0 + contrast), 0.0, 1.0);
}

fn applyVibrance(rgb: vec3f, vibrance: f32) -> vec3f {
  let mx  = max(rgb.r, max(rgb.g, rgb.b));
  let mn  = min(rgb.r, min(rgb.g, rgb.b));
  let sat = mx - mn;
  let lum = dot(rgb, vec3f(0.299, 0.587, 0.114));
  let mask = 1.0 - sat;
  return clamp(rgb + (rgb - vec3f(lum)) * vibrance * mask, vec3f(0.0), vec3f(1.0));
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  var c  = vec3f(
    applyLGG(px.r, uni.uLift, uni.uGamma, uni.uGain),
    applyLGG(px.g, uni.uLift, uni.uGamma, uni.uGain),
    applyLGG(px.b, uni.uLift, uni.uGamma, uni.uGain),
  );
  if (uni.uContrast != 0.0) {
    c = vec3f(
      applyContrast(c.r, uni.uContrast, uni.uPivot),
      applyContrast(c.g, uni.uContrast, uni.uPivot),
      applyContrast(c.b, uni.uContrast, uni.uPivot),
    );
  }
  if (uni.uVibrance != 0.0) {
    c = applyVibrance(c, uni.uVibrance);
  }
  textureStore(tOut, vec2i(x, y), vec4f(c, px.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uLift;
uniform float uGamma;
uniform float uGain;
uniform float uContrast;
uniform float uPivot;
uniform float uVibrance;

in  vec2 vUV;
out vec4 fragColor;

float applyLGG(float c, float lift, float gamma, float gain) {
  float lifted = c + lift;
  float gained = lifted * gain;
  return clamp(pow(max(gained, 0.0), 1.0 / max(gamma, 0.001)), 0.0, 1.0);
}

float applyContrast(float c, float contrast, float pivot) {
  return clamp(pivot + (c - pivot) * (1.0 + contrast), 0.0, 1.0);
}

vec3 applyVibrance(vec3 rgb, float vibrance) {
  float mx  = max(rgb.r, max(rgb.g, rgb.b));
  float mn  = min(rgb.r, min(rgb.g, rgb.b));
  float sat = mx - mn;
  float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
  float mask = 1.0 - sat;
  return clamp(rgb + (rgb - vec3(lum)) * vibrance * mask, vec3(0.0), vec3(1.0));
}

void main() {
  vec4 px = texture(uTex, vUV);
  vec3 c = vec3(
    applyLGG(px.r, uLift, uGamma, uGain),
    applyLGG(px.g, uLift, uGamma, uGain),
    applyLGG(px.b, uLift, uGamma, uGain)
  );
  if (uContrast != 0.0) {
    c = vec3(
      applyContrast(c.r, uContrast, uPivot),
      applyContrast(c.g, uContrast, uPivot),
      applyContrast(c.b, uContrast, uPivot)
    );
  }
  if (uVibrance != 0.0) {
    c = applyVibrance(c, uVibrance);
  }
  fragColor = vec4(c, px.a);
}
`,gpuBindings:{uniforms:{uLift:`f32`,uGamma:`f32`,uGain:`f32`,uContrast:`f32`,uPivot:`f32`,uVibrance:`f32`},multiPass:!1,uniformMap:e=>({uLift:e.lift,uGamma:e.gamma,uGain:e.gain,uContrast:e.contrast,uPivot:e.pivot,uVibrance:e.vibrance})}}),Ce={"1-bit":[[0,0,0],[255,255,255]],"2-bit":[[0,0,0],[85,85,85],[170,170,170],[255,255,255]],"3-bit":[[0,0,0],[255,0,0],[0,255,0],[255,255,0],[0,0,255],[255,0,255],[0,255,255],[255,255,255]],gameboy:[[15,56,15],[48,98,48],[139,172,15],[155,188,15]],nes:[[124,124,124],[0,0,252],[0,0,188],[68,40,188],[148,0,132],[168,0,32],[168,16,0],[136,20,0],[80,48,0],[0,120,0],[0,104,0],[0,88,0],[0,64,88],[0,0,0],[248,248,248],[255,255,255]],pastel:[[255,192,203],[230,230,250],[173,216,230],[152,255,152],[255,255,224],[255,218,185]],c64:[[0,0,0],[255,255,255],[136,0,0],[170,255,238],[204,68,204],[0,204,85],[0,0,170],[238,238,119],[221,136,85],[102,68,0],[255,119,119],[51,51,51],[119,119,119],[170,255,102],[0,136,255],[187,187,187]],pico8:[[0,0,0],[29,43,83],[126,37,83],[0,135,81],[171,82,54],[95,87,79],[194,195,199],[255,241,232],[255,0,77],[255,163,0],[255,236,39],[0,228,54],[41,173,255],[131,118,156],[255,119,168],[255,204,170]],cga:[[0,0,0],[0,170,170],[170,0,170],[170,170,170],[85,255,255],[255,85,255]],gruvbox:[[40,40,40],[204,36,29],[152,151,26],[215,153,33],[69,133,136],[177,98,134],[104,157,106],[168,153,132],[146,131,116],[251,73,52],[184,187,38],[250,189,47],[131,165,152],[211,134,155],[142,192,124],[235,219,178]]},we=I({type:`quantise`,name:`QUANTISE`,category:`COLOUR / TONE`,params:{mode:{value:`palette`,type:`select`,options:[`palette`,`posterise`],label:`MODE`,tier:3},palette:{value:`1-bit`,type:`select`,options:Object.keys(Ce),label:`PALETTE`,tier:3,when:{param:`mode`,equals:`palette`}},ditherMode:{value:`none`,type:`select`,options:[`none`,`floyd-steinberg`,`bayer`],label:`DITHER MODE`,tier:4,when:{param:`mode`,equals:`palette`}},ditherStrength:{value:1,min:0,max:2,step:.05,label:`STRENGTH`,tier:4,driveable:!0,unit:`n`,when:{param:`ditherMode`,notEquals:`none`}},posteriseSpace:{value:`rgb`,type:`select`,options:[`rgb`,`hsl`],label:`COLOUR SPACE`,tier:3,when:{param:`mode`,equals:`posterise`}},rLevels:{value:4,min:2,max:32,step:1,label:`R LEVELS`,tier:4,driveable:!0,unit:`steps`,when:{param:`posteriseSpace`,equals:`rgb`}},gLevels:{value:4,min:2,max:32,step:1,label:`G LEVELS`,tier:4,driveable:!0,unit:`steps`,when:{param:`posteriseSpace`,equals:`rgb`}},bLevels:{value:4,min:2,max:32,step:1,label:`B LEVELS`,tier:4,driveable:!0,unit:`steps`,when:{param:`posteriseSpace`,equals:`rgb`}},hLevels:{value:4,min:2,max:32,step:1,label:`H LEVELS`,tier:4,driveable:!0,unit:`steps`,when:{param:`posteriseSpace`,equals:`hsl`}},sLevels:{value:4,min:2,max:32,step:1,label:`S LEVELS`,tier:4,driveable:!0,unit:`steps`,when:{param:`posteriseSpace`,equals:`hsl`}},lLevels:{value:4,min:2,max:32,step:1,label:`L LEVELS`,tier:4,driveable:!0,unit:`steps`,when:{param:`posteriseSpace`,equals:`hsl`}}},apply(e,t,n,r,i,a,o){if(i.mode===`posterise`){i.posteriseSpace===`hsl`?t.set(ve(e,n,r,i.hLevels,i.sLevels,i.lLevels)):t.set(ge(e,n,r,i.rLevels,i.gLevels,i.bLevels));return}let s=me(e,n,r,Ce[i.palette]??Ce[`1-bit`]);i.ditherMode===`bayer`?s=fe(s,n,r,2,i.ditherStrength):i.ditherMode===`floyd-steinberg`&&(s=pe(s,n,r,2,i.ditherStrength)),t.set(s)}}),Te={uniforms:{uMode:`i32`},multiPass:!1},Ee={all:0,luminosity:1,hue:2},De=I({type:`invert`,name:`INVERT`,category:`COLOUR / TONE`,isLUT:!1,params:{mode:{type:`select`,label:`MODE`,options:[`all`,`luminosity`,`hue`],value:`all`}},apply(e,t,n,r,i){t.set(ae(e,n,r,i.mode))},wgsl:`
// ── Uniform block ────────────────────────────────────────────────────────────
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uMode   : f32,  // 0=all, 1=luminosity, 2=hue
  _pad    : f32,
}

@group(0) @binding(0) var<uniform>           uni  : Uniforms;
@group(0) @binding(1) var                   tIn  : texture_2d<f32>;
@group(0) @binding(2) var                   tOut : texture_storage_2d<rgba8unorm, write>;

// ── RGB ↔ HSL helpers ───────────────────────────────────────────────────────
fn rgb2hsl(c: vec3f) -> vec3f {
  let mx = max(c.r, max(c.g, c.b));
  let mn = min(c.r, min(c.g, c.b));
  let d  = mx - mn;
  var l  = (mx + mn) * 0.5;
  var s  = select(0.0, d / (1.0 - abs(2.0 * l - 1.0)), d > 0.0);
  var h  = 0.0;
  if (d > 0.0) {
    if (mx == c.r)      { h = ((c.g - c.b) / d % 6.0); }
    else if (mx == c.g) { h = (c.b - c.r) / d + 2.0; }
    else                { h = (c.r - c.g) / d + 4.0; }
    h = h / 6.0;
    if (h < 0.0) { h = h + 1.0; }
  }
  return vec3f(h, s, l);
}

fn hue2rgb(p: f32, q: f32, t_in: f32) -> f32 {
  var t = t_in;
  if (t < 0.0) { t += 1.0; }
  if (t > 1.0) { t -= 1.0; }
  if (t < 1.0/6.0) { return p + (q - p) * 6.0 * t; }
  if (t < 1.0/2.0) { return q; }
  if (t < 2.0/3.0) { return p + (q - p) * (2.0/3.0 - t) * 6.0; }
  return p;
}

fn hsl2rgb(hsl: vec3f) -> vec3f {
  let h = hsl.x; let s = hsl.y; let l = hsl.z;
  if (s == 0.0) { return vec3f(l); }
  let q = select(l + s - l * s, l * (1.0 + s), l < 0.5);
  let p = 2.0 * l - q;
  return vec3f(
    hue2rgb(p, q, h + 1.0/3.0),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1.0/3.0),
  );
}

// ── Main compute entry ───────────────────────────────────────────────────────
@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px   = textureLoad(tIn, vec2i(x, y), 0);
  let mode = i32(uni.uMode);
  var out  : vec4f;

  if (mode == 0) {
    // all — invert RGB, keep alpha
    out = vec4f(1.0 - px.r, 1.0 - px.g, 1.0 - px.b, px.a);
  } else if (mode == 1) {
    // luminosity — invert HSL lightness
    let hsl = rgb2hsl(px.rgb);
    let inv = vec3f(hsl.x, hsl.y, 1.0 - hsl.z);
    out = vec4f(hsl2rgb(inv), px.a);
  } else {
    // hue — rotate hue 180°
    let hsl = rgb2hsl(px.rgb);
    let inv = vec3f(fract(hsl.x + 0.5), hsl.y, hsl.z);
    out = vec4f(hsl2rgb(inv), px.a);
  }

  textureStore(tOut, vec2i(x, y), out);
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uMode;

in  vec2 vUV;
out vec4 fragColor;

vec3 rgb2hsl(vec3 c) {
  float mx = max(c.r, max(c.g, c.b));
  float mn = min(c.r, min(c.g, c.b));
  float d  = mx - mn;
  float l  = (mx + mn) * 0.5;
  float s  = (d > 0.0) ? d / (1.0 - abs(2.0 * l - 1.0)) : 0.0;
  float h  = 0.0;
  if (d > 0.0) {
    if (mx == c.r)       h = mod((c.g - c.b) / d, 6.0);
    else if (mx == c.g)  h = (c.b - c.r) / d + 2.0;
    else                 h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
    if (h < 0.0) h += 1.0;
  }
  return vec3(h, s, l);
}

float hue2rgb(float p, float q, float t) {
  float tt = t;
  if (tt < 0.0) tt += 1.0;
  if (tt > 1.0) tt -= 1.0;
  if (tt < 1.0/6.0) return p + (q - p) * 6.0 * tt;
  if (tt < 0.5)     return q;
  if (tt < 2.0/3.0) return p + (q - p) * (2.0/3.0 - tt) * 6.0;
  return p;
}

vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x, s = hsl.y, l = hsl.z;
  if (s == 0.0) return vec3(l);
  float q = (l < 0.5) ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  return vec3(hue2rgb(p,q,h+1.0/3.0), hue2rgb(p,q,h), hue2rgb(p,q,h-1.0/3.0));
}

void main() {
  vec4 px = texture(uTex, vUV);
  if (uMode == 0) {
    fragColor = vec4(1.0 - px.rgb, px.a);
  } else if (uMode == 1) {
    vec3 hsl = rgb2hsl(px.rgb);
    fragColor = vec4(hsl2rgb(vec3(hsl.x, hsl.y, 1.0 - hsl.z)), px.a);
  } else {
    vec3 hsl = rgb2hsl(px.rgb);
    fragColor = vec4(hsl2rgb(vec3(fract(hsl.x + 0.5), hsl.y, hsl.z)), px.a);
  }
}
`,gpuBindings:{...Te,uniformMap:e=>({uMode:Ee[e.mode]??0})}}),Oe=I({type:`hsladjust`,name:`HSL ADJUST`,category:`COLOUR / TONE`,params:{hue:{value:0,min:-180,max:180,step:1,label:`HUE`,tier:3,driveable:!0,unit:`deg`},saturation:{value:1,min:0,max:3,step:.01,label:`SATURATION`,tier:3,driveable:!0,unit:`n`},lightness:{value:0,min:-1,max:1,step:.01,label:`LIGHTNESS`,tier:4,driveable:!0,unit:`n`}},apply(e,t,n,r,i){t.set(ue(e,n,r,i.hue,i.saturation,i.lightness))},wgsl:`
struct Uniforms {
  uWidth       : f32,
  uHeight      : f32,
  uHue         : f32,
  uSaturation  : f32,
  uLightness   : f32,
  _pad         : f32,
  _pad2        : f32,
  _pad3        : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn rgb2hsl(c: vec3f) -> vec3f {
  let mx = max(c.r, max(c.g, c.b));
  let mn = min(c.r, min(c.g, c.b));
  let d  = mx - mn;
  let l  = (mx + mn) * 0.5;
  var s  = select(0.0, d / (1.0 - abs(2.0 * l - 1.0)), d > 0.0);
  var h  = 0.0;
  if (d > 0.0) {
    if (mx == c.r)      { h = ((c.g - c.b) / d % 6.0); }
    else if (mx == c.g) { h = (c.b - c.r) / d + 2.0; }
    else                { h = (c.r - c.g) / d + 4.0; }
    h /= 6.0;
    if (h < 0.0) { h += 1.0; }
  }
  return vec3f(h, s, l);
}

fn hue2rgb(p: f32, q: f32, t_in: f32) -> f32 {
  var t = t_in;
  if (t < 0.0) { t += 1.0; }
  if (t > 1.0) { t -= 1.0; }
  if (t < 1.0/6.0) { return p + (q - p) * 6.0 * t; }
  if (t < 0.5)     { return q; }
  if (t < 2.0/3.0) { return p + (q - p) * (2.0/3.0 - t) * 6.0; }
  return p;
}

fn hsl2rgb(hsl: vec3f) -> vec3f {
  let h = hsl.x; let s = hsl.y; let l = hsl.z;
  if (s == 0.0) { return vec3f(l); }
  let q = select(l + s - l * s, l * (1.0 + s), l < 0.5);
  let p = 2.0 * l - q;
  return vec3f(
    hue2rgb(p, q, h + 1.0/3.0),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1.0/3.0),
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px  = textureLoad(tIn, vec2i(x, y), 0);
  var hsl = rgb2hsl(px.rgb);
  hsl.x = fract(hsl.x + uni.uHue / 360.0);
  hsl.y = clamp(hsl.y * uni.uSaturation, 0.0, 1.0);
  hsl.z = clamp(hsl.z + uni.uLightness, 0.0, 1.0);
  textureStore(tOut, vec2i(x, y), vec4f(hsl2rgb(hsl), px.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uHue;
uniform float uSaturation;
uniform float uLightness;

in  vec2 vUV;
out vec4 fragColor;

vec3 rgb2hsl(vec3 c) {
  float mx = max(c.r, max(c.g, c.b));
  float mn = min(c.r, min(c.g, c.b));
  float d  = mx - mn;
  float l  = (mx + mn) * 0.5;
  float s  = (d > 0.0) ? d / (1.0 - abs(2.0 * l - 1.0)) : 0.0;
  float h  = 0.0;
  if (d > 0.0) {
    if (mx == c.r)       h = mod((c.g - c.b) / d, 6.0);
    else if (mx == c.g)  h = (c.b - c.r) / d + 2.0;
    else                 h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
    if (h < 0.0) h += 1.0;
  }
  return vec3(h, s, l);
}

float hue2rgb(float p, float q, float t) {
  float tt = t;
  if (tt < 0.0) tt += 1.0;
  if (tt > 1.0) tt -= 1.0;
  if (tt < 1.0/6.0) return p + (q - p) * 6.0 * tt;
  if (tt < 0.5)     return q;
  if (tt < 2.0/3.0) return p + (q - p) * (2.0/3.0 - tt) * 6.0;
  return p;
}

vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x, s = hsl.y, l = hsl.z;
  if (s == 0.0) return vec3(l);
  float q = (l < 0.5) ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  return vec3(hue2rgb(p,q,h+1.0/3.0), hue2rgb(p,q,h), hue2rgb(p,q,h-1.0/3.0));
}

void main() {
  vec4  px  = texture(uTex, vUV);
  vec3  hsl = rgb2hsl(px.rgb);
  hsl.x = fract(hsl.x + uHue / 360.0);
  hsl.y = clamp(hsl.y * uSaturation, 0.0, 1.0);
  hsl.z = clamp(hsl.z + uLightness,  0.0, 1.0);
  fragColor = vec4(hsl2rgb(hsl), px.a);
}
`,gpuBindings:{uniforms:{uHue:`f32`,uSaturation:`f32`,uLightness:`f32`},multiPass:!1,uniformMap:e=>({uHue:e.hue,uSaturation:e.saturation,uLightness:e.lightness})}}),ke=I({type:`channelmixer`,name:`CHANNEL MIXER`,category:`COLOUR / TONE`,params:{rr:{value:1,min:-2,max:2,step:.01,label:`R→R`,tier:3,driveable:!0,unit:`n`},rg:{value:0,min:-2,max:2,step:.01,label:`G→R`,tier:3,driveable:!0,unit:`n`},rb:{value:0,min:-2,max:2,step:.01,label:`B→R`,tier:3,driveable:!0,unit:`n`},gr:{value:0,min:-2,max:2,step:.01,label:`R→G`,tier:4,driveable:!0,unit:`n`},gg:{value:1,min:-2,max:2,step:.01,label:`G→G`,tier:4,driveable:!0,unit:`n`},gb:{value:0,min:-2,max:2,step:.01,label:`B→G`,tier:4,driveable:!0,unit:`n`},br:{value:0,min:-2,max:2,step:.01,label:`R→B`,tier:5,driveable:!0,unit:`n`},bg:{value:0,min:-2,max:2,step:.01,label:`G→B`,tier:5,driveable:!0,unit:`n`},bb:{value:1,min:-2,max:2,step:.01,label:`B→B`,tier:5,driveable:!0,unit:`n`}},apply(e,t,n,r,i,a,o){t.set(H(e,n,r,i))},wgsl:`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uRr     : f32,
  uRg     : f32,
  uRb     : f32,
  uGr     : f32,
  uGg     : f32,
  uGb     : f32,
  uBr     : f32,
  uBg     : f32,
  uBb     : f32,
  _pad    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let r  = px.r; let g = px.g; let b = px.b;
  textureStore(tOut, vec2i(x, y), vec4f(
    clamp(uni.uRr * r + uni.uRg * g + uni.uRb * b, 0.0, 1.0),
    clamp(uni.uGr * r + uni.uGg * g + uni.uGb * b, 0.0, 1.0),
    clamp(uni.uBr * r + uni.uBg * g + uni.uBb * b, 0.0, 1.0),
    px.a,
  ));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uRr; uniform float uRg; uniform float uRb;
uniform float uGr; uniform float uGg; uniform float uGb;
uniform float uBr; uniform float uBg; uniform float uBb;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4  px = texture(uTex, vUV);
  float r = px.r, g = px.g, b = px.b;
  fragColor = vec4(
    clamp(uRr * r + uRg * g + uRb * b, 0.0, 1.0),
    clamp(uGr * r + uGg * g + uGb * b, 0.0, 1.0),
    clamp(uBr * r + uBg * g + uBb * b, 0.0, 1.0),
    px.a
  );
}
`,gpuBindings:{uniforms:{uRr:`f32`,uRg:`f32`,uRb:`f32`,uGr:`f32`,uGg:`f32`,uGb:`f32`,uBr:`f32`,uBg:`f32`,uBb:`f32`},multiPass:!1,uniformMap:e=>({uRr:e.rr,uRg:e.rg,uRb:e.rb,uGr:e.gr,uGg:e.gg,uGb:e.gb,uBr:e.br,uBg:e.bg,uBb:e.bb})}}),Ae=I({type:`colourbalance`,name:`COLOUR BALANCE`,category:`COLOUR / TONE`,params:{shadowR:{value:0,min:-100,max:100,step:1,label:`SHADOW R`,tier:3,driveable:!0,unit:`%`},shadowG:{value:0,min:-100,max:100,step:1,label:`SHADOW G`,tier:3,driveable:!0,unit:`%`},shadowB:{value:0,min:-100,max:100,step:1,label:`SHADOW B`,tier:3,driveable:!0,unit:`%`},midR:{value:0,min:-100,max:100,step:1,label:`MID R`,tier:4,driveable:!0,unit:`%`},midG:{value:0,min:-100,max:100,step:1,label:`MID G`,tier:4,driveable:!0,unit:`%`},midB:{value:0,min:-100,max:100,step:1,label:`MID B`,tier:4,driveable:!0,unit:`%`},highR:{value:0,min:-100,max:100,step:1,label:`HIGH R`,tier:5,driveable:!0,unit:`%`},highG:{value:0,min:-100,max:100,step:1,label:`HIGH G`,tier:5,driveable:!0,unit:`%`},highB:{value:0,min:-100,max:100,step:1,label:`HIGH B`,tier:5,driveable:!0,unit:`%`}},apply(e,t,n,r,i){t.set(ne(e,n,r,i))},wgsl:`
struct Uniforms {
  uWidth   : f32,
  uHeight  : f32,
  uShadowR : f32,
  uShadowG : f32,
  uShadowB : f32,
  uMidR    : f32,
  uMidG    : f32,
  uMidB    : f32,
  uHighR   : f32,
  uHighG   : f32,
  uHighB   : f32,
  _pad     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px  = textureLoad(tIn, vec2i(x, y), 0);
  let lum = dot(px.rgb, vec3f(0.299, 0.587, 0.114));

  // Zone weights: shadow peaks at 0, highlight peaks at 1
  let sw = max(0.0, 1.0 - lum * 2.0);
  let hw = max(0.0, lum * 2.0 - 1.0);
  let mw = 1.0 - sw - hw;

  let scale = 1.0 / 100.0;
  let adj = vec3f(
    uni.uShadowR * sw + uni.uMidR * mw + uni.uHighR * hw,
    uni.uShadowG * sw + uni.uMidG * mw + uni.uHighG * hw,
    uni.uShadowB * sw + uni.uMidB * mw + uni.uHighB * hw,
  ) * scale;

  textureStore(tOut, vec2i(x, y), vec4f(clamp(px.rgb + adj, vec3f(0.0), vec3f(1.0)), px.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uShadowR; uniform float uShadowG; uniform float uShadowB;
uniform float uMidR;    uniform float uMidG;    uniform float uMidB;
uniform float uHighR;   uniform float uHighG;   uniform float uHighB;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4  px  = texture(uTex, vUV);
  float lum = dot(px.rgb, vec3(0.299, 0.587, 0.114));
  float sw  = max(0.0, 1.0 - lum * 2.0);
  float hw  = max(0.0, lum * 2.0 - 1.0);
  float mw  = 1.0 - sw - hw;
  vec3  adj = vec3(
    uShadowR * sw + uMidR * mw + uHighR * hw,
    uShadowG * sw + uMidG * mw + uHighG * hw,
    uShadowB * sw + uMidB * mw + uHighB * hw
  ) / 100.0;
  fragColor = vec4(clamp(px.rgb + adj, vec3(0.0), vec3(1.0)), px.a);
}
`,gpuBindings:{uniforms:{uShadowR:`f32`,uShadowG:`f32`,uShadowB:`f32`,uMidR:`f32`,uMidG:`f32`,uMidB:`f32`,uHighR:`f32`,uHighG:`f32`,uHighB:`f32`},multiPass:!1,uniformMap:e=>({uShadowR:e.shadowR,uShadowG:e.shadowG,uShadowB:e.shadowB,uMidR:e.midR,uMidG:e.midG,uMidB:e.midB,uHighR:e.highR,uHighG:e.highG,uHighB:e.highB})}}),je=I({type:`gradientmap`,name:`GRADIENT MAP`,category:`COLOUR / TONE`,params:{darkR:{value:0,min:0,max:255,step:1,label:`DARK R`,tier:3,driveable:!0,unit:`lvl`},darkG:{value:0,min:0,max:255,step:1,label:`DARK G`,tier:3,driveable:!0,unit:`lvl`},darkB:{value:30,min:0,max:255,step:1,label:`DARK B`,tier:3,driveable:!0,unit:`lvl`},lightR:{value:255,min:0,max:255,step:1,label:`LIGHT R`,tier:4,driveable:!0,unit:`lvl`},lightG:{value:200,min:0,max:255,step:1,label:`LIGHT G`,tier:4,driveable:!0,unit:`lvl`},lightB:{value:150,min:0,max:255,step:1,label:`LIGHT B`,tier:4,driveable:!0,unit:`lvl`}},apply(e,t,n,r,i,a,o){let s=o?this.getModulated(`darkR`,0,a):i.darkR,c=o?this.getModulated(`darkG`,0,a):i.darkG,l=o?this.getModulated(`darkB`,0,a):i.darkB,u=o?this.getModulated(`lightR`,0,a):i.lightR,d=o?this.getModulated(`lightG`,0,a):i.lightG,f=o?this.getModulated(`lightB`,0,a):i.lightB,p=[[s,c,l],[u,d,f]];t.set(ye(e,n,r,p))},wgsl:`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uDarkR  : f32,
  uDarkG  : f32,
  uDarkB  : f32,
  uLightR : f32,
  uLightG : f32,
  uLightB : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px  = textureLoad(tIn, vec2i(x, y), 0);
  let lum = dot(px.rgb, vec3f(0.299, 0.587, 0.114));
  let dark  = vec3f(uni.uDarkR,  uni.uDarkG,  uni.uDarkB)  / 255.0;
  let light = vec3f(uni.uLightR, uni.uLightG, uni.uLightB) / 255.0;
  textureStore(tOut, vec2i(x, y), vec4f(mix(dark, light, lum), px.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uDarkR; uniform float uDarkG; uniform float uDarkB;
uniform float uLightR; uniform float uLightG; uniform float uLightB;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4 px   = texture(uTex, vUV);
  float lum = dot(px.rgb, vec3(0.299, 0.587, 0.114));
  vec3 dark  = vec3(uDarkR, uDarkG, uDarkB) / 255.0;
  vec3 light = vec3(uLightR, uLightG, uLightB) / 255.0;
  fragColor = vec4(mix(dark, light, lum), px.a);
}
`,gpuBindings:{uniforms:{uDarkR:`f32`,uDarkG:`f32`,uDarkB:`f32`,uLightR:`f32`,uLightG:`f32`,uLightB:`f32`},multiPass:!1,uniformMap:e=>({uDarkR:e.darkR,uDarkG:e.darkG,uDarkB:e.darkB,uLightR:e.lightR,uLightG:e.lightG,uLightB:e.lightB})}}),Me=I({type:`temptint`,name:`TEMP / TINT`,category:`COLOUR / TONE`,isLUT:!0,params:{temperature:{value:0,min:-100,max:100,step:1,label:`TEMPERATURE`,tier:3,driveable:!0,unit:`%`},tint:{value:0,min:-100,max:100,step:1,label:`TINT`,tier:3,driveable:!0,unit:`%`}},apply(e,t,n,r,i){t.set(W(e,n,r,i.temperature,i.tint))},wgsl:`
struct Uniforms {
  uWidth       : f32,
  uHeight      : f32,
  uTemperature : f32,
  uTint        : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  // Temperature: warm = +R -B, cool = -R +B
  let t  = uni.uTemperature / 100.0 * 0.1;
  // Tint: magenta = +R +B -G, green = -R -B +G
  let ti = uni.uTint / 100.0 * 0.1;
  let r  = clamp(px.r + t + ti,      0.0, 1.0);
  let g  = clamp(px.g - ti,          0.0, 1.0);
  let b  = clamp(px.b - t + ti,      0.0, 1.0);
  textureStore(tOut, vec2i(x, y), vec4f(r, g, b, px.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uTemperature;
uniform float uTint;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4  px = texture(uTex, vUV);
  float t  = uTemperature / 100.0 * 0.1;
  float ti = uTint        / 100.0 * 0.1;
  fragColor = vec4(
    clamp(px.r + t + ti, 0.0, 1.0),
    clamp(px.g - ti,     0.0, 1.0),
    clamp(px.b - t + ti, 0.0, 1.0),
    px.a
  );
}
`,gpuBindings:{uniforms:{uTemperature:`f32`,uTint:`f32`},multiPass:!1,uniformMap:e=>({uTemperature:e.temperature,uTint:e.tint})}}),Ne=I({type:`curves`,name:`CURVES`,category:`COLOUR / TONE`,isLUT:!0,params:{shadowIn:{value:0,min:0,max:255,step:1,label:`SHADOW IN`,tier:3,driveable:!0,unit:`lvl`},shadowOut:{value:0,min:0,max:255,step:1,label:`SHADOW OUT`,tier:3,driveable:!0,unit:`lvl`},midIn:{value:128,min:0,max:255,step:1,label:`MID IN`,tier:3,driveable:!0,unit:`lvl`},midOut:{value:128,min:0,max:255,step:1,label:`MID OUT`,tier:3,driveable:!0,unit:`lvl`},highIn:{value:255,min:0,max:255,step:1,label:`HIGH IN`,tier:4,driveable:!0,unit:`lvl`},highOut:{value:255,min:0,max:255,step:1,label:`HIGH OUT`,tier:4,driveable:!0,unit:`lvl`}},apply(e,t,n,r,i){let a=ce(i.shadowIn,i.shadowOut,i.midIn,i.midOut,i.highIn,i.highOut);t.set(le(e,n,r,a))},wgsl:`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uShadowIn  : f32,
  uShadowOut : f32,
  uMidIn     : f32,
  uMidOut    : f32,
  uHighIn    : f32,
  uHighOut   : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn curvesLUT(c: f32, si: f32, so: f32, mi: f32, mo: f32, hi: f32, ho: f32) -> f32 {
  // Piecewise linear through (si,so) → (mi,mo) → (hi,ho)
  if (c <= mi) {
    let t = select(0.0, (c - si) / max(mi - si, 0.001), mi > si);
    return clamp(so + t * (mo - so), 0.0, 1.0);
  } else {
    let t = select(1.0, (c - mi) / max(hi - mi, 0.001), hi > mi);
    return clamp(mo + t * (ho - mo), 0.0, 1.0);
  }
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let si = uni.uShadowIn  / 255.0;
  let so = uni.uShadowOut / 255.0;
  let mi = uni.uMidIn     / 255.0;
  let mo = uni.uMidOut    / 255.0;
  let hi = uni.uHighIn    / 255.0;
  let ho = uni.uHighOut   / 255.0;
  textureStore(tOut, vec2i(x, y), vec4f(
    curvesLUT(px.r, si, so, mi, mo, hi, ho),
    curvesLUT(px.g, si, so, mi, mo, hi, ho),
    curvesLUT(px.b, si, so, mi, mo, hi, ho),
    px.a,
  ));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uShadowIn;
uniform float uShadowOut;
uniform float uMidIn;
uniform float uMidOut;
uniform float uHighIn;
uniform float uHighOut;

in  vec2 vUV;
out vec4 fragColor;

float curvesLUT(float c, float si, float so, float mi, float mo, float hi, float ho) {
  if (c <= mi) {
    float t = (mi > si) ? (c - si) / max(mi - si, 0.001) : 0.0;
    return clamp(so + t * (mo - so), 0.0, 1.0);
  } else {
    float t = (hi > mi) ? (c - mi) / max(hi - mi, 0.001) : 1.0;
    return clamp(mo + t * (ho - mo), 0.0, 1.0);
  }
}

void main() {
  vec4  px = texture(uTex, vUV);
  float si = uShadowIn  / 255.0;
  float so = uShadowOut / 255.0;
  float mi = uMidIn     / 255.0;
  float mo = uMidOut    / 255.0;
  float hi = uHighIn    / 255.0;
  float ho = uHighOut   / 255.0;
  fragColor = vec4(
    curvesLUT(px.r, si, so, mi, mo, hi, ho),
    curvesLUT(px.g, si, so, mi, mo, hi, ho),
    curvesLUT(px.b, si, so, mi, mo, hi, ho),
    px.a
  );
}
`,gpuBindings:{uniforms:{uShadowIn:`f32`,uShadowOut:`f32`,uMidIn:`f32`,uMidOut:`f32`,uHighIn:`f32`,uHighOut:`f32`},multiPass:!1,uniformMap:e=>({uShadowIn:e.shadowIn,uShadowOut:e.shadowOut,uMidIn:e.midIn,uMidOut:e.midOut,uHighIn:e.highIn,uHighOut:e.highOut})}}),Pe=I({type:`histogrameq`,name:`HISTOGRAM EQ`,category:`COLOUR / TONE`,params:{strength:{value:1,min:0,max:1,step:.01,label:`STRENGTH`,tier:3,driveable:!0,unit:`0–1`}},apply(e,t,n,r,i){t.set(B(e,n,r,i.strength))},wgsl:`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uStrength : f32,
  uPass     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const WINDOW : i32 = 64;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3u) {
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  let x = i32(gid.x);
  let y = i32(gid.y);
  if (x >= w || y >= h) { return; }

  if (uni.uPass < 0.5) {
    // Pass 0: horizontal window min/max luminance scan
    // Store: r=orig_r, g=orig_g, b=orig_b, a=min_lum (packed 0..1)
    // Also need max_lum — encode in b channel as min in b, max in reserved 4th.
    // Simpler: store min in rg.r and max in rg.g, original lum in b, alpha from source
    var minL = 1.0;
    var maxL = 0.0;
    let half = WINDOW / 2;
    for (var dx = -half; dx <= half; dx++) {
      let sx = clamp(x + dx, 0, w - 1);
      let c  = textureLoad(tIn, vec2i(sx, y), 0);
      let L  = dot(c.rgb, vec3f(0.299, 0.587, 0.114));
      minL   = min(minL, L);
      maxL   = max(maxL, L);
    }
    let orig = textureLoad(tIn, vec2i(x, y), 0);
    // Pack min into r, max into g, original lum into b, alpha into a
    let origLum = dot(orig.rgb, vec3f(0.299, 0.587, 0.114));
    textureStore(tOut, vec2i(x, y), vec4f(minL, maxL, origLum, orig.a));
  } else {
    // Pass 1: tIn = {minL, maxL, origLum, a} from Pass 0
    // Vertical window min/max scan of minL/maxL channels from tIn
    var minL = 1.0;
    var maxL = 0.0;
    let half = WINDOW / 2;
    for (var dy = -half; dy <= half; dy++) {
      let sy = clamp(y + dy, 0, h - 1);
      let c  = textureLoad(tIn, vec2i(x, sy), 0);
      minL   = min(minL, c.r);
      maxL   = max(maxL, c.g);
    }
    let pxData  = textureLoad(tIn, vec2i(x, y), 0);
    let origLum = pxData.b;
    let a       = pxData.a;

    let range   = max(maxL - minL, 0.001);
    let eqLum   = (origLum - minL) / range;
    let outLum  = mix(origLum, eqLum, uni.uStrength);

    // Remap all channels proportionally
    let scale = select(outLum / max(origLum, 0.001), 1.0, origLum < 0.001);
    // We don't have original RGB here — output greyscale from equalised lum.
    textureStore(tOut, vec2i(x, y), vec4f(vec3f(outLum), a));
  }
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform float     uStrength;
uniform int       uPass;

in  vec2 vUV;
out vec4 fragColor;

const int WINDOW = 64;

float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  vec2 ts = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));

  if (uPass == 0) {
    // Horizontal scan: store (minL, maxL, origLum, a)
    float minL = 1.0, maxL = 0.0;
    for (int dx = -WINDOW/2; dx <= WINDOW/2; dx++) {
      vec2 uv = clamp(vUV + vec2(float(dx) * ts.x, 0.0), vec2(0.0), vec2(1.0));
      float L = lum(texture(uTex, uv).rgb);
      minL = min(minL, L);
      maxL = max(maxL, L);
    }
    vec4 orig    = texture(uTex, vUV);
    float origL  = lum(orig.rgb);
    fragColor = vec4(minL, maxL, origL, orig.a);
  } else {
    // Vertical scan + remap
    float minL = 1.0, maxL = 0.0;
    for (int dy = -WINDOW/2; dy <= WINDOW/2; dy++) {
      vec2 uv = clamp(vUV + vec2(0.0, float(dy) * ts.y), vec2(0.0), vec2(1.0));
      vec4 s  = texture(uTex, uv);
      minL = min(minL, s.r);
      maxL = max(maxL, s.g);
    }
    vec4  pxData = texture(uTex, vUV);
    float origL  = pxData.b;
    float a      = pxData.a;
    float range  = max(maxL - minL, 0.001);
    float eqLum  = (origL - minL) / range;
    float outLum = mix(origL, eqLum, uStrength);
    fragColor = vec4(vec3(outLum), a);
  }
}
`,gpuBindings:{uniforms:{uStrength:`f32`},multiPass:!0,passes:2,uniformMap:e=>({uStrength:e.strength})}}),Fe=I({type:`clahe`,name:`CLAHE`,category:`COLOUR / TONE`,params:{tileSize:{value:32,min:8,max:64,step:8,label:`TILE SIZE`,tier:3,previewMax:32,driveable:!0,unit:`px`},clipLimit:{value:3,min:1,max:10,step:.5,label:`CLIP LIMIT`,tier:3,driveable:!0,unit:`n`}},apply(e,t,n,r,i){t.set(V(e,n,r,i.tileSize,i.clipLimit))}});function Ie(e,t){let n=Math.max(1e-6,e),r=t==null?Math.ceil(n*3):t|0,i=new Float32Array(r*2+1),a=0,o=2*n*n;for(let e=-r;e<=r;e++){let t=Math.exp(-(e*e)/o);i[e+r]=t,a+=t}let s=1/a;for(let e=0;e<i.length;e++)i[e]*=s;return{kernel:i,radius:r}}function J(e,t){return e<0?0:e>=t?t-1:e}function Le(e,t,n,r,i){let a=2*i+1;for(let o=0;o<r;o++){let r=0,s=0,c=0,l=0;for(let t=-i;t<=i;t++){let i=J(t,n),a=(o*n+i)*4;r+=e[a],s+=e[a+1],c+=e[a+2],l+=e[a+3]}for(let u=0;u<n;u++){let d=(o*n+u)*4;t[d]=r/a,t[d+1]=s/a,t[d+2]=c/a,t[d+3]=l/a;let f=J(u+i+1,n),p=J(u-i,n),m=(o*n+f)*4,h=(o*n+p)*4;r+=e[m]-e[h],s+=e[m+1]-e[h+1],c+=e[m+2]-e[h+2],l+=e[m+3]-e[h+3]}}}function Re(e,t,n,r,i){let a=2*i+1;for(let o=0;o<n;o++){let s=0,c=0,l=0,u=0;for(let t=-i;t<=i;t++){let i=(J(t,r)*n+o)*4;s+=e[i],c+=e[i+1],l+=e[i+2],u+=e[i+3]}for(let d=0;d<r;d++){let f=(d*n+o)*4;t[f]=s/a,t[f+1]=c/a,t[f+2]=l/a,t[f+3]=u/a;let p=J(d+i+1,r),m=J(d-i,r),h=(p*n+o)*4,g=(m*n+o)*4;s+=e[h]-e[g],c+=e[h+1]-e[g+1],l+=e[h+2]-e[g+2],u+=e[h+3]-e[g+3]}}}function ze(e,t,n,r=3,i=1){let a=new Uint8ClampedArray(e),o=new Uint8ClampedArray(e.length);for(let e=0;e<i;e++)Le(a,o,t,n,r),Re(o,a,t,n,r);return a}function Be(e,t){let{kernel:n}=Ie(e,t);return n}function Ve(e,t,n,r,i,a){for(let o=0;o<r;o++)for(let r=0;r<n;r++){let s=0,c=0,l=0,u=0;for(let t=-a;t<=a;t++){let d=J(r+t,n),f=(o*n+d)*4,p=i[t+a];s+=e[f]*p,c+=e[f+1]*p,l+=e[f+2]*p,u+=e[f+3]*p}let d=(o*n+r)*4;t[d]=s,t[d+1]=c,t[d+2]=l,t[d+3]=u}}function He(e,t,n,r,i,a){for(let o=0;o<n;o++)for(let s=0;s<r;s++){let c=0,l=0,u=0,d=0;for(let t=-a;t<=a;t++){let f=(J(s+t,r)*n+o)*4,p=i[t+a];c+=e[f]*p,l+=e[f+1]*p,u+=e[f+2]*p,d+=e[f+3]*p}let f=(s*n+o)*4;t[f]=c,t[f+1]=l,t[f+2]=u,t[f+3]=d}}function Ue(e,t,n,r=2,i=1){let a=Math.ceil(r*3),o=Be(r,a),s=new Uint8ClampedArray(e),c=new Uint8ClampedArray(e.length);for(let e=0;e<i;e++)Ve(s,c,t,n,o,a),He(c,s,t,n,o,a);return s}function We(e,t,n,r=1){let i=(2*r+1)*(2*r+1),a=i>>1,o=new Uint8Array(i),s=new Uint8ClampedArray(e.length);for(let i=0;i<n;i++)for(let c=0;c<t;c++){let l=(i*t+c)*4;for(let u=0;u<3;u++){let d=0;for(let a=-r;a<=r;a++){let s=Math.max(0,Math.min(n-1,i+a));for(let n=-r;n<=r;n++)o[d++]=e[(s*t+Math.max(0,Math.min(t-1,c+n)))*4+u]}o.subarray(0,d).sort(),s[l+u]=o[a]}s[l+3]=e[l+3]}return s}function Ge(e,t,n,r=5,i=30){let a=Math.min(Math.ceil(r*2),10),o=2*r*r,s=2*i*i,c=new Uint8ClampedArray(e.length),l=2*a+1,u=new Float32Array(l*l);for(let e=-a;e<=a;e++)for(let t=-a;t<=a;t++)u[(e+a)*l+(t+a)]=Math.exp(-(t*t+e*e)/o);let d=195076,f=new Float32Array(d);for(let e=0;e<d;e++)f[e]=Math.exp(-e/s);for(let r=0;r<n;r++)for(let i=0;i<t;i++){let o=(r*t+i)*4,s=0,d=0,p=0,m=0,h=e[o],g=e[o+1],_=e[o+2];for(let o=-a;o<=a;o++){let c=Math.max(0,Math.min(n-1,r+o));for(let n=-a;n<=a;n++){let r=Math.max(0,Math.min(t-1,i+n)),v=(c*t+r)*4,y=e[v],b=e[v+1],x=e[v+2],S=y-h,C=b-g,w=x-_,T=S*S+C*C+w*w,E=u[(o+a)*l+(n+a)]*f[T];s+=y*E,d+=b*E,p+=x*E,m+=E}}let v=1/(m||1);c[o]=Math.round(s*v),c[o+1]=Math.round(d*v),c[o+2]=Math.round(p*v),c[o+3]=e[o+3]}return c}function Ke(e,t,n,r=0,i=10,a=0){let o=r*Math.PI/180,s=Math.cos(o),c=Math.sin(o),l=a||Math.max(3,i),u=1/l,d=new Uint8ClampedArray(e.length);for(let r=0;r<n;r++)for(let a=0;a<t;a++){let o=0,f=0,p=0,m=0;for(let u=0;u<l;u++){let d=(u/(l-1)-.5)*i,h=Math.max(0,Math.min(t-1,Math.round(a+s*d))),g=(Math.max(0,Math.min(n-1,Math.round(r+c*d)))*t+h)*4;o+=e[g],f+=e[g+1],p+=e[g+2],m+=e[g+3]}let h=(r*t+a)*4;d[h]=o*u,d[h+1]=f*u,d[h+2]=p*u,d[h+3]=m*u}return d}function qe(e,t,n,r=`zoom`,i=.5,a=.5,o=10,s=12){let c=i*t,l=a*n,u=1/s,d=new Uint8ClampedArray(e.length);for(let i=0;i<n;i++)for(let a=0;a<t;a++){let f=0,p=0,m=0,h=0;for(let u=0;u<s;u++){let d=(u/(s-1)-.5)*2,g,_;if(r===`zoom`){let e=1+d*o*.002;g=c+(a-c)*e,_=l+(i-l)*e}else{let e=d*o*.002,t=a-c,n=i-l,r=Math.cos(e),s=Math.sin(e);g=c+t*r-n*s,_=l+t*s+n*r}let v=Math.max(0,Math.min(t-1,Math.round(g))),y=(Math.max(0,Math.min(n-1,Math.round(_)))*t+v)*4;f+=e[y],p+=e[y+1],m+=e[y+2],h+=e[y+3]}let g=(i*t+a)*4;d[g]=f*u,d[g+1]=p*u,d[g+2]=m*u,d[g+3]=h*u}return d}let Je=I({type:`boxblur`,name:`BOX BLUR`,category:`BLUR`,params:{radius:{value:3,min:1,max:50,step:1,label:`RADIUS`,tier:3,previewMax:10,driveable:!0,unit:`px`},passes:{value:1,min:1,max:5,step:1,label:`PASSES`,tier:4,previewMax:2,driveable:!0,unit:`×`}},apply(e,t,n,r,i){t.set(ze(e,n,r,i.radius,i.passes))},wgsl:`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uRadius : f32,  // clamp to 1..50
  uPass   : f32,  // 0 = horizontal, 1 = vertical
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// Shared tile: 64 + 2*50 = 164 slots per workgroup
var<workgroup> tile : array<vec4f, 164>;

@compute @workgroup_size(64, 1, 1)
fn main(
  @builtin(global_invocation_id) gid : vec3u,
  @builtin(local_invocation_id)  lid : vec3u,
) {
  let r  = max(1, min(50, i32(uni.uRadius)));
  let w  = i32(uni.uWidth);
  let h  = i32(uni.uHeight);
  let horizontal = uni.uPass < 0.5;

  // Primary and halo coordinates
  let lx = i32(lid.x);

  var px : i32;  // primary axis pixel index
  var py : i32;  // secondary axis pixel index
  if (horizontal) {
    px = i32(gid.x);
    py = i32(gid.y);
  } else {
    px = i32(gid.y);
    py = i32(gid.x);
  }

  // Each thread loads itself + responsibility for part of the halo
  // Simpler approach: load primary pixel + clamped neighbours into tile
  // (for workgroup 64, each thread loads one slot; halo loaded by boundary threads)
  let tileIdx = lx + r;  // offset into tile by halo width

  var coord : vec2i;
  if (horizontal) {
    coord = vec2i(clamp(px, 0, w-1), clamp(py, 0, h-1));
  } else {
    coord = vec2i(clamp(py, 0, w-1), clamp(px, 0, h-1));
  }
  tile[tileIdx] = textureLoad(tIn, coord, 0);

  // Left halo (only first r threads load)
  if (lx < u32(r)) {
    let hpos = px - r + i32(lx);
    var hcoord : vec2i;
    if (horizontal) {
      hcoord = vec2i(clamp(hpos, 0, w-1), clamp(py, 0, h-1));
    } else {
      hcoord = vec2i(clamp(py, 0, w-1), clamp(hpos, 0, h-1));
    }
    tile[lx] = textureLoad(tIn, hcoord, 0);
  }

  // Right halo (last r threads load)
  if (lx >= 64u - u32(r)) {
    let hpos = px + i32(lx) - 63 + r;
    let hIdx = lx + 2u * u32(r);
    var hcoord : vec2i;
    if (horizontal) {
      hcoord = vec2i(clamp(hpos, 0, w-1), clamp(py, 0, h-1));
    } else {
      hcoord = vec2i(clamp(py, 0, w-1), clamp(hpos, 0, h-1));
    }
    tile[hIdx] = textureLoad(tIn, hcoord, 0);
  }

  workgroupBarrier();

  // Out of bounds — do not write
  if (horizontal) {
    if (px >= w || py >= h) { return; }
  } else {
    if (px >= h || py >= w) { return; }
  }

  // Box sum from shared memory
  var sum = vec4f(0.0);
  let diam = f32(2 * r + 1);
  for (var d = -r; d <= r; d++) {
    sum += tile[tileIdx + d];
  }
  sum /= diam;

  var outCoord : vec2i;
  if (horizontal) {
    outCoord = vec2i(px, py);
  } else {
    outCoord = vec2i(py, px);
  }
  textureStore(tOut, outCoord, sum);
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform int       uRadius;
uniform int       uPass;  // 0 = horizontal, 1 = vertical

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2 texelSize = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  int r = max(1, min(50, uRadius));
  float diam = float(2 * r + 1);
  vec4 sum = vec4(0.0);

  for (int d = -r; d <= r; d++) {
    vec2 offset = (uPass == 0)
      ? vec2(float(d) * texelSize.x, 0.0)
      : vec2(0.0, float(d) * texelSize.y);
    sum += texture(uTex, clamp(vUV + offset, vec2(0.0), vec2(1.0)));
  }

  fragColor = sum / diam;
}
`,gpuBindings:{uniforms:{uRadius:`i32`},multiPass:!0,passes:2,uniformMap:e=>({uRadius:Math.round(e.radius)}),passesFromParams:e=>Math.round(e.passes)*2}}),Ye=I({type:`gaussblur`,name:`GAUSS BLUR`,category:`BLUR`,params:{sigma:{value:2,min:.1,max:30,step:.1,label:`SIGMA`,tier:3,previewMax:5,driveable:!0,unit:`σ`},passes:{value:1,min:1,max:3,step:1,label:`PASSES`,tier:4,previewMax:1,driveable:!0,unit:`n`}},apply(e,t,n,r,i,a,o){t.set(Ue(e,n,r,i.sigma,i.passes))},wgsl:`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uSigma  : f32,
  uPass   : f32,  // 0 = horizontal, 1 = vertical
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// Shared tile: 64 + 2*90 = 244 slots
var<workgroup> tile : array<vec4f, 244>;
const TILE_W : i32 = 64;

@compute @workgroup_size(64, 1)
fn main(
  @builtin(global_invocation_id) gid : vec3u,
  @builtin(local_invocation_id)  lid : vec3u,
) {
  let sigma   = max(uni.uSigma, 0.1);
  let radius  = clamp(i32(ceil(3.0 * sigma)), 1, 90);
  let halo    = radius;
  let tileLen = TILE_W + 2 * halo;

  let isHoriz = uni.uPass < 0.5;
  let x0      = i32(gid.x) - i32(lid.x);  // tile start along primary axis
  let fixed   = select(i32(gid.x), i32(gid.y), isHoriz); // secondary axis
  let w       = i32(uni.uWidth);
  let h       = i32(uni.uHeight);

  // Cooperative tile load (each thread loads one or two slots)
  let localIdx = i32(lid.x);
  for (var load = localIdx; load < tileLen; load += TILE_W) {
    let pos   = x0 + load - halo;
    let clPos = clamp(pos, 0, select(w, h, !isHoriz) - 1);
    let coord  = select(vec2i(clPos, fixed), vec2i(fixed, clPos), !isHoriz);
    if (fixed >= 0 && fixed < select(h, w, !isHoriz)) {
      tile[load] = textureLoad(tIn, coord, 0);
    } else {
      tile[load] = vec4f(0.0);
    }
  }
  workgroupBarrier();

  let globalPos = select(i32(gid.x), i32(gid.y), !isHoriz);
  let limit     = select(w, h, !isHoriz);
  if (globalPos >= limit || fixed >= select(h, w, !isHoriz)) { return; }

  var acc   = vec4f(0.0);
  var wsum  = 0.0;
  let inv2s2 = 0.5 / (sigma * sigma);

  for (var k = -radius; k <= radius; k++) {
    let gw  = exp(-f32(k * k) * inv2s2);
    let idx = localIdx + halo + k;
    acc  += tile[idx] * gw;
    wsum += gw;
  }
  acc /= wsum;

  let outCoord = select(vec2i(i32(gid.x), i32(gid.y)), vec2i(i32(gid.y), i32(gid.x)), !isHoriz);
  textureStore(tOut, outCoord, clamp(acc, vec4f(0.0), vec4f(1.0)));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uSigma;
uniform float uPass;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2  res     = vec2(textureSize(uTex, 0));
  float sigma   = max(uSigma, 0.1);
  int   radius  = clamp(int(ceil(3.0 * sigma)), 1, 90);
  float inv2s2  = 0.5 / (sigma * sigma);
  bool  isHoriz = uPass < 0.5;
  vec2  dir     = isHoriz ? vec2(1.0 / res.x, 0.0) : vec2(0.0, 1.0 / res.y);

  vec4  acc  = vec4(0.0);
  float wsum = 0.0;
  for (int k = -90; k <= 90; k++) {
    if (abs(k) > radius) continue;
    float gw  = exp(-float(k * k) * inv2s2);
    vec2  uv2 = clamp(vUV + float(k) * dir, vec2(0.0), vec2(1.0));
    acc  += texture(uTex, uv2) * gw;
    wsum += gw;
  }
  fragColor = clamp(acc / wsum, 0.0, 1.0);
}
`,gpuBindings:{uniforms:{uSigma:`f32`},multiPass:!0,passes:2,passesFromParams:e=>Math.round(e.passes)*2,uniformMap:e=>({uSigma:e.sigma})}}),Xe=I({type:`motionblur`,name:`MOTION BLUR`,category:`BLUR`,params:{angle:{value:0,min:0,max:360,step:1,label:`ANGLE`,tier:3,unit:`deg`,driveable:!0},distance:{value:10,min:1,max:100,step:1,label:`DISTANCE`,tier:3,previewMax:20,driveable:!0,unit:`px`}},apply(e,t,n,r,i,a,o){t.set(Ke(e,n,r,i.angle,i.distance))},wgsl:`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uAngle    : f32,
  uDistance : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI : f32 = 3.14159265358979;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let rad  = uni.uAngle * PI / 180.0;
  let dx   = cos(rad);
  let dy   = sin(rad);
  let dist = max(1.0, uni.uDistance);
  let n    = i32(dist);

  var acc  = vec4f(0.0);
  for (var k = 0; k <= n; k++) {
    let t   = f32(k) / dist;
    let sx  = clamp(x + i32(round(dx * f32(k) - dx * dist * 0.5)), 0, w - 1);
    let sy  = clamp(y + i32(round(dy * f32(k) - dy * dist * 0.5)), 0, h - 1);
    acc += textureLoad(tIn, vec2i(sx, sy), 0);
  }
  textureStore(tOut, vec2i(x, y), clamp(acc / f32(n + 1), vec4f(0.0), vec4f(1.0)));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uAngle;
uniform float uDistance;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  float rad  = uAngle * PI / 180.0;
  float dx   = cos(rad) / res.x;
  float dy   = sin(rad) / res.y;
  float dist = max(1.0, uDistance);
  int   n    = int(dist);

  vec4 acc = vec4(0.0);
  for (int k = 0; k <= 100; k++) {
    if (k > n) break;
    float t  = float(k) / dist;
    vec2  uv = clamp(vUV + (float(k) - dist * 0.5) * vec2(dx, dy), vec2(0.0), vec2(1.0));
    acc += texture(uTex, uv);
  }
  fragColor = clamp(acc / float(n + 1), 0.0, 1.0);
}
`,gpuBindings:{uniforms:{uAngle:`f32`,uDistance:`i32`},multiPass:!1,uniformMap:e=>({uAngle:e.angle,uDistance:e.distance})}}),Ze=I({type:`radialblur`,name:`RADIAL BLUR`,category:`BLUR`,params:{type:{value:`zoom`,type:`select`,options:[`zoom`,`spin`],label:`TYPE`,tier:3},centreX:{value:.5,min:0,max:1,step:.01,label:`CENTRE X`,tier:3,driveable:!0,unit:`0–1`},centreY:{value:.5,min:0,max:1,step:.01,label:`CENTRE Y`,tier:3,driveable:!0,unit:`0–1`},amount:{value:10,min:1,max:50,step:1,label:`AMOUNT`,tier:3,previewMax:15,driveable:!0,unit:`n`},samples:{value:12,min:4,max:32,step:1,label:`SAMPLES`,tier:4,previewMax:6,driveable:!0,unit:`n`}},apply(e,t,n,r,i,a,o){let s=o(`centreX`,0),c=o(`centreY`,0),l=o(`amount`,0);t.set(qe(e,n,r,i.type,s,c,l,i.samples))},wgsl:`
struct Uniforms {
  uWidth   : f32,
  uHeight  : f32,
  uType    : f32,  // 0=zoom, 1=spin
  uCentreX : f32,
  uCentreY : f32,
  uAmount  : f32,
  uSamples : f32,
  _pad     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI : f32 = 3.14159265358979;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1); let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0+1, 0, w-1);          let y1 = clamp(y0+1, 0, h-1);
  let fx = x - floor(x); let fy = y - floor(y);
  return mix(
    mix(textureLoad(tIn, vec2i(x0,y0), 0), textureLoad(tIn, vec2i(x1,y0), 0), fx),
    mix(textureLoad(tIn, vec2i(x0,y1), 0), textureLoad(tIn, vec2i(x1,y1), 0), fx),
    fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let cx      = uni.uCentreX * uni.uWidth;
  let cy      = uni.uCentreY * uni.uHeight;
  let dx      = f32(x) - cx;
  let dy      = f32(y) - cy;
  let n       = max(1, i32(uni.uSamples));
  let amount  = uni.uAmount;

  var acc = vec4f(0.0);
  for (var i = 0; i < n; i++) {
    let t = f32(i) / f32(n - 1) - 0.5; // [-0.5, 0.5]
    var sx: f32; var sy: f32;
    if (uni.uType < 0.5) {
      // zoom: scale dx/dy
      let scale = 1.0 + t * amount * 0.01;
      sx = cx + dx * scale;
      sy = cy + dy * scale;
    } else {
      // spin: rotate by small angle
      let ang  = t * amount * PI / 180.0;
      let cosA = cos(ang); let sinA = sin(ang);
      sx = cx + cosA * dx - sinA * dy;
      sy = cy + sinA * dx + cosA * dy;
    }
    acc += bilinear(sx, sy, w, h);
  }
  textureStore(tOut, vec2i(x, y), clamp(acc / f32(n), vec4f(0.0), vec4f(1.0)));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uType;
uniform float uCentreX; uniform float uCentreY;
uniform float uAmount; uniform float uSamples;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;

void main() {
  vec2  res = vec2(textureSize(uTex, 0));
  vec2  uvc = vec2(uCentreX, uCentreY);
  vec2  d   = (vUV - uvc) * res;
  int   n   = max(1, int(uSamples));

  vec4 acc = vec4(0.0);
  for (int i = 0; i < 32; i++) {
    if (i >= n) break;
    float t = float(i) / float(n - 1) - 0.5;
    vec2 src;
    if (uType == 0) {
      float scale = 1.0 + t * uAmount * 0.01;
      src = uvc + (d * scale) / res;
    } else {
      float ang = t * uAmount * PI / 180.0;
      float c = cos(ang); float s = sin(ang);
      vec2 rd = vec2(c*d.x - s*d.y, s*d.x + c*d.y);
      src = uvc + rd / res;
    }
    acc += texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
  }
  fragColor = clamp(acc / float(n), 0.0, 1.0);
}
`,gpuBindings:{uniforms:{uType:`i32`,uCentreX:`f32`,uCentreY:`f32`,uAmount:`f32`,uSamples:`i32`},multiPass:!1,uniformMap:e=>({uType:e.type===`zoom`?0:1,uCentreX:e.centreX,uCentreY:e.centreY,uAmount:e.amount,uSamples:e.samples})}}),Qe=I({type:`median`,name:`MEDIAN FILTER`,category:`BLUR`,forceWorkerPreview:!0,params:{radius:{value:1,min:1,max:5,step:1,label:`RADIUS`,tier:3,previewMax:2,driveable:!0,unit:`px`}},apply(e,t,n,r,i){t.set(We(e,n,r,i.radius))},wgsl:`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uRadius : f32,
  _pad    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn load(x: i32, y: i32, w: i32, h: i32) -> vec4f {
  return textureLoad(tIn, vec2i(clamp(x, 0, w-1), clamp(y, 0, h-1)), 0);
}

// Median of 9 values via partial selection (find middle rank)
fn median9(vals: array<f32, 9>) -> f32 {
  var v = vals;
  // 5 passes of bubble/select sort to find rank 4 (0-indexed median)
  for (var i = 0; i <= 4; i++) {
    for (var j = i + 1; j < 9; j++) {
      if (v[j] < v[i]) { let t = v[i]; v[i] = v[j]; v[j] = t; }
    }
  }
  return v[4];
}

fn median25ch(x: i32, y: i32, w: i32, h: i32, ch: i32) -> f32 {
  var v: array<f32, 25>;
  var idx = 0;
  for (var ky = -2; ky <= 2; ky++) {
    for (var kx = -2; kx <= 2; kx++) {
      let px = load(x + kx, y + ky, w, h);
      v[idx] = select(select(px.b, px.g, ch == 1), px.r, ch == 0);
      idx++;
    }
  }
  // Selection sort to rank 12
  for (var i = 0; i <= 12; i++) {
    for (var j = i + 1; j < 25; j++) {
      if (v[j] < v[i]) { let t = v[i]; v[i] = v[j]; v[j] = t; }
    }
  }
  return v[12];
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let radius = i32(uni.uRadius);
  let px = textureLoad(tIn, vec2i(x, y), 0);

  if (radius <= 1) {
    // 3×3 median
    var r: array<f32, 9>; var g: array<f32, 9>; var b: array<f32, 9>;
    var idx = 0;
    for (var ky = -1; ky <= 1; ky++) {
      for (var kx = -1; kx <= 1; kx++) {
        let s = load(x + kx, y + ky, w, h);
        r[idx] = s.r; g[idx] = s.g; b[idx] = s.b; idx++;
      }
    }
    textureStore(tOut, vec2i(x, y), vec4f(median9(r), median9(g), median9(b), px.a));
  } else {
    // 5×5 median (radius 2)
    textureStore(tOut, vec2i(x, y), vec4f(
      median25ch(x, y, w, h, 0),
      median25ch(x, y, w, h, 1),
      median25ch(x, y, w, h, 2),
      px.a,
    ));
  }
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uRadius;

in  vec2 vUV;
out vec4 fragColor;

vec4 loadS(vec2 uv, vec2 res, float ox, float oy) {
  return texture(uTex, clamp(uv + vec2(ox, oy) / res, vec2(0.0), vec2(1.0)));
}

float median9(float v[9]) {
  for (int i = 0; i <= 4; i++) for (int j = i+1; j < 9; j++)
    if (v[j] < v[i]) { float t = v[i]; v[i] = v[j]; v[j] = t; }
  return v[4];
}

void main() {
  vec2  res    = vec2(textureSize(uTex, 0));
  vec4  center = texture(uTex, vUV);
  int   radius = int(uRadius);

  if (radius <= 1) {
    float r[9]; float g[9]; float b[9]; int idx = 0;
    for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
      vec4 s = loadS(vUV, res, float(dx), float(dy));
      r[idx] = s.r; g[idx] = s.g; b[idx] = s.b; idx++;
    }
    fragColor = vec4(median9(r), median9(g), median9(b), center.a);
  } else {
    // 5×5 — compute per-channel median of 25 samples
    float cr[25]; float cg[25]; float cb[25]; int i2 = 0;
    for (int dy = -2; dy <= 2; dy++) for (int dx = -2; dx <= 2; dx++) {
      vec4 s = loadS(vUV, res, float(dx), float(dy));
      cr[i2] = s.r; cg[i2] = s.g; cb[i2] = s.b; i2++;
    }
    // Partial selection sort to rank 12
    for (int ii = 0; ii <= 12; ii++) {
      for (int jj = ii+1; jj < 25; jj++) {
        if (cr[jj] < cr[ii]) { float t = cr[ii]; cr[ii] = cr[jj]; cr[jj] = t; }
        if (cg[jj] < cg[ii]) { float t = cg[ii]; cg[ii] = cg[jj]; cg[jj] = t; }
        if (cb[jj] < cb[ii]) { float t = cb[ii]; cb[ii] = cb[jj]; cb[jj] = t; }
      }
    }
    fragColor = vec4(cr[12], cg[12], cb[12], center.a);
  }
}
`,gpuBindings:{uniforms:{uRadius:`i32`},multiPass:!1,uniformMap:e=>({uRadius:e.radius})}}),$e=I({type:`bilateral`,name:`BILATERAL`,category:`BLUR`,forceWorkerPreview:!0,params:{spatialSigma:{value:5,min:1,max:10,step:.5,label:`SPATIAL σ`,tier:3,previewMax:5,unit:`σ`},rangeSigma:{value:30,min:5,max:100,step:1,label:`RANGE σ`,tier:3,driveable:!0,unit:`σ`}},apply(e,t,n,r,i,a,o){let s=o?o(`rangeSigma`,0,a):i.rangeSigma;t.set(Ge(e,n,r,i.spatialSigma,s))},wgsl:`
struct Uniforms {
  uWidth        : f32,
  uHeight       : f32,
  uSpatialSigma : f32,
  uRangeSigma   : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn load(x: i32, y: i32, w: i32, h: i32) -> vec4f {
  return textureLoad(tIn, vec2i(clamp(x, 0, w-1), clamp(y, 0, h-1)), 0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let ss     = max(uni.uSpatialSigma, 0.5);
  let rs     = max(uni.uRangeSigma / 255.0, 0.01);
  let radius = clamp(i32(ceil(2.0 * ss)), 1, 15);
  let invSs2 = 0.5 / (ss * ss);
  let invRs2 = 0.5 / (rs * rs);

  let center = load(x, y, w, h);
  var acc    = vec4f(0.0);
  var wsum   = 0.0;

  for (var ky = -radius; ky <= radius; ky++) {
    for (var kx = -radius; kx <= radius; kx++) {
      let nb    = load(x + kx, y + ky, w, h);
      let sd    = f32(kx * kx + ky * ky);
      let rd    = dot(nb.rgb - center.rgb, nb.rgb - center.rgb);
      let gw    = exp(-sd * invSs2 - rd * invRs2);
      acc  += nb * gw;
      wsum += gw;
    }
  }
  textureStore(tOut, vec2i(x, y), clamp(acc / wsum, vec4f(0.0), vec4f(1.0)));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uSpatialSigma;
uniform float uRangeSigma;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2  res    = vec2(textureSize(uTex, 0));
  float ss     = max(uSpatialSigma, 0.5);
  float rs     = max(uRangeSigma / 255.0, 0.01);
  int   radius = clamp(int(ceil(2.0 * ss)), 1, 15);
  float invSs2 = 0.5 / (ss * ss);
  float invRs2 = 0.5 / (rs * rs);

  vec4 center = texture(uTex, vUV);
  vec4 acc    = vec4(0.0);
  float wsum  = 0.0;

  for (int ky = -15; ky <= 15; ky++) {
    if (abs(ky) > radius) continue;
    for (int kx = -15; kx <= 15; kx++) {
      if (abs(kx) > radius) continue;
      vec2 uv2 = clamp(vUV + vec2(float(kx), float(ky)) / res, vec2(0.0), vec2(1.0));
      vec4 nb  = texture(uTex, uv2);
      float sd = float(kx * kx + ky * ky);
      float rd = dot(nb.rgb - center.rgb, nb.rgb - center.rgb);
      float gw = exp(-sd * invSs2 - rd * invRs2);
      acc  += nb * gw; wsum += gw;
    }
  }
  fragColor = clamp(acc / wsum, 0.0, 1.0);
}
`,gpuBindings:{uniforms:{uSpatialSigma:`f32`,uRangeSigma:`f32`},multiPass:!1,uniformMap:e=>({uSpatialSigma:e.spatialSigma,uRangeSigma:e.rangeSigma})}});function et(e,t){let n=new Float32Array(e*2+1),r=0;for(let i=-e;i<=e;i++)n[i+e]=Math.exp(-(i*i)/(2*t*t)),r+=n[i+e];for(let e=0;e<n.length;e++)n[e]/=r;return n}function tt(e,t,n,r){let i=Math.ceil(r*3),a=et(i,r),o=new Uint8ClampedArray(e.length),s=new Uint8ClampedArray(e.length);for(let r=0;r<n;r++)for(let n=0;n<t;n++){let s=0,c=0,l=0;for(let o=-i;o<=i;o++){let u=Math.max(0,Math.min(t-1,n+o)),d=(r*t+u)*4,f=a[o+i];s+=e[d]*f,c+=e[d+1]*f,l+=e[d+2]*f}let u=(r*t+n)*4;o[u]=s,o[u+1]=c,o[u+2]=l,o[u+3]=e[u+3]}for(let e=0;e<t;e++)for(let r=0;r<n;r++){let c=0,l=0,u=0;for(let s=-i;s<=i;s++){let d=(Math.max(0,Math.min(n-1,r+s))*t+e)*4,f=a[s+i];c+=o[d]*f,l+=o[d+1]*f,u+=o[d+2]*f}let d=(r*t+e)*4;s[d]=c,s[d+1]=l,s[d+2]=u,s[d+3]=o[d+3]}return s}function nt(e,t,n,r=1,i=2,a=0){let o=tt(e,t,n,Math.max(.1,i)),s=new Uint8ClampedArray(e.length);for(let i=0,c=t*n*4;i<c;i+=4){for(let t=0;t<3;t++){let n=e[i+t]-o[i+t];s[i+t]=Math.abs(n)>a?Math.max(0,Math.min(255,Math.round(e[i+t]+r*n))):e[i+t]}s[i+3]=e[i+3]}return s}function rt(e,t,n,r,i,a,o){let s=Math.floor(r),c=Math.floor(i),l=r-s,u=i-c,d=s<0?0:s>=t?t-1:s,f=s+1>=t?t-1:s+1<0?0:s+1,p=c<0?0:c>=n?n-1:c,m=c+1>=n?n-1:c+1<0?0:c+1,h=(p*t+d)*4,g=(p*t+f)*4,_=(m*t+d)*4,v=(m*t+f)*4,y=1-l,b=1-u,x=y*b,S=l*b,C=y*u,w=l*u;a[o]=e[h]*x+e[g]*S+e[_]*C+e[v]*w,a[o+1]=e[h+1]*x+e[g+1]*S+e[_+1]*C+e[v+1]*w,a[o+2]=e[h+2]*x+e[g+2]*S+e[_+2]*C+e[v+2]*w,a[o+3]=e[h+3]*x+e[g+3]*S+e[_+3]*C+e[v+3]*w}function it(e,t,n,r,i,a,o){let s=Math.round(r),c=Math.round(i),l=s<0?0:s>=t?t-1:s,u=((c<0?0:c>=n?n-1:c)*t+l)*4;a[o]=e[u],a[o+1]=e[u+1],a[o+2]=e[u+2],a[o+3]=e[u+3]}function at(e,t,n,r=0,i=0,a=0,o=1,s=1,c=.5,l=.5,u=`bilinear`){let d=c*t,f=l*n,p=-a*Math.PI/180,m=Math.cos(p),h=Math.sin(p),g=1/Math.max(o,.001),_=1/Math.max(s,.001),v=r*t,y=i*n,b=new Uint8ClampedArray(e.length),x=u!==`nearest`;for(let r=0;r<n;r++)for(let i=0;i<t;i++){let a=i-d-v,o=r-f-y,s=(a*m-o*h)*g+d,c=(a*h+o*m)*_+f,l=(r*t+i)*4;x?rt(e,t,n,s,c,b,l):it(e,t,n,s,c,b,l)}return b}let ot=I({type:`unsharpmask`,name:`UNSHARP MASK`,category:`SHARPEN`,params:{amount:{value:1,min:0,max:5,step:.1,label:`AMOUNT`,tier:3,driveable:!0,unit:`n`},radius:{value:2,min:.1,max:20,step:.1,label:`RADIUS`,tier:3,previewMax:5,driveable:!0,unit:`px`},threshold:{value:0,min:0,max:255,step:1,label:`THRESHOLD`,tier:4,driveable:!0,unit:`lvl`}},apply(e,t,n,r,i){t.set(nt(e,n,r,i.amount,i.radius,i.threshold))},wgsl:`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uAmount    : f32,
  uRadius    : f32,
  uThreshold : f32,
  uPass      : f32,
  _pad       : f32,
  _pad2      : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn load(x: i32, y: i32, w: i32, h: i32) -> vec4f {
  return textureLoad(tIn, vec2i(clamp(x, 0, w-1), clamp(y, 0, h-1)), 0);
}

fn gaussBlur(x: i32, y: i32, w: i32, h: i32, sigma: f32) -> vec4f {
  let r      = clamp(i32(ceil(3.0 * sigma)), 1, 30);
  let inv2s2 = 0.5 / (sigma * sigma);
  var acc    = vec4f(0.0);
  var wsum   = 0.0;
  for (var ky = -r; ky <= r; ky++) {
    for (var kx = -r; kx <= r; kx++) {
      let gw = exp(-f32(kx*kx + ky*ky) * inv2s2);
      acc  += load(x + kx, y + ky, w, h) * gw;
      wsum += gw;
    }
  }
  return acc / wsum;
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let sigma = max(uni.uRadius, 0.1);

  if (uni.uPass < 0.5) {
    // Pass 0: Gaussian blur
    textureStore(tOut, vec2i(x, y), gaussBlur(x, y, w, h, sigma));
  } else {
    // Pass 1: read = blurred; apply sharpening relative to blurred
    // Original was already swapped away. We approximate by: sharp = blurred + amount*(blurred - blurred_wide)
    // Instead: use blurred as source and enhance edges via Laplacian boost.
    let blurred = textureLoad(tIn, vec2i(x, y), 0);
    // Compute a further 1-pixel box average to extract low-freq signal
    let n  = load(x, y-1, w, h); let s = load(x, y+1, w, h);
    let el = load(x-1, y, w, h); let r = load(x+1, y, w, h);
    let lap = blurred.rgb * 4.0 - n.rgb - s.rgb - el.rgb - r.rgb;
    let thresh = uni.uThreshold / 255.0;
    let mask = vec3f(
      select(0.0, 1.0, abs(lap.r) >= thresh),
      select(0.0, 1.0, abs(lap.g) >= thresh),
      select(0.0, 1.0, abs(lap.b) >= thresh),
    );
    let sharpened = clamp(blurred.rgb + lap * uni.uAmount * mask * 0.25, vec3f(0.0), vec3f(1.0));
    textureStore(tOut, vec2i(x, y), vec4f(sharpened, blurred.a));
  }
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uAmount;
uniform float uRadius;
uniform float uThreshold;
uniform float uPass;

in  vec2 vUV;
out vec4 fragColor;

vec2 ts;

vec4 gaussBlur(float sigma) {
  int r = clamp(int(ceil(3.0 * sigma)), 1, 30);
  float inv2s2 = 0.5 / (sigma * sigma);
  vec4 acc = vec4(0.0); float wsum = 0.0;
  for (int ky = -30; ky <= 30; ky++) {
    if (abs(ky) > r) continue;
    for (int kx = -30; kx <= 30; kx++) {
      if (abs(kx) > r) continue;
      float gw = exp(-float(kx*kx + ky*ky) * inv2s2);
      vec2 uv2 = clamp(vUV + vec2(float(kx), float(ky)) / ts, vec2(0.0), vec2(1.0));
      acc += texture(uTex, uv2) * gw; wsum += gw;
    }
  }
  return acc / wsum;
}

void main() {
  ts = vec2(textureSize(uTex, 0));
  float sigma = max(uRadius, 0.1);
  if (uPass < 0.5) {
    fragColor = gaussBlur(sigma);
  } else {
    vec4  blurred = texture(uTex, vUV);
    vec2  inv     = 1.0 / ts;
    vec3  n = texture(uTex, clamp(vUV + vec2(0.0, -inv.y), vec2(0.0), vec2(1.0))).rgb;
    vec3  s = texture(uTex, clamp(vUV + vec2(0.0,  inv.y), vec2(0.0), vec2(1.0))).rgb;
    vec3  el= texture(uTex, clamp(vUV + vec2(-inv.x,0.0),  vec2(0.0), vec2(1.0))).rgb;
    vec3  r = texture(uTex, clamp(vUV + vec2( inv.x,0.0),  vec2(0.0), vec2(1.0))).rgb;
    vec3  lap = blurred.rgb * 4.0 - n - s - el - r;
    float thresh = uThreshold / 255.0;
    vec3  mask = vec3(abs(lap.r)>=thresh?1.0:0.0, abs(lap.g)>=thresh?1.0:0.0, abs(lap.b)>=thresh?1.0:0.0);
    fragColor = vec4(clamp(blurred.rgb + lap * uAmount * mask * 0.25, 0.0, 1.0), blurred.a);
  }
}
`,gpuBindings:{uniforms:{uAmount:`f32`,uRadius:`f32`,uThreshold:`f32`},multiPass:!0,passes:2,uniformMap:e=>({uAmount:e.amount,uRadius:e.radius,uThreshold:e.threshold})}}),st=I({type:`affine`,name:`AFFINE XFORM`,category:`TRANSFORM`,params:{translateX:{value:0,min:-1,max:1,step:.01,label:`TRANSLATE X`,tier:3,driveable:!0,unit:`−1–1`},translateY:{value:0,min:-1,max:1,step:.01,label:`TRANSLATE Y`,tier:3,driveable:!0,unit:`−1–1`},rotate:{value:0,min:-180,max:180,step:.5,label:`ROTATE`,tier:3,unit:`deg`,driveable:!0},scaleX:{value:1,min:.1,max:5,step:.01,label:`SCALE X`,tier:4,driveable:!0,unit:`×`},scaleY:{value:1,min:.1,max:5,step:.01,label:`SCALE Y`,tier:4,driveable:!0,unit:`×`},centreX:{value:.5,min:0,max:1,step:.01,label:`CENTRE X`,tier:5,unit:`0–1`},centreY:{value:.5,min:0,max:1,step:.01,label:`CENTRE Y`,tier:5,unit:`0–1`}},apply(e,t,n,r,i,a){let o=a?.quality===`preview`?`nearest`:`bilinear`;t.set(at(e,n,r,i.translateX,i.translateY,i.rotate,i.scaleX,i.scaleY,i.centreX,i.centreY,o))},wgsl:`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uTx     : f32,
  uTy     : f32,
  uRotate : f32,
  uScaleX : f32,
  uScaleY : f32,
  uCx     : f32,
  uCy     : f32,
  _pad    : f32,
  _pad2   : f32,
  _pad3   : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI : f32 = 3.14159265358979;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1); let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0+1, 0, w-1);          let y1 = clamp(y0+1, 0, h-1);
  let fx = x - floor(x); let fy = y - floor(y);
  return mix(
    mix(textureLoad(tIn, vec2i(x0,y0), 0), textureLoad(tIn, vec2i(x1,y0), 0), fx),
    mix(textureLoad(tIn, vec2i(x0,y1), 0), textureLoad(tIn, vec2i(x1,y1), 0), fx),
    fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  // Pivot in pixel space
  let px  = f32(x); let py = f32(y);
  let pivX = uni.uCx * uni.uWidth;
  let pivY = uni.uCy * uni.uHeight;

  // Offset to pivot
  var dx = px - pivX; var dy = py - pivY;

  // Inverse transform: undo translate, rotate, scale
  dx -= uni.uTx * uni.uWidth;
  dy -= uni.uTy * uni.uHeight;

  // Inverse scale
  dx /= max(uni.uScaleX, 0.001);
  dy /= max(uni.uScaleY, 0.001);

  // Inverse rotate
  let rad  = -uni.uRotate * PI / 180.0;
  let cosA = cos(rad); let sinA = sin(rad);
  let rdx  = cosA * dx - sinA * dy;
  let rdy  = sinA * dx + cosA * dy;

  let sx = pivX + rdx;
  let sy = pivY + rdy;
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uTx; uniform float uTy; uniform float uRotate;
uniform float uScaleX; uniform float uScaleY;
uniform float uCx; uniform float uCy;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;

void main() {
  vec2 uvc  = vec2(uCx, uCy);
  vec2 d    = vUV - uvc;
  d -= vec2(uTx, uTy);
  d.x /= max(uScaleX, 0.001);
  d.y /= max(uScaleY, 0.001);
  float rad  = -uRotate * PI / 180.0;
  float cosA = cos(rad); float sinA = sin(rad);
  vec2  rd   = vec2(cosA * d.x - sinA * d.y, sinA * d.x + cosA * d.y);
  vec2  src  = uvc + rd;
  fragColor  = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`,gpuBindings:{uniforms:{uTx:`f32`,uTy:`f32`,uRotate:`f32`,uScaleX:`f32`,uScaleY:`f32`,uCx:`f32`,uCy:`f32`},multiPass:!1,uniformMap:e=>({uTx:e.translateX,uTy:e.translateY,uRotate:e.rotate,uScaleX:e.scaleX,uScaleY:e.scaleY,uCx:e.centreX,uCy:e.centreY})}});function Y(e,t){let n=Number(t)||0;return n<=0?e:Math.min(e,n)}var ct=class{constructor(e){this.perm=new Uint8Array(512);let t=new n(e),r=new Uint8Array(256);for(let e=0;e<256;e++)r[e]=e;for(let e=255;e>0;e--){let n=t.nextInt(0,e+1);[r[e],r[n]]=[r[n],r[e]]}for(let e=0;e<512;e++)this.perm[e]=r[e&255]}_f(e){return e*e*e*(e*(e*6-15)+10)}_g(e,t,n){let r=e&3,i=r<2?t:n,a=r<2?n:t;return(r&1?-i:i)+(r&2?-a:a)}noise2D(e,t){let n=Math.floor(e)&255,r=Math.floor(t)&255,i=e-Math.floor(e),a=t-Math.floor(t),o=this._f(i),s=this._f(a),c=this.perm;return(1-s)*((1-o)*this._g(c[c[n]+r],i,a)+o*this._g(c[c[n+1]+r],i-1,a))+s*((1-o)*this._g(c[c[n]+r+1],i,a-1)+o*this._g(c[c[n+1]+r+1],i-1,a-1))}fbm(e,t,n=4,r=2,i=.5){let a=0,o=1,s=1,c=0;for(let l=0;l<n;l++)a+=this.noise2D(e*s,t*s)*o,c+=o,o*=i,s*=r;return a/c}};function lt(e,t,n,r,i,a,o){let s=Math.floor(r),c=Math.floor(i),l=r-s,u=i-c,d=s<0?0:s>=t?t-1:s,f=s+1>=t?t-1:s+1<0?0:s+1,p=c<0?0:c>=n?n-1:c,m=c+1>=n?n-1:c+1<0?0:c+1,h=(p*t+d)*4,g=(p*t+f)*4,_=(m*t+d)*4,v=(m*t+f)*4,y=1-l,b=1-u,x=y*b,S=l*b,C=y*u,w=l*u;a[o]=e[h]*x+e[g]*S+e[_]*C+e[v]*w,a[o+1]=e[h+1]*x+e[g+1]*S+e[_+1]*C+e[v+1]*w,a[o+2]=e[h+2]*x+e[g+2]*S+e[_+2]*C+e[v+2]*w,a[o+3]=e[h+3]*x+e[g+3]*S+e[_+3]*C+e[v+3]*w}function ut(e,t,n,r,i,a,o){let s=Math.round(r),c=Math.round(i),l=s<0?0:s>=t?t-1:s,u=((c<0?0:c>=n?n-1:c)*t+l)*4;a[o]=e[u],a[o+1]=e[u+1],a[o+2]=e[u+2],a[o+3]=e[u+3]}function dt(e,t,n,r,i,a,o,s){a===`bilinear`?lt(e,t,n,r,i,o,s):ut(e,t,n,r,i,o,s)}function ft(e,t,n,r,i,a,o,s,c,l,u,d=`bilinear`){let f=new Uint8ClampedArray(e.length),p=s/l;for(let s=0;s<n;s++)for(let m=0;m<t;m++){let h=m,g=s;for(let e=0;e<l;e++){let e=h/t*r,s=g/n*r,l=u.fbm(e,s,i,a,o),d=u.fbm(e+31.7,s+47.3,i,a,o);if(c){let e=d*c,t=-l*c;l=l*(1-Math.abs(c))+e,d=d*(1-Math.abs(c))+t}h-=l*p,g-=d*p}dt(e,t,n,h,g,d,f,(s*t+m)*4)}return f}function pt(e,t,n,r,i,a,o,s,c,l,u,d,f=`bilinear`){let p=r===`horizontal`,m=Math.ceil((p?n:t)/Math.max(1,i)),h=new Float32Array(m);for(let e=0;e<m;e++){let t=e/m;o===`sine`?h[e]=Math.sin(t*c*Math.PI*2+s)*a:o===`stepped`?h[e]=(Math.round(d.next()*4)-2)*a*.5:h[e]=u.noise2D(t*l,s)*a}let g=new Uint8ClampedArray(e.length);for(let r=0;r<n;r++)for(let a=0;a<t;a++){let o=Math.min(Math.floor((p?r:a)/Math.max(1,i)),m-1),s=(r*t+a)*4;dt(e,t,n,p?a+h[o]:a,p?r:r+h[o],f,g,s)}return g}function mt(e,t,n,r,i,a,o,s,c=`bilinear`){let l=new Uint8ClampedArray(e.length),u=t/2,d=n/2;for(let f=0;f<n;f++)for(let p=0;p<t;p++){let m=p,h=f;for(let e=0;e<i;e++){let e,i;if(r===`noise`)e=s.fbm(m/t*o,h/n*o,3),i=s.fbm(m/t*o+31.7,h/n*o+47.3,3);else if(r===`radial`){let t=m-u,n=h-d,r=Math.sqrt(t*t+n*n)||1;e=t/r,i=n/r}else{let t=m-u,n=h-d,r=Math.sqrt(t*t+n*n)||1;e=-n/r,i=t/r}m-=e*a,h-=i*a}dt(e,t,n,m,h,c,l,(f*t+p)*4)}return l}function ht(e,t,n,r,i,a,o,s,c,l=`bilinear`){let u=r*t,d=i*n,f=Math.sqrt(t*t+n*n)*.5,p=new Uint8ClampedArray(e.length);for(let r=0;r<n;r++)for(let i=0;i<t;i++){let m=i-u,h=r-d,g=Math.sqrt(m*m+h*h),_=(r*t+i)*4;if(g<.001){p[_]=e[_],p[_+1]=e[_+1],p[_+2]=e[_+2],p[_+3]=e[_+3];continue}let v=Math.sin(g/t*o*Math.PI*2+s)*a*Math.exp(-(g/f)*c),y=Math.atan2(h,m);dt(e,t,n,i+Math.cos(y)*v,r+Math.sin(y)*v,l,p,_)}return p}function gt(e,t,n,r,i,a,o,s,c,l=`bilinear`){let u=Math.sqrt(t*t+n*n),d=[];for(let e=0;e<r;e++)d.push({cx:c.next()*t,cy:c.next()*n,r:c.nextRange(i,a)*u});let f=new Uint8ClampedArray(e.length);for(let r=0;r<n;r++)for(let i=0;i<t;i++){let a=i,c=r;for(let e of d){let t=i-e.cx,n=r-e.cy,l=Math.sqrt(t*t+n*n);if(l<e.r){let r=l/e.r,i=s>0?Math.min(1,(1-r)/s):1,u=1+(o-1)*i*(1-r*r);a=e.cx+t/u,c=e.cy+n/u;break}}dt(e,t,n,a,c,l,f,(r*t+i)*4)}return f}let _t=I({type:`flowfield`,name:`FLOW FIELD`,category:`WARP`,params:{frame:{value:0,min:0,max:240,step:1,label:`FRAME`,tier:3,driveable:!0,unit:`frames`},noiseScale:{value:3,min:.1,max:20,step:.1,label:`NOISE SCALE`,tier:3,driveable:!0,unit:`n`},strength:{value:40,min:0,max:200,step:1,label:`STRENGTH`,tier:3,previewMax:60,driveable:!0,unit:`px`},curl:{value:0,min:-1,max:1,step:.01,label:`CURL`,tier:3,driveable:!0,unit:`n`},octaves:{value:3,min:1,max:8,step:1,label:`OCTAVES`,tier:4,previewMax:4,driveable:!0,unit:`n`},lacunarity:{value:2,min:1,max:4,step:.1,label:`LACUNARITY`,tier:4,driveable:!0,unit:`n`},gain:{value:.5,min:.1,max:.9,step:.05,label:`GAIN`,tier:4,driveable:!0,unit:`0–1`},advectSteps:{value:1,min:1,max:10,step:1,label:`ADVECT`,tier:4,previewMax:3,driveable:!0,unit:`n`}},_noise:null,_noiseSeed:null,apply(e,t,n,r,i,a,o){let s=a?.nodeSeed??42;(!this._noise||this._noiseSeed!==s)&&(this._noise=new ct(s),this._noiseSeed=s);let c=a?.quality===`preview`?`nearest`:`bilinear`,l=i.strength*(a?.quality===`preview`&&a?.previewScale?a.previewScale:1),u=i.advectSteps;u=Y(u,i.frame),t.set(ft(e,n,r,i.noiseScale,i.octaves,i.lacunarity,i.gain,l,i.curl,u,this._noise,c))},wgsl:`
struct Uniforms {
  uWidth       : f32,
  uHeight      : f32,
  uNoiseScale  : f32,
  uOctaves     : f32,
  uStrength    : f32,
  uCurl        : f32,
  uAdvectSteps : f32,
  uLacunarity  : f32,
  uGain        : f32,
  uFrame       : f32,
  _pad         : f32,
  _pad2        : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn hash2(n: f32) -> f32 { return fract(sin(n) * 43758.5453123); }
fn fade(t: f32) -> f32  { return t*t*t*(t*(t*6.0-15.0)+10.0); }

fn grad2(h: f32, x: f32, y: f32) -> f32 {
  let idx = i32(h * 7.0) % 8;
  let gx  = array<f32,8>(1.,-1., 1.,-1., 0., 0., 1.,-1.);
  let gy  = array<f32,8>(1., 1.,-1., 1., 1.,-1., 0., 0.);
  return gx[idx]*x + gy[idx]*y;
}

fn perlin(px: f32, py: f32) -> f32 {
  let ix=floor(px); let iy=floor(py);
  let fx=px-ix; let fy=py-iy;
  let ux=fade(fx); let uy=fade(fy);
  return mix(
    mix(grad2(hash2(ix+iy*57.),fx,fy),      grad2(hash2(ix+1.+iy*57.),fx-1.,fy),ux),
    mix(grad2(hash2(ix+(iy+1.)*57.),fx,fy-1.),grad2(hash2(ix+1.+(iy+1.)*57.),fx-1.,fy-1.),ux),
    uy,
  );
}

fn fbm(px: f32, py: f32, oct: i32, lac: f32, gn: f32) -> f32 {
  var v=0.0; var amp=0.5; var freq=1.0;
  for(var i=0;i<oct;i++) { v+=perlin(px*freq,py*freq)*amp; amp*=gn; freq*=lac; }
  return v;
}

fn fieldAt(wx: f32, wy: f32, oct: i32, lac: f32, gn: f32) -> vec2f {
  let nx = fbm(wx, wy, oct, lac, gn);
  let ny = fbm(wx + 5.2, wy + 1.3, oct, lac, gn);
  return vec2f(nx, ny);
}

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0=clamp(i32(floor(x)),0,w-1); let y0=clamp(i32(floor(y)),0,h-1);
  let x1=clamp(x0+1,0,w-1);          let y1=clamp(y0+1,0,h-1);
  let fx=x-floor(x); let fy=y-floor(y);
  return mix(
    mix(textureLoad(tIn, vec2i(x0,y0),0), textureLoad(tIn, vec2i(x1,y0),0), fx),
    mix(textureLoad(tIn, vec2i(x0,y1),0), textureLoad(tIn, vec2i(x1,y1),0), fx), fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let oct   = clamp(i32(uni.uOctaves), 1, 8);
  let steps = clamp(i32(uni.uAdvectSteps), 1, 10);
  let lac   = uni.uLacunarity; let gn = uni.uGain;
  let str   = uni.uStrength;
  let sc    = uni.uNoiseScale;

  var wx = f32(x); var wy = f32(y);
  for (var s = 0; s < steps; s++) {
    let nx = wx / uni.uWidth * sc;
    let ny = wy / uni.uHeight * sc;
    var v = fieldAt(nx + uni.uFrame * 0.01, ny, oct, lac, gn);
    if (uni.uCurl != 0.0) {
      // Blend with curl (perpendicular)
      v = mix(v, vec2f(-v.y, v.x), uni.uCurl);
    }
    wx += v.x * str;
    wy += v.y * str;
  }
  textureStore(tOut, vec2i(x, y), bilinear(wx, wy, w, h));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uNoiseScale; uniform float uOctaves; uniform float uStrength;
uniform float uCurl; uniform float uAdvectSteps; uniform float uLacunarity;
uniform float uGain; uniform float uFrame;

in  vec2 vUV;
out vec4 fragColor;

float hash2(float n) { return fract(sin(n) * 43758.5453123); }
float fade(float t)  { return t*t*t*(t*(t*6.-15.)+10.); }

float grad2(float h, float x, float y) {
  int idx=int(h*7.)%8;
  float gx[8];float gy[8];
  gx[0]=1.;gx[1]=-1.;gx[2]=1.;gx[3]=-1.;gx[4]=0.;gx[5]=0.;gx[6]=1.;gx[7]=-1.;
  gy[0]=1.;gy[1]=1.;gy[2]=-1.;gy[3]=1.;gy[4]=1.;gy[5]=-1.;gy[6]=0.;gy[7]=0.;
  return gx[idx]*x+gy[idx]*y;
}

float perlinN(float px, float py) {
  float ix=floor(px);float iy=floor(py);
  float fx=px-ix;float fy=py-iy;
  float ux=fade(fx);float uy=fade(fy);
  return mix(mix(grad2(hash2(ix+iy*57.),fx,fy),grad2(hash2(ix+1.+iy*57.),fx-1.,fy),ux),
             mix(grad2(hash2(ix+(iy+1.)*57.),fx,fy-1.),grad2(hash2(ix+1.+(iy+1.)*57.),fx-1.,fy-1.),ux),uy);
}

float fbm(float px, float py, int oct, float lac, float gn) {
  float v=0.;float amp=.5;float freq=1.;
  for(int i=0;i<8;i++){if(i>=oct)break;v+=perlinN(px*freq,py*freq)*amp;amp*=gn;freq*=lac;}
  return v;
}

void main() {
  vec2 res=vec2(textureSize(uTex,0));
  int  oct=clamp(int(uOctaves),1,8);
  int  steps=clamp(int(uAdvectSteps),1,10);
  float wx=vUV.x;float wy=vUV.y;
  for(int s=0;s<10;s++){
    if(s>=steps)break;
    float nx=wx*uNoiseScale;float ny=wy*uNoiseScale;
    float vx=fbm(nx+uFrame*0.01,ny,oct,uLacunarity,uGain);
    float vy=fbm(nx+5.2,ny+1.3,oct,uLacunarity,uGain);
    if(uCurl!=0.0){float cx2=mix(vx,-vy,uCurl);float cy2=mix(vy,vx,uCurl);vx=cx2;vy=cy2;}
    wx+=vx*uStrength/res.x;wy+=vy*uStrength/res.y;
  }
  fragColor=texture(uTex,clamp(vec2(wx,wy),vec2(0.),vec2(1.)));
}
`,gpuBindings:{uniforms:{uNoiseScale:`f32`,uOctaves:`f32`,uStrength:`f32`,uCurl:`f32`,uAdvectSteps:`f32`,uLacunarity:`f32`,uGain:`f32`,uFrame:`f32`},multiPass:!1,uniformMap:e=>({uNoiseScale:e.noiseScale,uOctaves:e.octaves,uStrength:e.strength,uCurl:e.curl,uAdvectSteps:e.advectSteps,uLacunarity:e.lacunarity,uGain:e.gain,uFrame:e.frame})}}),vt={horizontal:0,vertical:1},yt={noise:0,sine:1,stepped:2},bt=I({type:`bandshift`,name:`BAND SHIFT`,category:`WARP`,params:{axis:{value:`horizontal`,type:`select`,options:[`horizontal`,`vertical`],label:`AXIS`,tier:3},intensity:{value:30,min:0,max:200,step:1,label:`INTENSITY`,tier:3,driveable:!0,unit:`px`},bandSize:{value:20,min:2,max:200,step:1,label:`BAND SIZE`,tier:3,driveable:!0,unit:`px`},offsetType:{value:`noise`,type:`select`,options:[`noise`,`sine`,`stepped`],label:`OFFSET TYPE`,tier:4},phase:{value:0,min:0,max:6.28,step:.01,label:`PHASE`,tier:4,driveable:!0,unit:`rad`,when:{param:`offsetType`,in:[`sine`,`noise`]}},freq:{value:1,min:.1,max:10,step:.1,label:`FREQ`,tier:4,driveable:!0,unit:`n`,when:{param:`offsetType`,equals:`sine`}},noiseScale:{value:2,min:.1,max:10,step:.1,label:`NOISE SC`,tier:5,driveable:!0,unit:`n`,when:{param:`offsetType`,equals:`noise`}}},apply(e,t,r,i,a,o,s){let c=o?.nodeSeed??42,l=new ct(c),u=new n(c),d=o?.quality===`preview`?`nearest`:`bilinear`;t.set(pt(e,r,i,a.axis,a.bandSize,a.intensity,a.offsetType,a.phase,a.freq,a.noiseScale,l,u,d))},wgsl:`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uAxis       : f32,
  uIntensity  : f32,
  uBandSize   : f32,
  uOffsetType : f32,
  uPhase      : f32,
  uFreq       : f32,
  uNoiseScale : f32,
  _pad        : f32,
  _pad2       : f32,
  _pad3       : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const TWO_PI : f32 = 6.28318530717959;

fn hashNoise(v: f32) -> f32 { return fract(sin(v * 127.1) * 43758.5453123); }

fn bandOffset(band: f32) -> f32 {
  if (uni.uOffsetType < 0.5) {
    // noise
    let n = hashNoise(band * uni.uNoiseScale + uni.uPhase);
    return (n * 2.0 - 1.0) * uni.uIntensity;
  } else if (uni.uOffsetType < 1.5) {
    // sine
    return sin(band * uni.uFreq * TWO_PI + uni.uPhase) * uni.uIntensity;
  } else {
    // stepped
    return round(hashNoise(band * 3.7)) * uni.uIntensity;
  }
}

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0=clamp(i32(floor(x)),0,w-1); let y0=clamp(i32(floor(y)),0,h-1);
  let x1=clamp(x0+1,0,w-1); let y1=clamp(y0+1,0,h-1);
  let fx=x-floor(x); let fy=y-floor(y);
  return mix(
    mix(textureLoad(tIn,vec2i(x0,y0),0), textureLoad(tIn,vec2i(x1,y0),0), fx),
    mix(textureLoad(tIn,vec2i(x0,y1),0), textureLoad(tIn,vec2i(x1,y1),0), fx), fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let bs = max(1.0, uni.uBandSize);
  var sx: f32; var sy: f32;
  if (uni.uAxis < 0.5) {
    // horizontal: shift row by column offset
    let band   = floor(f32(y) / bs);
    let offset = bandOffset(band);
    sx = f32(x) + offset;
    sy = f32(y);
  } else {
    // vertical: shift column by row offset
    let band   = floor(f32(x) / bs);
    let offset = bandOffset(band);
    sx = f32(x);
    sy = f32(y) + offset;
  }
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uAxis; uniform float uIntensity; uniform float uBandSize;
uniform int   uOffsetType; uniform float uPhase; uniform float uFreq; uniform float uNoiseScale;

in  vec2 vUV;
out vec4 fragColor;

const float TWO_PI = 6.28318530717959;

float hashNoise(float v) { return fract(sin(v*127.1)*43758.5453123); }

float bandOffset(float band) {
  if (uOffsetType == 0) {
    float n = hashNoise(band * uNoiseScale + uPhase);
    return (n * 2.0 - 1.0) * uIntensity;
  } else if (uOffsetType == 1) {
    return sin(band * uFreq * TWO_PI + uPhase) * uIntensity;
  } else {
    return round(hashNoise(band * 3.7)) * uIntensity;
  }
}

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  float bs   = max(1.0, uBandSize);
  vec2  px   = vUV * res;
  vec2  src;
  if (uAxis == 0) {
    float band = floor(px.y / bs);
    src = vec2(px.x + bandOffset(band), px.y) / res;
  } else {
    float band = floor(px.x / bs);
    src = vec2(px.x, px.y + bandOffset(band)) / res;
  }
  fragColor = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`,gpuBindings:{uniforms:{uAxis:`i32`,uIntensity:`f32`,uBandSize:`f32`,uOffsetType:`i32`,uPhase:`f32`,uFreq:`f32`,uNoiseScale:`f32`},multiPass:!1,uniformMap:e=>({uAxis:vt[e.axis]??0,uIntensity:e.intensity,uBandSize:e.bandSize,uOffsetType:yt[e.offsetType]??0,uPhase:e.phase,uFreq:e.freq,uNoiseScale:e.noiseScale})}}),xt={noise:0,radial:1,vortex:2},St=I({type:`advection`,name:`ADVECTION`,category:`WARP`,params:{frame:{value:0,min:0,max:240,step:1,label:`FRAME`,tier:3,driveable:!0,unit:`frames`},velocityType:{value:`noise`,type:`select`,options:[`noise`,`radial`,`vortex`],label:`VELOCITY`,tier:3},steps:{value:5,min:1,max:30,step:1,label:`STEPS`,tier:3,previewMax:3,driveable:!0,unit:`steps`},speed:{value:2,min:.1,max:20,step:.1,label:`SPEED`,tier:3,driveable:!0,unit:`px/step`},noiseScale:{value:3,min:.1,max:20,step:.1,label:`NOISE SC`,tier:4,driveable:!0,unit:`×`,when:{param:`velocityType`,equals:`noise`}}},apply(e,t,n,r,i,a,o){let s=a?.nodeSeed??42;(!this._noise||this._noiseSeed!==s)&&(this._noise=new ct(s),this._noiseSeed=s);let c=a?.quality===`preview`?`nearest`:`bilinear`,l=i.steps;l=Y(l,i.frame),t.set(mt(e,n,r,i.velocityType,l,i.speed,i.noiseScale,this._noise,c))},wgsl:`
struct Uniforms {
  uWidth        : f32,
  uHeight       : f32,
  uVelocityType : f32,
  uSteps        : f32,
  uSpeed        : f32,
  uNoiseScale   : f32,
  _pad          : f32,
  _pad2         : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn hash2(n: f32) -> f32 { return fract(sin(n) * 43758.5453123); }
fn fade(t: f32) -> f32  { return t*t*t*(t*(t*6.0-15.0)+10.0); }

fn grad2(h: f32, x: f32, y: f32) -> f32 {
  let idx=i32(h*7.)%8;
  let gx=array<f32,8>(1.,-1.,1.,-1.,0.,0.,1.,-1.);
  let gy=array<f32,8>(1.,1.,-1.,1.,1.,-1.,0.,0.);
  return gx[idx]*x+gy[idx]*y;
}

fn perlin(px: f32, py: f32) -> f32 {
  let ix=floor(px);let iy=floor(py);let fx=px-ix;let fy=py-iy;
  let ux=fade(fx);let uy=fade(fy);
  return mix(mix(grad2(hash2(ix+iy*57.),fx,fy),grad2(hash2(ix+1.+iy*57.),fx-1.,fy),ux),
             mix(grad2(hash2(ix+(iy+1.)*57.),fx,fy-1.),grad2(hash2(ix+1.+(iy+1.)*57.),fx-1.,fy-1.),ux),uy);
}

fn velocity(px: f32, py: f32, vtype: i32, sc: f32) -> vec2f {
  if (vtype == 0) {
    return vec2f(perlin(px*sc, py*sc), perlin(px*sc+5.2, py*sc+1.3));
  } else if (vtype == 1) {
    // radial from centre
    let dx=px-0.5; let dy=py-0.5;
    let len=sqrt(dx*dx+dy*dy);
    return select(vec2f(0.0), vec2f(dx,dy)/len, len > 0.001);
  } else {
    // vortex (perpendicular to radial)
    let dx=px-0.5; let dy=py-0.5;
    let len=sqrt(dx*dx+dy*dy);
    return select(vec2f(0.0), vec2f(-dy,dx)/len, len > 0.001);
  }
}

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0=clamp(i32(floor(x)),0,w-1);let y0=clamp(i32(floor(y)),0,h-1);
  let x1=clamp(x0+1,0,w-1);let y1=clamp(y0+1,0,h-1);
  let fx=x-floor(x);let fy=y-floor(y);
  return mix(mix(textureLoad(tIn,vec2i(x0,y0),0),textureLoad(tIn,vec2i(x1,y0),0),fx),
             mix(textureLoad(tIn,vec2i(x0,y1),0),textureLoad(tIn,vec2i(x1,y1),0),fx),fy);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x=i32(id.x);let y=i32(id.y);
  let w=i32(uni.uWidth);let h=i32(uni.uHeight);
  if(x>=w||y>=h){return;}

  let vtype=i32(uni.uVelocityType);
  let steps=clamp(i32(uni.uSteps),1,30);
  let speed=uni.uSpeed;
  let sc=uni.uNoiseScale;

  var wx=f32(x);var wy=f32(y);
  for(var s=0;s<steps;s++){
    let v=velocity(wx/uni.uWidth, wy/uni.uHeight, vtype, sc);
    wx+=v.x*speed;
    wy+=v.y*speed;
  }
  textureStore(tOut, vec2i(x,y), bilinear(wx,wy,w,h));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uVelocityType;
uniform float uSteps; uniform float uSpeed; uniform float uNoiseScale;

in  vec2 vUV;
out vec4 fragColor;

float hash2(float n){return fract(sin(n)*43758.5453123);}
float fade(float t){return t*t*t*(t*(t*6.-15.)+10.);}

float grad2(float h,float x,float y){
  int idx=int(h*7.)%8;
  float gx[8];float gy[8];
  gx[0]=1.;gx[1]=-1.;gx[2]=1.;gx[3]=-1.;gx[4]=0.;gx[5]=0.;gx[6]=1.;gx[7]=-1.;
  gy[0]=1.;gy[1]=1.;gy[2]=-1.;gy[3]=1.;gy[4]=1.;gy[5]=-1.;gy[6]=0.;gy[7]=0.;
  return gx[idx]*x+gy[idx]*y;
}

float perlinN(float px,float py){
  float ix=floor(px);float iy=floor(py);float fx=px-ix;float fy=py-iy;
  float ux=fade(fx);float uy=fade(fy);
  return mix(mix(grad2(hash2(ix+iy*57.),fx,fy),grad2(hash2(ix+1.+iy*57.),fx-1.,fy),ux),
             mix(grad2(hash2(ix+(iy+1.)*57.),fx,fy-1.),grad2(hash2(ix+1.+(iy+1.)*57.),fx-1.,fy-1.),ux),uy);
}

vec2 vel(float px,float py,float sc){
  if(uVelocityType==0) return vec2(perlinN(px*sc,py*sc),perlinN(px*sc+5.2,py*sc+1.3));
  vec2 d=vec2(px-.5,py-.5);float l=length(d);
  if(l<0.001) return vec2(0.);
  if(uVelocityType==1) return d/l;
  return vec2(-d.y,d.x)/l;
}

void main(){
  vec2 res=vec2(textureSize(uTex,0));
  int steps=clamp(int(uSteps),1,30);
  float wx=vUV.x;float wy=vUV.y;
  for(int s=0;s<30;s++){
    if(s>=steps)break;
    vec2 v=vel(wx,wy,uNoiseScale);
    wx+=v.x*uSpeed/res.x;wy+=v.y*uSpeed/res.y;
  }
  fragColor=texture(uTex,clamp(vec2(wx,wy),vec2(0.),vec2(1.)));
}
`,gpuBindings:{uniforms:{uVelocityType:`i32`,uSteps:`f32`,uSpeed:`f32`,uNoiseScale:`f32`},multiPass:!1,uniformMap:e=>({uVelocityType:xt[e.velocityType]??0,uSteps:e.steps,uSpeed:e.speed,uNoiseScale:e.noiseScale})}}),Ct=I({type:`ripple`,name:`RADIAL RIPPLE`,category:`REFRACTION`,params:{centreX:{value:.5,min:0,max:1,step:.01,label:`CENTRE X`,tier:3,driveable:!0,unit:`0–1`},centreY:{value:.5,min:0,max:1,step:.01,label:`CENTRE Y`,tier:3,driveable:!0,unit:`0–1`},amplitude:{value:15,min:0,max:100,step:.5,label:`AMPLITUDE`,tier:3,driveable:!0,unit:`px`},frequency:{value:10,min:.5,max:50,step:.5,label:`FREQUENCY`,tier:3,driveable:!0,unit:`Hz`},phase:{value:0,min:0,max:6.28,step:.01,label:`PHASE`,tier:4,driveable:!0,unit:`rad`},falloff:{value:1,min:0,max:5,step:.1,label:`FALLOFF`,tier:4,unit:`n`}},apply(e,t,n,r,i,a){let o=a?.quality===`preview`?`nearest`:`bilinear`;t.set(ht(e,n,r,i.centreX,i.centreY,i.amplitude,i.frequency,i.phase,i.falloff,o))},wgsl:`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uCentreX   : f32,
  uCentreY   : f32,
  uAmplitude : f32,
  uFrequency : f32,
  uPhase     : f32,
  uFalloff   : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const TWO_PI : f32 = 6.28318530717959;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1); let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0+1, 0, w-1);          let y1 = clamp(y0+1, 0, h-1);
  let fx = x - floor(x); let fy = y - floor(y);
  return mix(
    mix(textureLoad(tIn, vec2i(x0,y0), 0), textureLoad(tIn, vec2i(x1,y0), 0), fx),
    mix(textureLoad(tIn, vec2i(x0,y1), 0), textureLoad(tIn, vec2i(x1,y1), 0), fx),
    fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let cx   = uni.uCentreX * uni.uWidth;
  let cy   = uni.uCentreY * uni.uHeight;
  let dx   = f32(x) - cx;
  let dy   = f32(y) - cy;
  let dist = sqrt(dx * dx + dy * dy);

  var sx = f32(x); var sy = f32(y);
  if (dist > 0.0) {
    let falloff    = pow(max(dist, 1.0), -uni.uFalloff);
    let wave       = sin(dist * uni.uFrequency * TWO_PI / min(uni.uWidth, uni.uHeight) + uni.uPhase);
    let dispMag    = uni.uAmplitude * wave * falloff;
    sx = f32(x) + (dx / dist) * dispMag;
    sy = f32(y) + (dy / dist) * dispMag;
  }
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uCentreX; uniform float uCentreY;
uniform float uAmplitude; uniform float uFrequency;
uniform float uPhase; uniform float uFalloff;

in  vec2 vUV;
out vec4 fragColor;

const float TWO_PI = 6.28318530717959;

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  vec2  uvc  = vec2(uCentreX, uCentreY);
  vec2  d    = (vUV - uvc) * res;  // pixel space
  float dist = length(d);
  vec2  src  = vUV;
  if (dist > 0.0) {
    float fo   = pow(max(dist, 1.0), -uFalloff);
    float wave = sin(dist * uFrequency * TWO_PI / min(res.x, res.y) + uPhase);
    float disp = uAmplitude * wave * fo;
    src = vUV + (d / dist) * disp / res;
  }
  fragColor = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`,gpuBindings:{uniforms:{uCentreX:`f32`,uCentreY:`f32`,uAmplitude:`f32`,uFrequency:`f32`,uPhase:`f32`,uFalloff:`f32`},multiPass:!1,uniformMap:e=>({uCentreX:e.centreX,uCentreY:e.centreY,uAmplitude:e.amplitude,uFrequency:e.frequency,uPhase:e.phase,uFalloff:e.falloff})}}),wt=I({type:`lensbubbles`,name:`LENS BUBBLES`,category:`REFRACTION`,params:{count:{value:5,min:1,max:30,step:1,label:`COUNT`,tier:3,driveable:!0,unit:`n`,previewMax:10},magnification:{value:1.5,min:.2,max:5,step:.1,label:`MAGNIFY`,tier:3,driveable:!0,unit:`×`},minRadius:{value:.03,min:.01,max:.3,step:.01,label:`MIN RAD`,tier:4,driveable:!0,unit:`0–1`},maxRadius:{value:.12,min:.02,max:.5,step:.01,label:`MAX RAD`,tier:4,driveable:!0,unit:`0–1`},edgeSoft:{value:.2,min:0,max:1,step:.01,label:`EDGE SOFT`,tier:4,driveable:!0,unit:`0–1`}},apply(e,t,r,i,a,o,s){let c=new n(o?.nodeSeed??42),l=o?.quality===`preview`?`nearest`:`bilinear`,u=a.minRadius,d=Math.max(u,a.maxRadius);t.set(gt(e,r,i,a.count,u,d,a.magnification,a.edgeSoft,c,l))},wgsl:`
struct Uniforms {
  uWidth         : f32,
  uHeight        : f32,
  uCount         : f32,
  uMagnification : f32,
  uMinRadius     : f32,
  uMaxRadius     : f32,
  uEdgeSoft      : f32,
  uSeed          : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// LCG matching JS SeededRNG
fn lcg(s: u32) -> u32 { return (s * 1664525u + 1013904223u) & 0xFFFFFFFFu; }
fn lcgF(s_in: u32) -> vec2<f32> {
  let s0 = lcg(s_in);
  let s1 = lcg(s0);
  return vec2f(f32(s0 % 65536u) / 65535.0, f32(s1 % 65536u) / 65535.0);
}

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0=clamp(i32(floor(x)),0,w-1);let y0=clamp(i32(floor(y)),0,h-1);
  let x1=clamp(x0+1,0,w-1);let y1=clamp(y0+1,0,h-1);
  let fx=x-floor(x);let fy=y-floor(y);
  return mix(mix(textureLoad(tIn,vec2i(x0,y0),0),textureLoad(tIn,vec2i(x1,y0),0),fx),
             mix(textureLoad(tIn,vec2i(x0,y1),0),textureLoad(tIn,vec2i(x1,y1),0),fx),fy);
}

const MAX_BUBBLES : i32 = 30;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x=i32(id.x);let y=i32(id.y);
  let w=i32(uni.uWidth);let h=i32(uni.uHeight);
  if(x>=w||y>=h){return;}

  let count  = min(i32(uni.uCount), MAX_BUBBLES);
  let rRange = uni.uMaxRadius - uni.uMinRadius;
  let pxF    = f32(x); let pyF = f32(y);
  var sx     = pxF; var sy = pyF;
  var seed   = u32(uni.uSeed) + 1u;

  for (var i = 0; i < MAX_BUBBLES; i++) {
    if (i >= count) { break; }
    // Generate bubble centre and radius from seeded LCG
    let p1 = lcgF(seed);       seed = lcg(seed + u32(i) * 3u);
    let p2 = lcgF(seed);       seed = lcg(seed + u32(i) * 7u);
    let p3 = lcgF(seed);       seed = lcg(seed + u32(i) * 13u);
    let bx = p1.x * uni.uWidth;
    let by = p1.y * uni.uHeight;
    let br = (uni.uMinRadius + p3.x * rRange) * min(uni.uWidth, uni.uHeight);

    let dx = pxF - bx; let dy = pyF - by;
    let dist = sqrt(dx*dx + dy*dy);
    if (dist < br) {
      // Apply lens distortion inside bubble
      let norm = dist / max(br, 0.001);
      // Edge softness blend factor
      let edgeR = br * (1.0 - uni.uEdgeSoft);
      let blend  = select(1.0, (br - dist) / max(br - edgeR, 0.001), dist > edgeR);
      // Spherical refraction: remap sample position toward centre
      let refract = norm / max(uni.uMagnification * (1.0 - sqrt(1.0 - norm*norm)), 0.001);
      let factor  = select(1.0, refract / max(norm, 0.001), norm > 0.001);
      sx = bx + dx * factor * blend + pxF * (1.0 - blend);
      sy = by + dy * factor * blend + pyF * (1.0 - blend);
      break; // first bubble wins
    }
  }
  textureStore(tOut, vec2i(x,y), bilinear(sx, sy, w, h));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uCount; uniform float uMagnification;
uniform float uMinRadius; uniform float uMaxRadius;
uniform float uEdgeSoft; uniform float uSeed;

in  vec2 vUV;
out vec4 fragColor;

// LCG PRNG
uint lcg(uint s) { return s * 1664525u + 1013904223u; }
float lcgF(inout uint s) { s = lcg(s); return float(s % 65536u) / 65535.0; }

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  vec2  pxF  = vUV * res;
  int   count = min(int(uCount), 30);
  float rRange = uMaxRadius - uMinRadius;
  vec2  src = pxF;
  uint seed = uint(uSeed) + 1u;

  for (int i = 0; i < 30; i++) {
    if (i >= count) break;
    float bx = lcgF(seed) * res.x; seed = lcg(seed + uint(i) * 3u);
    float by = lcgF(seed) * res.y; seed = lcg(seed + uint(i) * 7u);
    float br = (uMinRadius + lcgF(seed) * rRange) * min(res.x, res.y); seed = lcg(seed + uint(i) * 13u);
    vec2  d  = pxF - vec2(bx, by);
    float dist = length(d);
    if (dist < br) {
      float norm   = dist / max(br, 0.001);
      float edgeR  = br * (1.0 - uEdgeSoft);
      float blend  = (dist > edgeR) ? (br - dist) / max(br - edgeR, 0.001) : 1.0;
      float refract = norm / max(uMagnification * (1.0 - sqrt(1.0 - norm*norm)), 0.001);
      float factor  = (norm > 0.001) ? refract / norm : 1.0;
      src = vec2(bx, by) + d * factor * blend + pxF * (1.0 - blend);
      break;
    }
  }
  fragColor = texture(uTex, clamp(src / res, vec2(0.0), vec2(1.0)));
}
`,gpuBindings:{uniforms:{uCount:`f32`,uMagnification:`f32`,uMinRadius:`f32`,uMaxRadius:`f32`,uEdgeSoft:`f32`,uSeed:`f32`},multiPass:!1,uniformMap:e=>({uCount:e.count,uMagnification:e.magnification,uMinRadius:e.minRadius,uMaxRadius:Math.max(e.minRadius,e.maxRadius),uEdgeSoft:e.edgeSoft,uSeed:42})}});function Tt(e,t,n,r,i){let a=Math.max(0,Math.min(t-1,Math.round(r)));return(Math.max(0,Math.min(n-1,Math.round(i)))*t+a)*4}function Et(e,t,n,r,i,a,o){let s=Math.floor(r),c=Math.floor(i),l=r-s,u=i-c,d=s<0?0:s>=t?t-1:s,f=s+1>=t?t-1:s+1<0?0:s+1,p=c<0?0:c>=n?n-1:c,m=c+1>=n?n-1:c+1<0?0:c+1,h=(p*t+d)*4,g=(p*t+f)*4,_=(m*t+d)*4,v=(m*t+f)*4,y=1-l,b=1-u,x=y*b,S=l*b,C=y*u,w=l*u;a[o]=e[h]*x+e[g]*S+e[_]*C+e[v]*w,a[o+1]=e[h+1]*x+e[g+1]*S+e[_+1]*C+e[v+1]*w,a[o+2]=e[h+2]*x+e[g+2]*S+e[_+2]*C+e[v+2]*w,a[o+3]=e[h+3]*x+e[g+3]*S+e[_+3]*C+e[v+3]*w}function Dt(e,t,n,r=.5,i=.5,a=.5,o=.5,s=`bilinear`){let c=i*t,l=a*n,u=o*Math.min(t,n),d=u*u,f=new Uint8ClampedArray(e.length),p=s!==`nearest`;for(let i=0;i<n;i++)for(let a=0;a<t;a++){let o=a-c,s=i-l,m=o*o+s*s,h=(i*t+a)*4;if(m<d){let i=Math.sqrt(m),a=i/u,d=r>0?a**+(1+r)*u:a**(1/(1-r))*u,g=i>.001?d/i:1;if(p)Et(e,t,n,c+o*g,l+s*g,f,h);else{let r=Tt(e,t,n,c+o*g,l+s*g);f[h]=e[r],f[h+1]=e[r+1],f[h+2]=e[r+2],f[h+3]=e[r+3]}}else f[h]=e[h],f[h+1]=e[h+1],f[h+2]=e[h+2],f[h+3]=e[h+3]}return f}function Ot(e,t,n,r=180,i=.5,a=.5,o=.5,s=`bilinear`){let c=i*t,l=a*n,u=o*Math.min(t,n),d=r*Math.PI/180,f=new Uint8ClampedArray(e.length),p=s!==`nearest`;for(let r=0;r<n;r++)for(let i=0;i<t;i++){let a=i-c,o=r-l,s=Math.sqrt(a*a+o*o),m=(r*t+i)*4;if(s<u){let r=1-s/u,i=r*r*d,h=Math.cos(i),g=Math.sin(i),_=c+a*h-o*g,v=l+a*g+o*h;if(p)Et(e,t,n,_,v,f,m);else{let r=Tt(e,t,n,_,v);f[m]=e[r],f[m+1]=e[r+1],f[m+2]=e[r+2],f[m+3]=e[r+3]}}else f[m]=e[m],f[m+1]=e[m+1],f[m+2]=e[m+2],f[m+3]=e[m+3]}return f}function kt(e,t,n,r=8){let i=Math.max(2,r),a=new Uint8ClampedArray(e.length);for(let r=0;r<n;r+=i)for(let o=0;o<t;o+=i){let s=0,c=0,l=0,u=0,d=Math.min(r+i,n),f=Math.min(o+i,t);for(let n=r;n<d;n++)for(let r=o;r<f;r++){let i=(n*t+r)*4;s+=e[i],c+=e[i+1],l+=e[i+2],u++}s=Math.round(s/u),c=Math.round(c/u),l=Math.round(l/u);for(let n=r;n<d;n++)for(let r=o;r<f;r++){let i=(n*t+r)*4;a[i]=s,a[i+1]=c,a[i+2]=l,a[i+3]=e[i+3]}}return a}function At(e,t,n,r=`rectToPolar`,i=.5,a=.5){let o=i*t,s=a*n,c=Math.sqrt(o*o+s*s),l=new Uint8ClampedArray(e.length);for(let i=0;i<n;i++)for(let a=0;a<t;a++){let u,d;if(r===`rectToPolar`){let e=i/n*c,r=a/t*Math.PI*2;u=o+Math.cos(r)*e,d=s+Math.sin(r)*e}else{let e=a-o,r=i-s,l=Math.sqrt(e*e+r*r);u=(Math.atan2(r,e)+Math.PI)/(Math.PI*2)*t,d=l/c*n}let f=(i*t+a)*4;Et(e,t,n,u,d,l,f)}return l}let jt=I({type:`pixelate`,name:`PIXELATE`,category:`DISTORTION`,params:{blockSize:{value:8,min:2,max:100,step:1,label:`BLOCK SIZE`,tier:3,previewMax:20,driveable:!0,unit:`px`}},apply(e,t,n,r,i){t.set(kt(e,n,r,i.blockSize))},wgsl:`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uBlockSize : f32,
  _pad       : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let bs  = max(1.0, uni.uBlockSize);
  let bx  = i32(floor(f32(x) / bs) * bs + bs * 0.5);
  let by  = i32(floor(f32(y) / bs) * bs + bs * 0.5);
  let sx  = clamp(bx, 0, w-1);
  let sy  = clamp(by, 0, h-1);
  textureStore(tOut, vec2i(x, y), textureLoad(tIn, vec2i(sx, sy), 0));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uBlockSize;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2  res = vec2(textureSize(uTex, 0));
  float bs  = max(1.0, uBlockSize);
  vec2  px  = vUV * res;
  vec2  block = floor(px / bs) * bs + bs * 0.5;
  fragColor = texture(uTex, clamp(block / res, vec2(0.0), vec2(1.0)));
}
`,gpuBindings:{uniforms:{uBlockSize:`f32`},multiPass:!1,uniformMap:e=>({uBlockSize:e.blockSize})}}),Mt=I({type:`polarcoords`,name:`POLAR COORDS`,category:`DISTORTION`,params:{mode:{value:`rectToPolar`,type:`select`,options:[`rectToPolar`,`polarToRect`],label:`MODE`,tier:3},centreX:{value:.5,min:0,max:1,step:.01,label:`CENTRE X`,tier:4,driveable:!0,unit:`0–1`},centreY:{value:.5,min:0,max:1,step:.01,label:`CENTRE Y`,tier:4,driveable:!0,unit:`0–1`}},apply(e,t,n,r,i,a){t.set(At(e,n,r,i.mode,i.centreX,i.centreY))},wgsl:`
struct Uniforms {
  uWidth   : f32,
  uHeight  : f32,
  uMode    : f32,  // 0=rectToPolar, 1=polarToRect
  uCentreX : f32,
  uCentreY : f32,
  _pad     : f32,
  _pad2    : f32,
  _pad3    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI     : f32 = 3.14159265358979;
const TWO_PI : f32 = 6.28318530717959;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1); let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0+1, 0, w-1);          let y1 = clamp(y0+1, 0, h-1);
  let fx = x - floor(x); let fy = y - floor(y);
  return mix(
    mix(textureLoad(tIn, vec2i(x0,y0), 0), textureLoad(tIn, vec2i(x1,y0), 0), fx),
    mix(textureLoad(tIn, vec2i(x0,y1), 0), textureLoad(tIn, vec2i(x1,y1), 0), fx),
    fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let cx  = uni.uCentreX * uni.uWidth;
  let cy  = uni.uCentreY * uni.uHeight;
  let maxR = sqrt(cx * cx + cy * cy);

  var sx: f32; var sy: f32;
  if (uni.uMode < 0.5) {
    // rectToPolar: current pixel → its polar angle/radius → map to image
    let dx  = f32(x) - cx; let dy = f32(y) - cy;
    let r   = sqrt(dx*dx + dy*dy);
    var ang = atan2(dy, dx);
    if (ang < 0.0) { ang += TWO_PI; }
    sx = (ang / TWO_PI) * uni.uWidth;
    sy = (1.0 - r / max(maxR, 1.0)) * uni.uHeight;
  } else {
    // polarToRect: interpret pixel x=angle, y=radius → rectangular
    let ang = (f32(x) / uni.uWidth) * TWO_PI;
    let r   = (1.0 - f32(y) / uni.uHeight) * maxR;
    sx = cx + cos(ang) * r;
    sy = cy + sin(ang) * r;
  }
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uMode;
uniform float uCentreX;
uniform float uCentreY;

in  vec2 vUV;
out vec4 fragColor;

const float PI     = 3.14159265358979;
const float TWO_PI = 6.28318530717959;

void main() {
  vec2  res = vec2(textureSize(uTex, 0));
  float cx  = uCentreX; float cy = uCentreY;
  float maxR = sqrt(cx*cx + cy*cy);

  vec2 src;
  if (uMode == 0) {
    vec2  d   = vUV - vec2(cx, cy);
    float r   = length(d);
    float ang = atan(d.y, d.x);
    if (ang < 0.0) ang += TWO_PI;
    src = vec2(ang / TWO_PI, 1.0 - r / max(maxR, 0.001));
  } else {
    float ang = vUV.x * TWO_PI;
    float r   = (1.0 - vUV.y) * maxR;
    src = vec2(cx + cos(ang) * r, cy + sin(ang) * r);
  }
  fragColor = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`,gpuBindings:{uniforms:{uMode:`i32`,uCentreX:`f32`,uCentreY:`f32`},multiPass:!1,uniformMap:e=>({uMode:e.mode===`rectToPolar`?0:1,uCentreX:e.centreX,uCentreY:e.centreY})}}),Nt=I({type:`spherize`,name:`SPHERIZE`,category:`DISTORTION`,params:{amount:{value:.5,min:-1,max:1,step:.01,label:`AMOUNT`,tier:3,driveable:!0,unit:`-1–1`},radius:{value:.5,min:.01,max:1,step:.01,label:`RADIUS`,tier:3,driveable:!0,unit:`0–1`},centreX:{value:.5,min:0,max:1,step:.01,label:`CENTRE X`,tier:4,driveable:!0,unit:`0–1`},centreY:{value:.5,min:0,max:1,step:.01,label:`CENTRE Y`,tier:4,driveable:!0,unit:`0–1`}},apply(e,t,n,r,i,a,o){let s=a?.quality===`preview`?`nearest`:`bilinear`;t.set(Dt(e,n,r,i.amount,i.centreX,i.centreY,i.radius,s))},wgsl:`
struct Uniforms {
  uWidth   : f32,
  uHeight  : f32,
  uAmount  : f32,
  uRadius  : f32,
  uCentreX : f32,
  uCentreY : f32,
  _pad     : f32,
  _pad2    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1); let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0 + 1, 0, w-1);       let y1 = clamp(y0 + 1, 0, h-1);
  let fx = x - floor(x); let fy = y - floor(y);
  return mix(
    mix(textureLoad(tIn, vec2i(x0,y0), 0), textureLoad(tIn, vec2i(x1,y0), 0), fx),
    mix(textureLoad(tIn, vec2i(x0,y1), 0), textureLoad(tIn, vec2i(x1,y1), 0), fx),
    fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let cx   = uni.uCentreX * uni.uWidth;
  let cy   = uni.uCentreY * uni.uHeight;
  let maxR = uni.uRadius * min(uni.uWidth, uni.uHeight) * 0.5;
  let dx   = f32(x) - cx;
  let dy   = f32(y) - cy;
  let dist = sqrt(dx * dx + dy * dy);

  if (dist >= maxR || maxR <= 0.0) {
    textureStore(tOut, vec2i(x, y), textureLoad(tIn, vec2i(x, y), 0));
    return;
  }

  let norm = dist / maxR;
  // Spherical lens: remap norm using arcsin-based formula
  let sphere = select(
    norm * (1.0 + uni.uAmount * (1.0 - sqrt(1.0 - norm * norm))),
    norm * (1.0 + uni.uAmount * (1.0 / max(sqrt(1.0 - norm * norm), 0.001) - 1.0)),
    uni.uAmount > 0.0,
  );
  let factor = select(1.0, sphere / norm, norm > 0.0);
  let sx = cx + dx * factor;
  let sy = cy + dy * factor;
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uAmount;
uniform float uRadius;
uniform float uCentreX;
uniform float uCentreY;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  vec2  uvc  = vec2(uCentreX, uCentreY);
  vec2  d    = vUV - uvc;
  // Normalise by radius in UV space
  float maxR = uRadius * 0.5;
  vec2  dn   = d / max(maxR, 0.001);
  float norm = length(dn);
  if (norm >= 1.0) { fragColor = texture(uTex, vUV); return; }
  float sphere;
  if (uAmount > 0.0)
    sphere = norm * (1.0 + uAmount * (1.0 / max(sqrt(1.0 - norm*norm), 0.001) - 1.0));
  else
    sphere = norm * (1.0 + uAmount * (1.0 - sqrt(1.0 - norm*norm)));
  float factor = (norm > 0.0) ? sphere / norm : 1.0;
  vec2  src = uvc + d * factor;
  fragColor = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`,gpuBindings:{uniforms:{uAmount:`f32`,uRadius:`f32`,uCentreX:`f32`,uCentreY:`f32`},multiPass:!1,uniformMap:e=>({uAmount:e.amount,uRadius:e.radius,uCentreX:e.centreX,uCentreY:e.centreY})}}),Pt=I({type:`twirl`,name:`TWIRL`,category:`DISTORTION`,params:{angle:{value:180,min:-720,max:720,step:1,label:`ANGLE`,tier:3,unit:`deg`,driveable:!0},radius:{value:.5,min:.01,max:1,step:.01,label:`RADIUS`,tier:3,driveable:!0,unit:`0–1`},centreX:{value:.5,min:0,max:1,step:.01,label:`CENTRE X`,tier:4,driveable:!0,unit:`0–1`},centreY:{value:.5,min:0,max:1,step:.01,label:`CENTRE Y`,tier:4,driveable:!0,unit:`0–1`}},apply(e,t,n,r,i,a){let o=a?.quality===`preview`?`nearest`:`bilinear`;t.set(Ot(e,n,r,i.angle,i.centreX,i.centreY,i.radius,o))},wgsl:`
struct Uniforms {
  uWidth   : f32,
  uHeight  : f32,
  uAngle   : f32,
  uRadius  : f32,
  uCentreX : f32,
  uCentreY : f32,
  _pad     : f32,
  _pad2    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI : f32 = 3.14159265358979;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1);
  let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0 + 1, 0, w-1);
  let y1 = clamp(y0 + 1, 0, h-1);
  let fx = x - floor(x); let fy = y - floor(y);
  let tl = textureLoad(tIn, vec2i(x0, y0), 0);
  let tr = textureLoad(tIn, vec2i(x1, y0), 0);
  let bl = textureLoad(tIn, vec2i(x0, y1), 0);
  let br = textureLoad(tIn, vec2i(x1, y1), 0);
  return mix(mix(tl, tr, fx), mix(bl, br, fx), fy);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let cx  = uni.uCentreX * uni.uWidth;
  let cy  = uni.uCentreY * uni.uHeight;
  let maxR = uni.uRadius * min(uni.uWidth, uni.uHeight) * 0.5;
  let dx  = f32(x) - cx;
  let dy  = f32(y) - cy;
  let dist = sqrt(dx * dx + dy * dy);
  var sx  = f32(x);
  var sy  = f32(y);
  if (dist < maxR && maxR > 0.0) {
    let t   = 1.0 - dist / maxR;
    let rot = uni.uAngle * PI / 180.0 * t;
    let cosA = cos(rot); let sinA = sin(rot);
    sx = cx + cosA * dx - sinA * dy;
    sy = cy + sinA * dx + cosA * dy;
  }
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uAngle;
uniform float uRadius;
uniform float uCentreX;
uniform float uCentreY;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  float cx   = uCentreX;
  float cy   = uCentreY;
  float maxR = uRadius * min(res.x, res.y) * 0.5 / res.x; // normalised
  vec2  uvc  = vec2(cx, cy);
  vec2  d    = vUV - uvc;
  // Account for aspect ratio in distance
  vec2  da   = d * vec2(res.x / res.y, 1.0);
  float dist = length(da) * res.y / min(res.x, res.y);
  vec2  src  = vUV;
  if (dist < uRadius * 0.5) {
    float t   = 1.0 - dist / (uRadius * 0.5);
    float rot = uAngle * PI / 180.0 * t;
    float c   = cos(rot); float s = sin(rot);
    src = uvc + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
  }
  fragColor = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`,gpuBindings:{uniforms:{uAngle:`f32`,uRadius:`f32`,uCentreX:`f32`,uCentreY:`f32`},multiPass:!1,uniformMap:e=>({uAngle:e.angle,uRadius:e.radius,uCentreX:e.centreX,uCentreY:e.centreY})}}),Ft={uniforms:{uStrength:`f32`,uRedScale:`f32`,uGreenScale:`f32`,uBlueScale:`f32`,uCentreX:`f32`,uCentreY:`f32`},multiPass:!1,uniformMap:e=>({uStrength:e.strength,uRedScale:e.redScale,uGreenScale:e.greenScale,uBlueScale:e.blueScale,uCentreX:e.centreX,uCentreY:e.centreY})};function It(e,t,n,r,i,a,o,s){if(s){let s=Math.round(r),c=Math.round(i),l,u;if(o===`mirror`)l=s<0?-s:s>=t?2*t-2-s:s,u=c<0?-c:c>=n?2*n-2-c:c,l=Math.max(0,Math.min(t-1,l)),u=Math.max(0,Math.min(n-1,u));else if(o===`wrap`)l=(s%t+t)%t,u=(c%n+n)%n;else if(o===`transparent`){if(s<0||s>=t||c<0||c>=n)return 0;l=s,u=c}else l=Math.max(0,Math.min(t-1,s)),u=Math.max(0,Math.min(n-1,c));return e[(u*t+l)*4+a]}let c=Math.floor(r),l=Math.floor(i),u=r-c,d=i-l;function f(e,t){return o===`mirror`?(e=e<0?-e:e>=t?2*t-2-e:e,Math.max(0,Math.min(t-1,e))):o===`wrap`?(e%t+t)%t:Math.max(0,Math.min(t-1,e))}function p(e,r){return o===`transparent`&&(e<0||e>=t||r<0||r>=n)}let m=c,h=c+1,g=l,_=l+1,v=p(m,g)?0:e[(f(g,n)*t+f(m,t))*4+a],y=p(h,g)?0:e[(f(g,n)*t+f(h,t))*4+a],b=p(m,_)?0:e[(f(_,n)*t+f(m,t))*4+a],x=p(h,_)?0:e[(f(_,n)*t+f(h,t))*4+a];return v*(1-u)*(1-d)+y*u*(1-d)+b*(1-u)*d+x*u*d}function Lt(e,t){return t===`linear`?e:t===`quadratic`?e*e:t===`cubic`?e*e*e:t===`smoothstep`?e*e*(3-2*e):e}let Rt=I({type:`chromaticab`,name:`CHROMATIC AB`,category:`DISTORTION`,params:{strength:{value:4,min:0,max:50,step:.5,label:`STRENGTH`,tier:3,driveable:!0,unit:`px`},redScale:{value:1,min:-2,max:2,step:.05,label:`RED SCALE`,tier:3,driveable:!0,unit:`×`},greenScale:{value:0,min:-1,max:1,step:.05,label:`GREEN SCALE`,tier:3,driveable:!0,unit:`×`},blueScale:{value:-1,min:-2,max:2,step:.05,label:`BLUE SCALE`,tier:3,driveable:!0,unit:`×`},centreX:{value:.5,min:0,max:1,step:.01,label:`CENTRE X`,tier:4,driveable:!0,unit:`0–1`},centreY:{value:.5,min:0,max:1,step:.01,label:`CENTRE Y`,tier:4,driveable:!0,unit:`0–1`},falloff:{value:`quadratic`,type:`select`,options:[`linear`,`quadratic`,`cubic`,`smoothstep`],label:`FALLOFF`,tier:4},edgeMode:{value:`clamp`,type:`select`,options:[`clamp`,`mirror`,`wrap`,`transparent`],label:`EDGE MODE`,tier:4},samplingMode:{value:`bilinear`,type:`select`,options:[`nearest`,`bilinear`],label:`SAMPLING MODE`,tier:4},radiusNorm:{value:`corner distance`,type:`select`,options:[`min dimension`,`max dimension`,`corner distance`],label:`RADIUS NORM`,tier:4}},apply(e,t,n,r,i,a,o){let s=i.samplingMode===`nearest`||a?.quality===`preview`,c;c=i.radiusNorm===`min dimension`?Math.min(n,r)/2:i.radiusNorm===`max dimension`?Math.max(n,r)/2:Math.sqrt(n*n+r*r)/2;for(let a=0;a<r;a++)for(let l=0;l<n;l++){let u=a*n+l,d=u*4,f=o(`centreX`,u)*n,p=o(`centreY`,u)*r,m=l-f,h=a-p,g=Math.sqrt(m*m+h*h),_=Lt(c>0?Math.min(g/c,1):0,i.falloff),v=o(`strength`,u)*_,y=g>0?g:1,b=m/y,x=h/y,S=v*o(`redScale`,u),C=v*o(`greenScale`,u),w=v*o(`blueScale`,u);t[d]=It(e,n,r,l+b*S,a+x*S,0,i.edgeMode,s),t[d+1]=It(e,n,r,l+b*C,a+x*C,1,i.edgeMode,s),t[d+2]=It(e,n,r,l+b*w,a+x*w,2,i.edgeMode,s),t[d+3]=e[d+3]}},wgsl:`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uStrength   : f32,
  uRedScale   : f32,
  uGreenScale : f32,
  uBlueScale  : f32,
  uCentreX    : f32,
  uCentreY    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn sampleChannel(ox: f32, oy: f32, ch: i32, w: i32, h: i32) -> f32 {
  let x0 = clamp(i32(floor(ox)), 0, w-1); let y0 = clamp(i32(floor(oy)), 0, h-1);
  let x1 = clamp(x0+1, 0, w-1);           let y1 = clamp(y0+1, 0, h-1);
  let fx = ox - floor(ox); let fy = oy - floor(oy);
  let s00 = textureLoad(tIn, vec2i(x0,y0), 0);
  let s10 = textureLoad(tIn, vec2i(x1,y0), 0);
  let s01 = textureLoad(tIn, vec2i(x0,y1), 0);
  let s11 = textureLoad(tIn, vec2i(x1,y1), 0);
  let v00 = select(select(s00.b, s00.g, ch==1), s00.r, ch==0);
  let v10 = select(select(s10.b, s10.g, ch==1), s10.r, ch==0);
  let v01 = select(select(s01.b, s01.g, ch==1), s01.r, ch==0);
  let v11 = select(select(s11.b, s11.g, ch==1), s11.r, ch==0);
  return mix(mix(v00, v10, fx), mix(v01, v11, fx), fy);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let cx   = uni.uCentreX * uni.uWidth;
  let cy   = uni.uCentreY * uni.uHeight;
  let dx   = f32(x) - cx; let dy = f32(y) - cy;
  let dist = sqrt(dx * dx + dy * dy);
  let maxR = sqrt(cx*cx + cy*cy + (uni.uWidth-cx)*(uni.uWidth-cx) + (uni.uHeight-cy)*(uni.uHeight-cy)) * 0.5;
  let t    = select(0.0, min(dist / max(maxR, 1.0), 1.0), dist > 0.0);
  let ft   = t * t; // quadratic falloff
  let nx   = select(0.0, dx / dist, dist > 0.0);
  let ny   = select(0.0, dy / dist, dist > 0.0);
  let S    = uni.uStrength * ft;

  let rOff = S * uni.uRedScale;
  let gOff = S * uni.uGreenScale;
  let bOff = S * uni.uBlueScale;

  let r = sampleChannel(f32(x) + nx * rOff, f32(y) + ny * rOff, 0, w, h);
  let g = sampleChannel(f32(x) + nx * gOff, f32(y) + ny * gOff, 1, w, h);
  let b = sampleChannel(f32(x) + nx * bOff, f32(y) + ny * bOff, 2, w, h);
  let a = textureLoad(tIn, vec2i(x, y), 0).a;
  textureStore(tOut, vec2i(x, y), vec4f(r, g, b, a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uStrength;
uniform float uRedScale; uniform float uGreenScale; uniform float uBlueScale;
uniform float uCentreX; uniform float uCentreY;

in  vec2 vUV;
out vec4 fragColor;

float sampleCh(vec2 uv, int ch) {
  vec4 s = texture(uTex, clamp(uv, vec2(0.0), vec2(1.0)));
  return (ch == 0) ? s.r : ((ch == 1) ? s.g : s.b);
}

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  vec2  uvc  = vec2(uCentreX, uCentreY);
  vec2  d    = (vUV - uvc) * res; // pixel space offset
  float dist = length(d);
  float maxR = length(res) * 0.5;
  float t    = (dist > 0.0) ? min(dist / max(maxR, 1.0), 1.0) : 0.0;
  float ft   = t * t;
  vec2  n    = (dist > 0.0) ? d / dist : vec2(0.0);
  float S    = uStrength * ft;

  vec2 uvR = vUV + n * S * uRedScale   / res;
  vec2 uvG = vUV + n * S * uGreenScale / res;
  vec2 uvB = vUV + n * S * uBlueScale  / res;

  float alpha = texture(uTex, vUV).a;
  fragColor = vec4(sampleCh(uvR, 0), sampleCh(uvG, 1), sampleCh(uvB, 2), alpha);
}
`,gpuBindings:Ft});function zt(e,t,n,r,i,a,o,s,c,l,u){let d=new Float32Array(t*n),f=new Float32Array(t*n),p=new Float32Array(t*n),m=new Float32Array(t*n),h=new Float32Array(t*n),g=t*.5,_=n*.5;for(let v=0;v<r;v++){let r=(u.next()-.5)*2*i,y=(u.next()-.5)*2*a,b=(u.next()-.5)*2*c*Math.PI/180,x=1+(u.next()-.5)*2*l,S=o===`decay`?s**+v:1,C=Math.cos(b)*x,w=Math.sin(b)*x;for(let i=0;i<n;i++)for(let a=0;a<t;a++){let o=a-g,s=i-_,c=i*t+a,l=o*C-s*w+g+r,u=o*w+s*C+_+y,v=Math.floor(l),b=Math.floor(u),x=l-v,T=u-b,E=v<0?0:v>=t?t-1:v,D=v+1>=t?t-1:v+1<0?0:v+1,O=b<0?0:b>=n?n-1:b,k=b+1>=n?n-1:b+1<0?0:b+1,A=(O*t+E)*4,j=(O*t+D)*4,M=(k*t+E)*4,N=(k*t+D)*4,P=(1-x)*(1-T),F=x*(1-T),I=(1-x)*T,L=x*T;d[c]+=(e[A]*P+e[j]*F+e[M]*I+e[N]*L)*S,f[c]+=(e[A+1]*P+e[j+1]*F+e[M+1]*I+e[N+1]*L)*S,p[c]+=(e[A+2]*P+e[j+2]*F+e[M+2]*I+e[N+2]*L)*S,m[c]+=(e[A+3]*P+e[j+3]*F+e[M+3]*I+e[N+3]*L)*S,h[c]+=S}}let v=new Uint8ClampedArray(e.length);for(let e=0;e<n;e++)for(let n=0;n<t;n++){let r=e*t+n,i=r*4,a=h[r]||1;v[i]=d[r]/a,v[i+1]=f[r]/a,v[i+2]=p[r]/a,v[i+3]=m[r]/a}return v}let Bt=I({type:`iterrewarp`,name:`ITER REWARP`,category:`ACCUMULATION`,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},samples:{label:`SAMPLES`,min:2,max:20,step:1,value:5,tier:3,previewMax:8,driveable:!0,unit:`n`},jitterX:{label:`JITTER X`,min:0,max:100,step:1,value:10,tier:3,unit:`px`,driveable:!0},jitterY:{label:`JITTER Y`,min:0,max:100,step:1,value:10,tier:3,unit:`px`,driveable:!0},opacityMode:{label:`BLEND`,type:`select`,options:[`EQUAL`,`DECAY`],value:`DECAY`,tier:3},decay:{label:`DECAY`,min:.1,max:.99,step:.01,value:.7,tier:4,driveable:!0,unit:`0–1`,when:{param:`opacityMode`,equals:`DECAY`}},rotJitter:{label:`ROT JITTER`,min:0,max:10,step:.1,value:0,tier:5,unit:`deg`,driveable:!0},scaleJitter:{label:`SC JITTER`,min:0,max:.5,step:.01,value:0,tier:5,driveable:!0,unit:`n`}},apply(e,t,i,a,o,s){let c=o.samples;c=Y(c,o.frame);let l=s?.nodeSeed??42,u=new n(typeof r==`function`?r(l,0,999):l);t.set(zt(e,i,a,c,o.jitterX,o.jitterY,o.opacityMode.toLowerCase(),o.decay,o.rotJitter,o.scaleJitter,u))}});function Vt(e){let t=new Float32Array(e.vectors.length);for(let n=0;n<e.vectors.length;n+=2){let r=e.vectors[n],i=e.vectors[n+1],a=Math.hypot(r,i)||1;t[n]=r/a,t[n+1]=i/a}return{width:e.width,height:e.height,vectors:t}}function Ht(e,t,n){return Math.max(t,Math.min(n,e))}function Ut(e,t,n,r=`nearest`){let{vectors:i,width:a,height:o}=e;if(r===`nearest`){let e=Math.round(Ht(t,0,a-1)),r=(Math.round(Ht(n,0,o-1))*a+e)*2;return[i[r],i[r+1]]}let s=Math.floor(Ht(t,0,a-1)),c=Math.floor(Ht(n,0,o-1)),l=Ht(s+1,0,a-1),u=Ht(c+1,0,o-1),d=t-s,f=n-c,p=(e,t)=>{let n=(t*a+e)*2;return[i[n],i[n+1]]},m=p(s,c),h=p(l,c),g=p(s,u),_=p(l,u),v=(e,t,n)=>e+(t-e)*n,y=[v(m[0],h[0],d),v(m[1],h[1],d)],b=[v(g[0],_[0],d),v(g[1],_[1],d)];return[v(y[0],b[0],f),v(y[1],b[1],f)]}function Wt(e,t,n,r){return{x:Math.max(0,Math.min(n-1,e)),y:Math.max(0,Math.min(r-1,t))}}function Gt(e){let t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a of e)for(let e of a)e.x<t&&(t=e.x),e.y<n&&(n=e.y),e.x>r&&(r=e.x),e.y>i&&(i=e.y);return Number.isFinite(t)?{minX:t,minY:n,maxX:r,maxY:i}:{minX:0,minY:0,maxX:0,maxY:0}}function Kt(e,{steps:t=64,stepFn:n,terminateFn:r=null}={}){let i=[e],a=e;for(let e=0;e<t;e++){let t=n(a,e,i);if(!t||r?.(t,e,i))break;i.push(t),a=t}return i}function qt({field:e,seeds:t=[],iterations:n=64,step:r=1,minMove:i=1e-4,occupancy:a=null}){let o=[];for(let s of t){let t=Kt(s,{steps:n,stepFn:t=>{let[n,o]=Ut(e,t.x,t.y,`bilinear`),s=t.x+n*r,c=t.y+o*r;if(Math.hypot(s-t.x,c-t.y)<i)return null;let l=Wt(s,c,e.width,e.height);if(a){let e=`${Math.round(l.x)},${Math.round(l.y)}`;if(a.has(e))return null;a.add(e)}return l}});o.push(t)}return{lines:o,bounds:Gt(o)}}function Jt(e,t,n,r){let i=t*n,a=new Float32Array(i);for(let t=0;t<i;t++){let n=t*4;a[t]=(.2126*e[n]+.7152*e[n+1]+.0722*e[n+2])/255}let o=new Float32Array(i),s=new Float32Array(i);for(let e=1;e<n-1;e++)for(let n=1;n<t-1;n++){let r=e*t+n;o[r]=-a[(e-1)*t+n-1]+a[(e-1)*t+n+1]-2*a[e*t+n-1]+2*a[e*t+n+1]-a[(e+1)*t+n-1]+a[(e+1)*t+n+1],s[r]=-a[(e-1)*t+n-1]-2*a[(e-1)*t+n]-a[(e-1)*t+n+1]+a[(e+1)*t+n-1]+2*a[(e+1)*t+n]+a[(e+1)*t+n+1]}let c=a,l=new Float32Array(i),u=new Float32Array(i),d=Math.max(r*2,.001);for(let e=0;e<i;e++){let t=Math.sqrt(o[e]*o[e]+s[e]*s[e]),n=0;t>r&&(n=Math.min((t-r)/d,1),n=n*n*(3-2*n)),t>1e-4?(l[e]=o[e]/t,u[e]=s[e]/t):(l[e]=0,u[e]=0)}return{lum:c,cos:l,sin:u,w:t,h:n}}function Yt(e,t,n){let r=Math.max(0,Math.min(~~t,e.w-1)),i=Math.max(0,Math.min(~~n,e.h-1))*e.w+r;return{lum:e.lum[i],cx:-e.sin[i],cy:e.cos[i]}}function Xt(e,t,n,r){let i=[],a=Math.PI*2,o=t/2,s=n/2;if(e===`horizontal`||e===`grid`){for(let e=0;e<n;e+=r){let n=[];for(let r=0;r<t;r++)n.push({x:r,y:e});i.push(n)}if(e===`grid`)for(let e=0;e<t;e+=r){let t=[];for(let r=0;r<n;r++)t.push({x:e,y:r});i.push(t)}}else if(e===`vertical`)for(let e=0;e<t;e+=r){let t=[];for(let r=0;r<n;r++)t.push({x:e,y:r});i.push(t)}else if(e===`diagonal`){Math.sqrt(t*t+n*n);for(let e=-n;e<t+n;e+=r){let r=[];for(let i=0;i<t+n;i++){let a=e+i*.707,o=i*.707;a>=0&&a<t&&o>=0&&o<n&&r.push({x:a,y:o})}r.length>2&&i.push(r)}}else if(e===`radial`){let e=Math.sqrt(o*o+s*s),t=r*.02;for(let n=0;n<a;n+=t){let t=[];for(let r=0;r<e;r+=2)t.push({x:o+Math.cos(n)*r,y:s+Math.sin(n)*r});t.length>1&&i.push(t)}}else if(e===`concentric`){let e=Math.sqrt(o*o+s*s);for(let t=r;t<e;t+=r){let e=Math.max(60,~~(t*.5)),n=[];for(let r=0;r<=e;r++){let i=r/e*a;n.push({x:o+Math.cos(i)*t,y:s+Math.sin(i)*t})}i.push(n)}}return i}function Zt({src:e,width:t,height:n,pattern:r=`horizontal`,spacing:i=8,resolution:a=2,amplitude:o=15,lumExp:s=1,damping:c=.95,iterations:l=3}){let u=Jt(e,t,n,.02),d=Xt(r,t,n,i),f=d.map(e=>Math.ceil(e.length/a)),p=f.map(e=>new Float32Array(e*2));for(let e=0;e<l;e++){let e=1-c;for(let t=0;t<d.length;t++){let n=p[t];for(let t=0;t<n.length;t++)n[t]*=e}for(let e=0;e<d.length;e++){let t=d[e];for(let n=0;n<f[e];n++){let r=n*a;if(r>=t.length)break;let i=Yt(u,t[r].x,t[r].y).lum**+s;p[e][n*2]+=i*o*.5,p[e][n*2+1]+=i*o}}}let m=[];for(let e=0;e<d.length;e++){let t=d[e],n=[];for(let r=0;r<f[e];r++){let i=r*a;if(i>=t.length)break;n.push({x:t[i].x+p[e][r*2],y:t[i].y+p[e][r*2+1]})}n.length>1&&m.push(n)}return{lines:m,bounds:Gt(m)}}let Qt=I({type:`lumflow`,name:`LUMINANCE FLOW`,category:`LINE`,isVector:!0,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},patternType:{label:`PATTERN`,type:`select`,options:[`HORIZONTAL`,`VERTICAL`,`DIAGONAL`,`GRID`,`RADIAL`,`CONCENTRIC`],value:`HORIZONTAL`,tier:3},spacing:{label:`SPACING`,min:1,max:40,step:1,value:8,tier:3,unit:`px`,driveable:!0,previewMax:8},strokeWeight:{label:`STROKE W`,min:.1,max:4,step:.1,value:.7,tier:3,unit:`px`,driveable:!0},resolution:{label:`STEP`,min:1,max:10,step:1,value:2,tier:4,driveable:!0,unit:`n`},amplitude:{label:`AMPLITUDE`,min:0,max:80,step:1,value:15,tier:3,unit:`px`,driveable:!0},lumExp:{label:`LUM EXP`,min:.2,max:4,step:.1,value:1,tier:4,driveable:!0,unit:`n`},damping:{label:`DAMPING`,min:.01,max:1,step:.01,value:.95,tier:4,driveable:!0,unit:`0–1`},iterations:{label:`ITERATIONS`,min:1,max:20,step:1,value:3,tier:4,previewMax:2,driveable:!0,unit:`n`},bgBrightness:{label:`BG LEVEL`,min:0,max:255,step:1,value:10,tier:4,driveable:!0,unit:`lvl`}},applyVector(e,t,n,r,i){let a=i?.quality===`preview`?Math.min(r.iterations,2):r.iterations;return a=Y(a,r.frame),{lines:Zt({src:e,width:t,height:n,pattern:r.patternType.toLowerCase(),spacing:r.spacing,resolution:r.resolution,amplitude:r.amplitude,lumExp:r.lumExp,damping:r.damping,iterations:a}).lines,strokeRGBA:[255,255,255,204],strokeWidth:r.strokeWeight,clearRGBA:[r.bgBrightness,r.bgBrightness,r.bgBrightness,255]}},apply(e,t,n,r,i,a,o){let s=a?.quality===`preview`?Math.min(i.iterations,2):i.iterations;s=Y(s,i.frame);let c=Zt({src:e,width:n,height:r,pattern:i.patternType.toLowerCase(),spacing:i.spacing,resolution:i.resolution,amplitude:i.amplitude,lumExp:i.lumExp,damping:i.damping,iterations:s});t.set(l({basePixels:e,width:n,height:r,lines:c.lines,strokeRGBA:[255,255,255,204],strokeWidth:i.strokeWeight,clearRGBA:[i.bgBrightness,i.bgBrightness,i.bgBrightness,255],opacity:1}))},buildGeometry(e,t,n,r,i){if(!i||i.length<e*t*4)return[];let a=r?.quality===`preview`?Math.min(n.iterations,2):n.iterations;return a=Y(a,n.frame),Zt({src:i,width:e,height:t,pattern:n.patternType.toLowerCase(),spacing:n.spacing,resolution:n.resolution,amplitude:n.amplitude,lumExp:n.lumExp,damping:n.damping,iterations:a}).lines||[]}});function $t({width:e,height:t,luminanceAt:n,mode:r=`flow`,spacing:i=6,amplitude:a=2.5,frequency:o=1,baseSpeed:s=.5,dragLight:c=0,dragDark:l=.5,iterations:u=200,spawnRate:d=1,topBound:f=0,bottomBound:p=1,responseCurve:m=`linear`,curveStrength:h=1}){let g=e-2,_=2+f*(t-4),v=2+p*(t-4),y=_,b=Math.max(1,Math.round(i/Math.max(.01,s))),x=[],S=1/0,C=e=>{if(m===`exponential`)return e**+Math.max(.1,h);if(m===`sigmoid`){let t=Math.max(.1,h)*10;return 1/(1+Math.exp(-t*(e-.5)))}return e};for(let e=0;e<u;e++){if(S++,S>=b){for(let e=0;e<Math.max(1,Math.round(d));e++){let e=[];for(let t=2;t<=g;t++)e.push({linePos:t,flowPos:y+Math.sin(t*o*.01)*a});x.push({points:e,complete:!1})}S=0}for(let e of x){if(e.complete)continue;let t=!0;for(let r of e.points){if(r.flowPos>=v)continue;let e=C(1-n(r.linePos,r.flowPos)),i=c+(l-c)*e;r.flowPos+=s*(1-i),r.flowPos>=v?r.flowPos=v:t=!1}t&&(e.complete=!0)}}let w=x.filter(e=>e.points&&e.points.length>1).map(e=>e.points.map(e=>({x:e.linePos,y:e.flowPos})));return{lines:w,bounds:Gt(w)}}function en(e,t,n,r,i){return e[Math.max(0,Math.min(n-1,Math.floor(i)))*t+Math.max(0,Math.min(t-1,Math.floor(r)))]}let tn=I({type:`serpentine`,name:`SERPENTINE`,category:`LINE`,isVector:!0,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},spacing:{label:`SPACING`,min:2,max:40,step:1,value:6,tier:3,unit:`px`,driveable:!0,previewMax:10},amplitude:{label:`AMPLITUDE`,min:.5,max:20,step:.5,value:2.5,tier:3,unit:`px`,driveable:!0},frequency:{label:`FREQUENCY`,min:.1,max:5,step:.1,value:1,tier:3,driveable:!0,unit:`Hz`},baseSpeed:{label:`SPEED`,min:.05,max:3,step:.05,value:.5,tier:3,driveable:!0,unit:`n`,previewMax:.5},dragLight:{label:`DRAG LIGHT`,min:0,max:.8,step:.01,value:0,tier:4,driveable:!0,unit:`0–1`},dragDark:{label:`DRAG DARK`,min:0,max:.95,step:.01,value:.5,tier:4,driveable:!0,unit:`0–1`},iterations:{label:`ITERATIONS`,min:10,max:2e3,step:10,value:200,tier:4,previewMax:60,driveable:!0,unit:`n`},strokeW:{label:`STROKE W`,min:.25,max:4,step:.25,value:1,tier:3,unit:`px`,driveable:!0},bgColor:{label:`BG LEVEL`,min:0,max:255,step:1,value:255,tier:4,driveable:!0,unit:`lvl`},strokeColor:{label:`STROKE LVL`,min:0,max:255,step:1,value:0,tier:4,driveable:!0,unit:`lvl`},lineOpacity:{label:`LINE OPACITY`,min:0,max:1,step:.01,value:1,tier:4,driveable:!0,unit:`0–1`},spawnRate:{label:`SPAWN RATE`,min:1,max:8,step:1,value:1,tier:4,driveable:!0,unit:`n`},topBound:{label:`TOP BOUND`,min:0,max:1,step:.01,value:0,tier:4,driveable:!0,unit:`0–1`},bottomBound:{label:`BOTTOM BOUND`,min:0,max:1,step:.01,value:1,tier:4,driveable:!0,unit:`0–1`},responseCurve:{label:`RESPONSE CURVE`,type:`select`,value:`linear`,options:[`linear`,`exponential`,`sigmoid`],tier:4},curveStrength:{label:`CURVE STRENGTH`,min:.1,max:5,step:.1,value:1,tier:4,driveable:!0,unit:`n`}},applyVector(e,t,n,r,i){let a=t*n,o=new Float32Array(a);for(let t=0;t<a;t++){let n=t*4;o[t]=(.2126*e[n]+.7152*e[n+1]+.0722*e[n+2])/255}let s=i?.quality===`preview`?Math.min(r.iterations,60):r.iterations;return s=Y(s,r.frame),{lines:$t({width:t,height:n,luminanceAt:(e,r)=>en(o,t,n,e,r),spacing:r.spacing,amplitude:r.amplitude,frequency:r.frequency,baseSpeed:r.baseSpeed,dragLight:r.dragLight,dragDark:r.dragDark,iterations:s,spawnRate:r.spawnRate,topBound:r.topBound,bottomBound:r.bottomBound,responseCurve:r.responseCurve,curveStrength:r.curveStrength}).lines,strokeRGBA:[r.strokeColor,r.strokeColor,r.strokeColor,255],strokeWidth:r.strokeW,clearRGBA:[r.bgColor,r.bgColor,r.bgColor,255]}},apply(e,t,n,r,i,a,o){let s=n*r,c=new Float32Array(s);for(let t=0;t<s;t++){let n=t*4;c[t]=(.2126*e[n]+.7152*e[n+1]+.0722*e[n+2])/255}let u=o(`spacing`,0),d=o(`amplitude`,0),f=o(`frequency`,0),p=o(`baseSpeed`,0),m=o(`dragLight`,0),h=o(`dragDark`,0),g=o(`strokeW`,0),_=o(`bgColor`,0),v=o(`strokeColor`,0),y=o(`lineOpacity`,0),b=o(`spawnRate`,0),x=o(`topBound`,0),S=o(`bottomBound`,0),C=o(`curveStrength`,0),w=a?.quality===`preview`?Math.min(i.iterations,60):i.iterations;w=Y(w,i.frame);let T=$t({width:n,height:r,luminanceAt:(e,t)=>en(c,n,r,e,t),spacing:u,amplitude:d,frequency:f,baseSpeed:p,dragLight:m,dragDark:h,iterations:w,spawnRate:b,topBound:x,bottomBound:S,responseCurve:i.responseCurve,curveStrength:C});t.set(l({basePixels:e,width:n,height:r,lines:T.lines,strokeRGBA:[v,v,v,255],strokeWidth:g,clearRGBA:[_,_,_,255],opacity:y}))},buildGeometry(e,t,n,r,i){if(!i||i.length<e*t*4)return[];let a=e*t,o=new Float32Array(a);for(let e=0;e<a;e++){let t=e*4;o[e]=(.2126*i[t]+.7152*i[t+1]+.0722*i[t+2])/255}let s=r?.quality===`preview`?Math.min(n.iterations,60):n.iterations;return s=Y(s,n.frame),$t({width:e,height:t,luminanceAt:(n,r)=>en(o,e,t,n,r),spacing:n.spacing,amplitude:n.amplitude,frequency:n.frequency,baseSpeed:n.baseSpeed,dragLight:n.dragLight,dragDark:n.dragDark,iterations:s,spawnRate:n.spawnRate,topBound:n.topBound,bottomBound:n.bottomBound,responseCurve:n.responseCurve,curveStrength:n.curveStrength}).lines||[]}});function nn(e,t=`linear`,n=2){if(t===`exponential`)return e**+n;if(t===`logarithmic`)return Math.log(1+e*(Math.exp(n)-1))/n;if(t===`sigmoid`){let t=n*2;return 1/(1+Math.exp(-t*(e-.5)))}return e}function rn({width:e,height:t,luminanceAt:n,lineSpacing:r=8,sampleStep:i=1,maxAmplitude:a=3,frequency:o=60,phaseOffset:s=0,phaseIncrement:c=0,ampCurve:l=`linear`,ampCurveStrength:u=2,horizontal:d=!0,invert:f=!1,padding:p=0}){let m=[],h=d?e:t,g=Math.max(1,Math.floor(((d?t:e)-2*p)/r)+1);for(let e=0;e<g;e++){let t=p+e*r,g=s+e*c,_=[];for(let e=p;e<=h-p;e+=i){let r=n(d?e:t,d?t:e);f&&(r=1-r);let i=a*nn(1-r,l,u)*Math.sin(e/Math.max(1,h)*o+g);_.push(d?{x:e,y:t+i}:{x:t+i,y:e})}m.push(_)}return{lines:m,bounds:Gt(m)}}function an(e,t,n,r,i){return e[Math.max(0,Math.min(n-1,Math.floor(i)))*t+Math.max(0,Math.min(t-1,Math.floor(r)))]}let on=I({type:`statichalftone`,name:`STATIC HALFTONE`,category:`LINE`,isVector:!0,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},spacing:{label:`SPACING`,min:2,max:40,step:1,value:6,tier:3,unit:`px`,driveable:!0},maxAmplitude:{label:`MAX AMP`,min:.5,max:30,step:.5,value:3,tier:3,unit:`px`,driveable:!0},frequency:{label:`FREQUENCY`,min:5,max:300,step:1,value:60,tier:3,driveable:!0,unit:`cyc`},sampleStep:{label:`DENSITY`,min:.5,max:5,step:.25,value:1,tier:4,driveable:!0,unit:`n`},phaseOffset:{label:`PHASE`,min:0,max:6.28,step:.01,value:0,tier:4,driveable:!0,unit:`rad`},phaseInc:{label:`PHASE INC`,min:0,max:3.14,step:.01,value:0,tier:5,driveable:!0,unit:`rad`},ampCurve:{label:`AMP CURVE`,type:`select`,options:[`LINEAR`,`EXPONENTIAL`,`LOGARITHMIC`,`SIGMOID`],value:`LINEAR`,tier:4},curveStrength:{label:`CURVE STR`,min:.5,max:5,step:.1,value:2,tier:5,driveable:!0,unit:`n`,when:{param:`ampCurve`,notEquals:`LINEAR`}},orientation:{label:`ORIENT`,type:`select`,options:[`HORIZONTAL`,`VERTICAL`],value:`HORIZONTAL`,tier:3},strokeW:{label:`STROKE W`,min:.25,max:4,step:.25,value:1,tier:3,unit:`px`,driveable:!0},bgColor:{label:`BG LEVEL`,min:0,max:255,step:1,value:255,tier:4,driveable:!0,unit:`lvl`},strokeColor:{label:`STROKE LVL`,min:0,max:255,step:1,value:0,tier:4,driveable:!0,unit:`lvl`}},applyVector(e,t,n,r,i){let a=t*n,o=new Float32Array(a);for(let t=0;t<a;t++){let n=t*4;o[t]=(.2126*e[n]+.7152*e[n+1]+.0722*e[n+2])/255}let s=r.phaseOffset+r.frame*.02;return{lines:rn({width:t,height:n,luminanceAt:(e,r)=>an(o,t,n,e,r),lineSpacing:r.spacing,sampleStep:r.sampleStep,maxAmplitude:r.maxAmplitude,frequency:r.frequency,phaseOffset:s,phaseIncrement:r.phaseInc,ampCurve:r.ampCurve.toLowerCase(),ampCurveStrength:r.curveStrength,horizontal:r.orientation===`HORIZONTAL`,padding:2}).lines,strokeRGBA:[r.strokeColor,r.strokeColor,r.strokeColor,255],strokeWidth:r.strokeW,clearRGBA:[r.bgColor,r.bgColor,r.bgColor,255]}},apply(e,t,n,r,i,a,o){let s=n*r,c=new Float32Array(s);for(let t=0;t<s;t++){let n=t*4;c[t]=(.2126*e[n]+.7152*e[n+1]+.0722*e[n+2])/255}let u=i.phaseOffset+i.frame*.02,d=rn({width:n,height:r,luminanceAt:(e,t)=>an(c,n,r,e,t),lineSpacing:i.spacing,sampleStep:i.sampleStep,maxAmplitude:i.maxAmplitude,frequency:i.frequency,phaseOffset:u,phaseIncrement:i.phaseInc,ampCurve:i.ampCurve.toLowerCase(),ampCurveStrength:i.curveStrength,horizontal:i.orientation===`HORIZONTAL`,padding:2});t.set(l({basePixels:e,width:n,height:r,lines:d.lines,strokeRGBA:[i.strokeColor,i.strokeColor,i.strokeColor,255],strokeWidth:i.strokeW,clearRGBA:[i.bgColor,i.bgColor,i.bgColor,255],opacity:1}))},buildGeometry(e,t,n,r,i){if(!i||i.length<e*t*4)return[];let a=e*t,o=new Float32Array(a);for(let e=0;e<a;e++){let t=e*4;o[e]=(.2126*i[t]+.7152*i[t+1]+.0722*i[t+2])/255}let s=n.phaseOffset+n.frame*.02;return rn({width:e,height:t,luminanceAt:(n,r)=>an(o,e,t,n,r),lineSpacing:n.spacing,sampleStep:n.sampleStep,maxAmplitude:n.maxAmplitude,frequency:n.frequency,phaseOffset:s,phaseIncrement:n.phaseInc,ampCurve:n.ampCurve.toLowerCase(),ampCurveStrength:n.curveStrength,horizontal:n.orientation===`HORIZONTAL`,padding:2}).lines||[]}});function sn(e){let t=new Float32Array(e.length>>2);for(let n=0,r=0;n<e.length;n+=4,r++)t[r]=e[n]*.299+e[n+1]*.587+e[n+2]*.114;return t}function cn(e,t,n,r=!0){let i=sn(e),a=new Float32Array(t*n*2),o=(e,r)=>i[Math.max(0,Math.min(n-1,r))*t+Math.max(0,Math.min(t-1,e))];for(let e=0;e<n;e++)for(let n=0;n<t;n++){let i=-o(n-1,e-1)+o(n+1,e-1)+-2*o(n-1,e)+2*o(n+1,e)+-o(n-1,e+1)+o(n+1,e+1),s=-o(n-1,e-1)-2*o(n,e-1)-o(n+1,e-1)+o(n-1,e+1)+2*o(n,e+1)+o(n+1,e+1),c=(e*t+n)*2;if(r){let e=Math.hypot(i,s)||1;a[c]=i/e,a[c+1]=s/e}else a[c]=i,a[c+1]=s}return{width:t,height:n,vectors:a}}function ln(e,t,n){let r=[];for(let i=n;i<t;i+=n)for(let t=n;t<e;t+=n)r.push({x:t,y:i});return r}let un=I({type:`moduleflowlines`,name:`MODULE FLOW LINES`,category:`LINE`,isVector:!0,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},spacing:{label:`SPACING`,min:2,max:40,step:1,value:8,tier:3,unit:`px`,driveable:!0,previewMax:8},iterations:{label:`ITERATIONS`,min:4,max:200,step:1,value:24,tier:3,previewMax:12,driveable:!0,unit:`n`},stepSize:{label:`STEP`,min:.25,max:5,step:.25,value:1,tier:4,unit:`px`,driveable:!0},strokeW:{label:`STROKE W`,min:.25,max:4,step:.25,value:1,tier:3,unit:`px`,driveable:!0},bgColor:{label:`BG LEVEL`,min:0,max:255,step:1,value:255,tier:4,driveable:!0,unit:`lvl`},strokeColor:{label:`STROKE LVL`,min:0,max:255,step:1,value:0,tier:4,driveable:!0,unit:`lvl`}},applyVector(e,t,n,r,i){let a=Vt(cn(e,t,n,!0)),o=ln(t,n,Math.max(2,r.spacing)),s=r.iterations;return s=Y(s,r.frame),{lines:qt({field:a,seeds:o,iterations:s,step:r.stepSize}).lines,strokeRGBA:[r.strokeColor,r.strokeColor,r.strokeColor,255],strokeWidth:r.strokeW,clearRGBA:[r.bgColor,r.bgColor,r.bgColor,255]}},apply(e,t,n,r,i,a,o){let s=Vt(cn(e,n,r,!0)),c=ln(n,r,Math.max(2,i.spacing)),u=i.iterations;u=Y(u,i.frame);let d=qt({field:s,seeds:c,iterations:u,step:i.stepSize});t.set(l({basePixels:e,width:n,height:r,lines:d.lines,strokeRGBA:[i.strokeColor,i.strokeColor,i.strokeColor,255],strokeWidth:i.strokeW,clearRGBA:[i.bgColor,i.bgColor,i.bgColor,255],opacity:1}))},buildGeometry(e,t,n,r,i){if(!i||i.length<e*t*4)return[];let a=Vt(cn(i,e,t,!0)),o=ln(e,t,Math.max(2,n.spacing)),s=n.iterations;return s=Y(s,n.frame),qt({field:a,seeds:o,iterations:s,step:n.stepSize}).lines||[]}});function dn(e,t){let n=new Float32Array(t);for(let r=0;r<t;r++){let t=r*4;n[r]=e[t]*.299+e[t+1]*.587+e[t+2]*.114}return n}function fn(e,t,n){let r=t*n,i=new Float32Array(r),a=new Float32Array(r),o=new Float32Array(r),s=new Float32Array(r);for(let r=1;r<n-1;r++)for(let n=1;n<t-1;n++){let c=r*t+n,l=-e[c-t-1]+e[c-t+1]-2*e[c-1]+2*e[c+1]-e[c+t-1]+e[c+t+1],u=-e[c-t-1]-2*e[c-t]-e[c-t+1]+e[c+t-1]+2*e[c+t]+e[c+t+1];i[c]=l,a[c]=u,o[c]=Math.hypot(l,u),s[c]=Math.atan2(u,l)}return{gx:i,gy:a,mag:o,ang:s}}function pn(e,t){let n=0;for(let r=0;r<t;r++)e[r]>n&&(n=e[r]);let r=new Float32Array(t),i=n>0?1/n:0;for(let n=0;n<t;n++)r[n]=e[n]*i;return r}function mn(e,t,n){let r=new Float32Array(n);for(let i=0;i<n;i++){let n=i*4,a=e[n]-t[n],o=e[n+1]-t[n+1],s=e[n+2]-t[n+2];r[i]=a*a+o*o+s*s}return r}function hn(e,t,n,r,i,a,o,s){let c=Math.max(0,a-s),l=Math.min(r-1,a+s),u=Math.max(0,o-s),d=Math.min(i-1,o+s);for(let i=u;i<=d;i++)for(let a=c;a<=l;a++){let o=i*r+a,s=o*4,c=t[s]-n[s],l=t[s+1]-n[s+1],u=t[s+2]-n[s+2];e[o]=c*c+l*l+u*u}}function gn(e,t){let n=new Float32Array(t),r=0;for(let n=0;n<t;n++)r+=e[n];if(r===0){for(let e=0;e<t;e++)n[e]=(e+1)/t;return n}let i=0;for(let a=0;a<t;a++)i+=e[a],n[a]=i/r;return n}function _n(e,t){let n=0,r=e.length-1;for(;n<r;){let i=n+r>>1;e[i]<t?n=i+1:r=i}return n}function vn(e,t,n,r,i){if(r===`greyscale`)return[[0,0,0],[64,64,64],[128,128,128],[192,192,192],[255,255,255]];if(r===`warm`)return[[30,10,5],[120,40,20],[200,100,50],[240,180,100],[255,230,200]];if(r===`cool`)return[[5,10,30],[20,40,120],[50,100,200],[100,180,240],[200,230,255]];let a=Math.min(16,Math.max(8,Math.floor(t*n/1e3))),o=[];for(let r=0;r<a;r++){let r=i.nextInt(0,t),a=(i.nextInt(0,n)*t+r)*4;o.push([e[a],e[a+1],e[a+2]])}return o}function yn(e,t,n,r){let i=null,a=1/0;for(let o of e){let e=(o[0]-t)**2+(o[1]-n)**2+(o[2]-r)**2;e<a&&(a=e,i=o)}return i}function bn(e,t,n,r,i,a,o,s,c,l){let u=Math.cos(-c),d=Math.sin(-c),f=o*o,p=s*s,m=Math.max(o,s),h=Math.max(0,Math.floor(r-m)),g=Math.min(t-1,Math.ceil(r+m)),_=Math.max(0,Math.floor(i-m)),v=Math.min(n-1,Math.ceil(i+m)),y=a[3]/255;for(let n=_;n<=v;n++)for(let o=h;o<=g;o++){let s=o-r,c=n-i,m=u*s-d*c,h=d*s+u*c,g=m*m/f+h*h/p;if(g>1)continue;let _=Math.sqrt(g),v=y*(_<=l?1:Math.max(0,1-(_-l)/(1-l+1e-6))),b=1-v,x=(n*t+o)*4;e[x]=e[x]*b+a[0]*v,e[x+1]=e[x+1]*b+a[1]*v,e[x+2]=e[x+2]*b+a[2]*v,e[x+3]=Math.min(255,e[x+3]+255*v)}}function xn(e,t,n,r,i){switch(e){case`GRADIENT ANGLE`:return n[r];case`EDGE TANGENT`:return n[r]+Math.PI*.5;case`MANUAL ANGLE`:return Math.PI/180*t;default:return i.next()*Math.PI*2}}function Sn(e,t,n,r,i,a,o,s,c){let l=new Float32Array(t);if(e===`RANDOM`)return l.fill(1),l;for(let u=0;u<t;u++){let t=1;e===`ERROR DRIVEN`?t=n[u]/195075.000001:e===`EDGE DRIVEN`?t=r[u]:e===`GRADIENT DRIVEN`?t=i[u]:e===`WEIGHTED RANDOM`&&(t=r[u]*o+i[u]*s+a[u]/255*c,t=Math.max(t,.01)),l[u]=t}return l}function Cn(e,t,n,r,i,a,o,s,c,l){let u=(o*s+a)*4,d,f,p;if(n===`SOURCE`)d=e[u],f=e[u+1],p=e[u+2];else if(r&&r.length){let t=e[u],n=e[u+1],i=e[u+2],a=yn(r,t,n,i),o=c;d=a[0]+(t-a[0])*o,f=a[1]+(n-a[1])*o,p=a[2]+(i-a[2])*o}else d=e[u],f=e[u+1],p=e[u+2];return l>0&&(d=Math.max(0,Math.min(255,d+(i.next()*2-1)*l)),f=Math.max(0,Math.min(255,f+(i.next()*2-1)*l)),p=Math.max(0,Math.min(255,p+(i.next()*2-1)*l))),[Math.round(d),Math.round(f),Math.round(p)]}function wn(e,t,n,r,i,a,o,s,c,l,u,d,f,p){let m=Math.min(o.brushMin,o.brushMax),h=Math.max(o.brushMin+1,o.brushMax),g=c>1?1-s/(c-1):1,_=h*(.3+.7*g),v=m*(.3+.7*g),y=Math.max(1,Math.ceil(o.iterations/c)),b=o.paletteMode===`SOURCE`?null:vn(t,n,r,o.paletteMode.toLowerCase(),a),x=o.edgeInfluence??0,S=o.contrastInfluence??0,C=o.luminanceInfluence??0,w=gn(Sn(o.placementMode,i,p,d,l,f,x,S,C),i),T=(o.errorThreshold??255)**2*3,E=o.coverageTarget??1,D=o.painterMode!==`DOT`,O=o.brushHardness??.75,k=D?Math.max(1,o.brushLength??20):1,A=0;for(let i=0;i<y;i++){let i=_n(w,a.next()),s=i%n,c=i/n|0;if(p[i]<T*.01)continue;let l=a.nextRange(v,_),d=o.brushJitter??0,f=d>0?Math.round((a.next()*2-1)*d):0,m=d>0?Math.round((a.next()*2-1)*d):0,h=Math.max(0,Math.min(n-1,s+f)),g=Math.max(0,Math.min(r-1,c+m)),x=a.nextRange(o.minOpacity,o.maxOpacity),[S,C,j]=Cn(t,e,o.paletteMode,b,a,h,g,n,o.paletteBlend??0,o.colourJitter??0);if(D){let s=xn(o.directionSource,o.manualAngle??0,u,i,a),c=Math.max(1,l*k/2),d=Math.max(1,l/2),f=(o.strokeAngleJitter??0)*(Math.PI/180)*(a.next()*2-1);bn(e,n,r,h,g,[S,C,j,x],c,d,s+f,O),hn(p,t,e,n,r,h,g,Math.ceil(c))}else{let i=Math.max(1,Math.round(l/2)),a=i*i;for(let t=-i;t<=i;t++)for(let o=-i;o<=i;o++){let s=o*o+t*t;if(s>a)continue;let c=h+o,l=g+t;if(c<0||l<0||c>=n||l>=r)continue;let u=Math.sqrt(s)/i,d=x/255*(u<=O?1:Math.max(0,1-(u-O)/(1-O+1e-6))),f=1-d,p=(l*n+c)*4;e[p]=e[p]*f+S*d,e[p+1]=e[p+1]*f+C*d,e[p+2]=e[p+2]*f+j*d,e[p+3]=Math.min(255,e[p+3]+255*d)}hn(p,t,e,n,r,h,g,Math.ceil(l/2))}if(A++,A/y>=E)break}}let Tn=I({type:`paintstroke`,name:`PAINT STROKE`,category:`GENERATIVE`,params:{brushMin:{label:`BRUSH MIN`,min:1,max:100,step:1,value:10,tier:3,unit:`px`,driveable:!0},brushMax:{label:`BRUSH MAX`,min:2,max:200,step:1,value:50,tier:3,unit:`px`,driveable:!0},minOpacity:{label:`MIN OPAC`,min:1,max:255,step:1,value:10,tier:3,unit:`lvl`,driveable:!0},maxOpacity:{label:`MAX OPAC`,min:1,max:255,step:1,value:50,tier:3,unit:`lvl`,driveable:!0},iterations:{label:`STROKES`,min:100,max:5e4,step:100,value:5e3,tier:3,previewMax:1e3,unit:`n`,driveable:!0},maxLayers:{label:`MAX LAYERS`,min:1,max:50,step:1,value:15,tier:4,unit:`n`,driveable:!0},paletteMode:{label:`PALETTE`,type:`select`,options:[`SOURCE`,`GREYSCALE`,`WARM`,`COOL`],value:`SOURCE`,tier:4},painterMode:{label:`PAINTER MODE`,type:`select`,options:[`DOT`,`STROKE`,`FLOW STROKE`,`PATCH`,`PALETTE RECONSTRUCTION`],value:`DOT`,tier:3},brushShape:{label:`BRUSH SHAPE`,type:`select`,options:[`SOFT DAB`,`HARD DAB`,`ELLIPSE`,`BRISTLE`,`RIBBON`,`DRY BRUSH`],value:`SOFT DAB`,tier:3},brushHardness:{label:`HARDNESS`,min:0,max:1,step:.01,value:.75,tier:3,unit:`normalised`,driveable:!0},brushLength:{label:`LENGTH`,min:1,max:200,step:1,value:20,tier:3,unit:`px`,driveable:!0,when:{brushShape:[`ELLIPSE`,`BRISTLE`,`RIBBON`]}},brushJitter:{label:`JITTER`,min:0,max:100,step:1,value:5,tier:3,unit:`px`,driveable:!0},edgeSoftness:{label:`EDGE SOFTNESS`,min:0,max:1,step:.01,value:.2,tier:3,unit:`normalised`,driveable:!0,when:{brushShape:[`ELLIPSE`,`BRISTLE`,`RIBBON`]}},placementMode:{label:`PLACEMENT`,type:`select`,options:[`RANDOM`,`WEIGHTED RANDOM`,`ERROR DRIVEN`,`EDGE DRIVEN`,`GRADIENT DRIVEN`,`SALIENCY DRIVEN`],value:`RANDOM`,tier:3},directionSource:{label:`DIRECTION`,type:`select`,options:[`NONE`,`GRADIENT ANGLE`,`EDGE TANGENT`,`FLOW FIELD`,`MANUAL ANGLE`],value:`NONE`,tier:3},manualAngle:{label:`ANGLE`,min:0,max:360,step:1,value:0,tier:3,unit:`°`,driveable:!0,when:{directionSource:`MANUAL ANGLE`}},strokeAngleJitter:{label:`ANGLE JITTER`,min:0,max:180,step:1,value:0,tier:3,unit:`°`,driveable:!0},paletteBlend:{label:`PAL BLEND`,min:0,max:1,step:.01,value:0,tier:4,unit:`normalised`,driveable:!0},colourJitter:{label:`COL JITTER`,min:0,max:255,step:1,value:0,tier:4,unit:`lvl`,driveable:!0},passCount:{label:`PASSES`,min:1,max:6,step:1,value:1,tier:4,unit:`n`,driveable:!0,when:{painterMode:[`STROKE`,`FLOW STROKE`,`PATCH`,`PALETTE RECONSTRUCTION`]}},coverageTarget:{label:`COVERAGE`,min:0,max:1,step:.01,value:1,tier:4,unit:`normalised`,driveable:!0,when:{painterMode:[`STROKE`,`FLOW STROKE`,`PATCH`,`PALETTE RECONSTRUCTION`]}},errorThreshold:{label:`ERR THRESH`,min:0,max:255,step:1,value:0,tier:4,unit:`lvl`,driveable:!0,when:{painterMode:[`STROKE`,`FLOW STROKE`,`PATCH`,`PALETTE RECONSTRUCTION`]}},frame:{label:`FRAME`,min:0,max:5e4,step:1,value:0,tier:3,unit:`n`,driveable:!0},edgeInfluence:{label:`EDGE INF`,min:0,max:1,step:.01,value:0,tier:4,unit:`normalised`,driveable:!0,when:{placementMode:[`WEIGHTED RANDOM`,`ERROR DRIVEN`,`EDGE DRIVEN`,`GRADIENT DRIVEN`]}},contrastInfluence:{label:`CONTRAST INF`,min:0,max:1,step:.01,value:0,tier:4,unit:`normalised`,driveable:!0,when:{placementMode:[`WEIGHTED RANDOM`,`ERROR DRIVEN`,`EDGE DRIVEN`,`GRADIENT DRIVEN`]}},luminanceInfluence:{label:`LUM INF`,min:0,max:1,step:.01,value:0,tier:4,unit:`normalised`,driveable:!0,when:{placementMode:[`WEIGHTED RANDOM`,`ERROR DRIVEN`,`EDGE DRIVEN`,`GRADIENT DRIVEN`]}},hueInfluence:{label:`HUE INF`,min:0,max:1,step:.01,value:0,tier:4,unit:`normalised`,driveable:!0,when:{placementMode:[`WEIGHTED RANDOM`,`ERROR DRIVEN`,`EDGE DRIVEN`,`GRADIENT DRIVEN`]}}},apply(e,t,r,i,a,o,s){let c=new n(o?.nodeSeed??42),l=r*i,u=s?s(`brushMin`,a.brushMin):a.brushMin,d=s?s(`brushMax`,a.brushMax):a.brushMax,f=s?s(`minOpacity`,a.minOpacity):a.minOpacity,p=s?s(`maxOpacity`,a.maxOpacity):a.maxOpacity,m=s?s(`iterations`,a.iterations):a.iterations,h=s?s(`passCount`,a.passCount??1):a.passCount??1,g=s?s(`brushHardness`,a.brushHardness??.75):a.brushHardness??.75,_=s?s(`brushLength`,a.brushLength??20):a.brushLength??20,v=s?s(`brushJitter`,a.brushJitter??0):a.brushJitter??0,y=s?s(`paletteBlend`,a.paletteBlend??0):a.paletteBlend??0,b=s?s(`colourJitter`,a.colourJitter??0):a.colourJitter??0,x=s?s(`coverageTarget`,a.coverageTarget??1):a.coverageTarget??1,S=s?s(`errorThreshold`,a.errorThreshold??0):a.errorThreshold??0,C=s?s(`edgeInfluence`,a.edgeInfluence??0):a.edgeInfluence??0,w=s?s(`contrastInfluence`,a.contrastInfluence??0):a.contrastInfluence??0,T=s?s(`luminanceInfluence`,a.luminanceInfluence??0):a.luminanceInfluence??0,E=s?s(`manualAngle`,a.manualAngle??0):a.manualAngle??0,D=s?s(`strokeAngleJitter`,a.strokeAngleJitter??0):a.strokeAngleJitter??0,O=Math.min(u,d),k=Math.max(u+1,d),A={...a,brushMin:O,brushMax:k,minOpacity:f,maxOpacity:p,iterations:m,passCount:Math.max(1,Math.round(h)),brushHardness:g,brushLength:_,brushJitter:v,paletteBlend:y,colourJitter:b,coverageTarget:x,errorThreshold:S,edgeInfluence:C,contrastInfluence:w,luminanceInfluence:T,manualAngle:E,strokeAngleJitter:D},j=dn(e,l),M=fn(j,r,i),N=pn(M.mag,l),P=new Uint8ClampedArray(r*i*4);for(let e=3;e<P.length;e+=4)P[e]=255;let F=mn(e,P,l);if(A.painterMode===`DOT`){let n=vn(e,r,i,A.paletteMode.toLowerCase(),c),a=new Float32Array(l),o=l,s=0,u=Math.max(250,Math.ceil(m/20)),d=new Uint8ClampedArray(P);for(let t=0;t<m;t++){let l=(O+k)/4;if(s*Math.PI*l*l/o>=A.maxLayers)break;let m=c.nextInt(0,r),h=c.nextInt(0,i);if(a[h*r+m]>A.maxLayers*1.3)continue;let _=(h*r+m)*4,v=e[_],y=e[_+1],b=e[_+2],x=P[_],S=P[_+1],C=P[_+2],w=(f+p)/2/255,T=null,E=1/0;for(let e of n){let t=x+(e[0]-x)*w,n=S+(e[1]-S)*w,r=C+(e[2]-C)*w,i=(t-v)**2+(n-y)**2+(r-b)**2;i<E&&(E=i,T=e)}if(!T)continue;let D=c.nextRange(f,p),j=c.nextRange(O,k),M=Math.max(1,Math.round(j/2)),N=[T[0],T[1],T[2],D],F=M*M;for(let e=-M;e<=M;e++)for(let t=-M;t<=M;t++){let n=t*t+e*e;if(n>F)continue;let a=m+t,o=h+e;if(a<0||o<0||a>=r||o>=i)continue;let s=Math.sqrt(n)/M,c=g,l=D/255*(s<=c?1:Math.max(0,1-(s-c)/(1-c+1e-6))),u=1-l,d=(o*r+a)*4;P[d]=P[d]*u+N[0]*l,P[d+1]=P[d+1]*u+N[1]*l,P[d+2]=P[d+2]*u+N[2]*l,P[d+3]=Math.min(255,P[d+3]+255*l)}let I=Math.floor(j/4);for(let e=Math.max(0,h-I);e<Math.min(i,h+I);e++)for(let t=Math.max(0,m-I);t<Math.min(r,m+I);t++)a[e*r+t]++;s++,(t+1)%u===0&&(d=new Uint8ClampedArray(P))}t.set(d);return}let I=A.passCount;for(let t=0;t<I;t++)wn(P,e,r,i,l,c,A,t,I,M.mag,M.ang,N,j,F);t.set(P)}});Math.PI*2,(1+Math.sqrt(5))/2;function En(e,t,n){let r=e[t[0]],i=e[t[1]],a=e[t[2]],o=r.x-n.x,s=r.y-n.y,c=i.x-n.x,l=i.y-n.y,u=a.x-n.x,d=a.y-n.y;return o*(l*(u*u+d*d)-d*(c*c+l*l))-s*(c*(u*u+d*d)-u*(c*c+l*l))+(o*o+s*s)*(c*d-l*u)>0}function Dn(e){let t=e.length;if(t<3)return[];let n=e.reduce((e,t)=>Math.min(e,t.x),1/0),r=e.reduce((e,t)=>Math.min(e,t.y),1/0),i=e.reduce((e,t)=>Math.max(e,t.x),-1/0),a=e.reduce((e,t)=>Math.max(e,t.y),-1/0),o=i-n,s=a-r,c=Math.max(o,s)*2;e.push({x:n-c,y:r-1},{x:n+c*2,y:r-1},{x:n+o/2,y:a+c});let l=[[t,t+1,t+2]];for(let n=0;n<t;n++){let t=e[n],r=[],i=[];for(let n of l)En(e,n,t)&&r.push(n);for(let e of r)for(let t=0;t<3;t++){let n=[e[t],e[(t+1)%3]],a=!1;for(let t of r)if(t!==e){for(let e=0;e<3;e++)if(t[e]===n[0]&&t[(e+1)%3]===n[1]||t[e]===n[1]&&t[(e+1)%3]===n[0]){a=!0;break}if(a)break}a||i.push(n)}l=l.filter(e=>!r.includes(e));for(let e of i)l.push([e[0],e[1],n])}return l.filter(e=>e[0]<t&&e[1]<t&&e[2]<t)}function On(e){return!e||e.length<3?{triangles:[],points:e?e.map(e=>({x:e.x,y:e.y})):[]}:{triangles:Dn(e.map(e=>({x:e.x,y:e.y}))),points:e.map(e=>({x:e.x,y:e.y}))}}function kn(e){return e<0?0:e>1?1:e}function An(e,t,n,r={}){let{blendMode:i=`multiply`,mix:a=.5,offsetX:o=.5,offsetY:s=.5,mirrorX:c=!1,mirrorY:l=!1,exposure:u=0,gamma:d=1}=r,f=Math.round(o*t),p=Math.round(s*n),m=2**u,h=1/Math.max(.01,d),g=new Uint8ClampedArray(e.length);for(let r=0;r<n;r++)for(let o=0;o<t;o++){let s=(r*t+o)*4,u=(o+f)%t,d=(r+p)%n;c&&u>t/2&&(u=t-u),l&&d>n/2&&(d=n-d),u=Math.max(0,Math.min(t-1,Math.round(u))),d=Math.max(0,Math.min(n-1,Math.round(d)));let _=(d*t+u)*4;for(let t=0;t<3;t++){let n=e[s+t]/255,r=e[_+t]/255,o;o=i===`crossfade`?n*(1-a)+r*a:i===`multiply`?n*r:Math.abs(n-r),o=kn(o*m),g[s+t]=Math.round(o**+h*255)}g[s+3]=e[s+3]}return g}function jn(e,t,n,r,i,a,o){let s=t*n,c=new Float32Array(s);for(let t=0;t<s;t++){let n=t*4;c[t]=(e[n]*.299+e[n+1]*.587+e[n+2]*.114)/255}let l=new Uint8Array(s);for(let e=0;e<n-1;e++)for(let n=0;n<t-1;n++){let i=e*t+n,a=Math.floor(c[i]*r);(a!==Math.floor(c[i+1]*r)||a!==Math.floor(c[i+t]*r))&&(l[i]=1)}let u=Math.ceil(i),d=new Uint8Array(s);for(let e=0;e<n;e++)for(let r=0;r<t;r++)if(l[e*t+r])for(let i=-u;i<=u;i++){let a=e+i;if(!(a<0||a>=n))for(let e=-u;e<=u;e++){let n=r+e;n<0||n>=t||e*e+i*i<=u*u&&(d[a*t+n]=1)}}let f=1-o,p=new Uint8ClampedArray(e.length);for(let t=0;t<s;t++){let n=t*4;d[t]?(p[n]=Math.round(e[n]*f+a*o),p[n+1]=Math.round(e[n+1]*f+a*o),p[n+2]=Math.round(e[n+2]*f+a*o)):(p[n]=e[n],p[n+1]=e[n+1],p[n+2]=e[n+2]),p[n+3]=e[n+3]}return p}let Mn=I({type:`tileblend`,name:`TILE BLEND`,category:`COMPOSITE`,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},combineMode:{label:`COMBINE`,type:`select`,options:[`CROSSFADE`,`MULTIPLY`,`DIFFERENCE`],value:`MULTIPLY`,tier:3},mix:{label:`MIX`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`,when:{combineMode:`CROSSFADE`}},offsetX:{label:`OFFSET X`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`},offsetY:{label:`OFFSET Y`,min:0,max:1,step:.01,value:.5,tier:4,driveable:!0,unit:`0–1`},mirrorX:{label:`MIRROR X`,type:`toggle`,value:!1,tier:4},mirrorY:{label:`MIRROR Y`,type:`toggle`,value:!1,tier:4},exposure:{label:`EXPOSURE`,min:-2,max:2,step:.1,value:0,tier:5,unit:`EV`,driveable:!0},gamma:{label:`GAMMA`,min:.2,max:3,step:.05,value:1,tier:5,driveable:!0,unit:`γ`}},apply(e,t,n,r,i,a,o){let s=o?o(`frame`,0):i.frame,c=o?o(`mix`,0):i.mix,l=o?o(`offsetX`,0):i.offsetX,u=o?o(`offsetY`,0):i.offsetY,d=o?o(`exposure`,0):i.exposure,f=o?o(`gamma`,0):i.gamma,p=s*.002;t.set(An(e,n,r,{blendMode:i.combineMode.toLowerCase(),mix:c,offsetX:l+p,offsetY:u+p,mirrorX:i.mirrorX,mirrorY:i.mirrorY,exposure:d,gamma:f}))}});function Nn(e,t){let n=new Float32Array(t);for(let r=0;r<t;r++){let t=r*4;n[r]=(e[t]*.2126+e[t+1]*.7152+e[t+2]*.0722)/255}return n}function Pn(e){return e<=.04045?e/12.92:((e+.055)/1.055)**2.4}function Fn(e,t){let n=new Float32Array(t);for(let r=0;r<t;r++){let t=r*4,i=Pn(e[t]/255),a=Pn(e[t+1]/255),o=Pn(e[t+2]/255);n[r]=.2126*i+.7152*a+.0722*o}return n}function In(e,t,n){let r=t*n,i=new Float32Array(r),a=0;for(let r=1;r<n-1;r++)for(let n=1;n<t-1;n++){let o=r*t+n,s=-e[o-t-1]+e[o-t+1]-2*e[o-1]+2*e[o+1]-e[o+t-1]+e[o+t+1],c=-e[o-t-1]-2*e[o-t]-e[o-t+1]+e[o+t-1]+2*e[o+t]+e[o+t+1];i[o]=Math.hypot(s,c),i[o]>a&&(a=i[o])}if(a>0)for(let e=0;e<r;e++)i[e]/=a;return i}function Ln(e,t){let n=new Float32Array(t);for(let r=0;r<t;r++){let t=r*4,i=e[t]/255,a=e[t+1]/255,o=e[t+2]/255,s=Math.max(i,a,o);n[r]=s>0?(s-Math.min(i,a,o))/s:0}return n}function Rn(e,t,n,r,i,a,o,s,c,l){let u;if(a===`gradient`)u=In(t,n,r);else if(a===`saturation`)u=Ln(e,i);else{u=new Float32Array(i);for(let e=0;e<i;e++)u[e]=1-t[e]}let d=s,f=c-d;if(f>.001)for(let e=0;e<i;e++)u[e]=Math.max(0,Math.min(1,(u[e]-d)/f));if(Math.abs(l-1)>.001){let e=1/Math.max(.01,l);for(let t=0;t<i;t++)u[t]=u[t]**+e}if(o)for(let e=0;e<i;e++)u[e]=1-u[e];return u}function zn(e,t){let n=new Float32Array(t),r=0;for(let n=0;n<t;n++)r+=e[n];if(r===0){for(let e=0;e<t;e++)n[e]=(e+1)/t;return{cdf:n,total:t}}let i=0;for(let a=0;a<t;a++)i+=e[a],n[a]=i/r;return{cdf:n,total:r}}function Bn(e,t){let n=0,r=e.length-1;for(;n<r;){let i=n+r>>1;e[i]<t?n=i+1:r=i}return n}function Vn(e,t,n){let r=Math.ceil(t/e),i=Math.ceil(n/e);return{cells:Array(r*i).fill(null).map(()=>[]),cols:r,rows:i,cellSize:e}}function Hn(e,t,n){let r=Math.floor(t/e.cellSize),i=Math.floor(n/e.cellSize);return r<0||i<0||r>=e.cols||i>=e.rows?null:e.cells[i*e.cols+r]}function Un(e,t,n){let r=Hn(e,t,n);r&&r.push([t,n])}function Wn(e,t,n,r){let i=Math.floor(t/e.cellSize),a=Math.floor(n/e.cellSize),o=Math.ceil(r/e.cellSize)+1,s=Math.max(0,i-o),c=Math.min(e.cols-1,i+o),l=Math.max(0,a-o),u=Math.min(e.rows-1,a+o),d=r*r;for(let r=l;r<=u;r++)for(let i=s;i<=c;i++){let a=e.cells[r*e.cols+i];for(let[e,r]of a)if((t-e)**2+(n-r)**2<d)return!0}return!1}function Gn(e,t,n,r,i,a){let o=Vn(Math.max(1,i),n,Math.ceil(t/n)),s=[],c=r*8;for(let t=0;t<c&&s.length<r;t++){let t=Bn(e,a.next()),r=t%n,c=t/n|0;i>0&&Wn(o,r,c,i)||(s.push([r,c]),Un(o,r,c))}return s}function Kn(e,t,n,r,i,a){let o=Vn(Math.max(1,i/Math.SQRT2),t,n),s=[],c=[],l=t*n,u=0,d=-1;for(let t=0;t<Math.min(1e3,l);t++){let t=a.next()*l|0;e[t]>d&&(d=e[t],u=t)}let f=u%t,p=u/t|0;for(s.push([f,p]),c.push([f,p]),Un(o,f,p);c.length>0&&s.length<r;){let u=a.next()*c.length|0,[d,f]=c[u],p=!1;for(let u=0;u<30;u++){let u=a.next()*Math.PI*2,m=i+a.next()*i,h=d+Math.cos(u)*m,g=f+Math.sin(u)*m;if(h<0||g<0||h>=t||g>=n)continue;let _=Math.floor(g)*t+Math.floor(h)|0,v=e[Math.max(0,Math.min(l-1,_))];if(!(a.next()>v*.9+.1)&&!Wn(o,h,g,i)&&(s.push([h,g]),c.push([h,g]),Un(o,h,g),p=!0,s.length>=r))break}p||c.splice(u,1)}return s}function qn(e,t,n,r,i,a){let o=[],s=Math.ceil(Math.sqrt(n*e/t)),c=Math.ceil(n/s),l=e/s,u=t/c;for(let r=0;r<c;r++)for(let c=0;c<s&&!(o.length>=n);c++){let n=a>0?(i.next()*2-1)*a*l*.5:0,s=a>0?(i.next()*2-1)*a*u*.5:0,d=Math.max(0,Math.min(e-1,(c+.5)*l+n)),f=Math.max(0,Math.min(t-1,(r+.5)*u+s));o.push([d,f])}return o}function Jn(e,t,n,r,i,a,o){if(a<1||o<=0)return e;let s=Math.max(4,Math.sqrt(i/e.length)*2)|0,c=Math.ceil(n/s),l=Math.ceil(r/s),u=new Int32Array(c*l).fill(-1);for(let d=0;d<a;d++){for(let t=0;t<l;t++)for(let n=0;n<c;n++){let r=(n+.5)*s,i=(t+.5)*s,a=-1,o=1/0;for(let t=0;t<e.length;t++){let n=(r-e[t][0])**2+(i-e[t][1])**2;n<o&&(o=n,a=t)}u[t*c+n]=a}let a=new Float64Array(e.length),d=new Float64Array(e.length),f=new Float64Array(e.length);for(let e=0;e<l;e++)for(let r=0;r<c;r++){let o=u[e*c+r];if(o<0)continue;let l=(r+.5)*s,p=(e+.5)*s,m=t[Math.max(0,Math.min(i-1,Math.floor(p)*n+Math.floor(l)|0))]+.001;a[o]+=l*m,d[o]+=p*m,f[o]+=m}for(let t=0;t<e.length;t++){if(f[t]<=0)continue;let i=a[t]/f[t],s=d[t]/f[t];e[t][0]=Math.max(0,Math.min(n-1,e[t][0]+(i-e[t][0])*o)),e[t][1]=Math.max(0,Math.min(r-1,e[t][1]+(s-e[t][1])*o))}}return e}function Yn(e,t,n,r,i,a,o,s,c){let l=Math.max(0,Math.floor(r-a)),u=Math.min(t-1,Math.ceil(r+a)),d=Math.max(0,Math.floor(i-a)),f=Math.min(n-1,Math.ceil(i+a)),p=a*a;for(let n=d;n<=f;n++)for(let d=l;d<=u;d++){let l=d-r,u=n-i,f=l*l+u*u;if(f>p)continue;let m=s;if(c){let e=a-Math.sqrt(f);e<1&&(m*=Math.max(0,e))}if(m<=0)continue;let h=(n*t+d)*4,g=1-m;e[h]=e[h]*g+o[0]*m,e[h+1]=e[h+1]*g+o[1]*m,e[h+2]=e[h+2]*g+o[2]*m,e[h+3]=Math.min(255,e[h+3]+255*m)}}function Xn(e,t,n,r,i,a,o,s){let c=Math.max(0,Math.floor(r-a)),l=Math.min(t-1,Math.ceil(r+a)),u=Math.max(0,Math.floor(i-a)),d=Math.min(n-1,Math.ceil(i+a));for(let n=u;n<=d;n++)for(let r=c;r<=l;r++){let i=1-s,a=(n*t+r)*4;e[a]=e[a]*i+o[0]*s,e[a+1]=e[a+1]*i+o[1]*s,e[a+2]=e[a+2]*i+o[2]*s,e[a+3]=Math.min(255,e[a+3]+255*s)}}function Zn(e,t,n,r,i,a,o,s,c){let l=Math.max(a,o),u=Math.max(0,Math.floor(r-l)),d=Math.min(t-1,Math.ceil(r+l)),f=Math.max(0,Math.floor(i-l)),p=Math.min(n-1,Math.ceil(i+l)),m=a*a,h=o*o;for(let n=f;n<=p;n++)for(let a=u;a<=d;a++){let o=a-r,l=n-i;if(o*o/m+l*l/h>1)continue;let u=1-c,d=(n*t+a)*4;e[d]=e[d]*u+s[0]*c,e[d+1]=e[d+1]*u+s[1]*c,e[d+2]=e[d+2]*u+s[2]*c,e[d+3]=Math.min(255,e[d+3]+255*c)}}function Qn(e,t,n,r,i,a,o,s){let c=Math.max(0,Math.floor(r-a)),l=Math.min(t-1,Math.ceil(r+a)),u=Math.max(0,Math.floor(i-a)),d=Math.min(n-1,Math.ceil(i+a));for(let n=u;n<=d;n++)for(let u=c;u<=l;u++){if(Math.abs(u-r)+Math.abs(n-i)>a)continue;let c=1-s,l=(n*t+u)*4;e[l]=e[l]*c+o[0]*s,e[l+1]=e[l+1]*c+o[1]*s,e[l+2]=e[l+2]*c+o[2]*s,e[l+3]=Math.min(255,e[l+3]+255*s)}}let $n=I({type:`stipple`,name:`STIPPLE`,category:`COMPOSITE`,forceWorkerPreview:!0,params:{toneGamma:{label:`TONE GAMMA`,min:.1,max:4,step:.05,value:1,tier:4,unit:`n`,driveable:!0},toneInvert:{label:`INVERT TONE`,type:`toggle`,value:!1,tier:4},linearLight:{label:`LINEAR LIGHT`,type:`toggle`,value:!1,tier:5},dotCount:{label:`DOT COUNT`,min:10,max:3e4,step:10,value:2e3,tier:3,previewMax:500,unit:`n`,driveable:!0},shadowThreshold:{label:`SHADOW THR`,min:0,max:1,step:.01,value:0,tier:4,unit:`normalised`,driveable:!0},highlightThreshold:{label:`HIGHLIGHT THR`,min:0,max:1,step:.01,value:1,tier:4,unit:`normalised`,driveable:!0},densityMode:{label:`DENSITY MODE`,type:`select`,options:[`luminance`,`gradient`,`saturation`],value:`luminance`,tier:4},seedMode:{label:`SEED MODE`,type:`select`,options:[`weighted-random`,`poisson`,`grid`,`jittered-grid`],value:`weighted-random`,tier:3},randomness:{label:`RANDOMNESS`,min:0,max:1,step:.01,value:.5,tier:4,unit:`normalised`,driveable:!0},seed:{label:`SEED`,min:0,max:99999,step:1,value:42,tier:4,unit:`n`,driveable:!0},relaxIterations:{label:`RELAX ITERS`,min:0,max:20,step:1,value:3,tier:4,previewMax:3,unit:`n`,driveable:!0},relaxStrength:{label:`RELAX STR`,min:0,max:1,step:.05,value:.5,tier:5,unit:`normalised`,driveable:!0},minSpacing:{label:`MIN SPACING`,min:1,max:40,step:.5,value:3,tier:3,previewMax:8,unit:`px`,driveable:!0},dotShape:{label:`DOT SHAPE`,type:`select`,options:[`circle`,`square`,`ellipse`,`diamond`],value:`circle`,tier:3},minDotSize:{label:`MIN DOT SIZE`,min:.5,max:20,step:.5,value:.5,tier:3,unit:`px`,driveable:!0},maxDotSize:{label:`MAX DOT SIZE`,min:.5,max:20,step:.5,value:3,tier:3,unit:`px`,driveable:!0},dotOpacity:{label:`DOT OPACITY`,min:0,max:1,step:.01,value:1,tier:4,unit:`normalised`,driveable:!0},antialias:{label:`ANTIALIAS`,type:`toggle`,value:!0,tier:5},colourMode:{label:`COLOUR MODE`,type:`select`,options:[`source`,`solid`,`ink`],value:`ink`,tier:3},dotColourR:{label:`DOT R`,min:0,max:255,step:1,value:0,tier:4,unit:`lvl`,driveable:!0,when:{param:`colourMode`,notEquals:`source`}},dotColourG:{label:`DOT G`,min:0,max:255,step:1,value:0,tier:4,unit:`lvl`,driveable:!0,when:{param:`colourMode`,notEquals:`source`}},dotColourB:{label:`DOT B`,min:0,max:255,step:1,value:0,tier:4,unit:`lvl`,driveable:!0,when:{param:`colourMode`,notEquals:`source`}},bgColourR:{label:`BG R`,min:0,max:255,step:1,value:255,tier:4,unit:`lvl`,driveable:!0},bgColourG:{label:`BG G`,min:0,max:255,step:1,value:255,tier:4,unit:`lvl`,driveable:!0},bgColourB:{label:`BG B`,min:0,max:255,step:1,value:255,tier:4,unit:`lvl`,driveable:!0},frame:{label:`FRAME`,min:0,max:5e4,step:1,value:0,tier:3,unit:`n`,driveable:!0}},apply(e,t,r,i,a,o,s){let c=r*i;o?.quality;let l=(e,t)=>s?s(e,t):t,u=Math.max(1,Math.round(l(`dotCount`,a.dotCount))),d=Math.max(0,l(`minSpacing`,a.minSpacing)),f=Math.max(.5,l(`minDotSize`,a.minDotSize)),p=Math.max(f,l(`maxDotSize`,a.maxDotSize)),m=Math.max(0,Math.min(1,l(`dotOpacity`,a.dotOpacity))),h=Math.max(0,Math.round(l(`relaxIterations`,a.relaxIterations))),g=Math.max(0,Math.min(1,l(`relaxStrength`,a.relaxStrength))),_=Math.max(0,Math.min(1,l(`randomness`,a.randomness))),v=Math.max(.01,l(`toneGamma`,a.toneGamma)),y=Math.max(0,Math.min(1,l(`shadowThreshold`,a.shadowThreshold))),b=Math.max(y+.001,Math.min(1,l(`highlightThreshold`,a.highlightThreshold))),x=Math.round(l(`seed`,a.seed))+(a.frame|0),S=Math.round(l(`dotColourR`,a.dotColourR)),C=Math.round(l(`dotColourG`,a.dotColourG)),w=Math.round(l(`dotColourB`,a.dotColourB)),T=Math.round(l(`bgColourR`,a.bgColourR)),E=Math.round(l(`bgColourG`,a.bgColourG)),D=Math.round(l(`bgColourB`,a.bgColourB)),O=new n(x>>>0),k=Rn(e,a.linearLight?Fn(e,c):Nn(e,c),r,i,c,a.densityMode,a.toneInvert,y,b,v),A,j=a.seedMode;if(j===`poisson`)A=Kn(k,r,i,u,Math.max(1,d),O);else if(j===`grid`)A=qn(r,i,u,Math.max(1,d),O,0);else if(j===`jittered-grid`)A=qn(r,i,u,Math.max(1,d),O,_);else{let{cdf:e}=zn(k,c);A=Gn(e,c,r,u,Math.max(1,d),O)}h>0&&A.length>1&&Jn(A,k,r,i,c,h,g);let M=new Uint8ClampedArray(c*4);for(let e=0;e<c;e++){let t=e*4;M[t]=T,M[t+1]=E,M[t+2]=D,M[t+3]=255}let N=a.dotShape,P=a.colourMode,F=a.antialias!==!1;for(let[t,n]of A){let a=Math.max(0,Math.min(r-1,Math.floor(t))),o=Math.max(0,Math.min(i-1,Math.floor(n)))*r+a,s,c,l;if(P===`source`){let t=o*4;s=e[t],c=e[t+1],l=e[t+2]}else s=S,c=C,l=w;let u=k[o],d=f+(p-f)*u,h=[s,c,l];switch(N){case`square`:Xn(M,r,i,t,n,d,h,m);break;case`ellipse`:Zn(M,r,i,t,n,d,d*.6,h,m);break;case`diamond`:Qn(M,r,i,t,n,d,h,m);break;default:Yn(M,r,i,t,n,d,h,m,F)}}t.set(M)}});function er(e,t,n,r,i=1e-9){if(e.length===0)return[];let a=e=>t*e.x+n*e.y+r<=i,o=(e,i)=>{let a=t*e.x+n*e.y+r,o=a/(a-(t*i.x+n*i.y+r));return{x:e.x+o*(i.x-e.x),y:e.y+o*(i.y-e.y)}},s=[];for(let t=0;t<e.length;t++){let n=e[t],r=e[(t+e.length-1)%e.length],i=a(n),c=a(r);i?(c||s.push(o(r,n)),s.push(n)):c&&s.push(o(r,n))}return s}function tr(e,t,n){let r=e;return r=er(r,-1,0,0),r=er(r,1,0,-t),r=er(r,0,-1,0),r=er(r,0,1,-n),r}function nr(e,t,n,r,i,a){let o=2*(e*(r-a)+n*(a-t)+i*(t-r));if(Math.abs(o)<1e-14)return null;let s=e*e+t*t,c=n*n+r*r,l=i*i+a*a;return{x:(s*(r-a)+c*(a-t)+l*(t-r))/o,y:(s*(i-n)+c*(e-i)+l*(n-e))/o}}function rr(e,t,n,r){let i=[{x:0,y:0},{x:n,y:0},{x:n,y:r},{x:0,y:r}],a=e[t];for(let n=0;n<e.length;n++){if(n===t)continue;let r=e[n],o=2*(r.x-a.x),s=2*(r.y-a.y),c=a.x*a.x+a.y*a.y-r.x*r.x-r.y*r.y;if(i=er(i,o,s,c),i.length===0)break}return i}function ir(e,t,n){let r=e.map(e=>({x:e.x,y:e.y}));if(r.length===0)return{cells:[],sites:[]};if(r.length===1)return{cells:[{siteIdx:0,polygon:tr([{x:0,y:0},{x:t,y:0},{x:t,y:n},{x:0,y:n}],t,n)}],sites:r};let{triangles:i}=On(r),a=r.map(()=>[]);for(let e=0;e<i.length;e++){let t=i[e];a[t[0]].push(e),a[t[1]].push(e),a[t[2]].push(e)}let o=[];for(let e=0;e<r.length;e++){let s=[],c=new Set;for(let t of a[e]){let[e,n,a]=i[t],o=r[e],l=r[n],u=r[a],d=nr(o.x,o.y,l.x,l.y,u.x,u.y);if(!d)continue;let f=`${Math.round(d.x*1e6)},${Math.round(d.y*1e6)}`;c.has(f)||(c.add(f),s.push(d))}let l=r[e].x,u=r[e].y;s.sort((e,t)=>Math.atan2(e.y-u,e.x-l)-Math.atan2(t.y-u,t.x-l));let d=s.length>=3?s:rr(r,e,t,n);d=tr(d,t,n),o.push({siteIdx:e,polygon:d})}return{cells:o,sites:r}}function ar(e,t,n){let r=t*n,i=new Float32Array(r);for(let r=0;r<n;r++)for(let a=0;a<t;a++){let o=(r,i)=>{let a=Math.max(0,Math.min(t-1,r)),o=(Math.max(0,Math.min(n-1,i))*t+a)*4;return e[o]*.299+e[o+1]*.587+e[o+2]*.114},s=o(a+1,r)-o(a-1,r),c=o(a,r+1)-o(a,r-1);i[r*t+a]=Math.sqrt(s*s+c*c)}let a=0;for(let e=0;e<r;e++)i[e]>a&&(a=i[e]);if(a>0)for(let e=0;e<r;e++)i[e]/=a;return i}function or(e,t,n,r){let i=t*n,a=new Float32Array(i);for(let t=0;t<i;t++)a[t]=+(e[t]>.2);let o=Math.max(1,Math.round(r*Math.max(t,n)*.1)),s=new Float32Array(i);for(let e=0;e<n;e++)for(let n=0;n<t;n++){let r=0;for(let i=-o;i<=o;i++){let o=Math.max(0,Math.min(t-1,n+i)),s=a[e*t+o];s>r&&(r=s)}s[e*t+n]=r}for(let e=0;e<t;e++)for(let r=0;r<n;r++){let i=0;for(let a=-o;a<=o;a++){let o=s[Math.max(0,Math.min(n-1,r+a))*t+e];o>i&&(i=o)}a[r*t+e]=i}return a}function sr(e,t,n,r,i,a,o,s,c){let l=t*n,u=new Float32Array(l);if(r===`UNIFORM`){for(let e=0;e<l;e++)u[e]=1;return u}let d=ar(e,t,n),f=r===`EDGE WEIGHTED`||r===`EDGE DISTANCE`||r===`HYBRID`?or(d,t,n,s):null,p=i/100;for(let e=0;e<l;e++){let t=p;(r===`GRADIENT WEIGHTED`||r===`HYBRID`)&&(t+=d[e]*(a/10)),(r===`EDGE WEIGHTED`||r===`EDGE DISTANCE`||r===`HYBRID`)&&f&&(t+=f[e]*(o/10)),r===`CONTRAST WEIGHTED`&&(t+=d[e]*(a/10)),u[e]=Math.max(0,Math.min(1,t))}for(let e=0;e<l;e++){let t=u[e];c===`SMOOTHSTEP`?u[e]=t*t*(3-2*t):c===`EXPONENTIAL`?u[e]=t*t:c===`THRESHOLDED`&&(u[e]=t>.3?1:.1)}return u}function cr(e,t,n,r){let i=[];for(let a=0;a<e;a++)i.push({x:r.next()*t,y:r.next()*n});return i}function lr(e,t,n,r){let i=Math.ceil(Math.sqrt(e*t/n)),a=Math.ceil(e/i),o=t/i,s=n/a,c=[];for(let t=0;t<a&&c.length<e;t++)for(let n=0;n<i&&c.length<e;n++)c.push({x:(n+.5+(r.next()-.5)*.8)*o,y:(t+.5+(r.next()-.5)*.8)*s});return c}function ur(e,t,n,r,i){let a=i/Math.SQRT2,o=Math.ceil(t/a),s=Math.ceil(n/a),c=new Int32Array(o*s).fill(-1),l=[],u=[],d=(e,t)=>{let n=Math.floor(e/a),r=Math.floor(t/a);return n<0||n>=o||r<0||r>=s?-1:r*o+n},f=(e,r)=>{if(e<0||e>=t||r<0||r>=n)return!1;let u=Math.floor(e/a),d=Math.floor(r/a);for(let t=-2;t<=2;t++)for(let n=-2;n<=2;n++){let a=u+n,f=d+t;if(a<0||a>=o||f<0||f>=s)continue;let p=c[f*o+a];if(p===-1)continue;let m=l[p],h=m.x-e,g=m.y-r;if(h*h+g*g<i*i)return!1}return!0},p={x:r.next()*t,y:r.next()*n};l.push(p);let m=d(p.x,p.y);for(m>=0&&(c[m]=0),u.push(0);u.length>0&&l.length<e;){let e=Math.floor(r.next()*u.length),t=l[u[e]],n=!1;for(let e=0;e<20;e++){let e=r.next()*Math.PI*2,a=i+r.next()*i,o=t.x+Math.cos(e)*a,s=t.y+Math.sin(e)*a;if(f(o,s)){let e={x:o,y:s};l.push(e);let t=d(o,s);t>=0&&(c[t]=l.length-1),u.push(l.length-1),n=!0;break}}n||u.splice(e,1)}return l.slice(0,e)}function dr(e,t,n,r,i){let a=t*n,o=0;for(let e=0;e<a;e++)o+=i[e]+.05;let s=[],c=0,l=e*50;for(;s.length<e&&c++<l;){let e=r.next()*t,a=r.next()*n,o=Math.min(t-1,Math.floor(e)),c=i[Math.min(n-1,Math.floor(a))*t+o]+.05;r.next()<c&&s.push({x:e,y:a})}for(;s.length<e;)s.push({x:r.next()*t,y:r.next()*n});return s}function fr(e,t,n,r,i,a){let o=Math.sqrt(t*n/e)*.6;switch(r){case`JITTERED GRID`:return lr(e,t,n,i);case`POISSON-DISC`:return ur(e,t,n,i,o);case`EDGE WEIGHTED`:return dr(e,t,n,i,a);case`HYBRID WEIGHTED POISSON`:{let r=dr(Math.ceil(e*.6),t,n,i,a),s=ur(Math.ceil(e*.4),t,n,i,o*.5);return[...r,...s].slice(0,e)}default:return cr(e,t,n,i)}}function pr(e,t,n,r){if(r.length===0)return[128,128,128,255];let i=0,a=0,o=0,s=0;for(let{x:c,y:l}of r){let r=Math.max(0,Math.min(t-1,Math.round(c))),u=(Math.max(0,Math.min(n-1,Math.round(l)))*t+r)*4;i+=e[u],a+=e[u+1],o+=e[u+2],s+=e[u+3]}let c=r.length;return[i/c,a/c,o/c,s/c]}function mr(e,t,n,r,i){let a=Math.max(0,Math.min(t-1,Math.round(r))),o=(Math.max(0,Math.min(n-1,Math.round(i)))*t+a)*4;return[e[o],e[o+1],e[o+2],e[o+3]]}function hr(e,t,n,r,i,a,o){if(r>0){let i=r*30;e=Math.max(0,Math.min(255,e+(o.next()*2-1)*i)),t=Math.max(0,Math.min(255,t+(o.next()*2-1)*i)),n=Math.max(0,Math.min(255,n+(o.next()*2-1)*i))}if(i>0){let r=255/i;e=Math.round(e/r)*r,t=Math.round(t/r)*r,n=Math.round(n/r)*r}if(a!==0){let r=e/255,i=t/255,o=n/255,s=Math.max(r,i,o),c=Math.min(r,i,o),l=(s+c)/2;if(s===c)return[e,t,n];let u=s-c,d=u/(l>.5?2-s-c:s+c),f=0;f=s===r?(i-o)/u+(i<o?6:0):s===i?(o-r)/u+2:(r-i)/u+4,f=((f/6+a/360)%1+1)%1;let p=l<.5?l*(1+d):l+d-l*d,m=2*l-p,h=e=>{let t=(e%1+1)%1;return t<1/6?m+(p-m)*6*t:t<1/2?p:t<2/3?m+(p-m)*(2/3-t)*6:m};e=Math.round(h(f+1/3)*255),t=Math.round(h(f)*255),n=Math.round(h(f-1/3)*255)}return[Math.max(0,Math.min(255,Math.round(e))),Math.max(0,Math.min(255,Math.round(t))),Math.max(0,Math.min(255,Math.round(n)))]}function gr(e,t,n,r,i,a,o,s,c,l,u,d,f){let p=Math.max(0,Math.floor(Math.min(i,o,c))),m=Math.min(n-1,Math.ceil(Math.max(i,o,c)));for(let n=p;n<=m;n++){let p=t,m=-1,h=(e,t,r,i)=>{if(t<=n&&n<i||i<=n&&n<t){let a=e+(n-t)/(i-t)*(r-e);a<p&&(p=a),a>m&&(m=a)}};h(r,i,a,o),h(a,o,s,c),h(s,c,r,i);let g=Math.max(0,Math.floor(p)),_=Math.min(t-1,Math.ceil(m));for(let r=g;r<=_;r++){let i=(n*t+r)*4;e[i]=l,e[i+1]=u,e[i+2]=d,e[i+3]=f}}}function _r(e,t,n,r,i,a,o,s,c,l,u){let d=Math.max(.5,s/2),f=a-r,p=o-i,m=Math.sqrt(f*f+p*p);if(m<.5)return;let h=-p/m,g=f/m,_=Math.max(0,Math.floor(Math.min(r,a)-d-1)),v=Math.min(t-1,Math.ceil(Math.max(r,a)+d+1)),y=Math.max(0,Math.floor(Math.min(i,o)-d-1)),b=Math.min(n-1,Math.ceil(Math.max(i,o)+d+1));for(let n=y;n<=b;n++)for(let a=_;a<=v;a++){let o=a-r,s=n-i,_=f/m*o+p/m*s,v=Math.abs(o*h+s*g);if(_>=0&&_<=m&&v<d){let r=(n*t+a)*4;e[r]=c,e[r+1]=l,e[r+2]=u,e[r+3]=255}}}function vr(e,t,n,r,i,a,o,s){if(r.length<3)return;let c=r[0].x,l=r[0].y;for(let u=1;u<r.length-1;u++)gr(e,t,n,c,l,r[u].x,r[u].y,r[u+1].x,r[u+1].y,i,a,o,s)}function yr(e,t,n,r,i,a,o,s,c){let l=Math.max(0,Math.floor(Math.min(r,a,s))),u=Math.min(t-1,Math.ceil(Math.max(r,a,s))),d=Math.max(0,Math.floor(Math.min(i,o,c))),f=Math.min(n-1,Math.ceil(Math.max(i,o,c))),p=[],m=(e,t,n,r,i,a)=>(e-i)*(r-a)-(n-i)*(t-a);for(let e=d;e<=f;e++)for(let t=l;t<=u;t++){let n=m(t,e,r,i,a,o),l=m(t,e,a,o,s,c),u=m(t,e,s,c,r,i);(n<0||l<0||u<0)&&(n>0||l>0||u>0)||p.push({x:t,y:e})}return p}let br=I({type:`mosaic`,name:`MOSAIC`,category:`COMPOSITE`,forceWorkerPreview:!0,params:{densityMode:{label:`DENSITY MODE`,type:`select`,options:[`UNIFORM`,`GRADIENT WEIGHTED`,`EDGE WEIGHTED`,`EDGE DISTANCE`,`CONTRAST WEIGHTED`,`HYBRID`],value:`HYBRID`,tier:4},baseDensity:{label:`BASE DENSITY`,min:5,max:100,step:1,value:20,tier:4,unit:`%`,driveable:!0},gradBoost:{label:`GRAD BOOST`,min:0,max:10,step:.1,value:5,tier:4,unit:`0-10`,driveable:!0},edgeBoost:{label:`EDGE BOOST`,min:0,max:10,step:.1,value:5,tier:4,unit:`0-10`,driveable:!0},edgeFalloff:{label:`EDGE FALLOFF`,min:.5,max:10,step:.5,value:2,tier:4,unit:`r`,driveable:!0},densityCurve:{label:`DENSITY CURVE`,type:`select`,options:[`LINEAR`,`SMOOTHSTEP`,`EXPONENTIAL`,`THRESHOLDED`],value:`SMOOTHSTEP`,tier:5},pointCount:{label:`POINTS`,min:10,max:2e3,step:10,value:300,tier:3,previewMax:200,unit:`pts`,driveable:!0},seedMode:{label:`SEED MODE`,type:`select`,options:[`UNIFORM RANDOM`,`JITTERED GRID`,`POISSON-DISC`,`EDGE WEIGHTED`,`HYBRID WEIGHTED POISSON`],value:`HYBRID WEIGHTED POISSON`,tier:3},seed:{label:`SEED`,min:0,max:9999,step:1,value:42,tier:4,unit:`n`,driveable:!0},renderMode:{label:`RENDER MODE`,type:`select`,options:[`FILL`,`WIREFRAME`,`BOTH`,`VORONOI`],value:`FILL`,tier:3},wireWidth:{label:`WIRE WIDTH`,min:.5,max:5,step:.25,value:1,tier:4,unit:`px`,driveable:!0},wireColourR:{label:`WIRE R`,min:0,max:255,step:1,value:0,tier:5,unit:`lvl`,driveable:!0},wireColourG:{label:`WIRE G`,min:0,max:255,step:1,value:0,tier:5,unit:`lvl`,driveable:!0},wireColourB:{label:`WIRE B`,min:0,max:255,step:1,value:0,tier:5,unit:`lvl`,driveable:!0},colourMode:{label:`COLOUR MODE`,type:`select`,options:[`SOURCE-AVG`,`SOURCE-CENTROID`,`SOLID`,`PALETTE`],value:`SOURCE-AVG`,tier:3},colourJitter:{label:`COLOUR JITTER`,min:0,max:1,step:.01,value:0,tier:4,unit:`0-1`,driveable:!0},quantiseLevels:{label:`QUANTISE`,min:0,max:32,step:1,value:0,tier:4,unit:`lvl`,driveable:!0},hueShift:{label:`HUE SHIFT`,min:-180,max:180,step:1,value:0,tier:4,unit:`°`,driveable:!0},outputMode:{label:`OUTPUT MODE`,type:`select`,options:[`REPLACE`,`OVERLAY`,`MASK`],value:`REPLACE`,tier:4}},apply(e,t,r,i,a,o,s){o?.quality;let c=a.pointCount,l=(o?.nodeSeed??0)^(a.seed|0),u=new n(l),d=sr(e,r,i,a.densityMode,a.baseDensity,a.gradBoost,a.edgeBoost,a.edgeFalloff,a.densityCurve),f=fr(c,r,i,a.seedMode,u,d);if(f.length<3){t.set(e);return}let p=Math.round(a.wireColourR),m=Math.round(a.wireColourG),h=Math.round(a.wireColourB),g=a.wireWidth,_=a.colourJitter,v=Math.round(a.quantiseLevels),y=a.hueShift;if(a.renderMode===`VORONOI`){let{cells:o}=ir(f,r,i);t.set(e);let s=new n(l^3735928559);for(let n of o){if(n.polygon.length<3)continue;let o=f[n.siteIdx],c,l,u,d;a.colourMode===`SOURCE-CENTROID`||a.colourMode===`SOURCE-AVG`?[c,l,u,d]=mr(e,r,i,o.x,o.y):(c=l=u=180,d=255),[c,l,u]=hr(c,l,u,_,v,y,s),a.outputMode===`MASK`?vr(t,r,i,n.polygon,c,l,u,255):vr(t,r,i,n.polygon,c,l,u,d)}}else{let{triangles:o,points:s}=On(f);if(o.length===0){t.set(e);return}a.renderMode===`WIREFRAME`?t.set(e):t.fill(0);let c=new n(l^3735928559);if(a.renderMode!==`WIREFRAME`)for(let n of o){let o=s[n[0]],l=s[n[1]],u=s[n[2]],d=o.x,f=o.y,p=l.x,m=l.y,h=u.x,g=u.y,b=(d+p+h)/3,x=(f+m+g)/3,S,C,w,T;if(a.colourMode===`SOURCE-AVG`){let t=yr(e,r,i,d,f,p,m,h,g);t.length===0?[S,C,w,T]=mr(e,r,i,b,x):[S,C,w,T]=pr(e,r,i,t)}else a.colourMode===`SOURCE-CENTROID`?[S,C,w,T]=mr(e,r,i,b,x):(S=C=w=180,T=255);[S,C,w]=hr(S,C,w,_,v,y,c),a.outputMode===`OVERLAY`?(gr(new Uint8ClampedArray(4),r,i,d,f,p,m,h,g,S,C,w,Math.round(T*.8)),gr(t,r,i,d,f,p,m,h,g,S,C,w,Math.round(T))):a.outputMode===`MASK`?gr(t,r,i,d,f,p,m,h,g,S,C,w,255):gr(t,r,i,d,f,p,m,h,g,S,C,w,Math.round(T))}if(a.renderMode===`WIREFRAME`||a.renderMode===`BOTH`){let e=new Set;for(let n of o)for(let a=0;a<3;a++){let o=n[a],c=n[(a+1)%3],l=o<c?`${o}-${c}`:`${c}-${o}`;if(e.has(l))continue;e.add(l);let u=s[o],d=s[c];_r(t,r,i,u.x,u.y,d.x,d.y,g,p,m,h)}}}},fromJSON(e){if(e.params?.colorMode&&!e.params?.renderMode){let t=e.params.colorMode;e.params.renderMode=t===`WIRE`?`WIREFRAME`:`FILL`,delete e.params.colorMode}}});function xr(e,t){let n=new Float32Array(t);for(let r=0;r<t;r++){let t=r*4;n[r]=e[t]*.299+e[t+1]*.587+e[t+2]*.114}return n}function Sr(e,t,n,r,i){let a=Math.ceil(i*3),o=new Float32Array(a*2+1),s=0;for(let e=-a;e<=a;e++)o[e+a]=Math.exp(-(e*e)/(2*i*i)),s+=o[e+a];for(let e=0;e<o.length;e++)o[e]/=s;let c=new Float32Array(t),l=new Float32Array(t);for(let t=0;t<r;t++)for(let r=0;r<n;r++){let i=0;for(let s=-a;s<=a;s++)i+=e[t*n+Math.max(0,Math.min(n-1,r+s))]*o[s+a];c[t*n+r]=i}for(let e=0;e<n;e++)for(let t=0;t<r;t++){let i=0;for(let s=-a;s<=a;s++)i+=c[Math.max(0,Math.min(r-1,t+s))*n+e]*o[s+a];l[t*n+e]=i}return l}function Cr(e,t,n,r=0,i=!0){let a=t*n,o=xr(e,a),s=new Float32Array(a),c=0;for(let e=1;e<n-1;e++)for(let n=1;n<t-1;n++){let r=e*t+n,i=-o[r-t-1]+o[r-t+1]-2*o[r-1]+2*o[r+1]-o[r+t-1]+o[r+t+1],a=-o[r-t-1]-2*o[r-t]-o[r-t+1]+o[r+t-1]+2*o[r+t]+o[r+t+1];s[r]=Math.sqrt(i*i+a*a),s[r]>c&&(c=s[r])}let l=i&&c>0?255/c:1,u=new Uint8ClampedArray(e.length);for(let t=0;t<a;t++){let n=Math.min(255,s[t]*l),i=t*4;u[i]=u[i+1]=u[i+2]=n>r?n:0,u[i+3]=e[i+3]}return u}function wr(e,t,n,r=`4-conn`,i=!0){let a=t*n,o=xr(e,a),s=r===`8-conn`,c=new Float32Array(a),l=0;for(let e=1;e<n-1;e++)for(let n=1;n<t-1;n++){let r=e*t+n,i=s?o[r-t-1]+o[r-t]+o[r-t+1]+o[r-1]-8*o[r]+o[r+1]+o[r+t-1]+o[r+t]+o[r+t+1]:o[r-t]+o[r-1]-4*o[r]+o[r+1]+o[r+t];c[r]=Math.abs(i),c[r]>l&&(l=c[r])}let u=i&&l>0?255/l:1,d=new Uint8ClampedArray(e.length);for(let t=0;t<a;t++){let n=Math.min(255,c[t]*u),r=t*4;d[r]=d[r+1]=d[r+2]=n,d[r+3]=e[r+3]}return d}function Tr(e,t,n,r=1,i=1.6,a=5){let o=t*n,s=xr(e,o),c=Sr(s,o,t,n,r),l=Sr(s,o,t,n,i),u=new Uint8ClampedArray(e.length);for(let t=0;t<o;t++){let n=Math.abs(c[t]-l[t]),r=n>a?Math.min(255,n):0,i=t*4;u[i]=u[i+1]=u[i+2]=r,u[i+3]=e[i+3]}return u}function Er(e,t,n,r=1.4,i=.1,a=.3){let o=t*n,s=Sr(xr(e,o),o,t,n,r),c=new Float32Array(o),l=new Float32Array(o),u=0;for(let e=1;e<n-1;e++)for(let n=1;n<t-1;n++){let r=e*t+n,i=-s[r-t-1]+s[r-t+1]-2*s[r-1]+2*s[r+1]-s[r+t-1]+s[r+t+1],a=-s[r-t-1]-2*s[r-t]-s[r-t+1]+s[r+t-1]+2*s[r+t]+s[r+t+1];c[r]=Math.sqrt(i*i+a*a),l[r]=Math.atan2(a,i),c[r]>u&&(u=c[r])}let d=new Float32Array(o);for(let e=1;e<n-1;e++)for(let n=1;n<t-1;n++){let r=e*t+n,i=(l[r]+Math.PI)%Math.PI,a,o;i<Math.PI/8||i>=7*Math.PI/8?(a=c[r-1],o=c[r+1]):i<3*Math.PI/8?(a=c[r-t+1],o=c[r+t-1]):i<5*Math.PI/8?(a=c[r-t],o=c[r+t]):(a=c[r-t-1],o=c[r+t+1]),d[r]=c[r]>=a&&c[r]>=o?c[r]:0}let f=i*u,p=a*u,m=new Uint8Array(o);for(let e=0;e<o;e++)m[e]=d[e]>=p?255:d[e]>=f?128:0;let h=!0;for(;h;){h=!1;for(let e=1;e<n-1;e++)for(let n=1;n<t-1;n++){let r=e*t+n;if(m[r]===128){for(let i=-1;i<=1;i++)for(let a=-1;a<=1;a++)if(m[(e+i)*t+n+a]===255){m[r]=255,h=!0;break}}}}for(let e=0;e<o;e++)m[e]===128&&(m[e]=0);let g=new Uint8ClampedArray(e.length);for(let t=0;t<o;t++){let n=t*4;g[n]=g[n+1]=g[n+2]=m[t],g[n+3]=e[n+3]}return g}let Dr={uniforms:{uThreshold:`f32`,uNormalize:`i32`,uLoR:`f32`,uLoG:`f32`,uLoB:`f32`,uHiR:`f32`,uHiG:`f32`,uHiB:`f32`},multiPass:!0,passes:2};function Or(e){let t=String(e).replace(`#`,``);return t.length===3?{r:parseInt(t[0]+t[0],16),g:parseInt(t[1]+t[1],16),b:parseInt(t[2]+t[2],16)}:{r:parseInt(t.slice(0,2),16)||0,g:parseInt(t.slice(2,4),16)||0,b:parseInt(t.slice(4,6),16)||0}}function kr(e){let t=Or(e.minColour??`#000000`),n=Or(e.maxColour??`#ffffff`);return{uThreshold:e.threshold??0,uNormalize:+!!e.normalize,uLoR:t.r,uLoG:t.g,uLoB:t.b,uHiR:n.r,uHiG:n.g,uHiB:n.b}}function Ar(e){let t=String(e).replace(`#`,``);return t.length===3?{r:parseInt(t[0]+t[0],16),g:parseInt(t[1]+t[1],16),b:parseInt(t[2]+t[2],16)}:t.length>=6?{r:parseInt(t.slice(0,2),16)||0,g:parseInt(t.slice(2,4),16)||0,b:parseInt(t.slice(4,6),16)||0}:{r:0,g:0,b:0}}let jr=I({type:`sobel`,name:`SOBEL EDGE`,category:`EDGE`,params:{threshold:{value:0,min:0,max:255,step:1,label:`THRESHOLD`,tier:3,driveable:!0,unit:`lvl`},normalize:{value:1,min:0,max:1,step:1,label:`NORMALIZE`,type:`toggle`,tier:4},minColour:{label:`MIN COLOUR`,value:`#000000`,tier:6,type:`internal`},maxColour:{label:`MAX COLOUR`,value:`#ffffff`,tier:6,type:`internal`},rampSource:{label:`RAMP SRC`,value:`NORMALISED_MAGNITUDE`,type:`select`,options:[`RAW_MAGNITUDE`,`NORMALISED_MAGNITUDE`,`POST_THRESHOLD_VALUE`],tier:6},rampSpace:{label:`RAMP SPACE`,value:`RGB`,type:`select`,options:[`RGB`,`HSV`],tier:6},rampClamp:{label:`CLAMP BELOW THRESHOLD`,value:1,tier:6,type:`internal`}},extendedControls:[{type:`colour-ramp-control`,paramKeys:{minColour:`minColour`,maxColour:`maxColour`,rampSource:`rampSource`,rampSpace:`rampSpace`,clamp:`rampClamp`}}],apply(e,t,n,r,i,a,o){let s=Cr(e,n,r,i.threshold,!!i.normalize),c=Ar(i.minColour),l=Ar(i.maxColour),u=i.rampClamp!==!1&&i.rampClamp!==0,d=n*r;for(let n=0;n<d;n++){let r=o?o(`threshold`,n,a):i.threshold,d=s[n*4],f=u&&d<r?0:d/255,p=c.r+(l.r-c.r)*f,m=c.g+(l.g-c.g)*f,h=c.b+(l.b-c.b)*f;u&&(p=Math.max(0,Math.min(255,p)),m=Math.max(0,Math.min(255,m)),h=Math.max(0,Math.min(255,h)));let g=n*4;t[g]=Math.round(p),t[g+1]=Math.round(m),t[g+2]=Math.round(h),t[g+3]=e[g+3]}},wgsl:`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uPass      : f32,  // 0=luma, 1=sobel+ramp
  uThreshold : f32,
  uNormalize : f32,  // 1=normalise to hardcoded max, 0=raw magnitude/360
  uLoR       : f32,
  uLoG       : f32,
  uLoB       : f32,
  uHiR       : f32,
  uHiG       : f32,
  uHiB       : f32,
  _pad       : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn lumaAt(x: i32, y: i32, w: i32, h: i32) -> f32 {
  let c = textureLoad(tIn, vec2i(clamp(x,0,w-1), clamp(y,0,h-1)), 0);
  return c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  if (uni.uPass < 0.5) {
    // ── Pass 0: luminance extraction ──────────────────────────────────────
    let px = textureLoad(tIn, vec2i(x, y), 0);
    let lum = px.r * 0.299 + px.g * 0.587 + px.b * 0.114;
    textureStore(tOut, vec2i(x, y), vec4f(lum, lum, lum, px.a));

  } else {
    // ── Pass 1: 3×3 Sobel + threshold + colour ramp ───────────────────────
    let tl = lumaAt(x-1, y-1, w, h);  let tc = lumaAt(x, y-1, w, h);  let tr = lumaAt(x+1, y-1, w, h);
    let ml = lumaAt(x-1, y,   w, h);                                    let mr = lumaAt(x+1, y,   w, h);
    let bl = lumaAt(x-1, y+1, w, h);  let bc = lumaAt(x, y+1, w, h);  let br = lumaAt(x+1, y+1, w, h);

    let gx = (-tl + tr) + 2.0*(-ml + mr) + (-bl + br);
    let gy = (-tl - 2.0*tc - tr) + (bl + 2.0*bc + br);
    let mag = sqrt(gx*gx + gy*gy);

    // Normalise: max possible magnitude ≈ 1448 (for float 0-1 input)
    // Equivalent of 362 * (1/255) * 4 for 8-bit. Use 4.0 as empirical max.
    let normalised = select(mag / 4.0, mag, uni.uNormalize < 0.5);
    let clamped    = clamp(normalised, 0.0, 1.0);

    let threshold = uni.uThreshold / 255.0;
    let t = select(clamped, 0.0, clamped < threshold);

    let lo = vec3f(uni.uLoR, uni.uLoG, uni.uLoB) / 255.0;
    let hi = vec3f(uni.uHiR, uni.uHiG, uni.uHiB) / 255.0;
    let rgb = mix(lo, hi, t);

    let alpha = textureLoad(tIn, vec2i(x, y), 0).a;
    textureStore(tOut, vec2i(x, y), vec4f(rgb, alpha));
  }
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uPass;
uniform float     uThreshold;
uniform int       uNormalize;
uniform float     uLoR, uLoG, uLoB;
uniform float     uHiR, uHiG, uHiB;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  ivec2 sz  = textureSize(uTex, 0);
  vec2 ts   = vec2(1.0) / vec2(sz);
  float w   = float(sz.x);
  float h   = float(sz.y);

  if (uPass == 0) {
    // ── Pass 0: luminance ─────────────────────────────────────────────────
    vec4 px = texture(uTex, vUV);
    float lum = px.r * 0.299 + px.g * 0.587 + px.b * 0.114;
    fragColor = vec4(lum, lum, lum, px.a);

  } else {
    // ── Pass 1: Sobel + ramp ──────────────────────────────────────────────
    float tl = texture(uTex, vUV + ts * vec2(-1,-1)).r;
    float tc = texture(uTex, vUV + ts * vec2( 0,-1)).r;
    float tr = texture(uTex, vUV + ts * vec2( 1,-1)).r;
    float ml = texture(uTex, vUV + ts * vec2(-1, 0)).r;
    float mr = texture(uTex, vUV + ts * vec2( 1, 0)).r;
    float bl = texture(uTex, vUV + ts * vec2(-1, 1)).r;
    float bc = texture(uTex, vUV + ts * vec2( 0, 1)).r;
    float br = texture(uTex, vUV + ts * vec2( 1, 1)).r;

    float gx = (-tl + tr) + 2.0*(-ml + mr) + (-bl + br);
    float gy = (-tl - 2.0*tc - tr) + (bl + 2.0*bc + br);
    float mag = sqrt(gx*gx + gy*gy);

    float normalised = (uNormalize == 1) ? clamp(mag / 4.0, 0.0, 1.0) : clamp(mag, 0.0, 1.0);
    float threshold  = uThreshold / 255.0;
    float t = (normalised < threshold) ? 0.0 : normalised;

    vec3 lo  = vec3(uLoR, uLoG, uLoB) / 255.0;
    vec3 hi  = vec3(uHiR, uHiG, uHiB) / 255.0;
    float alpha = texture(uTex, vUV).a;
    fragColor = vec4(mix(lo, hi, t), alpha);
  }
}
`,gpuBindings:{...Dr,uniformMap:kr}}),Mr=I({type:`canny`,name:`CANNY EDGE`,category:`EDGE`,forceWorkerPreview:!0,params:{sigma:{value:1.4,min:.5,max:5,step:.1,label:`SIGMA`,tier:3,previewMax:2,driveable:!0,unit:`σ`},lowThreshold:{value:.1,min:.01,max:.5,step:.01,label:`LOW THRESH`,tier:3,unit:`0–1`},highThreshold:{value:.3,min:.05,max:1,step:.01,label:`HIGH THRESH`,tier:3,unit:`0–1`}},apply(e,t,n,r,i,a,o){t.set(Er(e,n,r,i.sigma,i.lowThreshold,i.highThreshold))},wgsl:`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uSigma     : f32,
  uLowThresh : f32,
  uHighThresh: f32,
  uPass      : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn lum(c: vec4f) -> f32 {
  return dot(c.rgb, vec3f(0.299, 0.587, 0.114));
}

fn gaussBlur1D(x: i32, y: i32, w: i32, h: i32, sigma: f32, horizontal: bool) -> vec4f {
  let r   = min(i32(ceil(sigma * 3.0)), 24);
  var sum = vec4f(0.0);
  var wt  = 0.0;
  let s2  = sigma * sigma * 2.0;
  for (var d = -r; d <= r; d++) {
    let gw = exp(-f32(d * d) / s2);
    var coord: vec2i;
    if (horizontal) {
      coord = vec2i(clamp(x + d, 0, w - 1), y);
    } else {
      coord = vec2i(x, clamp(y + d, 0, h - 1));
    }
    sum += textureLoad(tIn, coord, 0) * gw;
    wt  += gw;
  }
  return sum / wt;
}

fn sobel(x: i32, y: i32, w: i32, h: i32) -> vec2f {
  let tl = lum(textureLoad(tIn, vec2i(clamp(x-1,0,w-1), clamp(y-1,0,h-1)), 0));
  let tc = lum(textureLoad(tIn, vec2i(x,                 clamp(y-1,0,h-1)), 0));
  let tr = lum(textureLoad(tIn, vec2i(clamp(x+1,0,w-1), clamp(y-1,0,h-1)), 0));
  let ml = lum(textureLoad(tIn, vec2i(clamp(x-1,0,w-1), y               ), 0));
  let mr = lum(textureLoad(tIn, vec2i(clamp(x+1,0,w-1), y               ), 0));
  let bl = lum(textureLoad(tIn, vec2i(clamp(x-1,0,w-1), clamp(y+1,0,h-1)), 0));
  let bc = lum(textureLoad(tIn, vec2i(x,                 clamp(y+1,0,h-1)), 0));
  let br = lum(textureLoad(tIn, vec2i(clamp(x+1,0,w-1), clamp(y+1,0,h-1)), 0));
  let gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
  let gy = -tl - 2.0*tc - tr + bl + 2.0*bc + br;
  return vec2f(gx, gy);
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3u) {
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  let x = i32(gid.x);
  let y = i32(gid.y);
  if (x >= w || y >= h) { return; }

  var outCol: vec4f;
  let orig = textureLoad(tIn, vec2i(x, y), 0);

  if (uni.uPass < 0.5) {
    outCol = gaussBlur1D(x, y, w, h, uni.uSigma, true);
  } else if (uni.uPass < 1.5) {
    outCol = gaussBlur1D(x, y, w, h, uni.uSigma, false);
  } else if (uni.uPass < 2.5) {
    // Sobel: store magnitude in R, angle index in G
    let g    = sobel(x, y, w, h);
    let mag  = length(g) / 1.4142;
    // Quantise angle to 0..3 (0°,45°,90°,135°)
    var ang  = atan2(g.y, g.x);
    if (ang < 0.0) { ang += 3.14159265; }
    ang = ang * 4.0 / 3.14159265;
    let dir  = i32(ang + 0.5) % 4;
    outCol   = vec4f(mag, f32(dir) / 3.0, 0.0, orig.a);
  } else {
    // Non-maximum suppression + thresholding
    let mag  = orig.r;
    let dir  = i32(round(orig.g * 3.0));
    var n1: f32; var n2: f32;
    if (dir == 0) {
      n1 = textureLoad(tIn, vec2i(clamp(x-1,0,w-1), y), 0).r;
      n2 = textureLoad(tIn, vec2i(clamp(x+1,0,w-1), y), 0).r;
    } else if (dir == 1) {
      n1 = textureLoad(tIn, vec2i(clamp(x-1,0,w-1), clamp(y-1,0,h-1)), 0).r;
      n2 = textureLoad(tIn, vec2i(clamp(x+1,0,w-1), clamp(y+1,0,h-1)), 0).r;
    } else if (dir == 2) {
      n1 = textureLoad(tIn, vec2i(x, clamp(y-1,0,h-1)), 0).r;
      n2 = textureLoad(tIn, vec2i(x, clamp(y+1,0,h-1)), 0).r;
    } else {
      n1 = textureLoad(tIn, vec2i(clamp(x+1,0,w-1), clamp(y-1,0,h-1)), 0).r;
      n2 = textureLoad(tIn, vec2i(clamp(x-1,0,w-1), clamp(y+1,0,h-1)), 0).r;
    }
    var edge = 0.0;
    if (mag >= n1 && mag >= n2) {
      if (mag >= uni.uHighThresh) {
        edge = 1.0;
      } else if (mag >= uni.uLowThresh) {
        // Local hysteresis: keep if any 8-connected neighbour is strong
        var hasStrong = false;
        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (dx == 0 && dy == 0) { continue; }
            let nm = textureLoad(tIn, vec2i(clamp(x+dx,0,w-1), clamp(y+dy,0,h-1)), 0).r;
            if (nm >= uni.uHighThresh) { hasStrong = true; }
          }
        }
        if (hasStrong) { edge = 1.0; }
      }
    }
    outCol = vec4f(vec3f(edge), orig.a);
  }

  textureStore(tOut, vec2i(x, y), outCol);
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform float     uSigma;
uniform float     uLowThresh;
uniform float     uHighThresh;
uniform int       uPass;

in  vec2 vUV;
out vec4 fragColor;

float lum(vec4 c) { return dot(c.rgb, vec3(0.299, 0.587, 0.114)); }

vec4 gaussBlur1D(vec2 uv, float sigma, bool horizontal) {
  vec2  ts  = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  int   r   = min(int(ceil(sigma * 3.0)), 24);
  vec4  sum = vec4(0.0);
  float wt  = 0.0;
  float s2  = sigma * sigma * 2.0;
  for (int d = -r; d <= r; d++) {
    float gw  = exp(-float(d * d) / s2);
    vec2  off = horizontal ? vec2(float(d) * ts.x, 0.0) : vec2(0.0, float(d) * ts.y);
    sum += texture(uTex, clamp(uv + off, vec2(0.0), vec2(1.0))) * gw;
    wt  += gw;
  }
  return sum / wt;
}

void main() {
  vec2 ts   = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  vec4 orig = texture(uTex, vUV);

  if (uPass == 0) {
    fragColor = gaussBlur1D(vUV, uSigma, true);
    return;
  }
  if (uPass == 1) {
    fragColor = gaussBlur1D(vUV, uSigma, false);
    return;
  }
  if (uPass == 2) {
    float tl = lum(texture(uTex, vUV + vec2(-ts.x, -ts.y)));
    float tc = lum(texture(uTex, vUV + vec2( 0.0,  -ts.y)));
    float tr = lum(texture(uTex, vUV + vec2( ts.x, -ts.y)));
    float ml = lum(texture(uTex, vUV + vec2(-ts.x,  0.0 )));
    float mr = lum(texture(uTex, vUV + vec2( ts.x,  0.0 )));
    float bl = lum(texture(uTex, vUV + vec2(-ts.x,  ts.y)));
    float bc = lum(texture(uTex, vUV + vec2( 0.0,   ts.y)));
    float br = lum(texture(uTex, vUV + vec2( ts.x,  ts.y)));
    float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
    float gy = -tl - 2.0*tc - tr + bl + 2.0*bc + br;
    float mag = length(vec2(gx, gy)) / 1.4142;
    float ang = atan(gy, gx);
    if (ang < 0.0) ang += 3.14159265;
    ang = ang * 4.0 / 3.14159265;
    float dir = mod(floor(ang + 0.5), 4.0);
    fragColor = vec4(mag, dir / 3.0, 0.0, orig.a);
    return;
  }

  // Pass 3: NMS + thresholding
  float mag = orig.r;
  int   dir = int(round(orig.g * 3.0));
  float n1  = 0.0;
  float n2  = 0.0;
  if (dir == 0) {
    n1 = lum(texture(uTex, vUV + vec2(-ts.x,  0.0)));
    n2 = lum(texture(uTex, vUV + vec2( ts.x,  0.0)));
  } else if (dir == 1) {
    n1 = lum(texture(uTex, vUV + vec2(-ts.x, -ts.y)));
    n2 = lum(texture(uTex, vUV + vec2( ts.x,  ts.y)));
  } else if (dir == 2) {
    n1 = lum(texture(uTex, vUV + vec2( 0.0, -ts.y)));
    n2 = lum(texture(uTex, vUV + vec2( 0.0,  ts.y)));
  } else {
    n1 = lum(texture(uTex, vUV + vec2( ts.x, -ts.y)));
    n2 = lum(texture(uTex, vUV + vec2(-ts.x,  ts.y)));
  }

  float edge = 0.0;
  if (mag >= n1 && mag >= n2) {
    if (mag >= uHighThresh) {
      edge = 1.0;
    } else if (mag >= uLowThresh) {
      for (int dy = -1; dy <= 1; dy++) {
        for (int dx = -1; dx <= 1; dx++) {
          if (dx == 0 && dy == 0) continue;
          float nm = lum(texture(uTex, clamp(vUV + vec2(float(dx)*ts.x, float(dy)*ts.y), vec2(0.0), vec2(1.0))));
          if (nm >= uHighThresh) edge = 1.0;
        }
      }
    }
  }
  fragColor = vec4(vec3(edge), orig.a);
}
`,gpuBindings:{uniforms:{uSigma:`f32`,uLowThresh:`f32`,uHighThresh:`f32`},multiPass:!0,passes:4,uniformMap:e=>({uSigma:e.sigma,uLowThresh:e.lowThreshold,uHighThresh:e.highThreshold})}}),Nr={"4-conn":0,"8-conn":1},Pr={signed:0,absolute:1,"positive-only":2,"negative-only":3,"zero-crossing":4},Fr=I({type:`laplacian`,name:`LAPLACIAN`,category:`EDGE`,params:{mode:{value:`4-conn`,type:`select`,options:[`4-conn`,`8-conn`],label:`MODE`,tier:3},preBlur:{value:0,min:0,max:10,step:.1,label:`PRE BLUR`,tier:3,driveable:!0,unit:`px`},outputMode:{value:`absolute`,type:`select`,options:[`signed`,`absolute`,`positive-only`,`negative-only`,`zero-crossing`],label:`OUTPUT MODE`,tier:3},gain:{value:1,min:.1,max:10,step:.1,label:`GAIN`,tier:4,driveable:!0,unit:`×`},threshold:{value:0,min:0,max:1,step:.01,label:`THRESHOLD`,tier:4,driveable:!0,unit:`0–1`},normalize:{value:1,min:0,max:1,step:1,label:`NORMALISE`,type:`toggle`,tier:5}},apply(e,t,n,r,i,a,o){t.set(wr(e,n,r,i.mode,!!i.normalize))},wgsl:`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uMode       : f32,
  uOutputMode : f32,
  uGain       : f32,
  uThreshold  : f32,
  uPreBlur    : f32,
  uNorm       : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn load(x: i32, y: i32, w: i32, h: i32) -> vec4f {
  return textureLoad(tIn, vec2i(clamp(x, 0, w-1), clamp(y, 0, h-1)), 0);
}

fn lum(c: vec4f) -> f32 { return dot(c.rgb, vec3f(0.299, 0.587, 0.114)); }

fn blurred3x3(x: i32, y: i32, w: i32, h: i32) -> f32 {
  var s = 0.0;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      s += lum(load(x + dx, y + dy, w, h));
    }
  }
  return s / 9.0;
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  var c: f32;
  var n: f32; var s: f32; var el: f32; var r: f32;

  if (uni.uPreBlur > 0.0) {
    c  = blurred3x3(x,   y,   w, h);
    n  = blurred3x3(x,   y-1, w, h);
    s  = blurred3x3(x,   y+1, w, h);
    el = blurred3x3(x-1, y,   w, h);
    r  = blurred3x3(x+1, y,   w, h);
  } else {
    c  = lum(load(x,   y,   w, h));
    n  = lum(load(x,   y-1, w, h));
    s  = lum(load(x,   y+1, w, h));
    el = lum(load(x-1, y,   w, h));
    r  = lum(load(x+1, y,   w, h));
  }

  var lap: f32;
  if (uni.uMode < 0.5) {
    // 4-connected: -4c + n + s + e + w
    lap = -4.0 * c + n + s + el + r;
  } else {
    // 8-connected: include diagonals
    let tl = lum(load(x-1, y-1, w, h));
    let tr = lum(load(x+1, y-1, w, h));
    let bl = lum(load(x-1, y+1, w, h));
    let br = lum(load(x+1, y+1, w, h));
    lap = -8.0 * c + n + s + el + r + tl + tr + bl + br;
  }

  lap *= uni.uGain;

  var out: f32;
  let mode = i32(uni.uOutputMode);
  if (mode == 0) {        // signed
    out = clamp(lap * 0.5 + 0.5, 0.0, 1.0);
  } else if (mode == 1) { // absolute
    out = clamp(abs(lap), 0.0, 1.0);
  } else if (mode == 2) { // positive-only
    out = clamp(max(lap, 0.0), 0.0, 1.0);
  } else if (mode == 3) { // negative-only
    out = clamp(max(-lap, 0.0), 0.0, 1.0);
  } else {                // zero-crossing
    out = select(0.0, 1.0, abs(lap) < uni.uThreshold + 0.01);
  }

  if (mode != 4 && out < uni.uThreshold) { out = 0.0; }

  textureStore(tOut, vec2i(x, y), vec4f(out, out, out, 1.0));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uMode;
uniform int   uOutputMode;
uniform float uGain;
uniform float uThreshold;
uniform float uPreBlur;

in  vec2 vUV;
out vec4 fragColor;

float lum(vec4 c) { return dot(c.rgb, vec3(0.299, 0.587, 0.114)); }

vec2 ts;

float sample1(float ox, float oy) {
  return lum(texture(uTex, clamp(vUV + vec2(ox, oy) / ts, vec2(0.0), vec2(1.0))));
}

float blur3x3() {
  float s = 0.0;
  for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++)
    s += sample1(float(dx), float(dy));
  return s / 9.0;
}

void main() {
  ts = vec2(textureSize(uTex, 0));
  float c; float n; float sv; float el; float r;
  if (uPreBlur > 0.0) {
    c  = blur3x3(); // approximate
    n  = sample1(0.0, -1.0); s = sample1(0.0, 1.0);
    el = sample1(-1.0, 0.0); r = sample1(1.0, 0.0);
  } else {
    c = sample1(0.0,0.0); n=sample1(0.0,-1.0); sv=sample1(0.0,1.0);
    el=sample1(-1.0,0.0); r=sample1(1.0,0.0);
  }
  float lap;
  if (uMode == 0) {
    lap = -4.0*c + n + sv + el + r;
  } else {
    float tl=sample1(-1.0,-1.0),tr2=sample1(1.0,-1.0),bl=sample1(-1.0,1.0),br=sample1(1.0,1.0);
    lap = -8.0*c + n + sv + el + r + tl + tr2 + bl + br;
  }
  lap *= uGain;
  float out2;
  if (uOutputMode == 0)      out2 = clamp(lap*0.5+0.5, 0.0, 1.0);
  else if (uOutputMode == 1) out2 = clamp(abs(lap),     0.0, 1.0);
  else if (uOutputMode == 2) out2 = clamp(max(lap,0.0), 0.0, 1.0);
  else if (uOutputMode == 3) out2 = clamp(max(-lap,0.0),0.0, 1.0);
  else                       out2 = (abs(lap) < uThreshold + 0.01) ? 1.0 : 0.0;
  if (uOutputMode != 4 && out2 < uThreshold) out2 = 0.0;
  fragColor = vec4(out2, out2, out2, 1.0);
}
`,gpuBindings:{uniforms:{uMode:`i32`,uOutputMode:`i32`,uGain:`f32`,uThreshold:`f32`,uPreBlur:`f32`,uNorm:`i32`},multiPass:!1,uniformMap:e=>({uMode:Nr[e.mode]??0,uOutputMode:Pr[e.outputMode]??1,uGain:e.gain,uThreshold:e.threshold,uPreBlur:e.preBlur,uNorm:+!!e.normalize})}}),Ir=I({type:`dog`,name:`DIFF OF GAUSS`,category:`EDGE`,params:{sigma1:{value:1,min:.1,max:10,step:.1,label:`SIGMA 1`,tier:3,previewMax:3,driveable:!0,unit:`σ`},sigma2:{value:1.6,min:.2,max:15,step:.1,label:`SIGMA 2`,tier:3,previewMax:5,driveable:!0,unit:`σ`},threshold:{value:5,min:0,max:50,step:1,label:`THRESHOLD`,tier:4,driveable:!0,unit:`lvl`}},apply(e,t,n,r,i,a,o){let s=Math.min(i.sigma1,i.sigma2-.1),c=i.sigma2,l=o?o(`threshold`,0,a):i.threshold;t.set(Tr(e,n,r,s,c,l))},wgsl:`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uSigma1    : f32,
  uSigma2    : f32,
  uThreshold : f32,
  uPass      : f32,  // 0 = horiz sigma1, 1 = vert sigma1, 2 = subtract+threshold
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn gaussWeight(sigma: f32, d: i32) -> f32 {
  let s2 = sigma * sigma * 2.0;
  return exp(-f32(d * d) / s2);
}

fn gaussBlur1D(x: i32, y: i32, w: i32, h: i32, sigma: f32, horizontal: bool) -> vec4f {
  let r   = min(i32(ceil(sigma * 3.0)), 32);
  var sum = vec4f(0.0);
  var wt  = 0.0;
  for (var d = -r; d <= r; d++) {
    let gw = gaussWeight(sigma, d);
    var coord: vec2i;
    if (horizontal) {
      coord = vec2i(clamp(x + d, 0, w - 1), y);
    } else {
      coord = vec2i(x, clamp(y + d, 0, h - 1));
    }
    sum += textureLoad(tIn, coord, 0) * gw;
    wt  += gw;
  }
  return sum / wt;
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3u) {
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  let x = i32(gid.x);
  let y = i32(gid.y);
  if (x >= w || y >= h) { return; }

  var outCol: vec4f;

  if (uni.uPass < 0.5) {
    // Pass 0: horizontal blur with sigma1
    outCol = gaussBlur1D(x, y, w, h, uni.uSigma1, true);
  } else if (uni.uPass < 1.5) {
    // Pass 1: vertical blur with sigma1
    outCol = gaussBlur1D(x, y, w, h, uni.uSigma1, false);
  } else {
    // Pass 2: tIn = blurred1; compute inline sigma2 blur and subtract
    let blurred1 = textureLoad(tIn, vec2i(x, y), 0);
    let blurred2 = gaussBlur1D(x, y, w, h, uni.uSigma2, true);
    let diff = blurred1.rgb - blurred2.rgb;
    let lum  = dot(diff, vec3f(0.299, 0.587, 0.114));
    let edge = select(0.0, 1.0, abs(lum) > uni.uThreshold);
    outCol = vec4f(vec3f(edge), blurred1.a);
  }

  textureStore(tOut, vec2i(x, y), outCol);
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform float     uSigma1;
uniform float     uSigma2;
uniform float     uThreshold;
uniform int       uPass;

in  vec2 vUV;
out vec4 fragColor;

vec4 gaussBlur1D(vec2 uv, float sigma, bool horizontal) {
  vec2 ts  = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  int  r   = min(int(ceil(sigma * 3.0)), 32);
  vec4 sum = vec4(0.0);
  float wt = 0.0;
  float s2 = sigma * sigma * 2.0;
  for (int d = -r; d <= r; d++) {
    float gw = exp(-float(d * d) / s2);
    vec2 off = horizontal
      ? vec2(float(d) * ts.x, 0.0)
      : vec2(0.0, float(d) * ts.y);
    sum += texture(uTex, clamp(uv + off, vec2(0.0), vec2(1.0))) * gw;
    wt  += gw;
  }
  return sum / wt;
}

void main() {
  if (uPass == 0) {
    fragColor = gaussBlur1D(vUV, uSigma1, true);
  } else if (uPass == 1) {
    fragColor = gaussBlur1D(vUV, uSigma1, false);
  } else {
    vec4 b1   = texture(uTex, vUV);
    vec4 b2   = gaussBlur1D(vUV, uSigma2, true);
    vec3 diff = b1.rgb - b2.rgb;
    float lum = dot(diff, vec3(0.299, 0.587, 0.114));
    float edge = abs(lum) > uThreshold ? 1.0 : 0.0;
    fragColor = vec4(vec3(edge), b1.a);
  }
}
`,gpuBindings:{uniforms:{uSigma1:`f32`,uSigma2:`f32`,uThreshold:`f32`},multiPass:!0,passes:3,uniformMap:e=>({uSigma1:Math.min(e.sigma1,e.sigma2-.1),uSigma2:e.sigma2,uThreshold:e.threshold/255})}});function Lr(e,t,n,r){let i=e*r,a=t*r,o=r/2;return n===0?[{cx:i,cy:a,r:o,startAngle:0,endAngle:Math.PI/2},{cx:i+r,cy:a+r,r:o,startAngle:Math.PI,endAngle:3*Math.PI/2}]:[{cx:i+r,cy:a,r:o,startAngle:Math.PI/2,endAngle:Math.PI},{cx:i,cy:a+r,r:o,startAngle:3*Math.PI/2,endAngle:2*Math.PI}]}function Rr(e,t,n=`product`){switch(n){case`product`:return e*t;case`sum`:return Math.min(1,(e+t)/2);case`min`:return Math.min(e,t);case`max`:return Math.max(e,t);case`xor`:return Math.abs(e-t);default:return e*t}}function zr(e,t,n=!1,r=.1){if(!n)return+(e>t);let i=(e-t+r/2)/r;return Math.max(0,Math.min(1,i*i*(3-2*i)))}function Br(e,t,n){let r=n>>>0;return r=(r^e)*73244475>>>0,r=(r^t)*73244475>>>0,r=(r>>16^r)>>>0,r}function Vr(e,t,n,r,i){let a=Math.floor(e/n),o=Math.floor(t/n),s=Br(a,o,r)&1,c=e-a*n,l=t-o*n,u=n/2,d=1/0,f=Lr(0,0,s,n);for(let e of f){let t=c-e.cx,n=l-e.cy,r=Math.abs(Math.sqrt(t*t+n*n)-u);d=Math.min(d,r)}return d-i/2}function Hr(e,t,n,r){let i=r.wavelength??r.period??8;switch(n){case`linear`:{let n=r.angle??0;return(e*Math.cos(n)+t*Math.sin(n))/i+(r.phase??0)}case`radial`:{let n=r.cx??0,a=r.cy??0;return Math.hypot(e-n,t-a)/i+(r.phase??0)}case`angular`:{let n=r.cx??0,i=r.cy??0;return(r.n??8)*Math.atan2(t-i,e-n)/(Math.PI*2)+(r.phase??0)}case`spiral`:{let n=r.cx??0,a=r.cy??0,o=r.spiralRate??1,s=e-n,c=t-a,l=Math.sqrt(s*s+c*c),u=Math.atan2(c,s);return l/i+o*u/(Math.PI*2)+(r.phase??0)}default:return e/i}}function Ur(e,t,n,r,i=`arcs`,a=1){let o=Math.max(1e-4,n*1e-4),s=Vr(e,t,n,r,a),c=(Vr(e+o,t,n,r,a)-Vr(e-o,t,n,r,a))/(2*o),l=(Vr(e,t+o,n,r,a)-Vr(e,t-o,n,r,a))/(2*o),u=Math.hypot(c,l)||1;return{distStroke:s,normal:{x:c/u,y:l/u},mask:+(s<0)}}function Wr(e,t,n,r={}){let i=r.wavelength??r.period??8,a=Math.max(1e-4,i*1e-4),o=Hr(e,t,n,r),s=Hr(e+a,t,n,r),c=Hr(e,t+a,n,r),l=(s-o)/a,u=(c-o)/a,d=Math.hypot(l,u)||1,f={x:l/d,y:u/d},p={x:-f.y,y:f.x},m=Math.floor(o),h=o-m,g=Math.min(h,1-h)*i;return{phi:Math.PI*2*o,bandIndex:m,distEdge:g,tangent:p,normal:f}}function Gr(e,t,n,r,i,a,o,s,c,l=`square`,u=`luminance`,d=`linear`,f=!1,p=!1){let m=Math.cos(i*Math.PI/180),h=Math.sin(i*Math.PI/180),g=new Uint8ClampedArray(e.length);for(let r=0,i=t*n*4;r<i;r+=4)g[r]=g[r+1]=g[r+2]=s,g[r+3]=e[r+3];let _=new Float32Array(t*n);if(u===`luminance`)for(let r=0;r<t*n;r++){let t=r*4;_[r]=(e[t]*.299+e[t+1]*.587+e[t+2]*.114)/255}else if(u===`red`)for(let r=0;r<t*n;r++)_[r]=e[r*4]/255;else if(u===`green`)for(let r=0;r<t*n;r++)_[r]=e[r*4+1]/255;else if(u===`blue`)for(let r=0;r<t*n;r++)_[r]=e[r*4+2]/255;else if(u===`alpha`)for(let r=0;r<t*n;r++)_[r]=e[r*4+3]/255;else if(u===`hue`)for(let r=0;r<t*n;r++){let t=r*4,n=e[t]/255,i=e[t+1]/255,a=e[t+2]/255,o=Math.max(n,i,a),s=o-Math.min(n,i,a);if(s===0){_[r]=0;continue}_[r]=((o===n?(i-a)/s:o===i?2+(a-n)/s:4+(n-i)/s)/6%1+1)%1}else if(u===`saturation`)for(let r=0;r<t*n;r++){let t=r*4,n=e[t]/255,i=e[t+1]/255,a=e[t+2]/255,o=Math.max(n,i,a);_[r]=o===0?0:(o-Math.min(n,i,a))/o}else if(u===`gradientMagnitude`)for(let r=0;r<n;r++)for(let i=0;i<t;i++){let a=r*t+i,o=i<t-1?i+1:i,s=i>0?i-1:i,c=r<n-1?r+1:r,l=r>0?r-1:r,u=t=>{let n=t*4;return(e[n]*.299+e[n+1]*.587+e[n+2]*.114)/255},d=u(r*t+o)-u(r*t+s),f=u(c*t+i)-u(l*t+i);_[a]=Math.min(1,Math.sqrt(d*d+f*f))}else if(u===`distanceToEdge`){let r=new Float32Array(t*n);for(let i=0;i<t*n;i++){let t=i*4;r[i]=(e[t]*.299+e[t+1]*.587+e[t+2]*.114)/255}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let i=Math.min(r,t-1-r),a=Math.min(e,n-1-e);_[e*t+r]=Math.min(1,Math.min(i,a)/(Math.min(t,n)*.1+1))}}else for(let r=0;r<t*n;r++){let t=r*4;_[r]=(e[t]*.299+e[t+1]*.587+e[t+2]*.114)/255}function v(e){return d===`smoothstep`?e*e*(3-2*e):d===`exponential`?e*e:d===`threshold`?+(e>=.5):d===`stepped`?Math.round(e*4)/4:e}function y(e){let t=a+(1-v(f?1-e:e))*(o-a);if(p){let e=Math.max(0,Math.min(1,(t-a)/(o-a+.001)));return a+e*e*(3-2*e)*(o-a)}return Math.max(a,Math.min(o,t))}let b=Math.sqrt(t*t+n*n),x=Math.ceil(b/r)*2;for(let e=-x;e<=x;e++)for(let i=-x;i<=x;i++){let a=e*r,o=i*r;l===`hexagonal`&&e&1?o+=r*.5:l===`staggered`&&i&1&&(a+=r*.5);let s=Math.round(t/2+a*m-o*h),u=Math.round(n/2+a*h+o*m);if(s<0||s>=t||u<0||u>=n)continue;let d=y(_[u*t+s]),f=d*d,p=Math.ceil(d);for(let e=-p;e<=p;e++){let r=u+e;if(!(r<0||r>=n))for(let n=-p;n<=p;n++){let i=s+n;if(!(i<0||i>=t)&&n*n+e*e<=f){let e=(r*t+i)*4;g[e]=g[e+1]=g[e+2]=c}}}}return g}let Kr={multiply:0,screen:1,replace:2,overlay:3},qr={uniforms:{uTileSize:`f32`,uStrokeWidth:`f32`,uOpacity:`f32`,uBlend:`i32`,uSeed:`f32`,uStrokeR:`f32`,uStrokeG:`f32`,uStrokeB:`f32`},multiPass:!1,uniformMap:e=>({uTileSize:e.tileSize,uStrokeWidth:e.strokeWidth,uOpacity:e.patternOpacity,uBlend:Kr[e.internalBlend.toLowerCase()]??0,uSeed:e.seed??0,uStrokeR:e.strokeR/255,uStrokeG:e.strokeG/255,uStrokeB:e.strokeB/255})};function Jr(e,t,n){let r=n>>>0;return r=(r^e)*73244475>>>0,r=(r^t)*73244475>>>0,r=(r>>16^r)>>>0,r}function Yr(e,t,n,r,i,a,o,s){let c=[e/255,t/255,n/255],l=[r/255,i/255,a/255],u=o/255,d=[0,0,0];for(let e=0;e<3;e++){let t;t=s===`multiply`?c[e]*l[e]:s===`screen`?1-(1-c[e])*(1-l[e]):s===`overlay`?c[e]<.5?2*c[e]*l[e]:1-2*(1-c[e])*(1-l[e]):l[e],d[e]=Math.round(Math.max(0,Math.min(1,c[e]+(t-c[e])*u))*255)}return d}function Xr(e,t,n,r,i){let a=Math.max(0,Math.min(t-1,Math.floor(r))),o=Math.max(0,Math.min(n-1,Math.floor(i))),s=Math.min(t-1,a+1),c=Math.min(n-1,o+1),l=r-a,u=i-o,d=(1-l)*(1-u),f=l*(1-u),p=(1-l)*u,m=l*u,h=(o*t+a)*4,g=(o*t+s)*4,_=(c*t+a)*4,v=(c*t+s)*4;return[e[h]*d+e[g]*f+e[_]*p+e[v]*m,e[h+1]*d+e[g+1]*f+e[_+1]*p+e[v+1]*m,e[h+2]*d+e[g+2]*f+e[_+2]*p+e[v+2]*m,e[h+3]*d+e[g+3]*f+e[_+3]*p+e[v+3]*m]}function Zr(e,t,n,r,i){switch(r){case`FIXED`:return 0;case`CHECKER`:return e+t&1;case`DRIVEN`:return i<.5?0:1;default:return Jr(e,t,n)&1}}function Qr(e,t,n,r){let i=r/2,a=Math.max(Math.abs(e-n/2)-n/2,0)+Math.abs(t-n/2)-i,o=Math.max(Math.abs(t-n/2)-n/2,0)+Math.abs(e-n/2)-i;return Math.min(a,o)}function $r(e,t,n){return-1}function ei(e,t,n,r,i){let a=n/2,o,s;return i===0?(o=Math.abs(Math.sqrt((e-0)*(e-0)+(t-0)*(t-0))-a),s=Math.abs(Math.sqrt((e-n)*(e-n)+(t-n)*(t-n))-a)):(o=Math.abs(Math.sqrt((e-n)*(e-n)+(t-0)*(t-0))-a),s=Math.abs(Math.sqrt((e-0)*(e-0)+(t-n)*(t-n))-a)),Math.min(o,s)-r/2}function ti(e,t,n,r,i){let a=n/2,o,s;return i===0?(o=Math.sqrt(e*e+t*t)-a,s=Math.sqrt((e-n)*(e-n)+(t-n)*(t-n))-a):(o=Math.sqrt((e-n)*(e-n)+t*t)-a,s=Math.sqrt(e*e+(t-n)*(t-n))-a),Math.min(o,s)}function ni(e,t,n,r){let i=r/2,a=n/2,o=n/2,s=[[a,0],[n,o],[a,n],[0,o]],c=1/0;for(let[n,r]of s){let i=n-a,s=r-o,l=e-a,u=t-o,d=Math.max(0,Math.min(1,(l*i+u*s)/(i*i+s*s))),f=l-d*i,p=u-d*s;c=Math.min(c,Math.sqrt(f*f+p*p))}return c-i}function ri(e,t,n,r,i,a){switch(i){case`DOUBLE ARC`:return ei(e,t,n,r,a);case`CROSS`:return Qr(e,t,n,r);case`BLOB`:return ti(e,t,n,r,a);case`MULTI-LINE`:return ni(e,t,n,r);case`FILLED`:return $r(e,t,n);default:{let i=n/2,o,s;return a===0?(o=Math.abs(Math.sqrt(e*e+t*t)-i),s=Math.abs(Math.sqrt((e-n)*(e-n)+(t-n)*(t-n))-i)):(o=Math.abs(Math.sqrt((e-n)*(e-n)+t*t)-i),s=Math.abs(Math.sqrt(e*e+(t-n)*(t-n))-i)),Math.min(o,s)-r/2}}}let ii=I({type:`truchet`,name:`TRUCHET`,category:`PATTERN`,params:{tileSize:{label:`TILE SIZE`,min:5,max:100,step:1,value:20,tier:3,previewMax:40,unit:`px`,driveable:!0},strokeWidth:{label:`STROKE W`,min:.5,max:15,step:.5,value:3,tier:3,previewMax:8,unit:`px`,driveable:!0},tileMotif:{label:`TILE MOTIF`,type:`select`,options:[`QUARTER ARC`,`DOUBLE ARC`,`CROSS`,`BLOB`,`MULTI-LINE`,`FILLED`],value:`QUARTER ARC`,tier:3},orientationMode:{label:`ORIENT MODE`,type:`select`,options:[`RANDOM`,`FIXED`,`CHECKER`,`DRIVEN`],value:`RANDOM`,tier:3},seed:{label:`SEED`,min:0,max:9999,step:1,value:0,tier:3,unit:`n`,driveable:!0},gridOffsetX:{label:`OFFSET X`,min:-100,max:100,step:1,value:0,tier:4,unit:`px`,driveable:!0},gridOffsetY:{label:`OFFSET Y`,min:-100,max:100,step:1,value:0,tier:4,unit:`px`,driveable:!0},rotation:{label:`ROTATION`,min:0,max:360,step:1,value:0,tier:4,unit:`°`,driveable:!0},internalBlend:{label:`BLEND`,type:`select`,options:[`MULTIPLY`,`SCREEN`,`OVERLAY`,`REPLACE`],value:`MULTIPLY`,tier:4},patternOpacity:{label:`PATTERN OPQ`,min:0,max:1,step:.01,value:1,tier:4,unit:`0–1`,driveable:!0},strokeR:{label:`STROKE R`,min:0,max:255,step:1,value:0,tier:4,unit:`lvl`,driveable:!0},strokeG:{label:`STROKE G`,min:0,max:255,step:1,value:0,tier:4,unit:`lvl`,driveable:!0},strokeB:{label:`STROKE B`,min:0,max:255,step:1,value:0,tier:4,unit:`lvl`,driveable:!0},antiAlias:{label:`ANTI-ALIAS`,type:`toggle`,value:!0,tier:4},modificationMode:{label:`MOD MODE`,type:`select`,options:[`NONE`,`STROKE MASK`,`REGION MASK`,`DISTANCE FIELD`,`DISPLACEMENT`],value:`NONE`,tier:5},insideStrength:{label:`INSIDE STR`,min:-1,max:1,step:.01,value:.3,tier:5,unit:`0–1`,driveable:!0,when:{modificationMode:[`STROKE MASK`,`REGION MASK`]}},outsideStrength:{label:`OUTSIDE STR`,min:-1,max:1,step:.01,value:0,tier:5,unit:`0–1`,driveable:!0,when:{modificationMode:[`STROKE MASK`,`REGION MASK`]}},maskFeather:{label:`MASK FEATHER`,min:0,max:20,step:.5,value:2,tier:5,unit:`px`,driveable:!0,when:{modificationMode:[`STROKE MASK`,`REGION MASK`]}},displacementStrength:{label:`DISPLACE STR`,min:0,max:50,step:.5,value:10,tier:5,unit:`px`,driveable:!0,when:{modificationMode:`DISPLACEMENT`}},displacementRadius:{label:`DISPLACE RAD`,min:0,max:100,step:1,value:20,tier:5,unit:`px`,driveable:!0,when:{modificationMode:`DISPLACEMENT`}},colourShiftStrength:{label:`COLOUR SHIFT`,min:0,max:1,step:.01,value:0,tier:5,unit:`0–1`,driveable:!0,when:{modificationMode:`DISTANCE FIELD`}},blurStrength:{label:`BLUR STR`,min:0,max:20,step:.5,value:0,tier:5,unit:`px`,driveable:!0,when:{modificationMode:`DISTANCE FIELD`}},sharpenStrength:{label:`SHARPEN STR`,min:0,max:5,step:.1,value:0,tier:5,unit:`n`,driveable:!0,when:{modificationMode:`DISTANCE FIELD`}},orientationATreatment:{label:`ORIENT A`,type:`select`,options:[`NONE`,`LIGHTEN`,`DARKEN`,`DESATURATE`,`TINT`],value:`NONE`,tier:5,when:{modificationMode:`REGION MASK`}},orientationBTreatment:{label:`ORIENT B`,type:`select`,options:[`NONE`,`LIGHTEN`,`DARKEN`,`DESATURATE`,`TINT`],value:`NONE`,tier:5,when:{modificationMode:`REGION MASK`}}},apply(e,t,n,r,i,a,o){let s=(i.seed??0)+(a?.nodeSeed??0)>>>0,c=i.tileMotif??`QUARTER ARC`,l=i.orientationMode??`RANDOM`,u=i.modificationMode??`NONE`,d=(i.internalBlend??`MULTIPLY`).toLowerCase(),f=Math.cos((i.rotation??0)*Math.PI/180),p=Math.sin((i.rotation??0)*Math.PI/180),m=n/2,h=r/2,g=null;if(l===`DRIVEN`){let t=Math.max(5,i.tileSize),a=i.gridOffsetX??0,o=i.gridOffsetY??0,s=Math.ceil(n/t)+2,c=Math.ceil(r/t)+2;g=new Uint8Array(s*c);for(let i=0;i<c;i++)for(let c=0;c<s;c++){let l=c*t-a+t/2,u=i*t-o+t/2,d=Math.max(0,Math.min(n-1,Math.round(l)))|0,f=((Math.max(0,Math.min(r-1,Math.round(u)))|0)*n+d)*4,p=(.299*e[f]+.587*e[f+1]+.114*e[f+2])/255;g[i*s+c]=p<.5?0:1}}for(let a=0;a<r;a++)for(let _=0;_<n;_++){let v=a*n+_,y=v*4,b=o(`tileSize`,v),x=o(`strokeWidth`,v),S=o(`gridOffsetX`,v),C=o(`gridOffsetY`,v),w=o(`patternOpacity`,v),T=o(`rotation`,v),E=o(`strokeR`,v),D=o(`strokeG`,v),O=o(`strokeB`,v),k=Math.max(5,b),A=_-m,j=a-h,M=T===(i.rotation??0)?f:Math.cos(T*Math.PI/180),N=T===(i.rotation??0)?p:Math.sin(T*Math.PI/180),P=M*A-N*j+m+S,F=N*A+M*j+h+C,I=Math.floor(P/k),L=Math.floor(F/k),ee=P-I*k,te=F-L*k,R;if(l===`DRIVEN`&&g){let e=Math.ceil(n/k)+2,t=Math.max(0,Math.min(e-1,I)),i=Math.max(0,Math.min(Math.ceil(r/k)+1,L));R=g[i*e+t]}else R=Zr(I,L,s,l,0);let z=ri(ee,te,k,x,c,R),B=i.antiAlias?Math.max(0,Math.min(1,-z+.5)):+(z<0),V=e[y],H=e[y+1],U=e[y+2],W=e[y+3];if(u!==`NONE`){let c=V,l=H,f=U;if(u===`STROKE MASK`||u===`REGION MASK`){let e=o(`insideStrength`,v),t=o(`outsideStrength`,v),n=o(`maskFeather`,v),r=n>0?Math.max(0,Math.min(1,(-z+n)/(2*n))):B,a=(r*e+(1-r)*t)*128;if(c=Math.max(0,Math.min(255,V+a)),l=Math.max(0,Math.min(255,H+a)),f=Math.max(0,Math.min(255,U+a)),u===`REGION MASK`){let e=R===0?i.orientationATreatment:i.orientationBTreatment;if(e===`LIGHTEN`)c=Math.min(255,c+40*r),l=Math.min(255,l+40*r),f=Math.min(255,f+40*r);else if(e===`DARKEN`)c=Math.max(0,c-40*r),l=Math.max(0,l-40*r),f=Math.max(0,f-40*r);else if(e===`DESATURATE`){let e=.299*c+.587*l+.114*f;c+=(e-c)*r,l+=(e-l)*r,f+=(e-f)*r}else e===`TINT`&&(c+=(E-c)*r*.5,l+=(D-l)*r*.5,f+=(O-f)*r*.5)}}else if(u===`DISTANCE FIELD`){let t=Math.max(0,Math.min(1,Math.abs(z)/k)),i=o(`colourShiftStrength`,v),s=o(`blurStrength`,v),u=o(`sharpenStrength`,v);if(c=V+(E-V)*i*(1-t),l=H+(D-H)*i*(1-t),f=U+(O-U)*i*(1-t),s>0){let i=Math.round(s*(1-t));if(i>0){let t=0,o=0,u=0,d=0;for(let s=-i;s<=i;s++)for(let c=-i;c<=i;c++){let i=Math.max(0,Math.min(n-1,_+c)),l=(Math.max(0,Math.min(r-1,a+s))*n+i)*4;t+=e[l],o+=e[l+1],u+=e[l+2],d++}let p=1/d;c+=(t*p-c)*Math.max(0,Math.min(1,s/10)),l+=(o*p-l)*Math.max(0,Math.min(1,s/10)),f+=(u*p-f)*Math.max(0,Math.min(1,s/10))}}if(u>0){let e=.299*V+.587*H+.114*U;c=Math.max(0,Math.min(255,c+(c-e)*u*(1-t))),l=Math.max(0,Math.min(255,l+(l-e)*u*(1-t))),f=Math.max(0,Math.min(255,f+(f-e)*u*(1-t)))}}else if(u===`DISPLACEMENT`){let t=o(`displacementStrength`,v),i=o(`displacementRadius`,v),u=Ur(P,F,k,s,`arcs`,x),d=i>0?Math.max(0,1-Math.abs(u.distStroke)/i):1,p=Xr(e,n,r,_+u.normal.x*t*d,a+u.normal.y*t*d);c=p[0],l=p[1],f=p[2]}if(t[y]=c,t[y+1]=l,t[y+2]=f,t[y+3]=W,B>0){let e=Yr(t[y],t[y+1],t[y+2],E,D,O,Math.round(B*w*255),d);t[y]=e[0],t[y+1]=e[1],t[y+2]=e[2]}}else if(B>0){let e=Yr(V,H,U,E,D,O,Math.round(B*w*255),d);t[y]=e[0],t[y+1]=e[1],t[y+2]=e[2],t[y+3]=W}else t[y]=V,t[y+1]=H,t[y+2]=U,t[y+3]=W}},wgsl:`
struct Uniforms {
  uWidth       : f32,
  uHeight      : f32,
  uTileSize    : f32,
  uStrokeWidth : f32,
  uOpacity     : f32,
  uBlend       : f32,
  uSeed        : f32,
  uStrokeR     : f32,
  uStrokeG     : f32,
  uStrokeB     : f32,
  _pad         : f32,
  _pad2        : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// Hash tile index to 0 or 1
fn tileHash(ti: i32, tj: i32, seed: u32) -> u32 {
  var h = (u32(ti) * 2654435761u) ^ (u32(tj) * 2246822519u) ^ seed;
  h ^= h >> 16u; h *= 0x85ebca6bu; h ^= h >> 13u; h *= 0xc2b2ae35u; h ^= h >> 16u;
  return h & 1u;
}

// Quarter-arc SDF: distance to arc centred at corner based on state
fn quarterArcSDF(lx: f32, ly: f32, ts: f32, sw: f32, state: u32) -> f32 {
  let r = ts * 0.5;
  var dist: f32;
  if (state == 0u) {
    // arc from (0,0) and (ts,ts) corners
    let d1 = abs(sqrt(lx * lx + ly * ly) - r);
    let d2 = abs(sqrt((lx - ts) * (lx - ts) + (ly - ts) * (ly - ts)) - r);
    dist = min(d1, d2);
  } else {
    // arc from (ts,0) and (0,ts) corners
    let d1 = abs(sqrt((lx - ts) * (lx - ts) + ly * ly) - r);
    let d2 = abs(sqrt(lx * lx + (ly - ts) * (ly - ts)) - r);
    dist = min(d1, d2);
  }
  return dist - sw * 0.5;
}

fn blendCh(src: f32, col: f32, onStroke: f32, mode: i32, op: f32) -> f32 {
  var b: f32;
  if (mode == 0) { b = src * col; }
  else if (mode == 1) { b = 1.0 - (1.0 - src) * (1.0 - col); }
  else if (mode == 3) { b = select(1.0 - 2.0*(1.0-src)*(1.0-col), 2.0*src*col, src < 0.5); }
  else { b = col; }
  return clamp(mix(src, b, onStroke * op), 0.0, 1.0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px    = textureLoad(tIn, vec2i(x, y), 0);
  let ts    = max(5.0, uni.uTileSize);
  let ti    = i32(floor(f32(x) / ts));
  let tj    = i32(floor(f32(y) / ts));
  let lx    = f32(x) - f32(ti) * ts;
  let ly    = f32(y) - f32(tj) * ts;
  let state = tileHash(ti, tj, u32(uni.uSeed));
  let sdf   = quarterArcSDF(lx, ly, ts, uni.uStrokeWidth, state);

  // Anti-aliased stroke coverage
  let onStroke = clamp(-sdf + 0.5, 0.0, 1.0);

  let mode = i32(uni.uBlend);
  let op   = uni.uOpacity;
  let r    = blendCh(px.r, uni.uStrokeR, onStroke, mode, op);
  let g    = blendCh(px.g, uni.uStrokeG, onStroke, mode, op);
  let b    = blendCh(px.b, uni.uStrokeB, onStroke, mode, op);
  textureStore(tOut, vec2i(x, y), vec4f(r, g, b, px.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uTileSize; uniform float uStrokeWidth;
uniform float uOpacity; uniform int uBlend; uniform float uSeed;
uniform float uStrokeR; uniform float uStrokeG; uniform float uStrokeB;

in  vec2 vUV;
out vec4 fragColor;

uint tileHash(int ti, int tj, uint seed) {
  uint h = (uint(ti) * 2654435761u) ^ (uint(tj) * 2246822519u) ^ seed;
  h ^= h >> 16u; h *= 0x85ebca6bu; h ^= h >> 13u; h *= 0xc2b2ae35u; h ^= h >> 16u;
  return h & 1u;
}

float qaSDf(float lx, float ly, float ts, float sw, uint state) {
  float r = ts * 0.5;
  float dist;
  if (state == 0u) {
    float d1 = abs(sqrt(lx*lx+ly*ly)-r);
    float d2 = abs(sqrt((lx-ts)*(lx-ts)+(ly-ts)*(ly-ts))-r);
    dist = min(d1, d2);
  } else {
    float d1 = abs(sqrt((lx-ts)*(lx-ts)+ly*ly)-r);
    float d2 = abs(sqrt(lx*lx+(ly-ts)*(ly-ts))-r);
    dist = min(d1, d2);
  }
  return dist - sw * 0.5;
}

float blCh(float s, float c, float onS, int mode, float op) {
  float b;
  if(mode==0)b=s*c; else if(mode==1)b=1.-(1.-s)*(1.-c); else if(mode==3)b=(s<.5)?2.*s*c:1.-2.*(1.-s)*(1.-c); else b=c;
  return clamp(mix(s,b,onS*op),0.,1.);
}

void main() {
  vec4  px  = texture(uTex, vUV);
  vec2  res = vec2(textureSize(uTex, 0));
  float ppx = vUV.x*res.x; float ppy = vUV.y*res.y;
  float ts  = max(5.0, uTileSize);
  int   ti  = int(floor(ppx/ts)); int tj = int(floor(ppy/ts));
  float lx  = ppx - float(ti)*ts; float ly = ppy - float(tj)*ts;
  uint  st  = tileHash(ti, tj, uint(uSeed));
  float sdf = qaSDf(lx, ly, ts, uStrokeWidth, st);
  float onS = clamp(-sdf + 0.5, 0., 1.);
  fragColor = vec4(blCh(px.r,uStrokeR,onS,uBlend,uOpacity), blCh(px.g,uStrokeG,onS,uBlend,uOpacity), blCh(px.b,uStrokeB,onS,uBlend,uOpacity), px.a);
}
`,gpuBindings:qr}),ai={LINEAR:0,RADIAL:1,ANGULAR:2,SPIRAL:3},oi={multiply:0,screen:1,replace:2,overlay:3},si={uniforms:{uType:`i32`,uWavelength:`f32`,uPhase:`f32`,uAngle:`f32`,uCentreX:`f32`,uCentreY:`f32`,uSpiralRate:`f32`,uContrast:`f32`,uDutyCycle:`f32`,uSoftness:`f32`,uInvert:`i32`,uOpacity:`f32`,uBlend:`i32`},multiPass:!1,uniformMap:e=>({uType:ai[e.gratingType]??0,uWavelength:e.wavelength,uPhase:e.phase,uAngle:e.angle,uCentreX:e.centreX,uCentreY:e.centreY,uSpiralRate:e.spiralRate,uContrast:e.contrast,uDutyCycle:e.dutyCycle,uSoftness:e.softness,uInvert:+!!e.invertPattern,uOpacity:e.patternOpacity,uBlend:oi[e.internalBlend.toLowerCase()]??0})},ci=Math.PI/180;function li(e,t,n,r,i,a,o,s,c,l,u,d){let{phi:f}=Wr(e,t,n===`LINEAR`?`linear`:n===`RADIAL`?`radial`:n===`ANGULAR`?`angular`:`spiral`,{wavelength:r,angle:i*ci,phase:a,cx:s,cy:c,spiralRate:o}),p=.5*(1+Math.cos(f)),m=u<=0?0:u>=1?1:zr(p,1-u,d>0,Math.max(.001,d));return Math.max(0,Math.min(1,.5+l*(m-.5)))}let ui=I({type:`grating`,name:`GRATING`,category:`PATTERN`,params:{gratingType:{label:`TYPE`,type:`select`,options:[`LINEAR`,`RADIAL`,`ANGULAR`,`SPIRAL`],value:`LINEAR`,tier:3},wavelength:{label:`WAVELENGTH`,min:2,max:200,step:1,value:20,tier:3,previewMax:80,unit:`px`,driveable:!0},phase:{label:`PHASE`,min:0,max:1,step:.01,value:0,tier:3,unit:`0–1`,driveable:!0},angle:{label:`ANGLE`,min:0,max:360,step:1,value:0,tier:4,unit:`deg`,driveable:!0,when:{param:`gratingType`,oneOf:[`LINEAR`,`SPIRAL`]}},centreX:{label:`CENTRE X`,min:0,max:1,step:.01,value:.5,tier:4,unit:`0–1`,driveable:!0,when:{param:`gratingType`,oneOf:[`RADIAL`,`ANGULAR`,`SPIRAL`]}},centreY:{label:`CENTRE Y`,min:0,max:1,step:.01,value:.5,tier:4,unit:`0–1`,driveable:!0,when:{param:`gratingType`,oneOf:[`RADIAL`,`ANGULAR`,`SPIRAL`]}},spiralRate:{label:`SPIRAL RATE`,min:.1,max:10,step:.1,value:1,tier:5,unit:`n`,driveable:!0,when:{param:`gratingType`,equals:`SPIRAL`}},contrast:{label:`CONTRAST`,min:0,max:1,step:.01,value:1,tier:3,unit:`0–1`,driveable:!0},dutyCycle:{label:`DUTY CYCLE`,min:0,max:1,step:.01,value:.5,tier:4,unit:`0–1`,driveable:!0},softness:{label:`SOFTNESS`,min:0,max:1,step:.01,value:0,tier:4,unit:`0–1`,driveable:!0},invertPattern:{label:`INVERT`,type:`toggle`,value:!1,tier:4},antiAlias:{label:`ANTI-ALIAS`,type:`toggle`,value:!0,tier:5},patternOpacity:{label:`OPACITY`,min:0,max:1,step:.01,value:1,tier:4,unit:`0–1`,driveable:!0},internalBlend:{label:`BLEND`,type:`select`,options:[`MULTIPLY`,`SCREEN`,`REPLACE`,`OVERLAY`],value:`MULTIPLY`,tier:4}},apply(e,t,n,r,i,a,o){let s=i.internalBlend.toLowerCase(),c=i.gratingType,l=c===`RADIAL`||c===`ANGULAR`||c===`SPIRAL`;for(let a=0;a<r;a++)for(let u=0;u<n;u++){let d=(a*n+u)*4,f=a*n+u,p=o(`wavelength`,f),m=o(`phase`,f),h=o(`angle`,f),g=o(`spiralRate`,f),_=l?o(`centreX`,f)*n:n*.5,v=l?o(`centreY`,f)*r:r*.5,y=o(`contrast`,f),b=o(`dutyCycle`,f),x=o(`softness`,f),S=o(`patternOpacity`,f),C=li(u,a,c,p,h,m,g,_,v,y,b,x);i.invertPattern&&(C=1-C);for(let n=0;n<3;n++){let r=e[d+n]/255,i;i=s===`multiply`?r*C:s===`screen`?1-(1-r)*(1-C):s===`overlay`?r<.5?2*r*C:1-2*(1-r)*(1-C):C;let a=Math.max(0,Math.min(1,i));t[d+n]=Math.round(e[d+n]*(1-S)+a*255*S)}t[d+3]=e[d+3]}},wgsl:`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uType       : f32,
  uWavelength : f32,
  uPhase      : f32,
  uAngle      : f32,
  uCentreX    : f32,
  uCentreY    : f32,
  uSpiralRate : f32,
  uContrast   : f32,
  uDutyCycle  : f32,
  uSoftness   : f32,
  uInvert     : f32,
  uOpacity    : f32,
  uBlend      : f32,
  _pad        : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI     : f32 = 3.14159265358979;
const TWO_PI : f32 = 6.28318530717959;

fn evalGrating(x: f32, y: f32, cx: f32, cy: f32) -> f32 {
  let wl  = max(uni.uWavelength, 1.0);
  let ang = uni.uAngle * PI / 180.0;
  var t: f32;
  let typ = i32(uni.uType);
  if (typ == 0) {
    // LINEAR
    t = (cos(ang) * x + sin(ang) * y) / wl;
  } else if (typ == 1) {
    // RADIAL
    let dx = x - cx; let dy = y - cy;
    t = sqrt(dx*dx + dy*dy) / wl;
  } else if (typ == 2) {
    // ANGULAR
    let dx = x - cx; let dy = y - cy;
    var a = atan2(dy, dx);
    if (a < 0.0) { a += TWO_PI; }
    t = a / TWO_PI * wl; // reuse wl as cycles
    t = t / wl;
  } else {
    // SPIRAL
    let dx = x - cx; let dy = y - cy;
    let r  = sqrt(dx*dx + dy*dy);
    var a  = atan2(dy, dx);
    if (a < 0.0) { a += TWO_PI; }
    t = (r + a * uni.uSpiralRate * wl / TWO_PI) / wl;
  }

  t = t + uni.uPhase;
  // Convert t to [0,1] wave: duty cycle + softness
  let c  = fract(t);
  let dc = clamp(uni.uDutyCycle, 0.0, 1.0);
  var v: f32;
  if (uni.uSoftness <= 0.0) {
    v = select(0.0, 1.0, c < dc);
  } else {
    let sf = uni.uSoftness * 0.5;
    v = clamp((c < dc) ? (dc - c) / max(sf, 0.001) : (c - dc) / max(sf, 0.001), 0.0, 1.0);
    v = select(1.0 - v, v, c < dc);
  }
  v = 0.5 + (v - 0.5) * uni.uContrast;
  v = clamp(v, 0.0, 1.0);
  if (uni.uInvert > 0.5) { v = 1.0 - v; }
  return v;
}

fn blendCh(src: f32, v: f32, mode: i32) -> f32 {
  if (mode == 0) { return src * v; }
  if (mode == 1) { return 1.0 - (1.0 - src) * (1.0 - v); }
  if (mode == 3) { return select(1.0 - 2.0*(1.0-src)*(1.0-v), 2.0*src*v, src < 0.5); }
  return v; // replace
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let cx = uni.uCentreX * uni.uWidth;
  let cy = uni.uCentreY * uni.uHeight;
  let v  = evalGrating(f32(x), f32(y), cx, cy);
  let mode = i32(uni.uBlend);
  let op   = uni.uOpacity;

  let outR = clamp(mix(px.r, blendCh(px.r, v, mode), op), 0.0, 1.0);
  let outG = clamp(mix(px.g, blendCh(px.g, v, mode), op), 0.0, 1.0);
  let outB = clamp(mix(px.b, blendCh(px.b, v, mode), op), 0.0, 1.0);
  textureStore(tOut, vec2i(x, y), vec4f(outR, outG, outB, px.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uType;
uniform float uWavelength; uniform float uPhase; uniform float uAngle;
uniform float uCentreX; uniform float uCentreY; uniform float uSpiralRate;
uniform float uContrast; uniform float uDutyCycle; uniform float uSoftness;
uniform int   uInvert; uniform float uOpacity; uniform int uBlend;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;
const float TWO_PI = 6.28318530717959;

float evalGrating(float px, float py, float cx, float cy) {
  float wl = max(uWavelength, 1.0);
  float ang = uAngle * PI / 180.0;
  float t;
  if (uType == 0)      t = (cos(ang)*px + sin(ang)*py) / wl;
  else if (uType == 1) { float dx=px-cx,dy=py-cy; t=sqrt(dx*dx+dy*dy)/wl; }
  else if (uType == 2) { float dx=px-cx,dy=py-cy; float a=atan(dy,dx); if(a<0.)a+=TWO_PI; t=a/TWO_PI*wl/wl; }
  else { float dx=px-cx,dy=py-cy; float r=sqrt(dx*dx+dy*dy); float a=atan(dy,dx); if(a<0.)a+=TWO_PI; t=(r+a*uSpiralRate*wl/TWO_PI)/wl; }
  t += uPhase;
  float c = fract(t);
  float dc = clamp(uDutyCycle, 0., 1.);
  float v;
  if (uSoftness <= 0.0) { v = (c < dc) ? 1.0 : 0.0; }
  else { float sf=uSoftness*.5; float raw=(c<dc)?(dc-c)/max(sf,.001):(c-dc)/max(sf,.001); raw=clamp(raw,0.,1.); v=(c<dc)?raw:1.-raw; }
  v = 0.5 + (v - 0.5) * uContrast;
  v = clamp(v, 0., 1.);
  if (uInvert == 1) v = 1.0 - v;
  return v;
}

float blendCh(float s, float v, int mode) {
  if (mode==0) return s*v;
  if (mode==1) return 1.-(1.-s)*(1.-v);
  if (mode==3) return (s<.5)?2.*s*v:1.-2.*(1.-s)*(1.-v);
  return v;
}

void main() {
  vec4  px  = texture(uTex, vUV);
  vec2  res = vec2(textureSize(uTex, 0));
  float cx  = uCentreX * res.x; float cy = uCentreY * res.y;
  float ppx = vUV.x * res.x;    float ppy = vUV.y * res.y;
  float v   = evalGrating(ppx, ppy, cx, cy);
  float op  = uOpacity;
  fragColor = vec4(
    clamp(mix(px.r, blendCh(px.r, v, uBlend), op), 0., 1.),
    clamp(mix(px.g, blendCh(px.g, v, uBlend), op), 0., 1.),
    clamp(mix(px.b, blendCh(px.b, v, uBlend), op), 0., 1.),
    px.a
  );
}
`,gpuBindings:si}),di={LINEAR:0,RADIAL:1,ANGULAR:2},fi={product:0,sum:1,xor:2,min:3,max:4},pi={multiply:0,screen:1,replace:2,overlay:3},mi={uniforms:{uType1:`i32`,uWl1:`f32`,uAngle1:`f32`,uPhase1:`f32`,uDc1:`f32`,uSoftness1:`f32`,uType2:`i32`,uWl2:`f32`,uAngle2:`f32`,uPhase2:`f32`,uDc2:`f32`,uSoftness2:`f32`,uCombine:`i32`,uInvert:`i32`,uOpacity:`f32`,uBlend:`i32`},multiPass:!1,uniformMap:e=>({uType1:di[e.type1]??0,uWl1:e.wavelength1,uAngle1:e.angle1,uPhase1:e.phase1,uDc1:e.dutyCycle1,uSoftness1:e.softness1,uType2:di[e.type2]??0,uWl2:e.wavelength2,uAngle2:e.angle2,uPhase2:e.phase2,uDc2:e.dutyCycle2,uSoftness2:e.softness2,uCombine:fi[e.combineMode.toLowerCase()]??0,uInvert:+!!e.invertPattern,uOpacity:e.patternOpacity,uBlend:pi[e.internalBlend.toLowerCase()]??0})},hi=Math.PI/180;function gi(e,t,n,r,i,a,o,s,c){let l={wavelength:r,angle:i*hi,phase:a,cx:0,cy:0},{phi:u}=Wr(e,t,n===`LINEAR`?`linear`:n===`RADIAL`?`radial`:n===`ANGULAR`?`angular`:`linear`,l),d=.5*(1+Math.cos(u)),f=s<=0?0:s>=1?1:zr(d,1-s,c>0,Math.max(.001,c));return Math.max(0,Math.min(1,.5+o*(f-.5)))}let _i=I({type:`moire`,name:`MOIRE`,category:`PATTERN`,params:{type1:{label:`TYPE 1`,type:`select`,options:[`LINEAR`,`RADIAL`,`ANGULAR`],value:`LINEAR`,tier:3},wavelength1:{label:`WAVE 1`,min:2,max:200,step:1,value:15,tier:3,previewMax:50,unit:`px`,driveable:!0},angle1:{label:`ANGLE 1`,min:0,max:180,step:.5,value:0,tier:3,unit:`deg`,driveable:!0},phase1:{label:`PHASE 1`,min:0,max:1,step:.01,value:0,tier:4,unit:`0–1`,driveable:!0},contrast1:{label:`CONTRAST 1`,min:0,max:1,step:.01,value:1,tier:4,unit:`0–1`,driveable:!0},dutyCycle1:{label:`DUTY CYCLE 1`,min:0,max:1,step:.01,value:.5,tier:4,unit:`0–1`,driveable:!0},softness1:{label:`SOFTNESS 1`,min:0,max:1,step:.01,value:0,tier:4,unit:`0–1`,driveable:!0},type2:{label:`TYPE 2`,type:`select`,options:[`LINEAR`,`RADIAL`,`ANGULAR`],value:`LINEAR`,tier:3},wavelength2:{label:`WAVE 2`,min:2,max:200,step:1,value:16,tier:3,previewMax:50,unit:`px`,driveable:!0},angle2:{label:`ANGLE 2`,min:0,max:180,step:.5,value:5,tier:3,unit:`deg`,driveable:!0},phase2:{label:`PHASE 2`,min:0,max:1,step:.01,value:0,tier:4,unit:`0–1`,driveable:!0},contrast2:{label:`CONTRAST 2`,min:0,max:1,step:.01,value:1,tier:4,unit:`0–1`,driveable:!0},dutyCycle2:{label:`DUTY CYCLE 2`,min:0,max:1,step:.01,value:.5,tier:4,unit:`0–1`,driveable:!0},softness2:{label:`SOFTNESS 2`,min:0,max:1,step:.01,value:0,tier:4,unit:`0–1`,driveable:!0},combineMode:{label:`COMBINE`,type:`select`,options:[`PRODUCT`,`SUM`,`XOR`,`MIN`,`MAX`],value:`PRODUCT`,tier:3},threshold:{label:`THRESHOLD`,min:0,max:1,step:.01,value:0,tier:4,unit:`0–1`},antiAlias:{label:`ANTI-ALIAS`,type:`toggle`,value:!1,tier:4},invertPattern:{label:`INVERT`,type:`toggle`,value:!1,tier:4},patternOpacity:{label:`OPACITY`,min:0,max:1,step:.01,value:1,tier:4,unit:`0–1`,driveable:!0},internalBlend:{label:`BLEND`,type:`select`,options:[`MULTIPLY`,`SCREEN`,`REPLACE`,`OVERLAY`],value:`MULTIPLY`,tier:4}},apply(e,t,n,r,i,a,o){let s=i.combineMode.toLowerCase(),c=i.internalBlend.toLowerCase(),l=i.threshold>0,u=i.antiAlias?.08:0;for(let a=0;a<r;a++)for(let r=0;r<n;r++){let d=(a*n+r)*4,f=a*n+r,p=o(`wavelength1`,f),m=o(`angle1`,f),h=o(`phase1`,f),g=o(`contrast1`,f),_=o(`dutyCycle1`,f),v=o(`softness1`,f),y=o(`wavelength2`,f),b=o(`angle2`,f),x=o(`phase2`,f),S=o(`contrast2`,f),C=o(`dutyCycle2`,f),w=o(`softness2`,f),T=o(`patternOpacity`,f),E=Rr(gi(r,a,i.type1,p,m,h,g,_,v),gi(r,a,i.type2,y,b,x,S,C,w),s);l&&(E=u>0?zr(E,i.threshold,!0,u):zr(E,i.threshold,!1,0)),i.invertPattern&&(E=1-E);for(let n=0;n<3;n++){let r=e[d+n]/255,i;i=c===`multiply`?r*E:c===`screen`?1-(1-r)*(1-E):c===`overlay`?r<.5?2*r*E:1-2*(1-r)*(1-E):E;let a=Math.max(0,Math.min(1,i));t[d+n]=Math.round(e[d+n]*(1-T)+a*255*T)}t[d+3]=e[d+3]}},wgsl:`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uType1     : f32,
  uWl1       : f32,
  uAngle1    : f32,
  uPhase1    : f32,
  uDc1       : f32,
  uSoftness1 : f32,
  uType2     : f32,
  uWl2       : f32,
  uAngle2    : f32,
  uPhase2    : f32,
  uDc2       : f32,
  uSoftness2 : f32,
  uCombine   : f32,
  uInvert    : f32,
  uOpacity   : f32,
  uBlend     : f32,
  _pad       : f32,
  _pad2      : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI     : f32 = 3.14159265358979;
const TWO_PI : f32 = 6.28318530717959;
const CX     : f32 = 0.5;
const CY     : f32 = 0.5;

fn evalGrating1D(x: f32, y: f32, typ: i32, wl: f32, ang: f32, ph: f32, dc: f32, sf: f32) -> f32 {
  let w = max(wl, 1.0);
  var t: f32;
  let a = ang * PI / 180.0;
  let cx = CX * uni.uWidth; let cy = CY * uni.uHeight;
  if (typ == 0) {
    t = (cos(a) * x + sin(a) * y) / w;
  } else if (typ == 1) {
    let dx = x - cx; let dy = y - cy;
    t = sqrt(dx*dx + dy*dy) / w;
  } else {
    let dx = x - cx; let dy = y - cy;
    var aa = atan2(dy, dx);
    if (aa < 0.0) { aa += TWO_PI; }
    t = aa / TWO_PI;
  }
  t += ph;
  let c = fract(t);
  let d = clamp(dc, 0.0, 1.0);
  var v: f32;
  if (sf <= 0.0) {
    v = select(0.0, 1.0, c < d);
  } else {
    let s2 = sf * 0.5;
    let raw = select((c - d) / max(s2, 0.001), (d - c) / max(s2, 0.001), c < d);
    v = select(1.0 - clamp(raw, 0.0, 1.0), clamp(raw, 0.0, 1.0), c < d);
  }
  return clamp(v, 0.0, 1.0);
}

fn combineV(a: f32, b: f32, mode: i32) -> f32 {
  if (mode == 0) { return a * b; }
  if (mode == 1) { return clamp(a + b, 0.0, 1.0); }
  if (mode == 2) { return abs(a - b); }
  if (mode == 3) { return min(a, b); }
  return max(a, b);
}

fn blendCh(src: f32, v: f32, mode: i32) -> f32 {
  if (mode == 0) { return src * v; }
  if (mode == 1) { return 1.0 - (1.0 - src) * (1.0 - v); }
  if (mode == 3) { return select(1.0 - 2.0*(1.0-src)*(1.0-v), 2.0*src*v, src < 0.5); }
  return v;
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let fx = f32(x); let fy = f32(y);

  let v1 = evalGrating1D(fx, fy, i32(uni.uType1), uni.uWl1, uni.uAngle1, uni.uPhase1, uni.uDc1, uni.uSoftness1);
  let v2 = evalGrating1D(fx, fy, i32(uni.uType2), uni.uWl2, uni.uAngle2, uni.uPhase2, uni.uDc2, uni.uSoftness2);
  var v  = combineV(v1, v2, i32(uni.uCombine));
  if (uni.uInvert > 0.5) { v = 1.0 - v; }

  let mode = i32(uni.uBlend);
  let op   = uni.uOpacity;
  textureStore(tOut, vec2i(x, y), vec4f(
    clamp(mix(px.r, blendCh(px.r, v, mode), op), 0.0, 1.0),
    clamp(mix(px.g, blendCh(px.g, v, mode), op), 0.0, 1.0),
    clamp(mix(px.b, blendCh(px.b, v, mode), op), 0.0, 1.0),
    px.a,
  ));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uType1; uniform float uWl1,uAngle1,uPhase1,uDc1,uSoftness1;
uniform int uType2; uniform float uWl2,uAngle2,uPhase2,uDc2,uSoftness2;
uniform int uCombine; uniform int uInvert; uniform float uOpacity; uniform int uBlend;

in  vec2 vUV;
out vec4 fragColor;

const float PI=3.14159265358979; const float TWO_PI=6.28318530717959;

float evalG(float x,float y,int typ,float wl,float ang,float ph,float dc,float sf,float cx,float cy){
  float w=max(wl,1.);float a=ang*PI/180.;float t;
  if(typ==0)      t=(cos(a)*x+sin(a)*y)/w;
  else if(typ==1) { float dx=x-cx,dy=y-cy; t=sqrt(dx*dx+dy*dy)/w; }
  else            { float dx=x-cx,dy=y-cy; float aa=atan(dy,dx); if(aa<0.)aa+=TWO_PI; t=aa/TWO_PI; }
  t+=ph; float c=fract(t); float d=clamp(dc,0.,1.);
  float v;
  if(sf<=0.) v=(c<d)?1.:0.;
  else { float s2=sf*.5; float raw=(c<d)?(d-c)/max(s2,.001):(c-d)/max(s2,.001); v=(c<d)?clamp(raw,0.,1.):1.-clamp(raw,0.,1.); }
  return clamp(v,0.,1.);
}

float combV(float a,float b,int m){
  if(m==0)return a*b; if(m==1)return clamp(a+b,0.,1.); if(m==2)return abs(a-b); if(m==3)return min(a,b); return max(a,b);
}
float blCh(float s,float v,int m){
  if(m==0)return s*v; if(m==1)return 1.-(1.-s)*(1.-v); if(m==3)return(s<.5)?2.*s*v:1.-2.*(1.-s)*(1.-v); return v;
}

void main(){
  vec4 px=texture(uTex,vUV);
  vec2 res=vec2(textureSize(uTex,0));
  float ppx=vUV.x*res.x,ppy=vUV.y*res.y;
  float cx=.5*res.x,cy=.5*res.y;
  float v1=evalG(ppx,ppy,uType1,uWl1,uAngle1,uPhase1,uDc1,uSoftness1,cx,cy);
  float v2=evalG(ppx,ppy,uType2,uWl2,uAngle2,uPhase2,uDc2,uSoftness2,cx,cy);
  float v=combV(v1,v2,uCombine);
  if(uInvert==1)v=1.-v;
  float op=uOpacity;
  fragColor=vec4(
    clamp(mix(px.r,blCh(px.r,v,uBlend),op),0.,1.),
    clamp(mix(px.g,blCh(px.g,v,uBlend),op),0.,1.),
    clamp(mix(px.b,blCh(px.b,v,uBlend),op),0.,1.),
    px.a
  );
}
`,gpuBindings:mi}),vi={square:0,hexagonal:1,staggered:2},yi=I({type:`halftonepattern`,name:`HALFTONE DOT`,category:`PATTERN`,params:{spacing:{label:`SPACING`,min:2,max:40,step:1,value:8,tier:3,previewMax:20,unit:`px`,driveable:!0},angle:{label:`ANGLE`,min:0,max:180,step:1,value:45,tier:3,unit:`deg`,driveable:!0},minDot:{label:`MIN DOT`,min:0,max:5,step:.1,value:.5,tier:4,previewMax:3,unit:`px`,driveable:!0},maxDot:{label:`MAX DOT`,min:1,max:15,step:.5,value:4,tier:4,previewMax:8,unit:`px`,driveable:!0},bgLevel:{label:`BG LEVEL`,min:0,max:255,step:1,value:255,tier:4,driveable:!0,unit:`lvl`},dotLevel:{label:`DOT LEVEL`,min:0,max:255,step:1,value:0,tier:4,driveable:!0,unit:`lvl`},patternType:{label:`PATTERN TYPE`,type:`select`,value:`dot`,options:[`dot`],tier:3},gridType:{label:`GRID TYPE`,type:`select`,value:`square`,options:[`square`,`hexagonal`,`staggered`],tier:3},responseSource:{label:`RESPONSE SOURCE`,type:`select`,value:`luminance`,options:[`luminance`,`red`,`green`,`blue`,`hue`,`saturation`,`alpha`,`gradientMagnitude`,`distanceToEdge`],tier:4},responseCurve:{label:`RESPONSE CURVE`,type:`select`,value:`linear`,options:[`linear`,`smoothstep`,`exponential`,`threshold`,`stepped`],tier:4},invert:{label:`INVERT`,type:`toggle`,value:!1,tier:4},softClamp:{label:`SOFT CLAMP`,type:`toggle`,value:!1,tier:4}},apply(e,t,n,r,i,a,o){t.set(Gr(e,n,r,o(`spacing`,0),o(`angle`,0),o(`minDot`,0),o(`maxDot`,0),o(`bgLevel`,0),o(`dotLevel`,0),i.gridType,i.responseSource,i.responseCurve,i.invert,i.softClamp))},wgsl:`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uSpacing  : f32,
  uAngle    : f32,
  uMinDot   : f32,
  uMaxDot   : f32,
  uBgLevel  : f32,
  uDotLevel : f32,
  uGridType : f32,
  _pad      : f32,
  _pad2     : f32,
  _pad3     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI : f32 = 3.14159265358979;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0=clamp(i32(floor(x)),0,w-1);let y0=clamp(i32(floor(y)),0,h-1);
  let x1=clamp(x0+1,0,w-1);let y1=clamp(y0+1,0,h-1);
  let fx=x-floor(x);let fy=y-floor(y);
  return mix(mix(textureLoad(tIn,vec2i(x0,y0),0),textureLoad(tIn,vec2i(x1,y0),0),fx),
             mix(textureLoad(tIn,vec2i(x0,y1),0),textureLoad(tIn,vec2i(x1,y1),0),fx),fy);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let sp  = max(uni.uSpacing, 2.0);
  let ang = uni.uAngle * PI / 180.0;
  let cosA = cos(ang); let sinA = sin(ang);

  // Rotate pixel
  let rx = f32(x) * cosA - f32(y) * sinA;
  let ry = f32(x) * sinA + f32(y) * cosA;

  // Find nearest grid cell centre
  var tcx: f32; var tcy: f32;
  let typ = i32(uni.uGridType);
  if (typ == 1) {
    // hexagonal: offset every other row
    let col  = floor(rx / sp);
    let row  = floor(ry / (sp * 0.866));
    let rowOdd = (i32(row) % 2) == 1;
    let offX = select(0.0, sp * 0.5, rowOdd);
    tcx = (col + 0.5) * sp + offX;
    tcy = (row + 0.5) * sp * 0.866;
  } else {
    // square or staggered (treat identically for basic version)
    let col = floor(rx / sp);
    let row = floor(ry / sp);
    let rowOdd = (i32(row) % 2) == 1;
    let offX = select(0.0, sp * 0.5, typ == 2 && rowOdd);
    tcx = (col + 0.5) * sp + offX;
    tcy = (row + 0.5) * sp;
  }

  // Unrotate to get original source pixel for luminance
  let srcX = tcx * cosA + tcy * sinA;
  let srcY = -tcx * sinA + tcy * cosA;
  let sample = bilinear(srcX, srcY, w, h);
  let lum = dot(sample.rgb, vec3f(0.299, 0.587, 0.114));

  // Dot radius from luminance
  let dotRadius = mix(uni.uMinDot, uni.uMaxDot, lum);
  // Distance from cell centre
  let dist = sqrt((rx - tcx) * (rx - tcx) + (ry - tcy) * (ry - tcy));

  let inDot = dist < dotRadius;
  let bg  = uni.uBgLevel / 255.0;
  let dot = uni.uDotLevel / 255.0;
  let val = select(bg, dot, inDot);

  textureStore(tOut, vec2i(x, y), vec4f(val, val, val, 1.0));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uSpacing; uniform float uAngle;
uniform float uMinDot; uniform float uMaxDot;
uniform float uBgLevel; uniform float uDotLevel; uniform int uGridType;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;

void main() {
  vec2  res = vec2(textureSize(uTex, 0));
  float px  = vUV.x * res.x; float py = vUV.y * res.y;
  float sp  = max(uSpacing, 2.0);
  float ang = uAngle * PI / 180.0;
  float cosA = cos(ang); float sinA = sin(ang);
  float rx = px * cosA - py * sinA;
  float ry = px * sinA + py * cosA;

  float tcx; float tcy;
  if (uGridType == 1) {
    float col=floor(rx/sp); float row=floor(ry/(sp*.866));
    float offX=(int(row)%2==1)?sp*.5:0.;
    tcx=(col+.5)*sp+offX; tcy=(row+.5)*sp*.866;
  } else {
    float col=floor(rx/sp); float row=floor(ry/sp);
    float offX=(uGridType==2&&(int(row)%2==1))?sp*.5:0.;
    tcx=(col+.5)*sp+offX; tcy=(row+.5)*sp;
  }

  float srcX = tcx*cosA + tcy*sinA;
  float srcY = -tcx*sinA + tcy*cosA;
  vec4  s   = texture(uTex, clamp(vec2(srcX,srcY)/res, vec2(0.), vec2(1.)));
  float lum = dot(s.rgb, vec3(.299,.587,.114));
  float dotR = mix(uMinDot, uMaxDot, lum);
  float dist = length(vec2(rx-tcx, ry-tcy));
  float val  = (dist < dotR) ? uDotLevel/255.0 : uBgLevel/255.0;
  fragColor  = vec4(val, val, val, 1.0);
}
`,gpuBindings:{uniforms:{uSpacing:`f32`,uAngle:`f32`,uMinDot:`f32`,uMaxDot:`f32`,uBgLevel:`f32`,uDotLevel:`f32`,uGridType:`i32`},multiPass:!1,uniformMap:e=>({uSpacing:e.spacing,uAngle:e.angle,uMinDot:e.minDot,uMaxDot:e.maxDot,uBgLevel:e.bgLevel,uDotLevel:e.dotLevel,uGridType:vi[e.gridType]??0})}}),X=new Uint8Array(512),bi=new Uint8Array(512);(function(){let e=[];for(let t=0;t<256;t++)e[t]=t;let t=0;for(let n=255;n>0;n--){t=t*1103515245+12345>>>0;let r=t%(n+1);[e[n],e[r]]=[e[r],e[n]]}for(let t=0;t<512;t++)X[t]=e[t&255],bi[t]=X[t]%12})();let xi=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]],Si=.5*(Math.sqrt(3)-1),Ci=(3-Math.sqrt(3))/6;function wi(e,t){let n=(e+t)*Si,r=Math.floor(e+n),i=Math.floor(t+n),a=(r+i)*Ci,o=r-a,s=i-a,c=e-o,l=t-s,u=+(c>l),d=c>l?0:1,f=c-u+Ci,p=l-d+Ci,m=c-1+2*Ci,h=l-1+2*Ci,g=r&255,_=i&255,v=0,y=0,b=0,x=.5-c*c-l*l;if(x>=0){let e=bi[g+X[_]];x*=x,v=x*x*(xi[e][0]*c+xi[e][1]*l)}let S=.5-f*f-p*p;if(S>=0){let e=bi[g+u+X[_+d]];S*=S,y=S*S*(xi[e][0]*f+xi[e][1]*p)}let C=.5-m*m-h*h;if(C>=0){let e=bi[g+1+X[_+1]];C*=C,b=C*C*(xi[e][0]*m+xi[e][1]*h)}return 70*(v+y+b)}function Ti(e,t,n={}){let{octaves:r=4,lacunarity:i=2,persistence:a=.5,noiseFn:o=wi}=n,s=0,c=1,l=1,u=0;for(let n=0;n<r;n++)s+=c*o(e*l,t*l),u+=c,c*=a,l*=i;return s/u}function Ei(e,t,n){let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*r*(r*(r*6-15)+10)}function Di(e,t,n=0){let r=(n|0)*.103081+(n|0)*(n|0)*1e-7,i=(n|0)*.172713+(n|0)*(n|0)*2e-7;e+=r,t+=i;let a=Math.floor(e)&255,o=Math.floor(t)&255,s=e-Math.floor(e),c=t-Math.floor(t),l=X[X[a]+o],u=X[X[a]+o+1],d=X[X[a+1]+o],f=X[X[a+1]+o+1],p=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],m=(e,t,n)=>{let r=p[e&7];return r[0]*t+r[1]*n},h=m(l,s,c),g=m(d,s-1,c),_=m(u,s,c-1),v=m(f,s-1,c-1),y=Ei(0,1,s),b=Ei(0,1,c),x=(e,t,n)=>e+n*(t-e);return x(x(h,g,y),x(_,v,y),b)}function Oi(e,t,n,r,i,a,o,s){let c=new Uint8ClampedArray(e.length);for(let l=0;l<n;l++)for(let u=0;u<t;u++){let d=(s.fbm(u/t*r,l/n*r,i)+1)*.5,f=(l*t+u)*4;for(let t=0;t<3;t++){let n=e[f+t]/255,r;r=o===`add`?n+(d-.5)*a*2:o===`multiply`?n*(1-a+d*a):o===`screen`?1-(1-n)*(1-d*a):n<.5?2*n*(.5+(d-.5)*a):1-2*(1-n)*(.5+(.5-d)*a),c[f+t]=Math.max(0,Math.min(255,Math.round(r*255)))}c[f+3]=e[f+3]}return c}let ki={add:0,multiply:1,screen:2,overlay:3},Ai=I({type:`perlinoverlay`,name:`NOISE FIELD`,category:`NOISE`,params:{scale:{label:`SCALE`,min:.1,max:20,step:.1,value:3,tier:3,previewMax:10,driveable:!0,unit:`n`},octaves:{label:`OCTAVES`,min:1,max:8,step:1,value:4,tier:3,previewMax:4,driveable:!0,unit:`n`},strength:{label:`STRENGTH`,min:0,max:1,step:.01,value:.3,tier:3,driveable:!0,unit:`0–1`},blendMode:{label:`BLEND`,type:`select`,options:[`ADD`,`MULTIPLY`,`SCREEN`,`OVERLAY`],value:`ADD`,tier:4}},_noiseCache:null,_noiseSeed:null,apply(e,t,n,r,i,a,o){let s=a?.nodeSeed??42;(!this._noiseCache||this._noiseSeed!==s)&&(this._noiseCache=new ct(s),this._noiseSeed=s);let c=o?o(`scale`,0):i.scale,l=o?o(`octaves`,0):i.octaves,u=o?o(`strength`,0):i.strength;t.set(Oi(e,n,r,c,l,u,i.blendMode.toLowerCase(),this._noiseCache))},wgsl:`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uScale     : f32,
  uOctaves   : f32,
  uStrength  : f32,
  uBlendMode : f32,  // 0=ADD 1=MULTIPLY 2=SCREEN 3=OVERLAY
  _pad       : f32,
  _pad2      : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// ── Hash-based gradient noise ────────────────────────────────────────────────
fn hash2(n: f32) -> f32 {
  return fract(sin(n) * 43758.5453123);
}

fn grad2(h: f32, x: f32, y: f32) -> f32 {
  let idx = i32(h * 7.0) % 8;
  let gx = array<f32, 8>(1.0, -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, -1.0);
  let gy = array<f32, 8>(1.0,  1.0,-1.0,  1.0, 1.0,-1.0, 0.0,  0.0);
  return gx[idx] * x + gy[idx] * y;
}

fn fade(t: f32) -> f32 { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

fn perlin(px: f32, py: f32) -> f32 {
  let ix = floor(px);
  let iy = floor(py);
  let fx = px - ix;
  let fy = py - iy;
  let ux = fade(fx);
  let uy = fade(fy);

  let n00 = grad2(hash2(ix       + iy       * 57.0), fx,       fy      );
  let n10 = grad2(hash2(ix + 1.0 + iy       * 57.0), fx - 1.0, fy      );
  let n01 = grad2(hash2(ix       + (iy+1.0) * 57.0), fx,       fy - 1.0);
  let n11 = grad2(hash2(ix + 1.0 + (iy+1.0) * 57.0), fx - 1.0, fy - 1.0);

  let a = mix(n00, n10, ux);
  let b = mix(n01, n11, ux);
  return mix(a, b, uy);
}

fn fbm(x: f32, y: f32, octaves: i32) -> f32 {
  var value = 0.0;
  var amp   = 0.5;
  var freq  = 1.0;
  for (var i = 0; i < octaves; i++) {
    value += perlin(x * freq, y * freq) * amp;
    amp   *= 0.5;
    freq  *= 2.0;
  }
  return value * 0.5 + 0.5; // remap to [0,1]
}

fn blendChannel(src: f32, noise: f32, mode: i32, strength: f32) -> f32 {
  var b: f32;
  if (mode == 1) {       // MULTIPLY
    b = src * noise;
  } else if (mode == 2) { // SCREEN
    b = 1.0 - (1.0 - src) * (1.0 - noise);
  } else if (mode == 3) { // OVERLAY
    b = select(2.0 * src * noise, 1.0 - 2.0 * (1.0 - src) * (1.0 - noise), src < 0.5);
  } else {               // ADD
    b = src + noise;
  }
  return clamp(mix(src, b, strength), 0.0, 1.0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px    = textureLoad(tIn, vec2i(x, y), 0);
  let nx    = f32(x) / uni.uWidth  * uni.uScale;
  let ny    = f32(y) / uni.uHeight * uni.uScale;
  let oct   = clamp(i32(uni.uOctaves), 1, 8);
  let noise = fbm(nx, ny, oct);
  let mode  = i32(uni.uBlendMode);

  textureStore(tOut, vec2i(x, y), vec4f(
    blendChannel(px.r, noise, mode, uni.uStrength),
    blendChannel(px.g, noise, mode, uni.uStrength),
    blendChannel(px.b, noise, mode, uni.uStrength),
    px.a,
  ));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uScale;
uniform float uOctaves;
uniform float uStrength;
uniform int   uBlendMode;

in  vec2 vUV;
out vec4 fragColor;

float hash2(float n)  { return fract(sin(n) * 43758.5453123); }

float grad2(float h, float x, float y) {
  int idx = int(h * 7.0) % 8;
  float gx[8]; float gy[8];
  gx[0]=1.;gx[1]=-1.;gx[2]=1.;gx[3]=-1.;gx[4]=0.;gx[5]=0.;gx[6]=1.;gx[7]=-1.;
  gy[0]=1.;gy[1]=1.;gy[2]=-1.;gy[3]=1.;gy[4]=1.;gy[5]=-1.;gy[6]=0.;gy[7]=0.;
  return gx[idx] * x + gy[idx] * y;
}

float fade(float t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float perlinN(float px, float py) {
  float ix = floor(px); float iy = floor(py);
  float fx = px - ix;   float fy = py - iy;
  float ux = fade(fx);  float uy = fade(fy);
  float n00 = grad2(hash2(ix       + iy       * 57.0), fx,       fy      );
  float n10 = grad2(hash2(ix + 1.0 + iy       * 57.0), fx - 1.0, fy      );
  float n01 = grad2(hash2(ix       + (iy+1.0) * 57.0), fx,       fy - 1.0);
  float n11 = grad2(hash2(ix + 1.0 + (iy+1.0) * 57.0), fx - 1.0, fy - 1.0);
  return mix(mix(n00, n10, ux), mix(n01, n11, ux), uy);
}

float fbm(float x, float y, int octaves) {
  float value = 0.0; float amp = 0.5; float freq = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += perlinN(x * freq, y * freq) * amp;
    amp *= 0.5; freq *= 2.0;
  }
  return value * 0.5 + 0.5;
}

float blendCh(float src, float noise, int mode, float strength) {
  float b;
  if (mode == 1)      b = src * noise;
  else if (mode == 2) b = 1.0 - (1.0 - src) * (1.0 - noise);
  else if (mode == 3) b = (src < 0.5) ? 2.0 * src * noise : 1.0 - 2.0 * (1.0 - src) * (1.0 - noise);
  else                b = src + noise;
  return clamp(mix(src, b, strength), 0.0, 1.0);
}

void main() {
  vec4 px    = texture(uTex, vUV);
  ivec2 res  = textureSize(uTex, 0);
  float nx   = vUV.x * uScale;
  float ny   = vUV.y * uScale;
  int   oct  = clamp(int(uOctaves), 1, 8);
  float n    = fbm(nx, ny, oct);
  fragColor = vec4(
    blendCh(px.r, n, uBlendMode, uStrength),
    blendCh(px.g, n, uBlendMode, uStrength),
    blendCh(px.b, n, uBlendMode, uStrength),
    px.a
  );
}
`,gpuBindings:{uniforms:{uScale:`f32`,uOctaves:`f32`,uStrength:`f32`,uBlendMode:`i32`},multiPass:!1,uniformMap:e=>({uScale:e.scale,uOctaves:e.octaves,uStrength:e.strength,uBlendMode:ki[e.blendMode.toLowerCase()]??0})}}),ji={uniforms:{uStrength:`f32`,uScale:`f32`,uOctaves:`f32`,uLayers:`f32`},multiPass:!1,uniformMap:e=>({uStrength:e.strength,uScale:e.scale,uOctaves:e.octaves,uLayers:e.layers})};function Mi(e,t,n,r,i,a,o){let s=Math.floor(r),c=Math.floor(i),l=r-s,u=i-c,d=Math.max(0,Math.min(t-1,s)),f=Math.max(0,Math.min(t-1,s+1)),p=Math.max(0,Math.min(n-1,c)),m=Math.max(0,Math.min(n-1,c+1)),h=(p*t+d)*4,g=(p*t+f)*4,_=(m*t+d)*4,v=(m*t+f)*4,y=(1-l)*(1-u),b=l*(1-u),x=(1-l)*u,S=l*u;a[o]=e[h]*y+e[g]*b+e[_]*x+e[v]*S,a[o+1]=e[h+1]*y+e[g+1]*b+e[_+1]*x+e[v+1]*S,a[o+2]=e[h+2]*y+e[g+2]*b+e[_+2]*x+e[v+2]*S,a[o+3]=e[h+3]*y+e[g+3]*b+e[_+3]*x+e[v+3]*S}let Ni=I({type:`domainwarp`,name:`DOMAIN WARP`,category:`NOISE`,params:{strength:{label:`STRENGTH`,min:0,max:200,step:1,value:30,tier:3,previewMax:50,unit:`px`,driveable:!0},scale:{label:`SCALE`,min:.1,max:20,step:.1,value:3,tier:3,previewMax:8,driveable:!0,unit:`n`},octaves:{label:`OCTAVES`,min:1,max:8,step:1,value:4,tier:4,previewMax:4,driveable:!0,unit:`n`},layers:{label:`LAYERS`,min:1,max:3,step:1,value:1,tier:5,previewMax:2,driveable:!0,unit:`n`},fieldType:{label:`FIELD TYPE`,type:`select`,value:`perlin`,options:[`perlin`,`simplex`,`fbm`,`ridged`,`turbulence`,`cellular`,`curl`],tier:3},target:{label:`TARGET`,type:`select`,value:`spatial`,options:[`spatial`,`rgb`,`hue`,`saturation`,`lightness`,`alpha`],tier:3},directionalMode:{label:`DIRECTIONAL MODE`,type:`select`,value:`scalar_xy`,options:[`scalar_x`,`scalar_y`,`scalar_xy`,`gradient`,`curl`,`two_noise`],tier:3}},apply(e,t,n,r,i,a,o){let s=new ct(a?.nodeSeed??42);for(let a=0;a<r;a++)for(let c=0;c<n;c++){let l=a*n+c,u=o(`strength`,l),d=o(`scale`,l),f=c,p=a;for(let e=0;e<i.layers;e++){let t=d*2**e,a=u/2**e;f+=s.fbm(f/n*t,p/r*t,i.octaves)*a,p+=s.fbm(f/n*t+5.2,p/r*t+1.3,i.octaves)*a}Mi(e,n,r,f,p,t,l*4)}},wgsl:`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uStrength : f32,
  uScale    : f32,
  uOctaves  : f32,
  uLayers   : f32,
  _pad      : f32,
  _pad2     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn hash2(n: f32) -> f32 { return fract(sin(n) * 43758.5453123); }
fn fade(t: f32) -> f32  { return t*t*t*(t*(t*6.0-15.0)+10.0); }

fn grad2(h: f32, x: f32, y: f32) -> f32 {
  let idx = i32(h * 7.0) % 8;
  let gx  = array<f32,8>(1.,-1., 1.,-1., 0., 0., 1.,-1.);
  let gy  = array<f32,8>(1., 1.,-1., 1., 1.,-1., 0., 0.);
  return gx[idx]*x + gy[idx]*y;
}

fn perlin(px: f32, py: f32) -> f32 {
  let ix = floor(px); let iy = floor(py);
  let fx = px-ix; let fy = py-iy;
  let ux = fade(fx); let uy = fade(fy);
  let n00 = grad2(hash2(ix+iy*57.0),       fx,    fy   );
  let n10 = grad2(hash2(ix+1.0+iy*57.0),   fx-1., fy   );
  let n01 = grad2(hash2(ix+(iy+1.)*57.0),  fx,    fy-1.);
  let n11 = grad2(hash2(ix+1.+(iy+1.)*57.0),fx-1.,fy-1.);
  return mix(mix(n00,n10,ux), mix(n01,n11,ux), uy);
}

fn fbm(px: f32, py: f32, oct: i32) -> f32 {
  var v=0.0; var amp=0.5; var freq=1.0;
  for (var i=0; i<oct; i++) { v+=perlin(px*freq,py*freq)*amp; amp*=0.5; freq*=2.0; }
  return v;
}

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1); let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0+1, 0, w-1);           let y1 = clamp(y0+1, 0, h-1);
  let fx = x-floor(x); let fy = y-floor(y);
  return mix(
    mix(textureLoad(tIn, vec2i(x0,y0), 0), textureLoad(tIn, vec2i(x1,y0), 0), fx),
    mix(textureLoad(tIn, vec2i(x0,y1), 0), textureLoad(tIn, vec2i(x1,y1), 0), fx), fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let oct    = clamp(i32(uni.uOctaves), 1, 8);
  let layers = clamp(i32(uni.uLayers), 1, 3);
  var wx = f32(x); var wy = f32(y);

  for (var l = 0; l < layers; l++) {
    let sc  = uni.uScale * pow(2.0, f32(l));
    let str = uni.uStrength / pow(2.0, f32(l));
    wx += fbm(wx / uni.uWidth * sc,       wy / uni.uHeight * sc,       oct) * str;
    wy += fbm(wx / uni.uWidth * sc + 5.2, wy / uni.uHeight * sc + 1.3, oct) * str;
  }
  textureStore(tOut, vec2i(x, y), bilinear(wx, wy, w, h));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uStrength; uniform float uScale;
uniform float uOctaves; uniform float uLayers;

in  vec2 vUV;
out vec4 fragColor;

float hash2(float n) { return fract(sin(n) * 43758.5453123); }
float fade(float t)  { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float grad2(float h, float x, float y) {
  int idx = int(h * 7.0) % 8;
  float gx[8]; float gy[8];
  gx[0]=1.;gx[1]=-1.;gx[2]=1.;gx[3]=-1.;gx[4]=0.;gx[5]=0.;gx[6]=1.;gx[7]=-1.;
  gy[0]=1.;gy[1]=1.;gy[2]=-1.;gy[3]=1.;gy[4]=1.;gy[5]=-1.;gy[6]=0.;gy[7]=0.;
  return gx[idx]*x + gy[idx]*y;
}

float perlinN(float px, float py) {
  float ix=floor(px); float iy=floor(py);
  float fx=px-ix; float fy=py-iy;
  float ux=fade(fx); float uy=fade(fy);
  float n00=grad2(hash2(ix+iy*57.),fx,fy);
  float n10=grad2(hash2(ix+1.+iy*57.),fx-1.,fy);
  float n01=grad2(hash2(ix+(iy+1.)*57.),fx,fy-1.);
  float n11=grad2(hash2(ix+1.+(iy+1.)*57.),fx-1.,fy-1.);
  return mix(mix(n00,n10,ux),mix(n01,n11,ux),uy);
}

float fbm(float px, float py, int oct) {
  float v=0.;float amp=.5;float freq=1.;
  for(int i=0;i<8;i++){if(i>=oct)break;v+=perlinN(px*freq,py*freq)*amp;amp*=.5;freq*=2.;}
  return v;
}

void main() {
  vec2 res = vec2(textureSize(uTex, 0));
  int  oct = clamp(int(uOctaves), 1, 8);
  int  lyr = clamp(int(uLayers), 1, 3);
  float wx = vUV.x; float wy = vUV.y;
  for (int l = 0; l < 3; l++) {
    if (l >= lyr) break;
    float sc  = uScale * pow(2.0, float(l));
    float str = uStrength / res.x / pow(2.0, float(l));
    wx += fbm(wx * sc, wy * sc,       oct) * str;
    wy += fbm(wx * sc + 5.2, wy * sc + 1.3, oct) * str;
  }
  fragColor = texture(uTex, clamp(vec2(wx, wy), vec2(0.0), vec2(1.0)));
}
`,gpuBindings:ji}),Pi={CORAL:{dA:.16,dB:.08,f:.06,k:.062},MITOSIS:{dA:.2097,dB:.105,f:.0367,k:.0649},STRIPES:{dA:.21,dB:.105,f:.029,k:.057},SPOTS:{dA:.16,dB:.08,f:.035,k:.065},WORMS:{dA:.21,dB:.105,f:.046,k:.063},CUSTOM:{dA:.16,dB:.08,f:.055,k:.062}};function Fi(e){let t=new Uint8Array(256*4);for(let n=0;n<256;n++){let[r,i,a]=e(n/255);t[n*4]=r,t[n*4+1]=i,t[n*4+2]=a,t[n*4+3]=255}return t}let Ii={grey:Fi(e=>[e*255,e*255,e*255]),plasma:Fi(e=>[Math.round(Math.min(255,Math.max(0,(.063+e*(.6+e*(.66-e*.32)))*255))),Math.round(Math.min(255,Math.max(0,(.006+e*(.05+e*(1-e*.5)))*255))),Math.round(Math.min(255,Math.max(0,(.534+e*(.55-e*(1.1-e*.9)))*255)))]),viridis:Fi(e=>[Math.round(Math.min(255,Math.max(0,(.267+e*(-.003+e*(1.77-e*1.05)))*255))),Math.round(Math.min(255,Math.max(0,(.004+e*(1.33-e*(.6-e*.33)))*255))),Math.round(Math.min(255,Math.max(0,(.329+e*(1.41-e*(2.34-e*1.18)))*255)))]),hot:Fi(e=>[Math.round(Math.min(255,e*3*255)),Math.round(Math.min(255,Math.max(0,(e*3-1)*255))),Math.round(Math.min(255,Math.max(0,(e*3-2)*255)))]),cool:Fi(e=>[Math.round(e*255),Math.round((1-e)*255),255])};function Li(e,t,n){if(!n||n===`none`)return null;let r=new Float32Array(t);for(let i=0;i<t;i++){let t=i*4,a=e[t]/255,o=e[t+1]/255,s=e[t+2]/255;switch(n){case`luminance`:r[i]=a*.299+o*.587+s*.114;break;case`red`:r[i]=a;break;case`green`:r[i]=o;break;case`blue`:r[i]=s;break;case`saturation`:{let e=Math.max(a,o,s);r[i]=e>0?(e-Math.min(a,o,s))/e:0;break}default:r[i]=a*.299+o*.587+s*.114}}return r}function Ri(e,t,n,r,i,a,o,s){let c=t*n,l=new Float32Array(c).fill(1),u=new Float32Array(c).fill(0),d=Math.max(1,Math.floor(i/2)),f=t>>1,p=n>>1,m=(e,r,i)=>{if(e<0||e>=t||r<0||r>=n)return;let a=r*t+e;l[a]=.5,u[a]=.25+(o>0?(Math.random()-.5)*o*.2:0)+i*s*.1};switch(r){case`noise`:{let e=Math.max(.001,Math.min(1,a));for(let n=0;n<c;n++)Math.random()<e&&m(n%t,n/t|0,.5);break}case`corners`:{let e=[[0,0],[t-i,0],[0,n-i],[t-i,n-i]];for(let[t,n]of e)for(let e=0;e<i;e++)for(let r=0;r<i;r++)m(t+r,n+e,.5);break}case`random`:{let e=Math.max(1,Math.round(c*Math.max(5e-4,a*.01)));for(let r=0;r<e;r++){let e=Math.random()*t|0,r=Math.random()*n|0;for(let t=-d;t<=d;t++)for(let n=-d;n<=d;n++)m(e+n,r+t,.5)}break}default:for(let r=p-d;r<p+d;r++)for(let i=f-d;i<f+d;i++){if(i<0||i>=t||r<0||r>=n)continue;let a=(r*t+i)*4,o=(e[a]*.299+e[a+1]*.587+e[a+2]*.114)/255;m(i,r,o)}break}return{stateA:l,stateB:u}}function zi(e,t){let n=Math.max(0,Math.min(255,Math.round(e*255)))*4;return[t[n],t[n+1],t[n+2]]}function Bi(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m){let h=e,g=t,_=n,v=r;for(let e=0;e<d;e++){for(let e=0;e<a;e++){let t=e*i,n=e>0?t-i:t,r=e<a-1?t+i:t;for(let e=0;e<i;e++){let a=t+e,d=e>0?a-1:a,y=e<i-1?a+1:a,b=h[d]+h[y]+h[n+e]+h[r+e]-4*h[a],x=g[d]+g[y]+g[n+e]+g[r+e]-4*g[a],S=h[a],C=g[a],w=S*C*C,T=c,E=l;if(f&&m>0){let e=f[a]*m;T=c*(1-e)+f[a]*e}if(p&&m>0){let e=p[a]*m;E=l*(1-e)+p[a]*e}_[a]=Math.max(0,Math.min(1,S+(o*b-w+T*(1-S))*u)),v[a]=Math.max(0,Math.min(1,C+(s*x+w-(E+T)*C)*u))}}let e=h;h=_,_=e;let t=g;g=v,v=t}h!==e&&(e.set(h),t.set(g))}let Vi=I({type:`reactiondiffusion`,name:`REACT-DIFFUSE`,category:`PHYSICS`,forceWorkerPreview:!0,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},preset:{label:`PRESET`,type:`select`,options:[`CORAL`,`MITOSIS`,`STRIPES`,`SPOTS`,`WORMS`,`CUSTOM`],value:`CORAL`,tier:3},seedMode:{label:`SEED MODE`,type:`select`,options:[`image-luminance`,`noise`,`centre`,`corners`,`random`],value:`image-luminance`,tier:3},seedSize:{label:`SEED SIZE`,min:5,max:200,step:1,value:20,tier:4,driveable:!0,unit:`px`},seedDensity:{label:`SEED DENSITY`,min:.001,max:1,step:.001,value:.05,tier:4,driveable:!0,unit:`0–1`},seedRandomness:{label:`SEED RANDOM`,min:0,max:1,step:.01,value:.2,tier:4,driveable:!0,unit:`0–1`},imageSeedStrength:{label:`SEED IMG STR`,min:0,max:1,step:.01,value:.5,tier:4,driveable:!0,unit:`0–1`},f:{label:`FEED RATE`,min:.01,max:.12,step:.001,value:.06,tier:3,driveable:!0,unit:`f`},k:{label:`KILL RATE`,min:.04,max:.08,step:.001,value:.062,tier:3,driveable:!0,unit:`k`},dA:{label:`DIFFUSION A`,min:.05,max:.5,step:.005,value:.16,tier:4,driveable:!0,unit:`dA`},dB:{label:`DIFFUSION B`,min:.01,max:.25,step:.005,value:.08,tier:4,driveable:!0,unit:`dB`},imageCoupling:{label:`IMG COUPLING`,type:`select`,options:[`none`,`feed-rate`,`kill-rate`,`seed-mask`],value:`none`,tier:4},couplingStrength:{label:`COUPLING STR`,min:0,max:1,step:.01,value:.5,tier:4,driveable:!0,unit:`0–1`},timestep:{label:`TIMESTEP`,min:.1,max:2,step:.05,value:1,tier:4,driveable:!0,unit:`dt`},stepsPerFrame:{label:`STEPS/FRAME`,min:1,max:50,step:1,value:10,tier:3,previewMax:2,driveable:!0,unit:`n`},renderChannel:{label:`RENDER CH`,type:`select`,options:[`A`,`B`,`A-B`,`normalized`],value:`B`,tier:3},colormap:{label:`COLORMAP`,type:`select`,options:[`grey`,`plasma`,`viridis`,`hot`,`cool`],value:`grey`,tier:3}},apply(e,t,n,r,i,a,o){let s=n*r,c=(i.preset||`CORAL`).toUpperCase(),l=Pi[c]??Pi.CORAL,u=i.dA!==l.dA||c===`CUSTOM`?i.dA:l.dA,d=i.dB!==l.dB||c===`CUSTOM`?i.dB:l.dB,f=i.f!==l.f||c===`CUSTOM`?i.f:l.f,p=i.k!==l.k||c===`CUSTOM`?i.k:l.k,m=`${i.preset}`,h=`${i.seedMode}|${i.seedSize}|${i.seedDensity}|${i.seedRandomness}`,g=`${n}|${r}`;if(!this._stateA||this._sigPreset!==m||this._sigSeed!==h||this._sigSize!==g){let{stateA:t,stateB:a}=Ri(e,n,r,i.seedMode,i.seedSize,i.seedDensity,i.seedRandomness,i.imageSeedStrength);this._stateA=t,this._stateB=a,this._tmpA=new Float32Array(s),this._tmpB=new Float32Array(s),this._sigPreset=m,this._sigSeed=h,this._sigSize=g}let _=i.stepsPerFrame;_=Y(_,i.frame);let v=null,y=null;if(i.imageCoupling!==`none`&&i.couplingStrength>0){let t=Li(e,s,`luminance`);i.imageCoupling===`feed-rate`?v=t:i.imageCoupling===`kill-rate`&&(y=t)}Bi(this._stateA,this._stateB,this._tmpA,this._tmpB,n,r,u,d,f,p,i.timestep,_,v,y,i.couplingStrength);let b=Ii[i.colormap]??Ii.grey,x=this._stateA,S=this._stateB;switch(i.renderChannel){case`A`:for(let n=0;n<s;n++){let[r,i,a]=zi(x[n],b),o=n*4;t[o]=r,t[o+1]=i,t[o+2]=a,t[o+3]=e[o+3]}break;case`A-B`:for(let n=0;n<s;n++){let[r,i,a]=zi(Math.max(0,Math.min(1,x[n]-S[n])),b),o=n*4;t[o]=r,t[o+1]=i,t[o+2]=a,t[o+3]=e[o+3]}break;case`normalized`:{let n=1/0,r=-1/0;for(let e=0;e<s;e++)S[e]<n&&(n=S[e]),S[e]>r&&(r=S[e]);let i=r-n||1;for(let r=0;r<s;r++){let[a,o,s]=zi((S[r]-n)/i,b),c=r*4;t[c]=a,t[c+1]=o,t[c+2]=s,t[c+3]=e[c+3]}break}default:for(let n=0;n<s;n++){let[r,i,a]=zi(S[n],b),o=n*4;t[o]=r,t[o+1]=i,t[o+2]=a,t[o+3]=e[o+3]}break}},destroy(){this._stateA=null,this._stateB=null,this._tmpA=null,this._tmpB=null,this._sigPreset=null,this._sigSeed=null,this._sigSize=null}}),Hi=Math.PI*2;function Ui(e,t,n,r,i,a,o){let s=r|0,c=i|0,l=r-s,u=i-c,d=s<0?0:s>=t?t-1:s,f=s+1>=t?t-1:s+1<0?0:s+1,p=c<0?0:c>=n?n-1:c,m=c+1>=n?n-1:c+1<0?0:c+1,h=(p*t+d)*4,g=(p*t+f)*4,_=(m*t+d)*4,v=(m*t+f)*4,y=1-l,b=1-u,x=y*b,S=l*b,C=y*u,w=l*u;a[o]=e[h]*x+e[g]*S+e[_]*C+e[v]*w,a[o+1]=e[h+1]*x+e[g+1]*S+e[_+1]*C+e[v+1]*w,a[o+2]=e[h+2]*x+e[g+2]*S+e[_+2]*C+e[v+2]*w,a[o+3]=e[h+3]*x+e[g+3]*S+e[_+3]*C+e[v+3]*w}function Wi(e,t,n,r,i,a,o){let s=Math.max(0,Math.min(t-1,Math.round(r))),c=(Math.max(0,Math.min(n-1,Math.round(i)))*t+s)*4;a[o]=e[c],a[o+1]=e[c+1],a[o+2]=e[c+2],a[o+3]=e[c+3]}function Gi(e,t,n){switch(e){case`SQUARE`:return t<.5?1:-1;case`SAWTOOTH`:return 2*t-1;case`TRIANGLE`:return t<.5?4*t-1:3-4*t;case`NOISE`:return n;default:return Math.sin(Hi*t)}}function Ki(e){let t=Math.sin(e)*43758.5453123;return t-Math.floor(t)}function qi(e,t,n){let r=e*n,i=t*n,a=Math.floor(r),o=Math.floor(i),s=r-a,c=i-o,l=s*s*(3-2*s),u=c*c*(3-2*c),d=Ki(a+o*57),f=Ki(a+1+o*57),p=Ki(a+(o+1)*57),m=Ki(a+1+(o+1)*57);return 2*(d+l*(f-d)+u*(p-d)+l*u*(d-f-p+m))-1}function Ji(e,t,n,r){let i=0,a=.5,o=1;for(let s=0;s<r;s++)i+=a*qi(e,t,n*o),a*=.5,o*=2;return Math.max(-1,Math.min(1,i*1.5))}function Yi(e,t,n,r,i,a,o,s){let c=t*n,l=new Float32Array(c),u=new Float32Array(c),d=t*.5,f=n*.5,p=a*Math.min(t,n);switch(r){case`RIPPLE`:for(let e=0;e<n;e++)for(let n=0;n<t;n++){let r=Math.sqrt((n-d)**2+(e-f)**2),a=i*Math.cos(r/p*Math.PI)*Math.exp(-r/(2*p));l[e*t+n]=u[e*t+n]=a}break;case`FLAT`:break;case`IMAGE`:for(let t=0;t<c;t++){let n=t*4,r=e[n]/255,a=e[n+1]/255,c=e[n+2]/255,d=0;switch(s){case`RED`:d=r;break;case`GREEN`:d=a;break;case`BLUE`:d=c;break;case`SATURATION`:{let e=Math.max(r,a,c);d=e>0?(e-Math.min(r,a,c))/e:0;break}default:d=r*.299+a*.587+c*.114}d>=o&&(l[t]=u[t]=i*(d-o)/Math.max(.001,1-o))}break;case`EDGE`:for(let r=1;r<n-1;r++)for(let n=1;n<t-1;n++){let a=t=>e[t]*.299+e[t+1]*.587+e[t+2]*.114,s=r*t+n,c=a((s-t-1)*4),d=a((s-t)*4),f=a((s-t+1)*4),p=a((s-1)*4),m=a((s+1)*4),h=a((s+t-1)*4),g=a((s+t)*4),_=a((s+t+1)*4),v=(f+2*m+_-c-2*p-h)/1020,y=(h+2*g+_-c-2*d-f)/1020,b=Math.sqrt(v*v+y*y);b>=o&&(l[s]=u[s]=i*Math.min(1,b))}break;default:for(let e=0;e<n;e++)for(let n=0;n<t;n++){let r=n-d,a=e-f,o=i*Math.exp(-(r*r+a*a)/(2*p*p));l[e*t+n]=u[e*t+n]=o}break}return{cur:l,prev:u}}function Xi(e,t,n,r,i,a,o,s,c,l){let u=a*a;r*i;for(let a=1;a<i-1;a++){let i=a*r;for(let a=1;a<r-1;a++){let s=i+a,d=e[s-1]+e[s+1]+e[s-r]+e[s+r]-4*e[s],f=0;if(c>0){let t=e[s-2]+e[s+2]+e[s-2*r]+e[s+2*r]-4*(e[s-1]+e[s+1]+e[s-r]+e[s+r])+12*e[s];f=c*.01*t}let p=e[s]-t[s],m=1-l*.1;n[s]=o*(2*e[s]-t[s]+u*d-f+m*p-p)}}switch(s){case`REFLECT`:for(let e=0;e<r;e++)n[e]=n[r+e],n[(i-1)*r+e]=n[(i-2)*r+e];for(let e=0;e<i;e++)n[e*r]=n[e*r+1],n[e*r+r-1]=n[e*r+r-2];break;case`WRAP`:for(let a=0;a<r;a++){let s=e[(i-1)*r+a]+e[r+a]+(a>0?e[a-1]:e[r-1])+(a<r-1?e[a+1]:e[0])-4*e[a];n[a]=o*(2*e[a]-t[a]+u*s),n[(i-1)*r+a]=n[a]}for(let a=0;a<i;a++){let s=(a>0?e[(a-1)*r]:e[(i-1)*r])+(a<i-1?e[(a+1)*r]:e[0])+e[a*r+r-1]+e[a*r+1]-4*e[a*r];n[a*r]=o*(2*e[a*r]-t[a*r]+u*s),n[a*r+r-1]=n[a*r]}break;case`ABSORB`:for(let e=0;e<r;e++)n[e]=0,n[(i-1)*r+e]=0;for(let e=0;e<i;e++)n[e*r]=0,n[e*r+r-1]=0;break;default:for(let t=0;t<r;t++)n[t]=e[t],n[(i-1)*r+t]=e[(i-1)*r+t];for(let t=0;t<i;t++)n[t*r]=e[t*r],n[t*r+r-1]=e[t*r+r-1];break}return{cur:n,prev:e}}function Zi(e,t,n,r,i,a,o,s,c,l){let u=l*Math.min(t,n),d=u*u,f=Hi*o,p=Qi(r,i,t,n);for(let r=0;r<p.length;r++){let[i,o]=p[r],l=s+r*(Hi/Math.max(1,p.length)),m=c*Math.sin(f*a+l);if(Math.abs(m)<1e-6)continue;let h=Math.max(0,i-u|0),g=Math.min(t-1,i+u|0),_=Math.max(0,o-u|0),v=Math.min(n-1,o+u|0);for(let n=_;n<=v;n++)for(let r=h;r<=g;r++){let a=(r-i)**2+(n-o)**2;a>d||(e[n*t+r]+=m*Math.exp(-a/d))}}}function Qi(e,t,n,r){let i=[],a=Math.max(1,e|0);switch(t){case`GRID`:{let e=Math.ceil(Math.sqrt(a)),t=Math.ceil(a/e);for(let o=0;o<t&&i.length<a;o++)for(let s=0;s<e&&i.length<a;s++)i.push([(s+.5)/e*n,(o+.5)/t*r]);break}case`RADIAL`:for(let e=0;e<a;e++){let t=e/a*Hi;i.push([n*.5+Math.cos(t)*n*.3,r*.5+Math.sin(t)*r*.3])}break;case`RANDOM`:for(let e=0;e<a;e++)i.push([Ki(e*17.3+1.1)*n|0,Ki(e*31.7+5.3)*r|0]);break;default:for(let e=0;e<a;e++)i.push([(e+1)/(a+1)*n,r*.5]);break}return i}function $i(e,t,n,r,i){let a=n*r,o=new Float32Array(a);switch(i){case`VELOCITY`:for(let n=0;n<a;n++)o[n]=e[n]-t[n];break;case`GRADIENT`:for(let t=1;t<r-1;t++)for(let r=1;r<n-1;r++){let i=t*n+r,a=(e[i+1]-e[i-1])*.5,s=(e[i+n]-e[i-n])*.5;o[i]=Math.sqrt(a*a+s*s)}break;case`INTERFERENCE`:for(let n=0;n<a;n++){let r=Math.abs(e[n]-t[n]);o[n]=(1-Math.abs(e[n]))*r}break;case`NODE_MASK`:for(let t=0;t<a;t++)o[t]=+(Math.abs(e[t])<.05);break;default:for(let t=0;t<a;t++)o[t]=e[t];break}return o}function ea(e,t,n,r,i,a,o,s,c,l,u,d,f){let p=n*r,m=1;if(f){let e=1/0,t=-1/0;for(let n=0;n<p;n++)i[n]<e&&(e=i[n]),i[n]>t&&(t=i[n]);let n=t-e;if(n>1e-6){m=2/n;for(let t=0;t<p;t++)i[t]=(i[t]-e)*m-1}}let h=Math.cos(s),g=Math.sin(s),_=c===`NEAREST`?Wi:Ui;for(let s=0;s<r;s++)for(let c=0;c<n;c++){let f=s*n+c,p=f*4,m=i[f]*u*d*a;if(l===`FIELD`){let n=Math.max(0,Math.min(255,(i[f]*.5+.5)*u*d*255));t[p]=t[p+1]=t[p+2]=n,t[p+3]=e[p+3];continue}let v=0,y=0;switch(o){case`X`:v=m;break;case`Y`:y=m;break;case`RADIAL`:{let e=n*.5,t=r*.5,i=(c-e)/(n*.5+1),a=(s-t)/(r*.5+1),o=Math.sqrt(i*i+a*a)||1;v=m*i/o,y=m*a/o;break}case`ANGLE`:{let e=n*.5,t=r*.5,i=c-e,a=s-t,o=Math.sqrt(i*i+a*a)||1;v=-m*a/o,y=m*i/o;break}default:v=m*h,y=m*g;break}if(_(e,n,r,c+v,s+y,t,p),l===`COMBINED`){let e=Math.max(0,Math.min(1,i[f]*.5+.5))*u*d;t[p]=Math.max(0,Math.min(255,t[p]*(1-e*.3)+e*.3*255)),t[p+1]=Math.max(0,Math.min(255,t[p+1]*(1-e*.3))),t[p+2]=Math.max(0,Math.min(255,t[p+2]*(1-e*.3)+e*.3*255))}}}let ta=I({type:`wavedistortion`,name:`WAVE DISTORT`,category:`PHYSICS`,forceWorkerPreview:!0,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},waveType:{label:`WAVE TYPE`,type:`select`,options:[`SINE`,`SQUARE`,`SAWTOOTH`,`TRIANGLE`,`NOISE`],value:`SINE`,tier:3},amplitude:{label:`AMPLITUDE`,min:0,max:100,step:.5,value:10,tier:3,driveable:!0,unit:`px`},wavelength:{label:`WAVELENGTH`,min:1,max:500,step:1,value:80,tier:3,driveable:!0,unit:`px`},speed:{label:`SPEED`,min:0,max:2,step:.01,value:.3,tier:3,driveable:!0,unit:`px/s`},direction:{label:`DIRECTION`,min:0,max:360,step:1,value:0,tier:3,driveable:!0,unit:`°`},phaseOffset:{label:`PHASE OFFSET`,min:0,max:1,step:.01,value:0,tier:4,driveable:!0,unit:`0-1`},axis:{label:`AXIS`,type:`select`,options:[`BOTH`,`X`,`Y`,`RADIAL`,`ANGLE`],value:`BOTH`,tier:3},octaves:{label:`OCTAVES`,min:1,max:8,step:1,value:3,tier:4,previewMax:3,driveable:!0,unit:`n`},noiseScale:{label:`NOISE SCALE`,min:.001,max:.1,step:.001,value:.01,tier:4,driveable:!0,unit:`0-1`},initType:{label:`INIT MODE`,type:`select`,options:[`GAUSSIAN`,`RIPPLE`,`FLAT`,`IMAGE`,`EDGE`],value:`GAUSSIAN`,tier:4},initAmplitude:{label:`INIT AMP`,min:0,max:1,step:.01,value:1,tier:4,driveable:!0,unit:`0-1`},initRadius:{label:`INIT RADIUS`,min:.01,max:.5,step:.01,value:.1,tier:4,driveable:!0,unit:`0-1`},seedSource:{label:`SEED SOURCE`,type:`select`,options:[`LUMINANCE`,`RED`,`GREEN`,`BLUE`,`SATURATION`,`EDGE`],value:`LUMINANCE`,tier:4},seedThreshold:{label:`SEED THRESH`,min:0,max:1,step:.01,value:.3,tier:4,driveable:!0,unit:`0-1`},simSpeed:{label:`SIM SPEED`,min:.01,max:.707,step:.01,value:.5,tier:4,driveable:!0,unit:`c`},damping:{label:`DAMPING`,min:.9,max:1,step:.001,value:.995,tier:3,driveable:!0,unit:`0-1`},stepsPerFrame:{label:`STEPS/FRAME`,min:1,max:100,step:1,value:20,tier:3,previewMax:5,driveable:!0,unit:`n`},warmupSteps:{label:`WARMUP STEPS`,min:0,max:500,step:10,value:0,tier:4,driveable:!0,unit:`n`},dispersion:{label:`DISPERSION`,min:0,max:1,step:.01,value:0,tier:4,driveable:!0,unit:`0-1`},viscosity:{label:`VISCOSITY`,min:0,max:1,step:.01,value:0,tier:4,driveable:!0,unit:`0-1`},boundaryMode:{label:`BOUNDARY`,type:`select`,options:[`CLAMP`,`REFLECT`,`WRAP`,`ABSORB`],value:`CLAMP`,tier:4},retainState:{label:`RETAIN STATE`,type:`toggle`,value:!0,tier:3},emitterCount:{label:`EMITTER COUNT`,min:0,max:8,step:1,value:0,tier:3,driveable:!0,unit:`n`},emitterMode:{label:`EMITTER MODE`,type:`select`,options:[`MANUAL`,`GRID`,`RADIAL`,`RANDOM`],value:`MANUAL`,tier:4},emitterFreq:{label:`EMITTER FREQ`,min:0,max:1,step:.001,value:.05,tier:4,driveable:!0,unit:`Hz`},emitterPhase:{label:`EMITTER PHASE`,min:0,max:1,step:.01,value:0,tier:4,driveable:!0,unit:`0-1`},emitterAmp:{label:`EMITTER AMP`,min:0,max:1,step:.01,value:.5,tier:4,driveable:!0,unit:`0-1`},emitterRadius:{label:`EMITTER RAD`,min:.01,max:.5,step:.01,value:.05,tier:4,driveable:!0,unit:`0-1`},forcingStrength:{label:`FORCING STR`,min:0,max:1,step:.01,value:0,tier:4,driveable:!0,unit:`0-1`},forcingInterval:{label:`FORCING INT`,min:1,max:60,step:1,value:1,tier:4,driveable:!0,unit:`n`},outputMode:{label:`OUTPUT MODE`,type:`select`,options:[`DISPLACEMENT`,`FIELD`,`COMBINED`],value:`DISPLACEMENT`,tier:3},fieldSource:{label:`FIELD SOURCE`,type:`select`,options:[`HEIGHT`,`VELOCITY`,`GRADIENT`,`INTERFERENCE`,`NODE_MASK`],value:`HEIGHT`,tier:4},normaliseOutput:{label:`NORMALISE`,type:`toggle`,value:!1,tier:4},contrast:{label:`CONTRAST`,min:.1,max:5,step:.05,value:1,tier:4,driveable:!0,unit:`×`},gain:{label:`GAIN`,min:0,max:2,step:.01,value:1,tier:4,driveable:!0,unit:`×`},interpolation:{label:`INTERPOLATION`,type:`select`,options:[`BILINEAR`,`NEAREST`],value:`BILINEAR`,tier:4},stiffness:{label:`STIFFNESS`,min:0,max:1,step:.01,value:0,tier:4,driveable:!0,unit:`0-1`},decay:{label:`DECAY`,min:0,max:1,step:.01,value:0,tier:4,driveable:!0,unit:`0-1`}},apply(e,t,n,r,i,a,o){let s=n*r,c=i.frame,l=Math.min(.707,o(`simSpeed`,0)),u=o(`damping`,0),d=o(`dispersion`,0),f=o(`viscosity`,0),p=`${n}|${r}`,m=`${i.initType}|${i.initAmplitude}|${i.initRadius}|${i.seedSource}|${i.seedThreshold}`,h=`${l}|${i.boundaryMode}`;if(!this._cur||!i.retainState||this._sigSize!==p||this._sigInit!==m){let{cur:t,prev:a}=Yi(e,n,r,i.initType,i.initAmplitude,i.initRadius,i.seedThreshold,i.seedSource);if(this._cur=t,this._prev=a,this._tmp=new Float32Array(s),this._frame=0,this._sigSize=p,this._sigInit=m,this._sigSim=h,i.warmupSteps>0)for(let e=0;e<i.warmupSteps;e++){let{cur:e,prev:t}=Xi(this._cur,this._prev,this._tmp,n,r,l,u,i.boundaryMode,d,f);this._tmp=this._prev,this._cur=e,this._prev=t}}i.emitterCount>0&&Zi(this._cur,n,r,i.emitterCount,i.emitterMode,c,o(`emitterFreq`,0),o(`emitterPhase`,0)*Hi,o(`emitterAmp`,0),o(`emitterRadius`,0));let g=o(`forcingStrength`,0);if(g>0&&c%Math.max(1,i.forcingInterval|0)===0)for(let t=0;t<s;t++){let n=t*4,r=(e[n]*.299+e[n+1]*.587+e[n+2]*.114)/255;this._cur[t]+=g*(r-.5)*2}let _=i.stepsPerFrame;_=Y(_,c);for(let e=0;e<_;e++){if(i.stiffness>0)for(let e=0;e<s;e++)this._cur[e]-=i.stiffness*.01*this._cur[e];if(i.decay>0)for(let e=0;e<s;e++)this._cur[e]*=1-i.decay*.01;let{cur:e,prev:t}=Xi(this._cur,this._prev,this._tmp,n,r,l,u,i.boundaryMode,d,f);this._tmp=this._prev,this._cur=e,this._prev=t}let v=$i(this._cur,this._prev,n,r,i.fieldSource),y=i.direction*Math.PI/180,b=Math.cos(y),x=Math.sin(y),S=o(`speed`,0);if(S>0||i.waveType!==`SINE`){let e=Math.max(1,i.wavelength),t=S*c/60;for(let a=0;a<r;a++)for(let r=0;r<n;r++){let s=a*n+r,c=(r*b+a*x)/e-t+o(`phaseOffset`,s),l=c-Math.floor(c),u=i.waveType===`NOISE`?Ji(r,a,o(`noiseScale`,s),i.octaves|0):0,d=Gi(i.waveType,l,u);v[s]=v[s]*(1-Math.min(1,S))+d*Math.min(1,S)}}let C=i.outputMode===`DISPLACEMENT`?`DISPLACEMENT`:i.outputMode===`FIELD`?`FIELD`:`COMBINED`;ea(e,t,n,r,v,o(`amplitude`,0),i.axis,y,i.interpolation,C,o(`contrast`,0),o(`gain`,0),i.normaliseOutput)},destroy(){this._cur=null,this._prev=null,this._tmp=null,this._sigSize=null,this._sigInit=null,this._sigSim=null,this._frame=0}}),na={LIFE:{birth:[3],survival:[2,3]},HIGHLIFE:{birth:[3,6],survival:[2,3]},SEEDS:{birth:[2],survival:[]},DAYNIGHT:{birth:[3,6,7,8],survival:[3,4,6,7,8]},MAZE:{birth:[3],survival:[1,2,3,4,5]},ANNEAL:{birth:[4,6,7,8],survival:[3,5,6,7,8]}};function ra(e){let t=(e||``).toUpperCase(),n=t.match(/B([0-8]*)/),r=t.match(/S([0-8]*)/);return{birth:n?[...n[1]].map(Number):[],survival:r?[...r[1]].map(Number):[]}}function ia(e,t){return e===`CUSTOM`?ra(t):na[e]??na.LIFE}function Z(e,t,n){return n===`WRAP`?(e+t)%t:n===`CLAMP`?e<0||e>=t?-1:e:n===`REFLECT`?e<0?-e-1:e>=t?2*t-e-1:e:e<0||e>=t?-1:e}function aa(e,t,n,r,i,a){let o=0;for(let s=-1;s<=1;s++)for(let c=-1;c<=1;c++){if(c===0&&s===0)continue;let l=Z(r+c,t,a),u=Z(i+s,n,a);l>=0&&u>=0&&e[u*t+l]>0&&o++}return o}function oa(e,t,n,r,i,a){let o=0;for(let[s,c]of[[-1,0],[1,0],[0,-1],[0,1]]){let l=Z(r+s,t,a),u=Z(i+c,n,a);l>=0&&u>=0&&e[u*t+l]>0&&o++}return o}function sa(e,t,n,r,i,a){let o=t*n,s=new Uint8Array(o),c=r.seedMode;if(c===`RANDOM`){let e=r.initDensity;for(let t=0;t<o;t++)s[t]=+(i.next()<e)}else if(c===`NOISE`){let e=r.initDensity;for(let r=0;r<n;r++)for(let i=0;i<t;i++){let o=(a.noise2D(i/t*4,r/n*4)+1)*.5;s[r*t+i]=+(o>1-e)}}else if(c===`EDGE`)for(let i=0;i<n;i++)for(let a=0;a<t;a++){let o=t=>e[t*4]*.299+e[t*4+1]*.587+e[t*4+2]*.114,c=Math.min(t-1,a+1),l=Math.max(0,a-1),u=Math.min(n-1,i+1),d=Math.max(0,i-1),f=o(i*t+c)-o(i*t+l),p=o(u*t+a)-o(d*t+a);s[i*t+a]=+(Math.sqrt(f*f+p*p)>r.seedThreshold)}else{let t=r.seedThreshold,n=r.initSoftness;for(let r=0;r<o;r++){let a=r*4,o=e[a]*.299+e[a+1]*.587+e[a+2]*.114;if(n<1)s[r]=+(o>t);else{let e=Math.max(0,Math.min(1,.5+(o-t)/n));s[r]=+(i.next()<e)}}}if(r.invertInit)for(let e=0;e<o;e++)s[e]=+!s[e];return s}function ca(e,t,n,r,i,a,o,s,c,l){let{birth:u,survival:d}=s,f=new Set(u),p=new Set(d),m=c===`VONNEUMANN`?oa:aa,h=!1;for(let s=0;s<o;s++)for(let c=0;c<a;c++){let u=s*a+c,d=e[u]>0,g=m(e,a,o,c,s,l),_=d?+!!p.has(g):+!!f.has(g);t[u]=_,n[u]=_?d?n[u]+1:1:0,r[u]=!d&&_?255:0,i[u]=d&&!_?255:0,_&&(h=!0)}return h}function la(e,t,n,r,i,a,o){for(let s=0;s<r;s++)for(let c=0;c<n;c++){let l=s*n+c,u=e[l],d=(u+1)%i,f=!1;if(a===`VONNEUMANN`)for(let[t,i]of[[-1,0],[1,0],[0,-1],[0,1]]){let a=Z(c+t,n,o),l=Z(s+i,r,o);if(a>=0&&l>=0&&e[l*n+a]===d){f=!0;break}}else outer:for(let t=-1;t<=1;t++)for(let i=-1;i<=1;i++){if(i===0&&t===0)continue;let a=Z(c+i,n,o),l=Z(s+t,r,o);if(a>=0&&l>=0&&e[l*n+a]===d){f=!0;break outer}}t[l]=f?d:u}}function ua(e,t,n,r,i){let{grid:a,next:o,age:s,birthMap:c,deathMap:l}=e,u=r.rule===`CYCLIC`,d=r.rule===`BRIANS BRAIN`,f=u||d?null:ia(r.rule,r.ruleString),p=r.neighbourhood,m=r.boundaryMode,h=r.cyclicStates|0||4;for(let e=0;e<i;e++){if(u)la(a,o,t,n,h,p,m);else if(d)_stepBriansBrain(a,o,c,l,t,n,p,m);else if(!ca(a,o,s,c,l,t,n,f,p,m)&&r.autoStop)break;a.set(o)}}function da(e,t,n){let r=t*n,i=new Float32Array(r).fill(r),a=[];for(let t=0;t<r;t++)e[t]>0&&(i[t]=0,a.push(t));let o=[-1,1,-t,t],s=0;for(;s<a.length;){let e=a[s++],n=e%t;e/t|0;let c=i[e]+1;for(let s of o){let o=e+s;if(o<0||o>=r)continue;let l=o%t;Math.abs(l-n)>1||i[o]>c&&(i[o]=c,a.push(o))}}return i}function fa(e,t,n,r,i,a,o){let s=i*a;if(o===`AGE`){let e=new Float32Array(s);for(let n=0;n<s;n++)e[n]=t[n];return e}if(o===`BIRTH`){let e=new Float32Array(s);for(let t=0;t<s;t++)e[t]=n[t];return e}if(o===`DEATH`){let e=new Float32Array(s);for(let t=0;t<s;t++)e[t]=r[t];return e}if(o===`CHANGE`){let e=new Float32Array(s);for(let t=0;t<s;t++)e[t]=n[t]||r[t]?255:0;return e}if(o===`NEIGHBOURS`){let t=new Float32Array(s);for(let n=0;n<a;n++)for(let r=0;r<i;r++)t[n*i+r]=aa(e,i,a,r,n,`WRAP`)*(255/8);return t}if(o===`DISTANCE`)return da(e,i,a);let c=new Float32Array(s);for(let t=0;t<s;t++)c[t]=e[t]>0?255:0;return c}function pa(e){let t=(e||`#ffffff`).replace(`#`,``);return{r:parseInt(t.slice(0,2),16)||0,g:parseInt(t.slice(2,4),16)||0,b:parseInt(t.slice(4,6),16)||0}}function ma(e,t,n,r,i,a,o){let s=n*r,c=pa(a.minColour),l=pa(a.maxColour),u=a.couplingMode,d=1/0,f=-1/0;if(a.normaliseOutput){for(let e=0;e<s;e++)i[e]<d&&(d=i[e]),i[e]>f&&(f=i[e]);f<=d&&(f=d+1)}else d=0,f=255;let p=a.outputContrast,m=a.outputGain;for(let n=0;n<s;n++){let r=n*4,a=o(`blendAmt`,n),s=1-a,h=(i[n]-d)/(f-d),g=Math.max(0,Math.min(1,(h*m-.5)*p+.5)),_=Math.round(c.r+g*(l.r-c.r)),v=Math.round(c.g+g*(l.g-c.g)),y=Math.round(c.b+g*(l.b-c.b));if(u===`REPLACE`)t[r]=_,t[r+1]=v,t[r+2]=y,t[r+3]=e[r+3];else if(u===`MASK`)t[r]=Math.round(e[r]*g),t[r+1]=Math.round(e[r+1]*g),t[r+2]=Math.round(e[r+2]*g),t[r+3]=e[r+3];else if(u===`INVERT-BY-STATE`){let a=+(i[n]>d+(f-d)*.5);t[r]=a?255-e[r]:e[r],t[r+1]=a?255-e[r+1]:e[r+1],t[r+2]=a?255-e[r+2]:e[r+2],t[r+3]=e[r+3]}else if(u===`SATURATE-BY-STATE`){let a=+(i[n]>d+(f-d)*.5),o=Math.round(e[r]*.299+e[r+1]*.587+e[r+2]*.114);t[r]=a?e[r]:o,t[r+1]=a?e[r+1]:o,t[r+2]=a?e[r+2]:o,t[r+3]=e[r+3]}else t[r]=Math.round(e[r]*s+_*a),t[r+1]=Math.round(e[r+1]*s+v*a),t[r+2]=Math.round(e[r+2]*s+y*a),t[r+3]=e[r+3]}}let ha=I({type:`cellularautomata`,name:`CELL AUTOMATA`,category:`PHYSICS`,forceWorkerPreview:!0,params:{seedMode:{label:`SEED MODE`,type:`select`,options:[`IMAGE`,`RANDOM`,`NOISE`,`EDGE`],value:`IMAGE`,tier:3},seedThreshold:{label:`SEED THRESH`,min:0,max:255,step:1,value:128,tier:3,driveable:!0,unit:`lvl`},initDensity:{label:`DENSITY`,min:0,max:1,step:.01,value:.3,tier:4,driveable:!0,unit:`0–1`},initSoftness:{label:`SOFTNESS`,min:0,max:128,step:1,value:0,tier:4,driveable:!0,unit:`lvl`},invertInit:{label:`INVERT SEED`,type:`toggle`,value:!1,tier:5},seed:{label:`SEED`,min:0,max:9999,step:1,value:0,tier:4,driveable:!0,unit:`n`},rule:{label:`RULE`,type:`select`,options:[`LIFE`,`HIGHLIFE`,`SEEDS`,`DAYNIGHT`,`MAZE`,`ANNEAL`,`BRIANS BRAIN`,`CYCLIC`,`CUSTOM`],value:`LIFE`,tier:3},ruleString:{label:`B/S RULE`,type:`text`,value:`B3/S23`,tier:4},neighbourhood:{label:`NEIGHBOURS`,type:`select`,options:[`MOORE`,`VONNEUMANN`],value:`MOORE`,tier:4},boundaryMode:{label:`BOUNDARY`,type:`select`,options:[`WRAP`,`CLAMP`,`REFLECT`,`ABSORB`],value:`WRAP`,tier:4},cyclicStates:{label:`CYCLIC STATES`,min:2,max:16,step:1,value:4,tier:4,driveable:!0,unit:`n`},frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},warmupSteps:{label:`WARMUP`,min:0,max:500,step:1,value:0,tier:4,driveable:!0,unit:`n`},stepsPerFrame:{label:`STEPS/FRAME`,min:1,max:50,step:1,value:1,tier:3,previewMax:2,driveable:!0,unit:`n`},maxSteps:{label:`MAX STEPS`,min:1,max:500,step:1,value:50,tier:4,previewMax:20,driveable:!0,unit:`n`},retainState:{label:`RETAIN STATE`,type:`toggle`,value:!1,tier:3},freeze:{label:`FREEZE`,type:`toggle`,value:!1,tier:4},autoStop:{label:`AUTO-STOP`,type:`toggle`,value:!1,tier:5},outputMode:{label:`OUTPUT MODE`,type:`select`,options:[`ALIVE`,`AGE`,`BIRTH`,`DEATH`,`CHANGE`,`NEIGHBOURS`,`DISTANCE`],value:`ALIVE`,tier:3},normaliseOutput:{label:`NORMALISE`,type:`toggle`,value:!0,tier:4},outputContrast:{label:`CONTRAST`,min:.1,max:5,step:.1,value:1,tier:4,driveable:!0,unit:`0–1`},outputGain:{label:`GAIN`,min:0,max:4,step:.1,value:1,tier:4,driveable:!0,unit:`0–1`},minColour:{label:`MIN COLOUR`,type:`colour`,value:`#000000`,tier:4},maxColour:{label:`MAX COLOUR`,type:`colour`,value:`#ffffff`,tier:4},couplingMode:{label:`COUPLING`,type:`select`,options:[`OVERLAY`,`MASK`,`REPLACE`,`INVERT-BY-STATE`,`SATURATE-BY-STATE`],value:`OVERLAY`,tier:3},blendAmt:{label:`BLEND`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`}},apply(e,t,i,a,o,s,c){let l=i*a,u=r(o.seed|0,s?.nodeIndex??0,s?.nodeId??0),d=o.rule===`CYCLIC`,f=o.rule===`BRIANS BRAIN`,p=o.cyclicStates|0||4,m=`${o.seed}|${o.rule}|${o.ruleString}|${o.seedMode}|${o.seedThreshold}|${o.initDensity}|${o.initSoftness}|${o.invertInit}|${i}|${a}`;if(!this._state||!o.retainState||this._state.key!==m){let t=new n(u),r=new ct(u),s;if(d){s=new Uint8Array(l);for(let e=0;e<l;e++)s[e]=t.nextInt(0,p)}else if(f){let n=sa(e,i,a,o,t,r);s=new Uint8Array(l);for(let e=0;e<l;e++)s[e]=+!!n[e]}else s=sa(e,i,a,o,t,r);let c={key:m,grid:s,next:new Uint8Array(l),age:new Int32Array(l),birthMap:new Uint8Array(l),deathMap:new Uint8Array(l),frozen:!1},h=o.warmupSteps|0;h>0&&ua(c,i,a,o,h),this._state=c}let h=this._state;if(o.freeze||h.frozen){ma(e,t,i,a,fa(h.grid,h.age,h.birthMap,h.deathMap,i,a,o.outputMode),o,c);return}if(o.retainState){let e=o.stepsPerFrame|0;if(e=Y(e,o.frame),ua(h,i,a,o,e),o.autoStop&&!d&&!f){let e=0;for(let t=0;t<l;t++)h.grid[t]>0&&e++;e===0&&(h.frozen=!0)}}else{let e=o.maxSteps|0;e=Y(e,o.frame),ua(h,i,a,o,e)}ma(e,t,i,a,fa(h.grid,h.age,h.birthMap,h.deathMap,i,a,o.outputMode),o,c)},destroy(){this._state=null}});function ga(e,t,n){let r=e*374761393+t*668265263+(n|0)*2246822519>>>0;return r=(r^r>>>13)>>>0,r=r*1274126177>>>0,(r&268435455)/268435455}function _a(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=e-r,o=t-i,s=n|0,c=ga(r,i,s),l=ga(r+1,i,s),u=ga(r,i+1,s),d=ga(r+1,i+1,s),f=Ei(0,1,a),p=Ei(0,1,o),m=c+f*(l-c);return m+p*(u+f*(d-u)-m)}function va(e,t,n){let r=e*374761393+t*668265263+(n|0)*2246822519>>>0,i=(r^r>>>13)>>>0,a=(r&268435455)/268435456%1,o=(i&268435455)/268435456%1;return{px:e+a,py:t+o}}function ya(e,t,n,r=`euclidean`){let i=Math.floor(e),a=Math.floor(t),o=1/0,s=1/0,c=(e,t)=>r===`manhattan`?Math.abs(e)+Math.abs(t):r===`chebyshev`?Math.max(Math.abs(e),Math.abs(t)):Math.hypot(e,t);for(let r=-1;r<=1;r++)for(let l=-1;l<=1;l++){let u=va(i+l,a+r,n|0),d=c(e-u.px,t-u.py);d<o?(s=o,o=d):d<s&&(s=d)}return Number.isFinite(s)||(s=o),{f1:o,f2:s}}function ba(e,t,n,r=1){let i=Math.floor(e)*73856093^Math.floor(t)*19349663^(n|0)*83492791;i=(i^i>>>13)>>>0,i=i*1103515245+12345>>>0;let a=((i&16777215)+1)/16777216,o=(i*1664525+1013904223>>>0&16777215)/16777216;return Math.sqrt(-2*Math.log(Math.max(a,1e-12)))*Math.cos(2*Math.PI*o)*r}function xa(e,t,n,r=4,i=.5,a=2,o=null){let s=n|0,c=o?(e,t)=>o(e,t):(e,t)=>Di(e,t,s),l=0,u=1,d=1,f=0,p=Math.max(1,Math.min(32,r|0));for(let n=0;n<p;n++)l+=u*Math.abs(c(e*d,t*d)),f+=u,u*=i,d*=a;return f>0?l/f:0}function Sa(e,t,n,r=4,i=.5,a=2,o=null){let s=n|0,c=o?(e,t)=>o(e,t):(e,t)=>Di(e,t,s),l=0,u=1,d=1,f=0,p=Math.max(1,Math.min(32,r|0));for(let n=0;n<p;n++){let n=c(e*d,t*d);l+=u*(1-Math.abs(n)),f+=u,u*=i,d*=a}return f>0?l/f:l}function Ca(e){let t=e>>>0||1;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Q(e,t,n){let r=(e*73856093^t*19349663^(n|0)*83492791)>>>0;return r=(r^r>>>13)>>>0,r=r*1103515245+12345>>>0,(r>>>0)/4294967296}function wa(e,t,n,r,i,a,o,s){let c=t*i*8,l=n*i*8;switch(e){case`WHITE`:return Q(Math.floor(t*i*256),Math.floor(n*i*256),r)*2-1;case`GAUSSIAN`:return ba(Math.floor(t*i*256),Math.floor(n*i*256),r,.5);case`VALUE`:return _a(c,l,r)*2-1;case`PERLIN`:return Di(c,l,r);case`SIMPLEX`:return wi(c,l);case`WORLEY`:return ya(c,l,r).f1*2-1;case`FBM`:return Ti(c,l,{octaves:a,persistence:s,lacunarity:o,noiseFn:wi});case`RIDGED`:return Sa(c,l,r,a,s,o)*2-1;case`TURBULENCE`:return xa(c,l,r,a,s,o)*2-1;default:return 0}}function Ta(e,t,n,r,i){let{enabled:a,algorithm:o,seed:s,scale:c,amplitude:l,offsetX:u,offsetY:d,octaves:f,lacunarity:p,persistence:m,temporalPhase:h,temporalSpeed:g,threshold:_,quantisation:v}=n;if(!a||l<=0)return null;let y=r+(s|0)>>>0,b=(h+i*g)*.01,x=new Float32Array(e*t);for(let n=0;n<t;n++)for(let r=0;r<e;r++){let i=wa(o,(r+u*e)/e+b,(n+d*t)/t,y,c,f,p,m);_>0&&(i=Math.abs(i)>_?i:0),v>1&&(i=Math.round(i*v)/v),x[n*e+r]=i*l}return x}function Ea(e,t,n,r,i,a,o){let s=Math.max(0,1-e*2),c=Math.max(0,e*2-1),l=1-s-c,u=s*t+l*n+c*r,d=e<.05?1-i*(1-e/.05):e>.95?1-a*((e-.95)/.05):1,f=1-o*Math.abs(e-.5)*2;return u*d*Math.max(0,f)}function Da(e,t,n){let r=new Float32Array(t*n);for(let i=1;i<n-1;i++)for(let n=1;n<t-1;n++){let a=t=>(e[t]*.299+e[t+1]*.587+e[t+2]*.114)/255,o=a(((i-1)*t+(n-1))*4),s=a(((i-1)*t+n)*4),c=a(((i-1)*t+(n+1))*4),l=a((i*t+(n-1))*4),u=a((i*t+(n+1))*4),d=a(((i+1)*t+(n-1))*4),f=a(((i+1)*t+n)*4),p=a(((i+1)*t+(n+1))*4),m=-o+c-2*l+2*u-d+p,h=-o-2*s-c+d+2*f+p;r[i*t+n]=Math.min(1,Math.sqrt(m*m+h*h))}return r}function Oa(e,t,n){let r=new Float32Array(t*n);for(let i=1;i<n-1;i++)for(let n=1;n<t-1;n++){let a=0,o=0,s=0;for(let r=-1;r<=1;r++)for(let c=-1;c<=1;c++){let l=((i+r)*t+(n+c))*4,u=(e[l]*.299+e[l+1]*.587+e[l+2]*.114)/255;a+=u,o+=u*u,s++}let c=a/s;r[i*t+n]=Math.min(1,Math.sqrt(Math.max(0,o/s-c*c))*8)}return r}function ka(e,t,n,r,i){let a=t|0;switch(n){case`LOCKED`:return e+a>>>0;case`BAKED`:return e+a+(r|0)*131>>>0;case`DRIFT`:return e+a+Math.floor(r*i)*9973>>>0;case`SCROLL`:return e+a+(r|0)*7919>>>0;case`FLICKER`:return e+a+(Ca((r|0)^57005)()*16777215|0)>>>0;default:return e+a+(r|0)*7919>>>0}}let Aa=I({type:`filmgrain`,name:`FILM GRAIN`,category:`TEXTURE`,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},amount:{label:`AMOUNT`,min:0,max:100,step:.5,value:25,tier:3,driveable:!0,unit:`%`},size:{label:`SIZE`,min:1,max:8,step:1,value:1,tier:4,driveable:!0,unit:`px`},operatingMode:{label:`OPERATING MODE`,type:`select`,options:[`FINISH`,`PERTURBATION`,`FIELD OUTPUT`,`HYBRID`],value:`FINISH`,tier:3},channelMode:{label:`CHANNEL MODE`,type:`select`,options:[`MONO`,`RGB LINKED`,`RGB DECORRELATED`,`LUMA-CHROMA SPLIT`],value:`MONO`,tier:3},renderMode:{label:`RENDER MODE`,type:`select`,options:[`MONOCHROME`,`PARTICULATE`,`SOFT CLOUDED`,`THRESHOLDED SPECK`,`DIRECTIONAL`,`SENSOR NOISE`],value:`MONOCHROME`,tier:4},lumInfluence:{label:`LUM INFLUENCE`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0-1`},shadowWeight:{label:`SHADOW WT`,min:0,max:2,step:.01,value:1,tier:4,driveable:!0,unit:`0-2`},midtoneWeight:{label:`MIDTONE WT`,min:0,max:2,step:.01,value:1,tier:4,driveable:!0,unit:`0-2`},highlightWeight:{label:`HIGHLIGHT WT`,min:0,max:2,step:.01,value:.7,tier:4,driveable:!0,unit:`0-2`},blackProtection:{label:`BLACK PROT`,min:0,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},whiteProtection:{label:`WHITE PROT`,min:0,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},flatAreaBoost:{label:`FLAT BOOST`,min:0,max:2,step:.01,value:0,tier:5,driveable:!0,unit:`0-2`},localContrastInf:{label:`LOCAL CONTRAST`,min:0,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},edgeInfluence:{label:`EDGE INF`,min:0,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},gradientMagnitudeInf:{label:`GRADIENT INF`,min:0,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},softness:{label:`SOFTNESS`,min:0,max:1,step:.01,value:.3,tier:4,driveable:!0,unit:`0-1`},thresholdCutoff:{label:`THRESHOLD`,min:0,max:1,step:.01,value:.5,tier:4,driveable:!0,unit:`0-1`},channelDecorr:{label:`CH DECORR`,min:0,max:1,step:.01,value:.3,tier:4,driveable:!0,unit:`0-1`},highlightContam:{label:`HI CONTAM`,min:0,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},shadowDensity:{label:`SHADOW DENS`,min:0,max:2,step:.01,value:1,tier:5,driveable:!0,unit:`0-2`},lumPerturbation:{label:`LUM PERTURB`,min:0,max:1,step:.01,value:0,tier:4,driveable:!0,unit:`0-1`},chromaPerturbation:{label:`CHROMA PERTURB`,min:0,max:1,step:.01,value:0,tier:4,driveable:!0,unit:`0-1`},hueJitter:{label:`HUE JITTER`,min:0,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},satJitter:{label:`SAT JITTER`,min:0,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},temporalMode:{label:`TIME MODE`,type:`select`,options:[`LOCKED`,`RESAMPLED`,`DRIFT`,`SCROLL`,`FLICKER`,`BAKED`],value:`RESAMPLED`,tier:4},driftSpeed:{label:`DRIFT SPD`,min:0,max:5,step:.05,value:1,tier:4,driveable:!0,unit:`spd`},temporalCoherence:{label:`T COHERENCE`,min:0,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},temporalSeed:{label:`T SEED`,min:0,max:9999,step:1,value:0,tier:5,unit:`n`},gammaAware:{label:`GAMMA AWARE`,type:`toggle`,value:!1,tier:5},l1enabled:{label:`L1 ENABLED`,type:`toggle`,value:!0,tier:4},l1algorithm:{label:`L1 ALGORITHM`,type:`select`,options:[`WHITE`,`GAUSSIAN`,`VALUE`,`PERLIN`,`SIMPLEX`,`WORLEY`,`FBM`,`RIDGED`,`TURBULENCE`],value:`GAUSSIAN`,tier:4},l1seed:{label:`L1 SEED`,min:0,max:9999,step:1,value:0,tier:5,unit:`n`},l1scale:{label:`L1 SCALE`,min:.1,max:20,step:.1,value:1,tier:4,driveable:!0,unit:`n`},l1amplitude:{label:`L1 AMPLITUDE`,min:0,max:2,step:.01,value:.6,tier:4,driveable:!0,unit:`0-2`},l1offsetX:{label:`L1 OFFSET X`,min:-1,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},l1offsetY:{label:`L1 OFFSET Y`,min:-1,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},l1octaves:{label:`L1 OCTAVES`,min:1,max:8,step:1,value:4,tier:5,unit:`n`},l1lacunarity:{label:`L1 LACUNARITY`,min:1,max:4,step:.1,value:2,tier:5,unit:`n`},l1persistence:{label:`L1 PERSIST`,min:0,max:1,step:.01,value:.5,tier:5,unit:`0-1`},l1threshold:{label:`L1 THRESHOLD`,min:0,max:1,step:.01,value:0,tier:5,unit:`0-1`},l1quantise:{label:`L1 QUANTISE`,min:1,max:16,step:1,value:1,tier:5,unit:`n`},l1tPhase:{label:`L1 T PHASE`,min:0,max:1,step:.01,value:0,tier:5,unit:`0-1`},l1tSpeed:{label:`L1 T SPEED`,min:0,max:5,step:.05,value:1,tier:5,driveable:!0,unit:`spd`},l2enabled:{label:`L2 ENABLED`,type:`toggle`,value:!0,tier:4},l2algorithm:{label:`L2 ALGORITHM`,type:`select`,options:[`WHITE`,`GAUSSIAN`,`VALUE`,`PERLIN`,`SIMPLEX`,`WORLEY`,`FBM`,`RIDGED`,`TURBULENCE`],value:`PERLIN`,tier:4},l2seed:{label:`L2 SEED`,min:0,max:9999,step:1,value:100,tier:5,unit:`n`},l2scale:{label:`L2 SCALE`,min:.1,max:20,step:.1,value:3,tier:4,driveable:!0,unit:`n`},l2amplitude:{label:`L2 AMPLITUDE`,min:0,max:2,step:.01,value:.3,tier:4,driveable:!0,unit:`0-2`},l2offsetX:{label:`L2 OFFSET X`,min:-1,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},l2offsetY:{label:`L2 OFFSET Y`,min:-1,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},l2octaves:{label:`L2 OCTAVES`,min:1,max:8,step:1,value:3,tier:5,unit:`n`},l2lacunarity:{label:`L2 LACUNARITY`,min:1,max:4,step:.1,value:2,tier:5,unit:`n`},l2persistence:{label:`L2 PERSIST`,min:0,max:1,step:.01,value:.5,tier:5,unit:`0-1`},l2threshold:{label:`L2 THRESHOLD`,min:0,max:1,step:.01,value:0,tier:5,unit:`0-1`},l2quantise:{label:`L2 QUANTISE`,min:1,max:16,step:1,value:1,tier:5,unit:`n`},l2tPhase:{label:`L2 T PHASE`,min:0,max:1,step:.01,value:.3,tier:5,unit:`0-1`},l2tSpeed:{label:`L2 T SPEED`,min:0,max:5,step:.05,value:.7,tier:5,driveable:!0,unit:`spd`},l3enabled:{label:`L3 ENABLED`,type:`toggle`,value:!0,tier:4},l3algorithm:{label:`L3 ALGORITHM`,type:`select`,options:[`WHITE`,`GAUSSIAN`,`VALUE`,`PERLIN`,`SIMPLEX`,`WORLEY`,`FBM`,`RIDGED`,`TURBULENCE`],value:`WHITE`,tier:4},l3seed:{label:`L3 SEED`,min:0,max:9999,step:1,value:200,tier:5,unit:`n`},l3scale:{label:`L3 SCALE`,min:.1,max:20,step:.1,value:8,tier:4,driveable:!0,unit:`n`},l3amplitude:{label:`L3 AMPLITUDE`,min:0,max:2,step:.01,value:.1,tier:4,driveable:!0,unit:`0-2`},l3offsetX:{label:`L3 OFFSET X`,min:-1,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},l3offsetY:{label:`L3 OFFSET Y`,min:-1,max:1,step:.01,value:0,tier:5,driveable:!0,unit:`0-1`},l3octaves:{label:`L3 OCTAVES`,min:1,max:8,step:1,value:2,tier:5,unit:`n`},l3lacunarity:{label:`L3 LACUNARITY`,min:1,max:4,step:.1,value:2,tier:5,unit:`n`},l3persistence:{label:`L3 PERSIST`,min:0,max:1,step:.01,value:.5,tier:5,unit:`0-1`},l3threshold:{label:`L3 THRESHOLD`,min:0,max:1,step:.01,value:0,tier:5,unit:`0-1`},l3quantise:{label:`L3 QUANTISE`,min:1,max:16,step:1,value:1,tier:5,unit:`n`},l3tPhase:{label:`L3 T PHASE`,min:0,max:1,step:.01,value:.6,tier:5,unit:`0-1`},l3tSpeed:{label:`L3 T SPEED`,min:0,max:5,step:.05,value:.3,tier:5,driveable:!0,unit:`spd`}},extendedControls:[{type:`temporal-mode-control`,paramKeys:{mode:`temporalMode`}}],apply(e,t,n,r,i,a,o){let s=a?.nodeSeed??42,c=a?.frame??i.frame|0,l=o(`driftSpeed`,0),u=ka(s,i.temporalSeed,i.temporalMode,c,l),d=o(`amount`,0)/100,f=o(`lumInfluence`,0),p=o(`shadowWeight`,0),m=o(`midtoneWeight`,0),h=o(`highlightWeight`,0),g=o(`blackProtection`,0),_=o(`whiteProtection`,0),v=o(`flatAreaBoost`,0),y=o(`localContrastInf`,0),b=o(`edgeInfluence`,0),x=o(`gradientMagnitudeInf`,0),S=o(`softness`,0),C=o(`thresholdCutoff`,0),w=o(`channelDecorr`,0),T=o(`highlightContam`,0),E=o(`shadowDensity`,0),D=o(`lumPerturbation`,0),O=o(`chromaPerturbation`,0),k=o(`hueJitter`,0),A=o(`satJitter`,0),j=Math.max(1,i.size|0),M=i.operatingMode,N=i.channelMode,P=i.renderMode,F=M===`FIELD OUTPUT`,I=M===`PERTURBATION`||M===`HYBRID`,L=M===`FINISH`||M===`HYBRID`,ee=b>0||x>0,te=y>0,R=ee?Da(e,n,r):null,z=te?Oa(e,n,r):null,B=Math.ceil(n/j),V=Math.ceil(r/j),H=[{enabled:i.l1enabled,algorithm:i.l1algorithm,seed:i.l1seed,scale:o(`l1scale`,0),amplitude:o(`l1amplitude`,0),offsetX:i.l1offsetX,offsetY:i.l1offsetY,octaves:i.l1octaves,lacunarity:i.l1lacunarity,persistence:i.l1persistence,threshold:i.l1threshold,quantisation:i.l1quantise,temporalPhase:i.l1tPhase,temporalSpeed:o(`l1tSpeed`,0)},{enabled:i.l2enabled,algorithm:i.l2algorithm,seed:i.l2seed,scale:o(`l2scale`,0),amplitude:o(`l2amplitude`,0),offsetX:i.l2offsetX,offsetY:i.l2offsetY,octaves:i.l2octaves,lacunarity:i.l2lacunarity,persistence:i.l2persistence,threshold:i.l2threshold,quantisation:i.l2quantise,temporalPhase:i.l2tPhase,temporalSpeed:o(`l2tSpeed`,0)},{enabled:i.l3enabled,algorithm:i.l3algorithm,seed:i.l3seed,scale:o(`l3scale`,0),amplitude:o(`l3amplitude`,0),offsetX:i.l3offsetX,offsetY:i.l3offsetY,octaves:i.l3octaves,lacunarity:i.l3lacunarity,persistence:i.l3persistence,threshold:i.l3threshold,quantisation:i.l3quantise,temporalPhase:i.l3tPhase,temporalSpeed:o(`l3tSpeed`,0)}].map((e,t)=>Ta(B,V,{...e,seed:e.seed+t*311},u,c)),U=new Float32Array(B*V);for(let e of H)if(e)for(let t=0;t<B*V;t++)U[t]+=e[t];let W=null,ne=null;if(N===`RGB DECORRELATED`){W=new Float32Array(B*V),ne=new Float32Array(B*V);let e=Ca((u^2882343476)>>>0),t=Ca((u^1450766251)>>>0);for(let n=0;n<B*V;n++)W[n]=U[n]*(1-w)+(e()*2-1)*w,ne[n]=U[n]*(1-w)+(t()*2-1)*w}if(a&&F&&(a.grainField={data:U,w:B,h:V,scale:j}),F){for(let e=0;e<r;e++)for(let r=0;r<n;r++){let i=(e*n+r)*4,a=Math.floor(e/j)*B+Math.floor(r/j),o=Math.round(Math.max(0,Math.min(1,(U[a]+1)*.5))*255);t[i]=t[i+1]=t[i+2]=o,t[i+3]=255}return}let G=i.gammaAware?e=>(e/255)**2.2*255:e=>e,K=i.gammaAware?e=>(e/255)**(1/2.2)*255:e=>e,q=I&&(D>0||O>0||k>0||A>0)?ja(e,n,r,U,B,j,D,O,k,A,u):e;for(let e=0;e<r;e++)for(let r=0;r<n;r++){let i=e*n+r,a=i*4,o=Math.floor(e/j)*B+Math.floor(r/j),s=q[a],c=q[a+1],l=q[a+2],w=q[a+3],D=(s*.299+c*.587+l*.114)/255,O=1;if(ee&&R){let e=R[i];O=1+e*b+e*x}let k=1;te&&z&&(k=1+z[i]*y);let A=v>0?1+v*(1-Math.min(1,Math.abs(U[o])*4)):1,M=d*Ea(D,p,m,h,g,_,f)*O*k*A;if(!L){t[a]=Math.max(0,Math.min(255,q[a])),t[a+1]=Math.max(0,Math.min(255,q[a+1])),t[a+2]=Math.max(0,Math.min(255,q[a+2])),t[a+3]=w;continue}let F=U[o],I=W?W[o]:F,V=ne?ne[o]:F;switch(P){case`PARTICULATE`:{let e=1+S*4;F=Math.sign(F)*Math.abs(F)**+e,I=Math.sign(I)*Math.abs(I)**+e,V=Math.sign(V)*Math.abs(V)**+e;break}case`SOFT CLOUDED`:{let t=Q(r+3,e+5,u)*2-1,n=Q(r+7,e+11,u+13)*2-1,i=Q(r+13,e+7,u+29)*2-1;F=F*S+t*(1-S),I=N===`RGB DECORRELATED`?I*S+n*(1-S):F,V=N===`RGB DECORRELATED`?V*S+i*(1-S):F;break}case`THRESHOLDED SPECK`:F=Math.abs(F)>C?F:0,I=Math.abs(I)>C?I:0,V=Math.abs(V)>C?V:0;break;case`SENSOR NOISE`:{let t=(Q(r,e,u)*2-1)*.3,n=(Q(r,e,u+7)*2-1)*.3,i=(Q(r,e,u+13)*2-1)*.3;F=F*.7+t,I=(N===`RGB DECORRELATED`?I:F)*.7+n,V=(N===`RGB DECORRELATED`?V:F)*.7+i;break}default:break}if(N===`LUMA-CHROMA SPLIT`){let e=F*M*255,n=(1-D)*E,r=D*T,i=1+n+r;t[a]=Math.max(0,Math.min(255,K(G(s)+e*i))),t[a+1]=Math.max(0,Math.min(255,K(G(c)+e*i))),t[a+2]=Math.max(0,Math.min(255,K(G(l)+e*i)))}else{let e=M*255*(1+(1-D)*(E-1)),n=D*T,r=e*(1+n),i=e*(1+(N===`RGB DECORRELATED`?n*.9:n)),o=e*(1+(N===`RGB DECORRELATED`?n*1.1:n));t[a]=Math.max(0,Math.min(255,K(G(s)+F*r))),t[a+1]=Math.max(0,Math.min(255,K(G(c)+I*i))),t[a+2]=Math.max(0,Math.min(255,K(G(l)+V*o)))}t[a+3]=w}}});function ja(e,t,n,r,i,a,o,s,c,l,u){let d=new Uint8ClampedArray(e.length);for(let f=0;f<n;f++)for(let n=0;n<t;n++){let p=(f*t+n)*4,m=r[Math.floor(f/a)*i+Math.floor(n/a)],h=e[p]/255,g=e[p+1]/255,_=e[p+2]/255;if(o>0){let e=m*o*.1;h=Math.max(0,Math.min(1,h+e)),g=Math.max(0,Math.min(1,g+e)),_=Math.max(0,Math.min(1,_+e))}if(s>0){let e=Q(n,f,u+1)*2-1,t=Q(n,f,u+2)*2-1,r=Q(n,f,u+3)*2-1;h=Math.max(0,Math.min(1,h+e*s*.1)),g=Math.max(0,Math.min(1,g+t*s*.1)),_=Math.max(0,Math.min(1,_+r*s*.1))}if(c>0||l>0){let e=h*.299+g*.587+_*.114,t=(Q(n,f,u+4)*2-1)*c*.15,r=1+(Q(n,f,u+5)*2-1)*l;h=Math.max(0,Math.min(1,e+(h-e+t)*r)),g=Math.max(0,Math.min(1,e+(g-e-t*.5)*r)),_=Math.max(0,Math.min(1,e+(_-e-t*.5)*r))}d[p]=Math.round(h*255),d[p+1]=Math.round(g*255),d[p+2]=Math.round(_*255),d[p+3]=e[p+3]}return d}let Ma=I({type:`vignette`,name:`VIGNETTE`,category:`TEXTURE`,params:{amount:{label:`AMOUNT`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`},softness:{label:`SOFTNESS`,min:.01,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`},roundness:{label:`ROUNDNESS`,min:0,max:1,step:.01,value:1,tier:4,driveable:!0,unit:`0–1`},centreX:{label:`CENTRE X`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`},centreY:{label:`CENTRE Y`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`},renderMode:{label:`RENDER MODE`,type:`select`,options:[`overlay`,`field`],value:`overlay`,tier:3}},apply(e,t,n,r,i,a,o){let s=i.centreX*n,c=i.centreY*r,l=Math.max(n,r),u=i.roundness+(1-i.roundness)*(n/l),d=i.roundness+(1-i.roundness)*(r/l),f=i.renderMode===`field`;for(let i=0;i<r;i++)for(let r=0;r<n;r++){let a=i*n+r,l=a*4,p=o(`amount`,a),m=Math.max(.01,o(`softness`,a)),h=(r-s)/(s||1),g=(i-c)/(c||1),_=Math.sqrt(h*h/(u*u)+g*g/(d*d)),v=1-m,y=_<v?1:Math.max(0,1-(_-v)/Math.max(.001,m)),b=1-p*(1-y*y);if(f){let e=Math.round(b*255);t[l]=t[l+1]=t[l+2]=e,t[l+3]=255}else t[l]=e[l]*b,t[l+1]=e[l+1]*b,t[l+2]=e[l+2]*b,t[l+3]=e[l+3]}},wgsl:`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uAmount     : f32,
  uSoftness   : f32,
  uRoundness  : f32,
  uCentreX    : f32,
  uCentreY    : f32,
  uRenderMode : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let cx = uni.uCentreX * uni.uWidth;
  let cy = uni.uCentreY * uni.uHeight;
  let maxWH = max(uni.uWidth, uni.uHeight);
  let rx = uni.uRoundness + (1.0 - uni.uRoundness) * (uni.uWidth  / maxWH);
  let ry = uni.uRoundness + (1.0 - uni.uRoundness) * (uni.uHeight / maxWH);
  let dx   = (f32(x) - cx) / max(cx, 1.0);
  let dy   = (f32(y) - cy) / max(cy, 1.0);
  let dist = sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
  let edge = 1.0 - uni.uSoftness;
  let v    = select(max(0.0, 1.0 - (dist - edge) / max(0.001, uni.uSoftness)), 1.0, dist < edge);
  let factor = 1.0 - uni.uAmount * (1.0 - v * v);

  var out: vec4f;
  if (uni.uRenderMode > 0.5) {
    let f = clamp(factor, 0.0, 1.0);
    out = vec4f(f, f, f, 1.0);
  } else {
    out = vec4f(px.rgb * factor, px.a);
  }
  textureStore(tOut, vec2i(x, y), out);
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uAmount;
uniform float uSoftness;
uniform float uRoundness;
uniform float uCentreX;
uniform float uCentreY;
uniform int   uRenderMode;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4  px    = texture(uTex, vUV);
  vec2  res   = vec2(textureSize(uTex, 0));
  float cx    = uCentreX * res.x;
  float cy    = uCentreY * res.y;
  float maxWH = max(res.x, res.y);
  float rx    = uRoundness + (1.0 - uRoundness) * (res.x / maxWH);
  float ry    = uRoundness + (1.0 - uRoundness) * (res.y / maxWH);
  float px_x  = vUV.x * res.x;
  float px_y  = vUV.y * res.y;
  float dx    = (px_x - cx) / max(cx, 1.0);
  float dy    = (px_y - cy) / max(cy, 1.0);
  float dist  = sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
  float edge  = 1.0 - uSoftness;
  float v     = (dist < edge) ? 1.0 : max(0.0, 1.0 - (dist - edge) / max(0.001, uSoftness));
  float factor = 1.0 - uAmount * (1.0 - v * v);
  if (uRenderMode == 1) {
    float f = clamp(factor, 0.0, 1.0);
    fragColor = vec4(f, f, f, 1.0);
  } else {
    fragColor = vec4(px.rgb * factor, px.a);
  }
}
`,gpuBindings:{uniforms:{uAmount:`f32`,uSoftness:`f32`,uRoundness:`f32`,uCentreX:`f32`,uCentreY:`f32`,uRenderMode:`i32`},multiPass:!1,uniformMap:e=>({uAmount:e.amount,uSoftness:e.softness,uRoundness:e.roundness,uCentreX:e.centreX,uCentreY:e.centreY,uRenderMode:+(e.renderMode===`field`)})}});function Na(e,t,n,r=2,i=.5,a=.3,o=0){let s=1-a,c=new Uint8ClampedArray(e.length),l=Math.max(1,r);for(let r=0;r<n;r++){let n=((r+o)%l+l)%l/l<i?s:1;for(let i=0;i<t;i++){let a=(r*t+i)*4;c[a]=e[a]*n,c[a+1]=e[a+1]*n,c[a+2]=e[a+2]*n,c[a+3]=e[a+3]}}return c}let Pa=I({type:`scanlines`,name:`SCANLINES`,category:`TEXTURE`,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},spacing:{label:`SPACING`,min:1,max:10,step:1,value:2,tier:3,unit:`px`,driveable:!0},thickness:{label:`THICKNESS`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`},scOpacity:{label:`LINE OPACITY`,min:0,max:1,step:.01,value:.3,tier:3,driveable:!0,unit:`0–1`}},apply(e,t,n,r,i,a,o){t.set(Na(e,n,r,i.spacing,i.thickness,o(`scOpacity`,0),i.frame))},wgsl:`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uSpacing   : f32,
  uThickness : f32,
  uOpacity   : f32,
  uFrame     : f32,
  _pad       : f32,
  _pad2      : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px      = textureLoad(tIn, vec2i(x, y), 0);
  let spacing = max(1.0, uni.uSpacing);
  let lineH   = max(1.0, round(spacing * uni.uThickness));
  let row     = (f32(y) + uni.uFrame) % spacing;
  let inLine  = select(0.0, uni.uOpacity, row < lineH);
  let factor  = 1.0 - inLine;
  textureStore(tOut, vec2i(x, y), vec4f(px.rgb * factor, px.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uSpacing;
uniform float uThickness;
uniform float uOpacity;
uniform float uFrame;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4  px      = texture(uTex, vUV);
  float res_y   = float(textureSize(uTex, 0).y);
  float py      = vUV.y * res_y;
  float spacing = max(1.0, uSpacing);
  float lineH   = max(1.0, round(spacing * uThickness));
  float row     = mod(py + uFrame, spacing);
  float inLine  = (row < lineH) ? uOpacity : 0.0;
  float factor  = 1.0 - inLine;
  fragColor = vec4(px.rgb * factor, px.a);
}
`,gpuBindings:{uniforms:{uSpacing:`f32`,uThickness:`f32`,uOpacity:`f32`,uFrame:`f32`},multiPass:!1,uniformMap:e=>({uSpacing:e.spacing,uThickness:e.thickness,uOpacity:e.scOpacity,uFrame:e.frame})}});function Fa(e,t,n){return t*n+e}function Ia(e,t,n,r=1){let i=new Uint8Array(e.length);for(let a=0;a<n;a++)for(let o=0;o<t;o++){let s=255;for(let i=-r;i<=r;i++){let c=Math.max(0,Math.min(n-1,a+i));for(let n=-r;n<=r;n++){let r=e[Fa(Math.max(0,Math.min(t-1,o+n)),c,t)];r<s&&(s=r)}}i[Fa(o,a,t)]=s}return i}function La(e,t,n,r=1){let i=new Uint8Array(e.length);for(let a=0;a<n;a++)for(let o=0;o<t;o++){let s=0;for(let i=-r;i<=r;i++){let c=Math.max(0,Math.min(n-1,a+i));for(let n=-r;n<=r;n++){let r=e[Fa(Math.max(0,Math.min(t-1,o+n)),c,t)];r>s&&(s=r)}}i[Fa(o,a,t)]=s}return i}function Ra(e,t,n,r=1){return La(Ia(e,t,n,r),t,n,r)}function za(e,t,n,r=1){return Ia(La(e,t,n,r),t,n,r)}function Ba(e,t){let n=new Uint8Array(t),r=new Uint8Array(t),i=new Uint8Array(t);for(let a=0;a<t;a++){let t=a*4;n[a]=e[t],r[a]=e[t+1],i[a]=e[t+2]}return{r:n,g:r,b:i}}function Va(e,t,n,r,i){let a=new Uint8ClampedArray(e.length);for(let o=0;o<i;o++){let i=o*4;a[i]=t[o],a[i+1]=n[o],a[i+2]=r[o],a[i+3]=e[i+3]}return a}function Ha(e,t,n,r,i=1){let a=t*n,{r:o,g:s,b:c}=Ba(e,a),l=r===`erode`?Ia:La;return Va(e,l(o,t,n,i),l(s,t,n,i),l(c,t,n,i),a)}function Ua(e,t,n,r,i=1){let a=t*n,{r:o,g:s,b:c}=Ba(e,a),l=r===`close`?za:Ra;return Va(e,l(o,t,n,i),l(s,t,n,i),l(c,t,n,i),a)}let Wa=I({type:`dilateerode`,name:`DILATE/ERODE`,category:`MORPHOLOGY`,params:{mode:{label:`MODE`,type:`select`,options:[`DILATE`,`ERODE`],value:`DILATE`,tier:3},domain:{label:`INPUT DOMAIN`,type:`select`,options:[`LUMINANCE`,`RGB LINKED`,`RGB INDEPENDENT`,`ALPHA`,`MASK`,`EDGE MAP`,`THRESHOLDED BINARY`],value:`LUMINANCE`,tier:3},outputType:{label:`OUTPUT TYPE`,type:`select`,options:[`IMAGE`,`MASK`,`FIELD`,`HYBRID`],value:`IMAGE`,tier:3},iterations:{label:`ITERATIONS`,min:1,max:10,step:1,value:1,tier:3,previewMax:3,unit:`steps`,driveable:!0},radius:{label:`RADIUS`,min:1,max:10,step:1,value:1,tier:3,previewMax:5,unit:`px`,driveable:!0},isotropic:{label:`ISOTROPIC`,type:`toggle`,value:!0,tier:4},radiusX:{label:`RADIUS X`,min:1,max:10,step:1,value:1,tier:4,previewMax:5,unit:`px`,driveable:!0},radiusY:{label:`RADIUS Y`,min:1,max:10,step:1,value:1,tier:4,previewMax:5,unit:`px`,driveable:!0},shape:{label:`SHAPE`,type:`select`,options:[`SQUARE`,`CIRCLE`],value:`SQUARE`,tier:4}},apply(e,t,n,r,i,a,o){let s=e;for(let e=0;e<i.iterations;e++)s=Ha(s,n,r,i.mode.toLowerCase(),i.radius,i.shape.toLowerCase());t.set(s)},wgsl:`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uRadius : f32,
  uMode   : f32,  // 0 = dilate, 1 = erode
  uShape  : f32,  // 0 = square, 1 = circle
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3u) {
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  let x = i32(gid.x);
  let y = i32(gid.y);
  if (x >= w || y >= h) { return; }

  let r       = max(1, min(20, i32(uni.uRadius)));
  let dilate  = uni.uMode < 0.5;
  let circle  = uni.uShape > 0.5;
  let r2      = f32(r * r);

  var best = vec4f(0.0);
  if (dilate) { best = vec4f(0.0); } else { best = vec4f(1.0); }

  for (var dy = -r; dy <= r; dy++) {
    for (var dx = -r; dx <= r; dx++) {
      if (circle && f32(dx*dx + dy*dy) > r2) { continue; }
      let sx = clamp(x + dx, 0, w - 1);
      let sy = clamp(y + dy, 0, h - 1);
      let c  = textureLoad(tIn, vec2i(sx, sy), 0);
      if (dilate) {
        best = max(best, c);
      } else {
        best = min(best, c);
      }
    }
  }

  // preserve alpha from source
  let orig = textureLoad(tIn, vec2i(x, y), 0);
  textureStore(tOut, vec2i(x, y), vec4f(best.rgb, orig.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform int       uRadius;
uniform int       uMode;   // 0 = dilate, 1 = erode
uniform int       uShape;  // 0 = square, 1 = circle

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2 ts  = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  int  r   = max(1, min(20, uRadius));
  float r2 = float(r * r);

  vec4 best = (uMode == 0) ? vec4(0.0) : vec4(1.0);

  for (int dy = -r; dy <= r; dy++) {
    for (int dx = -r; dx <= r; dx++) {
      if (uShape == 1 && float(dx*dx + dy*dy) > r2) { continue; }
      vec2 uv = clamp(vUV + vec2(float(dx), float(dy)) * ts, vec2(0.0), vec2(1.0));
      vec4 c  = texture(uTex, uv);
      if (uMode == 0) { best = max(best, c); }
      else            { best = min(best, c); }
    }
  }

  vec4 orig = texture(uTex, vUV);
  fragColor = vec4(best.rgb, orig.a);
}
`,gpuBindings:{uniforms:{uRadius:`i32`,uMode:`i32`,uShape:`i32`},multiPass:!1,passesFromParams:e=>Math.round(e.iterations),uniformMap:e=>({uRadius:e.isotropic?Math.round(e.radius):Math.round(e.radiusX),uMode:e.mode===`DILATE`?0:1,uShape:+(e.shape===`CIRCLE`)})}}),Ga=I({type:`openclose`,name:`OPEN/CLOSE`,category:`MORPHOLOGY`,params:{mode:{label:`MODE`,type:`select`,options:[`OPEN`,`CLOSE`],value:`OPEN`,tier:3},shape:{label:`SHAPE`,type:`select`,options:[`SQUARE`,`CIRCLE`,`DIAMOND`,`CROSS`],value:`SQUARE`,tier:3},radius:{label:`RADIUS`,min:1,max:10,step:1,value:1,tier:3,previewMax:5,unit:`px`},iterations:{label:`ITERATIONS`,min:1,max:10,step:1,value:1,tier:3,previewMax:3,unit:`×`,driveable:!0}},apply(e,t,n,r,i,a,o){let s=Math.round(i.iterations),c=e;for(let e=0;e<s;e++)c=Ua(c,n,r,i.mode.toLowerCase(),i.radius);t.set(c)},wgsl:`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uRadius : f32,
  uStep   : f32,  // 0 = first op, 1 = second op
  uMode   : f32,  // 0 = open (erode first), 1 = close (dilate first)
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3u) {
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  let x = i32(gid.x);
  let y = i32(gid.y);
  if (x >= w || y >= h) { return; }

  let r = max(1, min(20, i32(uni.uRadius)));

  // open:  step0=erode,  step1=dilate
  // close: step0=dilate, step1=erode
  let firstIsDilate = uni.uMode > 0.5;
  let step0Dilate   = firstIsDilate;
  let step1Dilate   = !firstIsDilate;
  let isDilate      = select(step1Dilate, step0Dilate, uni.uStep < 0.5);

  var best: vec4f;
  if (isDilate) { best = vec4f(0.0); } else { best = vec4f(1.0); }

  for (var dy = -r; dy <= r; dy++) {
    for (var dx = -r; dx <= r; dx++) {
      let c = textureLoad(tIn, vec2i(clamp(x+dx, 0, w-1), clamp(y+dy, 0, h-1)), 0);
      if (isDilate) { best = max(best, c); }
      else          { best = min(best, c); }
    }
  }

  let orig = textureLoad(tIn, vec2i(x, y), 0);
  textureStore(tOut, vec2i(x, y), vec4f(best.rgb, orig.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform int       uRadius;
uniform int       uStep;  // 0 = first op, 1 = second op
uniform int       uMode;  // 0 = open (erode first), 1 = close (dilate first)

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2 ts = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  int  r  = max(1, min(20, uRadius));

  // open: step0=erode, step1=dilate; close: step0=dilate, step1=erode
  bool step0Dilate = (uMode == 1);
  bool isDilate    = (uStep == 0) ? step0Dilate : !step0Dilate;

  vec4 best = isDilate ? vec4(0.0) : vec4(1.0);

  for (int dy = -r; dy <= r; dy++) {
    for (int dx = -r; dx <= r; dx++) {
      vec2 uv = clamp(vUV + vec2(float(dx), float(dy)) * ts, vec2(0.0), vec2(1.0));
      vec4 c  = texture(uTex, uv);
      if (isDilate) { best = max(best, c); }
      else          { best = min(best, c); }
    }
  }

  vec4 orig = texture(uTex, vUV);
  fragColor = vec4(best.rgb, orig.a);
}
`,gpuBindings:{uniforms:{uRadius:`i32`,uStep:`i32`,uMode:`i32`},multiPass:!0,passes:2,passesFromParams:e=>Math.round(e.iterations)*2,uniformMap:e=>({uRadius:Math.round(e.radius),uStep:0,uMode:e.mode===`OPEN`?0:1})}});function Ka(e,t=256){let n=new Float64Array(t);for(let r=0;r<e.length;r++){let i=Math.min(t-1,Math.floor(e[r]));n[i]++}let r=e.length;for(let e=0;e<t;e++)n[e]/=r;let i=new Float64Array(t),a=new Float64Array(t);i[0]=n[0],a[0]=0;for(let e=1;e<t;e++)i[e]=i[e-1]+n[e],a[e]=a[e-1]+e*n[e];let o=a[t-1],s=0,c=0;for(let e=0;e<t-1;e++){let t=i[e],n=1-t;if(t===0||n===0)continue;let r=a[e]/t,l=(o-a[e])/n,u=t*n*(r-l)*(r-l);u>c&&(c=u,s=e)}return{threshold:s,variance:c}}let qa=I({type:`otsuthreshold`,name:`OTSU THRESH`,category:`SEGMENTATION`,params:{mode:{label:`MODE`,type:`select`,options:[`BINARY`,`MASK`,`SOFT MASK`,`FIELD`],value:`BINARY`,tier:3},invert:{label:`INVERT`,type:`toggle`,value:!1,tier:3},domain:{label:`INPUT DOMAIN`,type:`select`,options:[`LUMINANCE`,`RED`,`GREEN`,`BLUE`,`SATURATION`,`CHROMA`,`GRADIENT`,`EXTERNAL`],value:`LUMINANCE`,tier:3},offset:{label:`THRESHOLD OFFSET`,min:-128,max:128,step:1,value:0,tier:3,driveable:!0,unit:``},softness:{label:`SOFTNESS`,min:0,max:64,step:1,value:8,tier:3,driveable:!0,unit:``,when:{param:`mode`,equals:`SOFT MASK`}}},apply(e,t,n,r,i,a,o){let s=n*r,c=i.domain??`LUMINANCE`,l=new Uint8Array(s);if(c===`GRADIENT`){let t=new Uint8Array(s);for(let n=0;n<s;n++){let r=n*4;t[n]=Math.round(e[r]*.299+e[r+1]*.587+e[r+2]*.114)}for(let e=0;e<r;e++)for(let i=0;i<n;i++){let a=e*n+i,o=e*n+Math.min(i+1,n-1),s=e*n+Math.max(i-1,0),c=Math.min(e+1,r-1)*n+i,u=Math.max(e-1,0)*n+i,d=t[o]-t[s],f=t[c]-t[u];l[a]=Math.min(255,Math.round(Math.sqrt(d*d+f*f)*.5))}}else for(let t=0;t<s;t++){let n=t*4,r=e[n],i=e[n+1],a=e[n+2];if(c===`RED`)l[t]=r;else if(c===`GREEN`)l[t]=i;else if(c===`BLUE`)l[t]=a;else if(c===`SATURATION`){let e=Math.max(r,i,a);l[t]=e===0?0:Math.round((e-Math.min(r,i,a))/e*255)}else if(c===`CHROMA`){let e=Math.round(r*.299+i*.587+a*.114);l[t]=Math.min(255,Math.round(Math.sqrt((r-e)**2+(i-e)**2+(a-e)**2)/Math.SQRT2))}else l[t]=Math.round(r*.299+i*.587+a*.114)}let{threshold:u}=Ka(l),d=Math.max(0,Math.min(255,u+(i.offset??0))),f=i.mode,p=Math.max(1,i.softness??8);for(let n=0;n<s;n++){let r=n*4;if(f===`SOFT MASK`){let a=1/(1+Math.exp(-(l[n]-d)*p/16));i.invert&&(a=1-a),t[r]=e[r]*a,t[r+1]=e[r+1]*a,t[r+2]=e[r+2]*a}else{let a=+(l[n]>d);if(i.invert&&(a=1-a),f===`MASK`)t[r]=e[r]*a,t[r+1]=e[r+1]*a,t[r+2]=e[r+2]*a;else{let e=a*255;t[r]=e,t[r+1]=e,t[r+2]=e}}t[r+3]=e[r+3]}}}),Ja=I({type:`contour`,name:`CONTOUR`,category:`GEOMETRIC`,params:{outputMode:{label:`OUTPUT MODE`,type:`select`,options:[`CONTOUR`,`FILL`,`CONTOUR+FILL`,`MASK`,`FIELD`],value:`CONTOUR`,tier:3},domain:{label:`INPUT DOMAIN`,type:`select`,options:[`LUMINANCE`,`RED`,`GREEN`,`BLUE`,`HUE`,`SATURATION`,`CHROMA`,`GRADIENT MAGNITUDE`],value:`LUMINANCE`,tier:3},bandSpacing:{label:`BAND SPACING`,type:`select`,options:[`UNIFORM`,`SHADOW-BIASED`,`HIGHLIGHT-BIASED`,`HISTOGRAM-ADAPTIVE`],value:`UNIFORM`,tier:3},levels:{label:`LEVELS`,min:2,max:32,step:1,value:8,tier:3,previewMax:16,unit:`n`},strokeW:{label:`STROKE W`,min:.5,max:4,step:.5,value:1,tier:3,previewMax:2,unit:`px`},strokeColourMode:{label:`STROKE COL MODE`,type:`select`,options:[`GREYSCALE`,`RGB`,`SOURCE-DERIVED`,`BAND-DERIVED`],value:`GREYSCALE`,tier:3},strokeLevel:{label:`STROKE LVL`,min:0,max:255,step:1,value:0,tier:4,unit:`lvl`,when:{strokeColourMode:`GREYSCALE`}},strokeR:{label:`STROKE R`,min:0,max:255,step:1,value:0,tier:3,unit:`lvl`,when:{strokeColourMode:`RGB`}},strokeG:{label:`STROKE G`,min:0,max:255,step:1,value:0,tier:3,unit:`lvl`,when:{strokeColourMode:`RGB`}},strokeB:{label:`STROKE B`,min:0,max:255,step:1,value:0,tier:3,unit:`lvl`,when:{strokeColourMode:`RGB`}},blendAmt:{label:`BLEND`,min:0,max:1,step:.01,value:.7,tier:3,unit:`0–1`},fillMode:{label:`FILL MODE`,type:`select`,options:[`NONE`,`FLAT`,`ALTERNATING`,`SOURCE-PRESERVING`],value:`FLAT`,tier:3,when:{outputMode:[`FILL`,`CONTOUR+FILL`]}},fillOpacity:{label:`FILL OPACITY`,min:0,max:1,step:.01,value:1,tier:3,unit:`0–1`,when:{outputMode:[`FILL`,`CONTOUR+FILL`]}},invertBands:{label:`INVERT BANDS`,type:`toggle`,value:!1,tier:4},fieldExport:{label:`FIELD EXPORT`,type:`select`,options:[`NONE`,`BAND INDEX`,`CONTOUR MASK`,`CONTOUR DISTANCE`],value:`NONE`,tier:4,when:{outputMode:`FIELD`}}},apply(e,t,n,r,i,a,o){let s=i.strokeLevel;i.strokeColourMode===`RGB`&&(s=Math.round(.299*i.strokeR+.587*i.strokeG+.114*i.strokeB)),t.set(jn(e,n,r,i.levels,i.strokeW,s,i.blendAmt))}}),Ya=I({type:`sdfshape`,name:`SDF SHAPE`,category:`GEOMETRIC`,params:{shape:{label:`SHAPE`,type:`select`,options:[`CIRCLE`,`BOX`,`RING`],value:`CIRCLE`,tier:3},outputMode:{label:`OUTPUT MODE`,type:`select`,options:[`FILL`,`OUTLINE`,`MASK`,`DISTANCE`,`BANDED`,`IMAGE MODIFY`],value:`FILL`,tier:3},centreX:{label:`CENTRE X`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`},centreY:{label:`CENTRE Y`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`},size:{label:`SIZE`,min:.01,max:1,step:.01,value:.3,tier:3,driveable:!0,unit:`0–1`},scaleX:{label:`SCALE X`,min:.1,max:4,step:.01,value:1,tier:4,driveable:!0},scaleY:{label:`SCALE Y`,min:.1,max:4,step:.01,value:1,tier:4,driveable:!0},rotation:{label:`ROTATION`,min:0,max:360,step:1,value:0,tier:4,driveable:!0,unit:`°`},softness:{label:`SOFTNESS`,min:0,max:.2,step:.005,value:.02,tier:4,driveable:!0,unit:`0–1`},invert:{label:`INVERT`,type:`toggle`,value:!1,tier:4},fillR:{label:`FILL R`,min:0,max:255,step:1,value:0,tier:4,driveable:!0,unit:`lvl`},fillG:{label:`FILL G`,min:0,max:255,step:1,value:0,tier:4,driveable:!0,unit:`lvl`},fillB:{label:`FILL B`,min:0,max:255,step:1,value:0,tier:4,driveable:!0,unit:`lvl`},outlineWidth:{label:`OUTLINE WIDTH`,min:.001,max:.1,step:.001,value:.01,tier:4,driveable:!0,unit:`px`,when:{outputMode:`OUTLINE`}},ringThickness:{label:`RING THICKNESS`,min:.005,max:.5,step:.005,value:.15,tier:4,driveable:!0,unit:`0–1`,when:{shape:`RING`}},bandFreq:{label:`BAND FREQUENCY`,min:1,max:40,step:.5,value:10,tier:4,driveable:!0,when:{outputMode:`BANDED`}},bandOffset:{label:`BAND OFFSET`,min:0,max:6.28,step:.01,value:0,tier:4,driveable:!0,when:{outputMode:`BANDED`}},blurByField:{label:`BLUR BY FIELD`,min:0,max:20,step:.5,value:5,tier:4,driveable:!0,when:{outputMode:`IMAGE MODIFY`}},lumByField:{label:`LUM BY FIELD`,min:-1,max:1,step:.01,value:.3,tier:4,driveable:!0,when:{outputMode:`IMAGE MODIFY`}},satByField:{label:`SAT BY FIELD`,min:-1,max:1,step:.01,value:0,tier:4,driveable:!0,when:{outputMode:`IMAGE MODIFY`}},grainByField:{label:`GRAIN BY FIELD`,min:0,max:50,step:1,value:0,tier:4,driveable:!0,when:{outputMode:`IMAGE MODIFY`}}},apply(e,t,n,r,i,a,o){let s=n*r,c=Math.min(n,r),l=Math.cos((i.rotation??0)*Math.PI/180),u=Math.sin((i.rotation??0)*Math.PI/180);for(let a=0;a<s;a++){let s=a%n,d=a/n|0,f=a*4,p=o?o(`centreX`,a):i.centreX,m=o?o(`centreY`,a):i.centreY,h=o?o(`size`,a):i.size,g=o?o(`softness`,a):i.softness,_=o?o(`scaleX`,a):i.scaleX??1,v=o?o(`scaleY`,a):i.scaleY??1,y=o?o(`rotation`,a):i.rotation??0,b=o?Math.cos(y*Math.PI/180):l,x=o?Math.sin(y*Math.PI/180):u,S=s/n-p,C=d/r-m;S*=n/r;let w=b*S-x*C,T=x*S+b*C,E=w/_,D=T/v,O,k=i.shape;if(k===`CIRCLE`)O=Math.sqrt(E*E+D*D)-h;else if(k===`BOX`){let e=Math.abs(E)-h,t=Math.abs(D)-h;O=Math.sqrt(Math.max(e,0)**2+Math.max(t,0)**2)+Math.min(Math.max(e,t),0)}else{let e=o?o(`ringThickness`,a):i.ringThickness??.15,t=Math.sqrt(E*E+D*D)-h;O=Math.abs(t)-h*e}let A=i.invert?-1:1,j=O*A,M=Math.max(0,Math.min(1,-j/Math.max(g,1e-5))),N=e[f],P=e[f+1],F=e[f+2],I=e[f+3],L=i.outputMode??`FILL`;if(L===`FILL`){let e=o?o(`fillR`,a):i.fillR,n=o?o(`fillG`,a):i.fillG,r=o?o(`fillB`,a):i.fillB;t[f]=N+(e-N)*M,t[f+1]=P+(n-P)*M,t[f+2]=F+(r-F)*M,t[f+3]=I}else if(L===`OUTLINE`){let e=o?o(`outlineWidth`,a):i.outlineWidth??.01,n=g>0?Math.max(0,1-Math.abs(Math.abs(O)-e)/Math.max(g*.5,1e-5)):+(Math.abs(O)<e),r=Math.max(0,Math.min(1,n)),s=o?o(`fillR`,a):i.fillR,c=o?o(`fillG`,a):i.fillG,l=o?o(`fillB`,a):i.fillB;t[f]=N+(s-N)*r,t[f+1]=P+(c-P)*r,t[f+2]=F+(l-F)*r,t[f+3]=I}else if(L===`MASK`){let e=Math.round(M*255);t[f]=e,t[f+1]=e,t[f+2]=e,t[f+3]=255}else if(L===`DISTANCE`){let e=O/(c*.5),n=Math.max(0,Math.min(255,Math.round((e+1)*.5*255)));t[f]=n,t[f+1]=n,t[f+2]=n,t[f+3]=255}else if(L===`BANDED`){let e=o?o(`bandFreq`,a):i.bandFreq??10,n=o?o(`bandOffset`,a):i.bandOffset??0,r=Math.round((Math.sin(O*e+n)+1)*.5*255);t[f]=r,t[f+1]=r,t[f+2]=r,t[f+3]=255}else if(L===`IMAGE MODIFY`){let e=o?o(`lumByField`,a):i.lumByField??.3,n=o?o(`satByField`,a):i.satByField??0,r=o?o(`grainByField`,a):i.grainByField??0,s=Math.max(0,Math.min(1,M)),c=e*s*128,l=Math.max(0,Math.min(255,N+c)),u=Math.max(0,Math.min(255,P+c)),d=Math.max(0,Math.min(255,F+c)),p=.299*l+.587*u+.114*d,m=n*s;if(l=Math.max(0,Math.min(255,p+(l-p)*(1+m))),u=Math.max(0,Math.min(255,p+(u-p)*(1+m))),d=Math.max(0,Math.min(255,p+(d-p)*(1+m))),r>0){let e=(Math.random()-.5)*r*s;l=Math.max(0,Math.min(255,l+e)),u=Math.max(0,Math.min(255,u+e)),d=Math.max(0,Math.min(255,d+e))}t[f]=l,t[f+1]=u,t[f+2]=d,t[f+3]=I}else t[f]=N,t[f+1]=P,t[f+2]=F,t[f+3]=I}}});function Xa(e,t,n,r,i,a,o){let s=Math.cos(i*Math.PI/180),c=t*n,l=1-o,u=new Uint8ClampedArray(e.length),d=Math.PI*2;for(let t=0;t<c;t++){let n=t*4,i=2*1.33*(r+(e[n]*.299+e[n+1]*.587+e[n+2]*.114)/255*200*a)*s,c=.5+.5*Math.cos(d*i/650),f=.5+.5*Math.cos(d*i/550),p=.5+.5*Math.cos(d*i/450);u[n]=Math.round(e[n]*l+c*255*o),u[n+1]=Math.round(e[n+1]*l+f*255*o),u[n+2]=Math.round(e[n+2]*l+p*255*o),u[n+3]=e[n+3]}return u}let Za=I({type:`interference`,name:`INTERFERENCE`,category:`OPTICS`,params:{frame:{label:`FRAME`,min:0,max:240,step:1,value:0,tier:3,driveable:!0,unit:`frames`},filmThickness:{label:`THICKNESS`,min:100,max:800,step:10,value:300,tier:3,unit:`nm`,driveable:!0},viewAngle:{label:`VIEW ANGLE`,min:0,max:60,step:1,value:0,tier:4,unit:`deg`,driveable:!0},couplingStrength:{label:`COUPLING STRENGTH`,min:0,max:2,step:.05,value:1,tier:3,driveable:!0},thicknessOffset:{label:`THICKNESS OFFSET`,min:-400,max:400,step:5,value:0,tier:3,unit:`nm`,driveable:!0},blendAmt:{label:`BLEND`,min:0,max:1,step:.01,value:.5,tier:3,driveable:!0,unit:`0–1`}},apply(e,t,n,r,i,a,o){let s=i.filmThickness+i.frame*2+(i.thicknessOffset??0);t.set(Xa(e,n,r,s,i.viewAngle,i.couplingStrength,i.blendAmt))},wgsl:`
struct Uniforms {
  uWidth            : f32,
  uHeight           : f32,
  uFilmThickness    : f32,
  uViewAngle        : f32,
  uCouplingStrength : f32,
  uThicknessOffset  : f32,
  uBlendAmt         : f32,
  uFrame            : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI     : f32 = 3.14159265358979;
const TWO_PI : f32 = 6.28318530717959;
const N_OIL  : f32 = 1.5;  // approximate refractive index

fn interferenceChannel(thickness: f32, cosTheta: f32, lambda: f32) -> f32 {
  let phase = (TWO_PI * 2.0 * N_OIL * thickness * cosTheta) / lambda;
  return 0.5 + 0.5 * cos(phase);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  // Effective thickness: base + luminance-coupled offset + frame animation
  let lum   = dot(px.rgb, vec3f(0.299, 0.587, 0.114));
  let thick = uni.uFilmThickness + uni.uFrame * 2.0 + uni.uThicknessOffset
            + lum * uni.uCouplingStrength * 100.0;
  let theta    = uni.uViewAngle * PI / 180.0;
  let cosTheta = cos(theta);
  // Wavelengths: R≈650nm, G≈530nm, B≈450nm
  let iR = interferenceChannel(thick, cosTheta, 650.0);
  let iG = interferenceChannel(thick, cosTheta, 530.0);
  let iB = interferenceChannel(thick, cosTheta, 450.0);
  let iridescence = vec3f(iR, iG, iB);
  let blended = mix(px.rgb, iridescence, uni.uBlendAmt);
  textureStore(tOut, vec2i(x, y), vec4f(clamp(blended, vec3f(0.0), vec3f(1.0)), px.a));
}
`,glsl:`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uFilmThickness;
uniform float uViewAngle;
uniform float uCouplingStrength;
uniform float uThicknessOffset;
uniform float uBlendAmt;
uniform float uFrame;

in  vec2 vUV;
out vec4 fragColor;

const float PI     = 3.14159265358979;
const float TWO_PI = 6.28318530717959;
const float N_OIL  = 1.5;

float interferenceChannel(float thickness, float cosTheta, float lambda) {
  float phase = (TWO_PI * 2.0 * N_OIL * thickness * cosTheta) / lambda;
  return 0.5 + 0.5 * cos(phase);
}

void main() {
  vec4  px  = texture(uTex, vUV);
  float lum = dot(px.rgb, vec3(0.299, 0.587, 0.114));
  float thick = uFilmThickness + uFrame * 2.0 + uThicknessOffset
              + lum * uCouplingStrength * 100.0;
  float cosTheta = cos(uViewAngle * PI / 180.0);
  vec3 iridescence = vec3(
    interferenceChannel(thick, cosTheta, 650.0),
    interferenceChannel(thick, cosTheta, 530.0),
    interferenceChannel(thick, cosTheta, 450.0)
  );
  fragColor = vec4(clamp(mix(px.rgb, iridescence, uBlendAmt), 0.0, 1.0), px.a);
}
`,gpuBindings:{uniforms:{uFilmThickness:`f32`,uViewAngle:`f32`,uCouplingStrength:`f32`,uThicknessOffset:`f32`,uBlendAmt:`f32`,uFrame:`f32`},multiPass:!1,uniformMap:e=>({uFilmThickness:e.filmThickness,uViewAngle:e.viewAngle,uCouplingStrength:e.couplingStrength,uThicknessOffset:e.thicknessOffset,uBlendAmt:e.blendAmt,uFrame:e.frame})}}),Qa={"COLOUR / TONE":[{type:`greyscale`,label:`GREYSCALE`,description:`Converts image to greyscale using weighted luminance channels`,factory:()=>new be},{type:`levels`,label:`LEVELS`,description:`Remaps tonal range via black point, white point, and gamma`,factory:()=>new xe},{type:`contrast`,label:`CONTRAST`,description:`Adjusts shadow lift, midtone gamma, highlight gain, and vibrance`,factory:()=>new Se},{type:`curves`,label:`CURVES`,description:`Maps input to output tones using a custom bezier curve`,factory:()=>new Ne},{type:`hsladjust`,label:`HSL ADJUST`,description:`Shifts hue, saturation, and lightness globally or per colour range`,factory:()=>new Oe},{type:`channelmixer`,label:`CHANNEL MIXER`,description:`Blends RGB channels into each output channel with custom weights`,factory:()=>new ke},{type:`colourbalance`,label:`COLOUR BALANCE`,description:`Shifts colour balance in shadows, midtones, and highlights`,factory:()=>new Ae},{type:`temptint`,label:`TEMP / TINT`,description:`Adjusts colour temperature (warm/cool) and green-magenta tint`,factory:()=>new Me},{type:`gradientmap`,label:`GRADIENT MAP`,description:`Maps luminance values to a two-colour gradient`,factory:()=>new je},{type:`invert`,label:`INVERT`,description:`Inverts all pixel values to produce a colour negative`,factory:()=>new De},{type:`quantise`,label:`QUANTISE`,description:`Palette quantisation, dithering, and per-channel posterisation`,factory:()=>new we},{type:`histogrameq`,label:`HISTOGRAM EQ`,description:`Redistributes tones to flatten the luminance histogram`,factory:()=>new Pe},{type:`clahe`,label:`CLAHE`,description:`Locally equalises contrast in tiles to enhance local detail`,factory:()=>new Fe}],BLUR:[{type:`boxblur`,label:`BOX BLUR`,description:`Applies a uniform average blur over a square kernel`,factory:()=>new Je},{type:`gaussblur`,label:`GAUSS BLUR`,description:`Applies a Gaussian-weighted blur with configurable sigma`,factory:()=>new Ye},{type:`motionblur`,label:`MOTION BLUR`,description:`Blurs along a directional angle to simulate camera or object motion`,factory:()=>new Xe},{type:`radialblur`,label:`RADIAL BLUR`,description:`Blurs outward from a centre point to simulate zoom or rotation`,factory:()=>new Ze},{type:`median`,label:`MEDIAN`,description:`Replaces each pixel with the median of its neighbourhood, removing noise`,factory:()=>new Qe},{type:`bilateral`,label:`BILATERAL`,description:`Edge-preserving blur that smooths flat regions while keeping boundaries`,factory:()=>new $e}],SHARPEN:[{type:`unsharpmask`,label:`UNSHARP MASK`,description:`Sharpens by subtracting a blurred version from the original`,factory:()=>new ot}],TRANSFORM:[{type:`affine`,label:`AFFINE XFORM`,description:`Applies rotation, scale, and translation via an inverse affine remap about a configurable pivot`,factory:()=>new st}],WARP:[{type:`flowfield`,label:`FLOW FIELD`,description:`Displaces pixels along a Perlin noise flow field for fluid distortion`,factory:()=>new _t},{type:`bandshift`,label:`BAND SHIFT`,description:`Offsets horizontal or vertical bands by a noise or sine pattern`,factory:()=>new bt},{type:`advection`,label:`ADVECTION`,description:`Iteratively advects pixels along a velocity field for smearing effects`,factory:()=>new St}],REFRACTION:[{type:`ripple`,label:`RADIAL RIPPLE`,description:`Displaces pixels along concentric ripples from a centre point`,factory:()=>new Ct},{type:`lensbubbles`,label:`LENS BUBBLES`,description:`Places refraction bubbles that magnify regions beneath them`,factory:()=>new wt}],DISTORTION:[{type:`pixelate`,label:`PIXELATE`,description:`Reduces image to large square pixels by averaging block regions`,factory:()=>new jt},{type:`polarcoords`,label:`POLAR COORDS`,description:`Converts between rectangular and polar coordinate spaces`,factory:()=>new Mt},{type:`spherize`,label:`SPHERIZE`,description:`Wraps the image onto a spherical surface to create a globe effect`,factory:()=>new Nt},{type:`twirl`,label:`TWIRL`,description:`Rotates pixels around a centre point by an amount tied to radius`,factory:()=>new Pt},{type:`chromaticab`,label:`CHROMATIC AB`,description:`Laterally offsets RGB channels to simulate lens chromatic aberration`,factory:()=>new Rt}],ACCUMULATION:[{type:`iterrewarp`,label:`ITER REWARP`,description:`Repeatedly warps and resamples to accumulate painterly smear trails`,factory:()=>new Bt}],"LINE RENDER":[{type:`lumflow`,label:`LUMINANCE FLOW`,description:`Draws contour lines that follow luminance gradients across the image`,factory:()=>new Qt,vector:!0},{type:`serpentine`,label:`SERPENTINE`,description:`Fills the image with a single continuous serpentine line modulated by luminance`,factory:()=>new tn,vector:!0},{type:`statichalftone`,label:`STATIC HALFTONE`,description:`Renders the image as a grid of lines whose weight varies with brightness`,factory:()=>new on,vector:!0},{type:`moduleflowlines`,label:`FLOW LINES`,description:`Traces flow lines through a gradient field derived from source image structure`,factory:()=>new un,vector:!0}],EDGE:[{type:`sobel`,label:`SOBEL EDGE`,description:`Detects edges using the Sobel gradient operator on luminance`,factory:()=>new jr},{type:`canny`,label:`CANNY EDGE`,description:`Multi-stage edge detector with noise suppression and hysteresis`,factory:()=>new Mr},{type:`laplacian`,label:`LAPLACIAN`,description:`Detects edges at zero-crossings of the Laplacian of luminance`,factory:()=>new Fr},{type:`dog`,label:`DIFF OF GAUSS`,description:`Subtracts two Gaussian blurs to isolate edges at a specific scale`,factory:()=>new Ir},{type:`contour`,label:`CONTOUR`,description:`Draws isolines at equal luminance intervals like a topographic map`,factory:()=>new Ja}],PATTERN:[{type:`truchet`,label:`TRUCHET`,description:`Renders a Truchet tile pattern with luminance-driven tile selection`,factory:()=>new ii},{type:`grating`,label:`GRATING`,description:`Overlays a linear, radial, or spiral interference grating`,factory:()=>new ui},{type:`moire`,label:`MOIRE`,description:`Generates moiré interference patterns from two overlapping grids`,factory:()=>new _i},{type:`halftonepattern`,label:`HALFTONE DOT`,description:`Renders a dot halftone pattern where dot size maps to luminance`,factory:()=>new yi}],NOISE:[{type:`perlinoverlay`,label:`NOISE FIELD`,description:`Overlays multi-octave Perlin noise onto the image at variable opacity`,factory:()=>new Ai},{type:`domainwarp`,label:`DOMAIN WARP`,description:`Warps noise lookup coordinates to produce folded, organic shapes`,factory:()=>new Ni}],PHYSICS:[{type:`reactiondiffusion`,label:`REACT-DIFFUSE`,description:`Simulates Gray-Scott reaction-diffusion to grow organic spot patterns`,factory:()=>new Vi},{type:`wavedistortion`,label:`WAVE DISTORT`,description:`Displaces pixels using a sine-wave field with configurable frequency`,factory:()=>new ta},{type:`cellularautomata`,label:`CELL AUTOMATA`,description:`Evolves a cellular automaton over the image to create texture growth`,factory:()=>new ha}],GENERATIVE:[{type:`paintstroke`,label:`PAINT STROKE`,description:`Renders the image as overlapping brushstrokes distributed by luminance`,factory:()=>new Tn},{type:`sdfshape`,label:`SDF SHAPE`,description:`Composites a signed-distance-field shape mask over the image`,factory:()=>new Ya}],COMPOSITE:[{type:`tileblend`,label:`TILE BLEND`,description:`Blends tiled copies of the image offset by varying amounts`,factory:()=>new Mn},{type:`stipple`,label:`STIPPLE`,description:`Renders the image as a field of dots whose density maps to brightness`,factory:()=>new $n},{type:`mosaic`,label:`MOSAIC`,description:`Multi-topology tessellation: Delaunay or Voronoi mosaic with image-aware density seeding`,factory:()=>new br}],TEXTURE:[{type:`filmgrain`,label:`FILM GRAIN`,description:`Adds luminance-responsive grain simulating film emulsion noise`,factory:()=>new Aa},{type:`vignette`,label:`VIGNETTE`,description:`Darkens image edges with a configurable oval falloff from the centre`,factory:()=>new Ma},{type:`scanlines`,label:`SCANLINES`,description:`Overlays horizontal scanlines to simulate CRT or print screen effects`,factory:()=>new Pa}],MORPHOLOGY:[{type:`dilateerode`,label:`DILATE/ERODE`,description:`Expands (dilates) or shrinks (erodes) bright regions using a shaped kernel`,factory:()=>new Wa},{type:`openclose`,label:`OPEN/CLOSE`,description:`Removes noise speckles (open) or fills small gaps (close) in bright areas`,factory:()=>new Ga}],SEGMENTATION:[{type:`otsuthreshold`,label:`OTSU THRESH`,description:`Automatically thresholds to binary using Otsu variance maximisation`,factory:()=>new qa}],OPTICS:[{type:`interference`,label:`INTERFERENCE`,description:`Generates thin-film interference colour patterns from luminance`,factory:()=>new Za}]},$=new t,$a=new P($),eo=Object.values(Qa).flat();self.postMessage({type:`ready`});function to(e){let t=[];for(let n of e){let e=eo.find(e=>e.type===n.type);if(!e)continue;let r=e.factory();r.enabled=n.enabled,r.opacity=n.opacity,r.blendMode=n.blendMode??`normal`;for(let e in n.params)e in r.params&&(r.params[e]=n.params[e]);n.mask&&(r.mask.enabled=!!n.mask.enabled,r.mask.source=n.mask.source??`none`,r.mask.invert=!!n.mask.invert,r.mask.feather=n.mask.feather??0),n.modulation&&(r.modulation={...n.modulation}),t.push(r)}return t}function no(e){$.sourceW=e.sourceW,$.sourceH=e.sourceH,$.quality=e.quality,$.previewScale=e.previewScale,$._preScaled=!!e.preScaled,$.globalSeed=e.globalSeed,$.soloNodeId=e.soloNodeId??null,$.currentFrame=e.frame??0,$.frameCount=e.frameCount??1,$.needsRender=!0,$.rendering=!1}self.onmessage=function(e){let t=e.data;if(t.type===`render`){try{$.sourcePixels=new Uint8ClampedArray(t.sourcePixels),no(t),$.stack=to(t.stack);for(let e of $.stack)e._cacheValid=!1;let e=$a.render();if(e){let n=e.pixels.buffer;self.postMessage({type:`result`,renderId:t.renderId,pixels:n,width:e.width,height:e.height,renderTime:$.lastRenderTime},[n])}}catch(e){self.postMessage({type:`error`,renderId:t.renderId,message:String(e)})}return}if(t.type===`sequence`){let e=t.frames.map(e=>new Uint8ClampedArray(e));no(t),$.stack=to(t.stack),$.frameCount=e.length;let n=[];for(let t=0;t<e.length;t++){$.sourcePixels=e[t],$.currentFrame=t;for(let e of $.stack)e._cacheValid=!1;$.needsRender=!0,$.rendering=!1;let r=$a.render();r&&(n.push(r.pixels.buffer),self.postMessage({type:`sequenceProgress`,frame:t,total:e.length}))}let r=n;self.postMessage({type:`sequenceDone`,renderId:t.renderId,frames:n,width:Math.max(1,Math.round($.sourceW*$.previewScale)),height:Math.max(1,Math.round($.sourceH*$.previewScale))},r);return}}})();