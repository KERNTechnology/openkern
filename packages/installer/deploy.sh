#!/usr/bin/env bash
# OpenKERN Deploy Script
# Builds the Next.js/Payload CMS app with OpenNext and deploys to AWS.
#
# Usage: ./deploy.sh [--stack-dir <path>]
#
# Prerequisites:
#   - Node.js >= 20, npm, AWS CLI configured
#   - Pulumi stack already deployed (infra must exist)
#   - Working directory should be the CMS package, or pass --stack-dir

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CMS_DIR="${SCRIPT_DIR}/../cms"
STACK_DIR=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --stack-dir) STACK_DIR="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ -z "$STACK_DIR" ]]; then
  STACK_DIR="${SCRIPT_DIR}/../infra/pulumi/starter"
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[deploy]${NC} $1"; }
success() { echo -e "${GREEN}[deploy]${NC} $1"; }
error() { echo -e "${RED}[deploy]${NC} $1" >&2; }

# ── Step 1: Read Pulumi stack outputs ─────────────────────────────────────────
info "Reading Pulumi stack outputs..."
cd "$STACK_DIR"

ASSETS_BUCKET=$(pulumi stack output assetsBucketName 2>/dev/null) || {
  error "Could not read assetsBucketName from Pulumi. Is the stack deployed?"
  exit 1
}
SERVER_FUNCTION=$(pulumi stack output lambdaFunctionName 2>/dev/null) || {
  error "Could not read lambdaFunctionName from Pulumi."
  exit 1
}
IMAGE_FUNCTION=$(pulumi stack output imageFunctionName 2>/dev/null) || {
  error "Could not read imageFunctionName from Pulumi."
  exit 1
}
DISTRIBUTION_ID=$(pulumi stack output distributionId 2>/dev/null) || {
  error "Could not read distributionId from Pulumi."
  exit 1
}
REGION=$(aws configure get region 2>/dev/null || echo "eu-central-1")

info "Assets bucket:    $ASSETS_BUCKET"
info "Server function:  $SERVER_FUNCTION"
info "Image function:   $IMAGE_FUNCTION"
info "CloudFront dist:  $DISTRIBUTION_ID"
info "Region:           $REGION"

# ── Step 2: Build with OpenNext ───────────────────────────────────────────────
info "Building Next.js app with OpenNext..."
cd "$CMS_DIR"

info "Generating Payload import map..."
npx payload generate:importmap

npm run build:open-next

OPEN_NEXT_DIR="$CMS_DIR/.open-next"

if [[ ! -d "$OPEN_NEXT_DIR/server-functions/default" ]]; then
  error "OpenNext build output not found at $OPEN_NEXT_DIR/server-functions/default"
  exit 1
fi

success "OpenNext build complete."

# ── Step 2b: Add sharp linux-x64 binaries to server function ─────────────────
# Lambda runs on linux-x64, but local dev may be macOS/arm64. We download the
# correct native binaries and inject them into the OpenNext build output.
# Versions are read from the installed sharp package to avoid mismatches.
info "Adding sharp linux-x64 binaries..."
SERVER_NM="$OPEN_NEXT_DIR/server-functions/default/node_modules"
SHARP_VERSION=$(node -p "require('$CMS_DIR/node_modules/sharp/package.json').version")
# libvips version: sharp 0.33.x uses 8.15.x, sharp 0.34.x uses 1.2.x
LIBVIPS_VERSION=$(node -p "try{require('$CMS_DIR/node_modules/@img/sharp-darwin-arm64/package.json').optionalDependencies['@img/sharp-libvips-darwin-arm64']||''}catch{''}" 2>/dev/null || echo "")
if [[ -z "$LIBVIPS_VERSION" ]]; then
  # Fallback: read from any available platform binary
  LIBVIPS_VERSION=$(ls "$CMS_DIR/node_modules/@img/" 2>/dev/null | grep "sharp-libvips" | head -1 | xargs -I{} node -p "require('$CMS_DIR/node_modules/@img/{}/package.json').version" 2>/dev/null || echo "8.15.5")
