/**
 * MFP-ExportActions.js
 *
 * OUTPUTS tab logic — quantised image → per-filament STL files, JSON export,
 * and complete project ZIP delegation.
 * NO DOM manipulation; pure logic only.
 */

import { exportArtworkSTLs, vectorizePixels, generateBox } from '../../../shared/algorithms/geometry/stl-generation.js';
import {
    buildAbsoluteLayerMaps,
    createRecipeManifest,
    getAbsoluteLayerCount
} from './MFP-RecipeIntegrity.js';

export class MFPExportActions {
    constructor(sharedState) {
        this.state = sharedState;
    }

    /** Yield to the event loop so the browser can repaint between heavy steps. */
    _yield() { return new Promise(r => setTimeout(r, 0)); }

    // ─────────────────────────────────────────────────────────────────────────
    // ARTWORK STL PIPELINE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Main entry: quantised image → layerMaps → STL files + preview data.
     * Stores results in state.exportSTLData for canvas preview and download.
     */
    async generateArtworkSTL(values, toolBase) {
        const qsm = this.state.quantizedSequenceMap;
        if (!qsm) {
            toolBase.setValue('exportArtworkStatus', '❌ Quantise image first (QUANTIZE tab)');
            return;
        }

        try {
            toolBase.setValue('exportArtworkStatus', '⏳ [1/2] Building layer maps…');
            await this._yield();

            const { width, height, map, palette } = qsm;
            const printWidth  = parseFloat(values.stlPrintWidth)  || 170;
            const layerHeight = parseFloat(values.stlLayerHeight) || 0.08;
            const pixelSize   = printWidth / width;

            const filamentNames = this._deriveFilamentNames(palette);
            const filamentCount = filamentNames.length;
            const declaredLayerCount = this.state.quantizationConfig?.layerCount ?? qsm.layerCount ?? null;
            const absoluteLayerCount = getAbsoluteLayerCount(palette, declaredLayerCount);
            const layerMaps = this._expandQuantizedToLayers(
                map,
                width,
                height,
                palette,
                filamentCount,
                absoluteLayerCount
            );
            const recipeManifest = await createRecipeManifest(palette, {
                layerCount: absoluteLayerCount,
                layerHeight,
                filamentProfiles: this.state.quantizationConfig?.filaments || [],
                processProfileRevision: this.state.quantizationConfig?.processProfileRevision ?? null,
                backingProfileRevision: this.state.quantizationConfig?.backingProfileRevision ?? null,
                viewingSide: 'front'
            });

            // Set layer maps immediately so artwork layer views work
            // while contour STL geometry is processed.
            this.state.exportSTLData = {
                stls: {},
                layerMaps,
                filamentNames,
                palette,
                recipeManifest,
                config: {
                    imageWidth: width,
                    imageHeight: height,
                    printWidth,
                    layerHeight,
                    layerCount: absoluteLayerCount
                }
            };
            toolBase.draw();

            const smoothingConfig = {
                simplifyTolerance: parseFloat(values.stlSimplifyTolerance) || 0.3,
                chaikinIterations: parseInt(values.stlSmoothIterations, 10) ?? 2,
                minContourArea:    parseFloat(values.stlMinContourArea) || 2
            };

            const { contourSTL } = await import('../../../shared/algorithms/geometry/stl-generation.js');

            const stls = {};
            for (let fi = 0; fi < filamentCount; fi++) {
                toolBase.setValue('exportArtworkStatus',
                    `⏳ [2/3] Contouring filament ${fi + 1}/${filamentCount}…`);
                await this._yield();

                const facetParts = [];
                for (let li = 0; li < layerMaps.length; li++) {
                    const pixels = layerMaps[li][fi];
                    if (pixels.size === 0) continue;

                    const z0 = li * layerHeight;
                    const z1 = z0 + layerHeight;
                    const parts = await contourSTL(pixels, width, height, z0, z1, pixelSize, smoothingConfig);
                    for (let i = 0; i < parts.length; i++) facetParts.push(parts[i]);
                }

                if (facetParts.length > 0) {
                    const name     = filamentNames[fi];
                    const fileName = `artwork_${name.replace(/[^a-zA-Z0-9]/g, '_')}.stl`;
                    stls[fileName] = [`solid Artwork_${name}\n`, ...facetParts, `endsolid Artwork_${name}\n`];
                }
            }

            this.state.exportSTLData.stls = stls;

            const fileCount  = Object.keys(stls).length;
            const layerCount = layerMaps.length;
            const smoothLabel = smoothingConfig.chaikinIterations > 0
                ? ` | smooth: ${smoothingConfig.chaikinIterations}× Chaikin`
                : ' | no smoothing';
            toolBase.setValue('exportArtworkStatus',
                `✅ ${fileCount} STL file${fileCount !== 1 ? 's' : ''} | ${layerCount} layer${layerCount !== 1 ? 's' : ''} | ${width}×${height}px → ${printWidth}mm wide${smoothLabel}`);

            toolBase.draw();

        } catch (err) {
            toolBase.setValue('exportArtworkStatus', `❌ STL generation failed: ${err.message}`);
            console.error('STL generation error:', err);
        }
    }

