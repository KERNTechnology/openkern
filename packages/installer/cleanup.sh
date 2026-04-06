#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# OpenKERN Cleanup
# Discovers and removes AWS resources created by OpenKERN installations.
#
# Usage:
#   ./cleanup.sh                  # Scan all OpenKERN resources
#   ./cleanup.sh --site my-site   # Scan resources for a specific installation
#   ./cleanup.sh --destroy        # Destroy all OpenKERN resources (interactive)
#   ./cleanup.sh --destroy --site my-site  # Destroy a specific installation
#   ./cleanup.sh --destroy --yes  # Skip confirmation prompts
#
# All resources are identified by the tag: Project=openkern
# Resources are grouped by the tag: Site=<project-name>
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

MODE="scan"
SITE_FILTER=""
SKIP_CONFIRM=false
REGION="${AWS_REGION:-eu-central-1}"

while [[ $# -gt 0 ]]; do
  case $1 in
    --destroy) MODE="destroy"; shift ;;
    --site) SITE_FILTER="$2"; shift 2 ;;
    --region) REGION="$2"; shift 2 ;;
    --yes|-y) SKIP_CONFIRM=true; shift ;;
    --help|-h)
      echo "Usage: cleanup.sh [--destroy] [--site <name>] [--region <region>] [--yes]"
      echo ""
      echo "  --destroy         Remove resources (default: scan only)"
      echo "  --site <name>     Filter by installation name (Site tag)"
      echo "  --region <region> AWS region (default: eu-central-1)"
      echo "  --yes             Skip confirmation prompts"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

info()  { echo -e "${BLUE}[openkern]${NC} $1"; }
warn()  { echo -e "${YELLOW}[openkern]${NC} $1"; }
ok()    { echo -e "${GREEN}[openkern]${NC} $1"; }
err()   { echo -e "${RED}[openkern]${NC} $1"; }
header() { echo ""; echo -e "${BOLD}$1${NC}"; echo ""; }

# ── Preflight ────────────────────────────────────────────────────────────────

if ! command -v aws &>/dev/null; then
  err "AWS CLI not found. Install it: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null) || {
  err "AWS credentials not configured. Run: aws configure"
  exit 1
}

info "AWS Account: ${BOLD}${ACCOUNT_ID}${NC}"
info "Region:      ${BOLD}${REGION}${NC}"
info "Mode:        ${BOLD}${MODE}${NC}"
[[ -n "$SITE_FILTER" ]] && info "Site filter: ${BOLD}${SITE_FILTER}${NC}"

# ── Resource Discovery ───────────────────────────────────────────────────────

SITE_NAMES="" # newline-separated list of site names (may have duplicates)

# Helper: add to site tracking
track() {
  SITE_NAMES="${SITE_NAMES}${1}
"
}

header "Scanning for OpenKERN resources..."

# --- CloudFront Distributions ---
DISTRIBUTIONS=()
info "Checking CloudFront distributions..."
CF_LIST=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment!=null && contains(Comment, 'OpenKERN')].[Id,Comment,DomainName,Status]" --output text 2>/dev/null || true)
if [[ -n "$CF_LIST" ]]; then
  while IFS=$'\t' read -r id comment domain status; do
    # Extract site name from comment "OpenKERN: <site>"
    site=$(echo "$comment" | sed -n 's/^OpenKERN: //p')
    [[ -n "$SITE_FILTER" && "$site" != "$SITE_FILTER" ]] && continue
    DISTRIBUTIONS+=("$id|$site|$domain|$status")
    track "$site"
    echo "  CloudFront  $id  ($domain)  site=$site  status=$status"
  done <<< "$CF_LIST"
fi

# Also check by tags for distributions without OpenKERN in comment
CF_TAGGED=$(aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Project,Values=openkern \
  --resource-type-filters cloudfront:distribution \
  --region us-east-1 \
  --query "ResourceTagMappingList[].{ARN:ResourceARN,Tags:Tags}" \
  --output json 2>/dev/null || echo "[]")

