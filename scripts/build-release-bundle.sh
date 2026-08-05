#!/usr/bin/env bash

set -euo pipefail

manifest="${1:-releases/2026-08-featured.txt}"
output="${2:-dist/hicv-word-resume-templates-2026-08-featured.zip}"

if [[ ! -f "$manifest" ]]; then
  echo "Manifest not found: $manifest" >&2
  exit 1
fi

mkdir -p "$(dirname "$output")"

files=()
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if [[ ! -f "$file" ]]; then
    echo "Template not found: $file" >&2
    exit 1
  fi
  files+=("$file")
done < "$manifest"

if [[ ${#files[@]} -eq 0 ]]; then
  echo "Manifest is empty: $manifest" >&2
  exit 1
fi

zip -q -9 "$output" "${files[@]}" README.md LICENSE
echo "$output"
