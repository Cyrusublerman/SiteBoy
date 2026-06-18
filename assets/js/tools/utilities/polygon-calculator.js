/**
 * Polygon Calculator Tool - ToolBase Declarative Format
 *
 * Interactive polygon geometry calculator with canvas visualization
 * Calculate relationships between apothem, circumradius, side length, perimeter, and area
 *
 * @version 2.1.0 - ES Module Migration
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';

// PolygonCalculator class definition

    // ═══════════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════════

    let state = {
        sides: 6,
        wallWidth: 0.2,
        outer: {
            apothem: 2.5,
            circumradius: 0,
            sideLength: 0,
            perimeter: 0,
            area: 0
        },
        inner: {
            apothem: 2.3,
            circumradius: 0,
            sideLength: 0,
            perimeter: 0,
            area: 0
        },
        lastChange: {
            polygon: 'outer',
            measure: 'apothem'
        },
        showGrid: true,
        showIntermediate: true
    };

    let toolInstance = null;
    let isSyncing = false; // Prevent infinite recursion

    // ═══════════════════════════════════════════════════════════════════════════════
    // GEOMETRY CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    const getApothemFrom = {
        circumradius: function(value, sides) {
            if (value <= 0) return null;
            return value * Math.cos(Math.PI / sides);
        },
        sideLength: function(value, sides) {
            if (value <= 0) return null;
            return value / (2 * Math.tan(Math.PI / sides));
        },
        perimeter: function(value, sides) {
            if (value <= 0) return null;
            return value / (2 * sides * Math.tan(Math.PI / sides));
        },
        area: function(value, sides) {
            if (value <= 0) return null;
            return Math.sqrt(value / (sides * Math.tan(Math.PI / sides)));
        },
        apothem: function(value) {
            return value <= 0 ? null : value;
        }
    };

    function getFromApothem(apothem, sides) {
        if (!sides || sides < 3 || apothem <= 0) return null;
        
        const sideLength = 2 * apothem * Math.tan(Math.PI / sides);
        const circumradius = apothem / Math.cos(Math.PI / sides);
        const perimeter = sides * sideLength;
        const area = (sides * sideLength * apothem) / 2;
        
        return {
            apothem: Number(apothem.toFixed(3)),
            circumradius: Number(circumradius.toFixed(3)),
            sideLength: Number(sideLength.toFixed(3)),
            perimeter: Number(perimeter.toFixed(3)),
            area: Number(area.toFixed(3))
        };
    }

    function updateState(sides, wallWidth, outerApothem) {
        const outer = getFromApothem(outerApothem, sides);
        const inner = getFromApothem(outerApothem - wallWidth, sides);
        
        if (!outer || !inner) return;
        
        state.sides = sides;
        state.wallWidth = wallWidth;
        state.outer = outer;
        state.inner = inner;
        
        syncDisplayValues();
        if (toolInstance) {
            toolInstance.draw();
        }
    }

    function syncDisplayValues() {
        if (!toolInstance) return;
        
        isSyncing = true; // Prevent onUpdate from triggering updateState
        try {
            toolInstance.setValue('sides', state.sides);
            toolInstance.setValue('wallWidth', state.wallWidth);
            
            ['apothem', 'circumradius', 'sideLength', 'perimeter', 'area'].forEach(function(key) {
                toolInstance.setValue('outer' + key.charAt(0).toUpperCase() + key.slice(1), state.outer[key]);
                toolInstance.setValue('inner' + key.charAt(0).toUpperCase() + key.slice(1), state.inner[key]);
            });
        } finally {
            isSyncing = false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CONFIG
    // ═══════════════════════════════════════════════════════════════════════════════

    const TOOL_CONFIG = {
        title: 'POLYGON CALCULATOR',
        
        sidebar: [
            ['PARAMETERS', [
                ['Basic', [
                    ['number', 'Sides', 3, 24, 1, { value: 6, key: 'sides' }],
                    ['number', 'Wall Width', 0, 5, 0.01, { value: 0.2, precision: 3, key: 'wallWidth' }],
                ]],
                ['Outer Polygon', [
                    ['number', 'Apothem', 0, 20, 0.001, { value: 2.5, precision: 3, key: 'outerApothem' }],
                    ['number', 'Circumradius', 0, 20, 0.001, { value: 0, precision: 3, key: 'outerCircumradius' }],
                    ['number', 'Side Length', 0, 20, 0.001, { value: 0, precision: 3, key: 'outerSideLength' }],
                    ['number', 'Perimeter', 0, 100, 0.001, { value: 0, precision: 3, key: 'outerPerimeter' }],
                    ['number', 'Area', 0, 500, 0.001, { value: 0, precision: 3, key: 'outerArea' }],
                ]],
                ['Inner Polygon', [
                    ['number', 'Apothem', 0, 20, 0.001, { value: 2.3, precision: 3, key: 'innerApothem' }],
                    ['number', 'Circumradius', 0, 20, 0.001, { value: 0, precision: 3, key: 'innerCircumradius' }],
                    ['number', 'Side Length', 0, 20, 0.001, { value: 0, precision: 3, key: 'innerSideLength' }],
                    ['number', 'Perimeter', 0, 100, 0.001, { value: 0, precision: 3, key: 'innerPerimeter' }],
                    ['number', 'Area', 0, 500, 0.001, { value: 0, precision: 3, key: 'innerArea' }],
                ]],
            ]],
            ['DISPLAY', [
                ['Options', [
                    ['toggle', 'Show', ['Grid', 'Intermediate'], { key: 'displayOptions', selectedValues: ['Grid', 'Intermediate'] }],
                ]],
                ['Export', [
                    ['button', 'Download PNG', null, { key: 'downloadPng' }],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },
        
        onInit: function(values) {
            toolInstance = this;
            
            // Wire up download button
            const downloadBtn = this.getComponent('downloadPng');
            if (downloadBtn && downloadBtn.element) {
                downloadBtn.element.addEventListener('click', downloadPNG);
            }
            
            // Initialize state
            updateState(state.sides, state.wallWidth, state.outer.apothem);
        },
        
        onUpdate: function(key, value, allValues) {
            // Prevent infinite recursion from syncDisplayValues
            if (isSyncing) return;
            
            // Handle display options
            if (key === 'displayOptions') {
                state.showGrid = Array.isArray(value) && value.indexOf('Grid') >= 0;
                state.showIntermediate = Array.isArray(value) && value.indexOf('Intermediate') >= 0;
                return;
            }
            
            // Handle numeric inputs
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) return;
            
            if (key === 'sides') {
                if (numValue >= 3) {
                    const measure = state.lastChange.measure;
                    const polygon = state.lastChange.polygon;
                    const lastValue = state[polygon][measure];
                    const newApothem = getApothemFrom[measure](lastValue, numValue);
                    if (newApothem !== null) {
                        updateState(numValue, state.wallWidth, newApothem);
                    }
                }
            } else if (key === 'wallWidth') {
                if (state.outer.apothem > numValue) {
                    updateState(state.sides, numValue, state.outer.apothem);
                }
            } else {
                // Parse polygon and measure from key
                let polygon = null;
                let measure = null;
                
                if (key.startsWith('outer')) {
                    polygon = 'outer';
                    measure = key.replace('outer', '').toLowerCase();
                    measure = measure.charAt(0).toLowerCase() + key.slice(6);
                } else if (key.startsWith('inner')) {
                    polygon = 'inner';
                    measure = key.replace('inner', '').toLowerCase();
                    measure = measure.charAt(0).toLowerCase() + key.slice(6);
                }
                
                // Map display names to state keys
                const measureMap = {
                    'apothem': 'apothem',
                    'circumradius': 'circumradius',
                    'sidelength': 'sideLength',
                    'perimeter': 'perimeter',
                    'area': 'area'
                };
                
                measure = measureMap[measure] || measure;
                
                if (polygon && measure && getApothemFrom[measure]) {
                    state.lastChange = { polygon: polygon, measure: measure };
                    const newApothem = getApothemFrom[measure](numValue, state.sides);
                    
                    if (newApothem !== null) {
                        if (polygon === 'outer') {
                            updateState(state.sides, state.wallWidth, newApothem);
                        } else {
                            if (state.outer.apothem > newApothem) {
                                const newWallWidth = state.outer.apothem - newApothem;
                                updateState(state.sides, newWallWidth, state.outer.apothem);
                            }
                        }
                    }
                }
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            drawPolygon(ctx, canvas);
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // DRAWING
    // ═══════════════════════════════════════════════════════════════════════════════

    function generatePolygonPoints(radius, sides, cx, cy) {
        if (!sides || sides < 3 || !radius || radius <= 0) return [];
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            points.push({
                x: cx + radius * Math.cos(angle),
                y: cy + radius * Math.sin(angle)
            });
        }
        return points;
    }

    function drawPolygonPath(ctx, points) {
        if (points.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
    }

    function drawPolygon(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        
        // Calculate scale to fit
        const maxRadius = Math.max(state.outer.circumradius, state.inner.circumradius) || 3;
        const padding = 40;
        const scale = (Math.min(w, h) - padding * 2) / (maxRadius * 2);
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        
        // Draw grid
        if (state.showGrid) {
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            
            // Axes
            ctx.beginPath();
            ctx.moveTo(0, cy);
            ctx.lineTo(w, cy);
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, h);
            ctx.stroke();
            
            // Grid markers
            ctx.fillStyle = '#666666';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            
            const numTicks = 4;
            for (let i = -numTicks; i <= numTicks; i++) {
                if (i === 0) continue;
                const val = (i * maxRadius) / numTicks;
                const px = cx + val * scale;
                const py = cy + val * scale;
                
                // X axis ticks
                ctx.beginPath();
                ctx.moveTo(px, cy - 3);
                ctx.lineTo(px, cy + 3);
                ctx.stroke();
                ctx.fillText(val.toFixed(1) + 'm', px, cy + 15);
                
                // Y axis ticks
                ctx.beginPath();
                ctx.moveTo(cx - 3, py);
                ctx.lineTo(cx + 3, py);
                ctx.stroke();
            }
        }
        
        // Draw intermediate polygons
        if (state.showIntermediate) {
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 1;
            
            let currentRadius = state.inner.circumradius - state.wallWidth;
            while (currentRadius > 0) {
                const points = generatePolygonPoints(currentRadius * scale, state.sides, cx, cy);
                drawPolygonPath(ctx, points);
                ctx.stroke();
                currentRadius -= state.wallWidth;
            }
        }
        
        // Draw outer polygon
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        const outerPoints = generatePolygonPoints(state.outer.circumradius * scale, state.sides, cx, cy);
        drawPolygonPath(ctx, outerPoints);
        ctx.stroke();
        
        // Draw inner polygon
        ctx.strokeStyle = '#AAAAAA';
        ctx.lineWidth = 2;
        const innerPoints = generatePolygonPoints(state.inner.circumradius * scale, state.sides, cx, cy);
        drawPolygonPath(ctx, innerPoints);
        ctx.stroke();
        
        // Draw center point
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw labels
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('n=' + state.sides + ' sides', 10, 20);
        ctx.fillText('Wall: ' + state.wallWidth.toFixed(3) + 'm', 10, 35);
        ctx.fillText('Outer R: ' + state.outer.circumradius.toFixed(3) + 'm', 10, 50);
        ctx.fillText('Inner R: ' + state.inner.circumradius.toFixed(3) + 'm', 10, 65);
    }

    function downloadPNG() {
        if (!toolInstance) return;
        
        const canvas = toolInstance.getCanvas();
        const link = document.createElement('a');
        link.download = 'polygon_n' + state.sides + '_w' + state.wallWidth.toFixed(3) + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

    function PolygonCalculator(container, deps) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...(deps || {})
        };
        this.tool = null;
        this.render();
    }
    
    PolygonCalculator.prototype.render = function() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
        } catch (error) {
            console.error('PolygonCalculator error:', error);
            this.container.innerHTML = '<p style="color: var(--c-text); padding: 20px;">Error: ' + error.message + '</p>';
        }
    };
    
    PolygonCalculator.prototype.destroy = function() {
        state = {
            sides: 6,
            wallWidth: 0.2,
            outer: { apothem: 2.5, circumradius: 0, sideLength: 0, perimeter: 0, area: 0 },
            inner: { apothem: 2.3, circumradius: 0, sideLength: 0, perimeter: 0, area: 0 },
            lastChange: { polygon: 'outer', measure: 'apothem' },
            showGrid: true,
            showIntermediate: true
        };
        toolInstance = null;
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    };

    // ES Module export
    export { PolygonCalculator };
    export default PolygonCalculator;

    // Global compatibility layer for legacy tools
    if (typeof window !== 'undefined') {
        // Export
        window.PolygonCalculator = PolygonCalculator;

        window.debugLog('TOOLS', '✅ PolygonCalculator loaded (ES Module with ToolBase)');
    }
