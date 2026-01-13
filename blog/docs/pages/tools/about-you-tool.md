# About You Tool

**Type:** Tool (Privacy Demonstration)  
**Category:** Security / Privacy Education  
**Status:** Existing (ComponentLibrary-based)  
**Source:** `assets/js/tools/about-you-tool.js`

---

## 1. Overview

Browser fingerprinting and tracking demonstration tool that shows visitors everything a website can collect about them. This educational tool reveals the extent of data collection that occurs on most websites, from device information to behavioral patterns.

### Key Features
- Real-time data collection display
- Network identity detection (IP, ISP, geolocation)
- System fingerprinting (OS, browser, hardware)
- Display configuration analysis
- Behavioral tracking (mouse, clicks, keystrokes, scrolling)
- Unique identifier generation (canvas/WebGL fingerprints)
- Activity timeline logging
- Mouse movement heatmap visualization
- OSINT cross-reference explanation

### Educational Purpose
Demonstrates to users:
- What data websites can collect without permission
- How fingerprinting works across sites
- How anonymous browsing can be de-anonymized
- The data broker and advertising ecosystem
- Cross-referencing possibilities with breach databases

---

## 2. User Controls

### Display Sections (Auto-populated)
| Section | Data Displayed |
|---------|----------------|
| Live Stats | Time elapsed, mouse distance, clicks, scroll depth, keystrokes |
| Network Identity | IP, geolocation, ISP, ASN, country, connection type |
| System Fingerprint | OS, browser, user agent, platform, CPU cores, memory |
| Display Config | Screen resolution, window size, color depth, pixel ratio, orientation |
| Behavioral Analysis | Mouse position, velocity, idle time, typing speed, reading pattern |
| Unique Identifiers | Browser hash, canvas hash, WebGL hash |
| Activity Timeline | Timestamped event log |

### Interactive Elements
| Element | Type | Description |
|---------|------|-------------|
| Heatmap Canvas | display | Mini visualization of mouse movements |
| Timeline | scrollable | Chronological activity log |
| Warning Box | static | Privacy implications explanation |

---

## 3. Functional Requirements

### Core Behavior
1. **Page Load:** Immediately begin data collection
2. **Network Detection:** Fetch IP geolocation from ipapi.co
3. **System Analysis:** Parse user agent for OS/browser details
4. **Fingerprint Generation:** Create unique hashes using crypto.subtle
5. **Behavioral Tracking:** Monitor mouse, keyboard, and scroll events
6. **Live Updates:** Refresh stats every 100ms
7. **Timeline Logging:** Record significant events with timestamps

### Data Collection Methods
```javascript
// IP Geolocation
fetch('https://ipapi.co/json/').then(res => res.json())

// Canvas Fingerprint
const canvas = document.createElement('canvas');
ctx.font = '14px Arial';
ctx.fillText('abcdefghijklmnopqrstuvwxyz', 2, 15);
const canvasData = canvas.toDataURL();

// Browser Fingerprint Components
[navigator.userAgent, screen.width, screen.height, 
 screen.colorDepth, window.devicePixelRatio,
 navigator.hardwareConcurrency, navigator.language,
 new Date().getTimezoneOffset()].join('|||')

// WebGL Fingerprint
const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + 
gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
```

### Event Tracking
- **mousemove:** Track position, calculate distance
- **click:** Count clicks, log position
- **keydown:** Count keystrokes, calculate typing speed
- **scroll:** Track depth, analyze reading pattern

### Cleanup Requirements
Tool uses `CleanupManager` for proper resource disposal:
- EventHandlerRegistry: Mouse, keyboard, scroll listeners
- IntervalRegistry: Live update timer
- BodyElementRegistry: Fullscreen heatmap overlay

---

## 4. Technical Architecture

### Source Analysis
```javascript
class AboutYouTool {
  constructor(container, deps) {
    this.eventHandlers = new CleanupManager.EventHandlerRegistry();
    this.intervals = new CleanupManager.IntervalRegistry();
    this.bodyElements = new CleanupManager.BodyElementRegistry();
    
    this.state = {
      startTime: Date.now(),
      mouseDistance: 0,
      clickCount: 0,
      keystrokeCount: 0,
      maxScroll: 0,
      // ...
    };
    
    this.data = {
      network: {},
      system: {},
      display: {},
      behavior: {},
      fingerprints: {}
    };
  }
  
  render() {
    this.collectAllData();
    this.startTracking();
    // Build UI sections...
  }
  
  destroy() {
    CleanupManager.cleanupTool(this);
  }
}
```

