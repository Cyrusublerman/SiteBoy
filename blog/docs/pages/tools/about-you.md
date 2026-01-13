# About You Tool

Browser fingerprinting and tracking demonstration.

## Overview

Shows everything a website can collect about a visitor through browser APIs. Educational tool demonstrating real-time data collection and behavioral analysis.

## Data Categories

### Network Information
- IP address (via external API)
- Connection type
- Effective bandwidth
- RTT (round-trip time)

### System Information
- Platform/OS
- CPU cores
- Device memory
- Touch support
- Max touch points

### Display Properties
- Screen resolution
- Color depth
- Pixel ratio
- Viewport dimensions
- Orientation

### Power Status
- Battery level
- Charging state
- Time to empty/full

### Locale Data
- Language preferences
- Timezone
- Date format

### Browser Capabilities
- User agent
- Plugins
- Cookies enabled
- Do Not Track
- WebGL renderer

### Media Devices
- Camera count
- Microphone count
- Speaker count

## Behavioral Tracking

### Session Metrics
| Metric | Description |
|--------|-------------|
| Session duration | Time since page load |
| Mouse distance | Total pixels traveled |
| Click count | Total clicks |
| Keystroke count | Total key presses |
| Max scroll depth | Furthest scroll position |
| Activity time | Time since last interaction |

### Typing Analysis
- Inter-key timing
- Typing rhythm patterns
- Average WPM estimation

### Mouse Heatmap
Canvas visualization of mouse movement density.

## Fingerprinting

### Canvas Fingerprint
```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.textBaseline = 'top';
ctx.font = '14px Arial';
ctx.fillText('fingerprint', 2, 2);
return canvas.toDataURL();
```

### WebGL Fingerprint
- Renderer info
- Vendor info
- Extensions list

### Audio Fingerprint
- AudioContext properties
- Oscillator characteristics

## Privacy Demonstration

Shows visitors:
- How much data browsers expose
- Which APIs reveal identity
- How behavioral patterns identify users
- Why privacy tools matter

## Implementation Notes

Uses `CleanupManager` for resource tracking:
- `EventHandlerRegistry` - Event listeners
- `IntervalRegistry` - Update timers
- `BodyElementRegistry` - Injected elements

## Source Reference

`assets/js/tools/about-you-tool.js`

