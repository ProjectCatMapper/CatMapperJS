echo "Building"

set -e

# Redirect temp/cache to /mnt/storage
export TMPDIR=/mnt/storage/tmp
export npm_config_cache=/mnt/storage/npm-cache

mkdir -p "$TMPDIR" "$npm_config_cache"

npm run build

cp -r build/. /mnt/storage/app/nginx/html/

echo "Done!"
