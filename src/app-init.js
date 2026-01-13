/**
 * Application Initialization - Vite Entry Point
 *
 * Handles the app startup logic that was previously in index.html
 */

// Wait for ComponentLibrary and SiteBoyApp to be ready before initializing app
export function initApp() {
    console.log('🚀 SiteBoy Framework v4.0.0 - Vite ES Module Entry Point');

    const maxWaitTime = 10000; // 10 seconds max
    const startTime = Date.now();

    function waitForDependencies() {
        if (window.ComponentLibrary && window.SiteBoyApp) {
            console.log('🎯 All dependencies ready, initializing app...');
            window.SiteBoyApp.init();
        } else if (Date.now() - startTime > maxWaitTime) {
            // Only log failures, not during waiting
            const missing = [];
            if (!window.ComponentLibrary) missing.push('ComponentLibrary');
            if (!window.SiteBoyApp) missing.push('SiteBoyApp');

            console.error(`❌ Dependencies failed to load within 10 seconds. Missing: ${missing.join(', ')}`);
        } else {
            // Silent wait - no logging during the loop
            setTimeout(waitForDependencies, 10);
        }
    }

    // Start waiting for dependencies
    waitForDependencies();
}
