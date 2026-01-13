#!/usr/bin/env python3
"""
Start the Media Manager API server.
"""

import subprocess
import sys
from pathlib import Path

def main():
    # Ensure we're in the right directory
    script_dir = Path(__file__).parent
    server_path = script_dir / "media-manager-server.py"
    
    if not server_path.exists():
        print("❌ media-manager-server.py not found")
        sys.exit(1)
    
    print("🖼️  Starting Media Manager API...")
    print("   API: http://localhost:5555")
    print("   Press Ctrl+C to stop")
    print()
    
    try:
        subprocess.run([sys.executable, str(server_path)], cwd=str(script_dir))
    except KeyboardInterrupt:
        print("\n👋 Server stopped")

if __name__ == "__main__":
    main()