if [[ "$CF_TAGGED" != "[]" ]]; then
  while IFS= read -r arn; do
    id=$(echo "$arn" | grep -o '[^/]*$')
    # Skip if already found
    if printf '%s\n' ${DISTRIBUTIONS[@]+"${DISTRIBUTIONS[@]}"} | grep -q "^${id}|" 2>/dev/null; then
      continue
    fi
    site=$(aws resourcegroupstaggingapi get-resources \
      --tag-filters Key=Project,Values=openkern \
      --resource-type-filters cloudfront:distribution \
      --region us-east-1 \
      --query "ResourceTagMappingList[?ResourceARN=='${arn}'].Tags[?Key=='Site'].Value | [0][0]" \
      --output text 2>/dev/null || echo "unknown")
    [[ -n "$SITE_FILTER" && "$site" != "$SITE_FILTER" ]] && continue
    domain=$(aws cloudfront get-distribution --id "$id" --query "Distribution.DomainName" --output text 2>/dev/null || echo "?")
    status=$(aws cloudfront get-distribution --id "$id" --query "Distribution.Status" --output text 2>/dev/null || echo "?")
    DISTRIBUTIONS+=("$id|$site|$domain|$status")
    track "$site"
    echo "  CloudFront  $id  ($domain)  site=$site  status=$status"
  done < <(echo "$CF_TAGGED" | python3 -c "import sys,json; [print(r['ARN']) for r in json.load(sys.stdin)]" 2>/dev/null || true)
fi

# --- S3 Buckets ---
BUCKETS=()
info "Checking S3 buckets..."
ALL_BUCKETS=$(aws s3api list-buckets --query "Buckets[].Name" --output text 2>/dev/null || true)
for bucket in $ALL_BUCKETS; do
  # Check if bucket has OpenKERN tags
  bucket_tags=$(aws s3api get-bucket-tagging --bucket "$bucket" --query "TagSet" --output json 2>/dev/null || echo "[]")
  is_openkern=$(echo "$bucket_tags" | python3 -c "import sys,json; tags={t['Key']:t['Value'] for t in json.load(sys.stdin)}; print('yes' if tags.get('Project')=='openkern' else 'no')" 2>/dev/null || echo "no")
  if [[ "$is_openkern" == "yes" ]]; then
    site=$(echo "$bucket_tags" | python3 -c "import sys,json; tags={t['Key']:t['Value'] for t in json.load(sys.stdin)}; print(tags.get('Site','unknown'))" 2>/dev/null || echo "unknown")
    [[ -n "$SITE_FILTER" && "$site" != "$SITE_FILTER" ]] && continue
    obj_count=$(aws s3api list-objects-v2 --bucket "$bucket" --query "KeyCount" --output text 2>/dev/null || echo "?")
    BUCKETS+=("$bucket|$site|$obj_count")
    track "$site"
    echo "  S3 Bucket   $bucket  ($obj_count objects)  site=$site"
  fi
done

# --- Lambda Functions ---
LAMBDAS=()
info "Checking Lambda functions..."
LAMBDA_LIST=$(aws lambda list-functions --region "$REGION" --query "Functions[].FunctionName" --output text 2>/dev/null || true)
for fn in $LAMBDA_LIST; do
  fn_tags=$(aws lambda list-tags --resource "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${fn}" --query "Tags" --output json 2>/dev/null || echo "{}")
  is_openkern=$(echo "$fn_tags" | python3 -c "import sys,json; t=json.load(sys.stdin); print('yes' if t.get('Project')=='openkern' else 'no')" 2>/dev/null || echo "no")
  if [[ "$is_openkern" == "yes" ]]; then
    site=$(echo "$fn_tags" | python3 -c "import sys,json; print(json.load(sys.stdin).get('Site','unknown'))" 2>/dev/null || echo "unknown")
    [[ -n "$SITE_FILTER" && "$site" != "$SITE_FILTER" ]] && continue
    LAMBDAS+=("$fn|$site")
    track "$site"
    echo "  Lambda      $fn  site=$site"
  fi
done

