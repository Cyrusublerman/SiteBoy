/**
 * Navigation Controller - SiteBoy Framework
 * 
 * UNIFIED NAVIGATION SYSTEM - One method, all sections
 * Every section uses identical navigation code
 * Supports hierarchical file-directory style dropdowns
 * 
 * @version 2.1.0 - Hierarchical Dropdown Support
 */

const NavigationController = {
    version: '2.1.0',
    
    /**
     * Setup navigation for any section - SINGLE METHOD FOR ALL
     * @param {string} section - Section name (blog, art, tools, projects)
     * @param {string|null} currentPage - Current page path
     * @param {Array} pages - Simple array of page paths
     * @param {Object} callbacks - Navigation callbacks
     */
    setupNavigation(section, currentPage, pages, callbacks) {
        if (!pages || !Array.isArray(pages)) {
            console.warn(`⚠️ NavigationController: Invalid pages array for ${section}`);
            return;
        }
        
        const currentPath = currentPage
            ? (currentPage.startsWith('#') ? currentPage : `#${section}/${currentPage}`)
            : `#${section}`;
        const currentIndex = pages.indexOf(currentPath);
        
        window.debugLog('NAVIGATION', `🧭 Setting up unified navigation for ${section}, current: ${currentPath}, index: ${currentIndex}`);
        
        // Hide subheader for index pages, show for sub-pages
        if (!currentPage) {
            // Index page - hide subheader
            if (window.Subheader) {
                window.Subheader.hide();
            }
        } else {
            // Sub-page - show subheader with dropdown and nav
            if (window.Subheader) {
                window.Subheader.show();
                
                // Format title for display (handle query parameters)
                let displayTitle = currentPage.toUpperCase();
                if (currentPage.includes('?')) {
                    const [base, query] = currentPage.split('?');
                    const params = new URLSearchParams(query);
                    const scriptParam = params.get('script');
                    if (scriptParam) {
                        const scriptName = scriptParam
                            .split('-')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        displayTitle = `GENERATOR: ${scriptName.toUpperCase()}`;
                    }
                }
                
                window.Subheader.updateTitle(displayTitle);
                
                // Build hierarchical dropdown items from pages array
                const dropdownItems = this.buildHierarchicalItems(section, pages, currentPath);
                
                // Determine which subsection should be expanded (contains current page)
                const currentSubsection = this.findCurrentSubsection(section, currentPath);
                
                // Setup dropdown with auto-expand info
                window.Subheader.setDropdownContent(dropdownItems, (item) => {
                    if (item.path && callbacks && callbacks.navigateToSection) {
                        const pathParts = item.path.replace('#', '').split('/');
                        const targetSection = pathParts[0];
                        const targetSubsection = pathParts.slice(1).join('/') || null;
                        callbacks.navigateToSection(targetSection, targetSubsection);
                    }
                }, currentSubsection);
                
                // Setup prev/next navigation with proper looping
                // Convert pages array to items format that Subheader expects
                // Filter out subsection index pages (e.g., #tools/utilities, #tools/processors)
                const navigationItems = pages
                    .filter(page => {
                        const pathParts = page.replace('#', '').split('/');
                        // Keep only: section index (#tools - 1 part) or tool pages (#tools/utilities/tool-test - 3 parts)
                        // Also keep: query param pages (#tools/generators?script=x - 2 parts with ?)
                        // Remove: subsection index pages (#tools/utilities - 2 parts without ?)
                        return pathParts.length === 1 || pathParts.length >= 3 || page.includes('?');
                    })
                    .map(page => {
                        const pathParts = page.replace('#', '').split('/');
                        const isIndex = pathParts.length === 1;
                        const sectionName = pathParts[0];
                        const subsectionName = pathParts.slice(1).join('/');
                        
                        // Extract title from query parameters if present
                        let title = subsectionName.toUpperCase();
                        if (subsectionName.includes('?')) {
                            const [base, query] = subsectionName.split('?');
                            const params = new URLSearchParams(query);
                            const scriptParam = params.get('script');
                            if (scriptParam) {
                                // Convert kebab-case to Title Case
                                const scriptName = scriptParam
                                    .split('-')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');
                                title = `GENERATOR: ${scriptName.toUpperCase()}`;
                            }
                        }
                        
                        return {
                            id: isIndex ? null : subsectionName,
                            path: page,
                            title: isIndex ? `${sectionName.toUpperCase()} TOC` : title,
                            isTOC: isIndex
                        };
                    });
                
                const navigationContext = {
                    section: section,
                    subsection: currentPage,
                    items: navigationItems,
                    navigate: (targetSection, targetSubsection) => {
                        if (callbacks && callbacks.navigateToSection) {
                            window.debugLog('NAVIGATION', `🧭 NavigationController navigating to: ${targetSection}/${targetSubsection || 'index'}`);
                            callbacks.navigateToSection(targetSection, targetSubsection);
                        }
                    }
                };
                
                window.Subheader.updateNavigation(navigationContext);
                window.debugLog('NAVIGATION', `🧭 Navigation setup: section=${section}, subsection=${currentPage}, items=${navigationItems.length}`);
            }
        }
        
        window.debugLog('NAVIGATION', `✅ Unified navigation setup complete for ${section}`);
    },
    
    /**
     * Build hierarchical dropdown items from flat pages array
     * Groups pages by their subsection prefix into collapsible folders
     * 
     * @param {string} section - Section name (blog, art, etc.)
     * @param {Array} pages - Flat array of page paths
     * @param {string} currentPath - Currently active path
     * @returns {Array} Hierarchical items for dropdown
     */
    buildHierarchicalItems(section, pages, currentPath) {
        const sectionPrefix = `#${section}`;
        const groups = new Map(); // subsection -> array of child pages
        const standaloneItems = []; // Items without a subsection
        
        pages.forEach(page => {
            if (page === sectionPrefix) {
                // Section index/TOC - always show at top
                standaloneItems.unshift({
                    title: `${section.toUpperCase()} TOC`,
                    path: page,
                    isActive: page === currentPath
                });
                return;
            }
            
            // Parse path: #section/subsection/page or #section/subsection
            const relativePath = page.replace(`${sectionPrefix}/`, '');
            const parts = relativePath.split('/');
            
            if (parts.length === 1) {
                // Direct child of section (e.g., #art/digital) - could be subsection or standalone
                // Check if there are deeper pages under this
                const hasChildren = pages.some(p => 
                    p.startsWith(`${sectionPrefix}/${parts[0]}/`) && p !== page
                );
                
                if (hasChildren) {
                    // This is a subsection folder - initialize group
                    if (!groups.has(parts[0])) {
                        groups.set(parts[0], { 
                            path: page, 
                            items: [],
                            isActive: page === currentPath
                        });
                    }
                } else {
                    // Standalone item at subsection level
                    standaloneItems.push({
                        title: parts[0].toUpperCase(),
                        path: page,
                        isActive: page === currentPath
                    });
                }
            } else {
                // Nested page (e.g., #art/generative/circles)
                const subsection = parts[0];
                const pageName = parts.slice(1).join('/');
                
                if (!groups.has(subsection)) {
                    // Check if subsection itself is a valid page
                    const subsectionPath = `${sectionPrefix}/${subsection}`;
                    const subsectionIsPage = pages.includes(subsectionPath);
                    groups.set(subsection, { 
                        path: subsectionIsPage ? subsectionPath : null, 
                        items: [],
                        isActive: subsectionPath === currentPath
                    });
                }
                
                groups.get(subsection).items.push({
                    title: pageName.toUpperCase(),
                    path: page,
                    isActive: page === currentPath
                });
            }
        });
        
        // Build final items array
        const result = [...standaloneItems];
        
        // Add grouped subsections as collapsible items
        groups.forEach((groupData, subsectionName) => {
            if (groupData.items.length > 0) {
                // Has children - create collapsible subsection
                result.push({
                    type: 'subsection',
                    id: subsectionName,
                    title: subsectionName.toUpperCase(),
                    path: groupData.path, // May be clickable if subsection is also a page
                    isActive: groupData.isActive,
                    items: groupData.items
                });
            } else if (groupData.path) {
                // No children but has a path - standalone item
                result.push({
                    title: subsectionName.toUpperCase(),
                    path: groupData.path,
                    isActive: groupData.isActive
                });
            }
        });
        
        window.debugLog('NAVIGATION', `🧭 Built hierarchical dropdown: ${result.length} top-level items`);
        return result;
    },
    
    /**
     * Find which subsection contains the current page
     * Returns the subsection ID (e.g., 'utilities', 'processors')
     * 
     * @param {string} section - Section name
     * @param {string} currentPath - Current page path (e.g., '#tools/utilities/tool-test')
     * @returns {string|null} Subsection ID or null
     */
    findCurrentSubsection(section, currentPath) {
        if (!currentPath) return null;
        
        const sectionPrefix = `#${section}`;
        const relativePath = currentPath.replace(`${sectionPrefix}/`, '');
        const parts = relativePath.split('/');
        
        // If path has 2+ parts (e.g., utilities/tool-test), first part is subsection
        if (parts.length >= 2) {
            window.debugLog('NAVIGATION', `🧭 Current subsection: ${parts[0]}`);
            return parts[0];
        }
        
        return null;
    }
};

// Register globally
window.NavigationController = NavigationController;

window.debugLog('INIT', `🧭 NavigationController v${NavigationController.version} loaded - Unified navigation for all sections`);