/**
 * Tool Conversion Script - Convert IIFE tools to ES modules
 *
 * This script automatically converts SiteBoy tools from IIFE pattern to ES modules.
 * Run with: node convert-tools.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of tools that still need conversion (exclude already converted ones)
const toolsToConvert = [
    'about-you-tool.js',
    'algorithms-test-lab.js',
    'ascii-art-generator.js',
    'circles-tool.js',
    'cymatics-tool.js',
    'font-analysis-tool.js',
    'gallery-uploader.js',
    'generative-pattern.js',
    'harmonics-tool.js',
    'image23d.js',
    'interference-figure.js',
    'lissajous-tool.js',
    'pixel-tiler.js',
    'polygon-calculator.js',
    'ribbon-breeze.js',
    'smart-halftone.js',
    'solar-system-tool.js',
    'squares-tool.js',
    'tile-mosaic.js',
    'topographic-dot-halftone.js',
    'torus-tool.js',
    'unified-pattern.js',
    'wave-equation-synth.js',
    'wave-interference-tool.js'
];

const toolsDir = path.join(__dirname, 'assets', 'js', 'tools');

console.log('🔄 Converting tools to ES modules...\n');

toolsToConvert.forEach(toolFile => {
    const toolPath = path.join(toolsDir, toolFile);

    if (!fs.existsSync(toolPath)) {
        console.log(`⚠️  Skipping ${toolFile} - file not found`);
        return;
    }

    console.log(`📝 Converting ${toolFile}...`);

    let content = fs.readFileSync(toolPath, 'utf8');

    // Skip if already converted
    if (content.includes('import { ToolBase }') || content.includes('export const TOOL_CONFIG')) {
        console.log(`   ⏭️  Already converted`);
        return;
    }

    // Add ES module imports at the top
    const imports = `// ES Module imports
import { ToolBase } from './tool-base.js';
import { ComponentLibrary } from '../shared/component-library.js';

`;

    // Replace IIFE wrapper
    content = content.replace(
        /\(function\(\) \{\s*['"]use strict['"];?\s*/,
        imports
    );

    // Convert var TOOL_CONFIG to export const TOOL_CONFIG
    content = content.replace(
        /\bvar TOOL_CONFIG = /g,
        'export const TOOL_CONFIG = '
    );

    // Convert function constructor to class
    // This is more complex - need to find the constructor function
    const constructorMatch = content.match(/function (\w+Tool)\(container, deps\) \{([\s\S]*?)\}/);
    if (constructorMatch) {
        const className = constructorMatch[1];
        const constructorBody = constructorMatch[2];

        // Convert to class constructor
        const classConstructor = `export class ${className} {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...deps
        };`;

        content = content.replace(
            /function \w+Tool\(container, deps\) \{[\s\S]*?this\.render\(\);\s*\}/,
            classConstructor + constructorBody.replace('this.render();', 'this.render();')
        );

        // Convert prototype methods to class methods
        content = content.replace(
            new RegExp(`${className}\\.prototype\\.(\\w+) = function`, 'g'),
            '$1('
        );

        // Close the class
        content = content.replace(
            /window\.\w+Tool = \w+Tool;\s*console\.log\([^)]+\);\s*\}\)\(\);?/,
            `}

console.log('✅ ${className} loaded (ES Module)');`
        );
    }

    // Update render method to use imported ToolBase
    content = content.replace(
        /if \(!window\.ToolBase\) \{\s*throw new Error\('ToolBase not loaded'\);\s*\}/g,
        ''
    );

    content = content.replace(
        /new window\.ToolBase\(/g,
        'new ToolBase('
    );

    // Write back the converted file
    fs.writeFileSync(toolPath, content, 'utf8');
    console.log(`   ✅ Converted ${toolFile}`);
});

console.log('\n🎉 Tool conversion complete!');
console.log('📦 Run: npm run dev');
console.log('🧪 Test the tools at http://localhost:3000/#tools');

