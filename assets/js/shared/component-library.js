/**
 * Component Library - SiteBoy Framework
 * 
 * MODULAR INDEX - This file imports and re-exports ALL components
 * 
 * COMPONENT ORGANIZATION:
 * - foundation.js    → BaseComponent, BaseNavigationDropdown
 * - layout.js        → PageContainer, PageHeader, Subheader, PageFooter, Grid, Spacing  
 * - content.js       → Heading, Paragraph, Quote, Image, Video, Audio, MarkdownBody, SimpleTOC, NumberedTOC, TOCGallery
 * - interactive.js   → CollapsibleBase, Menu, Breadcrumb, Button, Input, Select, ButtonGroup
 * - graphs.js        → BarGraph, LineGraph, PieGraph
 * - specialized.js   → VGAGrid, MathematicalCanvas, ProgressBar
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

// Import all foundation components
import { 
    BaseComponent, 
    BaseNavigationDropdown 
} from './foundation.js';

// Import all layout components
import { 
    PageContainer, 
    PageHeader, 
    Subheader, 
    PageFooter, 
    Grid, 
    Spacing 
} from './layout.js';

console.log('🔥 COMPONENT LIBRARY LOADING GRID:', Grid);

// Import all content components
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
    TOCGallery 
} from './content.js';

// Import all interactive components
import { 
    CollapsibleBase, 
    Dropdown,
    Menu, 
    Breadcrumb, 
    Button, 
    Input, 
    Select, 
    ButtonGroup 
} from './interactive.js';

// Import all graph components
import { 
    BarGraph, 
    LineGraph, 
    PieGraph 
} from './graphs.js';

// Import all specialized components
import { 
    VGAGrid, 
    MathematicalCanvas, 
    ProgressBar
} from './specialized.js';

/**
 * ComponentLibrary - Main component library object
 * Maintains 100% backward compatibility with existing code
 */
export const ComponentLibrary = {
    version: '4.0.0-modular',
    
    // Foundation components
    BaseComponent,
    BaseNavigationDropdown,
    
    // Layout components  
    PageContainer,
    PageHeader,
    Subheader,
    PageFooter,
    Grid,
    Spacing,
    
    // Content components
    Heading,
    Paragraph,
    Quote,
    Image,
    Video,
    Audio,
    MarkdownBody,
    SimpleTOC,
    NumberedTOC,
    TOCGallery,
    
    // Interactive components
    CollapsibleBase,
    Dropdown,
    Menu,
    Breadcrumb,
    Button,
    Input,
    Select,
    ButtonGroup,
    
    // Graph components
    BarGraph,
    LineGraph,
    PieGraph,
    
    // Specialized components
    VGAGrid,
    MathematicalCanvas,
    ProgressBar,
    
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
            'toc-gallery': TOCGallery,
            
            // Interactive
            'dropdown': Dropdown,
            'menu': Menu,
            'breadcrumb': Breadcrumb,
            'button': Button,
            'input': Input,
            'select': Select,
            'button-group': ButtonGroup,
            
            // Graphs
            'bar-graph': BarGraph,
            'line-graph': LineGraph,
            'pie-graph': PieGraph,
            
            // Specialized
            'vga-grid': VGAGrid,
            'mathematical-canvas': MathematicalCanvas,
            'progress-bar': ProgressBar
        };
        
        const ComponentClass = components[type];
        if (!ComponentClass) {
            throw new Error(`Unknown component type: ${type}`);
        }
        
        return new ComponentClass(options, deps);
    },
    
    // Convenience factory methods - maintains exact same API
    pageContainer: (options = {}, deps) => {
        const component = new PageContainer(options, deps);
        return { container: component.render(), component };
    },
    pageHeader: (options = {}, deps) => {
        const component = new PageHeader(options, deps);
        return { container: component.render(), component };
    },
    subheader: (options = {}, deps) => {
        const component = new Subheader(options, deps);
        return { container: component.render(), component };
    },
    grid: (items, options = {}, deps) => ComponentLibrary.create('grid', { items, ...options }, deps),
    heading: (content, level = 1, options = {}, deps) => ComponentLibrary.create('heading', { content, level, ...options }, deps),
    paragraph: (content, options = {}, deps) => ComponentLibrary.create('paragraph', { content, ...options }, deps),
    button: (text, onClick, options = {}, deps) => ComponentLibrary.create('button', { text, onClick, ...options }, deps),
    image: (src, caption, options = {}, deps) => ComponentLibrary.create('image', { src, caption, ...options }, deps),
    
    /**
     * Utility methods - maintains exact same API
     */
    trackComponents(tracker, ...components) {
        components.forEach(component => tracker.push(component));
        return components.length === 1 ? components[0] : components;
    },
    
    destroyTracked(tracker) {
        tracker.forEach(component => component.destroy());
        tracker.length = 0;
    }
};

// Global registration for legacy compatibility - CRITICAL for backward compatibility
window.ComponentLibrary = ComponentLibrary;

console.log(`📚 ComponentLibrary v${ComponentLibrary.version} - Modular Architecture Ready`);
console.log('📁 Components organized in 6 category files for better maintainability');

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
    TOCGallery,
    
    // Interactive
    CollapsibleBase,
    Dropdown,
    Menu,
    Breadcrumb,
    Button,
    Input,
    Select,
    ButtonGroup,
    
    // Graphs
    BarGraph,
    LineGraph,
    PieGraph,
    
    // Specialized
    VGAGrid,
    MathematicalCanvas,
    ProgressBar
};
