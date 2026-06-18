/**
 * Component Library - SiteBoy Framework
 *
 * MODULAR INDEX - This file imports and re-exports ALL components
 *
 * COMPONENT ORGANIZATION:
 * - foundation.js    → BaseComponent, BaseNavigationDropdown
 * - layout.js        → PageContainer, PageHeader, Subheader, PageFooter, Grid, Spacing
 * - content.js       → Heading, Paragraph, Quote, Image, Video, Audio, MarkdownBody, SimpleTOC, NumberedTOC
 * - interactive.js   → CollapsibleBase, Menu, Breadcrumb, Button, Input, Select, ButtonGroup
 * - graphs.js        → BarGraph, LineGraph, PieGraph
 * - specialized.js   → VGAGrid, MathematicalCanvas, InlineCarousel, ProgressBar
 *
 * DO NOT ADD NEW COMPONENTS TO THIS FILE!
 * Add them to the appropriate category file and import here.
 *
 * USAGE:
 * import { PageHeader, Grid, Button } from './component-library.js';
 * // OR access via global:
 * const header = new window.ComponentLibrary.PageHeader(...);
 *
 * @version 4.0.0 - Modular Architecture
 * @dependencies All category modules listed above
 */

// Import foundation components
import { BaseComponent, BaseNavigationDropdown } from './foundation.js';

// Import layout components
import { PageContainer, PageHeader, Subheader, PageFooter, Grid, Spacing, Panel } from './layout.js';

// Import content components
import {
    Heading,
    Paragraph,
    Quote,
    Image,
    Video,
    Audio,
    MarkdownBody,
    SimpleTOC,
    NumberedTOC,
    TreeTOC,
    Table,
    StatusDisplay,
    AsciiNavWord,
    AsciiNavScene
} from './content.js';

// Import interactive components
import {
    CollapsibleBase,
    Dropdown as InteractiveDropdown,
    Menu,
    Breadcrumb,
    Button,
    Input,
    Select,
    NumericInput,
    ProgressBar,
    ButtonGroup,
    CollapsibleSection,
    Lightbox,
    Carousel,
    CheckpointList,
    Sequencer,
    SequencerV2
} from './interactive.js';

// Import correct Dropdown component for ToolBase
import { Dropdown } from './components/input/Dropdown.js';

// Import input components
import { ToggleGroup } from './components/input/ToggleGroup.js';
import { TextInput } from './components/input/TextInput.js';
import { FileInput } from './components/input/FileInput.js';
import { ColorInput } from './components/input/ColorInput.js';
import { DropZone } from './components/input/DropZone.js';
import { EquationEditor } from './components/input/EquationEditor.js';
import { FilamentPicker } from './components/input/FilamentPicker.js';

// Import graph components
import { BarGraph, LineGraph, PieGraph } from './graphs.js';

// Import specialized components
import { VGAGrid, MathematicalCanvas, SVGDisplay, AnimationControls, InlineCarousel } from './specialized.js';

// Import drawing components
import { DrawCanvas } from './components/drawing/DrawCanvas.js';
import { DrawMaskOverlay } from './components/drawing/DrawMaskOverlay.js';
import { GlyphAtlasGrid } from './components/drawing/GlyphAtlasGrid.js';

// Import feedback components
import LoadingOverlay from './components/feedback/LoadingOverlay.js';
import { ModalConfirm } from './components/feedback/ModalConfirm.js';
import { ErrorPane } from './components/feedback/ErrorPane.js';

// Import P5.js integration components
import { P5Canvas, P5EmbeddedSketch, P5ControlledSketch } from './p5-integration.js';

// Import gallery components
import { MasonryGallery, GalleryLightbox, ImageGrid, ArtworkPage, HorizontalImageStrip } from './masonry-gallery.js';

// Import output components
import { AnimationExport } from './components/output/AnimationExport.js';
import { IframeSandbox } from './components/output/IframeSandbox.js';
import { ModelViewer } from './components/three-d/ModelViewer.js';
import { SplatViewer } from './components/three-d/SplatViewer.js';

