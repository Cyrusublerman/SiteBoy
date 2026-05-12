/**
 * Art Section - SiteBoy Framework
 *
 * Six top-level categories mirroring reference/images to upload folder structure:
 *   physical    → paintings/drawings on physical media (large/medium/small/primaries/collages)
 *   objects     → decorated physical objects (each subfolder = scrollable series)
 *   digital     → digital artworks (ai/bear-and-girl/chopped/experiments/…)
 *   render      → 3D render series (each subfolder = scrollable series)
 *   book        → sketchbooks/notebooks (sequential pages, masonry display)
 *   photography → film photography (life1/life2/morocco/nature/rom/snow/urban)
 *
 * @version 4.0.0
 * @dependencies ['ComponentLibrary', 'R2Helper']
 */

import R2Helper from '../shared/r2-url-helper.js';
import { GalleryLightbox, MasonryGallery, ImageGrid, ArtworkPage } from '../shared/masonry-gallery.js';

const R2_BASE = 'https://media.einoder.net';

const ArtSection = {
    version: '4.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,

    // ── Route registry ──────────────────────────────────────────────────────
    pages: [
        '#art',
        // Physical
        '#art/physical',
        '#art/physical/large',
        '#art/physical/medium',
        '#art/physical/primaries',
        '#art/physical/small',
        '#art/physical/small/400xf',
        '#art/physical/small/casual',
        '#art/physical/small/plastic',
        // Objects
        '#art/objects',
        '#art/objects/guitar1',
        '#art/objects/guitar-small',
        '#art/objects/plates',
        // Digital
        '#art/digital',
        '#art/digital/posters',
        '#art/digital/women-and-horses',
        '#art/digital/bear-and-girl',
        '#art/digital/portraits',
        '#art/digital/must',
        '#art/digital/simple1',
        '#art/digital/experiments',
        '#art/digital/low-effort',
        '#art/digital/chopped',
        '#art/digital/monsters',
        '#art/digital/rough',
        '#art/digital/pieces',
        '#art/digital/uncertain',
        // Render
        '#art/render',
        '#art/render/eternal-ascent',
        '#art/render/lady-on-field',
        '#art/render/objects',
        '#art/render/stool',
        '#art/render/toilet',
        // Photography
        '#art/photography',
        '#art/photography/life1',
        '#art/photography/life2',
        '#art/photography/morocco',
        '#art/photography/nature',
        '#art/photography/rom',
        '#art/photography/snow',
        '#art/photography/urban',
        '#art/photography/all',
        // Book
        '#art/book',
        '#art/book/notebook-1',
    ],

    // ── Gallery structure (mirrors reference/images to upload) ───────────────
    galleryStructure: {
        physical: {
            title: 'PHYSICAL',
            description: 'Painted and drawn works on physical media',
            subsections: [
                { id: 'large',    title: 'LARGE',    count: 35 },
                { id: 'medium',   title: 'MEDIUM',   count: 16 },
                {
                    id: 'small', title: 'SMALL', count: 49,
                    subsections: [
                        { id: '400xf',   title: '400XF',   count: 13 },
                        { id: 'casual',  title: 'CASUAL',  count: 6  },
                        { id: 'plastic', title: 'PLASTIC', count: 15 },
                    ],
                },
                { id: 'primaries', title: 'PRIMARIES', count: 7 },
            ],
        },
        objects: {
            title: 'OBJECTS',
            description: 'Decorated and painted physical objects',
            subsections: [
                { id: 'guitar1',      title: 'GUITAR',       count: 1  },
                { id: 'guitar-small', title: 'GUITAR SMALL', count: 0  },
                { id: 'plates',       title: 'PLATES',       count: 3  },
            ],
        },
        digital: {
            title: 'DIGITAL',
            description: 'Digital artworks and compositions',
            subsections: [
                { id: 'posters',          title: 'POSTERS',          count: 7  },
                { id: 'women-and-horses', title: 'WOMEN AND HORSES', count: 8  },
                { id: 'bear-and-girl',    title: 'BEAR AND GIRL',    count: 7  },
                { id: 'portraits',        title: 'PORTRAITS',        count: 13 },
                { id: 'must',             title: 'MUST',             count: 4  },
                { id: 'simple1',          title: 'SIMPLE',           count: 4  },
                { id: 'experiments',      title: 'EXPERIMENTS',      count: 53 },
                { id: 'low-effort',       title: 'LOW EFFORT',       count: 4  },
                { id: 'chopped',          title: 'CHOPPED',          count: 2  },
                { id: 'monsters',         title: 'MONSTERS',         count: 9  },
                { id: 'rough',            title: 'ROUGH',            count: 3  },
                { id: 'pieces',           title: 'PIECES',           count: 2  },
                { id: 'uncertain',        title: 'UNCERTAIN',        count: 2  },
            ],
        },
        render: {
            title: 'RENDER',
            description: '3D rendered works and digital sculptures',
            subsections: [
                { id: 'eternal-ascent', title: 'ETERNAL ASCENT', count: 0  },
                { id: 'lady-on-field',  title: 'LADY ON FIELD',  count: 6  },
                { id: 'objects',        title: 'OBJECTS',        count: 8  },
                { id: 'stool',          title: 'STOOL',          count: 12 },
                { id: 'toilet',         title: 'TOILET',         count: 1  },
            ],
        },
        book: {
            title: 'BOOK',
            description: 'Sketchbook pages and notebook works',
            subsections: [
                { id: 'notebook-1', title: 'NOTEBOOK 1', count: 126 },
            ],
        },
        photography: {
            title: 'PHOTOGRAPHY',
            description: 'Film photography collections across different themes and locations',
            subsections: [
                { id: 'life1',   title: 'LIFE 1',  count: 11 },
                { id: 'life2',   title: 'LIFE 2',  count: 19 },
                { id: 'morocco', title: 'MOROCCO', count: 52 },
                { id: 'nature',  title: 'NATURE',  count: 4  },
                { id: 'rom',     title: 'ROM',     count: 15 },
                { id: 'snow',    title: 'SNOW',    count: 22 },
                { id: 'urban',   title: 'URBAN',   count: 5  },
            ],
            artworks: [{ id: 'all', title: 'ALL PHOTOS', count: 128 }],
        },
    },

    // ── Route handler ────────────────────────────────────────────────────────
    async handleRoute(subsection, container, callbacks) {
        callbacks = callbacks || {};
        console.log(`Art Section v${this.version} route: ${subsection || 'index'}`);
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        window.NavigationController.setupNavigation('art', subsection, this.pages, this.navigationCallbacks);

        if (!subsection) {
            await this.renderArtIndex();

        // ── "View all" combined galleries ──
        } else if (subsection === 'physical/all') {
            await this.renderAllForSection('physical');
        } else if (subsection === 'objects/all') {
            await this.renderAllForSection('objects');
        } else if (subsection === 'digital/all') {
            await this.renderAllForSection('digital');
        } else if (subsection === 'render/all') {
            await this.renderAllForSection('render');
        } else if (subsection === 'physical/small/all') {
            await this.renderAllForSection('physical', 'small');

        // ── Artwork page (imageId within a gallery — deepest level) ──
        } else if (this._isArtworkRoute(subsection)) {
            await this.renderArtworkPage(subsection);

        // ── Physical ──
        } else if (subsection === 'physical') {
            await this.renderSectionIndex('physical');
        } else if (subsection === 'physical/small') {
            await this.renderSmallIndex();
        } else if (subsection.startsWith('physical/small/')) {
            const sub = subsection.replace('physical/small/', '');
            await this.renderMasonryGallery('physical', `small/${sub}`, this._galleryTitle('physical/small', sub));
        } else if (subsection.startsWith('physical/')) {
            const sub = subsection.replace('physical/', '');
            await this.renderMasonryGallery('physical', sub, this._galleryTitle('physical', sub));

        // ── Objects ──
        } else if (subsection === 'objects') {
            await this.renderSectionIndex('objects');
        } else if (subsection.startsWith('objects/')) {
            const name = subsection.replace('objects/', '');
            await this.renderScrollGallery('objects', name, this._galleryTitle('objects', name));

        // ── Digital ──
        } else if (subsection === 'digital') {
            await this.renderSectionIndex('digital');
        } else if (subsection.startsWith('digital/')) {
            const cat = subsection.replace('digital/', '');
            await this.renderMasonryGallery('digital', cat, this._galleryTitle('digital', cat));

        // ── Render ──
        } else if (subsection === 'render') {
            await this.renderSectionIndex('render');
        } else if (subsection.startsWith('render/')) {
            const series = subsection.replace('render/', '');
            await this.renderScrollGallery('render', series, this._galleryTitle('render', series));

        // ── Book ──
        } else if (subsection === 'book') {
            await this.renderSectionIndex('book');
        } else if (subsection.startsWith('book/')) {
            const name = subsection.replace('book/', '');
            await this.renderMasonryGallery('book', name, this._galleryTitle('book', name));

        // ── Photography ──
        } else if (subsection === 'photography') {
            this.renderPhotographyIndex();
        } else if (subsection.startsWith('photography/')) {
            const photoSection = subsection.replace('photography/', '');
            this.renderPhotographyGallery(photoSection);

        } else {
            this.renderArtGallery(subsection);
        }
    },

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Resolve a human title from the galleryStructure for a sub-path. */
    _galleryTitle(sectionKey, subId) {
        const section = this.galleryStructure[sectionKey];
        if (!section) return subId.toUpperCase();
        const found = (section.subsections || []).find(s => s.id === subId);
        return found ? found.title : subId.toUpperCase();
    },

    /**
     * Returns true if subsection is a per-artwork path (imageId as final segment).
     * physical/small/{sub}/{imageId} → 4 segments (physical/small/* are galleries at depth 3)
     * {cat}/{gallery}/{imageId}      → 3 segments for all other categories
     * photography/* never has artwork pages (photos go straight to lightbox).
     */
    _isArtworkRoute(subsection) {
        if (!subsection) return false;
        const parts = subsection.split('/');
        if (parts[0] === 'photography') return false;
        // physical/small/{sub} is itself a gallery (3 segs); depth-4 is artwork
        if (parts[0] === 'physical' && parts[1] === 'small') return parts.length === 4;
        return parts.length >= 3;
    },

    /**
     * Render a per-artwork page or fall back to the gallery masonry + lightbox.
     * Parses the final path segment as imageId; everything before it is the gallery path.
     */
    async renderArtworkPage(subsection) {
        const parts       = subsection.split('/');
        const imageId     = parts[parts.length - 1];
        const galleryType = parts[0];
        const galleryName = parts.slice(1, -1).join('/');
        const galleryTitle = this._galleryTitle(galleryType, parts[parts.length - 2]);

        let manifest, allImages;
        try {
            manifest  = await R2Helper.fetchManifest(galleryType, galleryName);
            allImages = await this._manifestImages(galleryType, galleryName, galleryTitle);
        } catch {
            this.navigationCallbacks?.navigateToSection?.('art', `${galleryType}/${galleryName}`);
            return;
        }

        const rawImage     = (manifest.images || []).find(img => img.id === imageId);
        const resolvedIdx  = allImages.findIndex(img => img.title === imageId);
        const resolvedImg  = allImages[resolvedIdx];

        if (!rawImage || !resolvedImg) {
            this.navigationCallbacks?.navigateToSection?.('art', `${galleryType}/${galleryName}`);
            return;
        }

        if (!rawImage.page?.length) {
            // No page content — render the gallery masonry and open lightbox immediately
            await this._renderImageGallery(galleryType, galleryName, galleryTitle);
            const lb = new GalleryLightbox(
                { images: allImages, index: Math.max(0, resolvedIdx) },
                { MF: window.MathematicalFoundation }
            );
            this.componentInstances.push(lb);
            lb.open();
            return;
        }

        // Resolve page blocks: image ids → URLs from the manifest
        const rawById  = Object.fromEntries((manifest.images || []).map(img => [img.id, img]));
        const resById  = Object.fromEntries(allImages.map(img => [img.title, img]));
        const blocks   = rawImage.page.map(block => {
            if (block.type === 'image') {
                const res = resById[block.id] || resolvedImg;
                return { type: 'image', src: res.src || '', zoom: res.zoom || '', thumb: res.thumb || '', title: block.id };
            }
            if (block.type === 'md') return { type: 'md', text: block.text };
            return block; // unknown types passed through for forward compat
        });

        this.currentContainer.innerHTML = '';
        this.currentContainer.style.padding = '0';

        const page = new ArtworkPage({ blocks, title: imageId }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(page);
        this.currentContainer.appendChild(page.render());
        page.mount();

        this._setupSubheaderArtwork(galleryType, galleryName, imageId, allImages);
    },

    _setupSubheaderArtwork(galleryType, galleryName, imageId, allImages) {
        if (!window.Subheader) return;
        const sh           = window.Subheader;
        const galleryLabel = this._galleryTitle(galleryType, galleryName.split('/').pop());

        sh.updateTitle(imageId);

        const dropItems = [
            { label: `← BACK TO ${galleryLabel}`, path: `#art/${galleryType}/${galleryName}`, isCurrent: false },
            ...allImages.map(img => ({
                label:     img.title || img.id,
                path:      `#art/${galleryType}/${galleryName}/${img.title}`,
                isCurrent: img.title === imageId,
            })),
        ];
        sh.setDropdownContent(dropItems, item => {
            if (item.path) this.navigateToPage(item.path);
        });

        const navItems = allImages.map(img => ({
            id:    img.title,
            path:  `#art/${galleryType}/${galleryName}/${img.title}`,
            title: img.title,
            isTOC: false,
        }));
        sh.updateNavigation({
            section:    'art',
            subsection: `${galleryName}/${imageId}`,
            items:      navItems,
            navigate:   (sec, sub) => this.navigationCallbacks?.navigateToSection?.(sec, sub),
        });

        sh.show();
        window.SiteBoyApp?.setSubheaderState?.(true);
    },

    /** Fetch manifest images and map to { thumb, src, zoom, title, caption }. */
    /**
     * Fetch manifest and return an array of project groups.
     * If manifest has a `groups` array each entry becomes one project (card + viewer slot).
     * Otherwise all images are one implicit group.
     * Group schema: { id, title?, images: [imgId,...], text? }
     * Returns: [{ id, title, images: [{thumb,src,zoom,title}], text }]
     */
    async _manifestGroups(galleryType, galleryName, labelPrefix) {
        const manifest = await R2Helper.fetchManifest(galleryType, galleryName);
        const allImages = manifest.images || [];

        // Deduplicate by id
        const seen = new Set();
        const deduped = allImages.filter(img => !seen.has(img.id) && seen.add(img.id));

        const toImg = (img, size = 'full') => {
            const s = size === 'half' || size === 'double' ? size : 'full';
            return {
                thumb:   img.urls?.thumb,
                src:     img.urls?.web,
                zoom:    img.urls?.zoom,
                title:   img.id,
                size:    s,
                hasPage: Array.isArray(img.page) && img.page.length > 0,
            };
        };

        const resolveCover = (cover, byId, fallbackThumb) => {
            if (cover == null || cover === '') return fallbackThumb;
            const key = String(cover);
            const base = key.replace(/\.(jpe?g|png|webp)$/i, '');
            const row  = byId[key] || byId[base];
            return row?.urls?.thumb ?? fallbackThumb;
        };

        if (manifest.groups?.length) {
            const byId = Object.fromEntries(deduped.map(img => [img.id, img]));
            return manifest.groups.map(g => {
                const resolvedImages = (g.images || []).map((entry) => {
                    const id = typeof entry === 'string' ? entry : entry?.id;
                    if (!id) return null;
                    const raw = byId[id];
                    if (!raw) return null;
                    let size = typeof entry === 'object' && entry?.size ? String(entry.size) : 'full';
                    if (size !== 'half' && size !== 'double') size = 'full';
                    return toImg(raw, size);
                }).filter(Boolean);

                const firstThumb = resolvedImages[0]?.thumb ?? null;
                const thumb = resolveCover(g.cover, byId, firstThumb);

                return {
                    id:     g.id || g.title || String(Math.random()),
                    title:  g.title || labelPrefix,
                    images: resolvedImages,
                    text:   g.text || null,
                    thumb,
                };
            });
        }

        // No groups — single implicit default group (legacy flat manifest)
        return [{
            id:     'default',
            title:  labelPrefix,
            images: deduped.map(img => toImg(img, 'full')),
            text:   null,
            thumb:  deduped[deduped.length - 1]?.urls?.thumb || null,
        }];
    },

    // Legacy flat image array (used by renderAllForSection)
    async _manifestImages(galleryType, galleryName, labelPrefix) {
        const groups = await this._manifestGroups(galleryType, galleryName, labelPrefix);
        return groups.flatMap(g => g.images);
    },

    // ── Art index (card grid of all categories) ───────────────────────────────
    async renderArtIndex() {
        if (window.Subheader) window.Subheader.hide();
        if (window.SiteBoyApp?.setSubheaderState) window.SiteBoyApp.setSubheaderState(false);

        this.currentContainer.innerHTML = '';
        this.currentContainer.style.padding = '0';
        const F = window.MathematicalFoundation?.F || 14;

        // Build card items — one per category
        const items = await Promise.all(
            Object.entries(this.galleryStructure).map(async ([key, gallery]) => {
                const r2Type = key === 'photography' ? 'photos' : key;
                const firstSub = (gallery.subsections || [])[0];
                let image = null;
                if (firstSub) image = await this._resolvePreviewImage(r2Type, firstSub.id, firstSub);
                const total = (gallery.subsections || []).reduce((s, sub) => s + (sub.count || 0), 0);
                return {
                    image,
                    label: gallery.title,
                    count: total || null,
                    onClick: () => this.navigateToGallery(key),
                };
            })
        );

        const wrap = this._makeWrap(F);
        const grid = new ImageGrid({ items }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(grid);
        wrap.appendChild(grid.render());
        this.currentContainer.appendChild(wrap);
    },

    async getGalleryPreviewItems(galleryKey, gallery) {
        const r2Type = galleryKey === 'photography' ? 'photos' : galleryKey;
        const subsections = gallery.subsections || [];
        const items = [];
        for (const sub of subsections) {
            if (items.length >= 4) break;
            const image = await this._resolvePreviewImage(r2Type, sub.id, sub);
            if (image) items.push({ id: sub.id, title: sub.title, image });
        }
        return items;
    },

    /**
     * Recursively resolve the most-recently-added thumbnail for a subsection.
     * If the subsection has nested subsections (is a folder), walks into each
     * child until a manifest with images is found.
     * @param {string} r2Type  - R2 gallery type ('physical'|'objects'|etc.)
     * @param {string} path    - Accumulated path segment (e.g. 'small/400xf')
     * @param {Object} sub     - Subsection descriptor from galleryStructure
     * @returns {Promise<string|null>} Thumb URL or null
     */
    async _resolvePreviewImage(r2Type, path, sub) {
        if (sub.subsections?.length) {
            for (const child of sub.subsections) {
                const img = await this._resolvePreviewImage(r2Type, `${path}/${child.id}`, child);
                if (img) return img;
            }
            return null;
        }
        try {
            const manifest = await R2Helper.fetchManifest(r2Type, path);
            const images = manifest.images;
            if (!images?.length) return null;
            // Last entry = most recently added
            const last = images[images.length - 1];
            return last.urls?.thumb ?? null;
        } catch {
            return null;
        }
    },

    navigateToGallery(galleryKey) {
        this.navigationCallbacks?.navigateToSection?.('art', galleryKey);
    },

    // ── Generic section index (card grid for one top-level category) ──────────
    /**
     * @param {string} sectionKey  - key in galleryStructure (or a slash-path for nested)
     * @param {Object} [opts]
     * @param {Object} [opts.gallery]      - override gallery object (for nested sections)
     * @param {string} [opts.r2Type]       - R2 gallery type override
     * @param {string} [opts.basePath]     - R2 path prefix (e.g. 'physical/small')
     * @param {string} [opts.parentNavKey] - navigation key for URL building
     */
    async renderSectionIndex(sectionKey, opts = {}) {
        const gallery  = opts.gallery      || this.galleryStructure[sectionKey];
        if (!gallery) return;
        const r2Type   = opts.r2Type       || (sectionKey.split('/')[0] === 'photography' ? 'photos' : sectionKey.split('/')[0]);
        const basePath = opts.basePath     ?? '';
        const navKey   = opts.parentNavKey || sectionKey;
        const F        = window.MathematicalFoundation?.F || 14;

        this.currentContainer.innerHTML = '';
        this.currentContainer.style.padding = '0';

        const subsections = gallery.subsections || [];

        const items = await Promise.all(subsections.map(async (sub) => {
            const subPath = basePath ? `${basePath}/${sub.id}` : sub.id;
            let image = null;
            try { image = await this._resolvePreviewImage(r2Type, subPath, sub); } catch { /* no image */ }
            return {
                image,
                label: sub.title,
                count: sub.count || null,
                onClick: (_item, _idx, cardEl) => {
                    this.navigationCallbacks?.navigateToSection?.('art', `${navKey}/${sub.id}`);
                },
            };
        }));

        const wrap = this._makeWrap(F);
        const grid = new ImageGrid({ items }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(grid);
        wrap.appendChild(grid.render());
        this.currentContainer.appendChild(wrap);

        this._setupSubheader(gallery.title, navKey, subsections);
    },

    _appendViewAllButton(navKey, gallery, subsections) {
        const F = window.MathematicalFoundation?.F || 14;
        const total = subsections.reduce((sum, s) => sum + (s.count || 0), 0);
        const label = `VIEW ALL ${gallery.title}${total ? ` (${total})` : ''}`;

        const wrap = document.createElement('div');
        wrap.style.cssText = `height:${F * 6}px;display:flex;align-items:stretch;border:1px solid var(--c-border);margin:0 ${F}px ${F}px;`;
        const btn = new ComponentLibrary.Button({
            text: label,
            onClick: () => this.navigationCallbacks?.navigateToSection?.('art', `${navKey}/all`),
        }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(btn);
        const btnEl = btn.render();
        btnEl.style.cssText += 'width:100%;height:100%;margin:0;border:none;border-radius:0;';
        wrap.appendChild(btnEl);
        this.currentContainer.appendChild(wrap);
    },

    /**
     * Get up to 4 preview images for a subsection.
     * Folder: 1 image from each child. Leaf: spread 4 images across the manifest.
     */
    async _subsectionPreviewImages(r2Type, path, sub) {
        if (sub.subsections?.length) {
            const items = [];
            for (const child of sub.subsections) {
                if (items.length >= 4) break;
                const image = await this._resolvePreviewImage(r2Type, `${path}/${child.id}`, child);
                if (image) items.push({ id: child.id, title: child.title, image });
            }
            return items;
        }
        try {
            const manifest = await R2Helper.fetchManifest(r2Type, path);
            const images = manifest.images || [];
            return this._spreadPick(images, 4).map(img => ({
                id: img.id, title: img.id, image: img.urls?.thumb ?? null,
            }));
        } catch {
            return [];
        }
    },

    /** Pick n items evenly spread across arr (biased toward end = most recent). */
    _spreadPick(arr, n) {
        if (!arr.length) return [];
        if (arr.length <= n) return [...arr];
        if (n === 1) return [arr[arr.length - 1]];
        const result = [];
        for (let i = 0; i < n; i++) {
            const idx = arr.length - 1 - Math.round(i * (arr.length - 1) / (n - 1));
            result.push(arr[Math.max(0, idx)]);
        }
        return result;
    },

    // ── Small subsection index (physical/small has its own sub-subsections) ──
    async renderSmallIndex() {
        const smallSection = this.galleryStructure.physical.subsections.find(s => s.id === 'small');
        if (!smallSection) return;
        await this.renderSectionIndex('physical/small', {
            gallery:      { ...smallSection, title: 'SMALL', description: 'Small format works' },
            r2Type:       'physical',
            basePath:     'small',
            parentNavKey: 'physical/small',
        });
    },

    // ── Combined "view all" gallery for a section ─────────────────────────────
    /**
     * @param {string} sectionKey  - key in galleryStructure ('physical'|'objects'|etc.)
     * @param {string} [relBase]   - path relative to r2Type (e.g. 'small' for physical/small/all)
     */
    async renderAllForSection(sectionKey, relBase) {
        this.currentContainer.innerHTML = '';
        this.currentContainer.style.padding = '0';
        const r2Type = sectionKey === 'photography' ? 'photos' : sectionKey;

        // Resolve gallery + subsections (supports nested, e.g. physical/small)
        let gallery = this.galleryStructure[sectionKey];
        let subsections = gallery?.subsections || [];
        if (relBase) {
            // Walk into the nested subsection (e.g. relBase='small' → physical.small)
            const parts = relBase.split('/');
            let node = gallery;
            for (const part of parts) {
                node = node?.subsections?.find(s => s.id === part);
            }
            if (node) { gallery = node; subsections = node.subsections || []; }
        }
        if (!gallery) return;

        const allImages = [];
        for (const sub of subsections) {
            try {
                const subPath = relBase ? `${relBase}/${sub.id}` : sub.id;
                const manifest = await R2Helper.fetchManifest(r2Type, subPath);
                (manifest.images || []).forEach(img => allImages.push({
                    thumb:   img.urls?.thumb,
                    src:     img.urls?.web,
                    zoom:    img.urls?.zoom,
                    title:   `${sub.title} — ${img.id}`,
                    caption: sub.title,
                }));
            } catch { /* skip empty subsections */ }
        }

        const galleryComp = new ComponentLibrary.MasonryGallery({
            images: allImages, gap: 0,
            columnsMobile: 1, columnsTablet: 2, columnsDesktop: 3, columnsWide: 4,
            loadBuffer: 200,
        }, { MF: window.MathematicalFoundation, Resize: window.ResizeManager });
        this.componentInstances.push(galleryComp);
        this.currentContainer.appendChild(galleryComp.render());
        this._setupSubheaderGallery(`ALL ${gallery.title}`, sectionKey, sectionKey);
    },

    // ── Image gallery — MasonryGallery of all images (flat) ──────────────────
    async renderMasonryGallery(galleryType, galleryName, title) {
        await this._renderImageGallery(galleryType, galleryName, title);
    },

    async renderScrollGallery(galleryType, galleryName, title) {
        await this._renderImageGallery(galleryType, galleryName, title);
    },

    async _renderImageGallery(galleryType, galleryName, title) {
        this.currentContainer.innerHTML = '';
        this.currentContainer.style.padding = '0';
        const F = window.MathematicalFoundation?.F || 14;

        let allImages = [];
        try {
            allImages = await this._manifestImages(galleryType, galleryName, title);
        } catch {
            console.warn(`No manifest for art/${galleryType}/${galleryName}`);
        }

        if (allImages.length === 0) {
            this.currentContainer.appendChild(this._renderEmptyState(
                'NO IMAGES YET',
                `BACK TO ${galleryType.toUpperCase()}`,
                `#art/${galleryType}`,
            ));
            this._setupSubheaderGallery(title, galleryType, galleryName);
            return;
        }

        const gallery = new MasonryGallery({
            images:         allImages,
            gap:            0,
            columnsMobile:  1,
            columnsTablet:  2,
            columnsDesktop: 3,
            columnsWide:    4,
            loadBuffer:     200,
            onItemClick:    (img, idx) => this._handleArtworkClick(galleryType, galleryName, img, idx, allImages),
        }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(gallery);
        this.currentContainer.appendChild(gallery.render());

        this._setupSubheaderGallery(title, galleryType, galleryName);
    },

    /**
     * Called when a card is clicked in the leaf masonry gallery.
     * Routes to the artwork page if the image declares page content,
     * otherwise opens GalleryLightbox directly (overlay over the masonry).
     */
    _handleArtworkClick(galleryType, galleryName, img, idx, allImages) {
        if (img.hasPage) {
            this.navigationCallbacks?.navigateToSection?.('art', `${galleryType}/${galleryName}/${img.title}`);
        } else {
            const lb = new GalleryLightbox(
                { images: allImages, index: idx },
                { MF: window.MathematicalFoundation }
            );
            this.componentInstances.push(lb);
            lb.open();
        }
    },

    // ── Subheader helpers ────────────────────────────────────────────────────
    _setupSubheader(title, sectionKey, subsections) {
        if (!window.Subheader) return;
        window.Subheader.updateTitle(title);

        // Dropdown: back link + all subsections
        const dropItems = [
            { label: '← BACK TO ART', path: '#art', isCurrent: false },
            ...subsections.map(s => ({
                label: `${s.title}${s.count ? ` (${s.count})` : ''}`,
                path: `#art/${sectionKey}/${s.id}`,
                isCurrent: false,
            })),
        ];
        window.Subheader.setDropdownContent(dropItems, item => {
            if (item.path) this.navigateToPage(item.path);
        });

        // PREV/NEXT: navigate between top-level categories
        const topKeys   = Object.keys(this.galleryStructure);
        const currentTopKey = sectionKey.split('/')[0];
        const topIdx    = topKeys.indexOf(currentTopKey);
        const prevKey   = topKeys[topIdx - 1];
        const nextKey   = topKeys[topIdx + 1];
        const navItems  = topKeys.map(k => ({
            id:    k,
            path:  `#art/${k}`,
            title: this.galleryStructure[k].title,
            isTOC: false,
        }));
        window.Subheader.updateNavigation({
            section:    'art',
            subsection: sectionKey,
            items:      navItems,
            navigate:   (sec, sub) => this.navigationCallbacks?.navigateToSection?.(sec, sub),
        });

        window.Subheader.show();
        window.SiteBoyApp?.setSubheaderState?.(true);
    },

    _setupSubheaderGallery(title, galleryType, galleryName) {
        if (!window.Subheader) return;
        window.Subheader.updateTitle(title);

        const section  = this.galleryStructure[galleryType];
        const siblings = section?.subsections || [];

        // Dropdown: back link + sibling galleries
        const dropItems = [
            { label: `← BACK TO ${galleryType.toUpperCase()}`, path: `#art/${galleryType}`, isCurrent: false },
            ...siblings.map(s => ({
                label: s.title + (s.count ? ` (${s.count})` : ''),
                path: `#art/${galleryType}/${s.id}`,
                isCurrent: s.id === galleryName,
            })),
        ];
        window.Subheader.setDropdownContent(dropItems, item => {
            if (item.path) this.navigateToPage(item.path);
        });

        // PREV/NEXT: navigate between sibling galleries within this section
        const navItems = siblings.map(s => ({
            id:    s.id,
            path:  `#art/${galleryType}/${s.id}`,
            title: s.title,
            isTOC: false,
        }));
        window.Subheader.updateNavigation({
            section:    'art',
            subsection: galleryName,
            items:      navItems,
            navigate:   (sec, sub) => this.navigationCallbacks?.navigateToSection?.(sec, sub),
        });

        window.Subheader.show();
        window.SiteBoyApp?.setSubheaderState?.(true);
    },

    // ── Photography ───────────────────────────────────────────────────────────
    renderPhotographyIndex() {
        this.currentContainer.innerHTML = '';
        this.currentContainer.style.padding = '0';
        const F = window.MathematicalFoundation?.F || 14;
        const photography = this.galleryStructure.photography;

        const items = photography.subsections.map(sub => {
            const sampleImages = this.getPhotographyImages(sub.id);
            const image = sampleImages[0]?.thumb || sampleImages[0]?.src || null;
            return {
                image,
                label: sub.title,
                count: sub.count || null,
                onClick: () => this.navigationCallbacks?.navigateToSection?.('art', `photography/${sub.id}`),
            };
        });

        const wrap = this._makeWrap(F);
        const grid = new ImageGrid({ items }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(grid);
        wrap.appendChild(grid.render());
        this.currentContainer.appendChild(wrap);
    },

    renderPhotographyGallery(photoSection) {
        this.currentContainer.innerHTML = '';
        this.currentContainer.style.padding = '0';
        const F = window.MathematicalFoundation?.F || 14;
        const images = this.getPhotographyImages(photoSection);

        if (images.length === 0) {
            this.currentContainer.appendChild(this._renderEmptyState(
                'NO IMAGES YET',
                'BACK TO PHOTOGRAPHY',
                '#art/photography',
            ));
            this.setupSubheaderForPhotography(photoSection);
            return;
        }

        // Photos go straight to lightbox — no page route for photography
        const gallery = new MasonryGallery({
            images,
            gap:            0,
            columnsMobile:  1,
            columnsTablet:  2,
            columnsDesktop: 3,
            columnsWide:    4,
            loadBuffer:     200,
            onItemClick: (img, idx) => {
                const lb = new GalleryLightbox(
                    { images, index: idx },
                    { MF: window.MathematicalFoundation }
                );
                this.componentInstances.push(lb);
                lb.open();
            },
        }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(gallery);
        this.currentContainer.appendChild(gallery.render());
        this.setupSubheaderForPhotography(photoSection);
    },

    getPhotographyImages(photoSection) {
        const sectionMap = {
            life1: 'life1', life2: 'life2', morocco: 'morocco',
            nature: 'nature', rom: 'rom', snow: 'snow', urban: 'urban',
        };
        const imageLists = {
            Life1: [
                '237040610016','237040610021','237040610022','237040610023','237040610024',
                '237040610025','237040610027','237040610028','237040610029','237040610030','237040610032',
            ],
            Life2: [
                '262556200009','262556200012','262556200013','262556200015','262556200018',
                '262556200031','262556200032','262556200033','262556200035',
                'R1-01040-0000','R1-01040-0001','R1-01040-0002','R1-01040-0004','R1-01040-0005',
                'R1-01040-0006','R1-01040-0007','R1-01040-0008','R1-01040-0009','R1-01040-0010',
            ],
            Morocco: [
                '237040620001','237040620002','237040620003','237040620004','237040620009','237040620011',
                '237040620012','237040620013','237040620015','237040620016','237040620018','237040620019',
                '237040620020','237040620021','237040620024','237040620027','237040620030','237040620032',
                '237040620036','237040630002','237040630003','237040630004','237040630005','237040630006',
                '237040630007','237040630010','237040630011','237040630012','237040630013','237040630014',
                '237040630015','237040630016','237040630017','237040630018','237040630019','237040630020',
                '237040630021','237040630022','237040630023','237040630024','237040630025','237040630027',
                '237040630029','237040630031','237040630034','237040630035','262556210002','262556210003',
                '262556210004','262556210005','262556210006','262556210007',
            ],
            Nature: ['262556200028','262556200029','262556200030','R1-01040-0003'],
            Rom: [
                '237040610034','237040610035','237040610036','262556200001','262556200002','262556200003',
                '262556200004','262556200006','262556210030','262556210031','262556210032','262556210033',
                '262556210034','262556210035','262556210036',
            ],
            Snow: [
                '262556210008','262556210009','262556210010','262556210011','262556210012','262556210013',
                '262556210014','262556210015','262556210016','262556210017','262556210018','262556210019',
                '262556210020','262556210021','262556210022','262556210023','262556210024','262556210025',
                '262556210026','262556210027','262556210028','262556210029',
            ],
            Urban: ['237040610010','237040610011','237040610012','237040610014','237040620001'],
        };

        const toImg = (galleryName, cap, filename) => {
            const urls = R2Helper.getPhotoUrlSet(galleryName, `${filename}.jpg`);
            return { thumb: urls.thumb, src: urls.web, zoom: urls.zoom, title: `${cap} - ${filename}`, caption: `Film photography from ${cap} collection` };
        };

        if (photoSection === 'all') {
            const images = [];
            Object.keys(sectionMap).forEach(key => {
                const cap = key.charAt(0).toUpperCase() + key.slice(1);
                (imageLists[cap] || []).forEach(f => images.push(toImg(sectionMap[key], cap, f)));
            });
            return images;
        }
        const galleryName = sectionMap[photoSection];
        const cap = photoSection.charAt(0).toUpperCase() + photoSection.slice(1);
        return galleryName && imageLists[cap]
            ? imageLists[cap].map(f => toImg(galleryName, cap, f))
            : [];
    },

    setupSubheaderForPhotography(photoSection) {
        if (!window.Subheader) return;
        const titles = {
            life1: 'LIFE 1', life2: 'LIFE 2', morocco: 'MOROCCO',
            nature: 'NATURE', rom: 'ROM', snow: 'SNOW', urban: 'URBAN', all: 'ALL PHOTOS',
        };
        window.Subheader.updateTitle(titles[photoSection] || 'PHOTOGRAPHY');
        const items = [
            { label: '← BACK TO PHOTOGRAPHY', path: '#art/photography', isCurrent: false },
            { label: 'ALL PHOTOS (128)',        path: '#art/photography/all',     isCurrent: photoSection === 'all' },
            { label: 'LIFE 1 (11)',             path: '#art/photography/life1',    isCurrent: photoSection === 'life1' },
            { label: 'LIFE 2 (19)',             path: '#art/photography/life2',    isCurrent: photoSection === 'life2' },
            { label: 'MOROCCO (52)',            path: '#art/photography/morocco',  isCurrent: photoSection === 'morocco' },
            { label: 'NATURE (4)',              path: '#art/photography/nature',   isCurrent: photoSection === 'nature' },
            { label: 'ROM (15)',                path: '#art/photography/rom',      isCurrent: photoSection === 'rom' },
            { label: 'SNOW (22)',               path: '#art/photography/snow',     isCurrent: photoSection === 'snow' },
            { label: 'URBAN (5)',               path: '#art/photography/urban',    isCurrent: photoSection === 'urban' },
        ];
        window.Subheader.setDropdownContent(items, item => { if (item.path) this.navigateToPage(item.path); });
        window.Subheader.show();
        window.SiteBoyApp?.setSubheaderState?.(true);
    },

    // ── Legacy fallback ───────────────────────────────────────────────────────
    renderArtGallery(galleryId) {
        const gallery = this.galleryStructure[galleryId] || {
            title: galleryId.toUpperCase(),
            description: '',
            artworks: [],
        };
        const title = new ComponentLibrary.Heading({ level: 1, content: gallery.title });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
    },

    // ── Utilities ─────────────────────────────────────────────────────────────
    createElement(tag, className = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        return el;
    },

    /**
     * Render an empty-state element per design-law §14.2 (uninitiated state
     * must include an affordance for the next action) and text-treatment §1
     * (UPPERCASE state labels in controls; canonical font stack).
     *
     * @param {string} message    UPPERCASE state label (e.g. 'NO IMAGES YET').
     * @param {string} backLabel  UPPERCASE button label (without the `←` glyph).
     * @param {string} backPath   Hash path the back affordance navigates to.
     * @returns {HTMLElement}
     */
    _renderEmptyState(message, backLabel, backPath) {
        const F = window.MathematicalFoundation?.F || 14;
        const wrap = document.createElement('div');
        wrap.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: ${F}px;
            padding: ${F * 4}px ${F}px;
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            text-transform: uppercase;
            color: var(--c-border);
        `;

        const label = document.createElement('div');
        label.textContent = message;
        wrap.appendChild(label);

        const btn = new ComponentLibrary.Button({
            text:    `← ${backLabel}`,
            onClick: () => this.navigateToPage(backPath),
        }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(btn);
        wrap.appendChild(btn.render());

        return wrap;
    },

    /**
     * Create the standard grid wrapper. Mobile CSS reduces its gap token so
     * the outer tile margin and inter-tile spacing stay equal.
     * Card size is capped so at least one card is always visible:
     *   maxCardDim = min(containerW, containerH) - active gallery gap
     * Re-measures via ResizeObserver on the current container, plus a
     * single-shot rAF for the initial post-paint reading.
     */
    _makeWrap(F) {
        const wrap = document.createElement('div');
        wrap.className = 'art-gallery-wrap';
        wrap.style.cssText = `--gallery-tile-gap:${F * 2}px;padding:var(--gallery-tile-gap);box-sizing:border-box;`;

        const recomputeCardCap = () => {
            const cc = this.currentContainer;
            if (!cc) return;
            const wrapStyle = window.getComputedStyle(wrap);
            const padX = parseFloat(wrapStyle.paddingLeft) + parseFloat(wrapStyle.paddingRight);
            const padY = parseFloat(wrapStyle.paddingTop) + parseFloat(wrapStyle.paddingBottom);
            const gap = parseFloat(wrapStyle.paddingLeft) || F;
            const cw = cc.clientWidth  - padX;
            const ch = cc.clientHeight - padY;
            const maxDim = Math.max(100, Math.min(cw, ch) - gap);
            wrap.querySelectorAll('.image-grid-card-img').forEach(imgWrap => {
                imgWrap.style.maxHeight = `${maxDim}px`;
            });
        };

        const observer = new ResizeObserver(recomputeCardCap);
        observer.observe(this.currentContainer);
        this._wrapObservers = this._wrapObservers || [];
        this._wrapObservers.push(observer);

        // Initial reading after first paint with cards present.
        requestAnimationFrame(recomputeCardCap);

        return wrap;
    },

    getAllArtPages() {
        const pages = [{ label: 'ART TOC', path: '#art', id: 'toc', title: 'ART TOC', isTOC: true }];
        Object.keys(this.galleryStructure).forEach(key => {
            const g = this.galleryStructure[key];
            pages.push({ label: g.title, path: `#art/${key}`, id: key, title: g.title, isTOC: false });
        });
        return pages;
    },

    buildDropdownItems(allPages, currentPath) {
        return allPages.map(p => ({
            label: p.label, value: p.path, path: p.path,
            isCurrent: p.path === currentPath, isTOC: p.isTOC || false,
        }));
    },

    navigateToPage(path) {
        const parts = path.replace('#', '').split('/');
        if (parts.length === 1) {
            this.navigationCallbacks?.navigateToSection?.(parts[0]);
        } else {
            this.navigationCallbacks?.navigateToSection?.(parts[0], parts.slice(1).join('/'));
        }
    },

    cleanup() {
        if (this._wrapObservers) {
            this._wrapObservers.forEach(o => { try { o.disconnect(); } catch (_) { /* no-op */ } });
            this._wrapObservers = [];
        }
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            this.currentContainer.style.padding = '';
            this.currentContainer.className = this.currentContainer.className
                .replace(/toc-container|layout-\w+-\w+/g, '').trim();
            const cc = this.currentContainer.closest('.content-container') ||
                (this.currentContainer.classList?.contains('content-container') ? this.currentContainer : null);
            cc?.classList.remove('tool-viewport');
        }
        ComponentLibrary.destroyTracked(this.componentInstances);
    },

    render(subsection) {
        const container = document.createElement('div');
        this.handleRoute(subsection, container);
        return container;
    },
};

window.ArtSection = ArtSection;
window.debugLog('INIT', `Art Section v${ArtSection.version} ready`);
