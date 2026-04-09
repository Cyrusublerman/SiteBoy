var e=class{constructor(e,t={}){this.container=e,this.deps=t,this.componentInstances=[],this.eventHandlers=new CleanupManager.EventHandlerRegistry,this.intervals=new CleanupManager.IntervalRegistry,this.bodyElements=new CleanupManager.BodyElementRegistry,this.state={startTime:Date.now(),mouseDistance:0,lastMouseX:0,lastMouseY:0,clickCount:0,keystrokeCount:0,maxScroll:0,lastActivityTime:Date.now(),keystrokeTimes:[],scrollEvents:[],timeline:[]},this.data={network:{},system:{},display:{},power:{},locale:{},browser:{},media:{},session:{},behavior:{},fingerprints:{}},this.heatmapCanvas=null,this.heatmapCtx=null}render(){this.destroy();let e=this.deps.MF?this.deps.MF.F:12;this.container.classList.add(`tool-viewport`),this.collectAllData(),this.startTracking();let t=document.createElement(`div`);t.style.cssText=`
            width: 100%;
            height: 100%;
            overflow-y: auto;
            cursor: crosshair;
        `;let n=new ComponentLibrary.Heading({level:1,content:`ABOUT YOU`},{MF:this.deps.MF});this.componentInstances.push(n),t.appendChild(n.render());let r=document.createElement(`div`);r.style.cssText=`
            color: var(--vga-gray);
            font-size: ${e}px;
            margin-bottom: ${e*2}px;
            text-transform: uppercase;
        `,r.innerHTML=`Real-time data collection and behavioral analysis — <span class="collecting" style="color: var(--vga-red); animation: pulse 1.5s infinite;">ACTIVE</span>`,t.appendChild(r);let i=document.createElement(`style`);i.textContent=`
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
        `,t.appendChild(i),t.appendChild(this.createStatsBox(e)),t.appendChild(this.createNetworkSection(e)),t.appendChild(this.createSystemSection(e)),t.appendChild(this.createDisplaySection(e)),t.appendChild(this.createBehaviorSection(e)),t.appendChild(this.createFingerprintsSection(e)),t.appendChild(this.createTimelineSection(e)),t.appendChild(this.createOSINTSection(e)),t.appendChild(this.createWarningSection(e)),this.container.appendChild(t),this.setupHeatmap(),console.log(`🔍 About You tool rendered - tracking active`)}createStatsBox(e){let t=document.createElement(`div`);return t.style.cssText=`
            background: var(--vga-black);
            border: 1px solid var(--vga-gray);
            padding: ${e}px;
            margin-bottom: ${e*2}px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(${e*16}px, 1fr));
            gap: ${e}px;
        `,[{id:`time-elapsed`,label:`Seconds on Page`,value:`0`},{id:`mouse-distance`,label:`Mouse Distance (px)`,value:`0`},{id:`click-count`,label:`Clicks Detected`,value:`0`},{id:`scroll-depth`,label:`Scroll Depth (%)`,value:`0`},{id:`keystroke-count`,label:`Keystrokes`,value:`0`}].forEach(n=>{let r=document.createElement(`div`);r.style.cssText=`
                text-align: center;
                border: 1px solid var(--vga-gray);
                padding: ${e}px;
            `,r.innerHTML=`
                <div id="${n.id}" style="font-size: ${e*2}px; font-weight: 700; color: var(--vga-lime); font-family: monospace;">${n.value}</div>
                <div style="color: var(--vga-gray); font-size: ${e*.85}px; margin-top: ${e/2}px; text-transform: uppercase;">${n.label}</div>
            `,t.appendChild(r)}),t}createNetworkSection(e){return this.createDataSection(e,`NETWORK IDENTITY`,[{label:`PUBLIC IP ADDRESS`,id:`ip`,value:`Detecting...`},{label:`GEOLOCATION (FROM IP)`,id:`location`,value:`Detecting...`},{label:`ISP/ORGANIZATION`,id:`isp`,value:`Detecting...`},{label:`AUTONOMOUS SYSTEM`,id:`asn`,value:`Detecting...`},{label:`COUNTRY CODE`,id:`country`,value:`Detecting...`},{label:`CONNECTION TYPE`,id:`connection`,value:this.getConnectionInfo()}])}createSystemSection(e){let t=navigator.userAgent,n=this.detectOS(t),r=this.detectBrowser(t);return this.createDataSection(e,`SYSTEM FINGERPRINT`,[{label:`OPERATING SYSTEM`,id:`os`,value:n.os},{label:`OS VERSION`,id:`os-version`,value:n.version},{label:`BROWSER`,id:`browser`,value:r.name},{label:`BROWSER VERSION`,id:`browser-version`,value:r.version},{label:`USER AGENT`,id:`ua`,value:t},{label:`PLATFORM`,id:`platform`,value:navigator.platform},{label:`CPU CORES`,id:`cpu-cores`,value:navigator.hardwareConcurrency||`Unknown`},{label:`DEVICE MEMORY`,id:`memory`,value:navigator.deviceMemory?`${navigator.deviceMemory} GB`:`Not available`}])}createDisplaySection(e){return this.createDataSection(e,`DISPLAY CONFIGURATION`,[{label:`SCREEN RESOLUTION`,id:`screen-res`,value:`${screen.width} × ${screen.height}`},{label:`WINDOW SIZE`,id:`window-size`,value:`${window.innerWidth} × ${window.innerHeight}`,live:!0},{label:`COLOR DEPTH`,id:`color-depth`,value:`${screen.colorDepth}-bit`},{label:`PIXEL RATIO`,id:`pixel-ratio`,value:window.devicePixelRatio},{label:`ORIENTATION`,id:`orientation`,value:this.getOrientation(),live:!0}])}createBehaviorSection(e){let t=document.createElement(`div`);t.style.cssText=`margin-bottom: ${e*3}px;`;let n=new ComponentLibrary.Heading({level:2,content:`BEHAVIORAL ANALYSIS`},{MF:this.deps.MF});this.componentInstances.push(n),t.appendChild(n.render());let r=document.createElement(`div`);r.style.cssText=`
            background: var(--vga-black);
            border: 1px solid var(--vga-gray);
            padding: ${e}px;
            margin-bottom: ${e}px;
        `;let i=document.createElement(`h3`);i.textContent=`MOUSE MOVEMENT HEATMAP`,i.style.cssText=`
            font-size: ${e}px;
            margin-bottom: ${e}px;
            color: var(--vga-aqua);
            text-transform: uppercase;
        `,r.appendChild(i);let a=document.createElement(`canvas`);a.id=`mouse-canvas`,a.width=800,a.height=200,a.style.cssText=`
            border: 1px solid var(--vga-gray);
            width: 100%;
            height: 200px;
        `,r.appendChild(a),t.appendChild(r);let o=a.getContext(`2d`);o.fillStyle=`#000`,o.fillRect(0,0,a.width,a.height),this.mouseCanvas=a,this.mouseCtx=o;let s=this.createDataSection(e,``,[{label:`MOUSE POSITION`,id:`mouse-pos`,value:`—`,live:!0},{label:`MOUSE VELOCITY`,id:`mouse-velocity`,value:`—`,live:!0},{label:`IDLE TIME`,id:`idle-time`,value:`0s`,live:!0},{label:`AVERAGE TYPING SPEED`,id:`typing-speed`,value:`Not measured yet`},{label:`READING PATTERN`,id:`reading-pattern`,value:`Analyzing...`}]);return t.appendChild(s),t}createFingerprintsSection(e){let t=document.createElement(`div`);t.style.cssText=`margin-bottom: ${e*3}px;`;let n=new ComponentLibrary.Heading({level:2,content:`UNIQUE IDENTIFIERS`},{MF:this.deps.MF});return this.componentInstances.push(n),t.appendChild(n.render()),[{label:`BROWSER FINGERPRINT HASH`,id:`fingerprint`,value:`Calculating...`},{label:`CANVAS FINGERPRINT HASH`,id:`canvas-hash`,value:`Calculating...`},{label:`WEBGL FINGERPRINT HASH`,id:`webgl-hash`,value:`Calculating...`}].forEach(n=>{let r=document.createElement(`div`);r.style.cssText=`
                background: var(--vga-black);
                border: 1px solid var(--vga-gray);
                padding: ${e}px;
                margin-bottom: ${e}px;
                font-family: monospace;
                word-break: break-all;
                color: var(--vga-aqua);
            `,r.innerHTML=`<strong style="color: var(--vga-white);">${n.label}:</strong><br><span id="${n.id}">${n.value}</span>`,t.appendChild(r)}),this.generateFingerprints(),t}createTimelineSection(e){let t=document.createElement(`div`);t.style.cssText=`margin-bottom: ${e*3}px;`;let n=new ComponentLibrary.Heading({level:2,content:`ACTIVITY TIMELINE`},{MF:this.deps.MF});this.componentInstances.push(n),t.appendChild(n.render());let r=document.createElement(`div`);return r.id=`timeline`,r.style.cssText=`
            background: var(--vga-black);
            border: 1px solid var(--vga-gray);
            padding: ${e}px;
            max-height: ${e*16}px;
            overflow-y: auto;
            font-size: ${e*.85}px;
            font-family: monospace;
        `,t.appendChild(r),t}createOSINTSection(e){let t=document.createElement(`div`);t.style.cssText=`margin-bottom: ${e*3}px;`;let n=new ComponentLibrary.Heading({level:2,content:`CROSS-REFERENCE INTELLIGENCE`},{MF:this.deps.MF});this.componentInstances.push(n),t.appendChild(n.render());let r=new ComponentLibrary.Paragraph({content:`With the data collected above, here's what additional profiling is possible:`},{MF:this.deps.MF});return this.componentInstances.push(r),t.appendChild(r.render()),t.appendChild(this.createDataSection(e,`IP ADDRESS ANALYSIS`,[{label:`ENHANCED GEOLOCATION APIS`,value:`IPApi.co, InfoSniper, IP2Location, MaxMind`},{label:`ISP CUSTOMER DATA LINKING`,value:`If IP in breach database → Possible email match`},{label:`REVERSE DNS ANALYSIS`,value:`PTR records may reveal company/organization`}])),t.appendChild(this.createDataSection(e,`IDENTITY DISCOVERY CHAIN`,[{label:`STAGE 1: FINGERPRINT → COOKIE ID`,value:`Your unique hash stored by ad networks`},{label:`STAGE 2: COOKIE ID → EMAIL`,value:`Login to any service = email linked to fingerprint`},{label:`STAGE 3: EMAIL → BREACH DATABASES`,value:`HaveIBeenPwned, DeHashed, leaked password dumps`},{label:`STAGE 4: EMAIL → USERNAME SEARCH`,value:`Holehe checks 120+ sites for account existence`},{label:`STAGE 5: USERNAME → SOCIAL PROFILES`,value:`Sherlock searches 300+ platforms for matching usernames`}])),t}createWarningSection(e){let t=document.createElement(`div`);return t.style.cssText=`
            background: var(--vga-maroon);
            border: 1px solid var(--vga-red);
            padding: ${e}px;
            margin-bottom: ${e*2}px;
            color: var(--vga-white);
        `,t.innerHTML=`
            <strong>WHAT THIS DEMONSTRATES:</strong><br><br>
            Every data point on this page was collected without asking permission. This is standard practice for most websites you visit. The information above can be combined to:<br><br>
            • Create a unique fingerprint that tracks you across sites<br>
            • Build behavioral profiles for ad targeting<br>
            • Link your anonymous browsing to your real identity through login events<br>
            • Search your email in breach databases for usernames and passwords<br>
            • Find all your social media profiles using username enumeration<br>
            • Infer personal information (work hours, location patterns, interests)<br>
            • Sell your complete profile to data brokers and advertisers<br>
            • Track you even when using "private" browsing mode<br><br>
            <strong>THE REALITY:</strong> While this page shows what's collected, companies like Google and Facebook have the databases to actually perform the cross-referencing shown above. Every time you log into a site with their tracking code, your anonymous fingerprint becomes permanently linked to your identity.
        `,t}createDataSection(e,t,n){let r=document.createElement(`div`);if(r.style.cssText=`margin-bottom: ${e*3}px;`,t){let e=new ComponentLibrary.Heading({level:2,content:t},{MF:this.deps.MF});this.componentInstances.push(e),r.appendChild(e.render())}let i=document.createElement(`div`);return i.style.cssText=`
            display: grid;
            grid-template-columns: ${e*20}px 1fr;
            gap: ${e/2}px ${e}px;
            font-size: ${e*.95}px;
            margin-bottom: ${e}px;
        `,n.forEach(e=>{let t=document.createElement(`div`);t.style.cssText=`
                color: var(--vga-gray);
                font-weight: 700;
                text-transform: uppercase;
            `,t.textContent=e.label;let n=document.createElement(`div`);n.style.cssText=`
                color: ${e.live?`var(--vga-lime)`:`var(--vga-silver)`};
                word-break: break-word;
                font-family: monospace;
            `,n.id=e.id||``,n.textContent=e.value,i.appendChild(t),i.appendChild(n)}),r.appendChild(i),r}collectAllData(){this.collectNetworkData(),this.logActivity(`Page loaded - data collection initiated`)}collectNetworkData(){fetch(`https://ipapi.co/json/`).then(e=>e.json()).then(e=>{this.updateElement(`ip`,e.ip||`Unknown`),this.updateElement(`location`,`${e.city}, ${e.region}, ${e.country_name}`),this.updateElement(`isp`,e.org||`Unknown`),this.updateElement(`asn`,e.asn||`Unknown`),this.updateElement(`country`,e.country||`Unknown`),this.logActivity(`IP geolocation: ${e.city}, ${e.country_name}`)}).catch(()=>{this.updateElement(`ip`,`Unable to detect`)})}startTracking(){this.eventHandlers.add(document,`mousemove`,e=>this.handleMouseMove(e)),this.eventHandlers.add(document,`click`,()=>this.handleClick()),this.eventHandlers.add(document,`keydown`,()=>this.handleKeydown()),this.eventHandlers.add(document,`scroll`,()=>this.handleScroll()),this.intervals.add(()=>this.updateLiveStats(),100)}handleMouseMove(e){if(this.state.lastActivityTime=Date.now(),this.state.lastMouseX!==0&&this.state.lastMouseY!==0){let t=e.clientX-this.state.lastMouseX,n=e.clientY-this.state.lastMouseY,r=Math.sqrt(t*t+n*n);this.state.mouseDistance+=r}if(this.state.lastMouseX=e.clientX,this.state.lastMouseY=e.clientY,this.updateElement(`mouse-pos`,`${e.clientX}, ${e.clientY}`),this.mouseCtx&&this.mouseCanvas){let t=this.mouseCanvas.width/window.innerWidth,n=this.mouseCanvas.height/window.innerHeight;this.mouseCtx.fillStyle=`rgba(0, 255, 0, 0.3)`,this.mouseCtx.fillRect(e.clientX*t,e.clientY*n,2,2)}}handleClick(){this.state.clickCount++,this.state.lastActivityTime=Date.now(),this.logActivity(`Click detected at (${this.state.lastMouseX}, ${this.state.lastMouseY})`)}handleKeydown(){if(this.state.keystrokeCount++,this.state.lastActivityTime=Date.now(),this.state.keystrokeTimes.push(Date.now()),this.state.keystrokeTimes.length>=10){let e=this.state.keystrokeTimes.slice(-10),t=[];for(let n=1;n<e.length;n++)t.push(e[n]-e[n-1]);let n=t.reduce((e,t)=>e+t,0)/t.length,r=Math.floor(6e4/(n*5));this.updateElement(`typing-speed`,r+` WPM`)}}handleScroll(){this.state.lastActivityTime=Date.now();let e=window.scrollY,t=e/(document.documentElement.scrollHeight-window.innerHeight)*100;if(this.state.maxScroll=Math.max(this.state.maxScroll,t),this.state.scrollEvents.push({time:Date.now(),position:e}),this.state.scrollEvents.length>20){this.state.scrollEvents=this.state.scrollEvents.slice(-20);let e=[];for(let t=1;t<this.state.scrollEvents.length;t++){let n=this.state.scrollEvents[t].time-this.state.scrollEvents[t-1].time,r=Math.abs(this.state.scrollEvents[t].position-this.state.scrollEvents[t-1].position);e.push(r/n)}let t=e.reduce((e,t)=>e+t,0)/e.length,n=t>2?`Scanning`:t>.5?`Reading`:`Slow/Careful`;this.updateElement(`reading-pattern`,n)}}updateLiveStats(){let e=Math.floor((Date.now()-this.state.startTime)/1e3);this.updateElement(`time-elapsed`,e),this.updateElement(`mouse-distance`,Math.floor(this.state.mouseDistance)),this.updateElement(`click-count`,this.state.clickCount),this.updateElement(`keystroke-count`,this.state.keystrokeCount);let t=Math.min(100,Math.floor(this.state.maxScroll));this.updateElement(`scroll-depth`,t);let n=Math.floor((Date.now()-this.state.lastActivityTime)/1e3);this.updateElement(`idle-time`,n+`s`)}setupHeatmap(){let e=document.createElement(`canvas`);e.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 9999;
        `,e.width=window.innerWidth,e.height=window.innerHeight,this.bodyElements.add(e),this.heatmapCanvas=e,this.heatmapCtx=e.getContext(`2d`),this.eventHandlers.add(document,`mousemove`,e=>{this.heatmapCtx&&(this.heatmapCtx.fillStyle=`rgba(0, 255, 0, 0.1)`,this.heatmapCtx.beginPath(),this.heatmapCtx.arc(e.clientX,e.clientY,20,0,Math.PI*2),this.heatmapCtx.fill())})}async generateFingerprints(){let e=document.createElement(`canvas`),t=e.getContext(`2d`);e.width=200,e.height=50,t.textBaseline=`top`,t.font=`14px Arial`,t.fillStyle=`#f60`,t.fillRect(125,1,62,20),t.fillStyle=`#069`,t.fillText(`abcdefghijklmnopqrstuvwxyz`,2,15);let n=e.toDataURL(),r=await this.hashData(n);this.updateElement(`canvas-hash`,r);let i=[navigator.userAgent,screen.width,screen.height,screen.colorDepth,window.devicePixelRatio,navigator.hardwareConcurrency,navigator.language,new Date().getTimezoneOffset()],a=await this.hashData(i.join(`|||`));this.updateElement(`fingerprint`,a);let o=e.getContext(`webgl`);if(o){let e=o.getExtension(`WEBGL_debug_renderer_info`);if(e){let t=o.getParameter(e.UNMASKED_VENDOR_WEBGL),n=o.getParameter(e.UNMASKED_RENDERER_WEBGL),r=await this.hashData(t+n);this.updateElement(`webgl-hash`,r)}}}async hashData(e){let t=new TextEncoder().encode(e),n=await crypto.subtle.digest(`SHA-256`,t);return Array.from(new Uint8Array(n)).map(e=>e.toString(16).padStart(2,`0`)).join(``)}logActivity(e){let t=document.getElementById(`timeline`);if(!t)return;let n=document.createElement(`div`);n.style.cssText=`
            padding: 5px 0;
            border-bottom: 1px solid var(--vga-gray);
            color: var(--vga-silver);
        `;let r=new Date;n.innerHTML=`<span style="color: var(--vga-lime); margin-right: 10px;">${`${r.getHours().toString().padStart(2,`0`)}:${r.getMinutes().toString().padStart(2,`0`)}:${r.getSeconds().toString().padStart(2,`0`)}.${r.getMilliseconds().toString().padStart(3,`0`)}`}</span>${e}`,t.insertBefore(n,t.firstChild)}detectOS(e){let t=`Unknown`,n=`Unknown`;if(e.includes(`Windows NT 10`))t=`Windows`,n=`10/11`;else if(e.includes(`Mac OS X`)){t=`macOS`;let r=e.match(/Mac OS X ([\d_]+)/);n=r?r[1].replace(/_/g,`.`):`Unknown`}else if(e.includes(`Android`)){t=`Android`;let r=e.match(/Android ([\d.]+)/);n=r?r[1]:`Unknown`}else e.includes(`Linux`)&&(t=`Linux`);return{os:t,version:n}}detectBrowser(e){let t=`Unknown`,n=`Unknown`;if(e.includes(`Edg/`)){t=`Edge`;let r=e.match(/Edg\/([\d.]+)/);n=r?r[1]:`Unknown`}else if(e.includes(`Chrome/`)){t=`Chrome`;let r=e.match(/Chrome\/([\d.]+)/);n=r?r[1]:`Unknown`}else if(e.includes(`Firefox/`)){t=`Firefox`;let r=e.match(/Firefox\/([\d.]+)/);n=r?r[1]:`Unknown`}else if(e.includes(`Safari/`)){t=`Safari`;let r=e.match(/Version\/([\d.]+)/);n=r?r[1]:`Unknown`}return{name:t,version:n}}getConnectionInfo(){let e=navigator.connection||navigator.mozConnection||navigator.webkitConnection;return e?`${e.effectiveType||`Unknown`} (${e.downlink||`?`} Mbps)`:`Unknown`}getOrientation(){return screen.orientation?.type||(window.innerHeight>window.innerWidth?`portrait`:`landscape`)}updateElement(e,t){let n=document.getElementById(e);n&&(n.textContent=t)}destroy(){console.log(`🧹 Cleaning up About You tool...`),CleanupManager.cleanupTool(this),this.heatmapCanvas=null,this.heatmapCtx=null,this.container&&this.container.classList.remove(`tool-viewport`),console.log(`✅ About You tool cleaned up - all tracking stopped`)}};typeof window<`u`&&(window.AboutYouTool=e,console.log(`🔍 About You Tool v1.0.0 ready`));export{e as AboutYouTool,e as default};