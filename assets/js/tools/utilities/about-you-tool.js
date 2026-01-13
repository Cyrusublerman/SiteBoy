/**
 * About You Tool - SiteBoy Framework
 * 
 * Browser fingerprinting and tracking demonstration tool.
 * Shows everything a website can collect about a visitor.
 * 
 * @version 1.0.0
 * @dependencies ComponentLibrary
 */

class AboutYouTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        
        // Use CleanupManager for automatic resource tracking
        this.eventHandlers = new CleanupManager.EventHandlerRegistry();
        this.intervals = new CleanupManager.IntervalRegistry();
        this.bodyElements = new CleanupManager.BodyElementRegistry();
        
        // Tracking state
        this.state = {
            startTime: Date.now(),
            mouseDistance: 0,
            lastMouseX: 0,
            lastMouseY: 0,
            clickCount: 0,
            keystrokeCount: 0,
            maxScroll: 0,
            lastActivityTime: Date.now(),
            keystrokeTimes: [],
            scrollEvents: [],
            timeline: []
        };
        
        // Data collection results
        this.data = {
            network: {},
            system: {},
            display: {},
            power: {},
            locale: {},
            browser: {},
            media: {},
            session: {},
            behavior: {},
            fingerprints: {}
        };
        
        this.heatmapCanvas = null;
        this.heatmapCtx = null;
    }
    
    render() {
        this.destroy();
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        // Apply viewport constraints - AboutYouTool owns its container setup
        this.container.classList.add('tool-viewport');
        
        // Start data collection
        this.collectAllData();
        this.startTracking();
        
        // Main container
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            width: 100%;
            height: 100%;
            overflow-y: auto;
            cursor: crosshair;
        `;
        
        // Title
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'ABOUT YOU'
        }, { MF: this.deps.MF });
        this.componentInstances.push(title);
        wrapper.appendChild(title.render());
        
        // Subtitle with pulsing status
        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
            color: var(--vga-gray);
            font-size: ${F}px;
            margin-bottom: ${F * 2}px;
            text-transform: uppercase;
        `;
        subtitle.innerHTML = 'Real-time data collection and behavioral analysis — <span class="collecting" style="color: var(--vga-red); animation: pulse 1.5s infinite;">ACTIVE</span>';
        wrapper.appendChild(subtitle);
        
        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
        `;
        wrapper.appendChild(style);
        
        // Stats box
        wrapper.appendChild(this.createStatsBox(F));
        
        // Data sections
        wrapper.appendChild(this.createNetworkSection(F));
        wrapper.appendChild(this.createSystemSection(F));
        wrapper.appendChild(this.createDisplaySection(F));
        wrapper.appendChild(this.createBehaviorSection(F));
        wrapper.appendChild(this.createFingerprintsSection(F));
        wrapper.appendChild(this.createTimelineSection(F));
        wrapper.appendChild(this.createOSINTSection(F));
        wrapper.appendChild(this.createWarningSection(F));
        
        this.container.appendChild(wrapper);
        
        // Setup heatmap
        this.setupHeatmap();
        
        console.log('🔍 About You tool rendered - tracking active');
    }
    
    createStatsBox(F) {
        const box = document.createElement('div');
        box.style.cssText = `
            background: var(--vga-black);
            border: 1px solid var(--vga-gray);
            padding: ${F}px;
            margin-bottom: ${F * 2}px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(${F * 16}px, 1fr));
            gap: ${F}px;
        `;
        
        const stats = [
            { id: 'time-elapsed', label: 'Seconds on Page', value: '0' },
            { id: 'mouse-distance', label: 'Mouse Distance (px)', value: '0' },
            { id: 'click-count', label: 'Clicks Detected', value: '0' },
            { id: 'scroll-depth', label: 'Scroll Depth (%)', value: '0' },
            { id: 'keystroke-count', label: 'Keystrokes', value: '0' }
        ];
        
        stats.forEach(stat => {
            const statEl = document.createElement('div');
            statEl.style.cssText = `
                text-align: center;
                border: 1px solid var(--vga-gray);
                padding: ${F}px;
            `;
            statEl.innerHTML = `
                <div id="${stat.id}" style="font-size: ${F * 2}px; font-weight: 700; color: var(--vga-lime); font-family: monospace;">${stat.value}</div>
                <div style="color: var(--vga-gray); font-size: ${F * 0.85}px; margin-top: ${F / 2}px; text-transform: uppercase;">${stat.label}</div>
            `;
            box.appendChild(statEl);
        });
        
        return box;
    }
    
    createNetworkSection(F) {
        return this.createDataSection(F, 'NETWORK IDENTITY', [
            { label: 'PUBLIC IP ADDRESS', id: 'ip', value: 'Detecting...' },
            { label: 'GEOLOCATION (FROM IP)', id: 'location', value: 'Detecting...' },
            { label: 'ISP/ORGANIZATION', id: 'isp', value: 'Detecting...' },
            { label: 'AUTONOMOUS SYSTEM', id: 'asn', value: 'Detecting...' },
            { label: 'COUNTRY CODE', id: 'country', value: 'Detecting...' },
            { label: 'CONNECTION TYPE', id: 'connection', value: this.getConnectionInfo() }
        ]);
    }
    
    createSystemSection(F) {
        const ua = navigator.userAgent;
        const osInfo = this.detectOS(ua);
        const browserInfo = this.detectBrowser(ua);
        
        return this.createDataSection(F, 'SYSTEM FINGERPRINT', [
            { label: 'OPERATING SYSTEM', id: 'os', value: osInfo.os },
            { label: 'OS VERSION', id: 'os-version', value: osInfo.version },
            { label: 'BROWSER', id: 'browser', value: browserInfo.name },
            { label: 'BROWSER VERSION', id: 'browser-version', value: browserInfo.version },
            { label: 'USER AGENT', id: 'ua', value: ua },
            { label: 'PLATFORM', id: 'platform', value: navigator.platform },
            { label: 'CPU CORES', id: 'cpu-cores', value: navigator.hardwareConcurrency || 'Unknown' },
            { label: 'DEVICE MEMORY', id: 'memory', value: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Not available' }
        ]);
    }
    
    createDisplaySection(F) {
        return this.createDataSection(F, 'DISPLAY CONFIGURATION', [
            { label: 'SCREEN RESOLUTION', id: 'screen-res', value: `${screen.width} × ${screen.height}` },
            { label: 'WINDOW SIZE', id: 'window-size', value: `${window.innerWidth} × ${window.innerHeight}`, live: true },
            { label: 'COLOR DEPTH', id: 'color-depth', value: `${screen.colorDepth}-bit` },
            { label: 'PIXEL RATIO', id: 'pixel-ratio', value: window.devicePixelRatio },
            { label: 'ORIENTATION', id: 'orientation', value: this.getOrientation(), live: true }
        ]);
    }
    
    createBehaviorSection(F) {
        const section = document.createElement('div');
        section.style.cssText = `margin-bottom: ${F * 3}px;`;
        
        const heading = new ComponentLibrary.Heading({
            level: 2,
            content: 'BEHAVIORAL ANALYSIS'
        }, { MF: this.deps.MF });
        this.componentInstances.push(heading);
        section.appendChild(heading.render());
        
        // Mini heatmap canvas
        const canvasContainer = document.createElement('div');
        canvasContainer.style.cssText = `
            background: var(--vga-black);
            border: 1px solid var(--vga-gray);
            padding: ${F}px;
            margin-bottom: ${F}px;
        `;
        
        const canvasTitle = document.createElement('h3');
        canvasTitle.textContent = 'MOUSE MOVEMENT HEATMAP';
        canvasTitle.style.cssText = `
            font-size: ${F}px;
            margin-bottom: ${F}px;
            color: var(--vga-aqua);
            text-transform: uppercase;
        `;
        canvasContainer.appendChild(canvasTitle);
        
        const canvas = document.createElement('canvas');
        canvas.id = 'mouse-canvas';
        canvas.width = 800;
        canvas.height = 200;
        canvas.style.cssText = `
            border: 1px solid var(--vga-gray);
            width: 100%;
            height: 200px;
        `;
        canvasContainer.appendChild(canvas);
        section.appendChild(canvasContainer);
        
        // Initialize canvas
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.mouseCanvas = canvas;
        this.mouseCtx = ctx;
        
        // Behavior data grid
        const dataGrid = this.createDataSection(F, '', [
            { label: 'MOUSE POSITION', id: 'mouse-pos', value: '—', live: true },
            { label: 'MOUSE VELOCITY', id: 'mouse-velocity', value: '—', live: true },
            { label: 'IDLE TIME', id: 'idle-time', value: '0s', live: true },
            { label: 'AVERAGE TYPING SPEED', id: 'typing-speed', value: 'Not measured yet' },
            { label: 'READING PATTERN', id: 'reading-pattern', value: 'Analyzing...' }
        ]);
        section.appendChild(dataGrid);
        
        return section;
    }
    
    createFingerprintsSection(F) {
        const section = document.createElement('div');
        section.style.cssText = `margin-bottom: ${F * 3}px;`;
        
        const heading = new ComponentLibrary.Heading({
            level: 2,
            content: 'UNIQUE IDENTIFIERS'
        }, { MF: this.deps.MF });
        this.componentInstances.push(heading);
        section.appendChild(heading.render());
        
        const fingerprints = [
            { label: 'BROWSER FINGERPRINT HASH', id: 'fingerprint', value: 'Calculating...' },
            { label: 'CANVAS FINGERPRINT HASH', id: 'canvas-hash', value: 'Calculating...' },
            { label: 'WEBGL FINGERPRINT HASH', id: 'webgl-hash', value: 'Calculating...' }
        ];
        
        fingerprints.forEach(fp => {
            const fpBox = document.createElement('div');
            fpBox.style.cssText = `
                background: var(--vga-black);
                border: 1px solid var(--vga-gray);
                padding: ${F}px;
                margin-bottom: ${F}px;
                font-family: monospace;
                word-break: break-all;
                color: var(--vga-aqua);
            `;
            fpBox.innerHTML = `<strong style="color: var(--vga-white);">${fp.label}:</strong><br><span id="${fp.id}">${fp.value}</span>`;
            section.appendChild(fpBox);
        });
        
        // Generate fingerprints
        this.generateFingerprints();
        
        return section;
    }
    
    createTimelineSection(F) {
        const section = document.createElement('div');
        section.style.cssText = `margin-bottom: ${F * 3}px;`;
        
        const heading = new ComponentLibrary.Heading({
            level: 2,
            content: 'ACTIVITY TIMELINE'
        }, { MF: this.deps.MF });
        this.componentInstances.push(heading);
        section.appendChild(heading.render());
        
        const timeline = document.createElement('div');
        timeline.id = 'timeline';
        timeline.style.cssText = `
            background: var(--vga-black);
            border: 1px solid var(--vga-gray);
            padding: ${F}px;
            max-height: ${F * 16}px;
            overflow-y: auto;
            font-size: ${F * 0.85}px;
            font-family: monospace;
        `;
        section.appendChild(timeline);
        
        return section;
    }
    
    createOSINTSection(F) {
        const section = document.createElement('div');
        section.style.cssText = `margin-bottom: ${F * 3}px;`;
        
        const heading = new ComponentLibrary.Heading({
            level: 2,
            content: 'CROSS-REFERENCE INTELLIGENCE'
        }, { MF: this.deps.MF });
        this.componentInstances.push(heading);
        section.appendChild(heading.render());
        
        const para = new ComponentLibrary.Paragraph({
            content: 'With the data collected above, here\'s what additional profiling is possible:'
        }, { MF: this.deps.MF });
        this.componentInstances.push(para);
        section.appendChild(para.render());
        
        // OSINT subsections
        section.appendChild(this.createDataSection(F, 'IP ADDRESS ANALYSIS', [
            { label: 'ENHANCED GEOLOCATION APIS', value: 'IPApi.co, InfoSniper, IP2Location, MaxMind' },
            { label: 'ISP CUSTOMER DATA LINKING', value: 'If IP in breach database → Possible email match' },
            { label: 'REVERSE DNS ANALYSIS', value: 'PTR records may reveal company/organization' }
        ]));
        
        section.appendChild(this.createDataSection(F, 'IDENTITY DISCOVERY CHAIN', [
            { label: 'STAGE 1: FINGERPRINT → COOKIE ID', value: 'Your unique hash stored by ad networks' },
            { label: 'STAGE 2: COOKIE ID → EMAIL', value: 'Login to any service = email linked to fingerprint' },
            { label: 'STAGE 3: EMAIL → BREACH DATABASES', value: 'HaveIBeenPwned, DeHashed, leaked password dumps' },
            { label: 'STAGE 4: EMAIL → USERNAME SEARCH', value: 'Holehe checks 120+ sites for account existence' },
            { label: 'STAGE 5: USERNAME → SOCIAL PROFILES', value: 'Sherlock searches 300+ platforms for matching usernames' }
        ]));
        
        return section;
    }
    
    createWarningSection(F) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            background: var(--vga-maroon);
            border: 1px solid var(--vga-red);
            padding: ${F}px;
            margin-bottom: ${F * 2}px;
            color: var(--vga-white);
        `;
        warning.innerHTML = `
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
        `;
        return warning;
    }
    
    createDataSection(F, title, items) {
        const section = document.createElement('div');
        section.style.cssText = `margin-bottom: ${F * 3}px;`;
        
        if (title) {
            const heading = new ComponentLibrary.Heading({
                level: 2,
                content: title
            }, { MF: this.deps.MF });
            this.componentInstances.push(heading);
            section.appendChild(heading.render());
        }
        
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: ${F * 20}px 1fr;
            gap: ${F / 2}px ${F}px;
            font-size: ${F * 0.95}px;
            margin-bottom: ${F}px;
        `;
        
        items.forEach(item => {
            const label = document.createElement('div');
            label.style.cssText = `
                color: var(--vga-gray);
                font-weight: 700;
                text-transform: uppercase;
            `;
            label.textContent = item.label;
            
            const value = document.createElement('div');
            value.style.cssText = `
                color: ${item.live ? 'var(--vga-lime)' : 'var(--vga-silver)'};
                word-break: break-word;
                font-family: monospace;
            `;
            value.id = item.id || '';
            value.textContent = item.value;
            
            grid.appendChild(label);
            grid.appendChild(value);
        });
        
        section.appendChild(grid);
        return section;
    }
    
    // Data collection methods
    collectAllData() {
        this.collectNetworkData();
        this.logActivity('Page loaded - data collection initiated');
    }
    
    collectNetworkData() {
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                this.updateElement('ip', data.ip || 'Unknown');
                this.updateElement('location', `${data.city}, ${data.region}, ${data.country_name}`);
                this.updateElement('isp', data.org || 'Unknown');
                this.updateElement('asn', data.asn || 'Unknown');
                this.updateElement('country', data.country || 'Unknown');
                this.logActivity(`IP geolocation: ${data.city}, ${data.country_name}`);
            })
            .catch(() => {
                this.updateElement('ip', 'Unable to detect');
            });
    }
    
    startTracking() {
        // Add event listeners (auto-tracked by CleanupManager)
        this.eventHandlers.add(document, 'mousemove', (e) => this.handleMouseMove(e));
        this.eventHandlers.add(document, 'click', () => this.handleClick());
        this.eventHandlers.add(document, 'keydown', () => this.handleKeydown());
        this.eventHandlers.add(document, 'scroll', () => this.handleScroll());
        
        // Live updates (auto-tracked by CleanupManager)
        this.intervals.add(() => this.updateLiveStats(), 100);
    }
    
    handleMouseMove(e) {
        this.state.lastActivityTime = Date.now();
        
        if (this.state.lastMouseX !== 0 && this.state.lastMouseY !== 0) {
            const dx = e.clientX - this.state.lastMouseX;
            const dy = e.clientY - this.state.lastMouseY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            this.state.mouseDistance += distance;
        }
        
        this.state.lastMouseX = e.clientX;
        this.state.lastMouseY = e.clientY;
        
        this.updateElement('mouse-pos', `${e.clientX}, ${e.clientY}`);
        
        // Update minimap if exists
        if (this.mouseCtx && this.mouseCanvas) {
            const scaleX = this.mouseCanvas.width / window.innerWidth;
            const scaleY = this.mouseCanvas.height / window.innerHeight;
            this.mouseCtx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            this.mouseCtx.fillRect(e.clientX * scaleX, e.clientY * scaleY, 2, 2);
        }
    }
    
    handleClick() {
        this.state.clickCount++;
        this.state.lastActivityTime = Date.now();
        this.logActivity(`Click detected at (${this.state.lastMouseX}, ${this.state.lastMouseY})`);
    }
    
    handleKeydown() {
        this.state.keystrokeCount++;
        this.state.lastActivityTime = Date.now();
        this.state.keystrokeTimes.push(Date.now());
        
        if (this.state.keystrokeTimes.length >= 10) {
            const times = this.state.keystrokeTimes.slice(-10);
            const intervals = [];
            for (let i = 1; i < times.length; i++) {
                intervals.push(times[i] - times[i-1]);
            }
            const avgInterval = intervals.reduce((a,b) => a+b, 0) / intervals.length;
            const wpm = Math.floor(60000 / (avgInterval * 5));
            this.updateElement('typing-speed', wpm + ' WPM');
        }
    }
    
    handleScroll() {
        this.state.lastActivityTime = Date.now();
        const scrolled = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const percent = (scrolled / height) * 100;
        this.state.maxScroll = Math.max(this.state.maxScroll, percent);
        
        // Track scroll events for reading pattern
        this.state.scrollEvents.push({
            time: Date.now(),
            position: scrolled
        });
        
        if (this.state.scrollEvents.length > 20) {
            this.state.scrollEvents = this.state.scrollEvents.slice(-20);
            const speeds = [];
            for (let i = 1; i < this.state.scrollEvents.length; i++) {
                const timeDiff = this.state.scrollEvents[i].time - this.state.scrollEvents[i-1].time;
                const posDiff = Math.abs(this.state.scrollEvents[i].position - this.state.scrollEvents[i-1].position);
                speeds.push(posDiff / timeDiff);
            }
            const avgSpeed = speeds.reduce((a,b) => a+b, 0) / speeds.length;
            const pattern = avgSpeed > 2 ? 'Scanning' : avgSpeed > 0.5 ? 'Reading' : 'Slow/Careful';
            this.updateElement('reading-pattern', pattern);
        }
    }
    
    updateLiveStats() {
        const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
        this.updateElement('time-elapsed', elapsed);
        this.updateElement('mouse-distance', Math.floor(this.state.mouseDistance));
        this.updateElement('click-count', this.state.clickCount);
        this.updateElement('keystroke-count', this.state.keystrokeCount);
        
        const scrollPercent = Math.min(100, Math.floor(this.state.maxScroll));
        this.updateElement('scroll-depth', scrollPercent);
        
        const idleSeconds = Math.floor((Date.now() - this.state.lastActivityTime) / 1000);
        this.updateElement('idle-time', idleSeconds + 's');
    }
    
    setupHeatmap() {
        // Create fullscreen heatmap overlay
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 9999;
        `;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Add to body (auto-tracked by CleanupManager)
        this.bodyElements.add(canvas);
        this.heatmapCanvas = canvas;
        this.heatmapCtx = canvas.getContext('2d');
        
        // Add heatmap mousemove handler (auto-tracked)
        this.eventHandlers.add(document, 'mousemove', (e) => {
            if (this.heatmapCtx) {
                this.heatmapCtx.fillStyle = 'rgba(0, 255, 0, 0.1)';
                this.heatmapCtx.beginPath();
                this.heatmapCtx.arc(e.clientX, e.clientY, 20, 0, Math.PI * 2);
                this.heatmapCtx.fill();
            }
        });
    }
    
    async generateFingerprints() {
        // Canvas fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('abcdefghijklmnopqrstuvwxyz', 2, 15);
        const canvasData = canvas.toDataURL();
        
        const canvasHash = await this.hashData(canvasData);
        this.updateElement('canvas-hash', canvasHash);
        
        // Browser fingerprint
        const components = [
            navigator.userAgent,
            screen.width,
            screen.height,
            screen.colorDepth,
            window.devicePixelRatio,
            navigator.hardwareConcurrency,
            navigator.language,
            new Date().getTimezoneOffset()
        ];
        const browserHash = await this.hashData(components.join('|||'));
        this.updateElement('fingerprint', browserHash);
        
        // WebGL fingerprint
        const gl = canvas.getContext('webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                const webglHash = await this.hashData(vendor + renderer);
                this.updateElement('webgl-hash', webglHash);
            }
        }
    }
    
    async hashData(data) {
        const encoder = new TextEncoder();
        const buffer = encoder.encode(data);
        const hash = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    logActivity(message) {
        const timeline = document.getElementById('timeline');
        if (!timeline) return;
        
        const entry = document.createElement('div');
        entry.style.cssText = `
            padding: 5px 0;
            border-bottom: 1px solid var(--vga-gray);
            color: var(--vga-silver);
        `;
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}.${now.getMilliseconds().toString().padStart(3,'0')}`;
        entry.innerHTML = `<span style="color: var(--vga-lime); margin-right: 10px;">${timestamp}</span>${message}`;
        timeline.insertBefore(entry, timeline.firstChild);
    }
    
    // Helper methods
    detectOS(ua) {
        let os = 'Unknown', version = 'Unknown';
        if (ua.includes('Windows NT 10')) { os = 'Windows'; version = '10/11'; }
        else if (ua.includes('Mac OS X')) {
            os = 'macOS';
            const match = ua.match(/Mac OS X ([\d_]+)/);
            version = match ? match[1].replace(/_/g, '.') : 'Unknown';
        }
        else if (ua.includes('Android')) {
            os = 'Android';
            const match = ua.match(/Android ([\d.]+)/);
            version = match ? match[1] : 'Unknown';
        }
        else if (ua.includes('Linux')) { os = 'Linux'; }
        return { os, version };
    }
    
    detectBrowser(ua) {
        let name = 'Unknown', version = 'Unknown';
        if (ua.includes('Edg/')) {
            name = 'Edge';
            const match = ua.match(/Edg\/([\d.]+)/);
            version = match ? match[1] : 'Unknown';
        } else if (ua.includes('Chrome/')) {
            name = 'Chrome';
            const match = ua.match(/Chrome\/([\d.]+)/);
            version = match ? match[1] : 'Unknown';
        } else if (ua.includes('Firefox/')) {
            name = 'Firefox';
            const match = ua.match(/Firefox\/([\d.]+)/);
            version = match ? match[1] : 'Unknown';
        } else if (ua.includes('Safari/')) {
            name = 'Safari';
            const match = ua.match(/Version\/([\d.]+)/);
            version = match ? match[1] : 'Unknown';
        }
        return { name, version };
    }
    
    getConnectionInfo() {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!conn) return 'Unknown';
        return `${conn.effectiveType || 'Unknown'} (${conn.downlink || '?'} Mbps)`;
    }
    
    getOrientation() {
        return screen.orientation?.type || (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    }
    
    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    destroy() {
        console.log('🧹 Cleaning up About You tool...');
        
        // Use CleanupManager to automatically clean everything
        CleanupManager.cleanupTool(this);
        
        // Clear local references
        this.heatmapCanvas = null;
        this.heatmapCtx = null;
        
        // Clean up container class - AboutYouTool owns its container cleanup
        if (this.container) {
            this.container.classList.remove('tool-viewport');
        }
        
        console.log('✅ About You tool cleaned up - all tracking stopped');
    }
}

// ES Module export
export { AboutYouTool };
export default AboutYouTool;

// Register globally for backward compatibility
if (typeof window !== 'undefined') {
    window.AboutYouTool = AboutYouTool;
    console.log('🔍 About You Tool v1.0.0 ready');
}

