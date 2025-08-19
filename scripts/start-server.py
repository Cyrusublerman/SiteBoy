#!/usr/bin/env python3
"""
Simple HTTP Server for SiteBoy Development
Serves the site locally for testing and development
"""

import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path

# Configuration
PORT = 8000
HOST = '127.0.0.1'

def start_server():
    """Start the HTTP server"""
    # Change to project root directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    print(f"🚀 Starting SiteBoy development server...")
    print(f"📂 Serving directory: {project_root}")
    print(f"🌐 Server running at: http://{HOST}:{PORT}")
    print(f"🔧 Press Ctrl+C to stop the server")
    print()
    
    # Create server
    Handler = http.server.SimpleHTTPRequestHandler
    
    # Custom handler to set proper MIME types
    class CustomHandler(Handler):
        def end_headers(self):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            super().end_headers()
    
    try:
        with socketserver.TCPServer((HOST, PORT), CustomHandler) as httpd:
            print(f"✅ Server started successfully!")
            
            # Try to open browser
            try:
                webbrowser.open(f'http://{HOST}:{PORT}')
                print(f"🌐 Opened browser to http://{HOST}:{PORT}")
            except:
                print(f"⚠️  Could not open browser automatically")
                print(f"   Please navigate to: http://{HOST}:{PORT}")
            
            print()
            print("📋 Development Tips:")
            print("   - Open browser dev tools to see console logs")
            print("   - Press Ctrl+Shift+D to open debug dashboard")
            print("   - Check docs/CONSOLIDATED-GUIDE.md for help")
            print()
            
            # Serve forever
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use")
            print(f"   Try using a different port or stop the other server")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    start_server() 