#!/usr/bin/env bats
# Tests for cleanup.sh — argument parsing, help output

setup() {
  load setup.bash
}

# ─── Argument parsing ──────────────────────────────────────────────────────

@test "cleanup --help shows usage" {
  run bash "$INSTALLER_DIR/cleanup.sh" --help
  [ "$status" -eq 0 ]
  [[ "$output" == *"Usage:"* ]]
  [[ "$output" == *"--destroy"* ]]
  [[ "$output" == *"--site"* ]]
  [[ "$output" == *"--region"* ]]
}

@test "cleanup rejects unknown options" {
  run bash "$INSTALLER_DIR/cleanup.sh" --invalid-flag
  [ "$status" -eq 1 ]
  [[ "$output" == *"Unknown option"* ]]
}

# ─── Requires AWS CLI ──────────────────────────────────────────────────────

@test "cleanup fails when aws cli is not found" {
  # Use only MOCK_BIN + essential system dirs (no aws anywhere)
  export PATH="$MOCK_BIN:/usr/bin:/bin"
  remove_from_path "aws"
  run bash "$INSTALLER_DIR/cleanup.sh"
  [ "$status" -eq 1 ]
  [[ "$output" == *"AWS CLI not found"* ]]
}
