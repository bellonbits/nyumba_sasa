import sys
import os

# Add the root directory to the python path so 'backend' can be resolved
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app
