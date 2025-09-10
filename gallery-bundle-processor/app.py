#!/usr/bin/env python3
"""
Gallery Bundle Processor - A Streamlit GUI for processing media bundles
Creates normalized image files and metadata for web galleries
"""

import streamlit as st
import json
import os
from pathlib import Path
from PIL import Image, ImageOps
import shutil
from typing import List, Dict, Any

# Page configuration
st.set_page_config(
    page_title="Gallery Bundle Processor",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Load custom SiteBoy theme
def load_siteboy_theme():
    with open("siteboy-theme.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

try:
    load_siteboy_theme()
except FileNotFoundError:
    st.warning("SiteBoy theme file not found. Using default Streamlit theme.")

# Initialize session state
if 'slides' not in st.session_state:
    st.session_state.slides = []

def process_image(image_file, output_dir: Path, filename_base: str, is_gif: bool = False) -> Dict[str, Any]:
    """Process an image file through all required stages"""
    try:
        # Open and process the image
        image = Image.open(image_file)
        
        # Create output directories
        originals_dir = output_dir / "originals"
        web_dir = output_dir / "web"
        thumbs_dir = output_dir / "thumbs"
        
        for dir_path in [originals_dir, web_dir, thumbs_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
        
        if is_gif:
            # Special handling for GIF files
            # Save original GIF as-is to preserve animation
            original_path = originals_dir / f"{filename_base}.gif"
            image_file.seek(0)  # Reset file pointer
            with open(original_path, 'wb') as f:
                f.write(image_file.read())
            
            # For web and thumb versions, use the first frame as static image
            first_frame = image.copy()
            if first_frame.mode != 'RGB':
                # Handle transparency in GIFs by compositing over white background
                if 'transparency' in first_frame.info:
                    first_frame = first_frame.convert('RGBA')
                    white_bg = Image.new('RGB', first_frame.size, (255, 255, 255))
                    first_frame = Image.alpha_composite(white_bg.convert('RGBA'), first_frame).convert('RGB')
                else:
                    first_frame = first_frame.convert('RGB')
            
            # Create web version (2400px max dimension) as JPEG
            web_image = first_frame.copy()
            web_image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
            web_path = web_dir / f"{filename_base}.jpg"
            web_image.save(web_path, "JPEG", quality=85, optimize=True)
            
            # Create thumbnail (800px max dimension) as JPEG
            thumb_image = first_frame.copy()
            thumb_image.thumbnail((800, 800), Image.Resampling.LANCZOS)
            thumb_path = thumbs_dir / f"{filename_base}.jpg"
            thumb_image.save(thumb_path, "JPEG", quality=80, optimize=True)
            
            return {
                "success": True,
                "original_size": image.size,
                "web_size": web_image.size,
                "thumb_size": thumb_image.size,
                "is_animated": getattr(image, 'is_animated', False),
                "frame_count": getattr(image, 'n_frames', 1)
            }
        else:
            # Standard image processing for non-GIF files
            # Apply EXIF orientation (auto-rotation)
            image = ImageOps.exif_transpose(image)
            
            # Convert to sRGB
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Save normalized original
            original_path = originals_dir / f"{filename_base}.jpg"
            image.save(original_path, "JPEG", quality=95, optimize=True)
            
            # Create web version (2400px max dimension)
            web_image = image.copy()
            web_image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
            web_path = web_dir / f"{filename_base}.jpg"
            web_image.save(web_path, "JPEG", quality=85, optimize=True)
            
            # Create thumbnail (800px max dimension)
            thumb_image = image.copy()
            thumb_image.thumbnail((800, 800), Image.Resampling.LANCZOS)
            thumb_path = thumbs_dir / f"{filename_base}.jpg"
            thumb_image.save(thumb_path, "JPEG", quality=80, optimize=True)
            
            return {
                "success": True,
                "original_size": image.size,
                "web_size": web_image.size,
                "thumb_size": thumb_image.size
            }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def copy_other_file(file_obj, output_dir: Path, filename: str) -> Dict[str, Any]:
    """Copy non-image files to the originals directory"""
    try:
        originals_dir = output_dir / "originals"
        originals_dir.mkdir(parents=True, exist_ok=True)
        
        output_path = originals_dir / filename
        with open(output_path, "wb") as f:
            f.write(file_obj.getvalue())
        
        return {"success": True, "path": str(output_path)}
    except Exception as e:
        return {"success": False, "error": str(e)}

def create_manifest(bundle_data: Dict[str, Any], slides_data: List[Dict[str, Any]], output_dir: Path) -> bool:
    """Create the manifest.json file"""
    try:
        manifest = {
            "bundle_id": bundle_data["bundle_id"],
            "title": bundle_data["title"],
            "summary": bundle_data.get("summary", ""),
            "year": bundle_data.get("year", ""),
            "tags": [tag.strip() for tag in bundle_data.get("tags", "").split(",") if tag.strip()],
            "license": bundle_data.get("license", "All Rights Reserved"),
            "external_url": bundle_data.get("external_url", ""),
            "status": bundle_data.get("status", "Available"),
            "slides": slides_data
        }
        
        manifest_path = output_dir / "manifest.json"
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        st.error(f"Error creating manifest: {e}")
        return False

# Main UI - SiteBoy Style
st.markdown("# 🖼️ GALLERY BUNDLE PROCESSOR")
st.markdown("**PROCESS IMAGES AND CREATE GALLERY BUNDLES WITH NORMALIZED SIZES AND METADATA**")
st.markdown("---")

# File uploader
uploaded_files = st.file_uploader(
    "Upload media files (images, videos, text content)",
    type=['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'md', 'txt', 'html'],
    accept_multiple_files=True,
    help="Select images, videos, GIF animations, markdown, text, and HTML files to include in your gallery bundle"
)

# Text Content Creator
st.subheader("📝 CREATE TEXT CONTENT")

with st.expander("✍️ CREATE NEW TEXT CONTENT", expanded=False):
    col1, col2 = st.columns([2, 1])
    
    with col1:
        text_title = st.text_input("Text Content Title", placeholder="e.g., 'Artist Statement'")
        content_type = st.selectbox("Content Type", ["Markdown (.md)", "Plain Text (.txt)", "HTML (.html)"])
        text_content = st.text_area(
            "Content", 
            height=200,
            placeholder="Write your content here...\n\nFor Markdown: Use **bold**, *italic*, # headers, etc.\nFor HTML: Use <p>, <h1>, <em>, etc.\nFor Plain Text: Just write normally.",
            help="Enter your text content. Formatting depends on the content type selected above."
        )
    
    with col2:
        st.markdown("**Preview:**")
        if text_content:
            if content_type.startswith("Markdown"):
                try:
                    st.markdown(text_content)
                except:
                    st.text(text_content)
            elif content_type.startswith("HTML"):
                try:
                    st.markdown(f"```html\n{text_content}\n```")
                except:
                    st.text(text_content)
            else:
                st.text(text_content)
        else:
            st.info("Content preview will appear here")
    
    if st.button("📄 Add Text Content to Bundle"):
        if text_title and text_content:
            # Determine file extension
            if content_type.startswith("Markdown"):
                ext = ".md"
            elif content_type.startswith("HTML"):
                ext = ".html"
            else:
                ext = ".txt"
            
            # Create a virtual file object
            import io
            virtual_file = io.BytesIO(text_content.encode('utf-8'))
            virtual_file.name = f"{text_title.replace(' ', '_').lower()}{ext}"
            virtual_file.type = "text/plain"
            
            # Add to session state
            if virtual_file.name not in {slide['file'].name for slide in st.session_state.slides}:
                st.session_state.slides.append({
                    'file': virtual_file,
                    'name': virtual_file.name,
                    'type': 'text'
                })
                st.success(f"✅ Added '{text_title}' to bundle!")
                st.rerun()
            else:
                st.warning("⚠️ A file with this name already exists!")
        else:
            st.error("❌ Please provide both title and content!")

st.markdown("---")

# Add new files to session state (avoid duplicates)
if uploaded_files:
    existing_names = {slide['file'].name for slide in st.session_state.slides}
    for file in uploaded_files:
        if file.name not in existing_names:
            # Better file type detection
            if file.type.startswith("image/"):
                file_type = "image"
            elif file.type.startswith("video/"):
                file_type = "video"
            elif file.name.lower().endswith(('.md', '.txt', '.html')):
                file_type = "text"
            else:
                file_type = "document"
            
            st.session_state.slides.append({
                'file': file,
                'name': file.name,
                'type': file_type
            })

# Main form
with st.form(key='bundle_form'):
    st.subheader("📋 Bundle Metadata")
    
    # Bundle metadata inputs in columns
    col1, col2 = st.columns(2)
    
    with col1:
        bundle_id = st.text_input("Bundle ID *", help="Unique identifier for this bundle")
        bundle_title = st.text_input("Bundle Title *", help="Display title for the bundle")
        bundle_summary = st.text_area("Bundle Summary", help="Optional description of the bundle")
        year = st.text_input("Year", help="Year the content was created")
    
    with col2:
        tags = st.text_input("Tags (comma-separated)", help="Keywords describing the bundle content")
        license_option = st.selectbox("License", ["All Rights Reserved", "CC BY", "CC BY-SA", "CC BY-NC", "CC BY-NC-SA"])
        external_url = st.text_input("External URL", help="Optional link to external content")
        status = st.selectbox("Status", ["Available", "Sold", "Not for Sale"])
    
    # Slide display and annotation
    st.subheader("🎬 Bundle Slides")
    
    if not st.session_state.slides:
        st.info("👆 Upload files above to begin configuring your bundle slides")
    else:
        st.markdown(f"**{len(st.session_state.slides)} slides** configured")
        
        for idx, slide in enumerate(st.session_state.slides):
            with st.container(border=True):
                col1, col2, col3 = st.columns([2, 3, 1])
                
                with col1:
                    # Display media preview
                    if slide['type'] == 'image':
                        try:
                            st.image(slide['file'], width=200)
                        except:
                            st.error("Unable to display image preview")
                    elif slide['type'] == 'video':
                        try:
                            st.video(slide['file'])
                        except:
                            st.error("Unable to display video preview")
                    elif slide['type'] == 'text':
                        try:
                            # Preview text content
                            slide['file'].seek(0)
                            content = slide['file'].read().decode('utf-8')
                            preview = content[:200] + "..." if len(content) > 200 else content
                            
                            # Style based on file type
                            if slide['name'].lower().endswith('.md'):
                                st.markdown(f"**📝 MARKDOWN:**\n```\n{preview}\n```")
                            elif slide['name'].lower().endswith('.html'):
                                st.markdown(f"**🌐 HTML:**\n```html\n{preview}\n```")
                            else:
                                st.markdown(f"**📄 TEXT:**\n```\n{preview}\n```")
                        except:
                            st.error("Unable to preview text content")
                    else:
                        st.text(f"📄 {slide['name']}")
                    
                    st.caption(f"**{slide['name']}** ({slide['type']})")
                
                with col2:
                    # Slide metadata inputs
                    st.text_input("Slide Title", key=f"slide_title_{idx}", 
                                help="Title for this slide")
                    st.text_area("Caption", key=f"caption_{idx}", 
                               help="Description or caption for this slide")
                    st.text_area("Alt Text (for accessibility)", key=f"alt_{idx}", 
                               help="Alternative text describing the visual content")
                    
                    # Video-specific options
                    if slide['type'] == 'video':
                        col2a, col2b = st.columns(2)
                        with col2a:
                            st.checkbox("Muted", key=f"muted_{idx}")
                        with col2b:
                            st.checkbox("Loop", key=f"loop_{idx}")
                
                with col3:
                    # Order display only (buttons moved outside form)
                    st.markdown("**Order**")
                    st.text(f"#{idx + 1}")
                    st.markdown("*Use buttons below to reorder*")
    
    # Main processing button
    st.markdown("---")
    process_button = st.form_submit_button("✅ Process and Save Bundle", type="primary")

# Slide Management (Outside Form)
if st.session_state.slides:
    st.subheader("🔄 SLIDE MANAGEMENT")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("**Move Slides:**")
        selected_slide = st.selectbox(
            "Select slide to move:",
            options=list(range(len(st.session_state.slides))),
            format_func=lambda x: f"#{x+1}: {st.session_state.slides[x]['name']}"
        )
    
    with col2:
        st.markdown("**Actions:**")
        col2a, col2b = st.columns(2)
        with col2a:
            if st.button("⬆️ Move Up") and selected_slide > 0:
                # Swap with previous slide
                st.session_state.slides[selected_slide], st.session_state.slides[selected_slide-1] = \
                    st.session_state.slides[selected_slide-1], st.session_state.slides[selected_slide]
                st.rerun()
        with col2b:
            if st.button("⬇️ Move Down") and selected_slide < len(st.session_state.slides) - 1:
                # Swap with next slide
                st.session_state.slides[selected_slide], st.session_state.slides[selected_slide+1] = \
                    st.session_state.slides[selected_slide+1], st.session_state.slides[selected_slide]
                st.rerun()
    
    with col3:
        st.markdown("**Remove:**")
        if st.button("🗑️ Remove Selected"):
            if len(st.session_state.slides) > 1:
                st.session_state.slides.pop(selected_slide)
                st.success(f"Removed slide #{selected_slide + 1}")
                st.rerun()
            else:
                st.error("Cannot remove the last slide!")
    
    st.markdown("---")

# Process the bundle when button is clicked
if process_button:
    if not bundle_id or not bundle_title:
        st.error("❌ Bundle ID and Title are required!")
    elif not st.session_state.slides:
        st.error("❌ Please upload at least one file!")
    else:
        # Create output directory
        output_dir = Path("output") / bundle_id
        
        try:
            # Remove existing directory if it exists
            if output_dir.exists():
                shutil.rmtree(output_dir)
            
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Process files and collect slide data
            slides_data = []
            processing_progress = st.progress(0)
            status_text = st.empty()
            
            for idx, slide in enumerate(st.session_state.slides):
                status_text.text(f"Processing {slide['name']}...")
                
                # Get slide metadata from form
                slide_title = st.session_state.get(f"slide_title_{idx}", "")
                caption = st.session_state.get(f"caption_{idx}", "")
                alt_text = st.session_state.get(f"alt_{idx}", "")
                
                # Create base filename without extension
                filename_base = Path(slide['name']).stem
                
                slide_data = {
                    "title": slide_title,
                    "caption": caption,
                    "alt": alt_text,
                    "filename": filename_base,
                    "type": slide['type'],
                    "original_name": slide['name']
                }
                
                # Process based on file type
                if slide['type'] == 'image':
                    # Check if it's a GIF file
                    is_gif = slide['name'].lower().endswith('.gif')
                    result = process_image(slide['file'], output_dir, filename_base, is_gif=is_gif)
                    if result['success']:
                        slide_data.update({
                            "original_size": result['original_size'],
                            "web_size": result['web_size'],
                            "thumb_size": result['thumb_size']
                        })
                        # Add GIF-specific metadata if applicable
                        if is_gif and 'is_animated' in result:
                            slide_data.update({
                                "is_animated": result['is_animated'],
                                "frame_count": result['frame_count']
                            })
                    else:
                        st.error(f"Error processing {slide['name']}: {result['error']}")
                        continue
                        
                elif slide['type'] == 'video':
                    result = copy_other_file(slide['file'], output_dir, slide['name'])
                    if result['success']:
                        # Add video-specific metadata
                        slide_data.update({
                            "muted": st.session_state.get(f"muted_{idx}", False),
                            "loop": st.session_state.get(f"loop_{idx}", False)
                        })
                    else:
                        st.error(f"Error copying {slide['name']}: {result['error']}")
                        continue
                        
                elif slide['type'] == 'text':
                    result = copy_other_file(slide['file'], output_dir, slide['name'])
                    if result['success']:
                        # Add text-specific metadata
                        try:
                            slide['file'].seek(0)
                            content = slide['file'].read().decode('utf-8')
                            slide_data.update({
                                "content_type": slide['name'].split('.')[-1].lower(),
                                "character_count": len(content),
                                "word_count": len(content.split()),
                                "line_count": len(content.splitlines())
                            })
                        except:
                            pass
                    else:
                        st.error(f"Error copying {slide['name']}: {result['error']}")
                        continue
                        
                else:  # other document types
                    result = copy_other_file(slide['file'], output_dir, slide['name'])
                    if not result['success']:
                        st.error(f"Error copying {slide['name']}: {result['error']}")
                        continue
                
                slides_data.append(slide_data)
                processing_progress.progress((idx + 1) / len(st.session_state.slides))
            
            # Create manifest
            bundle_data = {
                "bundle_id": bundle_id,
                "title": bundle_title,
                "summary": bundle_summary,
                "year": year,
                "tags": tags,
                "license": license_option,
                "external_url": external_url,
                "status": status
            }
            
            if create_manifest(bundle_data, slides_data, output_dir):
                status_text.text("✅ Bundle processing complete!")
                st.success(f"🎉 Bundle '{bundle_title}' successfully created!")
                st.balloons()
                
                # Show summary
                st.subheader("📊 Processing Summary")
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Slides", len(slides_data))
                with col2:
                    image_count = sum(1 for s in slides_data if s['type'] == 'image')
                    st.metric("Images Processed", image_count)
                with col3:
                    st.metric("Output Directory", f"output/{bundle_id}")
                
                # Show file structure
                st.subheader("📁 Generated Files")
                st.code(f"""
output/{bundle_id}/
├── manifest.json
├── originals/          # Original files (normalized images)
├── web/               # 2400px web-optimized images  
└── thumbs/            # 800px thumbnail images
                """)
                
            else:
                st.error("❌ Failed to create manifest file")
                
        except Exception as e:
            st.error(f"❌ Error processing bundle: {e}")

# Sidebar with instructions
with st.sidebar:
    st.markdown("### 📖 Instructions")
    st.markdown("""
    1. **Upload Files**: Select images, videos, GIFs, and text content
    2. **Bundle Info**: Fill in required bundle metadata  
    3. **Configure Slides**: Add titles, captions, and alt text
    4. **Manage Slides**: Use the slide management section to reorder/remove
    5. **Process**: Click the process button to generate bundle
    
    **Output Structure:**
    - `originals/`: All source files (images normalized, GIFs preserved)
    - `web/`: 2400px web-optimized images
    - `thumbs/`: 800px thumbnail images
    - `manifest.json`: Complete metadata with text analytics
    """)
    
    st.markdown("### 🎯 Features")
    st.markdown("""
    - **Auto-rotation**: EXIF orientation applied
    - **sRGB conversion**: Color space normalization
    - **Multi-size output**: Original, web, thumbnail
    - **Video support**: MP4 and MOV files
    - **GIF support**: Animated GIFs preserved in originals
    - **Text content**: Markdown, HTML, and plain text files
    - **Text analytics**: Word/character counts in metadata
    - **Accessibility**: Alt text for images
    - **Metadata**: Complete JSON manifest
    """)
    
    st.markdown("### 📝 Text Content Types")
    st.markdown("""
    - **Markdown (.md)**: Rich text with formatting
    - **HTML (.html)**: Web content with markup
    - **Plain Text (.txt)**: Simple text content
    
    All text files are preserved in originals/ and include analytics in the manifest.
    """)

# Footer
st.markdown("---")
st.markdown("*Gallery Bundle Processor v1.0 - Built with Streamlit and Pillow*")
