import os
import sys

# Ensure root and backend directories are in Python's module search path
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"Starting AI Smart Factory Assistant on port {port}...")
    app.run(host='0.0.0.0', port=port)
