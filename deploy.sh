#!/bin/bash
echo "🚀 Starting Build and Deploy"

set -e

# Branch check: Ensure we are on main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "❌ Error: You are on branch '$CURRENT_BRANCH'. You must be on 'main' to deploy."
  exit 1
fi

# 1. Pre-flight check: Ensure git directory is clean
if [ -n "$(git status --porcelain)" ]; then 
  echo "❌ Error: You have uncommitted changes. Please commit or stash them before deploying."
  exit 1
fi

# 2. Generate and store the version string
NEW_VERSION=$(date +%Y.%m.%d-%H%M)

# 3. Update the package.json version
npm version "$NEW_VERSION" --no-git-tag-version

# 4. Run the build
echo "📦 Running npm build..."
npm run build

# 5. Deploy the files
echo "🚚 Syncing files to Nginx storage..."
rsync -av --delete build/ /mnt/storage/app/nginx/html/

# 6. Git Tagging & Pushing
echo "🏷️ Tagging version v$NEW_VERSION in Git..."

# Commit the package.json change
git add package.json package-lock.json
git commit -m "Build: $NEW_VERSION"

# Create the annotated tag
git tag -a "v$NEW_VERSION" -m "Deployment on $(date)"

# Push the commit and the tag to your remote
git push origin main
git push origin "v$NEW_VERSION"

echo "✅ Done! CatMapper is now live on v$NEW_VERSION"