#!/usr/bin/env node

/**
 * Component Library Verification Script
 *
 * Systematically checks all ComponentLibrary exports against imports
 * to ensure no components are missing or incorrectly imported.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the component-library.js file
const componentLibraryPath = join(__dirname, '..', 'assets', 'js', 'shared', 'component-library.js');
const content = readFileSync(componentLibraryPath, 'utf-8');

console.log('🔍 Component Library Verification');
console.log('================================');

// Extract all imports
const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
const imports = [];
let match;

while ((match = importRegex.exec(content)) !== null) {
    const [_, importList, modulePath] = match;
    console.log(`Processing import from ${modulePath}:`);
    console.log(`Raw import list: ${importList.substring(0, 100)}...`);

    // Split by comma but be careful with comments
    // First remove all comment lines
    const withoutComments = importList.split('\n')
        .map(line => {
            const commentIndex = line.indexOf('//');
            return commentIndex !== -1 ? line.substring(0, commentIndex) : line;
        })
        .join('\n')
        .replace(/\n/g, ' ')  // Replace newlines with spaces
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .trim();

    const items = withoutComments.split(',')
        .map(item => item.trim())
        .filter(item => item);

    console.log(`Parsed items: ${items.join(', ')}`);

    imports.push({
        module: modulePath,
        components: items.map(item => {
            // Handle aliases like "Component as Alias"
            const parts = item.split(/\s+as\s+/);
            return {
                name: parts[0].trim(),
                alias: parts[1] ? parts[1].trim() : parts[0].trim()
            };
        })
    });
}

console.log(`📦 Found ${imports.length} import statements:`);
imports.forEach(imp => {
    console.log(`  ${imp.module}: ${imp.components.map(c => c.alias).join(', ')}`);
});

// Extract ComponentLibrary object properties
const componentLibraryStart = content.indexOf('export const ComponentLibrary = {');

if (componentLibraryStart === -1) {
    console.error('❌ Could not find ComponentLibrary export');
    process.exit(1);
}

// Find the matching closing brace by counting braces
let openBraces = 0;
let componentLibraryEnd = componentLibraryStart;
let inString = false;
let stringChar = '';

for (let i = componentLibraryStart; i < content.length; i++) {
    const char = content[i];

    // Handle strings
    if ((char === '"' || char === "'") && content[i-1] !== '\\') {
        if (!inString) {
            inString = true;
            stringChar = char;
        } else if (char === stringChar) {
            inString = false;
            stringChar = '';
        }
        continue;
    }

    // Skip string content
    if (inString) continue;

    // Count braces
    if (char === '{') {
        openBraces++;
    } else if (char === '}') {
        openBraces--;
        if (openBraces === 0) {
            componentLibraryEnd = i + 1;
            break;
        }
    }
}

const componentLibraryContent = content.slice(componentLibraryStart, componentLibraryEnd);

// Debug: show what we captured
console.log('Captured ComponentLibrary content length:', componentLibraryContent.length);
console.log('First 500 chars:', componentLibraryContent.substring(0, 500));
console.log('Last 500 chars:', componentLibraryContent.substring(componentLibraryContent.length - 500));

// Extract all direct component references (not methods or nested objects)
const exportedComponents = [];
const lines = componentLibraryContent.split('\n');

for (const line of lines) {
    // Match direct component references like "ComponentName," or "ComponentName,"
    const componentMatch = line.match(/^\s*([A-Z][a-zA-Z0-9_]*),?\s*$/);
    if (componentMatch) {
        const component = componentMatch[1];
        // Skip known non-components
        if (!['version', 'Tool'].includes(component.toLowerCase())) {
            exportedComponents.push(component);
            console.log('Found exported component:', component);
        }
    }
}

console.log(`\n📋 ComponentLibrary exports ${exportedComponents.length} components:`);
console.log(`  ${exportedComponents.join(', ')}`);

// Check for missing imports
const allImportedComponents = new Set();
imports.forEach(imp => {
    imp.components.forEach(comp => {
        allImportedComponents.add(comp.alias);
        // Also add the original name for aliases
        if (comp.name !== comp.alias) {
            allImportedComponents.add(comp.name);
        }
    });
});

const missingImports = [];
const extraImports = [];

exportedComponents.forEach(comp => {
    if (!allImportedComponents.has(comp)) {
        missingImports.push(comp);
    }
});

// Check for extra imports (components imported but not exported)
allImportedComponents.forEach(comp => {
    if (!exportedComponents.includes(comp)) {
        // Skip known aliases and non-component imports
        if (!comp.includes('Tool') && !['BaseComponent', 'BaseNavigationDropdown'].includes(comp)) {
            // Skip comments and special cases
            if (!comp.includes('//') && !comp.includes('Output components')) {
                extraImports.push(comp);
            }
        }
    }
});

console.log('\n🔍 Verification Results:');
console.log('=======================');

if (missingImports.length === 0 && extraImports.length === 0) {
    console.log('✅ All components properly imported and exported!');
} else {
    if (missingImports.length > 0) {
        console.log(`❌ Missing imports for: ${missingImports.join(', ')}`);
    }

    if (extraImports.length > 0) {
        console.log(`⚠️  Extra imports (not exported): ${extraImports.join(', ')}`);
    }
}

// Detailed breakdown by module
console.log('\n📊 Import Breakdown:');
imports.forEach(imp => {
    const moduleName = imp.module.split('/').pop();
    const componentCount = imp.components.length;
    console.log(`  ${moduleName}: ${componentCount} components`);
});

console.log(`\n📈 Summary:`);
console.log(`  - Import statements: ${imports.length}`);
console.log(`  - Total imported components: ${allImportedComponents.size}`);
console.log(`  - Exported components: ${exportedComponents.length}`);
console.log(`  - Missing imports: ${missingImports.length}`);
console.log(`  - Extra imports: ${extraImports.length}`);

if (missingImports.length > 0) {
    console.log('\n💡 To fix missing imports, add them to the appropriate import statement in component-library.js');
    process.exit(1);
} else {
    console.log('\n🎉 Component Library verification passed!');
    process.exit(0);
}
