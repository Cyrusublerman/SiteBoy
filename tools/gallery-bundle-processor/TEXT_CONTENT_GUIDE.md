# 📝 Text Content Guide for Gallery Bundle Processor

## Overview

The Gallery Bundle Processor now includes comprehensive text content support, allowing you to include written content alongside your images and videos. This is perfect for artist statements, project descriptions, technical documentation, and narrative content.

## 🎯 **Text Content Types Supported**

### 1. **Markdown (.md)**
- **Best for**: Rich text with formatting, documentation, blog posts
- **Features**: Headers, bold, italic, links, lists, code blocks
- **Example Use Cases**:
  - Artist statements
  - Project descriptions
  - Technical documentation
  - Blog posts about the artwork

### 2. **HTML (.html)**
- **Best for**: Web content with custom styling
- **Features**: Full HTML markup, custom formatting
- **Example Use Cases**:
  - Styled content for web galleries
  - Interactive elements
  - Custom layouts

### 3. **Plain Text (.txt)**
- **Best for**: Simple text content, quotes, descriptions
- **Features**: No formatting, pure text content
- **Example Use Cases**:
  - Simple descriptions
  - Quotes or poetry
  - Technical specifications

## 🛠️ **How to Add Text Content**

### Method 1: Upload Existing Files
1. Click **"Browse files"** in the file uploader
2. Select your `.md`, `.txt`, or `.html` files
3. Files will appear in your bundle slides with text previews

### Method 2: Create Content In-App (Recommended)
1. Expand the **"✍️ Create New Text Content"** section
2. Enter a **title** for your content
3. Select the **content type** (Markdown, HTML, or Plain Text)
4. Write your content in the text area
5. See a **live preview** on the right
6. Click **"📄 Add Text Content to Bundle"**

## 📋 **Text Content Features**

### Real-Time Preview
- **Markdown**: Rendered preview showing formatting
- **HTML**: Code syntax highlighting
- **Plain Text**: Simple text display

### Text Analytics
When processed, text files include metadata:
- **Character count**: Total characters including spaces
- **Word count**: Number of words
- **Line count**: Number of lines
- **Content type**: File extension (md, txt, html)

### Integration with Bundle
- Text content appears as slides alongside images/videos
- Can be reordered with other content
- Includes standard slide metadata (title, caption, alt text)

## 💡 **Content Ideas for Art Bundles**

### Artist Statements
```markdown
# Artist Statement

This series explores the intersection of **digital technology** and *natural forms*. 

Through the use of:
- Algorithmic generation
- Hand-painted textures
- Found materials

I aim to question our relationship with artificial intelligence...
```

### Technical Documentation
```markdown
# Technical Process

## Materials Used
- Canvas: 24" x 36" stretched cotton
- Paint: Acrylic with metallic additives
- Tools: Custom-built plotter, brushes

## Process
1. Generate initial composition using custom algorithm
2. Transfer to canvas using plotter
3. Hand-paint selected areas
4. Apply final protective coating
```

### Project Descriptions
```html
<h1>The Digital Garden Series</h1>
<p>A collection of <strong>12 unique pieces</strong> exploring themes of:</p>
<ul>
    <li>Growth and decay in digital spaces</li>
    <li>The permanence of virtual art</li>
    <li>Human connection through technology</li>
</ul>
<p><em>Created during the pandemic years 2020-2022</em></p>
```

### Simple Descriptions
```text
This piece was inspired by morning walks through the city during lockdown. The empty streets became a canvas for light and shadow, captured here in digital form.

Dimensions: 3840 x 2160 pixels
Created: March 2021
Edition: 1/1
```

## 🎨 **SiteBoy Theme Integration**

The text content editor and previews are styled to match your site's VGA/mono aesthetic:
- **Space Mono font** for all text
- **VGA color palette** (black/silver/gray)
- **Monospace code blocks** for HTML preview
- **Uppercase labels** and buttons
- **Bordered containers** matching your site design

## 📊 **Metadata Output Example**

Text content in your manifest.json will include:

```json
{
  "title": "Artist Statement",
  "caption": "Personal thoughts on the work",
  "alt": "Text document describing artistic process",
  "filename": "artist_statement",
  "type": "text",
  "original_name": "artist_statement.md",
  "content_type": "md",
  "character_count": 1247,
  "word_count": 198,
  "line_count": 15
}
```

## 🔄 **Workflow Suggestions**

### For Art Portfolios:
1. Upload your images
2. Create an artist statement (Markdown)
3. Add individual piece descriptions (Plain text)
4. Include technical specs (HTML for formatting)

### For Project Documentation:
1. Upload process photos/videos
2. Create project overview (Markdown with headers)
3. Add detailed technical notes (HTML)
4. Include quotes or inspiration (Plain text)

### For Exhibitions:
1. Upload artwork images
2. Create exhibition text (Markdown)
3. Add individual artwork labels (Plain text)
4. Include curator statement (HTML)

## 💾 **File Organization**

All text files are saved to the `originals/` folder alongside your images and videos:

```
output/my-art-bundle/
├── manifest.json
├── originals/
│   ├── artwork_01.jpg
│   ├── artist_statement.md      ← Text content here
│   ├── process_notes.txt        ← Text content here
│   └── exhibition_info.html     ← Text content here
├── web/
│   └── artwork_01.jpg
└── thumbs/
    └── artwork_01.jpg
```

## 🚀 **Best Practices**

1. **Use descriptive titles** for easy identification
2. **Choose the right format**:
   - Markdown for formatted text
   - HTML for custom styling
   - Plain text for simple content
3. **Include text in your slide order** - position text content strategically among images
4. **Use the preview feature** to ensure formatting looks correct
5. **Add meaningful captions and alt text** for text slides

---

*The Gallery Bundle Processor now provides a complete solution for mixed-media bundles, combining visual and textual content in a single, organized package.*
