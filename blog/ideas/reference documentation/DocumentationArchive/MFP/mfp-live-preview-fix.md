# FIX: Filament Picker Updates & Live Grid Generation

## Issues

1. **Filament dropdowns not updating**: When filaments are selected in the picker, the base/top/gap filament dropdowns don't update with the selected filament names
2. **No live preview**: Grid generation should happen automatically as settings change (live preview)

---

## Solution

### 1. Update Filament Dropdowns When Picker Changes

In `MFP-Main.js`, update the `filamentPicker` case to:

```javascript
case 'filamentPicker': 
    this.sharedState.selectedFilaments = value || [];
    
    // Get selected filament names
    const selectedNames = value.map(idx => FILAMENT_COLOURS[idx].n);
    const defaultFilament = selectedNames[0] || 'Jade White';
    
    // Update base/top/gap filament dropdowns with new options
    const baseDropdown = this.toolBase.components.get('baseFilament');
    const topDropdown = this.toolBase.components.get('topFilament');
    const gapDropdown = this.toolBase.components.get('gapFilament');
    
    if (baseDropdown && typeof baseDropdown.setOptions === 'function') {
        baseDropdown.setOptions(selectedNames);
        if (!selectedNames.includes(baseDropdown.value)) {
            baseDropdown.setValue(defaultFilament);
        }
    }
    
    if (topDropdown && typeof topDropdown.setOptions === 'function') {
        topDropdown.setOptions(selectedNames);
        if (!selectedNames.includes(topDropdown.value)) {
            topDropdown.setValue(defaultFilament);
        }
    }
    
    if (gapDropdown && typeof gapDropdown.setOptions === 'function') {
        gapDropdown.setOptions(selectedNames);
        if (!selectedNames.includes(gapDropdown.value)) {
            gapDropdown.setValue(defaultFilament);
        }
    }
    
    // Update sequence count
    this.sourceActions.updateSequenceCount(this.toolBase);
    
    // Trigger live preview
    if (value.length >= 2) {
        this.sourceActions.generateLivePreview(allValues, this.toolBase);
    }
    break;
```

### 2. Add Live Preview Generation

In `MFP-SourceActions.js`, add a new method:

```javascript
/**
 * Generate live preview (non-final grid for immediate feedback)
 */
generateLivePreview(values, toolBase) {
    const selectedIndices = this.sharedState.selectedFilaments || [];
    
    if (!selectedIndices || selectedIndices.length < 2) {
        return; // Not enough filaments
    }
    
    if (selectedIndices.length > 10) {
        return; // Too many filaments
    }
    
    try {
        const colours = selectedIndices.map(idx => FILAMENT_COLOURS[idx]);
        const layerCount = values.layerCount || 4;
        const baseLayers = values.baseLayers || 2;
        const tileSize = values.tileSize || 10;
        const gap = values.gap || 2;
        const perimeterMargin = values.perimeterMargin || 0;
        const maxWidth = values.bedWidth || values.maxWidth || 220;
        const maxHeight = values.bedHeight || values.maxHeight || 220;
        
        // Generate sequences
        const sequences = [];
        const numColours = colours.length;
        const numVariableLayers = layerCount - baseLayers;
        
        for (let i = 0; i < Math.pow(numColours, numVariableLayers); i++) {
            const seq = Array(layerCount).fill(0);
            
            // Base layers
            for (let layer = 0; layer < baseLayers; layer++) {
                seq[layer] = (layer % numColours) + 1;
            }
            
            // Variable layers
            let index = i;
            for (let layer = baseLayers; layer < layerCount; layer++) {
                seq[layer] = (index % numColours) + 1;
                index = Math.floor(index / numColours);
            }
            
            sequences.push(seq);
        }
        
        this.state.sequences = sequences;
        
        // Calculate layout
        const layout = calculateGridLayout({
            sequenceCount: sequences.length,
            tileSize,
            gap,
            perimeterMargin,
            maxWidth,
            maxHeight
        });
        
        // Store grid data as PREVIEW
        this.state.gridData = {
            sequences,
            colours,
            rows: layout.rows,
            cols: layout.cols,
            tileSize,
            gap,
            width: layout.width,
            height: layout.height,
            layerCount,
            baseLayers,
            perimeterMargin,
            emptyCells: layout.emptyCells || [],
            fitsConstraints: layout.fits,
            isPreview: true  // Mark as preview
        };
        
        // Build sequence map
        this.state.sequenceMap = buildSequenceMap(sequences, colours, layout.cols, { simColour, rgb_to_key });
        
        // Update status
        if (layout.fits) {
            toolBase.updateValue('gridStatus', `👁️ Preview: ${layout.rows}×${layout.cols} = ${sequences.length} tiles (${layout.width.toFixed(1)}×${layout.height.toFixed(1)}mm)`);
        } else {
            toolBase.updateValue('gridStatus', `⚠️ Preview: Won't fit (${layout.width.toFixed(1)}×${layout.height.toFixed(1)}mm). Max: ${maxWidth}×${maxHeight}mm`);
        }
        
        // Draw preview
        toolBase.draw();
        
    } catch (err) {
        console.error('Live preview error:', err);
    }
}
```

### 3. Trigger Live Preview on ALL Setting Changes

Update other cases in `_handleUpdate` to trigger live preview:

```javascript
// In _handleUpdate method, add after each setting change:
case 'layerCount':
case 'baseLayers':
case 'topLayers':
case 'tileSize':
case 'gap':
case 'perimeterMargin':
case 'bedWidth':
case 'bedHeight':
case 'sortMethod':
    // Trigger live preview if we have enough filaments
    if (this.sharedState.selectedFilaments && this.sharedState.selectedFilaments.length >= 2) {
        this.sourceActions.generateLivePreview(allValues, this.toolBase);
    }
    break;
