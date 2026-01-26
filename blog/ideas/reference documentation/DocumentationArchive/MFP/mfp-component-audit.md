# Component Library Audit for MFP Refactor

## Available Components (Relevant to MFP)

### ✅ Input Components (Can Use Directly)

#### 1. **FilamentPicker** ⭐ PERFECT FIT
**Location**: `components/input/FilamentPicker.js`
**What it does**:
- Multi-select color swatches with visual grid
- Min/max selection constraints (2-10 filaments) ✅
- Search/filter functionality
- Order preservation (shows 1, 2, 3... on selected)
- onChange callback with `(indices, colors)`

**Usage in MFP-Source.js**:
```javascript
import { FilamentPicker } from '../../shared/components/input/FilamentPicker.js';

const picker = new FilamentPicker({
    palette: FILAMENT_COLOURS, // [{h, n}, ...]
    min: 2,
    max: 10,
    selectedIndices: this.state.selectedFilaments,
    label: 'Select Filaments',
    onChange: (indices, colors) => {
        this.state.selectedFilaments = indices;
        this.onUpdate('filaments', indices);
    }
}, this.deps);
```

**Status**: ✅ Ready to use, no modifications needed

---

#### 2. **FileInput**
**Location**: `components/input/FileInput.js`
**What it does**:
- File upload with drag/drop
- Accept filters (image/*, .zip, .csv)
- onChange callback with file object

**Usage in MFP**:
```javascript
import { FileInput } from '../../shared/components/input/FileInput.js';

// For scan images
const scanInput = new FileInput({
    label: 'Upload Scan Image',
    accept: 'image/*',
    onChange: (file) => this._loadScanImage(file)
}, this.deps);

// For project ZIPs
const projectInput = new FileInput({
    label: 'Import Project ZIP',
    accept: '.zip',
    onChange: (file) => this._importProject(file)
}, this.deps);
```

**Status**: ✅ Ready to use

---

#### 3. **NumericInput**
**Location**: `interactive.js`
**What it does**:
- Number input with constraints (min, max, step)
- Stepper buttons (+/-)
- onChange callback

**Usage in MFP**:
```javascript
import { NumericInput } from '../../shared/component-library.js';

const layerInput = new NumericInput({
    label: 'Layer Count',
    value: 6,
    min: 2,
    max: 20,
    step: 1,
    onChange: (value) => this.onUpdate('layerCount', value)
}, this.deps);
```

**Status**: ✅ Ready to use

---

#### 4. **Dropdown (Select)**
**Location**: `components/input/Dropdown.js`
**What it does**:
- Standard dropdown select
- Options array
- onChange callback

**Usage in MFP**:
```javascript
import { Dropdown } from '../../shared/components/input/Dropdown.js';

const sortDropdown = new Dropdown({
    label: 'Sort Method',
    options: ['Layer Count', 'Sequence', 'Brightness'],
    selected: 'Layer Count',
    onChange: (value) => this.onUpdate('sortMethod', value)
}, this.deps);
```

**Status**: ✅ Ready to use

---

#### 5. **ToggleGroup**
**Location**: `components/input/ToggleGroup.js`
**What it does**:
- Multi-select checkboxes or radio buttons
- Returns array of selected values
- onChange callback

**Usage in MFP**:
```javascript
import { ToggleGroup } from '../../shared/components/input/ToggleGroup.js';

const gridOptions = new ToggleGroup({
    label: 'Grid Overlay Options',
    options: [
        { label: 'Show Sample Zones', value: 'sample' },
        { label: 'Show Expected Colors', value: 'colors' },
        { label: 'Flip/Mirror', value: 'flip' }
    ],
    selected: ['sample'],
    multiSelect: true,
    onChange: (selected) => this.onUpdate('gridOptions', selected)
}, this.deps);
```

**Status**: ✅ Ready to use

---

### ✅ Output Components (Can Use Directly)

#### 6. **StatusDisplay**
**Location**: `content.js`
**What it does**:
- Styled status messages (success, error, warning, info)
- Auto-updates text
- VGA-colored states

**Usage in MFP**:
```javascript
import { StatusDisplay } from '../../shared/component-library.js';

const status = new StatusDisplay({
    status: 'idle', // 'idle' | 'success' | 'error' | 'warning' | 'info'
    message: 'Ready to generate grid'
}, this.deps);

// Update later
status.setStatus('success', '✅ Grid generated: 4c6L 78×70');
```

**Status**: ✅ Ready to use

---

#### 7. **ProgressBar**
**Location**: `interactive.js` and `components/output/ProgressBar.js`
**What it does**:
- Animated progress indicator
- Percentage display
- Label text

**Usage in MFP** (for analysis):
```javascript
import { ProgressBar } from '../../shared/component-library.js';

const progress = new ProgressBar({
    label: 'Analyzing scan...',
    value: 0,
    max: 100,
    showPercentage: true
}, this.deps);

// Update during analysis
progress.setValue(50);
progress.setLabel('Analyzing tile 50/100');
```

**Status**: ✅ Ready to use

---

#### 8. **AnimationExport** ⭐ EXCELLENT PATTERN
**Location**: `components/output/AnimationExport.js`
**What it does**:
- Detects animation type (loop, sequence, infinite)
- Multiple export formats (frames, video, GIF)
- Pre-rendering without playback
- Progress tracking

**Relevance to MFP**:
This is a **perfect architectural pattern** for how we should structure the export logic!
- Modular export component
- Progress tracking
- Format selection
- Async rendering with RAF throttling

**Status**: ⭐ Study this pattern for MFP-Export module design

---

### ✅ Container Components (Can Use Directly)

#### 9. **Collection**
**Location**: `components/container/Collection.js`
**What it does**:
- Grid/list layout for items
- Selectable items
- Item types: swatch, card, list
- Used internally by FilamentPicker

**Usage in MFP** (for visual analysis view):
```javascript
import { Collection } from '../../shared/components/container/Collection.js';

const tileGrid = new Collection({
    items: this.scanAnalysis.map(tile => ({
        id: tile.index,
        color: tile.hex,
        label: tile.sequenceStr
    })),
    layout: 'grid',
    columns: gridData.cols,
    itemType: 'swatch',
    itemSize: 2.5,
    selectable: true,
    onSelect: (id) => this.showTileDetails(id)
}, this.deps);
```

**Status**: ✅ Ready to use (especially for analysis view)

---

#### 10. **Panel**
**Location**: `layout.js`
**What it does**:
- VGA-styled content panel
- Borders, padding, background
- Optional header

**Usage in MFP** (for grouping controls):
```javascript
import { Panel } from '../../shared/component-library.js';

const controlPanel = new Panel({
    header: 'Grid Generation',
    content: [filamentPicker, layerInput, generateButton]
}, this.deps);
```

**Status**: ✅ Ready to use

---

#### 11. **Section**
**Location**: `components/container/Section.js`
**What it does**:
- Semantic content sections
- Collapsible/expandable
- Header styling

**Usage in MFP** (for sidebar organization):
```javascript
import { Section } from '../../shared/components/container/Section.js';

const exportSection = new Section({
    title: 'STL Export',
    collapsible: true,
    collapsed: false,
    content: [layerHeightInput, exportButton]
}, this.deps);
```

**Status**: ✅ Ready to use

---

### ✅ Tool-Specific Components

#### 12. **ToolBase** ⭐ CORE ARCHITECTURE
**Location**: `tools/core/tool-base.js`
**What it does**:
- Tab management
- Sidebar rendering
- Canvas setup
- Value tracking
- Event delegation

**MFP Usage**:
```javascript
import { ToolBase } from '../../core/tool-base.js';

const config = {
    title: 'Multifilament Print',
    tabs: ['SOURCE', 'SCAN', 'QUANTIZE', 'EXPORT'],
    defaultTab: 'SOURCE',
    canvasConfig: { enabled: true, width: 800, height: 600 },
    onTabChange: (tab) => this.handleTabChange(tab),
    onUpdate: (tab, key, value, all) => this.handleUpdate(tab, key, value, all),
    onDraw: (ctx, canvas, tab) => this.handleDraw(ctx, canvas, tab)
};

this.toolBase = new ToolBase(config);
```

**Status**: ✅ Already using correctly

---

### ✅ Specialized Components

#### 13. **VGAGrid**
**Location**: `specialized.js`
**What it does**:
- Grid display with VGA colors
- ASCII-style grid rendering
- Cell highlighting

**Usage in MFP** (for reference grid preview):
```javascript
import { VGAGrid } from '../../shared/component-library.js';

const gridPreview = new VGAGrid({
    rows: gridData.rows,
    cols: gridData.cols,
    cellData: gridData.sequences.map(seq => ({
        color: simColour(seq, colours),
        label: seq.join('')
    }))
}, this.deps);
```

**Status**: 🤔 Could be useful for small grid previews

---

## ❌ Components We DON'T Need (Already Have Better)

1. **Button** - ToolBase handles buttons via sidebar config
2. **Input** - ToolBase handles text inputs via sidebar config
3. **Canvas** - ToolBase provides canvas directly
4. **Table** - Not needed for MFP

---

## 🆕 Components We Should CREATE

### 1. **ProjectStatusBar** (NEW)
**Why**: Persistent status across all tabs
**Pattern**: Similar to StatusDisplay but sticky/persistent
**Implementation**: Extend BaseComponent, render at top of ToolBase
**Location**: `components/tool/ProjectStatusBar.js`

**Design**:
```javascript
export class ProjectStatusBar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'project-status-bar' }, deps);
        
        this.gridInfo = options.gridInfo ?? null; // {colors, layers, rows, cols}
        this.scanInfo = options.scanInfo ?? null; // {analyzed, avgDeviation}
        this.onClear = options.onClear ?? (() => {});
    }
    
    render() {
        // Sticky bar with VGA styling
        // Shows: Grid status, Scan status, Clear button
    }
}
```

---

### 2. **CornerTransformCanvas** (NEW)
**Why**: Reusable corner-drag transform for any canvas overlay
**Pattern**: Wrapper around canvas with transform state
**Implementation**: Extends BaseComponent
**Location**: `components/specialized/CornerTransformCanvas.js`

**Design**:
```javascript
export class CornerTransformCanvas extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'corner-transform-canvas' }, deps);
        
        this.baseCanvas = options.canvas;
        this.corners = options.corners ?? [];
        this.onTransform = options.onTransform ?? (() => {});
        
        // Manages: corner dragging, body dragging, rendering handles
    }
}
```

---

## 📋 Component Usage Plan for MFP Modules

### MFP-Source.js
```javascript
import { FilamentPicker } from '../../shared/components/input/FilamentPicker.js';
import { NumericInput } from '../../shared/component-library.js';
import { Dropdown } from '../../shared/components/input/Dropdown.js';
import { FileInput } from '../../shared/components/input/FileInput.js';
import { StatusDisplay } from '../../shared/component-library.js';
import { Panel } from '../../shared/component-library.js';

getSidebar() {
    return [
        new Panel({
            header: 'Filament Selection',
            content: [
                new FilamentPicker({ palette: FILAMENT_COLOURS, ... }),
                new StatusDisplay({ ... })
            ]
        }),
        new Panel({
            header: 'Grid Parameters',
            content: [
                new NumericInput({ label: 'Layer Count', ... }),
                new NumericInput({ label: 'Tile Size', ... }),
                new Dropdown({ label: 'Sort Method', ... })
            ]
        })
    ];
}
```

### MFP-Scan.js
```javascript
import { FileInput } from '../../shared/components/input/FileInput.js';
import { NumericInput } from '../../shared/component-library.js';
import { ToggleGroup } from '../../shared/components/input/ToggleGroup.js';
import { ProgressBar } from '../../shared/component-library.js';
import { StatusDisplay } from '../../shared/component-library.js';
import { Collection } from '../../shared/components/container/Collection.js';

// Analysis view uses Collection for tile grid
showAnalysisView() {
    const tileGrid = new Collection({
        items: this.scanAnalysis.map(...),
        layout: 'grid',
        columns: gridData.cols,
        itemType: 'swatch'
    });
}
```

### MFP-Export.js
```javascript
import { NumericInput } from '../../shared/component-library.js';
import { ToggleGroup } from '../../shared/components/input/ToggleGroup.js';
import { ProgressBar } from '../../shared/component-library.js';
import { StatusDisplay } from '../../shared/component-library.js';

// Follow AnimationExport pattern for ZIP generation
exportProject() {
    const progress = new ProgressBar({ ... });
    // Async ZIP generation with progress updates
}
```

---

## Summary: Component Mapping

| MFP Feature | Component | Location | Status |
|-------------|-----------|----------|--------|
| Filament selection | **FilamentPicker** | `components/input/` | ✅ Perfect fit |
| File upload | **FileInput** | `components/input/` | ✅ Ready |
| Number inputs | **NumericInput** | `interactive.js` | ✅ Ready |
| Dropdowns | **Dropdown** | `components/input/` | ✅ Ready |
| Checkboxes | **ToggleGroup** | `components/input/` | ✅ Ready |
| Status messages | **StatusDisplay** | `content.js` | ✅ Ready |
| Progress bars | **ProgressBar** | `interactive.js` | ✅ Ready |
| Tile grid view | **Collection** | `components/container/` | ✅ Ready |
| Control grouping | **Panel** / **Section** | `layout.js` / `container/` | ✅ Ready |
| Canvas overlays | **CornerTransformCanvas** | NEW | 🆕 Create |
| Project status | **ProjectStatusBar** | NEW | 🆕 Create |

---

## Next Steps

1. ✅ **Use existing components** - No need to reinvent FilamentPicker, FileInput, etc.
2. 🆕 **Create 2 new components**:
   - `ProjectStatusBar` - Persistent cross-tab status
   - `CornerTransformCanvas` - Reusable transform overlay
3. ✅ **Follow AnimationExport pattern** - For async export with progress
4. ✅ **Use Collection for analysis view** - Grid of color swatches

**Result**: Much less custom code, better consistency, follows site standards!

