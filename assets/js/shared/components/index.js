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
    FilamentPicker
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
    AudioOutput
} from './output/index.js';

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
// TOOL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
export {
    NavigationDropdown,
    CanvasTabs,
    CategoryTabsBar,
    SeedInput
} from './tool/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE NAMESPACE
// ═══════════════════════════════════════════════════════════════════════════════
import * as Input from './input/index.js';
import * as Output from './output/index.js';
import * as Container from './container/index.js';
import * as Tool from './tool/index.js';

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
    
    // Output
    Text: Output.Text,
    Canvas: Output.Canvas,
    SVG: Output.SVG,
    Media: Output.Media,
    ProgressBar: Output.ProgressBar,
    AudioOutput: Output.AudioOutput,
    
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

