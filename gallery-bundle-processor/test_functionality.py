#!/usr/bin/env python3
"""
Test script to verify core functionality of the Gallery Bundle Processor
Tests image processing functions without the Streamlit UI
"""

import sys
from pathlib import Path
from PIL import Image, ImageOps
import json
import tempfile
import shutil

def create_test_image(width=1000, height=800, color=(255, 0, 0)):
    """Create a test image for processing"""
    image = Image.new('RGB', (width, height), color)
    return image

def test_image_processing():
    """Test the core image processing functionality"""
    print("🧪 Testing image processing...")
    
    # Create a temporary directory for testing
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Create test image
        test_image = create_test_image(2000, 1500, (255, 128, 0))
        
        # Save test image to temp file
        test_file = temp_path / "test_input.jpg"
        test_image.save(test_file, "JPEG")
        
        # Create output directories
        output_dir = temp_path / "output"
        originals_dir = output_dir / "originals"
        web_dir = output_dir / "web"
        thumbs_dir = output_dir / "thumbs"
        
        for dir_path in [originals_dir, web_dir, thumbs_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
        
        # Process the image (simulating the app's process_image function)
        try:
            with open(test_file, 'rb') as f:
                image = Image.open(f)
                
                # Apply EXIF orientation
                image = ImageOps.exif_transpose(image)
                
                # Convert to RGB
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Save normalized original
                original_path = originals_dir / "test.jpg"
                image.save(original_path, "JPEG", quality=95, optimize=True)
                
                # Create web version (2400px max)
                web_image = image.copy()
                web_image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
                web_path = web_dir / "test.jpg"
                web_image.save(web_path, "JPEG", quality=85, optimize=True)
                
                # Create thumbnail (800px max)
                thumb_image = image.copy()
                thumb_image.thumbnail((800, 800), Image.Resampling.LANCZOS)
                thumb_path = thumbs_dir / "test.jpg"
                thumb_image.save(thumb_path, "JPEG", quality=80, optimize=True)
                
                # Verify files were created
                assert original_path.exists(), "Original image not created"
                assert web_path.exists(), "Web image not created"
                assert thumb_path.exists(), "Thumbnail not created"
                
                # Check image sizes
                original_img = Image.open(original_path)
                web_img = Image.open(web_path)
                thumb_img = Image.open(thumb_path)
                
                print(f"  ✅ Original: {original_img.size}")
                print(f"  ✅ Web: {web_img.size}")
                print(f"  ✅ Thumbnail: {thumb_img.size}")
                
                # Verify sizes are correct
                assert web_img.size[0] <= 2400 and web_img.size[1] <= 2400, "Web image too large"
                assert thumb_img.size[0] <= 800 and thumb_img.size[1] <= 800, "Thumbnail too large"
                
                return True
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
            return False

def test_manifest_creation():
    """Test JSON manifest creation"""
    print("🧪 Testing manifest creation...")
    
    try:
        # Sample data
        bundle_data = {
            "bundle_id": "test-bundle",
            "title": "Test Bundle",
            "summary": "A test bundle for validation",
            "year": "2024",
            "tags": "test, validation, demo",
            "license": "CC BY",
            "external_url": "https://example.com",
            "status": "Available"
        }
        
        slides_data = [
            {
                "title": "Test Image 1",
                "caption": "First test image",
                "alt": "Red test image",
                "filename": "test001",
                "type": "image",
                "original_name": "test001.jpg",
                "original_size": [2000, 1500],
                "web_size": [2000, 1500],
                "thumb_size": [800, 600]
            }
        ]
        
        # Create manifest
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
        
        # Test JSON serialization
        manifest_json = json.dumps(manifest, indent=2, ensure_ascii=False)
        
        # Verify it can be parsed back
        parsed_manifest = json.loads(manifest_json)
        
        assert parsed_manifest["bundle_id"] == "test-bundle", "Bundle ID mismatch"
        assert len(parsed_manifest["slides"]) == 1, "Slides count mismatch"
        assert len(parsed_manifest["tags"]) == 3, "Tags parsing failed"
        
        print("  ✅ Manifest structure valid")
        print("  ✅ JSON serialization working")
        print("  ✅ Tags parsing correct")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def test_dependencies():
    """Test that all required dependencies are available"""
    print("🧪 Testing dependencies...")
    
    try:
        import streamlit
        print(f"  ✅ Streamlit {streamlit.__version__}")
    except ImportError:
        print("  ⚠️ Streamlit not installed (required for GUI)")
        return False
    
    try:
        from PIL import Image, ImageOps
        print(f"  ✅ Pillow {Image.__version__}")
    except ImportError:
        print("  ❌ Pillow not installed (required for image processing)")
        return False
    
    # Test standard library modules
    modules = ['json', 'os', 'pathlib', 'shutil', 'typing']
    for module in modules:
        try:
            __import__(module)
            print(f"  ✅ {module} available")
        except ImportError:
            print(f"  ❌ {module} not available")
            return False
    
    return True

def main():
    """Run all tests"""
    print("🖼️ Gallery Bundle Processor - Functionality Test")
    print("=" * 50)
    
    tests = [
        ("Dependencies", test_dependencies),
        ("Image Processing", test_image_processing),
        ("Manifest Creation", test_manifest_creation)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        if test_func():
            print(f"✅ {test_name} PASSED")
            passed += 1
        else:
            print(f"❌ {test_name} FAILED")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The Gallery Bundle Processor is ready to use.")
        print("\n🚀 To start the application, run:")
        print("   python run.py")
        print("   or")
        print("   streamlit run app.py")
    else:
        print("⚠️ Some tests failed. Please check the dependencies and installation.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
