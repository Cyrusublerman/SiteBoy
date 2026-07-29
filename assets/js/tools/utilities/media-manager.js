/**
 * MediaManagerTool — Full media management with upload, edit, and grouping
 * Localhost-only tool that connects to local Python API for processing and R2 upload.
 * 
 * @version 1.0.0
 */
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { uploadGalleryBlob } from '../../shared/gallery-upload.js';

const SITE_API = '/api';
const API_BASE = 'http://localhost:5555/api';

// Tool configuration for UPLOAD tab
const UPLOAD_CONFIG = {
    title: 'MEDIA MANAGER',
    sidebar: [
        ['STAGING', [
            ['Status', [
                ['label', 'Checking API...', { variant: 'status', key: 'apiStatus' }],
                ['label', '0 files staged', { variant: 'caption', key: 'stagedCount' }]
            ]],
            ['Destination', [
                ['label', '', { variant: 'caption', key: 'treeContainer' }],
                ['text', 'New Folder', '', { key: 'newFolderName', placeholder: 'folder-name' }],
                ['button', 'Add Here', null, { key: 'addFolder' }]
            ]],
            ['Batch Defaults', [
                ['text', 'Default Alt Text', '', { key: 'defaultAlt', placeholder: 'Description...' }],
                ['text', 'Default Tags', '', { key: 'defaultTags', placeholder: 'tag1, tag2' }]
            ]],
            ['Actions', [
                ['button', 'Process All', null, { key: 'processAll' }],
                ['button', 'Upload All', null, { key: 'uploadAll' }],
                ['button', 'Clear Staging', null, { key: 'clearStaging' }]
            ]]
        ]],
        ['SELECTED', [
            ['Selection', [
                ['label', 'No images selected', { variant: 'caption', key: 'selectionInfo' }]
            ]],
            ['Edit Selected', [
                ['text', 'Alt Text', '', { key: 'selectedAlt', placeholder: 'Alt text...' }],
                ['text', 'Caption', '', { key: 'selectedCaption', placeholder: 'Caption...' }],
                ['text', 'Tags', '', { key: 'selectedTags', placeholder: 'tag1, tag2' }],
                ['button', 'Apply to Selected', null, { key: 'applyToSelected' }]
            ]],
            ['Group', [
                ['text', 'Group Name', '', { key: 'groupName', placeholder: 'object-name' }],
                ['button', 'Create Group', null, { key: 'createGroup' }]
            ]],
            ['Actions', [
                ['button', 'Process Selected', null, { key: 'processSelected' }],
                ['button', 'Delete Selected', null, { key: 'deleteSelected' }]
            ]]
        ]]
    ]
};

// Tool configuration for LIBRARY tab
const LIBRARY_CONFIG = {
    title: 'MEDIA MANAGER',
    sidebar: [
        ['BROWSE', [
            ['Source', [
                ['label', 'Loading...', { key: 'libraryTreeContainer', variant: 'status' }],
                ['button', 'Load Gallery', null, { key: 'loadGallery' }]
            ]],
            ['Info', [
                ['label', 'No gallery loaded', { variant: 'status', key: 'galleryInfo' }]
            ]]
        ]],
        ['SELECTED', [
            ['Selection', [
                ['label', '0 selected (click to select, Ctrl+click for multi)', { variant: 'caption', key: 'librarySelection' }]
            ]],
            ['Edit Metadata', [
                ['text', 'Alt Text', '', { key: 'libAltText', placeholder: 'Describe the image...' }],
                ['text', 'Caption', '', { key: 'libCaption', placeholder: 'Caption text...' }],
                ['text', 'Tags', '', { key: 'libTags', placeholder: 'tag1, tag2, tag3' }],
                ['button', 'Apply to Selected', null, { key: 'libApplyMeta' }]
            ]],
            ['Actions', [
                ['button', 'View Full Size', null, { key: 'viewFull' }],
                ['button', 'Save Changes', null, { key: 'libSaveChanges' }],
                ['button', 'Delete Selected', null, { key: 'libDeleteSelected' }]
            ]]
        ]]
    ]
};

// Tool configuration for ABOUT tab - uses sidebar for navigation
const ABOUT_CONFIG = {
    title: 'MEDIA MANAGER',
    sidebar: [
        ['DOCS', [
            ['Navigation', [
                ['button', 'Overview', null, { key: 'docOverview' }],
                ['button', 'Frontend', null, { key: 'docFrontend' }],
                ['button', 'Backend', null, { key: 'docBackend' }],
                ['button', 'API Reference', null, { key: 'docApi' }]
            ]],
            ['Info', [
                ['label', 'Media Manager v1.0', { variant: 'status' }],
                ['label', 'Localhost-only tool', { variant: 'caption' }]
            ]]
        ]]
    ]
};

