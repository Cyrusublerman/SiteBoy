#!/usr/bin/env node

/**
 * Regenerate the blog docs routing manifest.
 * - Scans blog/docs for .md files
 * - Excludes archive folders: temp, old-docs
 * - Emits blog/blog-docs-manifest.js as an ES module
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOTS = [
    { key: 'docs', dir: path.join(__dirname, 'docs'), exclude: new Set(['temp', 'old-docs']) },
    { key: 'ideas', dir: path.join(__dirname, 'ideas'), exclude: new Set() },
    { key: 'tools', dir: path.join(__dirname, 'tools'), exclude: new Set() },
    { key: 'music', dir: path.join(__dirname, 'music'), exclude: new Set() }
];
const OUTPUT_JS = path.join(__dirname, 'blog-docs-manifest.js');
const OUTPUT_JSON = path.join(__dirname, 'blog-docs-manifest.json');
const toPosix = (p) => p.split(path.sep).join('/');

const formatTitle = (raw) => {
    if (!raw) return '';
    return raw
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

async function readTitle(filePath) {
    try {
        const content = await fs.promises.readFile(filePath, 'utf8');
        const match = content.match(/^#\s+(.+)$/m);
        if (match && match[1]) return match[1].trim();
    } catch (err) {
        console.warn(`⚠️ Could not read title from ${filePath}: ${err.message}`);
    }
    return null;
}

function isExcluded(segments, excludeSet) {
    return segments.some((seg) => excludeSet.has(seg));
}

async function walkRoot(rootKey, baseDir, excludeSet, relParts = [], accumulator = []) {
    const currentDir = path.join(baseDir, ...relParts);
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const nextRelParts = [...relParts, entry.name];

        if (entry.isDirectory()) {
            if (isExcluded(nextRelParts, excludeSet)) {
                continue;
            }
            await walkRoot(rootKey, baseDir, excludeSet, nextRelParts, accumulator);
            continue;
        }

        if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) {
            continue;
        }

        const filePath = path.join(currentDir, entry.name);
        const relPathFromRoot = toPosix(path.relative(baseDir, filePath)).replace(/^\.\//, '');
        const segments = relPathFromRoot.split('/');
        const fileName = entry.name.replace(/\.md$/i, '');
        const dirSegments = segments.slice(0, -1);

        if (isExcluded(dirSegments, excludeSet)) {
            continue;
        }

        const title =
            (await readTitle(filePath)) ||
            formatTitle(fileName) ||
            fileName;

        const slug = [rootKey, ...dirSegments, fileName].join('/');
        const route = `#blog/${slug}`;

        accumulator.push({
            slug,
            route,
            title,
            relPath: `${rootKey}/${relPathFromRoot}`,
            segments: dirSegments,
            fileName
        });
    }

    return accumulator;
}

function buildTree(files) {
    const root = { type: 'root', children: [] };

    const ensureRootFolder = (parent, rootName) => {
        let node = parent.children.find(
            (child) => child.type === 'root-folder' && child.name === rootName
        );
        if (!node) {
            node = { type: 'root-folder', name: rootName, title: formatTitle(rootName), children: [] };
            parent.children.push(node);
        }
        return node;
    };

    const ensureFolder = (parent, folderName) => {
        let node = parent.children.find(
            (child) => child.type === 'folder' && child.name === folderName
        );
        if (!node) {
            node = { type: 'folder', name: folderName, title: formatTitle(folderName), children: [] };
            parent.children.push(node);
        }
        return node;
    };

    files.forEach((file) => {
        const [rootName, ...rest] = file.slug.split('/');
        let cursor = ensureRootFolder(root, rootName);
        const tailSegments = rest.slice(0, -1);
        tailSegments.forEach((segment) => {
            cursor = ensureFolder(cursor, segment);
        });
        cursor.children.push({
            type: 'file',
            name: file.fileName,
            title: file.title,
            slug: file.slug,
            route: file.route,
            relPath: file.relPath
        });
    });

    return root;
}

async function generateManifest() {
    const missingRoots = ROOTS.filter(r => !fs.existsSync(r.dir)).map(r => r.dir);
    if (missingRoots.length) {
        console.error('❌ Required blog roots not found:', missingRoots.join(', '));
        process.exit(1);
    }

    const files = [];
    for (const root of ROOTS) {
        await walkRoot(root.key, root.dir, root.exclude, [], files);
    }
    files.sort((a, b) => a.slug.localeCompare(b.slug));

    const flatRoutes = ['#blog', ...files.map((f) => f.route)];
    const tree = buildTree(files);

    const manifest = {
        generatedAt: new Date().toISOString(),
        flatRoutes,
        files,
        tree
    };

    const jsBanner = `// Auto-generated by blog/refresh-blog-manifest.js - DO NOT EDIT\n// Generated at ${manifest.generatedAt}\n\n`;
    const jsBody = `(function(root){\n  const manifest = ${JSON.stringify(manifest, null, 2)};\n  if (root) { root.blogDocsManifest = manifest; }\n})(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this));\n`;

    await fs.promises.writeFile(OUTPUT_JS, jsBanner + jsBody, 'utf8');
    await fs.promises.writeFile(OUTPUT_JSON, JSON.stringify(manifest, null, 2), 'utf8');

    console.log(`✅ Blog docs manifest updated: ${path.relative(process.cwd(), OUTPUT_JS)}`);
    console.log(`📄 Routes: ${flatRoutes.length}`);
}

generateManifest().catch((err) => {
    console.error('❌ Failed to generate blog docs manifest:', err);
    process.exit(1);
});