// Import tool components
import {
    ToolContainer,
    ToolSidebar,
    ToolCanvas,
    ToolTabs,
    CanvasTabs,
    CanvasModeTabs,
    CategoryTabsBar,
    GeneratorToolbar,
    GlyphBuilderToolbar,
    GenerativeCanvasDock,
    ToolToolbar,
    ToolbarPanelStack,
    SeedInput,
    NavigationDropdown,
    DistortToolbar,
    TransportStrip,
    EffectStack,
    NodePanel,
    // GlyphAtlasGrid imported separately from drawing
    DriverPicker,
    CategoryPicker,
    ViewportCanvas,
    ColourRampControl,
    PaintPaletteControl,
    CentrePointPicker,
    FrameSlider,
    SVGExportButton,
    NoiseSourceControl,
    InputDomainSelector,
    OutputModeSelector,
    MaskControls,
    DriverMappingPanel,
    TemporalModeControl,
    DiagnosticPreviewToggle,
    LuminanceCurveEditor,
} from './components/tool/index.js';

// Import navigation components
import { Scrollbar } from './components/navigation/index.js';

// Import additional components from output
import {
    Text,
    Canvas,
    ImageViewport,
    PalettePreview,
    SVG,
    Media,
    ProgressBar as OutputProgressBar,
    AudioOutput
} from './components/output/index.js';

// Import additional components from container
import {
    Grid as ContainerGrid,
    Stack,
    Section,
    Tabs as ContainerTabs,
    Collection,
    FileTable
} from './components/container/index.js';

// Import image adjustment bundles
import {
    MinimalBundle,
    StandardBundle,
    ProfessionalBundle
} from './image-adjustments/index.js';

// Import generator modulation + animation components
import { ModulatorChip }       from './components/input/ModulatorChip.js';
import { ExpressionParam }     from './components/input/ExpressionParam.js';
import { Slider }              from './components/input/Slider.js';
import { ModulatorPanel }      from './components/input/ModulatorPanel.js';
import { PaletteRow }          from './components/input/PaletteRow.js';
import { PresetToolbar }       from './components/input/PresetToolbar.js';
import { CanvasSizePair }      from './components/input/CanvasSizePair.js';
import { PostEffectRow }       from './components/input/PostEffectRow.js';
import { PaletteTable }        from './components/input/PaletteTable.js';
import { LineListInput }       from './components/input/LineListInput.js';
import { GradientStops }       from './components/input/GradientStops.js';
import { GeneratorTransportStrip } from './components/tool/TransportStrip.js';

/**
 * AdjustmentBundle - Factory function that routes to correct bundle type
 * Used by ToolBase to handle ['adjustment-bundle', 'standard'] config
 */
const AdjustmentBundle = function(options = {}, deps = {}) {
    window.debugLog('INIT', '🏭 AdjustmentBundle factory called with:', { bundleType: options.bundleType, options, deps });
    
    const { bundleType = 'standard' } = options;
    
    const bundles = {
        'minimal': MinimalBundle,
        'standard': StandardBundle,
        'professional': ProfessionalBundle
    };
    
    const BundleClass = bundles[bundleType.toLowerCase()];
    if (!BundleClass) {
        console.error(`❌ Unknown adjustment bundle type: ${bundleType}`);
        return null;
    }
    
    window.debugLog('INIT', '✅ Creating bundle of type:', bundleType, BundleClass.name);
    
    // Return instance of the correct bundle
    const instance = new BundleClass(options, deps);
    window.debugLog('INIT', '✅ Bundle instance created:', instance);
    return instance;
};


