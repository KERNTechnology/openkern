#!/usr/bin/env bats
# Tests for install.sh — preflight checks, argument parsing, helpers

setup() {
  load setup.bash
  # Source install.sh functions without executing main
  source "$INSTALLER_DIR/install.sh"
}

# ─── check_command ──────────────────────────────────────────────────────────

@test "check_command succeeds when command exists" {
  create_mock "node" "v20.10.0"
  run check_command "node" "Node.js" "https://nodejs.org"
  [ "$status" -eq 0 ]
  [[ "$output" == *"[OK]"* ]]
  [[ "$output" == *"Node.js found"* ]]
}

@test "check_command fails when command is missing" {
  rm -f "$MOCK_BIN/nonexistent"
  run check_command "nonexistent" "Missing Tool" "https://example.com"
  [ "$status" -eq 1 ]
  [[ "$output" == *"[ERROR]"* ]]
  [[ "$output" == *"Missing Tool not found"* ]]
  [[ "$output" == *"https://example.com"* ]]
}

# ─── check_node_version ────────────────────────────────────────────────────

@test "check_node_version accepts Node.js 20" {
  create_mock "node" "v20.10.0"
  run check_node_version
  [ "$status" -eq 0 ]
  [[ "$output" == *"[OK]"* ]]
}

@test "check_node_version accepts Node.js 22" {
  create_mock "node" "v22.1.0"
  run check_node_version
  [ "$status" -eq 0 ]
}

@test "check_node_version rejects Node.js 18" {
  create_mock "node" "v18.19.0"
  run check_node_version
  [ "$status" -eq 1 ]
  [[ "$output" == *"Node.js >= 20 required"* ]]
}

@test "check_node_version rejects Node.js 16" {
  create_mock "node" "v16.20.2"
  run check_node_version
  [ "$status" -eq 1 ]
}

# ─── check_aws_credentials ─────────────────────────────────────────────────

@test "check_aws_credentials succeeds with valid credentials" {
  create_mock "aws" '{"Account": "123456789012", "UserId": "AIDA...", "Arn": "arn:aws:iam::123456789012:user/test"}'
  run check_aws_credentials
  [ "$status" -eq 0 ]
  [[ "$output" == *"[OK]"* ]]
  [[ "$output" == *"123456789012"* ]]
}

@test "check_aws_credentials fails with invalid credentials" {
  create_failing_mock "aws" 1 "Unable to locate credentials"
  run check_aws_credentials
  [ "$status" -eq 1 ]
  [[ "$output" == *"[ERROR]"* ]]
}

# ─── preflight ──────────────────────────────────────────────────────────────

@test "preflight passes with all dependencies present" {
  create_mock "node" "v20.10.0"
  create_mock "aws" '{"Account": "123456789012", "UserId": "AIDA...", "Arn": "arn:aws:iam::123456789012:user/test"}'
  create_mock "pulumi" "v3.100.0"
  run preflight
  [ "$status" -eq 0 ]
  [[ "$output" == *"All preflight checks passed"* ]]
}

@test "preflight fails when node is missing" {
  # Use restricted PATH so real node is not found, and don't create a mock
  export PATH="$MOCK_BIN:/usr/bin:/bin"
  create_mock "aws" '{"Account": "123456789012"}'
  create_mock "pulumi" "v3.100.0"
  run preflight
  [ "$status" -eq 1 ]
  [[ "$output" == *"Node.js not found"* ]]
}

@test "preflight fails when aws cli is missing" {
  export PATH="$MOCK_BIN:/usr/bin:/bin"
  create_mock "node" "v20.10.0"
  create_mock "pulumi" "v3.100.0"
  run preflight
  [ "$status" -eq 1 ]
}

@test "preflight fails when pulumi is missing" {
  export PATH="$MOCK_BIN:/usr/bin:/bin"
  create_mock "node" "v20.10.0"
  create_mock "aws" '{"Account": "123456789012", "UserId": "AIDA...", "Arn": "arn:aws:iam::123456789012:user/test"}'
  run preflight
  [ "$status" -eq 1 ]
}

# ─── print_banner ───────────────────────────────────────────────────────────

@test "print_banner shows version" {
  run print_banner
  [ "$status" -eq 0 ]
  [[ "$output" == *"Self-installable"* ]]
  [[ "$output" == *"0.1.0"* ]]
}

# ─── Global flag parsing ───────────────────────────────────────────────────

@test "LOCAL_REPO is empty by default" {
  [ -z "$LOCAL_REPO" ]
}

# ─── Database URI sslmode handling ──────────────────────────────────────────

@test "DATABASE_URI gets sslmode=no-verify appended when missing" {
  KERN_DATABASE_URI="postgresql://host:5432/db"
  local DATABASE_URI
  if [[ "$KERN_DATABASE_URI" == *"sslmode="* ]]; then
    DATABASE_URI="${KERN_DATABASE_URI/sslmode=*/sslmode=no-verify}"
  else
    DATABASE_URI="${KERN_DATABASE_URI}?sslmode=no-verify"
  fi
  [ "$DATABASE_URI" = "postgresql://host:5432/db?sslmode=no-verify" ]
}

@test "DATABASE_URI replaces existing sslmode" {
  KERN_DATABASE_URI="postgresql://host:5432/db?sslmode=require"
  local DATABASE_URI
  if [[ "$KERN_DATABASE_URI" == *"sslmode="* ]]; then
    DATABASE_URI="${KERN_DATABASE_URI/sslmode=*/sslmode=no-verify}"
  else
    DATABASE_URI="${KERN_DATABASE_URI}?sslmode=no-verify"
  fi
  [ "$DATABASE_URI" = "postgresql://host:5432/db?sslmode=no-verify" ]
}

# ─── Color output ───────────────────────────────────────────────────────────

@test "log_info outputs with INFO prefix" {
  run log_info "test message"
  [ "$status" -eq 0 ]
  [[ "$output" == *"INFO"* ]]
  [[ "$output" == *"test message"* ]]
}

@test "log_ok outputs with OK prefix" {
  run log_ok "success"
  [ "$status" -eq 0 ]
  [[ "$output" == *"OK"* ]]
  [[ "$output" == *"success"* ]]
}

@test "log_error outputs with ERROR prefix" {
  run log_error "failure"
  [ "$status" -eq 0 ]
  [[ "$output" == *"ERROR"* ]]
  [[ "$output" == *"failure"* ]]
}

@test "log_warn outputs with WARN prefix" {
  run log_warn "warning"
  [ "$status" -eq 0 ]
  [[ "$output" == *"WARN"* ]]
  [[ "$output" == *"warning"* ]]
}
