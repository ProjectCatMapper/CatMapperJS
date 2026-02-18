#!/bin/bash
echo "🚀 Starting Build and Deploy"

set -e

DEPLOY_USER="rjbischo"
APP_DIR="/mnt/storage/app/CatMapperJS"

if [ ! -d "$APP_DIR" ]; then
  echo "❌ Error: App directory not found: $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

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

verify_git_write_access() {
  run_as_deploy_user test -w .git/objects || return 1
  mkdir -p .git/refs/tags
  run_as_deploy_user test -w .git/refs/tags || return 1
  run_as_deploy_user sh -c 'tmp=".git/objects/.cm_write_test_$$"; : > "$tmp" && rm -f "$tmp"' || return 1
  run_as_deploy_user sh -c 'tmp=".git/refs/tags/.cm_write_test_$$"; : > "$tmp" && rm -f "$tmp"' || return 1
}

fix_git_ownership() {
  local deploy_group
  deploy_group=$(id -gn "$DEPLOY_USER")
  echo "🔧 Repairing .git ownership to $DEPLOY_USER:$deploy_group ..."

  if ! chown -R "$DEPLOY_USER":"$deploy_group" .git; then
    echo "❌ Error: Failed to chown .git to $DEPLOY_USER:$deploy_group"
    return 1
  fi

  if ! chmod -R u+rwX .git; then
    echo "❌ Error: Failed to apply writable permissions to .git"
    return 1
  fi

  return 0
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

# Ensure git internals are writable by deployment user (fix once, then fail if still broken).
if ! verify_git_write_access; then
  echo "⚠️  .git is not writable by $DEPLOY_USER. Attempting ownership repair..."
  if ! fix_git_ownership; then
    echo "❌ Error: Unable to repair .git ownership."
    exit 1
  fi

  if ! verify_git_write_access; then
    echo "❌ Error: .git is still not writable by $DEPLOY_USER after repair."
    echo "Check ACLs/mount permissions for $(pwd)/.git and retry."
    exit 1
  fi
fi

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
