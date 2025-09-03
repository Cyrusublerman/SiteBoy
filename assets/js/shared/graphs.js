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
 * USAGE PATTERN:
 * import { BarGraph, LineGraph } from './graphs.js';
 * const chart = new BarGraph({ data: [...] }, deps);
 * 
 * DEPENDENCIES:
 * - foundation.js (BaseComponent)
 * 
 * 📖 PLACEMENT GUIDE: See COMPONENT_PLACEMENT_GUIDE.md for component placement rules
 * 🚨 BEFORE ADDING: Check if component already exists and verify correct category
 */

import { BaseComponent } from './foundation.js';

/**
 * BarGraph - Bar chart visualization component
 */
export class BarGraph extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'bar-graph' }, deps);
        this.data = options.data || [];
        this.width = options.width || 400;
        this.height = options.height || 300;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'bar-graph component');
            this.element.innerHTML = this.generateBarChart();
        }
        return this.element;
    }
    
    generateBarChart() {
        return `<div style="width:${this.width}px;height:${this.height}px;border:1px solid var(--c-border);display:flex;align-items:end;justify-content:space-around;padding:10px;background:var(--c-bg)">Bar Chart Placeholder</div>`;
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
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'line-graph component');
            this.element.innerHTML = this.generateLineChart();
        }
        return this.element;
    }
    
    generateLineChart() {
        return `<div style="width:${this.width}px;height:${this.height}px;border:1px solid var(--c-border);display:flex;align-items:center;justify-content:center;background:var(--c-bg)">Line Chart Placeholder</div>`;
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
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'pie-graph component');
            this.element.innerHTML = this.generatePieChart();
        }
        return this.element;
    }
    
    generatePieChart() {
        return `<div style="width:${this.width}px;height:${this.height}px;border:1px solid var(--c-border);border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--c-bg)">Pie Chart Placeholder</div>`;
    }
}