// Create ComponentLibrary as a global object for backward compatibility
const ComponentLibrary = {
    version: '4.0.1', // Updated to force cache refresh
    /**
     * Component factory - maintains exact same API as before
     */
    create(type, options = {}, deps = {}) {
        const components = {
            // Layout
            'page-container': PageContainer,
            'page-header': PageHeader,
            'subheader': Subheader,
            'page-footer': PageFooter,
            'grid': Grid,
            'spacing': Spacing,
            'panel': Panel,

            // Content
            'heading': Heading,
            'paragraph': Paragraph,
            'quote': Quote,
            'image': Image,
            'video': Video,
            'audio': Audio,
            'markdown': MarkdownBody,
            'simple-toc': SimpleTOC,
            'numbered-toc': NumberedTOC,
            'tree-toc': TreeTOC,
            'table': Table,
            'status-display': StatusDisplay,

            // Interactive
            'dropdown': Dropdown,
            'menu': Menu,
            'breadcrumb': Breadcrumb,
            'button': Button,
            'input': Input,
            'select': Select,
            'numeric-input': NumericInput,
            'slider': Slider,
            'progress-bar': ProgressBar,
            'button-group': ButtonGroup,
            'collapsible-section': CollapsibleSection,
            'carousel': Carousel,
            'checkpoint-list': CheckpointList,
            'sequencer': Sequencer,
            'sequencer-v2': SequencerV2,

            // Graphs
            'bar-graph': BarGraph,
            'line-graph': LineGraph,
            'pie-graph': PieGraph,

            // Specialized
            'vga-grid': VGAGrid,
            'mathematical-canvas': MathematicalCanvas,
            'svg-display': SVGDisplay,
            'animation-controls': AnimationControls,

            // Drawing
            'draw-canvas': DrawCanvas,
            'draw-mask-overlay': DrawMaskOverlay,

            // P5.js integration
            'p5-canvas': P5Canvas,
            'p5-embedded-sketch': P5EmbeddedSketch,
            'p5-controlled-sketch': P5ControlledSketch,

            // Gallery
            'masonry-gallery': MasonryGallery,
            'image-grid': ImageGrid,
            'artwork-page': ArtworkPage,
            'horizontal-image-strip': HorizontalImageStrip,

            // Tool components
            'tool-container': ToolContainer,
            'tool-sidebar': ToolSidebar,
            'tool-canvas': ToolCanvas,
            'tool-tabs': ToolTabs,
            'canvas-tabs': CanvasTabs,
            'canvas-mode-tabs': CanvasModeTabs,
            'category-tabs-bar': CategoryTabsBar,
            'generator-toolbar': GeneratorToolbar,
            'glyph-builder-toolbar': GlyphBuilderToolbar,
            'generative-canvas-dock': GenerativeCanvasDock,
            'tool-toolbar': ToolToolbar,
            'toolbar-panel-stack': ToolbarPanelStack,
            'seed-input': SeedInput,
            'navigation-dropdown': NavigationDropdown,
            'distort-toolbar': DistortToolbar,
            'transport-strip': TransportStrip,
            'effect-stack': EffectStack,
            'node-panel': NodePanel,
            'driver-picker': DriverPicker,
            'category-picker': CategoryPicker,
            'viewport-canvas': ViewportCanvas,
            'colour-ramp-control': ColourRampControl,
            'color-input': ColorInput,
            'colour-input': ColorInput,
            'paint-palette-control': PaintPaletteControl,
            'centre-point-picker': CentrePointPicker,
            'frame-slider': FrameSlider,
            'svg-export-button': SVGExportButton,
            'noise-source-control': NoiseSourceControl,
            'input-domain-selector': InputDomainSelector,
            'output-mode-selector': OutputModeSelector,
            'mask-controls': MaskControls,
            'driver-mapping-panel': DriverMappingPanel,
            'temporal-mode-control': TemporalModeControl,
            'diagnostic-preview-toggle': DiagnosticPreviewToggle,
            'luminance-curve-editor': LuminanceCurveEditor,
            
            // Navigation
            'scrollbar': Scrollbar,

            // Animation export
            'animation-export': AnimationExport,
            
            // Output components
            'text': Text,
            'canvas': Canvas,
            'imageviewport': ImageViewport,
            'image-viewport': ImageViewport,
            'iframe-sandbox': IframeSandbox,
            'model-viewer': ModelViewer,
            'splat-viewer': SplatViewer,
            'palettepreview': PalettePreview,
            'palette-preview': PalettePreview,
            'svg': SVG,
            'media': Media,
            'audio-output': AudioOutput
        };

        const ComponentClass = components[type.toLowerCase()];
        if (!ComponentClass) {
            console.warn(`ComponentLibrary: Unknown component type '${type}'`);
            return null;
        }

        try {
            return new ComponentClass(options, deps);
        } catch (error) {
            console.error(`ComponentLibrary: Failed to create '${type}':`, error);
            return null;
        }
    },

    // Utility method to destroy tracked components
    destroyTracked: function(componentInstances) {
        if (!Array.isArray(componentInstances)) return;
        componentInstances.forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        componentInstances.length = 0; // Clear the array
    }
};

