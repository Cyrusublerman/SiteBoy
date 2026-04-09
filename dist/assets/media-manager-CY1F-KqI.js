import{t as e}from"./index-Dq-NPXX2.js";import{t}from"./tool-base-Cvp4Jp_P.js";var n=`http://localhost:5555/api`,r={title:`MEDIA MANAGER`,sidebar:[[`STAGING`,[[`Status`,[[`label`,`Checking API...`,{variant:`status`,key:`apiStatus`}],[`label`,`0 files staged`,{variant:`caption`,key:`stagedCount`}]]],[`Destination`,[[`label`,``,{variant:`caption`,key:`treeContainer`}],[`text`,`New Folder`,``,{key:`newFolderName`,placeholder:`folder-name`}],[`button`,`Add Here`,null,{key:`addFolder`}]]],[`Batch Defaults`,[[`text`,`Default Alt Text`,``,{key:`defaultAlt`,placeholder:`Description...`}],[`text`,`Default Tags`,``,{key:`defaultTags`,placeholder:`tag1, tag2`}]]],[`Actions`,[[`button`,`Process All`,null,{key:`processAll`}],[`button`,`Upload All`,null,{key:`uploadAll`}],[`button`,`Clear Staging`,null,{key:`clearStaging`}]]]]],[`SELECTED`,[[`Selection`,[[`label`,`No images selected`,{variant:`caption`,key:`selectionInfo`}]]],[`Edit Selected`,[[`text`,`Alt Text`,``,{key:`selectedAlt`,placeholder:`Alt text...`}],[`text`,`Caption`,``,{key:`selectedCaption`,placeholder:`Caption...`}],[`text`,`Tags`,``,{key:`selectedTags`,placeholder:`tag1, tag2`}],[`button`,`Apply to Selected`,null,{key:`applyToSelected`}]]],[`Group`,[[`text`,`Group Name`,``,{key:`groupName`,placeholder:`object-name`}],[`button`,`Create Group`,null,{key:`createGroup`}]]],[`Actions`,[[`button`,`Process Selected`,null,{key:`processSelected`}],[`button`,`Delete Selected`,null,{key:`deleteSelected`}]]]]]]},i={title:`MEDIA MANAGER`,sidebar:[[`BROWSE`,[[`Source`,[[`label`,`Loading...`,{key:`libraryTreeContainer`,variant:`status`}],[`button`,`Load Gallery`,null,{key:`loadGallery`}]]],[`Info`,[[`label`,`No gallery loaded`,{variant:`status`,key:`galleryInfo`}]]]]],[`SELECTED`,[[`Selection`,[[`label`,`0 selected (click to select, Ctrl+click for multi)`,{variant:`caption`,key:`librarySelection`}]]],[`Edit Metadata`,[[`text`,`Alt Text`,``,{key:`libAltText`,placeholder:`Describe the image...`}],[`text`,`Caption`,``,{key:`libCaption`,placeholder:`Caption text...`}],[`text`,`Tags`,``,{key:`libTags`,placeholder:`tag1, tag2, tag3`}],[`button`,`Apply to Selected`,null,{key:`libApplyMeta`}]]],[`Actions`,[[`button`,`View Full Size`,null,{key:`viewFull`}],[`button`,`Save Changes`,null,{key:`libSaveChanges`}],[`button`,`Delete Selected`,null,{key:`libDeleteSelected`}]]]]]]},a={title:`MEDIA MANAGER`,sidebar:[[`DOCS`,[[`Navigation`,[[`button`,`Overview`,null,{key:`docOverview`}],[`button`,`Frontend`,null,{key:`docFrontend`}],[`button`,`Backend`,null,{key:`docBackend`}],[`button`,`API Reference`,null,{key:`docApi`}]]],[`Info`,[[`label`,`Media Manager v1.0`,{variant:`status`}],[`label`,`Localhost-only tool`,{variant:`caption`}]]]]]]},o={overview:`
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
`,frontend:`
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
`,backend:`
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
`,api:`
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
`},s=class{constructor(t,n={}){this.container=t,this.deps={...n,ComponentLibrary:e},this.tool=null,this.currentTab=`UPLOAD`,this.stagedFiles=[],this.selectedIds=new Set,this.apiConnected=!1,this.galleries=[],this.currentGallery=null,this.libraryImages=[],this.selectedPath=``,this.expandedPaths=new Set([`art`]),this.librarySelectedPath=``,this.libraryExpandedPaths=new Set([`art`]),this.r2FolderStructure={}}render(){return this.element=document.createElement(`div`),this.element.className=`media-manager-wrapper`,this.element.style.cssText=`
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        `,this.tabBar=this.createTabBar(),this.element.appendChild(this.tabBar),this.toolContainer=document.createElement(`div`),this.toolContainer.className=`media-manager-tool`,this.toolContainer.style.cssText=`
            flex: 1;
            overflow: hidden;
        `,this.element.appendChild(this.toolContainer),this.container.appendChild(this.element),this.renderTab(`UPLOAD`),this.checkApiConnection(),this.element}createTabBar(){let e=document.createElement(`div`);return e.className=`media-manager-tabs`,e.style.cssText=`
            display: flex;
            gap: 0;
            border-bottom: 1px solid var(--c-border);
            background: var(--c-bg);
        `,[`UPLOAD`,`LIBRARY`,`ABOUT`].forEach(t=>{let n=document.createElement(`button`);n.textContent=t,n.className=`tab-btn ${t===this.currentTab?`active`:``}`,n.style.cssText=`
                padding: 0 calc(var(--f) * 2);
                height: calc(var(--f) * 2.5);
                border: none;
                border-right: 1px solid var(--c-border);
                background: ${t===this.currentTab?`var(--c-text)`:`var(--c-bg)`};
                color: ${t===this.currentTab?`var(--c-bg)`:`var(--c-text)`};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: calc(var(--f) * 0.9);
                cursor: pointer;
                text-transform: uppercase;
            `,n.addEventListener(`click`,()=>this.switchTab(t)),n.addEventListener(`mouseenter`,()=>{t!==this.currentTab&&(n.style.background=`var(--c-text)`,n.style.color=`var(--c-bg)`)}),n.addEventListener(`mouseleave`,()=>{t!==this.currentTab&&(n.style.background=`var(--c-bg)`,n.style.color=`var(--c-text)`)}),e.appendChild(n)}),e}switchTab(e){e!==this.currentTab&&(this.currentTab=e,this.tabBar.querySelectorAll(`.tab-btn`).forEach(t=>{let n=t.textContent===e;t.style.background=n?`var(--c-text)`:`var(--c-bg)`,t.style.color=n?`var(--c-bg)`:`var(--c-text)`,t.className=`tab-btn ${n?`active`:``}`}),this.renderTab(e))}renderTab(e){this.tool&&(this.tool.destroy(),this.tool=null),this.toolContainer.innerHTML=``;let n;n=e===`UPLOAD`?r:e===`LIBRARY`?i:a,this.tool=new t(n,this.deps),this.tool.onInit=()=>this.onTabInit(e),this.tool.onUpdate=(e,t)=>this.onInputChange(e,t),this.tool.mount(this.toolContainer),this.previewArea=this.tool.canvasArea,e===`UPLOAD`?this.setupDropZone():e===`ABOUT`&&this.renderAboutContent()}async onTabInit(e){this.bindButtonHandlers(),e===`UPLOAD`?(await this.checkApiConnection(),await this.loadR2FolderStructure(),this.renderFolderTree(),await this.loadStagedFiles()):e===`LIBRARY`&&(await this.loadR2FolderStructure(),requestAnimationFrame(()=>{this.renderLibraryFolderTree()}),await this.loadGalleries())}async loadR2FolderStructure(){try{let e=await fetch(`${n}/r2-folders`);if(e.ok){let t=await e.json();t.structure&&(this.r2FolderStructure=t.structure)}}catch(e){console.warn(`Could not load R2 folder structure:`,e),this.r2FolderStructure={art:{},projects:{}}}}bindButtonHandlers(){[`processAll`,`uploadAll`,`clearStaging`,`applyToSelected`,`createGroup`,`processSelected`,`deleteSelected`,`loadGallery`,`viewFull`,`copyUrl`,`docOverview`,`docFrontend`,`docBackend`,`docApi`,`addFolder`,`libApplyMeta`,`libSaveChanges`,`libDeleteSelected`].forEach(e=>{let t=this.tool.components.get(e);t?.element&&t.element.addEventListener(`click`,()=>this.onButtonClick(e))})}renderFolderTree(){let e=this.tool?.components?.get(`treeContainer`);if(!e?.element)return;let t=e.element,n=t.querySelector(`.folder-tree-inner`);if(!n){t.innerHTML=``,t.style.cssText=`
                max-height: calc(var(--f) * 16);
                overflow-y: auto;
                border: 1px solid var(--c-border);
                padding: calc(var(--f) * 0.5);
                font-size: var(--f);
                background: var(--c-bg);
                display: block;
                margin: calc(var(--f) * 0.3) 0;
            `,n=document.createElement(`div`),n.className=`folder-tree-inner`,t.appendChild(n);let e=document.getElementById(`folder-tree-styles`);e||(e=document.createElement(`style`),e.id=`folder-tree-styles`,document.head.appendChild(e))}let r=document.getElementById(`folder-tree-styles`);if(r){let e=getComputedStyle(document.documentElement),t=e.getPropertyValue(`--c-text`).trim()||`#c0c0c0`;r.textContent=`
                .folder-tree-inner {
                    color: ${t};
                }
                .folder-item:not(.selected):hover {
                    background: ${t} !important;
                    color: ${e.getPropertyValue(`--c-bg`).trim()||`#000000`} !important;
                }
                .folder-toggle {
                    color: ${e.getPropertyValue(`--c-accent`).trim()||`#ffffff`};
                }
                .folder-toggle.has-children:hover {
                    color: #00ffff !important;
                }
            `}if(!this.r2FolderStructure||Object.keys(this.r2FolderStructure).length===0){n.innerHTML=`
                <div style="color: var(--c-text); opacity: 0.6; padding: calc(var(--f) * 0.5);">
                    No folders found on R2.<br>
                    Check API connection.
                </div>
            `;return}n.innerHTML=this.buildTreeHTML(this.r2FolderStructure,``),n.querySelectorAll(`.folder-item`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.path;this.selectFolder(n)})}),n.querySelectorAll(`.folder-toggle`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.path;this.toggleFolder(n)})})}buildTreeHTML(e,t,n=0){let r=``,i=Object.keys(e).sort();for(let a of i){let i=t?`${t}/${a}`:a,o=e[a],s=Object.keys(o).length>0,c=this.expandedPaths.has(i),l=this.selectedPath===i,u=n*16,d=s?c?`▾`:`▸`:` `,f=getComputedStyle(document.documentElement),p=f.getPropertyValue(`--c-text`).trim()||`#c0c0c0`,m=f.getPropertyValue(`--c-bg`).trim()||`#000000`;r+=`
                <div class="folder-row" style="
                    padding-left: ${u}px;
                    display: flex;
                    align-items: center;
                    line-height: 1.7;
                ">
                    <span class="folder-toggle ${s?`has-children`:``}" data-path="${i}" style="
                        cursor: ${s?`pointer`:`default`};
                        visibility: ${s?`visible`:`hidden`};
                        width: calc(var(--f) * 1.2);
                        text-align: center;
                        user-select: none;
                        font-size: calc(var(--f) * 0.8);
                    ">${d}</span>
                    <span class="folder-item ${l?`selected`:``}" data-path="${i}" style="
                        cursor: pointer;
                        padding: 2px 8px;
                        flex: 1;
                        background-color: ${l?p:`transparent`};
                        color: ${l?m:`inherit`};
                    ">${a}</span>
                </div>
            `,s&&c&&(r+=this.buildTreeHTML(o,i,n+1))}return r}selectFolder(e){this.selectedPath=e,this.renderFolderTree()}toggleFolder(e){this.expandedPaths.has(e)?this.expandedPaths.delete(e):this.expandedPaths.add(e),this.renderFolderTree()}getCurrentPath(){return this.selectedPath||``}renderLibraryFolderTree(){let e=this.tool?.components?.get(`libraryTreeContainer`);if(!e?.element)return;let t=e.element,n=t.querySelector(`.folder-tree-inner`);if(!n){t.innerHTML=``,t.style.cssText=`
                max-height: calc(var(--f) * 16);
                overflow-y: auto;
                border: 1px solid var(--c-border);
                padding: calc(var(--f) * 0.5);
                font-size: var(--f);
                background: var(--c-bg);
                display: block;
                margin: calc(var(--f) * 0.3) 0;
            `,n=document.createElement(`div`),n.className=`folder-tree-inner`,t.appendChild(n);let e=document.getElementById(`folder-tree-styles`);e||(e=document.createElement(`style`),e.id=`folder-tree-styles`,document.head.appendChild(e))}let r=document.getElementById(`folder-tree-styles`);if(r){let e=getComputedStyle(document.documentElement),t=e.getPropertyValue(`--c-text`).trim()||`#c0c0c0`;r.textContent=`
                .folder-tree-inner {
                    color: ${t};
                }
                .folder-item:not(.selected):hover {
                    background: ${t} !important;
                    color: ${e.getPropertyValue(`--c-bg`).trim()||`#000000`} !important;
                }
                .folder-toggle {
                    color: ${e.getPropertyValue(`--c-accent`).trim()||`#ffffff`};
                }
                .folder-toggle.has-children:hover {
                    color: #00ffff !important;
                }
            `}if(!this.r2FolderStructure||Object.keys(this.r2FolderStructure).length===0){n.innerHTML=`
                <div style="color: var(--c-text); opacity: 0.6; padding: calc(var(--f) * 0.5);">
                    No galleries found on R2.<br>
                    Check API connection.
                </div>
            `;return}n.innerHTML=this.buildLibraryTreeHTML(this.r2FolderStructure,``);let i=n.querySelectorAll(`.folder-item`),a=n.querySelectorAll(`.folder-toggle`);i.forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.path;this.selectLibraryFolder(n)})}),a.forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.path;this.toggleLibraryFolder(n)})})}buildLibraryTreeHTML(e,t,n=0){let r=``,i=Object.keys(e).sort();for(let a of i){let i=t?`${t}/${a}`:a,o=e[a],s=Object.keys(o).length>0,c=this.libraryExpandedPaths.has(i),l=this.librarySelectedPath===i,u=n*16,d=s?c?`▾`:`▸`:` `,f=getComputedStyle(document.documentElement),p=f.getPropertyValue(`--c-text`).trim()||`#c0c0c0`,m=f.getPropertyValue(`--c-bg`).trim()||`#000000`;r+=`
                <div class="folder-row" style="
                    padding-left: ${u}px;
                    display: flex;
                    align-items: center;
                    line-height: 1.7;
                ">
                    <span class="folder-toggle ${s?`has-children`:``}" data-path="${i}" style="
                        cursor: ${s?`pointer`:`default`};
                        visibility: ${s?`visible`:`hidden`};
                        width: calc(var(--f) * 1.2);
                        text-align: center;
                        user-select: none;
                        font-size: calc(var(--f) * 0.8);
                    ">${d}</span>
                    <span class="folder-item ${l?`selected`:``}" data-path="${i}" style="
                        cursor: pointer;
                        padding: 2px 8px;
                        flex: 1;
                        background-color: ${l?p:`transparent`};
                        color: ${l?m:`inherit`};
                    ">${a}</span>
                </div>
            `,s&&c&&(r+=this.buildLibraryTreeHTML(o,i,n+1))}return r}selectLibraryFolder(e){this.librarySelectedPath=e,this.renderLibraryFolderTree()}toggleLibraryFolder(e){this.libraryExpandedPaths.has(e)?this.libraryExpandedPaths.delete(e):this.libraryExpandedPaths.add(e),this.renderLibraryFolderTree()}getLibraryCurrentPath(){return this.librarySelectedPath||``}async addFolder(){let e=this.tool.components.get(`newFolderName`),t=e?.getValue?.()||e?.element?.value||``;if(!t||!t.match(/^[a-zA-Z0-9-]+$/)){alert(`Folder name must be alphanumeric with hyphens only`);return}let r=this.r2FolderStructure;if(this.selectedPath){let e=this.selectedPath.split(`/`);for(let t of e)r[t]||(r[t]={}),r=r[t]}if(r[t]){alert(`Folder already exists`);return}let i=this.selectedPath?`${this.selectedPath}/${t}`:t;try{let e=await fetch(`${n}/r2-create-folder`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({path:i})});if(!e.ok){let t=await e.json();alert(`Failed to create folder: ${t.error||`Unknown error`}`);return}r[t]={}}catch(e){console.warn(`Could not create folder on R2:`,e),alert(`Failed to create folder. Check API connection.`);return}this.selectedPath&&this.expandedPaths.add(this.selectedPath),this.renderFolderTree(),e?.element&&(e.element.value=``),console.log(`Added folder:`,t,`at path:`,this.selectedPath||`/`)}onInputChange(e,t){e===`browseType`&&this.loadGalleries()}async onButtonClick(e){switch(e){case`processAll`:await this.processFiles();break;case`uploadAll`:await this.uploadFiles();break;case`clearStaging`:await this.clearStaging();break;case`applyToSelected`:await this.applyMetadataToSelected();break;case`processSelected`:await this.processFiles([...this.selectedIds]);break;case`deleteSelected`:await this.deleteSelected();break;case`loadGallery`:await this.loadSelectedGallery();break;case`viewFull`:this.viewFullSize();break;case`copyUrl`:this.copySelectedUrl();break;case`docOverview`:this.renderAboutContent(`overview`);break;case`docFrontend`:this.renderAboutContent(`frontend`);break;case`docBackend`:this.renderAboutContent(`backend`);break;case`docApi`:this.renderAboutContent(`api`);break;case`addFolder`:await this.addFolder();break;case`libApplyMeta`:this.applyLibraryMetadata();break;case`libSaveChanges`:await this.saveLibraryChanges();break;case`libDeleteSelected`:await this.deleteLibrarySelected();break}}applyLibraryMetadata(){if(!this.selectedLibraryIndices||this.selectedLibraryIndices.size===0){alert(`No images selected`);return}let e=this.getInputValue(`libAltText`),t=this.getInputValue(`libCaption`),n=this.getInputValue(`libTags`),r=n?n.split(`,`).map(e=>e.trim()).filter(Boolean):null;this.selectedLibraryIndices.forEach(n=>{let i=this.libraryImages[n];e&&(i.alt=e),t&&(i.caption=t),r&&(i.tags=r)});let i=this.selectedLibraryIndices.size;this.updateLabel(`librarySelection`,`${i} updated - click "Save Changes" to persist`)}async saveLibraryChanges(){if(!this.currentGallery||!this.librarySelectedPath){alert(`No gallery loaded`);return}let e={...this.currentGallery,images:this.libraryImages,updated_at:new Date().toISOString()};try{if((await fetch(`${n}/update-manifest`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({path:this.librarySelectedPath,manifest:e})})).ok)this.updateLabel(`galleryInfo`,`Saved! ${this.libraryImages.length} images`);else throw Error(`Failed to save`)}catch(e){alert(`Failed to save changes: `+e.message)}}async deleteLibrarySelected(){if(!this.selectedLibraryIndices||this.selectedLibraryIndices.size===0){alert(`No images selected`);return}let e=this.selectedLibraryIndices.size;confirm(`Delete ${e} image(s) from R2? This cannot be undone.`)&&([...this.selectedLibraryIndices].sort((e,t)=>t-e).forEach(e=>{this.libraryImages.splice(e,1)}),this.selectedLibraryIndices.clear(),this.updateLabel(`librarySelection`,`Deleted ${e} - click "Save Changes" to persist`),this.renderLibraryGrid())}async checkApiConnection(){try{if((await fetch(`${n}/health`)).ok)this.apiConnected=!0,this.updateLabel(`apiStatus`,`✅ API Connected`);else throw Error(`API not responding`)}catch{this.apiConnected=!1,this.updateLabel(`apiStatus`,`❌ API Offline - Run: python tools/media-manager/media-manager-server.py`)}}async loadStagedFiles(){if(!this.apiConnected){this.stagedFiles=[],this.renderGrid();return}try{this.stagedFiles=(await(await fetch(`${n}/staged`)).json()).files||[],this.updateLabel(`stagedCount`,`${this.stagedFiles.length} files staged`),this.renderGrid()}catch(e){console.error(`Failed to load staged files:`,e),this.stagedFiles=[],this.renderGrid()}}async stageFiles(e){if(!this.apiConnected){alert(`API not connected. Run: python tools/media-manager/media-manager-server.py`);return}let t=new FormData;for(let n of e)t.append(`files`,n);try{(await fetch(`${n}/stage`,{method:`POST`,body:t})).ok&&await this.loadStagedFiles()}catch(e){console.error(`Failed to stage files:`,e)}}async processFiles(e=null){if(this.apiConnected){this.updateLabel(`apiStatus`,`⏳ Processing...`);try{let t=await(await fetch(`${n}/process`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({ids:e})})).json();this.updateLabel(`apiStatus`,`✅ Processed ${t.processed} files`),await this.loadStagedFiles()}catch(e){this.updateLabel(`apiStatus`,`❌ Processing failed`),console.error(`Failed to process:`,e)}}}async uploadFiles(e=null){if(!this.apiConnected)return;let t=this.getInputValue(`galleryName`),r=this.getInputValue(`galleryType`);if(!t){alert(`Please enter a gallery name`);return}this.updateLabel(`apiStatus`,`⏳ Uploading...`);try{let i=await(await fetch(`${n}/upload`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({ids:e,gallery:t,gallery_type:r})})).json();i.success?(this.updateLabel(`apiStatus`,`✅ Uploaded! ${i.stats.uploaded} files`),await this.loadStagedFiles()):this.updateLabel(`apiStatus`,`⚠️ ${i.error||`Upload failed`}`)}catch(e){this.updateLabel(`apiStatus`,`❌ Upload failed`),console.error(`Failed to upload:`,e)}}async clearStaging(){if(this.apiConnected&&confirm(`Clear all staged files?`))try{await fetch(`${n}/clear`,{method:`POST`}),this.stagedFiles=[],this.selectedIds.clear(),this.renderGrid(),this.updateLabel(`stagedCount`,`0 files staged`)}catch(e){console.error(`Failed to clear:`,e)}}async deleteSelected(){if(this.selectedIds.size!==0){for(let e of this.selectedIds)try{await fetch(`${n}/staged/${e}`,{method:`DELETE`})}catch(t){console.error(`Failed to delete ${e}:`,t)}this.selectedIds.clear(),await this.loadStagedFiles()}}async applyMetadataToSelected(){if(this.selectedIds.size===0)return;let e=this.getInputValue(`selectedAlt`),t=this.getInputValue(`selectedCaption`),r=this.getInputValue(`selectedTags`),i=r?r.split(`,`).map(e=>e.trim()).filter(Boolean):[],a={};if(e&&(a.alt=e),t&&(a.caption=t),i.length&&(a.tags=i),Object.keys(a).length!==0)try{await fetch(`${n}/metadata`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({ids:[...this.selectedIds],metadata:a})}),await this.loadStagedFiles()}catch(e){console.error(`Failed to update metadata:`,e)}}setupDropZone(){if(!this.previewArea)return;this.previewArea.style.cssText+=`
            position: relative;
        `;let e=document.createElement(`div`);e.className=`drop-overlay`,e.style.cssText=`
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
        `,e.innerHTML=`
            <div>DROP FILES OR FOLDERS</div>
            <div style="font-size: calc(var(--f) * 0.9); margin-top: calc(var(--f) * 0.5); opacity: 0.7;">Folders scanned recursively</div>
        `,this.previewArea.appendChild(e),this.previewArea.addEventListener(`dragover`,t=>{t.preventDefault(),e.style.display=`flex`}),this.previewArea.addEventListener(`dragleave`,t=>{this.previewArea.contains(t.relatedTarget)||(e.style.display=`none`)}),this.previewArea.addEventListener(`drop`,async t=>{t.preventDefault(),e.style.display=`none`;let n=t.dataTransfer.items;if(n&&n.length>0){let e=await this.extractFilesFromItems(n);e.length>0&&(this.updateLabel(`apiStatus`,`Staging ${e.length} files...`),await this.stageFilesWithPaths(e))}else{let e=[...t.dataTransfer.files].filter(e=>e.type.startsWith(`image/`));e.length>0&&await this.stageFiles(e)}})}async extractFilesFromItems(e){let t=[],n=[];for(let r=0;r<e.length;r++){let i=e[r];if(i.webkitGetAsEntry){let e=i.webkitGetAsEntry();e&&n.push(e)}else if(i.kind===`file`){let e=i.getAsFile();e&&e.type.startsWith(`image/`)&&t.push({file:e,path:``})}}for(let e of n)await this.processEntry(e,``,t);return t}async processEntry(e,t,n){if(e.isFile){let r=await this.entryToFile(e);r&&r.type.startsWith(`image/`)&&n.push({file:r,path:t})}else if(e.isDirectory){let r=e.createReader(),i=await this.readAllEntries(r),a=t?`${t}/${e.name}`:e.name;for(let e of i)await this.processEntry(e,a,n)}}readAllEntries(e){return new Promise((t,n)=>{let r=[],i=()=>{e.readEntries(e=>{e.length===0?t(r):(r.push(...e),i())},n)};i()})}entryToFile(e){return new Promise((t,n)=>{e.file(t,n)})}async stageFilesWithPaths(e){if(!this.apiConnected){alert(`API not connected. Run: python tools/media-manager/media-manager-server.py`);return}let t=new FormData,r={};for(let{file:n,path:i}of e)t.append(`files`,n),r[n.name]=i;t.append(`paths`,JSON.stringify(r));try{let e=await fetch(`${n}/stage`,{method:`POST`,body:t});if(e.ok){let t=await e.json();this.updateLabel(`apiStatus`,`Staged ${t.count} files`),await this.loadStagedFiles()}}catch(e){this.updateLabel(`apiStatus`,`Staging failed`),console.error(`Failed to stage files:`,e)}}renderGrid(){if(!this.previewArea)return;let e=this.previewArea.querySelector(`.drop-overlay`);if(this.previewArea.innerHTML=``,e&&this.previewArea.appendChild(e),this.stagedFiles.length===0){this.renderEmptyState();return}let t=document.createElement(`div`);t.className=`media-grid`,t.style.cssText=`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 4px;
            padding: 8px;
            overflow-y: auto;
            height: 100%;
        `,this.stagedFiles.forEach((e,n)=>{let r=this.createTile(e,n);t.appendChild(r)}),this.previewArea.appendChild(t)}createTile(e,t){let r=this.selectedIds.has(e.id),i=document.createElement(`div`);i.className=`media-tile ${r?`selected`:``}`,i.dataset.id=e.id,i.style.cssText=`
            aspect-ratio: 1;
            background: #111;
            border: ${r?`2px solid var(--vga-cyan)`:`1px solid var(--c-border)`};
            overflow: hidden;
            cursor: pointer;
            position: relative;
        `;let a=document.createElement(`img`);a.src=`${n}/staged/${e.id}/thumb`,a.alt=e.metadata?.alt||e.id,a.loading=`lazy`,a.style.cssText=`width:100%;height:100%;object-fit:cover;`,i.appendChild(a);let o=document.createElement(`div`);o.style.cssText=`
            position: absolute;
            top: 2px;
            right: 2px;
            padding: 1px 4px;
            font-size: 9px;
            font-family: var(--font-mono);
            background: ${e.status===`uploaded`?`var(--vga-green)`:e.status===`processed`?`var(--vga-cyan)`:`var(--vga-gray)`};
            color: var(--c-bg);
        `,o.textContent=e.status?.toUpperCase()||`STAGED`,i.appendChild(o);let s=document.createElement(`div`);return s.style.cssText=`
            position: absolute;
            bottom: 0;
            left: 0;
            padding: 1px 4px;
            font-size: 9px;
            background: var(--c-text);
            color: var(--c-bg);
        `,s.textContent=t+1,i.appendChild(s),i.addEventListener(`click`,t=>this.handleTileClick(e.id,t)),i}handleTileClick(e,t){if(t.ctrlKey||t.metaKey)this.selectedIds.has(e)?this.selectedIds.delete(e):this.selectedIds.add(e);else if(t.shiftKey&&this.selectedIds.size>0){let t=this.stagedFiles.map(e=>e.id),n=[...this.selectedIds].pop(),r=t.indexOf(n),i=t.indexOf(e),[a,o]=r<i?[r,i]:[i,r];for(let e=a;e<=o;e++)this.selectedIds.add(t[e])}else this.selectedIds.clear(),this.selectedIds.add(e);this.updateSelectionUI()}updateSelectionUI(){this.previewArea.querySelectorAll(`.media-tile`).forEach(e=>{let t=this.selectedIds.has(e.dataset.id);e.style.border=t?`2px solid var(--vga-cyan)`:`1px solid var(--c-border)`,e.className=`media-tile ${t?`selected`:``}`});let e=this.selectedIds.size;this.updateLabel(`selectionInfo`,e===0?`No images selected`:`${e} image${e>1?`s`:``} selected`)}renderEmptyState(){let e=document.createElement(`div`);e.className=`empty-drop-zone`,e.style.cssText=`
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
        `,e.innerHTML=`
            <div style="font-size: calc(var(--f) * 4); margin-bottom: calc(var(--f) * 1.5); opacity: 0.6;">+</div>
            <div style="font-size: calc(var(--f) * 1.3); margin-bottom: calc(var(--f) * 0.75); color: var(--c-text);">DRAG FILES OR FOLDERS HERE</div>
            <div style="font-size: calc(var(--f) * 0.9); color: var(--vga-gray); margin-bottom: calc(var(--f) * 0.5);">JPG, PNG, WebP, GIF supported</div>
            <div style="font-size: calc(var(--f) * 0.85); color: var(--vga-gray);">Folders are scanned recursively</div>
            <div style="margin-top: calc(var(--f) * 2); padding: calc(var(--f) * 0.5) calc(var(--f)); border: 1px solid var(--c-border); font-size: calc(var(--f) * 0.85);">
                or click to browse
            </div>
        `,e.addEventListener(`click`,()=>this.openFilePicker()),this.previewArea.appendChild(e)}openFilePicker(){let e=document.createElement(`input`);e.type=`file`,e.multiple=!0,e.accept=`image/*`,e.webkitdirectory=!1,e.addEventListener(`change`,async e=>{let t=[...e.target.files].filter(e=>e.type.startsWith(`image/`));t.length>0&&await this.stageFiles(t)}),e.click()}renderAboutContent(t=`overview`){if(!this.previewArea)return;this.currentDocSection=t,this.previewArea.innerHTML=``;let n=o[t]||o.overview,r=e.MarkdownBody;if(r){let e=new r({markdownText:n,className:`markdown-body`},this.deps),t=e.render();t.style.cssText=`
                padding: calc(var(--f) * 2);
                overflow-y: auto;
                height: 100%;
            `,this.previewArea.appendChild(t),this.docComponents||(this.docComponents=[]),this.docComponents.push(e)}else{let e=document.createElement(`div`);e.className=`about-wiki`,e.style.cssText=`
                padding: calc(var(--f) * 2);
                overflow-y: auto;
                height: 100%;
                font-size: calc(var(--f) * 0.9);
                line-height: 1.6;
            `,e.innerHTML=`<pre>${n}</pre>`,this.previewArea.appendChild(e)}}async loadGalleries(){if(!(!this.apiConnected&&(await this.checkApiConnection(),!this.apiConnected)))try{this.galleries=(await(await fetch(`${n}/galleries`)).json()).galleries||[];let e=this.getInputValue(`browseType`)||`photos`,t=[{label:`Select gallery...`,value:``},...this.galleries.filter(t=>t.type===e).map(e=>({label:e.id.toUpperCase(),value:e.id}))],r=this.tool.components.get(`browseGallery`);r?.setOptions&&r.setOptions(t)}catch(e){console.error(`Failed to load galleries:`,e)}}async loadSelectedGallery(){let e=this.librarySelectedPath;if(!e){this.updateLabel(`galleryInfo`,`⚠️ Select a gallery first`);return}this.updateLabel(`galleryInfo`,`Loading ${e}...`);try{let t=await fetch(`${n}/gallery-by-path/${encodeURIComponent(e)}`);if(!t.ok){this.updateLabel(`galleryInfo`,`❌ Gallery not found`);return}let r=await t.json();this.currentGallery=r;let i=new Set;this.libraryImages=(r.images||[]).filter(e=>{let t=e.id||e.filename;return i.has(t)?!1:(i.add(t),!0)});let a=e.split(`/`).pop();this.updateLabel(`galleryInfo`,`✅ ${a.toUpperCase()} (${this.libraryImages.length} images)`),this.setTextareaValue(`galleryDetails`,`Path: ${e}\nBase: ${r.base_url}\nGenerated: ${r.generated_at||`N/A`}`),this.renderLibraryGrid()}catch(e){this.updateLabel(`galleryInfo`,`❌ Failed to load`),console.error(`Failed to load gallery:`,e)}}renderLibraryGrid(){if(!this.previewArea||!this.currentGallery)return;this.previewArea.innerHTML=``;let e=document.createElement(`div`);e.className=`library-grid`,e.style.cssText=`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 4px;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            padding: 4px;
            box-sizing: border-box;
            align-content: start;
        `,this.selectedLibraryIndices=new Set,this.libraryImages.forEach((t,n)=>{let r=t.urls?.thumb||`${this.currentGallery.base_url}/thumbs/${t.filename}`,i=document.createElement(`div`);i.dataset.index=n,i.style.cssText=`
                width: 100%;
                padding-bottom: 100%;
                position: relative;
                background: #111;
                border: 1px solid var(--c-border);
                box-sizing: border-box;
                cursor: pointer;
            `;let a=document.createElement(`img`);a.src=r,a.alt=t.alt||t.id||`Image ${n+1}`,a.loading=`lazy`,a.style.cssText=`
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            `,a.onerror=()=>{a.style.display=`none`},i.appendChild(a),i.addEventListener(`click`,t=>{t.ctrlKey||t.metaKey?this.selectedLibraryIndices.has(n)?(this.selectedLibraryIndices.delete(n),i.style.outline=`none`):(this.selectedLibraryIndices.add(n),i.style.outline=`2px solid var(--c-accent)`):(e.querySelectorAll(`[data-index]`).forEach(e=>{e.style.outline=`none`}),this.selectedLibraryIndices.clear(),this.selectedLibraryIndices.add(n),i.style.outline=`2px solid var(--c-accent)`),this.updateLibrarySelectionInfo()}),e.appendChild(i)}),this.previewArea.appendChild(e),this.libraryGrid=e}updateLibrarySelectionInfo(){let e=this.selectedLibraryIndices.size;if(e===0)this.updateLabel(`librarySelection`,`0 selected (click to select, Ctrl+click for multi)`),this.setInputValue(`libAltText`,``),this.setInputValue(`libCaption`,``),this.setInputValue(`libTags`,``);else if(e===1){let e=[...this.selectedLibraryIndices][0],t=this.libraryImages[e];this.updateLabel(`librarySelection`,`1 selected: ${t.filename||t.id}`),this.setInputValue(`libAltText`,t.alt||``),this.setInputValue(`libCaption`,t.caption||``),this.setInputValue(`libTags`,(t.tags||[]).join(`, `))}else this.updateLabel(`librarySelection`,`${e} selected`),this.setInputValue(`libAltText`,``),this.setInputValue(`libCaption`,``),this.setInputValue(`libTags`,``)}viewFullSize(){if(!this.selectedLibraryIndices||this.selectedLibraryIndices.size===0)return;let e=[...this.selectedLibraryIndices][0],t=this.libraryImages[e];if(t&&this.currentGallery){let e=t.urls?.web||`${this.currentGallery.base_url}/web/${t.filename}`;window.open(e,`_blank`)}}copySelectedUrl(){if(!this.selectedLibraryIndices||this.selectedLibraryIndices.size===0)return;let e=[...this.selectedLibraryIndices][0],t=this.libraryImages[e];if(t&&this.currentGallery){let e=t.urls?.web||`${this.currentGallery.base_url}/web/${t.filename}`;navigator.clipboard.writeText(e).catch(console.error)}}updateLabel(e,t){let n=this.tool?.components.get(e);n?.element&&(n.element.textContent=t)}setTextareaValue(e,t){let n=this.tool?.components.get(e);n?.element&&(n.element.value=t)}getInputValue(e){let t=this.tool?.components.get(e);return t?.getValue?t.getValue():t?.element?.value}setInputValue(e,t){let n=this.tool?.components.get(e);n?.setValue?n.setValue(t):n?.element&&(n.element.value=t)}destroy(){this.tool&&(this.tool.destroy(),this.tool=null),this.element?.parentNode&&this.element.parentNode.removeChild(this.element)}};typeof window<`u`&&(window.MediaManagerTool=s);export{s as default};