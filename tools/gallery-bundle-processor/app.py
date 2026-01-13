#!/usr/bin/env python3
"""
Gallery Bundle Processor - A Streamlit GUI for processing media bundles
Creates normalized image files and metadata for web galleries
Now with R2 upload support!
"""

import streamlit as st
import json
import os
import hashlib
from pathlib import Path
from PIL import Image, ImageOps
import shutil
from typing import List, Dict, Any
from datetime import datetime

# R2/S3 upload support
try:
    import boto3
    from botocore.exceptions import ClientError
    R2_AVAILABLE = True
except ImportError:
    R2_AVAILABLE = False

# ═══════════════════════════════════════════════════════════════════
# R2 CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

R2_CONFIG = {
    "account_id": os.getenv("R2_ACCOUNT_ID", "584a79f3f79fa20395a998af9170d670"),
    "bucket_name": os.getenv("R2_BUCKET_NAME", "assetts-einoder"),
    "access_key": os.getenv("R2_ACCESS_KEY_ID", "327779b3bbcaa50676f262ca6ec4c473"),
    "secret_key": os.getenv("R2_SECRET_ACCESS_KEY", "a11a0212f21268f4340a4ebd9ab1b4d2411c538cabcfc7a216fe7f54750d8f70"),
    "public_url": os.getenv("R2_PUBLIC_URL", "https://media.einoder.net"),
}

def get_r2_client():
    """Get configured R2/S3 client."""
    if not R2_AVAILABLE:
        return None
    endpoint = f"https://{R2_CONFIG['account_id']}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=R2_CONFIG['access_key'],
        aws_secret_access_key=R2_CONFIG['secret_key'],
        region_name="auto",
    )

def get_file_hash(file_path: Path) -> str:
    """Calculate MD5 hash of file."""
    md5_hash = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            md5_hash.update(chunk)
    return md5_hash.hexdigest()

def check_r2_file_exists(client, r2_key: str, local_path: Path) -> bool:
    """Check if file already exists in R2 with same hash."""
    try:
        response = client.head_object(Bucket=R2_CONFIG['bucket_name'], Key=r2_key)
        remote_etag = response.get("ETag", "").strip('"')
        local_hash = get_file_hash(local_path)
        return remote_etag == local_hash
    except ClientError:
        return False

def upload_file_to_r2(client, local_path: Path, r2_key: str, content_type: str = "image/jpeg", skip_existing: bool = True) -> dict:
    """Upload a single file to R2."""
    try:
        if skip_existing and check_r2_file_exists(client, r2_key, local_path):
            return {"status": "skipped", "key": r2_key}
        
        client.upload_file(
            str(local_path),
            R2_CONFIG['bucket_name'],
            r2_key,
            ExtraArgs={
                "ContentType": content_type,
                "CacheControl": "public, max-age=31536000",
            }
        )
        return {"status": "uploaded", "key": r2_key}
    except ClientError as e:
        return {"status": "failed", "key": r2_key, "error": str(e)}

def upload_gallery_to_r2(output_dir: Path, gallery_name: str, gallery_type: str = "photos", progress_callback=None) -> dict:
    """Upload processed gallery to R2."""
    client = get_r2_client()
    if not client:
        return {"success": False, "error": "boto3 not available"}
    
    stats = {"uploaded": 0, "skipped": 0, "failed": 0, "total": 0}
    
    # Map local directories to R2 paths
    dir_mapping = {
        "thumbs": "thumbs",
        "web": "web",
        "zoom": "zoom",
        "originals": "originals",
    }
    
    # Collect all files to upload
    files_to_upload = []
    for local_dir, r2_dir in dir_mapping.items():
        local_path = output_dir / local_dir
        if local_path.exists():
            for file_path in local_path.glob("*.jpg"):
                r2_key = f"art/{gallery_type}/{gallery_name}/{r2_dir}/{file_path.name}"
                files_to_upload.append((file_path, r2_key, "image/jpeg"))
            for file_path in local_path.glob("*.gif"):
                r2_key = f"art/{gallery_type}/{gallery_name}/{r2_dir}/{file_path.name}"
                files_to_upload.append((file_path, r2_key, "image/gif"))
    
    stats["total"] = len(files_to_upload)
    
    # Upload files
    for idx, (local_path, r2_key, content_type) in enumerate(files_to_upload):
        result = upload_file_to_r2(client, local_path, r2_key, content_type)
        stats[result["status"]] = stats.get(result["status"], 0) + 1
        
        if progress_callback:
            progress_callback((idx + 1) / len(files_to_upload), f"Uploading {local_path.name}...")
    
    # Generate and upload manifest
    manifest = generate_r2_manifest(output_dir, gallery_name, gallery_type, stats)
    if manifest:
        manifest_key = f"art/{gallery_type}/{gallery_name}/manifest.json"
        try:
            client.put_object(
                Bucket=R2_CONFIG['bucket_name'],
                Key=manifest_key,
                Body=json.dumps(manifest, indent=2),
                ContentType="application/json",
                CacheControl="public, max-age=3600",
            )
            stats["manifest"] = "uploaded"
        except ClientError as e:
            stats["manifest"] = f"failed: {e}"
    
    stats["success"] = stats["failed"] == 0
    return stats

