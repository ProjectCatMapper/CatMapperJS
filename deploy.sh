#!/bin/bash
echo "🚀 Starting Build and Deploy"

set -e

DEPLOY_USER="rjbischo"

# Require sudo/root so deployment behavior is explicit.
if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: This script must be run with sudo."
  echo "Run: sudo ./deploy.sh"
  exit 1
fi

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  echo "❌ Error: Deploy user '$DEPLOY_USER' does not exist on this system."
  exit 1
fi

run_as_deploy_user() {
  sudo -u "$DEPLOY_USER" -H "$@"
}

# Initialize variables
SKIP_VERSION=false
FAST_BUILD=true

# Parse flags
while [[ "$#" -gt 0 ]]; do
  case $1 in
    (--no-version) SKIP_VERSION=true ;;
    (--full-build) FAST_BUILD=false ;;
    (*) echo "Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

# Branch info: Print current branch
CURRENT_BRANCH=$(run_as_deploy_user git rev-parse --abbrev-ref HEAD)
echo "🌿 Current branch: $CURRENT_BRANCH"

# 1. Pre-flight check: Ensure git directory is clean
if [ -n "$(run_as_deploy_user git status --porcelain)" ]; then 
  echo "❌ Error: You have uncommitted changes. Please commit or stash them before deploying."
  exit 1
fi

if [ "$SKIP_VERSION" = false ]; then
  # 2. Generate and store the version string
  NEW_VERSION=$(date +%Y.%m.%d-%H%M)

  # 3. Update the package.json version
  run_as_deploy_user npm version "$NEW_VERSION" --no-git-tag-version
  echo "🔢 Version updated to $NEW_VERSION"
else
  echo "⏩ Skipping version update and Git tagging..."
fi

# 4. Run the build
echo "📦 Running npm build..."

# Ensure build/cache paths are writable by deploy user before build.
mkdir -p build node_modules/.cache
chown -R "$DEPLOY_USER":catmapper build node_modules/.cache

if [ "$FAST_BUILD" = true ]; then
  echo "⚡ Fast build mode enabled (DISABLE_ESLINT_PLUGIN=true, GENERATE_SOURCEMAP=false)"
  run_as_deploy_user env DISABLE_ESLINT_PLUGIN=true GENERATE_SOURCEMAP=false npm run build
else
  echo "🧪 Full build mode enabled"
  run_as_deploy_user npm run build
fi

# 5. Deploy the files
echo "🚚 Syncing files to Nginx storage..."
rsync -av --delete build/ /mnt/storage/app/nginx/html/

# 6. Git Tagging & Pushing (Only if not skipped)
if [ "$SKIP_VERSION" = false ]; then
  echo "🏷️ Tagging version v$NEW_VERSION in Git..."

  # Commit the package.json change
  run_as_deploy_user git add package.json package-lock.json
  run_as_deploy_user git commit -m "Build: $NEW_VERSION"

  # Create the annotated tag
  run_as_deploy_user git tag -a "v$NEW_VERSION" -m "Deployment on $(date)"

  # Push the commit and the tag to your remote
  run_as_deploy_user git push origin "$CURRENT_BRANCH"
  run_as_deploy_user git push origin "v$NEW_VERSION"
  echo "✅ Done! CatMapper is now live on v$NEW_VERSION"
else
  echo "✅ Done! Deployment complete (no version change)."
fi
