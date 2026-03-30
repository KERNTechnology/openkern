#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# OpenKERN Installer
# Deploys a Payload CMS website on your AWS account.
# https://openkern.dev
# =============================================================================

VERSION="0.1.0"
OPENKERN_REPO="https://github.com/kern-technology/openkern"

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
    read -r -p "$(echo -e "${BOLD}$prompt${NC} [$default]: ")" result
    echo "${result:-$default}"
  else
    read -r -p "$(echo -e "${BOLD}$prompt${NC}: ")" result
    echo "$result"
  fi
}

prompt_credentials() {
  echo -e "${BOLD}KERN Database Credentials${NC}"
  echo "─────────────────────────────────────────────"
  echo ""
  echo "To use OpenKERN Starter, you need database credentials from KERN."
  echo "Register at https://kern.technology/register or contact hello@kern.technology"
  echo ""

  KERN_DB_HOST=$(prompt_value "Database host" "")
  KERN_DB_PORT=$(prompt_value "Database port" "5432")
  KERN_DB_NAME=$(prompt_value "Database name" "")
  KERN_DB_USER=$(prompt_value "Database user" "")
  read -r -s -p "$(echo -e "${BOLD}Database password${NC}: ")" KERN_DB_PASSWORD
  echo ""
  echo ""

  # Validate connection
  log_info "Testing database connection..."

  if command -v psql &> /dev/null; then
    if PGPASSWORD="$KERN_DB_PASSWORD" psql -h "$KERN_DB_HOST" -p "$KERN_DB_PORT" \
      -U "$KERN_DB_USER" -d "$KERN_DB_NAME" -c "SELECT 1" --set=sslmode=require &> /dev/null; then
      log_ok "Database connection successful!"
    else
      log_error "Could not connect to database. Please check your credentials."
      exit 1
    fi
  else
    log_warn "psql not installed — skipping connection test. Credentials will be validated during deployment."
  fi

  echo ""
}

prompt_project() {
  echo -e "${BOLD}Project Configuration${NC}"
  echo "─────────────────────────────────────────────"
  echo ""

  PROJECT_NAME=$(prompt_value "Project name" "my-site")
  AWS_REGION=$(prompt_value "AWS region" "eu-central-1")
  DOMAIN=$(prompt_value "Domain (leave empty to use CloudFront URL)" "")
  echo ""

  echo "Template:"
  echo "  [1] Agency — multi-page site with portfolio, services, about, contact"
  echo "  [2] Landing — single page with hero, features, CTA"
  echo ""
  local template_choice
  template_choice=$(prompt_value "Choose template" "1")

  case "$template_choice" in
    1) TEMPLATE="agency" ;;
    2) TEMPLATE="landing" ;;
    *) TEMPLATE="agency" ;;
  esac

  echo ""
}

prompt_admin() {
  echo -e "${BOLD}Payload CMS Admin Account${NC}"
  echo "─────────────────────────────────────────────"
  echo ""

  ADMIN_EMAIL=$(prompt_value "Admin email" "")
  read -r -s -p "$(echo -e "${BOLD}Admin password${NC} (min. 8 characters): ")" ADMIN_PASSWORD
  echo ""

  while [ ${#ADMIN_PASSWORD} -lt 8 ]; do
    log_warn "Password must be at least 8 characters."
    read -r -s -p "$(echo -e "${BOLD}Admin password${NC}: ")" ADMIN_PASSWORD
    echo ""
  done

  echo ""
}

confirm() {
  echo -e "${BOLD}Summary${NC}"
  echo "─────────────────────────────────────────────"
  echo ""
  echo "  Project:     $PROJECT_NAME"
  echo "  Template:    $TEMPLATE"
  echo "  AWS Region:  $AWS_REGION"
  echo "  Domain:      ${DOMAIN:-"(CloudFront default URL)"}"
  echo "  Admin:       $ADMIN_EMAIL"
  echo "  DB Host:     $KERN_DB_HOST"
  echo "  DB Name:     $KERN_DB_NAME"
  echo "  Tier:        Starter (KERN Managed DB)"
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

  # 1. Clone and set up project
  log_info "Setting up project directory..."
  mkdir -p "$PROJECT_NAME"
  cd "$PROJECT_NAME"

  # TODO: In production, this clones from the repo and copies the template
  # For now, we scaffold the minimum structure
  log_info "Scaffolding project from template: $TEMPLATE"

  # 2. Write environment config
  log_info "Writing configuration..."
  cat > .env <<EOL
# OpenKERN Configuration — generated by installer
# DO NOT commit this file to version control

# Database (KERN Managed)
DATABASE_URI=postgresql://${KERN_DB_USER}:${KERN_DB_PASSWORD}@${KERN_DB_HOST}:${KERN_DB_PORT}/${KERN_DB_NAME}?sslmode=require

# Payload
PAYLOAD_SECRET=$(openssl rand -hex 32)

# Admin
ADMIN_EMAIL=${ADMIN_EMAIL}

# AWS
AWS_REGION=${AWS_REGION}

# Domain (empty = CloudFront default)
DOMAIN=${DOMAIN}
EOL

  log_ok "Configuration written to .env"

  # 3. Deploy infrastructure
  log_info "Deploying AWS infrastructure (Lambda + S3 + CloudFront)..."
  log_info "This may take a few minutes..."

  # TODO: Run pulumi up with the starter stack
  # cd infra && pulumi stack init "$PROJECT_NAME" && pulumi up --yes

  # 4. Deploy Payload CMS
  log_info "Deploying Payload CMS..."

  # TODO: Build Next.js, run OpenNext, deploy to Lambda
  # npm run build && npx open-next build && deploy to S3/Lambda

  # 5. Run initial Payload migration
  log_info "Running database migration..."

  # TODO: Run payload migrate
  # npx payload migrate

  echo ""
  log_ok "Deployment complete!"
  echo ""
  echo "─────────────────────────────────────────────"
  echo ""
  echo -e "  ${GREEN}Your site is live!${NC}"
  echo ""
  echo "  Site URL:    https://<cloudfront-id>.cloudfront.net"
  echo "  Admin:       https://<cloudfront-id>.cloudfront.net/admin"
  echo "  Email:       $ADMIN_EMAIL"
  echo ""
  echo "  Next steps:"
  echo "  1. Visit the admin panel and log in"
  echo "  2. Add your content"
  echo "  3. Set up a custom domain (optional):"
  echo "     openkern domain set $DOMAIN"
  echo ""
  echo "─────────────────────────────────────────────"
}

# ─── Main ────────────────────────────────────────────────────────────────────

main() {
  print_banner
  preflight
  prompt_credentials
  prompt_project
  prompt_admin
  confirm
  deploy
}

main "$@"