// Assign foundation components to ComponentLibrary immediately
ComponentLibrary.BaseComponent = BaseComponent;
ComponentLibrary.BaseNavigationDropdown = BaseNavigationDropdown;

// Assign layout components to ComponentLibrary immediately
ComponentLibrary.PageContainer = PageContainer;  // Main page layout container
ComponentLibrary.Grid = Grid;  // Layout grid component

// Factory function for pageContainer (returns {container, component} object)
ComponentLibrary.pageContainer = function(options = {}, deps = {}) {
    const component = new PageContainer(options, deps);
    const container = component.render();
    return { container, component };
};

ComponentLibrary.PageHeader = PageHeader;
ComponentLibrary.Subheader = Subheader;
ComponentLibrary.PageFooter = PageFooter;
ComponentLibrary.Grid = Grid;
ComponentLibrary.Spacing = Spacing;
ComponentLibrary.Panel = Panel;

// Assign content components to ComponentLibrary immediately
ComponentLibrary.Heading = Heading;
ComponentLibrary.Paragraph = Paragraph;
ComponentLibrary.Quote = Quote;
ComponentLibrary.Image = Image;
ComponentLibrary.Video = Video;
ComponentLibrary.Audio = Audio;
ComponentLibrary.MarkdownBody = MarkdownBody;
ComponentLibrary.SimpleTOC = SimpleTOC;
ComponentLibrary.NumberedTOC = NumberedTOC;
ComponentLibrary.TreeTOC = TreeTOC;
ComponentLibrary.Table = Table;
ComponentLibrary.StatusDisplay = StatusDisplay;
ComponentLibrary.AsciiNavWord  = AsciiNavWord;
ComponentLibrary.AsciiNavScene = AsciiNavScene;

// Assign interactive components to ComponentLibrary immediately
ComponentLibrary.CollapsibleBase = CollapsibleBase;
ComponentLibrary.Dropdown = Dropdown;
ComponentLibrary.Menu = Menu;
ComponentLibrary.Breadcrumb = Breadcrumb;
ComponentLibrary.Button = Button;
ComponentLibrary.Input = Input;
ComponentLibrary.Select = Select;
ComponentLibrary.NumericInput = NumericInput;
ComponentLibrary.Slider = Slider;
ComponentLibrary.ProgressBar = ProgressBar;  // Interactive progress bar
ComponentLibrary.ButtonGroup = ButtonGroup;
ComponentLibrary.CollapsibleSection = CollapsibleSection;
ComponentLibrary.Lightbox = Lightbox;
ComponentLibrary.Carousel = Carousel;
ComponentLibrary.CheckpointList = CheckpointList;
ComponentLibrary.Sequencer = Sequencer;
ComponentLibrary.SequencerV2 = SequencerV2;

// Assign input components to ComponentLibrary immediately
ComponentLibrary.ToggleGroup = ToggleGroup;
ComponentLibrary.TextInput = TextInput;
ComponentLibrary.FileInput = FileInput;
ComponentLibrary.ColorInput = ColorInput;
ComponentLibrary.DropZone = DropZone;
ComponentLibrary.EquationEditor = EquationEditor;
ComponentLibrary.FilamentPicker = FilamentPicker;

