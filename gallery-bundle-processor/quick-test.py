#!/usr/bin/env python3
"""
Quick test launcher for Gallery Bundle Processor
Starts the app without dependency checking
"""
import subprocess
import sys
import os

# Change to app directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("🚀 Starting Gallery Bundle Processor...")
print("📱 Opening at: http://localhost:8501")
print("⏹️ Press Ctrl+C to stop")

# Start streamlit directly
subprocess.run([sys.executable, "-m", "streamlit", "run", "app.py", "--theme.base", "dark"])