### Dependencies
- ComponentLibrary (Heading, Paragraph)
- CleanupManager (EventHandlerRegistry, IntervalRegistry, BodyElementRegistry)
- External API: ipapi.co for IP geolocation
- Web Crypto API for SHA-256 hashing

### UI Structure
```
[Title: ABOUT YOU]
[Subtitle with pulsing ACTIVE indicator]
[Stats Box - 5 live counters]
[Network Identity Section]
[System Fingerprint Section]
[Display Configuration Section]
[Behavioral Analysis + Heatmap Canvas]
[Unique Identifiers Section]
[Activity Timeline]
[OSINT Cross-Reference Section]
[Warning Box]
```

---

## 5. ToolBase Conversion Plan

### Decision: Keep ComponentLibrary
This tool is better suited to ComponentLibrary than ToolBase because:
- No canvas drawing required (heatmap is overlay)
- Complex multi-section layout
- Heavy use of dynamic DOM updates
- No parameter controls (read-only display)

### Alternative: Hybrid Approach
If conversion desired, use ToolBase for structure with custom onDraw:
```javascript
const TOOL_CONFIG = {
    title: 'ABOUT YOU',
    
    sidebar: [
        ['CONTROLS', [
            ['Display', [
                ['toggle', 'Show Heatmap', ['Enabled'], { key: 'showHeatmap', selectedValues: ['Enabled'] }],
                ['toggle', 'Track Mouse', ['Enabled'], { key: 'trackMouse', selectedValues: ['Enabled'] }],
            ]],
            ['Export', [
                ['button', 'Export Report', null, { key: 'exportReport' }],
                ['button', 'Copy Fingerprint', null, { key: 'copyFingerprint' }],
            ]],
        ]],
    ],
    
    canvas: { size: 600 },  // For heatmap visualization
    
    onInit: function(values) {
        this.startTracking();
        this.collectNetworkData();
        // Custom data collection initialization
    },
    
    onDraw: function(ctx, canvas, values) {
        // Draw heatmap overlay
        // Draw data sections as canvas text
    }
};
```

### Recommendation
Keep as ComponentLibrary-based tool. The current implementation is well-suited to its purpose and doesn't benefit significantly from ToolBase conversion.

---

## 6. Visual Design

### Layout
- Single-column responsive layout
- Grid-based stats display
- Bordered data sections
- Scrollable timeline

### Color Scheme
- VGA color variables throughout
- Pulsing red for ACTIVE indicator
- Lime green for live values
- Gray for labels
- Maroon/red for warning section

### Typography
- Monospace for data values
- Uppercase labels
- Size based on MathematicalFoundation F value

---

## 7. Testing Checklist

### Functional Tests
- [ ] IP geolocation populates correctly
- [ ] System info detected accurately
- [ ] Mouse distance accumulates
- [ ] Click counter increments
- [ ] Keystroke counter increments
- [ ] Scroll depth tracks correctly
- [ ] Typing speed calculates after 10+ keystrokes
- [ ] Reading pattern updates
- [ ] Fingerprint hashes generate
- [ ] Timeline logs events

### Visual Tests
- [ ] Stats box displays all counters
- [ ] Heatmap overlay renders
- [ ] All sections populated
- [ ] Warning box visible
- [ ] Responsive layout works

### Cleanup Tests
- [ ] All event handlers removed on destroy
- [ ] Intervals cleared on destroy
- [ ] Body elements removed on destroy
- [ ] No memory leaks on navigation

---

## 8. References

### Privacy/Security Background
- **Browser Fingerprinting:** https://amiunique.org/
- **Canvas Fingerprinting:** https://browserleaks.com/canvas
- **WebGL Fingerprinting:** https://browserleaks.com/webgl
- **IP Geolocation:** https://ipapi.co/

### OSINT Tools Referenced
- HaveIBeenPwned - Breach database
- Holehe - Email enumeration (120+ sites)
- Sherlock - Username search (300+ platforms)
- DeHashed - Leaked credential search

### Implementation References
- Source: `assets/js/tools/about-you-tool.js`
- CleanupManager: `assets/js/shared/cleanup-manager.js`

### Related Tools
- [Tool Test UI](#tool-test-ui) - ToolBase reference implementation

