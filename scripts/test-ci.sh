#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Separate processes prevent module mocks in one file affecting another file.
mapfile -d '' tests < <(find apps/server packages/auth -name node_modules -prune -o -name '*.test.ts' -print0 | sort -z)
((${#tests[@]} > 0)) || { echo 'No auth tests found' >&2; exit 1; }
for test_file in "${tests[@]}"; do
  bun test "./$test_file"
done