// Documentation content for ABOUT tab - markdown format for consistent rendering
const ABOUT_DOCS = {
    overview: `
## MEDIA MANAGER — OVERVIEW

A complete image pipeline for managing gallery content. Runs locally with a Python API for image processing and Cloudflare R2 uploads.

### ARCHITECTURE

\`\`\`
Browser (localhost:3007)
├── Media Manager Tool
│   ├── Drag & drop files/folders
│   ├── Grid preview with selection
│   ├── Metadata editing
│   └── Grouping (object bundles)
│
│   ↓ fetch()
│
Python API (localhost:5555)
├── File staging
├── Image processing (Pillow)
└── R2 upload (boto3)
│
│   ↓ boto3
│
Cloudflare R2 (media.einoder.net)
├── /art/photos/{gallery}/
├── /art/digital/{gallery}/
└── /projects/{gallery}/
\`\`\`

### QUICK START

1. **Start API:** \`cd tools/media-manager && python media-manager-server.py\`
2. **Open tool:** Navigate to \`#tools/media-manager\`
3. **Drag files:** Drop images or folders into the UPLOAD area
4. **Set destination:** Choose Gallery Type + enter Gallery Name
5. **Process:** Click "Process All" to create variants
6. **Upload:** Click "Upload All" to send to R2

### GALLERY TYPES

| Type | Path |
|------|------|
| Photography | \`art/photos/{gallery}/\` |
| Digital Art | \`art/digital/{gallery}/\` |
| Objects | \`art/objects/{gallery}/\` |
| Projects | \`projects/{gallery}/\` |
| Site Assets | \`assets/{gallery}/\` |
`,
    frontend: `
## FRONTEND — Browser Tool

The browser-based interface for managing images. Built with ToolBase framework.

### FILE LOCATIONS

| File | Purpose |
|------|---------|
| \`assets/js/tools/utilities/media-manager.js\` | Main tool |
| \`assets/js/tools/core/tool-base.js\` | ToolBase framework |
| \`assets/js/shared/component-library.js\` | UI components |

### TABS

| Tab | Function |
|-----|----------|
| **UPLOAD** | Drag & drop, stage files, set metadata, process, upload |
| **LIBRARY** | Browse existing R2 galleries |
| **ABOUT** | Documentation (this page) |

### DRAG & DROP

Uses \`webkitGetAsEntry\` API for folder traversal:

- **Single files:** Sent directly to API
- **Folders:** Recursively scanned, all images extracted
- **Nested folders:** Full path preserved in metadata

### SELECTION

| Action | Result |
|--------|--------|
| Click | Select single image |
| Ctrl+Click | Toggle selection (add/remove) |
| Shift+Click | Range select from last clicked |

### METADATA FIELDS

- **Alt Text:** Accessibility description (required)
- **Caption:** Display text in gallery view
- **Tags:** Comma-separated for filtering
- **Source Folder:** Auto-captured from drag path

### GROUPING (Object Bundles)

Multiple images of the same subject can be grouped:

1. Select all images of the object
2. Enter Group Name (e.g., "ceramic-vase-01")
3. Click "Create Group"

Groups display as one tile, expand into carousel on click.

### API COMMUNICATION

All operations use \`fetch()\` to \`localhost:5555\`:

- Health check on tab init
- File upload via FormData
- JSON for metadata/process/upload commands
`,
    backend: `
## BACKEND — Python API

Flask server handling file processing and R2 uploads.

### FILE LOCATIONS

| File | Purpose |
|------|---------|
| \`tools/media-manager/media-manager-server.py\` | Flask API server |
| \`tools/media-manager/requirements.txt\` | Dependencies |
| \`tools/media-manager/staging/\` | Local file storage |

### DEPENDENCIES

- **Flask** — Web framework
- **Flask-CORS** — Cross-origin requests
- **Pillow** — Image processing
- **boto3** — AWS/R2 SDK

### STAGING DIRECTORY

\`\`\`
tools/media-manager/staging/
├── raw/              # Original uploaded files
├── processed/        # After resize/EXIF strip
│   ├── thumb/        # 400px max
│   ├── web/          # 1600px max
│   └── zoom/         # 2400px max
└── staging.json      # Metadata for all files
\`\`\`

### IMAGE PROCESSING

Each image is processed into three variants:

| Variant | Max Size | Quality |
|---------|----------|---------|
| thumb | 400px | 75% JPEG |
| web | 1600px | 85% JPEG |
| zoom | 2400px | 90% JPEG |

Processing includes:
- EXIF orientation correction
- RGBA/P mode conversion to RGB
- Lanczos resampling for quality
- JPEG optimisation

### R2 UPLOAD

Files are uploaded to Cloudflare R2 via boto3:

- **Endpoint:** \`{account_id}.r2.cloudflarestorage.com\`
- **Bucket:** \`assetts-einoder\`
- **Public URL:** \`https://media.einoder.net\`

Each variant uploaded with:
- \`ContentType: image/jpeg\`
- \`CacheControl: public, max-age=31536000\`

### MANIFEST GENERATION

After upload, a \`manifest.json\` is generated:

\`\`\`json
{
  "gallery_name": "portraits",
  "base_url": "https://media.einoder.net/art/photos/portraits",
  "generated_at": "2026-01-02T10:30:00Z",
  "total_images": 25,
  "images": [
    {
      "id": "sunset-portrait",
      "filename": "sunset-portrait.jpg",
      "alt": "Portrait at sunset",
      "tags": ["portrait", "outdoor"],
      "urls": { "thumb": "...", "web": "...", "zoom": "..." }
    }
  ]
}
\`\`\`

### CONFIGURATION

R2 credentials in \`media-manager-server.py\` (or environment variables):

- \`R2_ACCOUNT_ID\`
- \`R2_BUCKET_NAME\`
- \`R2_ACCESS_KEY_ID\`
- \`R2_SECRET_ACCESS_KEY\`
- \`R2_PUBLIC_URL\`
`,
    api: `
## API REFERENCE

Flask API running on \`http://localhost:5555\`

### HEALTH CHECK

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | \`/api/health\` | \`{ status, r2_available, staging_dir }\` |

### STAGING

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | \`/api/stage\` | FormData: \`files[]\`, \`paths\` | \`{ success, count, files[] }\` |
| GET | \`/api/staged\` | — | \`{ files[], groups[] }\` |
| GET | \`/api/staged/{id}\` | — | File info object |
| DELETE | \`/api/staged/{id}\` | — | \`{ success, deleted }\` |
| GET | \`/api/staged/{id}/thumb\` | — | Image (JPEG) |

### METADATA

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | \`/api/metadata\` | \`{ ids[], metadata }\` | \`{ success, updated[] }\` |

### PROCESSING

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | \`/api/process\` | \`{ ids[] }\` (optional) | \`{ success, processed, results[] }\` |

### UPLOAD

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | \`/api/upload\` | \`{ ids[], gallery, gallery_type }\` | \`{ success, stats, manifest_url }\` |

### GALLERIES

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | \`/api/galleries\` | \`{ galleries[] }\` |
| GET | \`/api/gallery/{type}/{name}\` | Gallery manifest |

### CLEAR

| Method | Endpoint | Effect |
|--------|----------|--------|
| POST | \`/api/clear\` | Deletes all staged files |

### ERROR RESPONSES

All endpoints return \`{ error: "message" }\` with appropriate HTTP status on failure.
`
};

class MediaManagerTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = {
            ...deps,
            ComponentLibrary
        };
        
        this.tool = null;
        this.currentTab = 'UPLOAD';
        this.stagedFiles = [];
        this.selectedIds = new Set();
        this.apiConnected = false;
        
        // Library state
        this.galleries = [];
        this.currentGallery = null;
        this.libraryImages = [];
        
        // Folder navigation state (UPLOAD tab - destination)
        this.selectedPath = '';  // Currently selected folder path
        this.expandedPaths = new Set(['art']);  // Paths that are expanded
        
        // Folder navigation state (LIBRARY tab - source from R2)
        this.librarySelectedPath = '';
        this.libraryExpandedPaths = new Set(['art']);
        this.r2FolderStructure = {};  // Actual structure from R2
        this.localFiles = new Map();
        this.uploadProgressBar = null;
        this.componentInstances = [];
    }

    render() {
        // Create main container with high-level tabs
        this.element = document.createElement('div');
        this.element.className = 'media-manager-wrapper';
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        `;
        
        // High-level tab bar
        this.tabBar = this.createTabBar();
        this.element.appendChild(this.tabBar);
        
        // Tool container
        this.toolContainer = document.createElement('div');
        this.toolContainer.className = 'media-manager-tool';
        this.toolContainer.style.cssText = `
            flex: 1;
            overflow: hidden;
        `;
        this.element.appendChild(this.toolContainer);
        
        this.container.appendChild(this.element);
        
        // Render initial tab
        this.renderTab('UPLOAD');
        
        // Check API connection
        this.checkApiConnection();
        
        return this.element;
    }

    createTabBar() {
        const bar = document.createElement('div');
        bar.className = 'media-manager-tabs';
        bar.style.cssText = `
            display: flex;
            gap: 0;
            border-bottom: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        const tabs = ['UPLOAD', 'LIBRARY', 'ABOUT'];
        
        tabs.forEach(tab => {
            const btn = document.createElement('button');
            btn.textContent = tab;
            btn.className = `tab-btn ${tab === this.currentTab ? 'active' : ''}`;
            btn.style.cssText = `
                padding: 0 calc(var(--f) * 2);
                height: calc(var(--f) * 2.5);
                border: none;
                border-right: 1px solid var(--c-border);
                background: ${tab === this.currentTab ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${tab === this.currentTab ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: calc(var(--f) * 0.9);
                cursor: pointer;
                text-transform: uppercase;
            `;
            
            btn.addEventListener('click', () => this.switchTab(tab));
            btn.addEventListener('mouseenter', () => {
                if (tab !== this.currentTab) {
                    btn.style.background = 'var(--c-text)';
                    btn.style.color = 'var(--c-bg)';
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (tab !== this.currentTab) {
                    btn.style.background = 'var(--c-bg)';
                    btn.style.color = 'var(--c-text)';
                }
            });
            
            bar.appendChild(btn);
        });
        
        return bar;
    }

    switchTab(tab) {
        if (tab === this.currentTab) return;
        
        this.currentTab = tab;
        
        // Update tab bar
        const buttons = this.tabBar.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
            const isActive = btn.textContent === tab;
            btn.style.background = isActive ? 'var(--c-text)' : 'var(--c-bg)';
            btn.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
            btn.className = `tab-btn ${isActive ? 'active' : ''}`;
        });
        
        // Render new tab
        this.renderTab(tab);
    }

    renderTab(tab) {
        // Destroy existing tool
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        this.toolContainer.innerHTML = '';
        
        // Select config based on tab
        let config;
        if (tab === 'UPLOAD') {
            config = UPLOAD_CONFIG;
        } else if (tab === 'LIBRARY') {
            config = LIBRARY_CONFIG;
        } else {
            config = ABOUT_CONFIG;
        }
        
        this.tool = new ToolBase(config, this.deps);
        this.tool.onInit = () => this.onTabInit(tab);
        this.tool.onUpdate = (key, value) => this.onInputChange(key, value);
        
        this.tool.mount(this.toolContainer);
        
        // Store reference to preview area
        this.previewArea = this.tool.canvasArea;
        
        // Setup tab-specific content
        if (tab === 'UPLOAD') {
            this.setupDropZone();
        } else if (tab === 'ABOUT') {
            this.renderAboutContent();
        }
    }

    async onTabInit(tab) {
        this.bindButtonHandlers();
        
        if (tab === 'UPLOAD') {
            await this.checkApiConnection();
            await this.loadR2FolderStructure();
            this.renderFolderTree();
            this.mountUploadProgress();
            this.renderGrid();
        } else if (tab === 'LIBRARY') {
            await this.loadR2FolderStructure();
            // Small delay to ensure DOM is ready
            requestAnimationFrame(() => {
                this.renderLibraryFolderTree();
            });
            await this.loadGalleries();
        }
        // ABOUT tab doesn't need async init
    }
    
    async loadR2FolderStructure() {
        try {
            const response = await fetch(`${API_BASE}/r2-folders`);
            if (response.ok) {
                const data = await response.json();
                if (data.structure) {
                    this.r2FolderStructure = data.structure;
                }
            }
        } catch (e) {
            console.warn('Could not load R2 folder structure:', e);
            // Fall back to empty structure
            this.r2FolderStructure = { "art": {}, "projects": {} };
        }
    }

    bindButtonHandlers() {
        const buttons = [
            'processAll', 'uploadAll', 'clearStaging',
            'applyToSelected', 'createGroup', 'processSelected', 'deleteSelected',
            'loadGallery', 'viewFull', 'copyUrl',
            'docOverview', 'docFrontend', 'docBackend', 'docApi',
            'addFolder',
            // Library tab buttons
            'libApplyMeta', 'libSaveChanges', 'libDeleteSelected'
        ];
        
        buttons.forEach(key => {
            const component = this.tool.components.get(key);
            if (component?.element) {
                component.element.addEventListener('click', () => this.onButtonClick(key));
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // FOLDER TREE
    // ═══════════════════════════════════════════════════════════════════
    
    renderFolderTree() {
        // Get the treeContainer label and replace it with our tree
        const treeLabel = this.tool?.components?.get('treeContainer');
        if (!treeLabel?.element) return;
        
        const labelElement = treeLabel.element;
        
        // Create or get tree container
        let treeContainer = labelElement.querySelector('.folder-tree-inner');
        if (!treeContainer) {
            labelElement.innerHTML = '';
            labelElement.style.cssText = `
                max-height: calc(var(--f) * 16);
                overflow-y: auto;
                border: 1px solid var(--c-border);
                padding: calc(var(--f) * 0.5);
                font-size: var(--f);
                background: var(--c-bg);
                display: block;
                margin: calc(var(--f) * 0.3) 0;
            `;
            treeContainer = document.createElement('div');
            treeContainer.className = 'folder-tree-inner';
            labelElement.appendChild(treeContainer);
            
            // Inject hover styles - always ensure they exist
            let styleEl = document.getElementById('folder-tree-styles');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'folder-tree-styles';
                document.head.appendChild(styleEl);
            }
        }
        
        // Always update styles to ensure theme changes are reflected
        const styleEl = document.getElementById('folder-tree-styles');
        if (styleEl) {
            const computedStyle = getComputedStyle(document.documentElement);
            const textColor = computedStyle.getPropertyValue('--c-text').trim() || '#c0c0c0';
            const bgColor = computedStyle.getPropertyValue('--c-bg').trim() || '#000000';
            const accentColor = computedStyle.getPropertyValue('--c-accent').trim() || '#ffffff';
            
            styleEl.textContent = `
                .folder-tree-inner {
                    color: ${textColor};
                }
                .folder-item:not(.selected):hover {
                    background: ${textColor} !important;
                    color: ${bgColor} !important;
                }
                .folder-toggle {
                    color: ${accentColor};
                }
                .folder-toggle.has-children:hover {
                    color: #00ffff !important;
                }
            `;
        }
        
        // Check if R2 structure is empty
        if (!this.r2FolderStructure || Object.keys(this.r2FolderStructure).length === 0) {
            treeContainer.innerHTML = `
                <div style="color: var(--c-text); opacity: 0.6; padding: calc(var(--f) * 0.5);">
                    No folders found on R2.<br>
                    Check API connection.
                </div>
            `;
            return;
        }
        
        // Render tree HTML using R2 structure
        treeContainer.innerHTML = this.buildTreeHTML(this.r2FolderStructure, '');
        
        // Bind click handlers
        treeContainer.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const path = item.dataset.path;
                this.selectFolder(path);
            });
        });
        
        treeContainer.querySelectorAll('.folder-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const path = toggle.dataset.path;
                this.toggleFolder(path);
            });
        });
    }
    
    buildTreeHTML(obj, parentPath, depth = 0) {
        let html = '';
        const keys = Object.keys(obj).sort();
        
        for (const key of keys) {
            const path = parentPath ? `${parentPath}/${key}` : key;
            const children = obj[key];
            const hasChildren = Object.keys(children).length > 0;
            const isExpanded = this.expandedPaths.has(path);
            const isSelected = this.selectedPath === path;
            
            const indent = depth * 16;
            const toggleIcon = hasChildren ? (isExpanded ? '▾' : '▸') : ' ';
            
            // Build inline styles for selection - uses inverted colours (site standard)
            // Get current theme colours for proper inversion
            const computedStyle = getComputedStyle(document.documentElement);
            const textColor = computedStyle.getPropertyValue('--c-text').trim() || '#c0c0c0';
            const bgColor = computedStyle.getPropertyValue('--c-bg').trim() || '#000000';
            
            // Selected = inverted (text as bg, bg as text)
            const selectedBg = isSelected ? textColor : 'transparent';
            const selectedTextColor = isSelected ? bgColor : 'inherit';
            
            html += `
                <div class="folder-row" style="
                    padding-left: ${indent}px;
                    display: flex;
                    align-items: center;
                    line-height: 1.7;
                ">
                    <span class="folder-toggle ${hasChildren ? 'has-children' : ''}" data-path="${path}" style="
                        cursor: ${hasChildren ? 'pointer' : 'default'};
                        visibility: ${hasChildren ? 'visible' : 'hidden'};
                        width: calc(var(--f) * 1.2);
                        text-align: center;
                        user-select: none;
                        font-size: calc(var(--f) * 0.8);
                    ">${toggleIcon}</span>
                    <span class="folder-item ${isSelected ? 'selected' : ''}" data-path="${path}" style="
                        cursor: pointer;
                        padding: 2px 8px;
                        flex: 1;
                        background-color: ${selectedBg};
                        color: ${selectedTextColor};
                    ">${key}</span>
                </div>
            `;
            
            if (hasChildren && isExpanded) {
                html += this.buildTreeHTML(children, path, depth + 1);
            }
        }
        
        return html;
    }
    
    selectFolder(path) {
        this.selectedPath = path;
        this.renderFolderTree();
    }
    
    toggleFolder(path) {
        if (this.expandedPaths.has(path)) {
            this.expandedPaths.delete(path);
        } else {
            this.expandedPaths.add(path);
        }
        this.renderFolderTree();
    }
    
    getCurrentPath() {
        return this.selectedPath || '';
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // LIBRARY FOLDER TREE (Source selection)
    // ═══════════════════════════════════════════════════════════════════
    
    renderLibraryFolderTree() {
        // Get the libraryTreeContainer label and replace it with our tree
        const treeLabel = this.tool?.components?.get('libraryTreeContainer');
        if (!treeLabel?.element) return;
        
        const labelElement = treeLabel.element;
        
        // Create or get tree container
        let treeContainer = labelElement.querySelector('.folder-tree-inner');
        if (!treeContainer) {
            labelElement.innerHTML = '';
            labelElement.style.cssText = `
                max-height: calc(var(--f) * 16);
                overflow-y: auto;
                border: 1px solid var(--c-border);
                padding: calc(var(--f) * 0.5);
                font-size: var(--f);
                background: var(--c-bg);
                display: block;
                margin: calc(var(--f) * 0.3) 0;
            `;
            treeContainer = document.createElement('div');
            treeContainer.className = 'folder-tree-inner';
            labelElement.appendChild(treeContainer);
            
            // Inject hover styles - ensure they exist (shared with upload tree)
            let styleEl = document.getElementById('folder-tree-styles');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'folder-tree-styles';
                document.head.appendChild(styleEl);
            }
        }
        
        // Always update styles to ensure theme changes are reflected
        const styleEl = document.getElementById('folder-tree-styles');
        if (styleEl) {
            const computedStyle = getComputedStyle(document.documentElement);
            const textColor = computedStyle.getPropertyValue('--c-text').trim() || '#c0c0c0';
            const bgColor = computedStyle.getPropertyValue('--c-bg').trim() || '#000000';
            const accentColor = computedStyle.getPropertyValue('--c-accent').trim() || '#ffffff';
            
            styleEl.textContent = `
                .folder-tree-inner {
                    color: ${textColor};
                }
                .folder-item:not(.selected):hover {
                    background: ${textColor} !important;
                    color: ${bgColor} !important;
                }
                .folder-toggle {
                    color: ${accentColor};
                }
                .folder-toggle.has-children:hover {
                    color: #00ffff !important;
                }
            `;
        }
        
        // Check if R2 structure is empty
        if (!this.r2FolderStructure || Object.keys(this.r2FolderStructure).length === 0) {
            treeContainer.innerHTML = `
                <div style="color: var(--c-text); opacity: 0.6; padding: calc(var(--f) * 0.5);">
                    No galleries found on R2.<br>
                    Check API connection.
                </div>
            `;
            return;
        }
        
        // Render tree HTML using R2 folder structure
        treeContainer.innerHTML = this.buildLibraryTreeHTML(this.r2FolderStructure, '');
        
        // Bind click handlers
        const folderItems = treeContainer.querySelectorAll('.folder-item');
        const folderToggles = treeContainer.querySelectorAll('.folder-toggle');
        
        folderItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const path = item.dataset.path;
                this.selectLibraryFolder(path);
            });
        });
        
        folderToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const path = toggle.dataset.path;
                this.toggleLibraryFolder(path);
            });
        });
    }
    
    buildLibraryTreeHTML(obj, parentPath, depth = 0) {
        let html = '';
        const keys = Object.keys(obj).sort();
        
        for (const key of keys) {
            const path = parentPath ? `${parentPath}/${key}` : key;
            const children = obj[key];
            const hasChildren = Object.keys(children).length > 0;
            const isExpanded = this.libraryExpandedPaths.has(path);
            const isSelected = this.librarySelectedPath === path;
            
            const indent = depth * 16;
            const toggleIcon = hasChildren ? (isExpanded ? '▾' : '▸') : ' ';
            
            // Build inline styles for selection - uses inverted colours (site standard)
            const computedStyle = getComputedStyle(document.documentElement);
            const textColor = computedStyle.getPropertyValue('--c-text').trim() || '#c0c0c0';
            const bgColor = computedStyle.getPropertyValue('--c-bg').trim() || '#000000';
            
            // Selected = inverted (text as bg, bg as text)
            const selectedBg = isSelected ? textColor : 'transparent';
            const selectedTextColor = isSelected ? bgColor : 'inherit';
            
            html += `
                <div class="folder-row" style="
                    padding-left: ${indent}px;
                    display: flex;
                    align-items: center;
                    line-height: 1.7;
                ">
                    <span class="folder-toggle ${hasChildren ? 'has-children' : ''}" data-path="${path}" style="
                        cursor: ${hasChildren ? 'pointer' : 'default'};
                        visibility: ${hasChildren ? 'visible' : 'hidden'};
                        width: calc(var(--f) * 1.2);
                        text-align: center;
                        user-select: none;
                        font-size: calc(var(--f) * 0.8);
                    ">${toggleIcon}</span>
                    <span class="folder-item ${isSelected ? 'selected' : ''}" data-path="${path}" style="
                        cursor: pointer;
                        padding: 2px 8px;
                        flex: 1;
                        background-color: ${selectedBg};
                        color: ${selectedTextColor};
                    ">${key}</span>
                </div>
            `;
            
            if (hasChildren && isExpanded) {
                html += this.buildLibraryTreeHTML(children, path, depth + 1);
            }
        }
        
        return html;
    }
    
    selectLibraryFolder(path) {
        this.librarySelectedPath = path;
        this.renderLibraryFolderTree();
    }
    
    toggleLibraryFolder(path) {
        if (this.libraryExpandedPaths.has(path)) {
            this.libraryExpandedPaths.delete(path);
        } else {
            this.libraryExpandedPaths.add(path);
        }
        this.renderLibraryFolderTree();
    }
    
    getLibraryCurrentPath() {
        return this.librarySelectedPath || '';
    }
    
    async addFolder() {
        const nameInput = this.tool.components.get('newFolderName');
        const newName = nameInput?.getValue?.() || nameInput?.element?.value || '';
        
        if (!newName || !newName.match(/^[a-zA-Z0-9-]+$/)) {
            alert('Folder name must be alphanumeric with hyphens only');
            return;
        }
        
        // Navigate to the target location in R2 folder structure
        let target = this.r2FolderStructure;
        if (this.selectedPath) {
            const parts = this.selectedPath.split('/');
            for (const part of parts) {
                if (!target[part]) target[part] = {};
                target = target[part];
            }
        }
        
        // Check if folder already exists
        if (target[newName]) {
            alert('Folder already exists');
            return;
        }
        
        // Create folder on R2 via API
        const newPath = this.selectedPath ? `${this.selectedPath}/${newName}` : newName;
        try {
            const response = await fetch(`${API_BASE}/r2-create-folder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: newPath })
            });
            
            if (!response.ok) {
                const error = await response.json();
                alert(`Failed to create folder: ${error.error || 'Unknown error'}`);
                return;
            }
            
            // Update local structure on success
            target[newName] = {};
        } catch (e) {
            console.warn('Could not create folder on R2:', e);
            alert('Failed to create folder. Check API connection.');
            return;
        }
        
        // Expand parent and re-render
        if (this.selectedPath) {
            this.expandedPaths.add(this.selectedPath);
        }
        this.renderFolderTree();
        
        // Clear input
        if (nameInput?.element) nameInput.element.value = '';
        
        window.debugLog('TOOLS', 'Added folder:', newName, 'at path:', this.selectedPath || '/');
    }

    onInputChange(key, value) {
        if (key === 'browseType') {
            this.loadGalleries();
        }
    }

    async onButtonClick(key) {
        switch (key) {
            case 'processAll':
                await this.processFiles();
                break;
            case 'uploadAll':
                await this.uploadFiles();
                break;
            case 'clearStaging':
                await this.clearStaging();
                break;
            case 'applyToSelected':
                await this.applyMetadataToSelected();
                break;
            case 'processSelected':
                await this.processFiles([...this.selectedIds]);
                break;
            case 'deleteSelected':
                await this.deleteSelected();
                break;
            case 'loadGallery':
                await this.loadSelectedGallery();
                break;
            case 'viewFull':
                this.viewFullSize();
                break;
            case 'copyUrl':
                this.copySelectedUrl();
                break;
            // Doc navigation
            case 'docOverview':
                this.renderAboutContent('overview');
                break;
            case 'docFrontend':
                this.renderAboutContent('frontend');
                break;
            case 'docBackend':
                this.renderAboutContent('backend');
                break;
            case 'docApi':
                this.renderAboutContent('api');
                break;
            // Folder management
            case 'addFolder':
                await this.addFolder();
                break;
            // Library tab - metadata editing
            case 'libApplyMeta':
                this.applyLibraryMetadata();
                break;
            case 'libSaveChanges':
                await this.saveLibraryChanges();
                break;
            case 'libDeleteSelected':
                await this.deleteLibrarySelected();
                break;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // LIBRARY METADATA EDITING
    // ═══════════════════════════════════════════════════════════════════
    
    applyLibraryMetadata() {
        if (!this.selectedLibraryIndices || this.selectedLibraryIndices.size === 0) {
            alert('No images selected');
            return;
        }
        
        const alt = this.getInputValue('libAltText');
        const caption = this.getInputValue('libCaption');
        const tagsStr = this.getInputValue('libTags');
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : null;
        
        // Apply to all selected images
        this.selectedLibraryIndices.forEach(idx => {
            const img = this.libraryImages[idx];
            if (alt) img.alt = alt;
            if (caption) img.caption = caption;
            if (tags) img.tags = tags;
        });
        
        const count = this.selectedLibraryIndices.size;
        this.updateLabel('librarySelection', `${count} updated - click "Save Changes" to persist`);
    }
    
    async saveLibraryChanges() {
        if (!this.currentGallery || !this.librarySelectedPath) {
            alert('No gallery loaded');
            return;
        }
        
        // Build updated manifest
        const manifest = {
            ...this.currentGallery,
            images: this.libraryImages,
            updated_at: new Date().toISOString()
        };
        
        try {
            const response = await fetch(`${API_BASE}/update-manifest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: this.librarySelectedPath,
                    manifest: manifest
                })
            });
            
            if (response.ok) {
                this.updateLabel('galleryInfo', `Saved! ${this.libraryImages.length} images`);
            } else {
                throw new Error('Failed to save');
            }
        } catch (e) {
            alert('Failed to save changes: ' + e.message);
        }
    }
    
    async deleteLibrarySelected() {
        if (!this.selectedLibraryIndices || this.selectedLibraryIndices.size === 0) {
            alert('No images selected');
            return;
        }
        
        const count = this.selectedLibraryIndices.size;
        if (!confirm(`Delete ${count} image(s) from R2? This cannot be undone.`)) {
            return;
        }
        
        // For now, just remove from local array
        // TODO: Implement actual R2 deletion via API
        const indicesToRemove = [...this.selectedLibraryIndices].sort((a, b) => b - a);
        indicesToRemove.forEach(idx => {
            this.libraryImages.splice(idx, 1);
        });
        
        this.selectedLibraryIndices.clear();
        this.updateLabel('librarySelection', `Deleted ${count} - click "Save Changes" to persist`);
        this.renderLibraryGrid();
    }

    // ═══════════════════════════════════════════════════════════════════
    // API COMMUNICATION
    // ═══════════════════════════════════════════════════════════════════

    async checkApiConnection() {
        try {
            const response = await fetch(`${SITE_API}/health`);
            if (response.ok) {
                this.apiConnected = true;
                this.updateLabel('apiStatus', '✅ Upload API ready');
            } else {
                throw new Error('API not responding');
            }
        } catch (error) {
            this.apiConnected = false;
            this.updateLabel('apiStatus', '❌ Upload API offline — deploy /api and configure admin authentication');
        }
    }

    mountUploadProgress() {
        const status = this.tool?.components.get('apiStatus');
        if (!status?.element?.parentElement) return;
        if (this.uploadProgressBar) {
            this.uploadProgressBar.destroy();
            this.uploadProgressBar = null;
        }
        const bar = new ComponentLibrary.ProgressBar({
            value: 0,
            max: 100,
            showPercent: true,
            label: 'Upload',
        }, this.deps);
        this.componentInstances.push(bar);
        this.uploadProgressBar = bar;
        const el = bar.render();
        el.style.marginTop = 'calc(var(--f) * 0.5)';
        status.element.parentElement.appendChild(el);
    }

    setUploadProgress(percent, label) {
        if (!this.uploadProgressBar) return;
        this.uploadProgressBar.setValue(Math.min(100, Math.max(0, percent)));
        if (label) this.updateLabel('stagedCount', label);
    }

    async loadStagedFiles() {
        this.updateLabel('stagedCount', `${this.stagedFiles.length} files staged`);
        this.renderGrid();
    }

    async stageFiles(files) {
        const filesWithPaths = files.map((file) => ({ file, path: '' }));
        await this.stageFilesWithPaths(filesWithPaths);
    }

    async uploadFiles(ids = null) {
        if (!this.apiConnected) {
            alert('Upload API not available');
            return;
        }

        const collection = (this.selectedPath || 'digital/staged')
            .replace(/^art\//, '')
            .replace(/^\/+/, '');
        const defaultAlt = this.getInputValue('defaultAlt');
        const defaultTags = (this.getInputValue('defaultTags') || '')
            .split(',').map((t) => t.trim()).filter(Boolean);
        const targetIds = ids ? [...ids] : this.stagedFiles.map((f) => f.id);
        const filesToUpload = targetIds.filter((id) => this.localFiles.has(id));

        if (!filesToUpload.length) {
            alert('No staged files to upload');
            return;
        }

        this.updateLabel('apiStatus', '⏳ Uploading...');
        this.setUploadProgress(0, 'Upload');

        let uploaded = 0;
        try {
            for (let i = 0; i < filesToUpload.length; i++) {
                const id = filesToUpload[i];
                const file = this.localFiles.get(id);
                const staged = this.stagedFiles.find((f) => f.id === id);
                const meta = staged?.metadata || {};
                const tags = meta.tags?.length ? meta.tags : defaultTags;

                await uploadGalleryBlob(file, {
                    filename: file.name,
                    mime: file.type,
                    collection,
                    title: meta.caption || meta.alt || defaultAlt || file.name,
                    description: meta.caption || meta.alt || defaultAlt || '',
                    tags,
                    sourceTool: 'media-manager',
                }, {
                    onProgress: (p) => {
                        const overall = ((i + p) / filesToUpload.length) * 100;
                        this.setUploadProgress(overall, `File ${i + 1}/${filesToUpload.length}`);
                    },
                });

                uploaded += 1;
                this.localFiles.delete(id);
                this.stagedFiles = this.stagedFiles.filter((f) => f.id !== id);
                this.selectedIds.delete(id);
            }

            this.setUploadProgress(100, 'Done');
            this.updateLabel('apiStatus', `✅ Uploaded ${uploaded} file(s) to ${collection}`);
            await this.loadStagedFiles();
        } catch (error) {
            this.updateLabel('apiStatus', '❌ Upload failed');
            console.error('Failed to upload:', error);
        }
    }

    async processFiles(ids = null) {
        this.updateLabel('apiStatus', 'Process step optional — upload sends originals via signed PUT');
        window.debugLog('TOOLS', 'processFiles skipped (C2 direct upload)', ids);
    }

    async clearStaging() {
        if (!this.stagedFiles.length) return;
        if (!confirm('Clear all staged files?')) return;
        this.stagedFiles = [];
        this.localFiles.clear();
        this.selectedIds.clear();
        this.renderGrid();
        this.updateLabel('stagedCount', '0 files staged');
    }

    async deleteSelected() {
        if (this.selectedIds.size === 0) return;
        
        for (const id of this.selectedIds) {
            try {
                await fetch(`${API_BASE}/staged/${id}`, { method: 'DELETE' });
            } catch (error) {
                console.error(`Failed to delete ${id}:`, error);
            }
        }
        
        this.selectedIds.clear();
        await this.loadStagedFiles();
    }

    async applyMetadataToSelected() {
        if (this.selectedIds.size === 0) return;
        
        const alt = this.getInputValue('selectedAlt');
        const caption = this.getInputValue('selectedCaption');
        const tagsStr = this.getInputValue('selectedTags');
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
        
        const metadata = {};
        if (alt) metadata.alt = alt;
        if (caption) metadata.caption = caption;
        if (tags.length) metadata.tags = tags;
        
        if (Object.keys(metadata).length === 0) return;
        
        try {
            await fetch(`${API_BASE}/metadata`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: [...this.selectedIds],
                    metadata,
                }),
            });
            
            await this.loadStagedFiles();
        } catch (error) {
            console.error('Failed to update metadata:', error);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // DROP ZONE
    // ═══════════════════════════════════════════════════════════════════

    setupDropZone() {
        if (!this.previewArea) return;
        
        this.previewArea.style.cssText += `
            position: relative;
        `;
        
        // Create drop overlay
        const overlay = document.createElement('div');
        overlay.className = 'drop-overlay';
        overlay.style.cssText = `
            position: absolute;
            inset: 0;
            background: rgba(0, 255, 0, 0.1);
            border: 3px dashed var(--vga-green);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: calc(var(--f) * 1.5);
            color: var(--vga-green);
            pointer-events: none;
            z-index: 100;
        `;
        overlay.innerHTML = `
            <div>DROP FILES OR FOLDERS</div>
            <div style="font-size: calc(var(--f) * 0.9); margin-top: calc(var(--f) * 0.5); opacity: 0.7;">Folders scanned recursively</div>
        `;
        this.previewArea.appendChild(overlay);
        
        // Drag events
        this.previewArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            overlay.style.display = 'flex';
        });
        
        this.previewArea.addEventListener('dragleave', (e) => {
            if (!this.previewArea.contains(e.relatedTarget)) {
                overlay.style.display = 'none';
            }
        });
        
        this.previewArea.addEventListener('drop', async (e) => {
            e.preventDefault();
            overlay.style.display = 'none';
            
            // Use DataTransferItemList for folder support
            const items = e.dataTransfer.items;
            if (items && items.length > 0) {
                const files = await this.extractFilesFromItems(items);
                if (files.length > 0) {
                    this.updateLabel('apiStatus', `Staging ${files.length} files...`);
                    await this.stageFilesWithPaths(files);
                }
            } else {
                // Fallback for browsers without webkitGetAsEntry
                const files = [...e.dataTransfer.files].filter(f => 
                    f.type.startsWith('image/')
                );
                if (files.length > 0) {
                    await this.stageFiles(files);
                }
            }
        });
    }

    /**
     * Extract files from DataTransferItemList, handling folders recursively
     */
    async extractFilesFromItems(items) {
        const files = [];
        const entries = [];
        
        // Convert items to entries
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.webkitGetAsEntry) {
                const entry = item.webkitGetAsEntry();
                if (entry) entries.push(entry);
            } else if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file && file.type.startsWith('image/')) {
                    files.push({ file, path: '' });
                }
            }
        }
        
        // Process entries (may include folders)
        for (const entry of entries) {
            await this.processEntry(entry, '', files);
        }
        
        return files;
    }

    /**
     * Recursively process a file/folder entry
     */
    async processEntry(entry, basePath, files) {
        if (entry.isFile) {
            const file = await this.entryToFile(entry);
            if (file && file.type.startsWith('image/')) {
                files.push({ file, path: basePath });
            }
        } else if (entry.isDirectory) {
            const reader = entry.createReader();
            const entries = await this.readAllEntries(reader);
            const folderPath = basePath ? `${basePath}/${entry.name}` : entry.name;
            
            for (const childEntry of entries) {
                await this.processEntry(childEntry, folderPath, files);
            }
        }
    }

    /**
     * Read all entries from a directory reader (handles batching)
     */
    readAllEntries(reader) {
        return new Promise((resolve, reject) => {
            const entries = [];
            const readBatch = () => {
                reader.readEntries(batch => {
                    if (batch.length === 0) {
                        resolve(entries);
                    } else {
                        entries.push(...batch);
                        readBatch(); // Keep reading until empty
                    }
                }, reject);
            };
            readBatch();
        });
    }

    /**
     * Convert FileSystemFileEntry to File object
     */
    entryToFile(entry) {
        return new Promise((resolve, reject) => {
            entry.file(resolve, reject);
        });
    }

    /**
     * Stage files with their folder paths
     */
    async stageFilesWithPaths(filesWithPaths) {
        for (const { file, path } of filesWithPaths) {
            const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            this.localFiles.set(id, file);
            this.stagedFiles.push({
                id,
                filename: file.name,
                status: 'staged',
                local: true,
                metadata: {
                    path,
                    alt: this.getInputValue('defaultAlt') || '',
                    caption: '',
                    tags: (this.getInputValue('defaultTags') || '')
                        .split(',').map((t) => t.trim()).filter(Boolean),
                },
            });
        }
        this.updateLabel('apiStatus', `Staged ${filesWithPaths.length} file(s) locally`);
        await this.loadStagedFiles();
    }

    // ═══════════════════════════════════════════════════════════════════
    // GRID RENDERING
    // ═══════════════════════════════════════════════════════════════════

    renderGrid() {
        if (!this.previewArea) return;
        
        // Keep drop overlay if exists
        const overlay = this.previewArea.querySelector('.drop-overlay');
        this.previewArea.innerHTML = '';
        if (overlay) this.previewArea.appendChild(overlay);
        
        if (this.stagedFiles.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        const grid = document.createElement('div');
        grid.className = 'media-grid';
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 4px;
            padding: 8px;
            overflow-y: auto;
            height: 100%;
        `;
        
        this.stagedFiles.forEach((file, index) => {
            const tile = this.createTile(file, index);
            grid.appendChild(tile);
        });
        
        this.previewArea.appendChild(grid);
    }

    createTile(file, index) {
        const isSelected = this.selectedIds.has(file.id);
        
        const tile = document.createElement('div');
        tile.className = `media-tile ${isSelected ? 'selected' : ''}`;
        tile.dataset.id = file.id;
        tile.style.cssText = `
            aspect-ratio: 1;
            background: #111;
            border: ${isSelected ? '2px solid var(--vga-cyan)' : '1px solid var(--c-border)'};
            overflow: hidden;
            cursor: pointer;
            position: relative;
        `;
        
        // Thumbnail
        const img = document.createElement('img');
        if (file.local && this.localFiles.has(file.id)) {
            img.src = URL.createObjectURL(this.localFiles.get(file.id));
        } else {
            img.src = `${API_BASE}/staged/${file.id}/thumb`;
        }
        img.alt = file.metadata?.alt || file.id;
        img.loading = 'lazy';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        tile.appendChild(img);
        
        // Status badge
        const badge = document.createElement('div');
        badge.style.cssText = `
            position: absolute;
            top: 2px;
            right: 2px;
            padding: 1px 4px;
            font-size: 9px;
            font-family: var(--font-mono);
            background: ${file.status === 'uploaded' ? 'var(--vga-green)' : file.status === 'processed' ? 'var(--vga-cyan)' : 'var(--vga-gray)'};
            color: var(--c-bg);
        `;
        badge.textContent = file.status?.toUpperCase() || 'STAGED';
        tile.appendChild(badge);
        
        // Index
        const num = document.createElement('div');
        num.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            padding: 1px 4px;
            font-size: 9px;
            background: var(--c-text);
            color: var(--c-bg);
        `;
        num.textContent = index + 1;
        tile.appendChild(num);
        
        // Click handling
        tile.addEventListener('click', (e) => this.handleTileClick(file.id, e));
        
        return tile;
    }

    handleTileClick(id, event) {
        if (event.ctrlKey || event.metaKey) {
            // Toggle selection
            if (this.selectedIds.has(id)) {
                this.selectedIds.delete(id);
            } else {
                this.selectedIds.add(id);
            }
        } else if (event.shiftKey && this.selectedIds.size > 0) {
            // Range select
            const ids = this.stagedFiles.map(f => f.id);
            const lastSelected = [...this.selectedIds].pop();
            const lastIndex = ids.indexOf(lastSelected);
            const currentIndex = ids.indexOf(id);
            const [start, end] = lastIndex < currentIndex 
                ? [lastIndex, currentIndex] 
                : [currentIndex, lastIndex];
            
            for (let i = start; i <= end; i++) {
                this.selectedIds.add(ids[i]);
            }
        } else {
            // Single select
            this.selectedIds.clear();
            this.selectedIds.add(id);
        }
        
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        // Update tile styles
        const tiles = this.previewArea.querySelectorAll('.media-tile');
        tiles.forEach(tile => {
            const isSelected = this.selectedIds.has(tile.dataset.id);
            tile.style.border = isSelected 
                ? '2px solid var(--vga-cyan)' 
                : '1px solid var(--c-border)';
            tile.className = `media-tile ${isSelected ? 'selected' : ''}`;
        });
        
        // Update selection label
        const count = this.selectedIds.size;
        this.updateLabel('selectionInfo', count === 0 
            ? 'No images selected' 
            : `${count} image${count > 1 ? 's' : ''} selected`
        );
    }

    renderEmptyState() {
        const empty = document.createElement('div');
        empty.className = 'empty-drop-zone';
        empty.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--c-text-muted, #666);
            text-align: center;
            padding: calc(var(--f) * 2);
            border: 2px dashed var(--c-border);
            margin: calc(var(--f));
            box-sizing: border-box;
            cursor: pointer;
        `;
        empty.innerHTML = `
            <div style="font-size: calc(var(--f) * 4); margin-bottom: calc(var(--f) * 1.5); opacity: 0.6;">+</div>
            <div style="font-size: calc(var(--f) * 1.3); margin-bottom: calc(var(--f) * 0.75); color: var(--c-text);">DRAG FILES OR FOLDERS HERE</div>
            <div style="font-size: calc(var(--f) * 0.9); color: var(--vga-gray); margin-bottom: calc(var(--f) * 0.5);">JPG, PNG, WebP, GIF supported</div>
            <div style="font-size: calc(var(--f) * 0.85); color: var(--vga-gray);">Folders are scanned recursively</div>
            <div style="margin-top: calc(var(--f) * 2); padding: calc(var(--f) * 0.5) calc(var(--f)); border: 1px solid var(--c-border); font-size: calc(var(--f) * 0.85);">
                or click to browse
            </div>
        `;
        
        // Click to open file picker
        empty.addEventListener('click', () => this.openFilePicker());
        
        this.previewArea.appendChild(empty);
    }

    openFilePicker() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.webkitdirectory = false; // Allow files only via this picker
        
        input.addEventListener('change', async (e) => {
            const files = [...e.target.files].filter(f => f.type.startsWith('image/'));
            if (files.length > 0) {
                await this.stageFiles(files);
            }
        });
        
        input.click();
    }

    renderAboutContent(section = 'overview') {
        if (!this.previewArea) return;
        
        this.currentDocSection = section;
        this.previewArea.innerHTML = '';
        
        // Get markdown content for the selected section
        const markdownContent = ABOUT_DOCS[section] || ABOUT_DOCS.overview;
        
        // Use MarkdownBody component for consistent rendering
        const MarkdownBody = ComponentLibrary.MarkdownBody;
        if (MarkdownBody) {
            const mdComponent = new MarkdownBody({
                markdownText: markdownContent,
                className: 'markdown-body'  // Use site-wide standard class
            }, this.deps);
            
            const rendered = mdComponent.render();
            rendered.style.cssText = `
                padding: calc(var(--f) * 2);
                overflow-y: auto;
                height: 100%;
            `;
            
            this.previewArea.appendChild(rendered);
            
            // Track for cleanup
            if (!this.docComponents) this.docComponents = [];
            this.docComponents.push(mdComponent);
        } else {
            // Fallback: basic HTML rendering
            const wiki = document.createElement('div');
            wiki.className = 'about-wiki';
            wiki.style.cssText = `
                padding: calc(var(--f) * 2);
                overflow-y: auto;
                height: 100%;
                font-size: calc(var(--f) * 0.9);
                line-height: 1.6;
            `;
            wiki.innerHTML = `<pre>${markdownContent}</pre>`;
            this.previewArea.appendChild(wiki);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // LIBRARY TAB
    // ═══════════════════════════════════════════════════════════════════

    async loadGalleries() {
        if (!this.apiConnected) {
            await this.checkApiConnection();
            if (!this.apiConnected) return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/galleries`);
            const data = await response.json();
            this.galleries = data.galleries || [];
            
            const galleryType = this.getInputValue('browseType') || 'photos';
            const filtered = this.galleries.filter(g => g.type === galleryType);
            
            const options = [
                { label: 'Select gallery...', value: '' },
                ...filtered.map(g => ({ label: g.id.toUpperCase(), value: g.id }))
            ];
            
            const dropdown = this.tool.components.get('browseGallery');
            if (dropdown?.setOptions) {
                dropdown.setOptions(options);
            }
        } catch (error) {
            console.error('Failed to load galleries:', error);
        }
    }

    async loadSelectedGallery() {
        // Use the selected path from the folder tree
        const selectedPath = this.librarySelectedPath;
        
        if (!selectedPath) {
            this.updateLabel('galleryInfo', '⚠️ Select a gallery first');
            return;
        }
        
        // Path is like "art/photos/Life1" - we need the full path for the API
        this.updateLabel('galleryInfo', `Loading ${selectedPath}...`);
        
        try {
            // Use the full path to fetch manifest
            const response = await fetch(`${API_BASE}/gallery-by-path/${encodeURIComponent(selectedPath)}`);
            
            if (!response.ok) {
                this.updateLabel('galleryInfo', '❌ Gallery not found');
                return;
            }
            
            const manifest = await response.json();
            this.currentGallery = manifest;
            
            // Deduplicate images by ID (manifest may have duplicates)
            const seen = new Set();
            this.libraryImages = (manifest.images || []).filter(img => {
                const key = img.id || img.filename;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            
            const galleryName = selectedPath.split('/').pop();
            this.updateLabel('galleryInfo', `✅ ${galleryName.toUpperCase()} (${this.libraryImages.length} images)`);
            this.setTextareaValue('galleryDetails', `Path: ${selectedPath}\nBase: ${manifest.base_url}\nGenerated: ${manifest.generated_at || 'N/A'}`);
            
            this.renderLibraryGrid();
        } catch (error) {
            this.updateLabel('galleryInfo', '❌ Failed to load');
            console.error('Failed to load gallery:', error);
        }
    }

    renderLibraryGrid() {
        if (!this.previewArea || !this.currentGallery) return;
        
        // Clear container
        this.previewArea.innerHTML = '';
        
        // Create grid wrapper
        const grid = document.createElement('div');
        grid.className = 'library-grid';
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 4px;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            padding: 4px;
            box-sizing: border-box;
            align-content: start;
        `;
        
        // Track selected images (Set of indices for multi-select)
        this.selectedLibraryIndices = new Set();
        
        this.libraryImages.forEach((img, index) => {
            // Build thumb URL
            const thumbUrl = img.urls?.thumb || `${this.currentGallery.base_url}/thumbs/${img.filename}`;
            
            const tile = document.createElement('div');
            tile.dataset.index = index;
            tile.style.cssText = `
                width: 100%;
                padding-bottom: 100%;
                position: relative;
                background: #111;
                border: 1px solid var(--c-border);
                box-sizing: border-box;
                cursor: pointer;
            `;
            
            const imgEl = document.createElement('img');
            imgEl.src = thumbUrl;
            imgEl.alt = img.alt || img.id || `Image ${index + 1}`;
            imgEl.loading = 'lazy';
            imgEl.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;
            imgEl.onerror = () => {
                imgEl.style.display = 'none';
            };
            tile.appendChild(imgEl);
            
            // Click to select - Ctrl+click for multi-select
            tile.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    // Multi-select: toggle this tile
                    if (this.selectedLibraryIndices.has(index)) {
                        this.selectedLibraryIndices.delete(index);
                        tile.style.outline = 'none';
                    } else {
                        this.selectedLibraryIndices.add(index);
                        tile.style.outline = '2px solid var(--c-accent)';
                    }
                } else {
                    // Single select: clear others, select this one
                    grid.querySelectorAll('[data-index]').forEach(t => {
                        t.style.outline = 'none';
                    });
                    this.selectedLibraryIndices.clear();
                    this.selectedLibraryIndices.add(index);
                    tile.style.outline = '2px solid var(--c-accent)';
                }
                
                this.updateLibrarySelectionInfo();
            });
            
            grid.appendChild(tile);
        });
        
        this.previewArea.appendChild(grid);
        this.libraryGrid = grid;
    }
    
    updateLibrarySelectionInfo() {
        const count = this.selectedLibraryIndices.size;
        if (count === 0) {
            this.updateLabel('librarySelection', '0 selected (click to select, Ctrl+click for multi)');
            // Clear metadata fields
            this.setInputValue('libAltText', '');
            this.setInputValue('libCaption', '');
            this.setInputValue('libTags', '');
        } else if (count === 1) {
            const idx = [...this.selectedLibraryIndices][0];
            const img = this.libraryImages[idx];
            this.updateLabel('librarySelection', `1 selected: ${img.filename || img.id}`);
            // Populate metadata fields with this image's data
            this.setInputValue('libAltText', img.alt || '');
            this.setInputValue('libCaption', img.caption || '');
            this.setInputValue('libTags', (img.tags || []).join(', '));
        } else {
            this.updateLabel('librarySelection', `${count} selected`);
            // Mixed selection - show placeholders
            this.setInputValue('libAltText', '');
            this.setInputValue('libCaption', '');
            this.setInputValue('libTags', '');
        }
    }

    viewFullSize() {
        // For library tab - view selected image
        if (!this.selectedLibraryIndices || this.selectedLibraryIndices.size === 0) return;
        const idx = [...this.selectedLibraryIndices][0];
        const img = this.libraryImages[idx];
        if (img && this.currentGallery) {
            const webUrl = img.urls?.web || `${this.currentGallery.base_url}/web/${img.filename}`;
            window.open(webUrl, '_blank');
        }
    }

    copySelectedUrl() {
        if (!this.selectedLibraryIndices || this.selectedLibraryIndices.size === 0) return;
        const idx = [...this.selectedLibraryIndices][0];
        const img = this.libraryImages[idx];
        if (img && this.currentGallery) {
            const webUrl = img.urls?.web || `${this.currentGallery.base_url}/web/${img.filename}`;
            navigator.clipboard.writeText(webUrl).catch(console.error);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════

    updateLabel(key, text) {
        const c = this.tool?.components.get(key);
        if (c?.element) c.element.textContent = text;
    }

    setTextareaValue(key, text) {
        const c = this.tool?.components.get(key);
        if (c?.element) c.element.value = text;
    }

    getInputValue(key) {
        const c = this.tool?.components.get(key);
        if (c?.getValue) return c.getValue();
        return c?.element?.value;
    }

    setInputValue(key, value) {
        const c = this.tool?.components.get(key);
        if (c?.setValue) {
            c.setValue(value);
        } else if (c?.element) {
            c.element.value = value;
        }
    }

    destroy() {
        if (this.uploadProgressBar) {
            this.uploadProgressBar.destroy();
            this.uploadProgressBar = null;
        }
        for (const c of this.componentInstances) {
            c?.destroy?.();
        }
        this.componentInstances = [];
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        if (this.element?.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Global registration
if (typeof window !== 'undefined') {
    window.MediaManagerTool = MediaManagerTool;
}

export default MediaManagerTool;

