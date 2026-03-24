#!/bin/bash
echo "🚀 Starting Build and Deploy"

set -e

DEPLOY_USER="rjbischo"
APP_DIR="/mnt/storage/app/CatMapperJS"
DEPLOY_USER_LOCAL_BIN="/home/$DEPLOY_USER/.local/bin"
SYSTEM_PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ENV_FILE="$APP_DIR/.env"

if [ ! -d "$APP_DIR" ]; then
  echo "❌ Error: App directory not found: $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: Missing required environment file: $ENV_FILE"
  echo "Deployment halted to avoid building with undefined REACT_APP_* values."
  echo "Restore the server-specific .env file and rerun deploy."
  exit 1
fi

REQUIRED_ENV_KEYS=(
  "REACT_APP_API_URL"
  "REACT_APP_AUTH0_DOMAIN"
  "REACT_APP_AUTH0_CLIENT_ID"
  "REACT_APP_MAPBOX_TOKEN"
)

MISSING_ENV_KEYS=()
for key in "${REQUIRED_ENV_KEYS[@]}"; do
  value=$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d'=' -f2- || true)
  if [ -z "$value" ]; then
    MISSING_ENV_KEYS+=("$key")
  fi
done

if [ "${#MISSING_ENV_KEYS[@]}" -gt 0 ]; then
  echo "❌ Error: .env is missing required keys or has empty values:"
  for key in "${MISSING_ENV_KEYS[@]}"; do
    echo "   - $key"
  done
  echo "Restore/update $ENV_FILE and rerun deploy."
  exit 1
fi

# Require running as deploy user so git identity and permissions stay predictable.
if [ "$(id -un)" != "$DEPLOY_USER" ]; then
  echo "❌ Error: This script must be run as '$DEPLOY_USER' (without sudo)."
  echo "Run as that user and execute: ./deploy.sh"
  exit 1
fi

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  echo "❌ Error: Deploy user '$DEPLOY_USER' does not exist on this system."
  exit 1
fi

run_as_deploy_user() {
  if [ -d "$DEPLOY_USER_LOCAL_BIN" ]; then
    env PATH="$DEPLOY_USER_LOCAL_BIN:$SYSTEM_PATH:$PATH" "$@"
  else
    "$@"
  fi
}

run_node_cmd_as_deploy_user() {
  run_as_deploy_user bash -c '
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
      . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
      nvm use --silent default >/dev/null 2>&1 || true
    fi
    "$@"
  ' bash "$@"
}

verify_git_write_access() {
  run_as_deploy_user test -w .git/objects || return 1
  mkdir -p .git/refs/tags
  run_as_deploy_user test -w .git/refs/tags || return 1
  run_as_deploy_user sh -c 'tmp=".git/objects/.cm_write_test_$$"; : > "$tmp" && rm -f "$tmp"' || return 1
  run_as_deploy_user sh -c 'tmp=".git/refs/tags/.cm_write_test_$$"; : > "$tmp" && rm -f "$tmp"' || return 1
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

# Ensure git internals are writable by deployment user.
if ! verify_git_write_access; then
  echo "❌ Error: .git is not writable by $DEPLOY_USER."
  echo "Check ownership/ACLs for $(pwd)/.git and rerun."
  exit 1
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
  run_node_cmd_as_deploy_user npm version "$NEW_VERSION" --no-git-tag-version
  echo "🔢 Version updated to $NEW_VERSION"
else
  echo "⏩ Skipping version update and Git tagging..."
fi

# 4. Run the build
echo "📦 Running npm build..."

# Ensure output/cache paths are writable by deploy user before build.
mkdir -p dist node_modules/.vite
if [ ! -w dist ] || [ ! -w node_modules/.vite ]; then
  echo "❌ Error: Build output/cache directories are not writable by $DEPLOY_USER."
  echo "Check permissions for $(pwd)/dist and $(pwd)/node_modules/.vite and rerun."
  exit 1
fi

if [ "$FAST_BUILD" = true ]; then
  echo "⚡ Fast build mode enabled (Vite default production build)"
  run_node_cmd_as_deploy_user npm run build
else
  echo "🧪 Full build mode enabled"
  run_node_cmd_as_deploy_user npm run build
fi

# 5. Deploy the files
echo "🚚 Syncing files to Nginx storage..."
rsync -av --delete dist/ /mnt/storage/app/nginx/html/

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
