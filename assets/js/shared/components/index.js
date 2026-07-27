/**
 * Components Index
 * 
 * Central hub for all tool/UI components.
 * Re-exports from category folders for convenient importing.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
export {
    NumericInput,
    TextInput,
    Select,
    Dropdown,
    Button,
    ToggleGroup,
    FileInput,
    ColorInput,
    EquationEditor,
    DropZone,
    FilamentPicker,
    NoiseTypeSelect,
    NOISE_TYPES,
    EasingCurveInput,
    HSLRangeInput,
} from './input/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// OUTPUT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
export {
    Text,
    Canvas,
    SVG,
    Media,
    ProgressBar,
    AudioOutput,
    OverlayText,
} from './output/index.js';

export {
    DrawCanvas,
    EmitterHandles,
} from './drawing/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// CONTAINER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
export {
    Grid,
    Stack,
    Section,
    Tabs,
    Collection,
    FileTable
} from './container/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN EDITOR CHROME
// ═══════════════════════════════════════════════════════════════════════════════
export {
    AdminTabBar,
    AdminStatusLine,
    AdminEditorShell,
    AdminDomainEditor,
    VersionDiffView,
    VersionHistoryPanel,
} from './admin/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
export {
    NavigationDropdown,
    CanvasTabs,
    CategoryTabsBar,
    SeedInput,
    DistortToolbar,
    TransportStrip,
    EffectStack,
    NodePanel,
    DriverPicker,
    CategoryPicker,
    ViewportCanvas
} from './tool/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE NAMESPACE
// ═══════════════════════════════════════════════════════════════════════════════
import * as Input from './input/index.js';
import * as Output from './output/index.js';
import * as Container from './container/index.js';
import * as Tool from './tool/index.js';
import * as Drawing from './drawing/index.js';
import * as Admin from './admin/index.js';

export const Components = {
    // Input
    NumericInput: Input.NumericInput,
    TextInput: Input.TextInput,
    Select: Input.Select,
    Dropdown: Input.Dropdown,
    Button: Input.Button,
    ToggleGroup: Input.ToggleGroup,
    FileInput: Input.FileInput,
    ColorInput: Input.ColorInput,
    EquationEditor: Input.EquationEditor,
    DropZone: Input.DropZone,
    NoiseTypeSelect: Input.NoiseTypeSelect,
    EasingCurveInput: Input.EasingCurveInput,
    HSLRangeInput: Input.HSLRangeInput,

    // Output
    Text: Output.Text,
    Canvas: Output.Canvas,
    SVG: Output.SVG,
    Media: Output.Media,
    ProgressBar: Output.ProgressBar,
    AudioOutput: Output.AudioOutput,
    OverlayText: Output.OverlayText,

    // Drawing
    DrawCanvas: Drawing.DrawCanvas,
    EmitterHandles: Drawing.EmitterHandles,
    
    // Container
    Grid: Container.Grid,
    Stack: Container.Stack,
    Section: Container.Section,
    Tabs: Container.Tabs,
    Collection: Container.Collection,
    FileTable: Container.FileTable,
    NavigationDropdown: Tool.NavigationDropdown,
    CanvasTabs: Tool.CanvasTabs,
    CategoryTabsBar: Tool.CategoryTabsBar,
    SeedInput: Tool.SeedInput,
    DistortToolbar: Tool.DistortToolbar,
    TransportStrip: Tool.TransportStrip,
    EffectStack: Tool.EffectStack,
    NodePanel: Tool.NodePanel,
    DriverPicker: Tool.DriverPicker,
    CategoryPicker: Tool.CategoryPicker,
    ViewportCanvas: Tool.ViewportCanvas,

    // Admin editor chrome
    AdminTabBar: Admin.AdminTabBar,
    AdminStatusLine: Admin.AdminStatusLine,
    AdminEditorShell: Admin.AdminEditorShell,
    AdminDomainEditor: Admin.AdminDomainEditor,
    VersionDiffView: Admin.VersionDiffView,
    VersionHistoryPanel: Admin.VersionHistoryPanel,

    // Factory method
    create(type, options, deps) {
        const Component = this[type];
        if (!Component) {
            throw new Error(`Unknown component type: ${type}`);
        }
        return new Component(options, deps);
    }
};

export default Components;

