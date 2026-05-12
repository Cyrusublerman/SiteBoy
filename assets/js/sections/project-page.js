/**
 * Project Page - SiteBoy Framework
 *
 * Generic JSON-driven renderer for project detail pages within the Projects
 * section. Mirrors the composition of the bespoke Synthetic Biophilia page
 * (Heading -> optional hero Image -> N x CollapsibleSection -> back link),
 * but is driven by a manifest object so each project is pure data.
 *
 * Manifest schema:
 * {
 *   id: string,
 *   title: string,                       // page heading (uppercase)
 *   hero?: { src: string, size?: string },
 *   sections: [
 *     { title: string, type?: 'markdown'|'embed', src: string, open?: boolean }
 *     // type defaults to 'markdown'
 *     // embed: src is a URL (e.g. '/#tools/colour-quantizer'), height optional (px)
 *   ]
 * }
 *
 * Each markdown section's `src` is the path to a markdown file relative to
 * the site root; the file body becomes the content of one CollapsibleSection.
 * Each embed section's `src` is a URL rendered inside a lazy iframe.
 *
 * The renderer tracks all component instances and destroys them on cleanup,
 * matching the architectural requirements (BaseComponent descendants only,
 * no manual DOM, ComponentLibrary as the integration surface).
 */

(function () {
    const ProjectPage = {
        version: '1.0.0',
        componentInstances: [],

        /**
         * Render a project page from a manifest into a container element.
         * @param {HTMLElement} container
         * @param {Object} manifest
         */
        render(container, manifest) {
            this.cleanup(container);

            if (!manifest || !Array.isArray(manifest.sections)) {
                console.warn('⚠️ ProjectPage.render called without a valid manifest');
                return;
            }

            const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
            const deps = { MF: window.MathematicalFoundation, Resize: window.ResizeManager };

            const tracked = (component) => {
                this.componentInstances.push(component);
                return component;
            };

            const createMarkdownLoader = (path) => {
                return async () => {
                    const response = await fetch(path, { cache: 'no-cache' });
                    if (!response.ok) throw new Error(`Failed to fetch: ${path}`);
                    const markdownText = await response.text();
                    const md = new ComponentLibrary.MarkdownBody({ markdownText });
                    tracked(md);
                    return await md.render();
                };
            };

            const titleEl = tracked(new ComponentLibrary.Heading({
                level: 1,
                content: manifest.title || (manifest.id || '').toUpperCase()
            }, deps));
            container.appendChild(titleEl.render());

            if (manifest.hero && manifest.hero.src) {
                const hero = tracked(new ComponentLibrary.Image({
                    src: manifest.hero.src,
                    size: manifest.hero.size || 'full',
                    enableZoom: true
                }, deps));
                container.appendChild(hero.render());
            }

            manifest.sections.forEach((section, index) => {
                if (!section || !section.src || !section.title) return;

                if (section.type === 'embed') {
                    const embedLoader = async () => {
                        const iframe = document.createElement('iframe');
                        iframe.src = section.src;
                        iframe.style.width = '100%';
                        iframe.style.height = `${section.height || 720}px`;
                        iframe.style.border = '0';
                        iframe.loading = 'lazy';
                        return iframe;
                    };
                    const wrapper = tracked(new ComponentLibrary.CollapsibleSection({
                        title: section.title,
                        contentLoader: embedLoader,
                        defaultOpen: !!section.open,
                        isFirst: index === 0
                    }, deps));
                    container.appendChild(wrapper.render());
                    return;
                }

                const collapsible = tracked(new ComponentLibrary.CollapsibleSection({
                    title: section.title,
                    contentLoader: createMarkdownLoader(section.src),
                    defaultOpen: !!section.open,
                    isFirst: index === 0
                }, deps));
                container.appendChild(collapsible.render());
            });

            this.addBackLink(container, F);
        },

        addBackLink(container, F) {
            const backLink = new ComponentLibrary.Button({
                text: '← BACK TO PROJECTS',
                onClick: () => { window.location.hash = '#projects'; }
            });
            this.componentInstances.push(backLink);
            const el = backLink.render();
            el.style.marginTop = `${F * 2}px`;
            container.appendChild(el);
        },

        /**
         * Fetch a manifest by URL and render it. Returns a promise.
         * @param {HTMLElement} container
         * @param {string} manifestUrl
         */
        async loadAndRender(container, manifestUrl) {
            try {
                const response = await fetch(manifestUrl, { cache: 'no-cache' });
                if (!response.ok) throw new Error(`Failed to fetch manifest: ${manifestUrl}`);
                const manifest = await response.json();
                this.render(container, manifest);
                return manifest;
            } catch (err) {
                console.warn(`⚠️ ProjectPage.loadAndRender failed for ${manifestUrl}:`, err.message);
                throw err;
            }
        },

        cleanup(container) {
            if (Array.isArray(this.componentInstances) && this.componentInstances.length > 0) {
                ComponentLibrary.destroyTracked(this.componentInstances);
            }
            this.componentInstances = [];
            if (container) {
                container.innerHTML = '';
            }
        }
    };

    window.ProjectPage = ProjectPage;
    console.log(`🚀 ProjectPage engine v${ProjectPage.version} loaded`);
})();