# --- API Gateways ---
APIS=()
info "Checking API Gateway HTTP APIs..."
API_LIST=$(aws apigatewayv2 get-apis --region "$REGION" --query "Items[].{Id:ApiId,Name:Name,Tags:Tags}" --output json 2>/dev/null || echo "[]")
while IFS=$'\t' read -r id name site; do
  [[ -z "$id" || "$id" == "None" ]] && continue
  [[ -n "$SITE_FILTER" && "$site" != "$SITE_FILTER" ]] && continue
  APIS+=("$id|$site|$name")
  track "$site"
  echo "  API Gateway $id  ($name)  site=$site"
done < <(echo "$API_LIST" | python3 -c "
import sys, json
for api in json.load(sys.stdin):
    tags = api.get('Tags') or {}
    if tags.get('Project') == 'openkern':
        print(f\"{api['Id']}\t{api.get('Name','?')}\t{tags.get('Site','unknown')}\")
" 2>/dev/null || true)

# --- IAM Roles ---
ROLES=()
info "Checking IAM roles..."
ROLE_LIST=$(aws iam list-roles --query "Roles[?contains(RoleName, 'openkern') || contains(RoleName, '-lambda-role') || contains(RoleName, '-image-role')].RoleName" --output text 2>/dev/null || true)
for role in $ROLE_LIST; do
  role_tags=$(aws iam list-role-tags --role-name "$role" --query "Tags" --output json 2>/dev/null || echo "[]")
  is_openkern=$(echo "$role_tags" | python3 -c "import sys,json; tags={t['Key']:t['Value'] for t in json.load(sys.stdin)}; print('yes' if tags.get('Project')=='openkern' else 'no')" 2>/dev/null || echo "no")
  if [[ "$is_openkern" == "yes" ]]; then
    site=$(echo "$role_tags" | python3 -c "import sys,json; tags={t['Key']:t['Value'] for t in json.load(sys.stdin)}; print(tags.get('Site','unknown'))" 2>/dev/null || echo "unknown")
    [[ -n "$SITE_FILTER" && "$site" != "$SITE_FILTER" ]] && continue
    ROLES+=("$role|$site")
    track "$site"
    echo "  IAM Role    $role  site=$site"
  fi
done

# --- CloudWatch Log Groups ---
LOGGROUPS=()
info "Checking CloudWatch log groups..."
for fn_entry in ${LAMBDAS[@]+"${LAMBDAS[@]}"}; do
  fn="${fn_entry%%|*}"
  site="${fn_entry#*|}"
  lg="/aws/lambda/$fn"
  if aws logs describe-log-groups --log-group-name-prefix "$lg" --region "$REGION" --query "logGroups[0].logGroupName" --output text 2>/dev/null | grep -q "$lg"; then
    LOGGROUPS+=("$lg|$site")
    echo "  Log Group   $lg  site=$site"
  fi
done

# --- Secrets Manager ---
SECRETS=()
info "Checking Secrets Manager..."
SECRET_LIST=$(aws secretsmanager list-secrets --region "$REGION" --filters Key=name,Values=openkern --query "SecretList[].{Name:Name,ARN:ARN}" --output text 2>/dev/null || true)
if [[ -n "$SECRET_LIST" ]]; then
  while IFS=$'\t' read -r name arn; do
    SECRETS+=("$name|$arn")
    echo "  Secret      $name"
  done <<< "$SECRET_LIST"
fi

# ── Summary ──────────────────────────────────────────────────────────────────

header "Summary"

TOTAL=$(( ${#DISTRIBUTIONS[@]} + ${#BUCKETS[@]} + ${#LAMBDAS[@]} + ${#APIS[@]} + ${#ROLES[@]} + ${#LOGGROUPS[@]} + ${#SECRETS[@]} ))

if [[ $TOTAL -eq 0 ]]; then
  ok "No OpenKERN resources found. Your account is clean."
  exit 0
fi

echo -e "  ${BOLD}Installations found:${NC}"
for site in $(echo "$SITE_NAMES" | sort -u); do
  [[ -z "$site" ]] && continue
  count=$(echo "$SITE_NAMES" | grep -cx "$site")
  echo -e "    ${GREEN}${site}${NC} — ${count} resources"
done
echo ""
echo -e "  ${BOLD}Resource breakdown:${NC}"
echo "    CloudFront distributions: ${#DISTRIBUTIONS[@]}"
echo "    S3 buckets:               ${#BUCKETS[@]}"
echo "    Lambda functions:         ${#LAMBDAS[@]}"
echo "    API Gateways:             ${#APIS[@]}"
echo "    IAM roles:                ${#ROLES[@]}"
echo "    CloudWatch log groups:    ${#LOGGROUPS[@]}"
echo "    Secrets:                  ${#SECRETS[@]}"
echo "    ─────────────────────────────"
echo -e "    ${BOLD}Total: ${TOTAL} resources${NC}"

if [[ "$MODE" == "scan" ]]; then
  echo ""
  info "This was a scan only. To remove these resources, run:"
  if [[ -n "$SITE_FILTER" ]]; then
    echo -e "    ${BOLD}./cleanup.sh --destroy --site ${SITE_FILTER}${NC}"
  else
    echo -e "    ${BOLD}./cleanup.sh --destroy${NC}"
  fi
  exit 0
fi

# ── Destroy Mode ─────────────────────────────────────────────────────────────

header "DESTROY MODE"

if [[ "$SKIP_CONFIRM" != true ]]; then
  warn "This will permanently delete ${TOTAL} resources in account ${ACCOUNT_ID}."
  warn "This action CANNOT be undone."
  echo ""
  read -rp "Type 'destroy' to confirm: " CONFIRM
  if [[ "$CONFIRM" != "destroy" ]]; then
    err "Aborted."
    exit 1
  fi
fi

# Order matters: CloudFront → API GW → Lambda → S3 → IAM → Logs → Secrets

# 1. Disable and delete CloudFront distributions
for entry in ${DISTRIBUTIONS[@]+"${DISTRIBUTIONS[@]}"}; do
  IFS='|' read -r id site domain status <<< "$entry"
  info "Disabling CloudFront distribution $id ($site)..."

  # Get current config
  ETAG=$(aws cloudfront get-distribution-config --id "$id" --query "ETag" --output text 2>/dev/null || true)
  if [[ -n "$ETAG" && "$ETAG" != "None" ]]; then
    CONFIG=$(aws cloudfront get-distribution-config --id "$id" --query "DistributionConfig" --output json 2>/dev/null || true)

    if echo "$CONFIG" | python3 -c "import sys,json; c=json.load(sys.stdin); print('yes' if c.get('Enabled') else 'no')" 2>/dev/null | grep -q "yes"; then
      DISABLED_CONFIG=$(echo "$CONFIG" | python3 -c "import sys,json; c=json.load(sys.stdin); c['Enabled']=False; json.dump(c,sys.stdout)")
      aws cloudfront update-distribution --id "$id" --if-match "$ETAG" --distribution-config "$DISABLED_CONFIG" --output text >/dev/null 2>&1 || true
      info "Waiting for distribution $id to disable (this can take a few minutes)..."
      aws cloudfront wait distribution-deployed --id "$id" 2>/dev/null || {
        warn "CloudFront $id still deploying. You may need to delete it manually later."
        continue
      }
    fi

    # Get new ETag after disabling
    ETAG=$(aws cloudfront get-distribution-config --id "$id" --query "ETag" --output text 2>/dev/null || true)
    aws cloudfront delete-distribution --id "$id" --if-match "$ETAG" 2>/dev/null && \
      ok "Deleted CloudFront distribution $id" || \
      warn "Could not delete CloudFront $id — may still be deploying. Retry later."
  fi
done

# 2. Delete API Gateways
for entry in ${APIS[@]+"${APIS[@]}"}; do
  IFS='|' read -r id site name <<< "$entry"
  info "Deleting API Gateway $id ($name)..."
  # Delete stages first
  STAGES=$(aws apigatewayv2 get-stages --api-id "$id" --region "$REGION" --query "Items[].StageName" --output text 2>/dev/null || true)
  for stage in $STAGES; do
    [[ "$stage" == '$default' ]] && continue # $default stage is deleted with the API
    aws apigatewayv2 delete-stage --api-id "$id" --stage-name "$stage" --region "$REGION" 2>/dev/null || true
  done
  aws apigatewayv2 delete-api --api-id "$id" --region "$REGION" 2>/dev/null && \
    ok "Deleted API Gateway $id" || \
    warn "Could not delete API Gateway $id"
done

# 3. Delete Lambda functions
for entry in ${LAMBDAS[@]+"${LAMBDAS[@]}"}; do
  IFS='|' read -r fn site <<< "$entry"
  info "Deleting Lambda function $fn..."
  aws lambda delete-function --function-name "$fn" --region "$REGION" 2>/dev/null && \
    ok "Deleted Lambda $fn" || \
    warn "Could not delete Lambda $fn"
done

# 4. Empty and delete S3 buckets
for entry in ${BUCKETS[@]+"${BUCKETS[@]}"}; do
  IFS='|' read -r bucket site obj_count <<< "$entry"
  info "Emptying S3 bucket $bucket ($obj_count objects)..."

  # Delete all object versions (handles versioned buckets too)
  aws s3 rm "s3://$bucket" --recursive --region "$REGION" 2>/dev/null || true

  # Also clean up any versioned objects / delete markers
  VERSIONS=$(aws s3api list-object-versions --bucket "$bucket" --query "[Versions,DeleteMarkers][].[Key,VersionId]" --output text 2>/dev/null || true)
  if [[ -n "$VERSIONS" ]]; then
    while IFS=$'\t' read -r key version_id; do
      [[ -z "$key" || "$key" == "None" ]] && continue
      aws s3api delete-object --bucket "$bucket" --key "$key" --version-id "$version_id" 2>/dev/null || true
    done <<< "$VERSIONS"
  fi

  info "Deleting S3 bucket $bucket..."
  aws s3api delete-bucket --bucket "$bucket" --region "$REGION" 2>/dev/null && \
    ok "Deleted S3 bucket $bucket" || \
    warn "Could not delete S3 bucket $bucket — may have remaining objects"
done

# 5. Delete IAM roles (must detach policies first)
for entry in ${ROLES[@]+"${ROLES[@]}"}; do
  IFS='|' read -r role site <<< "$entry"
  info "Cleaning up IAM role $role..."

  # Detach managed policies
  ATTACHED=$(aws iam list-attached-role-policies --role-name "$role" --query "AttachedPolicies[].PolicyArn" --output text 2>/dev/null || true)
  for policy_arn in $ATTACHED; do
    aws iam detach-role-policy --role-name "$role" --policy-arn "$policy_arn" 2>/dev/null || true
  done

  # Delete inline policies
  INLINE=$(aws iam list-role-policies --role-name "$role" --query "PolicyNames[]" --output text 2>/dev/null || true)
  for policy_name in $INLINE; do
    aws iam delete-role-policy --role-name "$role" --policy-name "$policy_name" 2>/dev/null || true
  done

  aws iam delete-role --role-name "$role" 2>/dev/null && \
    ok "Deleted IAM role $role" || \
    warn "Could not delete IAM role $role"
done

# 6. Delete CloudWatch log groups
for entry in ${LOGGROUPS[@]+"${LOGGROUPS[@]}"}; do
  IFS='|' read -r lg site <<< "$entry"
  info "Deleting log group $lg..."
  aws logs delete-log-group --log-group-name "$lg" --region "$REGION" 2>/dev/null && \
    ok "Deleted log group $lg" || \
    warn "Could not delete log group $lg"
done

# 7. Delete Secrets Manager secrets
for entry in ${SECRETS[@]+"${SECRETS[@]}"}; do
  IFS='|' read -r name arn <<< "$entry"
  info "Deleting secret $name..."
  aws secretsmanager delete-secret --secret-id "$name" --force-delete-without-recovery --region "$REGION" 2>/dev/null && \
    ok "Deleted secret $name" || \
    warn "Could not delete secret $name"
done

# ── Done ─────────────────────────────────────────────────────────────────────

header "Cleanup complete"

ok "Removed ${TOTAL} OpenKERN resources from account ${ACCOUNT_ID}."
echo ""
info "Optional: If you used Pulumi, also remove the stack state:"
echo "    pulumi stack rm <stack-name> --yes"
echo ""
info "If any CloudFront distributions were still deploying, re-run this script"
echo "    in a few minutes to finish deleting them."
