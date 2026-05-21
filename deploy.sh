#!/bin/bash
echo "🚀 Starting Build and Deploy"

set -e

DEPLOY_USER="rjbischo"
APP_DIR="/mnt/storage/app/CatMapperJS"
TARGET_DIR="/mnt/storage/app/nginx/html"
DEPLOY_USER_LOCAL_BIN="/home/$DEPLOY_USER/.local/bin"
SYSTEM_PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ENV_FILE="$APP_DIR/.env"
PERMISSION_FIX_SCRIPT="/mnt/storage/app/fix_deploy_permissions.sh"
export VITE_CACHE_DIR="${VITE_CACHE_DIR:-/tmp/catmapperjs-vite-cache}"

umask 0002

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
    umask 0002
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

verify_build_path_access() {
  local path="$1"
  local label="$2"
  local issue_list

  if [ ! -d "$path" ]; then
    return 0
  fi

  if [ ! -w "$path" ] || [ ! -x "$path" ]; then
    echo "❌ Error: $label is not writable/traversable by $DEPLOY_USER: $path"
    return 1
  fi

  issue_list="$(
    find "$path" \
      \( -type d \( ! -writable -o ! -executable \) -o ! -user "$DEPLOY_USER" \) \
      -printf '%M %u:%g %p\n' \
      | sed -n '1,20p'
  )"

  if [ -n "$issue_list" ]; then
    echo "❌ Error: $label contains files or directories not owned/writable by $DEPLOY_USER."
    echo "Vite must be able to empty this path before building:"
    echo "$issue_list"
    echo "Fix ownership/permissions, then rerun deploy. Example:"
    echo "  sudo chown -R $DEPLOY_USER:catmapper $path"
    echo "  sudo chmod -R u+rwX,g+rwX $path"
    return 1
  fi

  return 0
}

permission_fix_hint() {
  echo "Run this once to repair deploy permissions:"
  echo "  sudo $PERMISSION_FIX_SCRIPT"
}

verify_write_access() {
  local path="$1"
  local label="$2"
  local tmp_file

  if [ ! -d "$path" ]; then
    echo "❌ Error: $label is missing: $path"
    permission_fix_hint
    return 1
  fi

  if [ ! -w "$path" ] || [ ! -x "$path" ]; then
    echo "❌ Error: $label is not writable/traversable by $DEPLOY_USER: $path"
    permission_fix_hint
    return 1
  fi

  tmp_file="$path/.deploy_write_test_$$"
  if ! run_as_deploy_user sh -c "umask 0002 && : > '$tmp_file' && rm -f '$tmp_file'"; then
    echo "❌ Error: $DEPLOY_USER cannot create files in $label: $path"
    permission_fix_hint
    return 1
  fi
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
mkdir -p dist "$VITE_CACHE_DIR" "$TARGET_DIR"
verify_write_access dist "Build output directory" || exit 1
verify_write_access node_modules "Dependency directory" || exit 1
verify_write_access "$VITE_CACHE_DIR" "Vite cache directory" || exit 1
verify_write_access "$TARGET_DIR" "Nginx frontend target" || exit 1
if ! verify_build_path_access dist "Build output directory"; then
  exit 1
fi
if ! verify_build_path_access "$VITE_CACHE_DIR" "Vite cache directory"; then
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
rsync -av --delete --exclude '/media/' --chmod=Du=rwx,Dg=rwx,Do=rx,Fu=rw,Fg=rw,Fo=r dist/ "$TARGET_DIR/"

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
