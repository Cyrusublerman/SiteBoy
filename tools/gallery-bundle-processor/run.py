#!/usr/bin/env python3
"""
Quick launcher for the Gallery Bundle Processor
Automatically installs dependencies and starts the Streamlit server
"""

import subprocess
import sys
import os
from pathlib import Path

def install_requirements():
    """Install required packages"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    if requirements_file.exists():
        print("📦 Installing dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
        print("✅ Dependencies installed successfully!")
    else:
        print("⚠️ requirements.txt not found, skipping dependency installation")

def start_streamlit():
    """Start the Streamlit application"""
    app_file = Path(__file__).parent / "app.py"
    if app_file.exists():
        print("🚀 Starting Gallery Bundle Processor...")
        print("🌐 The application will open in your default browser")
        print("📱 If it doesn't open automatically, go to: http://localhost:8501")
        print("⏹️ Press Ctrl+C to stop the server")
        
        # Change to the app directory and run streamlit
        os.chdir(Path(__file__).parent)
        subprocess.run([sys.executable, "-m", "streamlit", "run", "app.py"])
    else:
        print("❌ app.py not found in the current directory")
        sys.exit(1)

def main():
    print("🖼️ Gallery Bundle Processor Launcher")
    print("=" * 40)
    
    try:
        # Check if streamlit is installed
        subprocess.run([sys.executable, "-c", "import streamlit"], 
                      check=True, capture_output=True)
        print("✅ Streamlit is already installed")
    except subprocess.CalledProcessError:
        print("📦 Streamlit not found, installing dependencies...")
        install_requirements()
    
    start_streamlit()

if __name__ == "__main__":
    main()
