#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# OpenKERN Installer
# Deploys a Payload CMS website on your AWS account.
# https://openkern.org
# =============================================================================

VERSION="0.1.0"
OPENKERN_REPO="https://github.com/nice-solutions/openkern"
KERN_API_URL="https://api.openkern.org"
LOCAL_REPO=""

# Parse global flags (before any subcommand)
while [[ $# -gt 0 ]]; do
  case $1 in
    --local) LOCAL_REPO="$(cd "$2" && pwd)"; shift 2 ;;
    --api-url) KERN_API_URL="$2"; shift 2 ;;
    *) break ;;
  esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

print_banner() {
  echo ""
  echo -e "${BOLD}"
  echo "   ____                   __ ______  ____  _   __"
  echo "  / __ \\____  ___  ____  / //_/ __ \\/ __ \\/ | / /"
  echo " / / / / __ \\/ _ \\/ __ \\/ ,< / __/ / /_/ /  |/ / "
  echo "/ /_/ / /_/ /  __/ / / / /| / /___/ _, _/ /|  /  "
  echo "\\____/ .___/\\___/_/ /_/_/ |_\\____/_/ |_/_/ |_/   "
  echo "    /_/                                           "
  echo -e "${NC}"
  echo -e "  ${BLUE}Self-installable web publishing stack${NC}"
  echo -e "  ${BLUE}Version ${VERSION}${NC}"
  echo ""
}

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ─── Preflight Checks ───────────────────────────────────────────────────────

check_command() {
  local cmd="$1"
  local name="$2"
  local install_hint="$3"

  if command -v "$cmd" &> /dev/null; then
    local version
    version=$("$cmd" --version 2>&1 | head -1)
    log_ok "$name found: $version"
    return 0
  else
    log_error "$name not found."
    echo "       Install: $install_hint"
    return 1
  fi
}

check_node_version() {
  local node_version
  node_version=$(node --version 2>/dev/null | sed 's/v//')
  local major
  major=$(echo "$node_version" | cut -d. -f1)

  if [ "$major" -ge 20 ]; then
    log_ok "Node.js version: v$node_version"
    return 0
  else
    log_error "Node.js >= 20 required (found v$node_version)"
    echo "       Install: https://nodejs.org"
    return 1
  fi
}

check_aws_credentials() {
  log_info "Checking AWS credentials..."
  local identity
  if identity=$(aws sts get-caller-identity 2>&1); then
    local account
    account=$(echo "$identity" | grep -o '"Account": "[^"]*"' | cut -d'"' -f4)
    log_ok "AWS credentials valid (account: $account)"
    return 0
  else
    log_error "AWS credentials not configured or invalid."
    echo "       Run: aws configure"
    return 1
  fi
}

preflight() {
  echo -e "${BOLD}Preflight Checks${NC}"
  echo "─────────────────────────────────────────────"
  echo ""

  local failed=0

  check_command "node" "Node.js" "https://nodejs.org" || failed=1
  if [ $failed -eq 0 ]; then
    check_node_version || failed=1
  fi
  check_command "aws" "AWS CLI" "https://aws.amazon.com/cli/" || failed=1
  check_command "pulumi" "Pulumi CLI" "curl -fsSL https://get.pulumi.com | sh" || failed=1

  if [ $failed -eq 0 ]; then
    check_aws_credentials || failed=1
  fi

  echo ""

  if [ $failed -ne 0 ]; then
    log_error "Preflight checks failed. Please fix the issues above and try again."
    exit 1
  fi

  log_ok "All preflight checks passed!"
  echo ""
}

# ─── Prompts ─────────────────────────────────────────────────────────────────

prompt_value() {
  local prompt="$1"
  local default="$2"
  local result

  if [ -n "$default" ]; then
    read -r -p "$(echo -e "${BOLD}$prompt${NC} [$default]: ")" result < /dev/tty
    echo "${result:-$default}"
  else
    read -r -p "$(echo -e "${BOLD}$prompt${NC}: ")" result < /dev/tty
    echo "$result"
  fi
}

