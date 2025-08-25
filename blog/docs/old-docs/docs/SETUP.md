# 🚀 SiteBoy Setup Guide

> Quick start guide for the single-page application with mathematical precision grid and markdown-based content

## 📋 Prerequisites

- Modern web browser with ES6+ support
- Local web server (for development)
- Basic understanding of HTML, CSS, and JavaScript

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/siteboy.git
cd siteboy
```

### 2. Serve Locally

Choose one of these methods:

**Python (Recommended)**
```bash
python -m http.server 8000
```

**Node.js**
```bash
npx serve .
```

**PHP**
```bash
php -S localhost:8000
```

### 3. Access the Site

Open your browser and navigate to:
- **Local**: `http://localhost:8000`
- **Network**: `http://your-ip:8000` (for testing on other devices)

## 🧩 Application Architecture

### Understanding the System

SiteBoy is a single-page application with:
- **Client-Side Routing**: Hash-based navigation between sections
- **Markdown Content**: Dynamic content rendering from markdown files
- **Modular JavaScript**: Specialized modules for different functionality
- **Mathematical Grid**: Precision layout calculations

### Available Sections

1. **Blog Section** (`#blog`)
   - Music theory articles
   - Site development notes
   - Technical documentation

2. **Art Section** (`#art`)
   - Digital artworks
   - Generative compositions
   - Visual experiments

3. **Tools Section** (`#tools`)
   - Interactive calculators
   - Utility functions
   - Development tools

4. **Projects Section** (`#projects`)
   - Portfolio showcase
   - Project details
   - External links

### Navigation

- Use the dropdown menu in the header to navigate between sections
- Click "AEINODER" in the header to return to home
- Use browser back/forward buttons for navigation history

## 📐 Mathematical Grid System

### Understanding the Grid

The grid system automatically calculates optimal layout based on:
- Viewport dimensions
- Aspect ratio
- Mathematical formulas
- Configuration parameters

### Grid Configuration

The grid uses these parameters:
```javascript
layout: {
    minCols: 1,              // Minimum columns
    maxCols: 6,              // Maximum columns
    aspectMultiplier: 3.982, // Aspect ratio multiplier
    aspectOffset: 1.088,     // Aspect ratio offset
    targetMargin: 64,        // Target margin (px)
    mobileMargin: 5,         // Mobile margin (px)
    gap: 1                   // Grid gap (px)
}
```

### Debug Mode

Press `Ctrl+D` to toggle debug mode and see:
- Viewport dimensions
- Column count
- Box sizes
- Grid geometry
- Header split calculations

## 🎨 Design System

### VGA Color Palette

SiteBoy uses the authentic 16-color VGA palette:
- **Primary**: Dark Gray, Light Gray, Silver
- **Accent**: Gray, Medium Gray
- **Full Palette**: All 16 VGA colors available

### Theme Toggle

- Click the sun/moon icon in header or footer
- Toggles between normal and inverted themes
- Theme preference saved in localStorage

### Typography

- **Font**: Syne Mono (monospace)
- **Style**: Uppercase text transform
- **Sizes**: 12px base with responsive scaling

## 📁 Project Structure

```
siteboy/
├── assets/                 # Single-source assets
│   ├── css/               # Stylesheets
│   │   └── styles.css     # Main styles
│   ├── js/                # JavaScript modules
│   │   ├── app.js         # Application orchestrator
│   │   ├── config.js      # Configuration
│   │   ├── router.js      # Client-side routing
│   │   ├── layout_structure.js # Mathematical grid
│   │   ├── user_interaction.js # UI interactions
│   │   ├── content_processor.js # Markdown processing
│   │   ├── ascii_field.js # ASCII art field
│   │   ├── art_section.js # Art functionality
│   │   ├── blog_section.js # Blog functionality
│   │   ├── tools_section.js # Tools functionality
│   │   └── projects_section.js # Projects functionality
│   └── md/                # Markdown content
│       ├── music/         # Music content
│       └── site/          # Site content
├── reference/             # Design reference
└── index.html             # Main entry point
```

## 🔧 Development Workflow

### Adding New Content

1. **Create Markdown File**:
   ```markdown
   # My New Article
   
   This is the content of my new article.
   
   ## Subsection
   
   More content here...
   ```

