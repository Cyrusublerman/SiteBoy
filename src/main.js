/**
 * SiteBoy Framework - VITE Entry Point
 *
 * Modern ES module entry point for the SiteBoy framework.
 * Loads core dependencies and initializes the application.
 *
 * @version 1.1.1
 */

import '../assets/css/pkl-public.css';

// Pre-load core dependencies in correct order
import '../assets/js/core/config.js';
import '../assets/js/shared/foundation.js';
import '../assets/js/shared/component-library.js';
import '../assets/js/core/animation-foundation.js';
import '../assets/js/core/router.js';
import '../assets/js/core/navigation-controller.js';
import '../assets/js/core/asset-loader.js';

// Existing section modules
import '../assets/js/sections/home_section.js';
import '../assets/js/sections/blog_section.js'; // Retained as legacy documentation renderer
import '../assets/js/sections/art_section.js';
import '../assets/js/sections/tools_section.js';
import '../assets/js/sections/projects_section.js';
import '../assets/js/sections/project-page.js';
import '../assets/js/sections/contact_section.js';
import '../assets/js/sections/qr_section.js';
import '../assets/js/sections/about_section.js';
import '../assets/js/sections/store_section.js';
import '../assets/js/sections/three_d_section.js';
import '../assets/js/sections/admin_section.js';

// PKL public projection sections load after the legacy Blog renderer.
import '../assets/js/sections/wiki_section.js';
import '../assets/js/sections/pkl_blog_section.js';
import '../assets/js/sections/figure_section.js';

import '../projects/Synthetic Biophilia/synthetic-biophilia.js';

import { SiteBoyApp } from '../assets/js/core/app.js';
import { Auth } from '../assets/js/admin/auth.js';

window.debugLog('INIT', '🚀 SiteBoy Framework v4.0.0 - Modern ES Module Architecture');
window.debugLog('INIT', '📦 Loading via VITE bundler...');

const appReady = SiteBoyApp.init();
Promise.resolve(appReady).then(() => {
  const header = SiteBoyApp.pageContainer?.headerComponent;
  if (!header || header.navigationItems.some((item) => item.title === 'WIKI')) return;

  const wikiItem = { title: 'WIKI', onClick: () => SiteBoyApp.navigateToSection('wiki') };
  const blogIndex = header.navigationItems.findIndex((item) => item.title === 'BLOG');
  header.navigationItems.splice(blogIndex >= 0 ? blogIndex : 1, 0, wikiItem);
  header.navigationDropdown?.populateDropdown(header.navigationItems);
});

Auth.bootstrap();
