#!/usr/bin/env bash
# Prepare a clean copy of the Comity repo for pushing to GitHub.
# This script:
#   1. Copies the project to a staging directory
#   2. Removes platform-specific files
#   3. Replaces symlinks with real files
#   4. Cleans the Prisma schema of absolute paths
#   5. Initialises a fresh git repo ready for push

set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="/tmp/comity-export"

echo "==> Cleaning previous export"
rm -rf "$DEST"
mkdir -p "$DEST"

echo "==> Copying source tree"
rsync -a \
  --exclude='.git' \
  --exclude='.abacus.donotdelete' \
  --exclude='.project_instructions.md' \
  --exclude='.deploy' \
  --exclude='.logs' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.build' \
  --exclude='ROADMAP.docx' \
  --exclude='ROADMAP.pdf' \
  --exclude='nextjs_space/.env' \
  --exclude='*.docx' \
  --exclude='*.pdf' \
  --exclude='*.tsbuildinfo' \
  "$SRC/" "$DEST/"

echo "==> Replacing prisma/schema.prisma symlink with real file"
rm -f "$DEST/nextjs_space/prisma/schema.prisma"
cat "$SRC/nextjs_space/prisma/schema.prisma" \
  | sed '/output.*=.*"\/home/d' \
  > "$DEST/nextjs_space/prisma/schema.prisma"

echo "==> Removing yarn.lock symlink (will regenerate on yarn install)"
rm -f "$DEST/nextjs_space/yarn.lock"

echo "==> Removing shared-schema comment from schema"
sed -i '1s|^// CRITICAL.*$|// Prisma schema for Comity|' "$DEST/nextjs_space/prisma/schema.prisma"

echo "==> Initialising git repo"
cd "$DEST"
git init
git add -A
git commit -m "Initial open source release"

echo ""
echo "Export ready at: $DEST"
echo "Next steps:"
echo "  cd $DEST"
echo "  git remote add origin git@github.com:YOUR-ORG/comity.git"
echo "  git push -u origin main"