// Assign graph components to ComponentLibrary immediately
ComponentLibrary.BarGraph = BarGraph;
ComponentLibrary.LineGraph = LineGraph;
ComponentLibrary.PieGraph = PieGraph;

// Assign specialized components to ComponentLibrary immediately
ComponentLibrary.VGAGrid = VGAGrid;
ComponentLibrary.MathematicalCanvas = MathematicalCanvas;
ComponentLibrary.SVGDisplay = SVGDisplay;
ComponentLibrary.AnimationControls = AnimationControls;
ComponentLibrary.InlineCarousel = InlineCarousel;

// Assign drawing components to ComponentLibrary immediately
ComponentLibrary.DrawCanvas = DrawCanvas;
ComponentLibrary.DrawMaskOverlay = DrawMaskOverlay;

// Assign P5.js integration components to ComponentLibrary immediately
ComponentLibrary.P5Canvas = P5Canvas;
ComponentLibrary.P5EmbeddedSketch = P5EmbeddedSketch;
ComponentLibrary.P5ControlledSketch = P5ControlledSketch;

// Assign gallery components to ComponentLibrary immediately
ComponentLibrary.MasonryGallery        = MasonryGallery;
ComponentLibrary.GalleryLightbox       = GalleryLightbox;
ComponentLibrary.ImageGrid             = ImageGrid;
ComponentLibrary.ArtworkPage          = ArtworkPage;
ComponentLibrary.HorizontalImageStrip = HorizontalImageStrip;

// Assign output components to ComponentLibrary immediately
ComponentLibrary.AnimationExport = AnimationExport;
ComponentLibrary.Text = Text;
ComponentLibrary.Canvas = Canvas;
ComponentLibrary.ImageViewport = ImageViewport;
ComponentLibrary.IframeSandbox = IframeSandbox;
ComponentLibrary.ModelViewer = ModelViewer;
ComponentLibrary.SplatViewer = SplatViewer;
ComponentLibrary.PalettePreview = PalettePreview;
ComponentLibrary.SVG = SVG;
ComponentLibrary.Media = Media;
ComponentLibrary.AudioOutput = AudioOutput;

// Assign container components to ComponentLibrary immediately
ComponentLibrary.Stack = Stack;
ComponentLibrary.Section = Section;
ComponentLibrary.Collection = Collection;
ComponentLibrary.FileTable = FileTable;
ComponentLibrary.ContainerGrid = ContainerGrid;  // Container-specific grid
ComponentLibrary.ContainerTabs = ContainerTabs;  // Container-specific tabs