```

### 4. Update generateGrid to Finalize Preview

In `MFP-SourceActions.js`, update `generateGrid`:

```javascript
generateGrid(values, toolBase) {
    const selectedIndices = values.filamentPicker || this.sharedState.selectedFilaments || [];
    
    if (!selectedIndices || selectedIndices.length < 2) {
        toolBase.updateValue('gridStatus', '❌ Select at least 2 filaments first');
        return;
    }
    
    // If we already have a preview, just finalize it
    if (this.state.gridData && this.state.gridData.isPreview) {
        if (this.state.gridData.fitsConstraints) {
            // Mark as finalized
            this.state.gridData.isPreview = false;
            this.state.gridData.sortMethod = values.sortMethod || 'Layer Count';
            
            // Save to localStorage
            localStorage.setItem('lastGridData', JSON.stringify(this.state.gridData));
            
            toolBase.updateValue('gridStatus', `✅ Grid finalized: ${this.state.gridData.rows}×${this.state.gridData.cols} = ${this.state.sequences.length} tiles (${this.state.gridData.width.toFixed(1)}×${this.state.gridData.height.toFixed(1)}mm)`);
            toolBase.draw();
            return;
        } else {
            // Oversized - offer split or show error
            toolBase.updateValue('gridStatus', `❌ Grid won't fit. Reduce layers, colors, or tile size.`);
            return;
        }
    }
    
    // No preview exists - generate from scratch
    this.generateLivePreview(values, toolBase);
    if (this.state.gridData) {
        this.state.gridData.isPreview = false;
        toolBase.updateValue('gridStatus', `✅ Grid: ${this.state.gridData.rows}×${this.state.gridData.cols} = ${this.state.sequences.length} tiles`);
    }
}
```

---

## Implementation Steps

1. Update `MFP-Main.js` `_handleUpdate` method - filamentPicker case
2. Add `generateLivePreview` method to `MFP-SourceActions.js`
3. Update `generateGrid` to finalize previews
4. Add live preview triggers to all setting changes

---

## Result

- ✅ Filament dropdowns update immediately when picker changes
- ✅ Grid preview generates live as you adjust settings
- ✅ "Generate Grid" button finalizes the preview
- ✅ Instant visual feedback

---

## Alternative: Debounced Live Preview

If live preview is too aggressive, add debouncing:

```javascript
// In MFP-Main constructor
this.livePreviewDebounce = null;

// In _handleUpdate
const triggerLivePreview = () => {
    clearTimeout(this.livePreviewDebounce);
    this.livePreviewDebounce = setTimeout(() => {
        if (this.sharedState.selectedFilaments?.length >= 2) {
            this.sourceActions.generateLivePreview(allValues, this.toolBase);
        }
    }, 300); // 300ms delay
};
```

This prevents excessive calculations while dragging sliders.

