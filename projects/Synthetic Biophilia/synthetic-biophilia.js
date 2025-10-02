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

            // Define the sections for the project page
            const sectionConfigs = [
                { title: 'ABSTRACT', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/abstract.md'), defaultOpen: true },
                { title: 'THEORY', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/theory.md'), defaultOpen: true },
                { title: 'PHYLLOTAXIS', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/phyllotaxis.md'), defaultOpen: false },
                { title: 'DOME FORMATION', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/dome-formation.md'), defaultOpen: false },
                { title: 'LATTICE', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/lattice.md'), defaultOpen: false },
                { title: 'LEAVES', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/leaves.md'), defaultOpen: false },
                { title: 'GALLERY', contentLoader: createMarkdownLoader('projects/Synthetic Biophilia/md/gallery.md'), defaultOpen: false },
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
            const backLink = new ComponentLibrary.Paragraph({
                content: '← Back to Projects',
                isClickable: true,
                onClick: () => {
                if (window.location.hash.startsWith('#projects/')) {
                    window.location.hash = '#projects';
                    }
                }
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