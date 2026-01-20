/**
 * SimpleCurveEditor — Minimal XY Curve Editor
 * 
 * Lightweight curve editor with vector curve mapping input → output
 * Click to add points, drag to adjust, right-click to remove
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../foundation.js';
import { generateCurveLUT } from '../algorithms/image/image-adjustments-extended.js';

export class SimpleCurveEditor extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'curve-editor' }, deps);
        
        this.options = {
            width: 196,              // Canvas width (matches F-system)
            height: 196,             // Canvas height
            pointRadius: 4,          // Control point size
            onChange: null,          // Callback for changes
            ...options
        };
        
        this.state = {
            points: [
                { x: 0, y: 0, locked: true },      // Start locked
                { x: 255, y: 255, locked: true }   // End locked
            ],
            selectedPoint: null,
            isDragging: false
        };
        
        this.canvas = null;
        this.ctx = null;
        this.listeners = {};
    }
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    render() {
        const container = document.createElement('div');
        container.className = 'curve-editor';
        
        // Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.canvas.className = 'curve-canvas';
        this.ctx = this.canvas.getContext('2d');
        
        // Wire up events
        this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
        this.canvas.addEventListener('pointerup', (e) => this.onPointerUp(e));
        this.canvas.addEventListener('contextmenu', (e) => this.onContextMenu(e));
        
        container.appendChild(this.canvas);
        
        // Draw initial curve
        this.draw();
        
        return container;
    }
    
    draw() {
        if (!this.ctx) return;
        
        const { width, height } = this.options;
        const ctx = this.ctx;
        
        // Clear (VGA black)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid (8×8)
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        const gridSize = width / 8;
        for (let i = 0; i <= 8; i++) {
            const pos = i * gridSize;
            // Vertical
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, height);
            ctx.stroke();
            // Horizontal
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(width, pos);
            ctx.stroke();
        }
        
        // Draw diagonal reference (identity curve)
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, 0);
        ctx.stroke();
        
        // Draw curve
        this.drawCurve(ctx);
        
        // Draw points
        this.drawPoints(ctx);
    }
    
    drawCurve(ctx) {
        const { width, height } = this.options;
        const sorted = [...this.state.points].sort((a, b) => a.x - b.x);
        
        ctx.strokeStyle = '#00FF00'; // VGA green
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < sorted.length; i++) {
            const p = sorted[i];
            const px = (p.x / 255) * width;
            const py = height - (p.y / 255) * height;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.stroke();
    }
    
    drawPoints(ctx) {
        const { width, height, pointRadius } = this.options;
        
        this.state.points.forEach(point => {
            const px = (point.x / 255) * width;
            const py = height - (point.y / 255) * height;
            
            // Fill
            ctx.fillStyle = point === this.state.selectedPoint ? '#FFFF00' : '#FFFFFF';
            ctx.beginPath();
            ctx.arc(px, py, pointRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Outline
            ctx.strokeStyle = point.locked ? '#FF0000' : '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }
    
    onPointerDown(e) {
        const point = this.findPointNear(e);
        
        if (point) {
            this.state.selectedPoint = point;
            this.state.isDragging = true;
        } else if (this.state.points.length < 16) {
            // Add new point
            const coords = this.getCoords(e);
            this.state.points.push({
                x: Math.round(coords.x),
                y: Math.round(coords.y),
                locked: false
            });
            this.state.selectedPoint = this.state.points[this.state.points.length - 1];
            this.emitChange();
        }
        
        this.draw();
    }
    
    onPointerMove(e) {
        if (!this.state.isDragging || !this.state.selectedPoint) return;
        if (this.state.selectedPoint.locked) return;
        
        const coords = this.getCoords(e);
        this.state.selectedPoint.x = Math.max(1, Math.min(254, Math.round(coords.x)));
        this.state.selectedPoint.y = Math.max(0, Math.min(255, Math.round(coords.y)));
        
        this.draw();
        this.debouncedEmitChange();
    }
    
    onPointerUp(e) {
        this.state.isDragging = false;
        if (this.state.selectedPoint) {
            this.emitChange();
        }
    }
    
    onContextMenu(e) {
        e.preventDefault();
        const point = this.findPointNear(e);
        
        if (point && !point.locked) {
            const index = this.state.points.indexOf(point);
            this.state.points.splice(index, 1);
            this.state.selectedPoint = null;
            this.draw();
            this.emitChange();
        }
    }
    
    getCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 255;
        const y = 255 - ((e.clientY - rect.top) / rect.height) * 255;
        return { x, y };
    }
    
    findPointNear(e) {
        const coords = this.getCoords(e);
        const threshold = 10;
        
        for (const point of this.state.points) {
            const dx = Math.abs(point.x - coords.x);
            const dy = Math.abs(point.y - coords.y);
            if (dx < threshold && dy < threshold) {
                return point;
            }
        }
        
        return null;
    }
    
    emitChange() {
        const lut = generateCurveLUT(this.state.points);
        this.emit('change', {
            points: [...this.state.points],
            lut: lut
        });
    }
    
    debouncedEmitChange = (() => {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.emitChange(), 50);
        };
    })();
    
    reset() {
        this.state.points = [
            { x: 0, y: 0, locked: true },
            { x: 255, y: 255, locked: true }
        ];
        this.state.selectedPoint = null;
        this.draw();
        this.emitChange();
    }
    
    destroy() {
        if (this.canvas) {
            this.canvas.remove();
        }
        super.destroy();
    }
}

