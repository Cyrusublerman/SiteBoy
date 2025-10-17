# 🖼️ Gallery Bundle Processor

A comprehensive Streamlit-based GUI application for processing media files and creating gallery bundles with normalized images, complete metadata, and web-ready outputs.

## ✨ Features

### 🎯 Core Functionality
- **Multi-format Support**: Images (JPG, PNG, WebP, GIF), Videos (MP4, MOV), Text Content (MD, HTML, TXT)
- **Automated Image Processing**: EXIF auto-rotation, sRGB conversion, multi-size output
- **Interactive UI**: Drag-and-drop file upload, slide reordering, real-time previews
- **Built-in Text Editor**: Create markdown, HTML, and plain text content directly in the app
- **Complete Metadata**: Bundle information, slide annotations, text analytics, accessibility features
- **Web-Ready Output**: Optimized file structure for web deployment

### 🖼️ Image Processing Pipeline
1. **EXIF Orientation**: Automatic rotation based on camera metadata
2. **Color Space**: Conversion to sRGB for web compatibility
3. **Multi-Size Generation**:
   - **Originals**: Normalized source files (95% JPEG quality)
   - **Web**: 2400px max dimension (85% JPEG quality)
   - **Thumbnails**: 800px max dimension (80% JPEG quality)

### 📋 Metadata Management
- **Bundle Metadata**: ID, title, summary, year, tags, license, status
- **Slide Metadata**: Individual titles, captions, alt text for accessibility
- **Video Options**: Muted and loop settings
- **JSON Manifest**: Complete structured metadata export

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

1. **Clone or download** this tool to your local machine
2. **Navigate** to the gallery-bundle-processor directory:
   ```bash
   cd gallery-bundle-processor
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Streamlit server**:
   ```bash
   streamlit run app.py
   ```

2. **Open your browser** to the displayed URL (typically `http://localhost:8501`)

3. **Begin processing** your media files!

## 📖 Usage Guide

### Step 1: Upload Files & Create Text Content
- Click **"Browse files"** or drag and drop files into the upload area
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.mp4`, `.mov`, `.md`, `.txt`, `.html`
- Multiple files can be uploaded simultaneously
- Use the **"Create Text Content"** section to write content directly in the app

### Step 2: Configure Bundle Metadata
Fill in the bundle information:
- **Bundle ID** *(required)*: Unique identifier for this bundle
- **Bundle Title** *(required)*: Display name for the gallery
- **Bundle Summary**: Optional description of the content
- **Year**: Creation year
- **Tags**: Comma-separated keywords
- **License**: Rights and usage terms
- **External URL**: Link to related content
- **Status**: Availability status

### Step 3: Annotate Slides
For each uploaded file:
- **Slide Title**: Individual slide name
- **Caption**: Descriptive text for the slide
- **Alt Text**: Accessibility description for screen readers
- **Video Options**: Muted and loop settings (for video files)

### Step 4: Arrange Slide Order
- Use **⬆️** and **⬇️** buttons to reorder slides
- Use **🗑️** button to remove unwanted slides
- Slide numbers update automatically

### Step 5: Process Bundle
- Click **"✅ Process and Save Bundle"**
- Monitor progress in real-time
- Review processing summary upon completion

## 📁 Output Structure

The tool generates a complete bundle in the `output/{Bundle ID}/` directory:

```
output/my-gallery-bundle/
├── manifest.json           # Complete metadata
├── originals/             # Normalized source files
│   ├── image001.jpg       # Auto-rotated, sRGB converted
│   ├── image002.jpg
│   └── video001.mp4       # Original video files
├── web/                   # Web-optimized images (2400px max)
│   ├── image001.jpg
│   └── image002.jpg
└── thumbs/                # Thumbnail images (800px max)
    ├── image001.jpg
    └── image002.jpg
```

## 📄 Manifest Format

The generated `manifest.json` contains:

```json
{
  "bundle_id": "my-gallery-bundle",
  "title": "My Gallery Bundle",
  "summary": "Description of the bundle",
  "year": "2024",
  "tags": ["art", "photography", "nature"],
  "license": "CC BY",
  "external_url": "https://example.com",
  "status": "Available",
  "slides": [
    {
      "title": "Slide Title",
      "caption": "Slide description",
      "alt": "Accessibility description",
      "filename": "image001",
      "type": "image",
      "original_name": "IMG_001.jpg",
      "original_size": [4000, 3000],
      "web_size": [2400, 1800],
      "thumb_size": [800, 600]
    }
  ]
}
```

## 🛠️ Technical Details

### Dependencies
- **Streamlit**: Web application framework
- **Pillow (PIL)**: Image processing library
- **Python Standard Library**: pathlib, json, os, shutil, typing

### Image Processing Features
- **EXIF Orientation**: Automatically rotates images based on camera metadata
- **Color Profile**: Converts all images to sRGB color space
- **Quality Optimization**: Different compression levels for different use cases
- **Aspect Ratio Preservation**: Maintains original proportions during resizing

### Performance Considerations
- **Progressive Processing**: Real-time progress updates
- **Memory Efficient**: Processes images individually to minimize memory usage
- **Error Handling**: Graceful handling of corrupted or unsupported files

## 🔧 Customization

### Modifying Image Sizes
Edit the `process_image()` function in `app.py`:
```python
# Change web size (currently 2400px)
web_image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)

# Change thumbnail size (currently 800px)  
thumb_image.thumbnail((800, 800), Image.Resampling.LANCZOS)
```

### Adding File Types
Extend the `type` list in the file uploader:
```python
uploaded_files = st.file_uploader(
    "Upload media files",
    type=['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'md', 'gif', 'tiff']  # Add new types
)
```

### Custom Output Directory
Modify the output path in the processing section:
```python
output_dir = Path("custom_output") / bundle_id  # Change "output" to your preferred directory
```

## 🐛 Troubleshooting

### Common Issues

**1. Import Error: No module named 'streamlit'**
```bash
pip install streamlit pillow
```

**2. Permission Error: Cannot create directory**
- Ensure you have write permissions in the current directory
- Try running from a different location

**3. Image Processing Error: Cannot identify image file**
- File may be corrupted or unsupported format
- Try converting the image with another tool first

**4. Memory Error: Image too large**
- Very large images (>100MP) may cause memory issues
- Consider resizing the source image before processing

### Performance Tips
- **Close other applications** when processing large batches
- **Process in smaller batches** for very large collections
- **Use SSD storage** for faster file I/O operations

## 📝 License

This tool is provided as-is for media processing tasks. Feel free to modify and adapt for your specific needs.

## 🤝 Contributing

Suggestions and improvements are welcome! Consider:
- Additional image formats
- Batch processing optimizations
- Custom metadata fields
- Integration with cloud storage
- Advanced image processing options

---

*Gallery Bundle Processor - Streamlining media preparation for web galleries*