prompt_kern_token() {
  echo -e "${BOLD}KERN Authentication${NC}"
  echo "─────────────────────────────────────────────"
  echo ""

  KERN_API_TOKEN=""
  KERN_USED_SECRET=false

  # Check if config was pre-stored in AWS Secrets Manager
  local secret_value
  secret_value=$(aws secretsmanager get-secret-value \
    --secret-id openkern/config \
    --region eu-central-1 \
    --query SecretString --output text 2>/dev/null) || true

  if [[ -n "$secret_value" ]]; then
    KERN_API_TOKEN=$(echo "$secret_value" | grep -o '"apiToken":"[^"]*"' | cut -d'"' -f4 || true)

    if [[ -n "$KERN_API_TOKEN" ]]; then
      KERN_USED_SECRET=true
      log_ok "Config found in AWS Secrets Manager (openkern/config)."
      echo ""
      echo "  The following was stored in your AWS account:"
      echo "  - Secret name:  openkern/config"
      echo "  - Contains:     Your KERN API token (encrypted at rest)"
      echo "  - Stored by:    You, during registration"
      echo "  - Cost:         ~\$0.40/month (AWS Secrets Manager)"
      echo "  - Delete with:  aws secretsmanager delete-secret --secret-id openkern/config --region eu-central-1"
      echo ""
      log_info "Using API token from your Secrets Manager..."
    fi
  fi

  # If no token found in Secrets Manager, prompt manually
  if [[ -z "$KERN_API_TOKEN" ]]; then
    echo "To use OpenKERN, you need an API token from KERN."
    echo "Register at https://install.openkern.org/register.html"
    echo ""

    read -r -p "$(echo -e "${BOLD}KERN API token${NC}: ")" KERN_API_TOKEN < /dev/tty
    echo ""

    if [[ -z "$KERN_API_TOKEN" ]]; then
      log_error "API token cannot be empty."
      exit 1
    fi
  fi

  # Validate token and fetch credentials + config in one call
  log_info "Validating API token and fetching credentials..."
  local creds_response
  creds_response=$(curl -s --max-time 15 -w "\n%{http_code}" \
    -H "Authorization: Bearer $KERN_API_TOKEN" \
    "${KERN_API_URL}/v1/credentials" 2>/dev/null) || true

  local http_code
  http_code=$(echo "$creds_response" | tail -1)
  local body
  body=$(echo "$creds_response" | sed '$d')

  if [[ "$http_code" != "200" ]]; then
    log_error "Invalid API token (HTTP $http_code)."
    log_error "Register at https://install.openkern.org/register.html"
    exit 1
  fi

  # Parse credentials and config from response
  KERN_DATABASE_URI=$(echo "$body" | grep -o '"databaseUri":"[^"]*"' | cut -d'"' -f4)
  KERN_REGION=$(echo "$body" | grep -o '"region":"[^"]*"' | cut -d'"' -f4)

  if [[ -z "$KERN_DATABASE_URI" ]]; then
    log_error "Could not parse KERN credentials. Contact hello@kern.technology"
    exit 1
  fi

  log_ok "API token valid. Database and config loaded."

  # Check for existing OpenKERN installations in this AWS account
  local existing_lambdas
  existing_lambdas=$(aws lambda list-functions --region "${KERN_REGION:-eu-central-1}" \
    --query "Functions[?starts_with(FunctionName, 'openkern') || contains(FunctionName, '-server')].FunctionName" \
    --output text 2>/dev/null || true)

  # Filter to only OpenKERN-tagged functions
  local existing_sites=""
  for fn in $existing_lambdas; do
    local fn_tags
    fn_tags=$(aws lambda list-tags --resource "arn:aws:lambda:${KERN_REGION:-eu-central-1}:$(aws sts get-caller-identity --query Account --output text):function:${fn}" \
      --query "Tags.Project" --output text 2>/dev/null || true)
    if [[ "$fn_tags" == "openkern" ]]; then
      existing_sites="$fn $existing_sites"
    fi
  done

  if [[ -n "${existing_sites// /}" ]]; then
    echo ""
    log_warn "Existing OpenKERN installation detected in this AWS account:"
    for fn in $existing_sites; do
      echo "    - $fn"
    done
    echo ""
    log_warn "The Starter plan includes one installation per account."
    log_warn "Running the installer again will share the same database."
    log_warn "For multiple installations, use separate AWS accounts or"
    log_warn "contact enterprise@kern.technology for a Professional plan."
    echo ""
    local continue_choice
    read -r -p "$(echo -e "${BOLD}Continue anyway? (yes/no)${NC} [no]: ")" continue_choice < /dev/tty
    if [[ "$continue_choice" != "yes" && "$continue_choice" != "y" ]]; then
      log_info "Aborted. To remove the existing installation, run:"
      echo "    curl -fsSL https://install.openkern.org/cleanup.sh | bash"
      exit 0
    fi
  fi
  echo ""
}


