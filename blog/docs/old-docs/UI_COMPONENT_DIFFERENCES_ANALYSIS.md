# UI Component Differences: Old Build vs Current SiteBoy Framework

## Overview

This analysis compares the specific UI components between the old build (`project.000710402`) and the current SiteBoy Framework, focusing on how each component type works, looks, and behaves differently.

## Table of Contents (TOC) Components

### Old Build TOC - Content Processor System
```javascript
// Generated HTML structure with inline styles
generateTableOfContents() {
    // Mathematical layout calculations
    const layout = LayoutStructure.computeLayout(window.innerWidth, window.innerHeight);
    
    // Generated structure:
    tocItems += `
        <div class="toc-item" data-module="${module.originalIndex}" style="
            width: ${rowWidth}px;
            height: ${numberBoxSize}px;
            cursor: pointer;
            display: flex;
            border: var(--outline-width) solid var(--c-border);
        ">
            <div class="toc-number" style="
                width: ${numberBoxSize}px;
                height: ${numberBoxSize}px;
                background: var(--c-border);
                color: var(--c-bg);
                font-size: 18px;
            ">${String(itemIndex).padStart(2, '0')}</div>
            
            <div class="toc-content" style="
                width: ${textWidth}px;
                padding: 12px 24px;
                border-left: var(--outline-width) solid var(--c-border);
            ">
                <div style="margin: 0 0 4px 0;">${module.title}</div>
                <div style="opacity: 0.7;">${category}/${module.id}.md</div>
            </div>
            
            <div class="toc-arrow" style="
                width: ${arrowWidth}px;
                border-left: var(--outline-width) solid var(--c-border);
            ">→</div>
        </div>`;
}
```

**Characteristics:**
- **Numbered List**: Sequential numbering (01, 02, 03...)
- **File References**: Shows actual file paths (`music/chord.md`)
- **Three-Column Layout**: Number box + content + arrow
- **Category Headers**: Visual separation by content category
- **Inline Styling**: Heavy use of inline styles for precise control
- **Dynamic Sizing**: Recalculates dimensions on resize

### Current Build TOC - HierarchicalTOC Component
```javascript
export class HierarchicalTOC extends BaseComponent {
    createSectionElement(section, index, dimensions) {
        const sectionElement = this.createElement('div', 'toc-section-header');
        sectionElement.innerHTML = `
            <div class="toc-bullet">${String(index).padStart(2, '0')}</div>
            <div class="toc-content">
                <div class="toc-title">${section.title}</div>
                <div class="toc-description">${section.description}</div>
            </div>
            <div class="toc-arrow">${section.isExpanded ? '−' : '+'}</div>
        `;
        
        // CSS-based styling via classes
        sectionElement.style.cssText = `
            width: ${dimensions.rowWidth}px;
            height: ${dimensions.headerHeight}px;
        `;
    }
    
    createSubsectionElement(subsection, dimensions) {
        // Indented subsection items
        const subsectionElement = this.createElement('div', 'toc-subsection');
        subsectionElement.innerHTML = `
            <div class="toc-bullet">→</div>
            <div class="toc-content">
                <div class="toc-title">${subsection.title}</div>
            </div>
        `;
    }
}
```

**Characteristics:**
- **Hierarchical Structure**: Expandable sections with subsections
- **Plus/Minus Toggles**: `+` to expand, `−` to collapse
- **Component-Based**: Clean BaseComponent inheritance
- **CSS Classes**: Styling via CSS classes instead of inline styles
- **Mathematical Foundation**: F=12px based dimensions
- **Interactive Collapsing**: Sections can be expanded/collapsed

**Key Differences:**
| Aspect | Old Build | Current Build |
|--------|-----------|---------------|
| **Structure** | Flat numbered list | Hierarchical collapsible |
| **Navigation** | Direct content links | Section/subsection organization |
| **Styling** | Inline styles | CSS classes |
| **Content** | File-based references | Abstract section structure |
| **Interaction** | Click to navigate | Click to expand/collapse |

## Grid Components

### Old Build - Grid Caption System
```css
.grid-caption {
    display: flex;
    align-items: center;
    height: var(--header-height);  /* 30px */
    background: var(--c-bg);
    color: var(--c-text);
    transition: background-color 0.15s ease, color 0.15s ease;
}

.caption-text {
    flex: 1;
    padding: 0 12px;
    font-size: 11px;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.caption-icon {
    width: var(--header-height);  /* 30px square */
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
```

