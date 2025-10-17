#!/usr/bin/env python3
"""
No-Cache Development Server
Serves files with cache-disabling headers for development
"""

import http.server
import socketserver
import os
import sys

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add no-cache headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    # Allow port to be specified as command line argument
    PORT = 3000 if len(sys.argv) <= 1 else int(sys.argv[1])
    
    # Change to the directory containing this script's parent (project root)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    os.chdir(project_root)
    
    print(f"Starting no-cache development server...")
    print(f"Serving directory: {os.getcwd()}")
    print(f"Server running at: http://localhost:{PORT}")
    print(f"Press Ctrl+C to stop the server")
    
    try:
        with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)

if __name__ == "__main__":
    main() 