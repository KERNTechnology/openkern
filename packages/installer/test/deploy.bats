#!/usr/bin/env bats
# Tests for deploy.sh — argument parsing, directory resolution

setup() {
  load setup.bash
}

# ─── Argument parsing ──────────────────────────────────────────────────────

@test "deploy rejects unknown options" {
  run bash "$INSTALLER_DIR/deploy.sh" --unknown
  [ "$status" -eq 1 ]
  [[ "$output" == *"Unknown option"* ]]
}

# ─── Script requires Pulumi stack ───────────────────────────────────────────

@test "deploy fails when pulumi stack has no outputs" {
  # Mock pulumi to fail on stack output
  create_failing_mock "pulumi" 1 "error: no stack"
  # Mock other commands so they don't cause unrelated errors
  create_mock "node" "v20.10.0"
  create_mock "aws" ""
  create_mock "npx" ""

  run bash "$INSTALLER_DIR/deploy.sh" --stack-dir /tmp
  [ "$status" -eq 1 ]
  [[ "$output" == *"Could not read"* ]]
}
