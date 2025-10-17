/**
 * Dynamic F System Utilities - SiteBoy Framework
 * 
 * Utilities for dynamically changing the F value and ensuring
 * all components update correctly throughout the system.
 * 
 * @version 1.0.0 - Dynamic F Support
 */

/**
 * Dynamic F Manager - Handles system-wide F value changes
 */
export const DynamicFManager = {
    
    /**
     * Get the current F value from the system
     * @returns {number} Current F value
     */
    getCurrentF() {
        return window.MathematicalFoundation?.F || 12;
    },
    
    /**
     * Update all F controller displays in the UI
     * @param {number} newF - New F value
     */
    updateFControllers(newF) {
        // Update old-style single controllers (if any exist)
        const oldControllers = document.querySelectorAll('.f-controller');
        oldControllers.forEach(controller => {
            controller.innerHTML = `[+| F=${newF}|-]`;
            controller.style.fontSize = `${newF}px`;
        });
        
        // Update new 3-button controllers
        const fDisplays = document.querySelectorAll('.f-display');
        fDisplays.forEach(display => {
            display.textContent = `F=${newF}`;
        });
        
        const fContainers = document.querySelectorAll('.f-controller-container');
        fContainers.forEach(container => {
            container.style.fontSize = `${newF}px`;
        });
        
        // Update any PageFooter instances that have the updateFControllerDisplay method
        if (window.ComponentLibrary?.PageFooter?.prototype?.updateFControllerDisplay) {
            // Find footer instances and update them
            const footers = document.querySelectorAll('.page-footer');
            footers.forEach(footerElement => {
                const footerComponent = footerElement._component; // If component reference exists
                if (footerComponent?.updateFControllerDisplay) {
                    footerComponent.updateFControllerDisplay(newF);
                }
            });
        }
    },
    
    /**
     * Set a new F value and update the entire system
     * @param {number} newF - New F value (recommended: 8-24px range)
     * @returns {boolean} Success status
     */
    setF(newF) {
        if (!newF || newF < 6 || newF > 30) {
            console.error('❌ Invalid F value. Recommended range: 6-30px');
            return false;
        }
        
        try {
            // 1. Update ONLY the core F value - everything else calculates automatically!
            if (window.Config) {
                window.Config.F = newF;
            } else {
                console.warn('⚠️ window.Config not available');
            }
            
            // 2. Update CSS variables to match (complete F system)
            document.documentElement.style.setProperty('--f', `${newF}px`);
            document.documentElement.style.setProperty('--header-height', `${newF * 2}px`);
            document.documentElement.style.setProperty('--target-margin', `${newF * 4}px`);
            document.documentElement.style.setProperty('--mobile-margin', `${Math.max(newF / 2, 6)}px`);
            
            // 3. Update LaTeX/Math sizing (KaTeX uses CSS variables directly)
            document.documentElement.style.setProperty('--math-display-size', `calc(var(--f) * 0.9)`);
            document.documentElement.style.setProperty('--math-inline-size', `var(--f)`);
            document.documentElement.style.setProperty('--math-margin', `var(--f)`);
            
            // 4. Update any F controllers in the UI
            this.updateFControllers(newF);
            
            // 5. Update layout variables (--layout-margin, --layout-width)
            if (window.SiteBoyApp && window.SiteBoyApp.pageContainer) {
                window.SiteBoyApp.pageContainer.applyLayoutGuideCalculations();
            }
            
            // 6. Trigger resize event to update components
            window.dispatchEvent(new Event('resize'));
            
            // 7. Log the change (values calculated automatically via getters)
            console.log(`✅ F system updated to ${newF}px`);
            console.log(`📊 Header height: ${window.Config.sizing.header}px`);
            console.log(`📊 Desktop margin: ${window.Config.margins.desktop}px`);
            console.log(`📊 Mobile margin: ${window.Config.margins.mobile}px`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to update F system:', error);
            return false;
        }
    },
    
    /**
     * Create a set of test F values to experiment with
     * @returns {Array} Array of recommended F values with descriptions
     */
    getTestValues() {
        return [
            { F: 6, description: 'Tiny (6px) - Minimum size' },
            { F: 8, description: 'Compact (8px) - Very dense interface' },
            { F: 10, description: 'Small (10px) - Dense but readable' },
            { F: 12, description: 'Standard (12px) - Current default' },
            { F: 14, description: 'Comfortable (14px) - Slightly larger' },
            { F: 16, description: 'Large (16px) - More spacious' },
            { F: 18, description: 'Extra Large (18px) - Very spacious' },
            { F: 20, description: 'Huge (20px) - Very large' },
            { F: 24, description: 'Giant (24px) - Extremely large' },
            { F: 30, description: 'Maximum (30px) - Maximum allowed' }
        ];
    },
    
    /**
     * Animate F value change smoothly
     * @param {number} targetF - Target F value
     * @param {number} duration - Animation duration in ms (default: 1000)
     */
    animateToF(targetF, duration = 1000) {
        const startF = this.getCurrentF();
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentF = startF + (targetF - startF) * easedProgress;
            this.setF(Math.round(currentF));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    },
    
    /**
     * Test function for browser console
     * Usage: DynamicFManager.testDifferentSizes()
     */
    testDifferentSizes() {
        console.log('🧪 Testing different F sizes...');
        const values = this.getTestValues();
        let index = 0;
        
        const testNext = () => {
            if (index < values.length) {
                const test = values[index];
                console.log(`🔬 Testing: ${test.description}`);
                this.setF(test.F);
                index++;
                setTimeout(testNext, 2000); // 2 second intervals
            } else {
                console.log('✅ F size testing complete!');
                this.setF(12); // Reset to default
            }
        };
        
        testNext();
    },
    
    /**
     * Validate that all components are using the F system correctly
     * @returns {Object} Validation report
     */
    validateFSystem() {
        const report = {
            configF: window.Config?.F,
            mathFoundationF: window.MathematicalFoundation?.F,
            cssF: getComputedStyle(document.documentElement).getPropertyValue('--f'),
            cssHeader: getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
            cssDesktopMargin: getComputedStyle(document.documentElement).getPropertyValue('--target-margin'),
            cssMobileMargin: getComputedStyle(document.documentElement).getPropertyValue('--mobile-margin'),
            isConsistent: true,
            warnings: [],
            derived: {}
        };
        
        // Check consistency
        if (report.configF !== report.mathFoundationF) {
            report.isConsistent = false;
            report.warnings.push('Config.F and MathematicalFoundation.F do not match');
        }
        
        const cssF = parseInt(report.cssF);
        if (report.configF !== cssF) {
            report.isConsistent = false;
            report.warnings.push('JavaScript F and CSS --f variable do not match');
        }
        
        // Check derived values
        const expectedHeader = report.configF * 2;
        const actualHeader = parseInt(report.cssHeader);
        if (expectedHeader !== actualHeader) {
            report.isConsistent = false;
            report.warnings.push(`Header height mismatch: expected ${expectedHeader}px, got ${actualHeader}px`);
        }
        
        const expectedDesktop = report.configF * 4;
        const actualDesktop = parseInt(report.cssDesktopMargin);
        if (expectedDesktop !== actualDesktop) {
            report.isConsistent = false;
            report.warnings.push(`Desktop margin mismatch: expected ${expectedDesktop}px, got ${actualDesktop}px`);
        }
        
        // Calculate what all values should be
        report.derived = {
            expectedHeader: `${report.configF * 2}px`,
            expectedDesktop: `${report.configF * 4}px`,
            expectedMobile: `${Math.max(report.configF / 2, 6)}px`,
            expectedDropdown: `${report.configF * 25}px`,
            actualFromConfig: {
                header: window.Config?.sizing?.header,
                desktop: window.Config?.margins?.desktop,
                mobile: window.Config?.margins?.mobile,
                dropdown: window.Config?.sizing?.dropdownMaxH
            }
        };
        
        console.log('🔍 F System Validation Report:', report);
        if (report.isConsistent) {
            console.log('✅ All F system values are consistent!');
        } else {
            console.log('❌ F system inconsistencies found:', report.warnings);
        }
        
        return report;
    },
    
    /**
     * Complete F system test - changes F and validates everything updates
     */
    async testCompleteFSystem() {
        console.log('🧪 Starting Complete F System Test...');
        
        const originalF = this.getCurrentF();
        const testValues = [8, 16, 20, originalF];
        
        for (const testF of testValues) {
            console.log(`\n🔬 Testing F = ${testF}px`);
            
            // Set F value
            this.setF(testF);
            
            // Wait for updates
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Validate
            const report = this.validateFSystem();
            
            if (report.isConsistent) {
                console.log(`✅ F=${testF}px: All systems consistent`);
            } else {
                console.log(`❌ F=${testF}px: Inconsistencies found`);
                console.log(report.warnings);
            }
            
            // Log some key values to verify
            console.log(`   Header: ${window.Config?.sizing?.header}px`);
            console.log(`   Desktop Margin: ${window.Config?.margins?.desktop}px`);
            console.log(`   CSS --f: ${getComputedStyle(document.documentElement).getPropertyValue('--f')}`);
            console.log(`   CSS --header-height: ${getComputedStyle(document.documentElement).getPropertyValue('--header-height')}`);
        }
        
        console.log('\n🎯 Complete F System Test finished!');
        console.log('Result: Change Config.F and EVERYTHING should update automatically');
    },
    
};

// Make available globally for console testing
window.DynamicFManager = DynamicFManager;

console.log('🎛️ Dynamic F Manager loaded - Try: DynamicFManager.setF(16)');
