#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$ROOT_DIR/dist/browser"
DEPLOY_ROOT=${DEPLOY_ROOT:-/usr/share/nginx/html}

command -v npm >/dev/null 2>&1 || { echo "npm is required to build the project." >&2; exit 1; }

cd "$ROOT_DIR"

echo "Installing dependencies..."
npm install --no-fund --prefer-offline

echo "Building production bundle..."
npm run build

echo "Preparing deploy directory at $DEPLOY_ROOT ..."
mkdir -p "$DEPLOY_ROOT"
rm -rf "$DEPLOY_ROOT"/*

if [ ! -d "$BUILD_DIR" ]; then
  echo "Build output not found at $BUILD_DIR" >&2
  exit 1
fi

echo "Copying build output to Nginx html root..."
cp -R "$BUILD_DIR"/* "$DEPLOY_ROOT"/

echo "Deployment complete. Nginx will now serve the Angular app from $DEPLOY_ROOT."
