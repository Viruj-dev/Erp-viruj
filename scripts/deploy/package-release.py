#!/usr/bin/env python3
"""Archive tracked source only; never ship dotenv files, keys, uploads or backups."""
import fnmatch
import subprocess
import sys
from pathlib import Path, PurePosixPath

output = Path(sys.argv[1]).resolve()
files = subprocess.check_output(["git", "ls-files", "-z"]).decode().split("\0")
blocked_dirs = {".git", ".github", ".agents", ".claude", "node_modules", "storage", "coverage", "dist", ".next", ".turbo"}
blocked_patterns = (".env*", "*.pem", "*.key", "*backup*", "*.tsbuildinfo", ".*secrets*")
selected = []
for name in files:
    if not name:
        continue
    parts = PurePosixPath(name).parts
    if any(part in blocked_dirs or any(fnmatch.fnmatch(part.lower(), pattern) for pattern in blocked_patterns) for part in parts):
        continue
    selected.append(name)
if not selected:
    raise SystemExit("No release source files found")
subprocess.run(["git", "archive", "--format=tar.gz", f"--output={output}", "HEAD", "--", *selected], check=True)
