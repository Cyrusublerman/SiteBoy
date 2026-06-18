/**
 * SiteBoy Framework - VITE Entry Point
 *
 * Modern ES module entry point for the SiteBoy framework.
 * Loads core dependencies and initializes the application.
 *
 * @version 1.0.0
 */

// Pre-load core dependencies in correct order
import '../assets/js/core/config.js';  // Must load first for LayoutCalculator
import '../assets/js/shared/foundation.js';
import '../assets/js/shared/component-library.js';  // Core components only
import '../assets/js/core/animation-foundation.js';  // Animation system for tools
import '../assets/js/core/router.js';  // Router must be loaded before app
import '../assets/js/core/navigation-controller.js';  // Navigation controller needed by sections
import '../assets/js/core/asset-loader.js';  // Asset loader for dynamic tool loading

// Load all section modules (they register themselves globally)
import '../assets/js/sections/home_section.js';
import '../assets/js/sections/blog_section.js';
import '../assets/js/sections/art_section.js';
import '../assets/js/sections/tools_section.js';
import '../assets/js/sections/projects_section.js';
import '../assets/js/sections/project-page.js';  // Generic JSON-driven project page renderer
import '../assets/js/sections/contact_section.js';
import '../assets/js/sections/qr_section.js';
import '../assets/js/sections/about_section.js';
import '../assets/js/sections/store_section.js';
import '../assets/js/sections/three_d_section.js';
import '../assets/js/sections/admin_section.js';
import '../projects/Synthetic Biophilia/synthetic-biophilia.js';

import { SiteBoyApp } from '../assets/js/core/app.js';
import { Auth } from '../assets/js/admin/auth.js';

// Initialize the application
window.debugLog('INIT', '🚀 SiteBoy Framework v4.0.0 - Modern ES Module Architecture');
window.debugLog('INIT', '📦 Loading via VITE bundler...');

SiteBoyApp.init();
Auth.bootstrap();
