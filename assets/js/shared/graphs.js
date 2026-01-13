/**
 * Graph Components - SiteBoy Framework
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - BarGraph (bar chart visualization)
 * - LineGraph (line chart visualization) 
 * - PieGraph (pie chart visualization)
 * 
 * DO NOT ADD DUPLICATES OF THESE COMPONENTS IN OTHER FILES!
 * This is the SINGLE SOURCE OF TRUTH for all graph/chart components.
 * 
 * @version 2.0.0 - Functional implementations
 */

import { BaseComponent } from './foundation.js';

/**
 * BarGraph - Bar chart visualization component
 * 
 * Options:
 * - data: Array of {label, value} or just numbers
 * - width/height: Dimensions
 * - showGrid: Show horizontal grid lines
 * - showLabels: Show x-axis labels
 * - showValues: Show value on each bar
 * - barColor: Color of bars (default: --c-text)
 * - animated: Animate bar heights on render
 */
export class BarGraph extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'bar-graph' }, deps);
        this.data = options.data || [];
        this.width = options.width || 400;
        this.height = options.height || 300;
        this.showGrid = options.showGrid ?? true;
        this.showLabels = options.showLabels ?? true;
        this.showValues = options.showValues ?? false;
        this.barColor = options.barColor ?? 'var(--c-text)';
        this.animated = options.animated ?? true;
        
        this.canvasEl = null;
        this.ctx = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F } = this.getF();
        
        this.element = this.createElement('div', 'bar-graph component');
        this.element.style.cssText = `
            width: ${this.width}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            box-sizing: border-box;
        `;
        
        this.canvasEl = document.createElement('canvas');
        this.canvasEl.width = this.width;
        this.canvasEl.height = this.height;
        this.canvasEl.style.display = 'block';
        this.ctx = this.canvasEl.getContext('2d');
        
        this.element.appendChild(this.canvasEl);
        
        this._draw();
        
        return this.element;
    }
    
    _draw() {
        if (!this.ctx || this.data.length === 0) return;
        
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const { F } = this.getF();
        
        // Clear
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-bg').trim() || '#000';
        ctx.fillRect(0, 0, w, h);
        
        // Normalize data
        const values = this.data.map(d => typeof d === 'object' ? d.value : d);
        const labels = this.data.map((d, i) => typeof d === 'object' ? d.label : `${i + 1}`);
        const maxVal = Math.max(...values, 1);
        
        const padding = F * 2;
        const labelHeight = this.showLabels ? F * 2 : 0;
        const chartW = w - padding * 2;
        const chartH = h - padding * 2 - labelHeight;
        const barWidth = chartW / values.length * 0.8;
        const gap = chartW / values.length * 0.2;
        
        // Grid
        if (this.showGrid) {
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-border').trim() || '#333';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = padding + chartH * (1 - i / 4);
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(w - padding, y);
                ctx.stroke();
            }
        }
        
        // Bars
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--c-text').trim() || '#fff';
        ctx.fillStyle = this.barColor === 'var(--c-text)' ? textColor : this.barColor;
        
        values.forEach((val, i) => {
            const barH = (val / maxVal) * chartH;
            const x = padding + i * (barWidth + gap) + gap / 2;
            const y = padding + chartH - barH;
            
            ctx.fillRect(x, y, barWidth, barH);
            
            // Value label
            if (this.showValues) {
                ctx.fillStyle = textColor;
                ctx.font = `${F * 0.8}px 'Atkinson Hyperlegible', monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(val.toFixed(0), x + barWidth / 2, y - F / 2);
                ctx.fillStyle = this.barColor === 'var(--c-text)' ? textColor : this.barColor;
            }
        });
        
        // Labels
        if (this.showLabels) {
            ctx.fillStyle = textColor;
            ctx.font = `${F * 0.8}px 'Atkinson Hyperlegible', monospace`;
            ctx.textAlign = 'center';
            labels.forEach((label, i) => {
                const x = padding + i * (barWidth + gap) + gap / 2 + barWidth / 2;
                ctx.fillText(label.substring(0, 5), x, h - F / 2);
            });
        }
    }
    
    setData(data) {
        this.data = data;
        this._draw();
    }
    
    getData() {
        return this.data;
    }
}

/**
 * LineGraph - Line chart visualization component
 */
export class LineGraph extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'line-graph' }, deps);
        this.data = options.data || [];
        this.width = options.width || 400;
        this.height = options.height || 300;
        this.showGrid = options.showGrid ?? true;
        this.showPoints = options.showPoints ?? true;
        this.showLabels = options.showLabels ?? true;
        this.lineColor = options.lineColor ?? 'var(--c-text)';
        this.lineWidth = options.lineWidth ?? 2;
        this.fill = options.fill ?? false;
        
        this.canvasEl = null;
        this.ctx = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F } = this.getF();
        
        this.element = this.createElement('div', 'line-graph component');
        this.element.style.cssText = `
            width: ${this.width}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            box-sizing: border-box;
        `;
        
        this.canvasEl = document.createElement('canvas');
        this.canvasEl.width = this.width;
        this.canvasEl.height = this.height;
        this.canvasEl.style.display = 'block';
        this.ctx = this.canvasEl.getContext('2d');
        
        this.element.appendChild(this.canvasEl);
        
        this._draw();
        
        return this.element;
    }
    
    _draw() {
        if (!this.ctx || this.data.length === 0) return;
        
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const { F } = this.getF();
        
        // Clear
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-bg').trim() || '#000';
        ctx.fillRect(0, 0, w, h);
        
        const values = this.data.map(d => typeof d === 'object' ? d.value : d);
        const labels = this.data.map((d, i) => typeof d === 'object' ? d.label : `${i + 1}`);
        const maxVal = Math.max(...values, 1);
        const minVal = Math.min(...values, 0);
        const range = maxVal - minVal || 1;
        
        const padding = F * 2;
        const labelHeight = this.showLabels ? F * 2 : 0;
        const chartW = w - padding * 2;
        const chartH = h - padding * 2 - labelHeight;
        
        // Grid
        if (this.showGrid) {
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-border').trim() || '#333';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = padding + chartH * (1 - i / 4);
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(w - padding, y);
                ctx.stroke();
            }
        }
        
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--c-text').trim() || '#fff';
        const lineColor = this.lineColor === 'var(--c-text)' ? textColor : this.lineColor;
        
        // Calculate points
        const points = values.map((val, i) => ({
            x: padding + (i / (values.length - 1 || 1)) * chartW,
            y: padding + chartH - ((val - minVal) / range) * chartH
        }));
        
        // Fill area
        if (this.fill) {
            ctx.fillStyle = lineColor + '33';
            ctx.beginPath();
            ctx.moveTo(points[0].x, padding + chartH);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, padding + chartH);
            ctx.closePath();
            ctx.fill();
        }
        
        // Line
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        
        // Points
        if (this.showPoints) {
            ctx.fillStyle = lineColor;
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        // Labels
        if (this.showLabels && values.length <= 10) {
            ctx.fillStyle = textColor;
            ctx.font = `${F * 0.8}px 'Atkinson Hyperlegible', monospace`;
            ctx.textAlign = 'center';
            labels.forEach((label, i) => {
                const x = padding + (i / (values.length - 1 || 1)) * chartW;
                ctx.fillText(label.substring(0, 5), x, h - F / 2);
            });
        }
    }
    
    setData(data) {
        this.data = data;
        this._draw();
    }
    
    getData() {
        return this.data;
    }
}

/**
 * PieGraph - Pie chart visualization component
 */
export class PieGraph extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'pie-graph' }, deps);
        this.data = options.data || [];
        this.width = options.width || 300;
        this.height = options.height || 300;
        this.showLabels = options.showLabels ?? true;
        this.showPercentages = options.showPercentages ?? true;
        this.colors = options.colors || null;
        this.donut = options.donut ?? false;
        this.donutWidth = options.donutWidth ?? 0.4;
        
        this.canvasEl = null;
        this.ctx = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        this.element = this.createElement('div', 'pie-graph component');
        this.element.style.cssText = `
            width: ${this.width}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            box-sizing: border-box;
        `;
        
        this.canvasEl = document.createElement('canvas');
        this.canvasEl.width = this.width;
        this.canvasEl.height = this.height;
        this.canvasEl.style.display = 'block';
        this.ctx = this.canvasEl.getContext('2d');
        
        this.element.appendChild(this.canvasEl);
        
        this._draw();
        
        return this.element;
    }
    
    _generateColors(count) {
        if (this.colors && this.colors.length >= count) return this.colors;
        
        // Generate VGA-style colors
        const baseColors = [
            '#AAAAAA', '#FFFFFF', '#AA0000', '#00AA00', 
            '#0000AA', '#AAAA00', '#00AAAA', '#AA00AA',
            '#555555', '#FF5555', '#55FF55', '#5555FF'
        ];
        
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(baseColors[i % baseColors.length]);
        }
        return result;
    }
    
    _draw() {
        if (!this.ctx || this.data.length === 0) return;
        
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const { F } = this.getF();
        
        // Clear
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-bg').trim() || '#000';
        ctx.fillRect(0, 0, w, h);
        
        const values = this.data.map(d => typeof d === 'object' ? d.value : d);
        const labels = this.data.map((d, i) => typeof d === 'object' ? d.label : `${i + 1}`);
        const total = values.reduce((a, b) => a + b, 0) || 1;
        
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) / 2 - F * 2;
        const innerRadius = this.donut ? radius * (1 - this.donutWidth) : 0;
        
        const colors = this._generateColors(values.length);
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--c-text').trim() || '#fff';
        
        let startAngle = -Math.PI / 2;
        
        values.forEach((val, i) => {
            const sliceAngle = (val / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;
            
            // Slice
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.moveTo(cx + innerRadius * Math.cos(startAngle), cy + innerRadius * Math.sin(startAngle));
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fill();
            
            // Border
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-border').trim() || '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Label
            if (this.showLabels || this.showPercentages) {
                const midAngle = startAngle + sliceAngle / 2;
                const labelRadius = radius * 0.65;
                const lx = cx + labelRadius * Math.cos(midAngle);
                const ly = cy + labelRadius * Math.sin(midAngle);
                
                ctx.fillStyle = '#000';
                ctx.font = `bold ${F * 0.8}px 'Atkinson Hyperlegible', monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                if (sliceAngle > 0.3) { // Only show if slice is big enough
                    if (this.showPercentages) {
                        ctx.fillText(`${Math.round(val / total * 100)}%`, lx, ly);
                    }
                }
            }
            
            startAngle = endAngle;
        });
        
        // Legend
        if (this.showLabels) {
            ctx.font = `${F * 0.7}px 'Atkinson Hyperlegible', monospace`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            // Draw legend at bottom or side based on aspect ratio
            const legendY = h - F;
            const legendSpacing = w / values.length;
            
            labels.forEach((label, i) => {
                const x = F + i * legendSpacing;
                if (x + F * 3 < w) {
                    ctx.fillStyle = colors[i];
                    ctx.fillRect(x, legendY - F / 3, F / 2, F / 2);
                    ctx.fillStyle = textColor;
                    ctx.fillText(label.substring(0, 4), x + F, legendY);
                }
            });
        }
    }
    
    setData(data) {
        this.data = data;
        this._draw();
    }
    
    getData() {
        return this.data;
    }
}
