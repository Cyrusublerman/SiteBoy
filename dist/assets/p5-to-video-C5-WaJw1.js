import{t as e}from"./foundation-BEfhACXy.js";import{t,zn as n}from"./index-DcgRvGZg.js";import{t as r}from"./tool-base-C4lJ0gCM.js";import{t as i}from"./download-CayX61Ew.js";var a=class extends e{constructor(e,n={}){super({componentType:`p5-to-video`},n),this.container=e,this.deps={ComponentLibrary:t,...n},this.p5Code=this.getDefaultCode(),this.isRecording=!1,this.isProcessing=!1,this.ccaptureLoaded=!1,this.tool=null,this.previewFrame=null,this.recordingFrame=null,this.componentInstances=[],this.messageHandler=null,this.render()}getDefaultCode(){return`function setup() {
  createCanvas(256, 256);
}

function draw() {
  background(220);
  
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text('Input your code', width/2, height/2);
}`}render(){let e=new r({title:`P5.JS TO VIDEO`,sidebar:[[`CODE`,[[`Code Editor`,[[`text`,``,``,{key:`p5Code`,multiline:!0,placeholder:`Paste your P5.js code here...`,rows:15}]]],[`Preview Controls`,[[`button`,`▶ Run Preview`,null,{key:`btnRun`}],[`button`,`■ Stop Preview`,null,{key:`btnStop`}],[`dropdown`,`Display Mode`,[{value:`fit`,label:`Fit`},{value:`fill`,label:`Fill`},{value:`actual`,label:`Actual`}],{key:`displayMode`,value:`fit`}]]]]],[`EXPORT`,[[`Export Settings`,[[`slider`,`FPS`,1,60,1,{key:`fps`,value:30,withNumber:!0}],[`slider`,`Frames`,30,600,30,{key:`frames`,value:120,withNumber:!0}],[`dropdown`,`Format`,[{value:`webm`,label:`WebM Video (smaller, fast)`},{value:`gif`,label:`Animated GIF (compatible, larger)`},{value:`png`,label:`PNG Sequence (zip file)`}],{key:`format`,value:`webm`}],[`toggle`,`Options`,[`Silent Recording`],{key:`recordingOptions`,selectedValues:[`Silent Recording`]}]]],[`Recording`,[[`button`,`● Record & Download`,null,{key:`btnRecord`}],[`label`,`Status: Ready`,{key:`status`}]]]]]],canvas:{mode:`none`,width:500,height:500},onInit:e=>this._onInit(e),onUpdate:(e,t,n)=>this._onUpdate(e,t,n)},this.deps);return this.tool=e,e.mount(this.container),this.tool.setValue(`p5Code`,this.p5Code),this.loadExternalLibraries(),this.element}async loadExternalLibraries(){await n.ensureP5Loaded(),window.CCapture||(await this.loadScript(`https://unpkg.com/ccapture.js@1.1.0/build/CCapture.all.min.js`),this.ccaptureLoaded=!0,window.debugLog(`INIT`,`CCapture.js loaded`))}loadScript(e){return new Promise((t,n)=>{let r=document.createElement(`script`);r.src=e,r.onload=t,r.onerror=n,document.head.appendChild(r)})}_onInit(e){window.debugLog(`TOOLS`,`P5ToVideo: _onInit called`);let t=this.tool.getComponent(`btnRun`),n=this.tool.getComponent(`btnStop`),r=this.tool.getComponent(`btnRecord`);window.debugLog(`TOOLS`,`P5ToVideo: btnRun =`,t),window.debugLog(`TOOLS`,`P5ToVideo: btnRun.element =`,t?.element),t&&t.element?t.element.addEventListener(`click`,()=>{window.debugLog(`TOOLS`,`P5ToVideo: Run button clicked`),this.runPreview()}):console.error(`P5ToVideo: Run button not found or has no element`),n&&n.element&&n.element.addEventListener(`click`,()=>this.stopPreview()),r&&r.element&&r.element.addEventListener(`click`,()=>this.startRecording()),setTimeout(()=>{window.debugLog(`TOOLS`,`P5ToVideo: Running initial preview`),this.runPreview()},500)}updateStatus(e){let t=this.tool.getComponent(`status`);if(t&&t.element){let n=t.element.querySelector(`.text-content`)||t.element;n&&(n.textContent=`Status: ${e}`)}}_onUpdate(e,t,n){if(e===`p5Code`)this.p5Code=t;else if(e===`displayMode`){let e=t||`fit`;this.previewFrame&&this.previewFrame.setDisplayMode&&this.previewFrame.setDisplayMode(e)}}parseCanvasDimensions(e){let t=e.match(/createCanvas\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);return t?{width:parseInt(t[1],10),height:parseInt(t[2],10)}:{width:500,height:500}}runPreview(){let e=this.tool.getValues(),t=e.p5Code||this.p5Code,n=e.fps||30;window.debugLog(`TOOLS`,`P5ToVideo: Run preview clicked`),this.updateStatus(`Running preview...`),this.previewFrame&&(this.previewFrame.destroy(),this.previewFrame=null);let r=this.tool.canvasArea;if(!r){console.error(`P5ToVideo: Canvas area not found`);return}let{IframeSandbox:i}=this.deps.ComponentLibrary;if(!i){console.error(`P5ToVideo: IframeSandbox component not available in ComponentLibrary`),console.error(`Available components:`,Object.keys(this.deps.ComponentLibrary)),this.updateStatus(`Error: IframeSandbox not loaded`);return}window.debugLog(`TOOLS`,`P5ToVideo: Creating IframeSandbox`);let a=this.parseCanvasDimensions(t);window.debugLog(`TOOLS`,`P5ToVideo: Detected canvas size ${a.width}x${a.height}`),this.previewFrame=new i({width:a.width,height:a.height,className:`iframe-sandbox iframe-sandbox--500`,sandbox:`allow-scripts allow-same-origin`,displayMode:`fit`,enableZoom:!0,enablePan:!0},this.deps);let o=this.previewFrame.render();r.appendChild(o),this.componentInstances.push(this.previewFrame),window.debugLog(`TOOLS`,`P5ToVideo: Writing sketch to iframe`),this.previewFrame.setContent(this.generateIframeHTML(t,n,0,`webm`,`preview`)),setTimeout(()=>this.updateStatus(`Preview running`),500)}stopPreview(){this.previewFrame&&(this.previewFrame.destroy(),this.previewFrame=null),this.updateStatus(`Preview stopped`)}startRecording(){if(this.isRecording)return;let e=this.tool.getValues(),t=e.p5Code||this.p5Code,n=e.fps||30,r=e.frames||120,i=e.format||`webm`,a=(e.recordingOptions||[]).includes(`Silent Recording`);if(!this.ccaptureLoaded){this.updateStatus(`Error: CCapture.js not loaded`);return}if(i===`gif`&&r>180&&!confirm(`Warning: ${r} frames as GIF will create a large file (possibly >50MB). Continue?`)){this.updateStatus(`Cancelled`);return}this.isRecording=!0,this.isProcessing=!1,this.updateStatus(`Recording ${r} frames at ${n} FPS...`);let o=this.tool.getComponent(`btnRecord`);if(o&&o.element){o.element.disabled=!0;let e=o.element.textContent;o.element.textContent=`Recording...`,o.element.dataset.origText=e}this.previewFrame&&(this.previewFrame.destroy(),this.previewFrame=null),this.recordingFrame&&(this.recordingFrame.destroy(),this.recordingFrame=null);let s=this.tool.canvasArea;if(!s)return;let{IframeSandbox:c}=this.deps.ComponentLibrary;if(!c){console.error(`IframeSandbox component not available`);return}let l=a?`iframe-sandbox iframe-sandbox--500 iframe-sandbox--hidden`:`iframe-sandbox iframe-sandbox--500`,u=this.parseCanvasDimensions(t);this.recordingFrame=new c({width:u.width,height:u.height,className:l,sandbox:`allow-scripts allow-same-origin allow-downloads`,onMessage:e=>this.handleMessage(e),displayMode:a?`auto`:`fit`,enableZoom:!a,enablePan:!a},this.deps);let d=this.recordingFrame.render();s.appendChild(d),this.componentInstances.push(this.recordingFrame),this.recordingFrame.setContent(this.generateIframeHTML(t,n,r,i,`record`))}handleMessage(e){if(e.data.type===`VIDEO_READY`){let t=e.data.blob,n=e.data.format||`webm`;this.isRecording=!1,this.updateStatus(`Recording complete, preparing download...`),this.recordingFrame&&(this.recordingFrame.destroy(),this.recordingFrame=null);let r=this.tool.getComponent(`btnRecord`);if(r&&r.element){r.element.disabled=!1;let e=r.element.dataset.origText||`● Record & Download`;r.element.textContent=e}i(t,`animation.${{webm:`webm`,gif:`gif`,png:`tar`}[n]||`webm`}`),this.updateStatus(`Download started!`),setTimeout(()=>{this.updateStatus(`Ready`)},2e3)}}generateIframeHTML(e,t,n,r,i){return`
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/addons/p5.sound.min.js"><\/script>
  <script src="https://unpkg.com/ccapture.js@1.1.0/build/CCapture.all.min.js"><\/script>
  <style>
    body { 
      margin: 0; 
      overflow: hidden; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      background: #eeeeee; 
    }
  </style>
</head>
<body>
  <script>
    const MODE = "${i}";
    const FPS = ${t};
    const LIMIT = ${n};
    const FORMAT = "${r}";
    let capturer;
    let recording = false;

    // Initialize Recorder with appropriate format
    if (MODE === 'record') {
      const captureConfig = {
        format: FORMAT,
        framerate: FPS,
        verbose: false
      };
      
      // GIF-specific settings for better quality
      if (FORMAT === 'gif') {
        captureConfig.quality = 10; // Lower = better quality (0-100 scale inverted)
        captureConfig.workers = 4;
        captureConfig.workerScript = 'https://unpkg.com/ccapture.js@1.1.0/build/CCapture.all.min.js';
      }
      
      capturer = new CCapture(captureConfig);
    }

    // Monkey-patch Setup
    const _setup = window.setup;
    window.setup = function() {
      if(_setup) _setup();
      frameRate(FPS);
    }

    // Monkey-patch Draw
    const _draw = window.draw;
    window.draw = function() {
      // Start Recording on first frame
      if (MODE === 'record' && !recording) {
        capturer.start();
        recording = true;
        console.log("Capture Started");
      }

      if(_draw) _draw();

      // Handle Frame Capture
      if (MODE === 'record' && recording) {
        capturer.capture(document.querySelector('canvas'));
        
        // Check Limit
        if (frameCount >= LIMIT) {
          noLoop();
          capturer.stop();
          capturer.save( blob => {
            window.parent.postMessage({ type: 'VIDEO_READY', blob: blob, format: FORMAT }, '*');
          });
        }
      }
    }

    // --- User Code Injection ---
    ${e}
    // ---------------------------
  <\/script>
</body>
</html>
        `}destroy(){this.previewFrame&&(this.previewFrame.destroy(),this.previewFrame=null),this.recordingFrame&&(this.recordingFrame.destroy(),this.recordingFrame=null),this.tool&&(this.tool.destroy(),this.tool=null),super.destroy()}};window.debugLog(`INIT`,`✅ P5ToVideoTool loaded (ES Module)`);export{a as P5ToVideoTool,a as default};