def generate_r2_manifest(output_dir: Path, gallery_name: str, gallery_type: str, sync_stats: dict) -> dict:
    """Generate R2-compatible manifest."""
    thumbs_dir = output_dir / "thumbs"
    if not thumbs_dir.exists():
        return None
    
    images = list(thumbs_dir.glob("*.jpg")) + list(thumbs_dir.glob("*.gif"))
    base_url = f"{R2_CONFIG['public_url']}/art/{gallery_type}/{gallery_name}"
    
    manifest = {
        "gallery_name": gallery_name,
        "base_url": base_url,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_images": len(images),
        "sync_stats": sync_stats,
        "images": []
    }
    
    for image in sorted(images):
        manifest["images"].append({
            "id": image.stem,
            "filename": image.name,
            "urls": {
                "thumb": f"{base_url}/thumbs/{image.name}",
                "web": f"{base_url}/web/{image.name}",
                "zoom": f"{base_url}/zoom/{image.name}",
            }
        })
    
    return manifest

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
                
                # Store output dir in session state for R2 upload
                st.session_state['last_output_dir'] = str(output_dir)
                st.session_state['last_bundle_id'] = bundle_id
                
            else:
                st.error("❌ Failed to create manifest file")
                
        except Exception as e:
            st.error(f"❌ Error processing bundle: {e}")

# ═══════════════════════════════════════════════════════════════════
# R2 UPLOAD SECTION
# ═══════════════════════════════════════════════════════════════════

st.markdown("---")
st.subheader("📤 UPLOAD TO R2")

if not R2_AVAILABLE:
    st.warning("⚠️ boto3 not installed. Run: `pip install boto3` to enable R2 uploads.")
elif 'last_output_dir' not in st.session_state:
    st.info("👆 Process a bundle first, then upload to R2.")
else:
    output_dir = Path(st.session_state['last_output_dir'])
    bundle_id = st.session_state.get('last_bundle_id', 'unknown')
    
    if output_dir.exists():
        st.success(f"✅ Ready to upload: **{bundle_id}**")
        
        col1, col2 = st.columns(2)
        with col1:
            gallery_name = st.text_input(
                "Gallery Name (R2 folder)", 
                value=bundle_id.lower().replace(" ", "-"),
                help="This will be the folder name in R2"
            )
        with col2:
            gallery_type = st.selectbox(
                "Gallery Type",
                ["photos", "digital", "projects", "objects"],
                help="Category for the gallery"
            )
        
        # Show R2 destination preview
        st.markdown("**R2 Destination:**")
        st.code(f"""
art/{gallery_type}/{gallery_name}/
├── thumbs/     ({len(list((output_dir / 'thumbs').glob('*'))) if (output_dir / 'thumbs').exists() else 0} files)
├── web/        ({len(list((output_dir / 'web').glob('*'))) if (output_dir / 'web').exists() else 0} files)
├── originals/  ({len(list((output_dir / 'originals').glob('*'))) if (output_dir / 'originals').exists() else 0} files)
└── manifest.json
        """)
        
        col1, col2 = st.columns(2)
        with col1:
            dry_run = st.checkbox("Dry Run (preview only)", value=False)
        with col2:
            skip_existing = st.checkbox("Skip existing files", value=True)
        
        if st.button("🚀 Upload to R2", type="primary"):
            if not gallery_name:
                st.error("❌ Please enter a gallery name")
            else:
                if dry_run:
                    st.info("🔍 DRY RUN - No files will be uploaded")
                    # Count files that would be uploaded
                    total_files = 0
                    for subdir in ['thumbs', 'web', 'originals']:
                        subdir_path = output_dir / subdir
                        if subdir_path.exists():
                            total_files += len(list(subdir_path.glob('*')))
                    st.write(f"Would upload **{total_files}** files to `art/{gallery_type}/{gallery_name}/`")
                else:
                    # Actual upload
                    upload_progress = st.progress(0)
                    upload_status = st.empty()
                    
                    def update_progress(progress, message):
                        upload_progress.progress(progress)
                        upload_status.text(message)
                    
                    with st.spinner("Uploading to R2..."):
                        result = upload_gallery_to_r2(
                            output_dir, 
                            gallery_name, 
                            gallery_type,
                            progress_callback=update_progress
                        )
                    
                    if result.get("success"):
                        st.success("🎉 Upload complete!")
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("Uploaded", result.get("uploaded", 0))
                        with col2:
                            st.metric("Skipped", result.get("skipped", 0))
                        with col3:
                            st.metric("Failed", result.get("failed", 0))
                        
                        # Show manifest URL
                        manifest_url = f"{R2_CONFIG['public_url']}/art/{gallery_type}/{gallery_name}/manifest.json"
                        st.markdown(f"**Manifest URL:** [{manifest_url}]({manifest_url})")
                        
                        st.balloons()
                    else:
                        st.error(f"❌ Upload failed: {result.get('error', 'Unknown error')}")
    else:
        st.warning(f"⚠️ Output directory not found: {output_dir}")
        st.session_state.pop('last_output_dir', None)

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
    - **R2 Upload**: Direct upload to Cloudflare R2
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