**HTML Structure:**
```html
<div class="grid-caption">
    <span class="caption-text">Art</span>
    <div class="caption-icon square-button">&gt;</div>
</div>
```

### Current Build - Grid Component
```css
.grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols, 4), 1fr);
    gap: 1px;
    width: 100%;
}

.grid-item {
    border: 1px solid var(--c-border);
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    text-align: center;
    min-height: calc(var(--f) * 3);  /* F=12px * 3 = 36px */
}

.grid-item.clickable:hover {
    border-color: var(--c-text);
    z-index: 2;
}
```

**Component Usage:**
```javascript
const grid = new ComponentLibrary.Grid({
    items: ['Grid Item 1', 'Grid Item 2', 'Grid Item 3', 'Grid Item 4'],
    cols: 2,
    onItemClick: (item, index) => console.log('Clicked:', item)
}, { MF: window.MathematicalFoundation });
```

**Key Differences:**
| Aspect | Old Build | Current Build |
|--------|-----------|---------------|
| **Layout** | Flexbox with text + icon | CSS Grid with uniform items |
| **Purpose** | Navigation/caption display | Data grid display |
| **Sizing** | Fixed 30px height | Mathematical F-based sizing |
| **Content** | Text + arrow icon | Generic grid items |
| **Behavior** | Caption-style navigation | Grid-style data display |

## Header Components

### Old Build - Fixed HTML Header
```html
<header id="header">
    <div class="header-left">
        <div class="header-item" id="home-link">AEINODER</div>
    </div>
    <div class="header-right">
        <div id="header-nav" class="header-item">
            <span>SECTIONS</span>
            <span id="menu-symbol">+</span>
        </div>
        <div id="header-toggle" class="header-item square-button">☼</div>
    </div>
</header>
```

```css
#header {
    position: fixed;
    top: 64px;  /* Below curtain */
    border: var(--outline-width) solid var(--c-border);
    display: flex;
}

.header-left {
    display: flex;
    position: relative;
    flex-shrink: 0;
}

.header-item {
    padding: 0 12px;
    font-size: 13px;
    text-transform: uppercase;
    transition: background-color 0.2s ease, color 0.2s ease;
}
```

### Current Build - PageHeader Component
```javascript
export class PageHeader extends BaseComponent {
    render() {
        // Mathematical Foundation calculations
        const F = this.deps.MF ? this.deps.MF.F : 12;
        const layout = this.deps.MF ? this.deps.MF.computeLayout() : {};
        
        this.element = this.createElement('div', 'page-header');
        this.element.style.cssText = `
            position: fixed;
            top: var(--target-margin);
            left: var(--target-margin);
            width: var(--grid-width);
            height: calc(${F}px * 2);  /* F=12px * 2 = 24px */
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            display: flex;
            z-index: 90;
        `;
        
        // Left side (50%)
        const leftSide = this.createElement('div', 'header-left');
        leftSide.style.cssText = `
            width: 50%;
            height: 100%;
            border-right: 1px solid var(--c-border);
        `;
        
        // Right side navigation (50%)
        const rightSide = this.createElement('div', 'header-right');
        rightSide.style.cssText = `
            width: 50%;
            height: 100%;
            display: flex;
        `;
    }
}
```

**Key Differences:**
| Aspect | Old Build | Current Build |
|--------|-----------|---------------|
| **Height** | 30px (arbitrary) | 24px (F*2 mathematical) |
| **Position** | `top: 64px` (below curtain) | `top: var(--target-margin)` |
| **Structure** | Static HTML elements | Dynamic component rendering |
| **Layout** | Flexible left + expanding right | Precise 50/50 split |
| **Font Size** | 13px | 12px (F-based) |
| **Branding** | "AEINODER" | "SITEBOY" |

## Footer Components

### Old Build - Fixed HTML Footer
```html
<footer id="footer">
    <div class="footer-item" id="back-to-top">↑ TOP</div>
    <a href="https://instagram.com" class="footer-item">INSTAGRAM</a>
    <a href="mailto:contact@example.com" class="footer-item">CONTACT</a>
    <div id="footer-toggle" class="footer-item">◐</div>
</footer>
```

```css
#footer {
    border: var(--outline-width) solid var(--c-border);
    display: flex;
    background: var(--c-bg);
    margin-top: auto;
}

.footer-item {
    flex: 1;
    padding: 0 12px;
    font-size: 13px;
    text-transform: uppercase;
    transition: background-color 0.2s ease;
}

.footer-item:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    width: var(--outline-width);
    background: var(--c-border);
}
```

