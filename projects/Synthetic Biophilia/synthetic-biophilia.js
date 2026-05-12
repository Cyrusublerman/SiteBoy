/**
 * Synthetic Biophilia Project Page - SiteBoy Framework
 * 
 * This module uses the ComponentLibrary to render a series of 
 * collapsible sections based on a configuration object.
 * 
 * @version 3.0.0 - Refactored for architectural compliance
 */

(function () {
    const SyntheticBiophiliaProject = {
        version: '3.0.0',
        componentInstances: [],

        render(container) {
            this.cleanup(container);
            
            const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
            const deps = { MF: window.MathematicalFoundation, Resize: window.ResizeManager };

            // Define a reusable content loader function for markdown files
            const createMarkdownLoader = (path) => {
                return async () => {
                    const response = await fetch(path, { cache: 'no-cache' });
                    if (!response.ok) throw new Error(`Failed to fetch: ${path}`);
                    const markdownText = await response.text();
                    
                    const markdownComponent = new ComponentLibrary.MarkdownBody({ markdownText });
                    // We need to track this sub-component for proper cleanup
                    this.componentInstances.push(markdownComponent);
                    
                    return await markdownComponent.render();
                };
            };

            // Gallery images data (cloud-hosted)
            const galleryImages = [
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/closed 169 top.jpg', caption: 'Closed 169 Top View' },
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/closed 169 side.jpg', caption: 'Closed 169 Side View' },
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/dome from underneath 1.jpg', caption: 'Dome from Underneath 1' },
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/dome from underneath 2.jpg', caption: 'Dome from Underneath 2' },
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/joints 2.jpg', caption: 'Joint Details' },
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/lattice joint.jpg', caption: 'Lattice Joint' },
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/169 top4k1 no fill just lattice.jpg', caption: '169 Top View - Lattice Only' },
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/169 sidey4k1 no fill just lattice.jpg', caption: '169 Side View - Lattice Only' },
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/bush like leafs.jpg', caption: 'Bush-Like Leaf Formation' },
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/circle piece leaf side.jpg', caption: 'Circular Leaf Formation' },
                { src: 'https://media.einoder.net/projects/synthetic-biophilia/web/circle tree leafnlow density tall.jpg', caption: 'Tree-Like Structure - Low Density' }
            ];

            // Create gallery loader function
            const createGalleryLoader = () => {
                return async () => {
                    const carouselComponent = new ComponentLibrary.Carousel({ 
                        images: galleryImages,
                        enableZoom: true 
                    }, deps);
                    this.componentInstances.push(carouselComponent);
                    return await carouselComponent.render();
                };
            };

            // Title
            const titleEl = new ComponentLibrary.Heading({ level: 1, content: 'SYNTHETIC BIOPHILIA' }, deps);
            this.componentInstances.push(titleEl);
            container.appendChild(titleEl.render());

            // Hero image
            const heroImg = new ComponentLibrary.Image({
                src: 'https://media.einoder.net/projects/synthetic-biophilia/web/169 sidey4k1 no fill just lattice.jpg',
                size: 'full',
                enableZoom: true
            }, deps);
            this.componentInstances.push(heroImg);
            container.appendChild(heroImg.render());

            // Define the sections for the project page
            const sectionConfigs = [
                { title: 'ABSTRACT', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/abstract.md'), defaultOpen: true },
                { title: 'THEORY', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/theory.md'), defaultOpen: false },
                { title: 'PHYLLOTAXIS', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/phyllotaxis.md'), defaultOpen: false },
                { title: 'DOME FORMATION', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/dome-formation.md'), defaultOpen: false },
                { title: 'LATTICE', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/lattice.md'), defaultOpen: false },
                { title: 'LEAVES', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/leaves.md'), defaultOpen: false },
                { title: 'GALLERY', contentLoader: createGalleryLoader(), defaultOpen: true },
                { title: 'BLENDER CODE', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/blender-code.md'), defaultOpen: false },
                { title: 'APPENDICES', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/appendices.md'), defaultOpen: false }
            ];

            // Create and render each section using the CollapsibleSection component
            sectionConfigs.forEach((config, index) => {
                const sectionComponent = new ComponentLibrary.CollapsibleSection({
                    ...config,
                    isFirst: index === 0
                }, deps);
                
                this.componentInstances.push(sectionComponent);
                container.appendChild(sectionComponent.render());
            });

            // Add the "Back to Projects" link
            this.addBackLink(container, F);
        },

        addBackLink(container, F) {
            const backLink = new ComponentLibrary.Button({
                text: '← BACK TO PROJECTS',
                onClick: () => { window.location.hash = '#projects'; }
            });

            this.componentInstances.push(backLink);
            const backLinkElement = backLink.render();
            backLinkElement.style.marginTop = `${F * 2}px`;
            container.appendChild(backLinkElement);
        },

        cleanup(container) {
            // Use the centralized cleanup utility
            ComponentLibrary.destroyTracked(this.componentInstances);
            if (container) {
                container.innerHTML = '';
            }
        }
    };

    // Export to window
    window.SyntheticBiophiliaProject = SyntheticBiophiliaProject;
    console.log(`🚀 Synthetic Biophilia Project v${SyntheticBiophiliaProject.version} loaded - Now architecturally compliant`);
})();