// Assign tool components to ComponentLibrary immediately
ComponentLibrary.ToolContainer = ToolContainer;
ComponentLibrary.ToolSidebar = ToolSidebar;
ComponentLibrary.ToolCanvas = ToolCanvas;
ComponentLibrary.ToolTabs = ToolTabs;
ComponentLibrary.CanvasTabs = CanvasTabs;
ComponentLibrary.CanvasModeTabs = CanvasModeTabs;
ComponentLibrary.CategoryTabsBar = CategoryTabsBar;
ComponentLibrary.GeneratorToolbar = GeneratorToolbar;
ComponentLibrary.GlyphBuilderToolbar = GlyphBuilderToolbar;
ComponentLibrary.GlyphAtlasGrid = GlyphAtlasGrid;
ComponentLibrary.GenerativeCanvasDock = GenerativeCanvasDock;
ComponentLibrary.ToolToolbar = ToolToolbar;
ComponentLibrary.ToolbarPanelStack = ToolbarPanelStack;
ComponentLibrary.SeedInput = SeedInput;
ComponentLibrary.NavigationDropdown = NavigationDropdown;
ComponentLibrary.DistortToolbar = DistortToolbar;
ComponentLibrary.TransportStrip = TransportStrip;
ComponentLibrary.EffectStack = EffectStack;
ComponentLibrary.NodePanel = NodePanel;
ComponentLibrary.DriverPicker = DriverPicker;
ComponentLibrary.CategoryPicker = CategoryPicker;
ComponentLibrary.ViewportCanvas = ViewportCanvas;
ComponentLibrary.ColourRampControl = ColourRampControl;
ComponentLibrary.PaintPaletteControl = PaintPaletteControl;
ComponentLibrary.CentrePointPicker = CentrePointPicker;
ComponentLibrary.FrameSlider = FrameSlider;
ComponentLibrary.SVGExportButton = SVGExportButton;
ComponentLibrary.NoiseSourceControl = NoiseSourceControl;
ComponentLibrary.InputDomainSelector = InputDomainSelector;
ComponentLibrary.OutputModeSelector = OutputModeSelector;
ComponentLibrary.MaskControls = MaskControls;
ComponentLibrary.DriverMappingPanel = DriverMappingPanel;
ComponentLibrary.ModalConfirm = ModalConfirm;
ComponentLibrary.ErrorPane = ErrorPane;
ComponentLibrary.TemporalModeControl = TemporalModeControl;
ComponentLibrary.DiagnosticPreviewToggle = DiagnosticPreviewToggle;
ComponentLibrary.LuminanceCurveEditor = LuminanceCurveEditor;

// Assign generator modulation + animation components
ComponentLibrary.ExpressionParam         = ExpressionParam;
ComponentLibrary.ModulatorChip           = ModulatorChip;
ComponentLibrary.ModulatorPanel          = ModulatorPanel;
ComponentLibrary.PaletteRow              = PaletteRow;
ComponentLibrary.PresetToolbar           = PresetToolbar;
ComponentLibrary.CanvasSizePair          = CanvasSizePair;
ComponentLibrary.PostEffectRow           = PostEffectRow;
ComponentLibrary.PaletteTable            = PaletteTable;
ComponentLibrary.LineListInput           = LineListInput;
ComponentLibrary.GradientStops           = GradientStops;
ComponentLibrary.GeneratorTransportStrip = GeneratorTransportStrip;

// Assign navigation components to ComponentLibrary immediately
ComponentLibrary.Scrollbar = Scrollbar;

// Assign additional output components
ComponentLibrary.OutputProgressBar = OutputProgressBar;  // Output-specific progress bar

// Assign image adjustment bundles to ComponentLibrary immediately
ComponentLibrary.AdjustmentBundle = AdjustmentBundle;
ComponentLibrary.MinimalBundle = MinimalBundle;
ComponentLibrary.StandardBundle = StandardBundle;
ComponentLibrary.ProfessionalBundle = ProfessionalBundle;

// Make it available globally for legacy tools
if (typeof window !== 'undefined') {
    window.ComponentLibrary = ComponentLibrary;
}

// Init-time assertion: every COMPONENT_TYPES entry in tool-base.js must resolve.
// This guards against "component defined but not re-exported" breakage (tool-standards.md §4).
// COMPONENT_TYPES list is duplicated here and checked at startup; a console.error fires if any is absent.
(function _assertComponentRegistrations() {
    const REQUIRED = [
        'NumericInput', 'Slider', 'TextInput', 'Dropdown', 'ToggleGroup', 'ColorInput',
        'FileInput', 'DropZone', 'Button', 'EquationEditor', 'FilamentPicker',
        'NavigationDropdown', 'CanvasTabs', 'Text',
        'ImageViewport', 'PalettePreview', 'ProgressBar', 'AdjustmentBundle',
        'Section', 'Grid', 'FileTable',
        'ModulatorChip', 'ModulatorPanel', 'ExpressionParam', 'PaletteRow',
        'PresetToolbar', 'CanvasSizePair', 'PostEffectRow', 'PaletteTable',
        'LineListInput', 'GradientStops', 'GeneratorTransportStrip',
    ];
    for (const name of REQUIRED) {
        if (!ComponentLibrary[name]) {
            console.error(`[component-library] MISSING REGISTRATION: ${name} is not exported from ComponentLibrary. Add it to component-library.js.`);
        }
    }
})();

