import{t as e}from"./index-Ciw0oRof.js";import{t}from"./tool-base-uvZOXKmx.js";var n=`
// === FONT DATABASE ===
const FONT_NAMES = [
  "Bebas Neue", "Anton", "Archivo Black", "Black Ops One",
  "Monoton", "Bungee", "Bangers", "Creepster", "Nosifer",
  "Orbitron", "Audiowide", "Press Start 2P", "VT323",
  "Abril Fatface", "Playfair Display", "Ultra", "Yeseva One",
  "Permanent Marker", "Lobster", "Pacifico", "Kaushan Script",
  "Alfa Slab One", "Titan One", "Sigmar One", "Righteous",
  "Russo One", "Staatliches", "Teko", "Fjalla One", "Passion One",
  "Fredoka One", "Comfortaa", "Quicksand",
  "Metal Mania", "Rubik Mono One", "Cinzel",
  "Montserrat", "Poppins", "Raleway", "Space Grotesk", "Sora"
];

let fonts = [];
let fontQueue = [];
let currentData = null;
let nextData = null;
let gfx1, gfx2;
let thresholdShader;
let startTime;
let CONFIG = {};

// Vertex shader
const vertSrc = \`
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
void main() {
  vTexCoord = aTexCoord;
  vec4 pos = vec4(aPosition, 1.0);
  pos.xy = pos.xy * 2.0 - 1.0;
  gl_Position = pos;
}\`;

// Fragment shader - blur + threshold for gooey effect
const fragSrc = \`
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform float blurAmount;
uniform float threshold;
uniform float intensity;
uniform vec2 texelSize;

vec4 blur(sampler2D tex, vec2 uv, float amount) {
  vec4 sum = vec4(0.0);
  float total = 0.0;
  int samples = int(amount * 3.0) + 1;
  
  for(int x = -15; x <= 15; x++) {
    for(int y = -15; y <= 15; y++) {
      if(abs(float(x)) > amount || abs(float(y)) > amount) continue;
      float weight = exp(-(float(x*x + y*y)) / (2.0 * amount * amount + 0.001));
      sum += texture2D(tex, uv + vec2(float(x), float(y)) * texelSize) * weight;
      total += weight;
    }
  }
  return sum / total;
}

void main() {
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  
  // Get blurred samples from both textures
  vec4 c1 = blur(tex0, uv, blurAmount);
  vec4 c2 = blur(tex1, uv, blurAmount);
  
  // Blend based on intensity
  vec4 mixed = mix(c1, c2, intensity);
  
  // Threshold for gooey effect
  float alpha = mixed.a;
  alpha = smoothstep(threshold - 0.1, threshold + 0.1, alpha);
  
  gl_FragColor = vec4(mixed.rgb, alpha);
}\`;

function preload() {
  // Load Google Fonts via CSS
  const families = FONT_NAMES.map(f => f.replace(/ /g, '+')).join('|');
  const link = document.createElement("link");
  link.href = \`https://fonts.googleapis.com/css?family=\${families}:400,700,900&display=swap\`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

function setup() {
  createCanvas(CONFIG.canvasWidth, CONFIG.canvasHeight, WEBGL);
  pixelDensity(1);
  
  // Create offscreen graphics for text
  gfx1 = createGraphics(width, height);
  gfx2 = createGraphics(width, height);
  
  // Shuffle fonts
  shuffleArray(FONT_NAMES);
  fontQueue = [0, 1, 2];
  
  // Create shader
  thresholdShader = createShader(vertSrc, fragSrc);
  
  // Initial calculation
  currentData = calculateSizes(getFontName(0));
  nextData = calculateSizes(getFontName(1));
  
  // Draw initial text
  drawTextToGraphics(gfx1, currentData);
  drawTextToGraphics(gfx2, nextData);
  
  startTime = millis();
}

function getFontName(queueIdx) {
  return FONT_NAMES[fontQueue[queueIdx]];
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function advanceFont() {
  fontQueue.shift();
  let n;
  do { n = Math.floor(Math.random() * FONT_NAMES.length); } 
  while (fontQueue.includes(n));
  fontQueue.push(n);
}

function calculateSizes(fontName) {
  const tw = width * CONFIG.targetWidth;
  const mh = height * CONFIG.maxTotalHeight;
  const gap = height * CONFIG.lineGap;
  const baseSize = 300;
  
  let sizes = [];
  let heights = [];
  
  gfx1.textFont(fontName);
  gfx1.textSize(baseSize);
  gfx1.textStyle(BOLD);
  
  for (const line of CONFIG.lines) {
    const w = gfx1.textWidth(line);
    const s = baseSize * tw / w;
    sizes.push(s);
    
    gfx1.textSize(s);
    heights.push(gfx1.textAscent() + gfx1.textDescent());
  }
  
  const totalGap = gap * (CONFIG.lines.length - 1);
  const total = heights.reduce((a, b) => a + b) + totalGap;
  
  if (total > mh) {
    const sc = (mh - totalGap) / (total - totalGap);
    sizes = sizes.map(s => s * sc);
    heights = heights.map(h => h * sc);
  }
  
  return { fontName, sizes, heights };
}

function drawTextToGraphics(gfx, data) {
  const { fontName, sizes, heights } = data;
  const gap = height * CONFIG.lineGap;
  const total = heights.reduce((a, b) => a + b) + gap * (heights.length - 1);
  let y = (height - total) / 2;
  
  gfx.clear();
  gfx.fill(255);
  gfx.textAlign(CENTER, TOP);
  gfx.textStyle(BOLD);
  
  for (let i = 0; i < CONFIG.lines.length; i++) {
    gfx.textFont(fontName);
    gfx.textSize(sizes[i]);
    gfx.text(CONFIG.lines[i], width / 2, y);
    y += heights[i] + gap;
  }
}

function draw() {
  const elapsed = millis() - startTime;
  const t = min(elapsed / CONFIG.morphTime, 1);
  
  // Power curve for more time at edges
  const power = CONFIG.power;
  let morphT;
  if (t < 0.5) {
    morphT = Math.pow(t * 2, power) / 2;
  } else {
    morphT = 1 - Math.pow((1 - t) * 2, power) / 2;
  }
  
  // Remap to -0.1 to 1.0, clamp negatives
  const rawSine = Math.sin(morphT * Math.PI);
  const remapped = rawSine * 1.1 - 0.1;
  const intensity = Math.max(0, remapped);
  
  // Calculate blur from intensity
  const blurAmount = intensity * CONFIG.blurMax;
  
  // Threshold varies with blur
  const threshold = map(intensity, 0, 1, 0.5, 0.3);
  
  // Debug (if enabled)
  if (CONFIG.showDebug && document.getElementById('debug')) {
    document.getElementById('debug').textContent = 
      \`t:         \${t.toFixed(3)}\\n\` +
      \`morphT:    \${morphT.toFixed(3)}\\n\` +
      \`intensity: \${intensity.toFixed(3)}\\n\` +
      \`blur:      \${blurAmount.toFixed(1)}\\n\` +
      \`threshold: \${threshold.toFixed(2)}\`;
  }
  
  background(0);
  
  if (intensity === 0) {
    // Sharp - just draw the texture directly
    translate(-width/2, -height/2);
    if (morphT < 0.5) {
      image(gfx1, 0, 0);
    } else {
      image(gfx2, 0, 0);
    }
  } else {
    // Morphing - use shader
    shader(thresholdShader);
    thresholdShader.setUniform('tex0', gfx1);
    thresholdShader.setUniform('tex1', gfx2);
    thresholdShader.setUniform('blurAmount', blurAmount);
    thresholdShader.setUniform('threshold', threshold);
    thresholdShader.setUniform('intensity', morphT);
    thresholdShader.setUniform('texelSize', [1.0/width, 1.0/height]);
    
    rect(-width/2, -height/2, width, height);
    resetShader();
  }
  
  // Cycle complete
  if (t >= 1) {
    advanceFont();
    
    // Swap graphics and data
    [gfx1, gfx2] = [gfx2, gfx1];
    currentData = nextData;
    nextData = calculateSizes(getFontName(1));
    
    // Draw new next
    drawTextToGraphics(gfx2, nextData);
    
    startTime = millis();
  }
}

function windowResized() {
  resizeCanvas(CONFIG.canvasWidth, CONFIG.canvasHeight);
  gfx1.resizeCanvas(width, height);
  gfx2.resizeCanvas(width, height);
  
  currentData = calculateSizes(getFontName(0));
  nextData = calculateSizes(getFontName(1));
  
  drawTextToGraphics(gfx1, currentData);
  drawTextToGraphics(gfx2, nextData);
}
`,r={title:`DEFECATED`,animation:{type:`infinite`,loopFrames:0,defaultFps:60,canPrerender:!1},sidebar:[[`TEXT`,[[`Content`,[[`text`,`Line 1`,`HAVE YOU`,{key:`line1`}],[`text`,`Line 2`,`DEFECATED`,{key:`line2`}],[`text`,`Line 3`,`RECENTLY?`,{key:`line3`}]]],[`Layout`,[[`slider`,`Width`,.5,.95,.05,{key:`targetWidth`,value:.85,withNumber:!0}],[`slider`,`Height`,.5,.9,.05,{key:`maxHeight`,value:.75,withNumber:!0}],[`slider`,`Line Gap`,0,.02,.001,{key:`lineGap`,value:.005,withNumber:!0}]]]]],[`ANIMATION`,[[`Timing`,[[`slider`,`Morph Time (ms)`,800,3e3,100,{key:`morphTime`,value:1800,withNumber:!0}],[`slider`,`Power Curve`,2,10,1,{key:`power`,value:6,withNumber:!0}]]],[`Effects`,[[`slider`,`Blur Max`,5,40,1,{key:`blurMax`,value:24,withNumber:!0}]]],[`Display`,[[`toggle`,`Options`,[`Show Debug`],{key:`displayOptions`,selectedValues:[]}]]]]]],canvas:{width:800,height:600,modes:[`fit`,`fill`,`actual`]},onInit(e,t){window.debugLog(`TOOLS`,`Defecated tool initialized`),this.iframe=null,this.p5Config=this.buildP5Config(e),this.startSketch()},onUpdate(e,t,n,r){[`line1`,`line2`,`line3`,`targetWidth`,`maxHeight`,`lineGap`,`morphTime`,`power`,`blurMax`,`displayOptions`].includes(e)&&(this.p5Config=this.buildP5Config(n),this.restartSketch())},onDraw(e,t,n){(!this.iframe||!this.iframe.parentNode)&&(e.fillStyle=`#000000`,e.fillRect(0,0,t.width,t.height),e.fillStyle=`#FFFFFF`,e.font=`14px monospace`,e.textAlign=`center`,e.fillText(`Loading p5.js sketch...`,t.width/2,t.height/2))},buildP5Config(e){return{lines:[e.line1||`HAVE YOU`,e.line2||`DEFECATED`,e.line3||`RECENTLY?`],targetWidth:e.targetWidth||.85,maxTotalHeight:e.maxHeight||.75,lineGap:e.lineGap||.005,morphTime:e.morphTime||1800,power:e.power||6,blurMax:e.blurMax||24,showDebug:(e.displayOptions||[]).includes(`Show Debug`),canvasWidth:e.canvasWidth||800,canvasHeight:e.canvasHeight||600}},generateHTML(e){let t=JSON.stringify(e);return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Defecated</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { overflow: hidden; background: #000; }
    #debug {
      position: fixed;
      top: 10px;
      left: 10px;
      color: #0f0;
      font: 12px monospace;
      background: rgba(0,0,0,0.8);
      padding: 10px;
      z-index: 1000;
      white-space: pre;
      display: ${e.showDebug?`block`:`none`};
    }
  </style>
</head>
<body>
<div id="debug"></div>
<script>
CONFIG = ${t};
${n}
<\/script>
</body>
</html>`},startSketch(){this.iframe&&(this.iframe.remove(),this.iframe=null);let e=this.tool.canvasArea;if(!e){window.debugLog(`TOOLS`,`No canvas area found`);return}let t=this.tool.canvas;t&&(t.style.display=`none`),this.iframe=document.createElement(`iframe`),this.iframe.style.cssText=`
            width: ${this.p5Config.canvasWidth}px;
            height: ${this.p5Config.canvasHeight}px;
            border: 1px solid var(--c-border);
            background: #000000;
        `,this.iframe.sandbox=`allow-scripts allow-same-origin`,e.appendChild(this.iframe);let n=this.iframe.contentWindow.document;n.open(),n.write(this.generateHTML(this.p5Config)),n.close(),window.debugLog(`TOOLS`,`Defecated sketch started`)},restartSketch(){this.startSketch()},onDestroy(){this.iframe&&(this.iframe.remove(),this.iframe=null)}},i=class{constructor(t,n={}){this.container=t,this.deps={ComponentLibrary:e,...n},this.render()}render(){try{this.tool=new t(r,this.deps),this.tool.mount(this.container),window.debugLog(`TOOLS`,`✅ DefecatedTool rendered`)}catch(e){console.error(`❌ DefecatedTool error:`,e)}}destroy(){this.tool&&(this.tool.destroy(),this.tool=null)}};window.debugLog(`TOOLS`,`✅ DefecatedTool module loaded`);export{i as DefecatedTool,i as default,r as TOOL_CONFIG};