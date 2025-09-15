/**
 * Navigation Controller - SiteBoy Framework
 * 
 * UNIFIED NAVIGATION SYSTEM - One method, all sections
 * Every section uses identical navigation code
 * 
 * @version 2.0.0 - Simplified & Unified
 */

const NavigationController = {
    version: '2.0.0',
    
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
        
        const currentPath = currentPage ? `#${section}/${currentPage}` : `#${section}`;
        const currentIndex = pages.indexOf(currentPath);
        
        console.log(`🧭 Setting up unified navigation for ${section}, current: ${currentPath}, index: ${currentIndex}`);
        
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
                window.Subheader.updateTitle(currentPage.toUpperCase());
                
                // Create dropdown items
                const dropdownItems = pages.map(page => {
                    const isIndex = page === `#${section}`;
                    const title = isIndex ? `${section.toUpperCase()} TOC` : page.replace(`#${section}/`, '').toUpperCase();
                    
                    return {
                        text: title,
                        path: page,
                        isActive: page === currentPath
                    };
                });
                
                // Setup dropdown
                window.Subheader.setDropdownContent(dropdownItems, (item) => {
                    if (item.path && callbacks && callbacks.navigateToSection) {
                        const pathParts = item.path.replace('#', '').split('/');
                        const targetSection = pathParts[0];
                        const targetSubsection = pathParts.slice(1).join('/') || null;
                        callbacks.navigateToSection(targetSection, targetSubsection);
                    }
                });
                
                // Setup prev/next navigation with proper looping
                // Convert pages array to items format that Subheader expects
                const navigationItems = pages.map(page => {
                    const pathParts = page.replace('#', '').split('/');
                    const isIndex = pathParts.length === 1;
                    const sectionName = pathParts[0];
                    const subsectionName = pathParts.slice(1).join('/');
                    
                    return {
                        id: isIndex ? null : subsectionName,
                        path: page,
                        title: isIndex ? `${sectionName.toUpperCase()} TOC` : subsectionName.toUpperCase(),
                        isTOC: isIndex
                    };
                });
                
                const navigationContext = {
                    section: section,
                    subsection: currentPage,
                    items: navigationItems,
                    navigate: (targetSection, targetSubsection) => {
                        if (callbacks && callbacks.navigateToSection) {
                            console.log(`🧭 NavigationController navigating to: ${targetSection}/${targetSubsection || 'index'}`);
                            callbacks.navigateToSection(targetSection, targetSubsection);
                        }
                    }
                };
                
                window.Subheader.updateNavigation(navigationContext);
                console.log(`🧭 Navigation setup: section=${section}, subsection=${currentPage}, items=${navigationItems.length}`);
            }
        }
        
        console.log(`✅ Unified navigation setup complete for ${section}`);
    }
};

// Register globally
window.NavigationController = NavigationController;

console.log(`🧭 NavigationController v${NavigationController.version} loaded - Unified navigation for all sections`);