fi
info "Sharp version: $SHARP_VERSION, libvips: $LIBVIPS_VERSION"

mkdir -p "$SERVER_NM/@img"
cp -r "$CMS_DIR/node_modules/sharp" "$SERVER_NM/sharp" 2>/dev/null || true
# Remove non-linux platform binaries
rm -rf "$SERVER_NM/@img/sharp-darwin-"* "$SERVER_NM/@img/sharp-libvips-darwin-"* \
       "$SERVER_NM/@img/sharp-linux-arm64" "$SERVER_NM/@img/sharp-libvips-linux-arm64" \
       "$SERVER_NM/@img/sharp-linux-x64" "$SERVER_NM/@img/sharp-libvips-linux-x64"
# Download matching linux-x64 binaries
(cd /tmp && curl -sL "https://registry.npmjs.org/@img/sharp-linux-x64/-/sharp-linux-x64-${SHARP_VERSION}.tgz" | tar xz && mv package "$SERVER_NM/@img/sharp-linux-x64")
(cd /tmp && curl -sL "https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-${LIBVIPS_VERSION}.tgz" | tar xz && mv package "$SERVER_NM/@img/sharp-libvips-linux-x64")
success "Sharp binaries added."

# ── Step 3: Upload static assets to S3 ───────────────────────────────────────
info "Uploading static assets to S3..."

# Upload _next/static with long cache (immutable content-hashed files)
aws s3 sync \
  "$OPEN_NEXT_DIR/assets/_next/static" \
  "s3://$ASSETS_BUCKET/_next/static" \
  --cache-control "public,max-age=31536000,immutable" \
  --region "$REGION" \
  --delete

# Upload remaining assets (e.g. favicon, robots.txt) with short cache
aws s3 sync \
  "$OPEN_NEXT_DIR/assets" \
  "s3://$ASSETS_BUCKET" \
  --cache-control "public,max-age=3600" \
  --region "$REGION" \
  --exclude "_next/static/*"

success "Static assets uploaded."

# ── Step 4: Deploy server function ────────────────────────────────────────────
info "Packaging server function..."
cd "$OPEN_NEXT_DIR/server-functions/default"
zip -qr /tmp/openkern-server.zip .

info "Updating Lambda function: $SERVER_FUNCTION"
aws lambda update-function-code \
  --function-name "$SERVER_FUNCTION" \
  --zip-file fileb:///tmp/openkern-server.zip \
  --region "$REGION" \
  --output text > /dev/null

info "Waiting for server function update..."
aws lambda wait function-updated \
  --function-name "$SERVER_FUNCTION" \
  --region "$REGION"

success "Server function deployed."
rm -f /tmp/openkern-server.zip

# ── Step 5: Deploy image optimization function ────────────────────────────────
if [[ -d "$OPEN_NEXT_DIR/image-optimization-function" ]]; then
  info "Packaging image optimization function..."
  cd "$OPEN_NEXT_DIR/image-optimization-function"
  zip -qr /tmp/openkern-image.zip .

  info "Updating Lambda function: $IMAGE_FUNCTION"
  aws lambda update-function-code \
    --function-name "$IMAGE_FUNCTION" \
    --zip-file fileb:///tmp/openkern-image.zip \
    --region "$REGION" \
    --output text > /dev/null

  info "Waiting for image function update..."
  aws lambda wait function-updated \
    --function-name "$IMAGE_FUNCTION" \
    --region "$REGION"

  success "Image optimization function deployed."
  rm -f /tmp/openkern-image.zip
else
  info "No image optimization function found — skipping."
fi

# ── Step 6: Invalidate CloudFront cache ───────────────────────────────────────
info "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --region "$REGION" \
  --output text > /dev/null

success "CloudFront invalidation created."

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
success "Deployment complete!"
info "Your site should be live within a few minutes (CloudFront propagation)."
