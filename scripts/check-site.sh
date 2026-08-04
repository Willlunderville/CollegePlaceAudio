#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "index.html"
  "styles.css"
  "script.js"
  "assets/college-place-exterior.png"
  "assets/college-place-logo.jpeg"
  "assets/the-big-squeeze.jpg"
  "assets/tiny-pretty-things.jpg"
  "assets/favicon.png"
  "assets/favicon-32.png"
  "assets/apple-touch-icon.png"
  ".github/workflows/deploy.yml"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Missing required file: $file"
    exit 1
  fi
done

grep -q "hello@collegeplaceaudio.com" index.html
grep -q "CPANEL_SSH_HOST" .github/workflows/deploy.yml
grep -q "CPANEL_SSH_USERNAME" .github/workflows/deploy.yml
grep -q "CPANEL_SSH_PASSWORD" .github/workflows/deploy.yml
grep -q "CPANEL_SSH_PORT" .github/workflows/deploy.yml
grep -q "CPANEL_SSH_REMOTE_DIR" .github/workflows/deploy.yml

if grep -q "CPANEL_FTP" .github/workflows/deploy.yml; then
  echo "Workflow still references old FTP secrets."
  exit 1
fi

echo "Site smoke checks passed."