window.debugLog('INIT', `📚 ComponentLibrary v${ComponentLibrary.version} - Modular Architecture Ready (all components assigned)`);
window.debugLog('VERBOSE', ' BaseComponent available:', !!ComponentLibrary.BaseComponent);
window.debugLog('VERBOSE', ' PageContainer available:', !!ComponentLibrary.PageContainer);
window.debugLog('VERBOSE', ' ToolContainer available:', !!ComponentLibrary.ToolContainer);
window.debugLog('VERBOSE', ' destroyTracked available:', typeof ComponentLibrary.destroyTracked, ComponentLibrary.destroyTracked ? '✅' : '❌');
window.debugLog('VERBOSE', ' Missing components fixed - CheckpointList:', !!ComponentLibrary.CheckpointList, 'ContainerGrid:', !!ComponentLibrary.ContainerGrid);

// Export individual components for modern import usage
export {
    // Foundation
    BaseComponent,
    BaseNavigationDropdown,

    // Layout
    PageContainer,
    PageHeader,
    Subheader,
    PageFooter,
    Grid,
    Spacing,
    Panel,

    // Content
    Heading,
    Paragraph,
    Quote,
    Image,
    Video,
    Audio,
    MarkdownBody,
    SimpleTOC,
    NumberedTOC,
    TreeTOC,
    Table,
    StatusDisplay,
    AsciiNavWord,
    AsciiNavScene,

    // Interactive
    CollapsibleBase,
    Dropdown,
    Menu,
    Breadcrumb,
    Button,
    Input,
    Select,
    NumericInput,
    Slider,
    ProgressBar,
    ButtonGroup,
    CollapsibleSection,
    Lightbox,
    Carousel,
    
    // Feedback
    LoadingOverlay,
    ModalConfirm,
    ErrorPane,

    // Graphs
    BarGraph,
    LineGraph,
    PieGraph,

    // Specialized
    VGAGrid,
    MathematicalCanvas,
    SVGDisplay,
    AnimationControls,
    InlineCarousel,

    // Drawing
    DrawCanvas,
    DrawMaskOverlay,

    // P5.js integration
    P5Canvas,
    P5EmbeddedSketch,
    P5ControlledSketch,

    // Gallery
    MasonryGallery,
    GalleryLightbox,
    ImageGrid,
    ArtworkPage,
    HorizontalImageStrip,

    // Tool Components
    ToolContainer,
    ToolSidebar,
    ToolCanvas,
    ToolTabs,
    CanvasTabs,
    CanvasModeTabs,
    CategoryTabsBar,
    GeneratorToolbar,
    GlyphBuilderToolbar,
    GlyphAtlasGrid,
    GenerativeCanvasDock,
    ToolToolbar,
    ToolbarPanelStack,
    SeedInput,
    NavigationDropdown,
    DistortToolbar,
    TransportStrip,
    EffectStack,
    NodePanel,
    DriverPicker,
    CategoryPicker,
    ViewportCanvas,

    // Additional Components
    Text,
    Canvas,
    SVG,
    Media,
    AudioOutput,
    Stack,
    Section,
    Collection,
    FileTable,
    AnimationExport,
    ModelViewer,
    SplatViewer,

    // Image Adjustment Bundles
    AdjustmentBundle,
    MinimalBundle,
    StandardBundle,
    ProfessionalBundle,

    // Generator modulation + animation components
    ExpressionParam,
    ModulatorChip,
    ModulatorPanel,
    PaletteRow,
    PresetToolbar,
    CanvasSizePair,
    PostEffectRow,
    PaletteTable,
    GradientStops,
    GeneratorTransportStrip
};

// Export ComponentLibrary as default for backward compatibility
export default ComponentLibrary;