    /**
     * Expand Uint16Array sequence map → layerMaps[absoluteLayer][filament].
     * Internal and trailing zeroes are physical empty layers and retain z-offset.
     */
    _expandQuantizedToLayers(map, width, height, palette, filamentCount, layerCount = null) {
        return buildAbsoluteLayerMaps({
            map,
            width,
            height,
            palette,
            filamentCount,
            layerCount
        });
    }

    /**
     * Derive ordered filament name list from palette.
     */
    _deriveFilamentNames(palette) {
        const filaments = this.state.quantizationConfig?.filaments || [];

        let maxIdx = 0;
        for (const entry of palette) {
            if (entry.sequence) {
                for (const v of entry.sequence) {
                    if (v > maxIdx) maxIdx = v;
                }
            }
        }

        const names = [];
        for (let i = 1; i <= maxIdx; i++) {
            const fil = filaments[i - 1];
            names.push(fil?.name || fil?.n || `Filament_${i}`);
        }
        return names.length > 0 ? names : ['Filament_1'];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ARTWORK STL DOWNLOAD
    // ─────────────────────────────────────────────────────────────────────────

    async downloadAllSTLs(toolBase) {
        const data = this.state.exportSTLData;
        if (!data || !data.stls || Object.keys(data.stls).length === 0) {
            toolBase.setValue('exportArtworkStatus', '❌ Generate STLs first');
            return;
        }

        try {
            toolBase.setValue('exportArtworkStatus', '⏳ Building ZIP…');

            if (!window.AssetLoader?.ensureJSZip) {
                throw new Error('AssetLoader not available — JSZip cannot be loaded');
            }
            const JSZip = await window.AssetLoader.ensureJSZip();
            const zip   = new JSZip();

            for (const [filename, parts] of Object.entries(data.stls)) {
                zip.file(filename, new Blob(parts, { type: 'text/plain' }));
            }
            if (data.recipeManifest) {
                zip.file('recipe-manifest.json', JSON.stringify(data.recipeManifest, null, 2));
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `artwork-stls-${Date.now()}.zip`;
            a.click();
            URL.revokeObjectURL(url);

            const count = Object.keys(data.stls).length;
            toolBase.setValue('exportArtworkStatus', `✅ Downloaded ${count} STL file${count !== 1 ? 's' : ''} as ZIP`);

        } catch (err) {
            toolBase.setValue('exportArtworkStatus', `❌ ZIP download failed: ${err.message}`);
            console.error('ZIP download error:', err);
        }
    }

    downloadIndividualSTLs(toolBase) {
        const data = this.state.exportSTLData;
        if (!data || !data.stls || Object.keys(data.stls).length === 0) {
            toolBase.setValue('exportArtworkStatus', '❌ Generate STLs first');
            return;
        }

        try {
            let count = 0;
            for (const [filename, parts] of Object.entries(data.stls)) {
                const blob = new Blob(parts, { type: 'text/plain' });
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href     = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                count++;
            }
            toolBase.setValue('exportArtworkStatus', `✅ Downloaded ${count} STL file${count !== 1 ? 's' : ''}`);

        } catch (err) {
            toolBase.setValue('exportArtworkStatus', `❌ Download failed: ${err.message}`);
            console.error('Individual STL download error:', err);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GRID JSON EXPORT
    // ─────────────────────────────────────────────────────────────────────────

    exportJSON(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.setValue('outputsGridActionStatus', '❌ No grid — generate grid first');
            return;
        }

        try {
            const grid = this.state.gridData;

            const layout = {
                version: '1.2.0',
                palette: grid.colours,
                tiles: grid.sequences.map((seq, idx) => ({
                    sequence: seq,
                    row: Math.floor(idx / grid.cols),
                    col: idx % grid.cols
                })),
                metadata: {
                    rows: grid.rows,
                    cols: grid.cols,
                    tileSize: grid.tileSize,
                    gap: grid.gap,
                    layerCount: grid.layerCount,
                    baseLayers: grid.baseLayers,
                    perimeterMargin: grid.perimeterMargin || 0,
                    emptyCells: grid.emptyCells || [],
                    generatedAt: new Date().toISOString()
                }
            };

            const json = JSON.stringify(layout, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `grid-layout-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            toolBase.setValue('outputsGridActionStatus', '✅ Downloaded grid-layout.json');

        } catch (err) {
            toolBase.setValue('outputsGridActionStatus', `❌ JSON export failed: ${err.message}`);
            console.error('JSON export error:', err);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPLETE PROJECT ZIP
    // ─────────────────────────────────────────────────────────────────────────

    async exportCompleteProject(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.setValue('exportProjectStatus', '❌ Generate grid first');
            return;
        }

        try {
            toolBase.setValue('exportProjectStatus', '⏳ Building project ZIP…');

            const { MFPSourceActions } = await import('./MFP-SourceActions.js');
            const sourceActions = new MFPSourceActions(this.state);
            await sourceActions.exportCompletePackage(values, toolBase);

            const hasScans = this.state.scanAnalysis ? ' (with scan data)' : '';
            toolBase.setValue('exportProjectStatus', `✅ Exported complete project ZIP${hasScans}`);

        } catch (err) {
            toolBase.setValue('exportProjectStatus', `❌ ZIP export failed: ${err.message}`);
            console.error('ZIP export error:', err);
        }
    }
}