### Current Build - PageFooter Component
```javascript
export class PageFooter extends BaseComponent {
    render() {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        this.element = this.createElement('div', 'page-footer');
        this.element.style.cssText = `
            position: fixed;
            bottom: var(--target-margin);
            left: var(--target-margin);
            width: var(--grid-width);
            height: calc(${F}px * 2);
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            display: flex;
            z-index: 90;
        `;
        
        const footerItems = ['GITHUB', 'EMAIL', 'RSS'];
        footerItems.forEach((item, index) => {
            const footerItem = this.createElement('div', 'footer-item');
            footerItem.style.cssText = `
                flex: 1;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                border-right: ${index < footerItems.length - 1 ? '1px solid var(--c-border)' : 'none'};
                text-transform: uppercase;
                font-size: ${F}px;
            `;
            footerItem.textContent = item;
            this.element.appendChild(footerItem);
        });
    }
}
```

**Key Differences:**
| Aspect | Old Build | Current Build |
|--------|-----------|---------------|
| **Content** | ↑ TOP, INSTAGRAM, CONTACT, ◐ | GITHUB, EMAIL, RSS |
| **Height** | Variable (based on content) | 24px (F*2 mathematical) |
| **Font Size** | 13px | 12px (F-based) |
| **Positioning** | `margin-top: auto` | `position: fixed; bottom: var(--target-margin)` |
| **Border Style** | CSS pseudo-elements | Inline border styling |

## Subheader Components

### Old Build - Markdown Header
```html
<div class="markdown-header" id="subheader">
    <div class="markdown-title" id="section-title">
        <span>SECTION</span>
        <span id="module-symbol">+</span>
        <nav id="module-dropdown" class="hidden">
            <!-- Section-specific navigation -->
        </nav>
    </div>
    <div class="markdown-nav">
        <div class="nav-button">← PREV</div>
        <div class="nav-button">NEXT →</div>
    </div>
</div>
```

```css
.markdown-header {
    border-bottom: var(--outline-width) solid var(--c-border);
    height: var(--header-height);  /* 30px */
    display: flex;
    align-items: stretch;
}

.markdown-title {
    padding: 0 12px;
    font-size: 11px;
    text-transform: uppercase;
    position: relative;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.markdown-nav {
    display: flex;
    border-left: var(--outline-width) solid var(--c-border);
}

.nav-button {
    width: 50%;
    height: var(--header-height);
    font-size: 11px;
    cursor: pointer;
    border-right: var(--outline-width) solid var(--c-border);
}
```

### Current Build - Subheader Component
```javascript
export class Subheader extends BaseComponent {
    render() {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        this.element = this.createElement('div', 'subheader');
        this.element.style.cssText = `
            position: fixed;
            top: calc(var(--target-margin) + ${F * 2}px);
            left: var(--target-margin);
            width: var(--grid-width);
            height: ${F * 2}px;
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            border-top: none;
            display: flex;
            z-index: 85;
        `;
        
        // Title section (50%)
        const titleSection = this.createElement('div', 'subheader-title');
        titleSection.style.cssText = `
            width: 50%;
            height: 100%;
            border-right: 1px solid var(--c-border);
            display: flex;
            align-items: center;
            padding: 0 ${F}px;
            text-transform: uppercase;
            font-size: ${F}px;
        `;
        
        // Navigation section (50%)
        const navSection = this.createElement('div', 'subheader-nav');
        navSection.style.cssText = `
            width: 50%;
            height: 100%;
            display: flex;
        `;
        
        // Prev/Next buttons
        ['← PREV', 'NEXT →'].forEach((text, index) => {
            const button = this.createElement('div', 'nav-button');
            button.style.cssText = `
                flex: 1;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                border-right: ${index === 0 ? '1px solid var(--c-border)' : 'none'};
                font-size: ${F}px;
                text-transform: uppercase;
                cursor: pointer;
            `;
            button.textContent = text;
            navSection.appendChild(button);
        });
    }
}
```

**Key Differences:**
| Aspect | Old Build | Current Build |
|--------|-----------|---------------|
| **Name** | "markdown-header" | "subheader" |
| **Height** | 30px | 24px (F*2) |
| **Font Size** | 11px | 12px (F-based) |
| **Position** | Relative within content | Fixed positioning |
| **Dropdown** | Module-specific dropdown | Navigation-focused |
| **Structure** | Flexible title + nav section | Precise 50/50 split |

## Markdown Elements