2. **Add to Configuration** (`assets/js/config.js`):
   ```javascript
   sections: {
       blog: {
           modules: [
               // ... existing modules
               { id: 'my-article', title: 'My New Article', file: 'assets/blog/site/my-article.md', category: 'site' }
           ]
       }
   }
   ```

3. **Content will be automatically rendered** when navigating to the blog section

### Creating a New Section

1. **Add Section Configuration** (`assets/js/config.js`):
   ```javascript
   sections: {
       // ... existing sections
       mysection: {
           modules: [
               { id: 'module1', title: 'Module 1', file: 'assets/blog/mysection/module1.md' }
           ]
       }
   }
   ```

2. **Create Section JavaScript Module** (`assets/js/mysection_section.js`):
   ```javascript
   const MySectionSection = {
       init() {
           // Section initialization
       },
       
       loadContent(moduleId) {
           // Load section-specific content
       }
   };
   ```

3. **Add to HTML** (`index.html`):
   ```html
   <script src="assets/js/mysection_section.js"></script>
   ```

4. **Add Navigation Link**:
   ```html
   <a href="#mysection" class="dropdown-link">
       <div class="grid-caption">
           <span class="caption-text">My Section</span>
           <div class="caption-icon square-button">&gt;</div>
       </div>
   </a>
   ```

### Modifying the Grid

1. **Update Configuration** (`assets/js/config.js`):
   ```javascript
   layout: {
       minCols: 2,              // Change minimum columns
       maxCols: 8,              // Change maximum columns
       aspectMultiplier: 4.0,   // Adjust aspect ratio multiplier
       // ... other parameters
   }
   ```

2. **Grid will automatically recalculate** on page refresh

## 🐛 Troubleshooting

### Common Issues

1. **Content Not Loading**
   - Check markdown file paths in `config.js`
   - Verify file exists in `assets/blog/` directory
   - Check browser console for AJAX errors

2. **Navigation Not Working**
   - Ensure all JavaScript modules are loaded
   - Check browser console for JavaScript errors
   - Verify router.js is properly initialized

3. **Grid Not Calculating**
   - Ensure `layout_structure.js` is loaded
   - Check browser console for JavaScript errors
   - Verify viewport meta tag is present

4. **Theme Toggle Not Working**
   - Check `user_interaction.js` is loaded
   - Verify localStorage permissions
   - Check for JavaScript errors in console

### Debug Tools

- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Verify file loading (markdown, JS, CSS)
- **Elements Tab**: Inspect DOM structure
- **Debug Mode**: Press `Ctrl+D` for grid information
- **Application Tab**: Check localStorage for theme preference

### Debug Commands

Open browser console and use these commands:

```javascript
// Check application status
App.getSystemStatus()

// Enable debug mode
App.enableDebugMode()

// Disable debug mode
App.disableDebugMode()

// Check current route
Router.getCurrentSection()

// Navigate to section
Router.navigateToSection('blog')
```

## 📚 Next Steps

1. **Explore Content**: Navigate through different sections
2. **Study Modules**: Examine JavaScript module implementations
3. **Add Content**: Create new markdown files and add to config
4. **Customize Grid**: Modify layout parameters for different layouts
5. **Create Sections**: Build new sections with specialized functionality

## 🎯 Best Practices

1. **Follow VGA Aesthetic**: Use authentic 16-color palette
2. **Maintain Modularity**: Keep JavaScript modules focused and single-purpose
3. **Use Mathematical Precision**: Leverage grid system calculations
4. **Preserve Clean 2D Design**: Avoid 3D effects and bevels
5. **Test Responsively**: Verify layout across different viewport sizes
6. **Organize Content**: Use clear categories and file structure for markdown content

## 🔧 Advanced Configuration

### Customizing Colors

Edit `assets/css/styles.css`:
```css
:root {
    --c-bg: #0a0a0a;         /* Background color */
    --c-text: #cccccc;       /* Text color */
    --c-border: #808080;     /* Border color */
}
```

### Adding External Dependencies

Add to `index.html`:
```html
<!-- External libraries -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Syne+Mono:wght@400&display=swap" rel="stylesheet">
```

### Performance Optimization

1. **Content Caching**: Implement service worker for offline access
2. **Lazy Loading**: Load content only when needed
3. **Image Optimization**: Compress and optimize images
4. **Code Splitting**: Load modules on demand

---

**🎮 Ready to build with mathematical precision and retro love!** 