prompt_project() {
  echo -e "${BOLD}Project Configuration${NC}"
  echo "─────────────────────────────────────────────"
  echo ""

  PROJECT_NAME=$(prompt_value "Project name" "my-site")
  AWS_REGION=$(prompt_value "AWS region" "eu-central-1")
  echo ""

  echo "Theme:"
  echo "  [1] Minimal    — clean, modern, generous whitespace"
  echo "  [2] Bold       — dark, dynamic, gradients"
  echo "  [3] Corporate  — professional, structured, trustworthy"
  echo ""
  local theme_choice
  theme_choice=$(prompt_value "Choose theme" "1")

  case "$theme_choice" in
    1) TEMPLATE="minimal" ;;
    2) TEMPLATE="bold" ;;
    3) TEMPLATE="corporate" ;;
    *) TEMPLATE="minimal" ;;
  esac

  echo ""
}

prompt_admin() {
  echo -e "${BOLD}Payload CMS Admin Account${NC}"
  echo "─────────────────────────────────────────────"
  echo ""

  ADMIN_EMAIL=$(prompt_value "Admin email" "")
  read -r -s -p "$(echo -e "${BOLD}Admin password${NC} (min. 8 characters): ")" ADMIN_PASSWORD < /dev/tty
  echo ""

  while [ ${#ADMIN_PASSWORD} -lt 8 ]; do
    log_warn "Password must be at least 8 characters."
    read -r -s -p "$(echo -e "${BOLD}Admin password${NC}: ")" ADMIN_PASSWORD < /dev/tty
    echo ""
  done

  echo ""
}

confirm() {
  echo -e "${BOLD}Summary${NC}"
  echo "─────────────────────────────────────────────"
  echo ""
  echo "  Project:     $PROJECT_NAME"
  echo "  Theme:       $TEMPLATE"
  echo "  AWS Region:  $AWS_REGION"
  echo "  Admin:       $ADMIN_EMAIL"
  echo "  Database:    KERN Managed (automatic)"
  echo ""

  local proceed
  proceed=$(prompt_value "Deploy now?" "yes")

  if [[ "$proceed" != "yes" && "$proceed" != "y" ]]; then
    echo "Cancelled."
    exit 0
  fi

  echo ""
}

# ─── Deployment ──────────────────────────────────────────────────────────────

deploy() {
  echo -e "${BOLD}Deploying OpenKERN${NC}"
  echo "─────────────────────────────────────────────"
  echo ""

  local PAYLOAD_SECRET_KEY
  PAYLOAD_SECRET_KEY=$(openssl rand -hex 32)
  # Ensure sslmode=no-verify — Aurora RDS certs are not in Node.js default trust store.
  local DATABASE_URI
  if echo "$KERN_DATABASE_URI" | grep -q "sslmode="; then
    DATABASE_URI=$(echo "$KERN_DATABASE_URI" | sed 's/sslmode=[^&]*/sslmode=no-verify/')
  else
    DATABASE_URI="${KERN_DATABASE_URI}?sslmode=no-verify"
  fi

  # 1. Set up project directory
  local WORK_DIR
  WORK_DIR="$(pwd)/$PROJECT_NAME"
  if [[ -d "$WORK_DIR" ]]; then
    log_warn "Directory $PROJECT_NAME already exists."
    local overwrite
    read -r -p "$(echo -e "${BOLD}Overwrite and start fresh? (yes/no)${NC} [no]: ")" overwrite < /dev/tty
    if [[ "$overwrite" == "yes" || "$overwrite" == "y" ]]; then
      rm -rf "$WORK_DIR"
      log_ok "Removed existing directory."
    else
      log_info "Aborted. Remove the directory manually or choose a different project name."
      exit 0
    fi
  fi

  if [[ -n "$LOCAL_REPO" ]]; then
    log_info "Using local repo: $LOCAL_REPO"
    cp -r "$LOCAL_REPO" "$WORK_DIR"
    rm -rf "$WORK_DIR/.git"
  else
    log_info "Cloning OpenKERN repository..."
    git clone --depth 1 "$OPENKERN_REPO" "$PROJECT_NAME"
  fi
  cd "$WORK_DIR"

  log_info "Selected theme: $TEMPLATE"

  # 2. Write environment config
  log_info "Writing environment configuration..."
  cat > packages/cms/.env <<EOL
# OpenKERN — generated by installer ($(date -u +"%Y-%m-%dT%H:%M:%SZ"))
DATABASE_URI=${DATABASE_URI}
PAYLOAD_SECRET=${PAYLOAD_SECRET_KEY}
S3_BUCKET=placeholder-updated-after-infra
S3_REGION=${AWS_REGION}
NODE_ENV=production
EOL

  log_ok "Configuration written."

  # 3. Install dependencies
  log_info "Installing CMS dependencies..."
  cd packages/cms
  npm install
  log_ok "Dependencies installed."

  # 4. Deploy infrastructure with Pulumi
  log_info "Deploying AWS infrastructure (Lambda + S3 + CloudFront)..."
  log_info "This may take 3-5 minutes on first deploy..."

  cd "$WORK_DIR/packages/infra/pulumi/starter"
  npm install

  pulumi stack init "$PROJECT_NAME" --non-interactive 2>/dev/null || \
    pulumi stack select "$PROJECT_NAME" 2>/dev/null || true

  pulumi config set openkern:projectName "$PROJECT_NAME"
  pulumi config set --secret openkern:databaseUri "$DATABASE_URI"
  pulumi config set --secret openkern:payloadSecret "$PAYLOAD_SECRET_KEY"
  pulumi config set aws:region "$AWS_REGION"

  pulumi up --yes

  # Read outputs
  local SITE_URL ADMIN_URL ASSETS_BUCKET CF_DOMAIN
  SITE_URL=$(pulumi stack output siteUrl)
  ADMIN_URL=$(pulumi stack output adminUrl)
  ASSETS_BUCKET=$(pulumi stack output assetsBucketName)
  CF_DOMAIN=$(pulumi stack output distributionDomain)

  log_ok "Infrastructure deployed."
  log_info "Your site will be available at: https://${CF_DOMAIN}"

  # 5. Update .env with actual S3 bucket
  cd "$WORK_DIR"
  sed -i.bak "s|S3_BUCKET=placeholder-updated-after-infra|S3_BUCKET=$ASSETS_BUCKET|" packages/cms/.env
  rm -f packages/cms/.env.bak

  # 6. Build and deploy application with OpenNext
  log_info "Building and deploying application..."
  cd "$WORK_DIR"
  bash packages/installer/deploy.sh --stack-dir "$WORK_DIR/packages/infra/pulumi/starter"

  # 7. Set SERVER_URL on Lambda (needed for Payload admin UI)
  local SERVER_FUNCTION CF_URL API_HOST MEDIA_BUCKET
  SERVER_FUNCTION=$(cd "$WORK_DIR/packages/infra/pulumi/starter" && pulumi stack output lambdaFunctionName)
  MEDIA_BUCKET=$(cd "$WORK_DIR/packages/infra/pulumi/starter" && pulumi stack output mediaBucketName)
  CF_URL="https://${CF_DOMAIN}"
  # API Gateway origin for Server Actions trust (x-forwarded-host validation)
  API_HOST=$(cd "$WORK_DIR/packages/infra/pulumi/starter" && pulumi stack output apiUrl | sed 's|/$||')

  log_info "Setting SERVER_URL to ${CF_URL}..."
  aws lambda update-function-configuration \
    --function-name "$SERVER_FUNCTION" \
    --environment "Variables={DATABASE_URI=${DATABASE_URI},PAYLOAD_SECRET=${PAYLOAD_SECRET_KEY},S3_BUCKET=${MEDIA_BUCKET},S3_REGION=${AWS_REGION},CACHE_BUCKET_NAME=${MEDIA_BUCKET},CACHE_BUCKET_REGION=${AWS_REGION},NODE_ENV=production,SERVER_URL=${CF_URL},ALLOWED_ORIGINS=${API_HOST}}" \
    --region "$AWS_REGION" --output text > /dev/null
  aws lambda wait function-updated --function-name "$SERVER_FUNCTION" --region "$AWS_REGION"
  log_ok "SERVER_URL set."

  # 8. Run Payload migrations
  log_info "Running database migrations..."
  cd "$WORK_DIR/packages/cms"
  if [[ ! -d "src/migrations" ]] || [[ -z "$(ls -A src/migrations/ 2>/dev/null)" ]]; then
    log_info "Generating initial migration..."
    NODE_TLS_REJECT_UNAUTHORIZED=0 npx payload migrate:create initial
  fi
  NODE_TLS_REJECT_UNAUTHORIZED=0 npx payload migrate

  # 8b. Seed demo content
  log_info "Seeding demo content..."
  OPENKERN_THEME="$TEMPLATE" NODE_TLS_REJECT_UNAUTHORIZED=0 npx payload run src/seed/index.ts
  log_ok "Demo content created."

  # 9. Create initial admin user via Payload
  log_info "Creating admin user..."

  local SERVER_URL="${CF_URL}"

  # Wait for Lambda cold start
  sleep 5

  # Create admin user via Payload REST API (first-register endpoint)
  local REGISTER_RESPONSE
  REGISTER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "${SERVER_URL}api/users/first-register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" 2>/dev/null) || true

  if [[ "$REGISTER_RESPONSE" == "200" || "$REGISTER_RESPONSE" == "201" ]]; then
    log_ok "Admin user created."
  else
    log_warn "Could not auto-create admin user (HTTP $REGISTER_RESPONSE)."
    log_warn "Visit ${ADMIN_URL} to create your first admin account manually."
  fi

  # Offer to clean up Secrets Manager secret (no longer needed)
  if [[ "$KERN_USED_SECRET" == "true" ]]; then
    echo ""
    echo "─────────────────────────────────────────────"
    echo ""
    echo "  Your API token was read from AWS Secrets Manager (openkern/config)."
    echo "  It's now stored in your Pulumi config and no longer needed in Secrets Manager."
    echo "  Keeping it costs ~\$0.40/month."
    echo ""
    local cleanup
    cleanup=$(prompt_value "Delete openkern/config from Secrets Manager? (yes/no)" "yes")

    if [[ "$cleanup" == "yes" || "$cleanup" == "y" ]]; then
      if aws secretsmanager delete-secret --secret-id openkern/config \
        --force-delete-without-recovery --region "${AWS_REGION}" &> /dev/null; then
        log_ok "Secret openkern/config deleted."
      else
        log_warn "Could not delete secret. You can do it manually:"
        log_warn "  aws secretsmanager delete-secret --secret-id openkern/config --region eu-central-1"
      fi
    else
      log_info "Secret kept. Delete it anytime with:"
      log_info "  aws secretsmanager delete-secret --secret-id openkern/config --region eu-central-1"
    fi
  fi

  # Done
  echo ""
  log_ok "Deployment complete!"
  echo ""
  echo "─────────────────────────────────────────────"
  echo ""
  echo -e "  ${GREEN}Your site is live!${NC}"
  echo ""
  echo "  Site URL:    $SITE_URL"
  echo "  Admin:       $ADMIN_URL"
  echo "  Email:       $ADMIN_EMAIL"
  echo ""
  echo ""
  echo "  To redeploy after changes:"
  echo "    cd $WORK_DIR && bash packages/installer/deploy.sh"
  echo ""
  echo "─────────────────────────────────────────────"
}

# ─── Main ────────────────────────────────────────────────────────────────────

main() {
  print_banner
  preflight
  prompt_kern_token
  prompt_project
  prompt_admin
  confirm
  deploy
}

main "$@"