### Old Build - Rich Markdown Styling
```css
.markdown-body {
    padding: 48px;
    line-height: 1.8;
    font-size: 14px;
    min-height: calc(100vh - 300px);
}

.markdown-body h1 {
    font-size: 24px;
    letter-spacing: 0.1em;
    padding-bottom: 12px;
    border-bottom: var(--outline-width) solid var(--c-border);
    margin-bottom: 32px;
}

.markdown-body h2 {
    font-size: 18px;
    letter-spacing: 0.05em;
    margin-top: 64px;
}

.markdown-body h3 {
    font-size: 14px;
    letter-spacing: 0.05em;
}

.markdown-body p {
    margin-bottom: 24px;
}

.markdown-body code {
    background: var(--c-border);
    color: var(--c-bg);
    padding: 2px 6px;
    font-family: 'Syne Mono', monospace;
    font-size: 13px;
}

.markdown-body blockquote {
    border-left: 2px solid var(--c-border);
    padding-left: 24px;
    margin: 32px 0;
    font-style: italic;
    color: var(--c-border);
}
```

### Current Build - MarkdownBody Component
```javascript
export class MarkdownBody extends BaseComponent {
    parseMarkdown(markdown) {
        if (typeof marked !== 'undefined') {
            return marked.parse(markdown, {
                breaks: true,
                gfm: true
            });
        } else {
            return this.basicMarkdownParse(markdown);
        }
    }
    
    basicMarkdownParse(markdown) {
        let html = markdown;
        
        // Headers (H1-H6) - Mathematical sizing
        html = html.replace(/^#{6} (.*$)/gim, '<h6>$1</h6>');
        html = html.replace(/^#{5} (.*$)/gim, '<h5>$1</h5>');
        html = html.replace(/^#{4} (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^#{3} (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^#{2} (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^#{1} (.*$)/gim, '<h1>$1</h1>');
        
        // Bold, italic, code
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
        html = html.replace(/`([^`]*)`/gim, '<code>$1</code>');
        
        // Paragraphs
        html = html.replace(/\n\n/gim, '</p><p>');
        html = '<p>' + html + '</p>';
        
        return html;
    }
}
```

**CSS (Current Build):**
```css
/* F=12px Typography System */
h1 { font-size: calc(var(--f) * 2); }   /* 24px */
h2 { font-size: calc(var(--f) * 1.5); } /* 18px */
h3 { font-size: var(--f); }             /* 12px */
h4 { font-size: var(--f); }             /* 12px */
h5 { font-size: var(--f); }             /* 12px */
h6 { font-size: var(--f); }             /* 12px */

p {
    font-size: var(--f);
    line-height: 1.5;
    margin: 0 0 var(--f) 0;
}

code {
    font-family: 'Space Mono', monospace;
    font-size: var(--f);
    background: var(--c-border);
    color: var(--c-bg);
    padding: calc(var(--f) / 4) calc(var(--f) / 2);
}

blockquote {
    border-left: 2px solid var(--c-border);
    margin: var(--f) 0;
    padding-left: var(--f);
    font-style: italic;
}
```

**Key Differences:**
| Aspect | Old Build | Current Build |
|--------|-----------|---------------|
| **Font** | Syne Mono | Space Mono |
| **Base Size** | 14px | 12px (F-based) |
| **Line Height** | 1.8 (generous) | 1.5 (compact) |
| **H1 Size** | 24px | 24px (calc(F*2)) |
| **H3 Size** | 14px | 12px (F) |
| **Margins** | Mixed (24px, 32px, 48px) | F-based (12px multiples) |
| **Padding** | 48px container | F-based spacing |
| **Processing** | Marked.js + file loading | Component-based parsing |
| **Code Font Size** | 13px | 12px (F) |

## Summary of Key UI Philosophy Differences

### Old Build: **"Content-Optimized Usability"**
- **Larger text** (14px) for better readability
- **Generous spacing** (48px padding, 1.8 line-height)
- **Static HTML structure** with CSS styling
- **File-based content** system
- **Mixed sizing** optimized for visual hierarchy
- **Smooth transitions** (0.2s)

### Current Build: **"Mathematical Component System"**
- **F=12px foundation** for all sizing
- **Compact spacing** (F-based multiples)
- **Component-based architecture** 
- **JSON-driven content** system
- **Strict mathematical relationships**
- **Fast transitions** (0.1s)

The old build prioritized readability and content consumption, while the current build prioritizes systematic consistency and component reusability. Both approaches serve different goals effectively.
