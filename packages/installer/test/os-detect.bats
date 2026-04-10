#!/usr/bin/env bats
# Tests for OS detection and WSL support in install.sh

setup() {
  load setup.bash
  source "$INSTALLER_DIR/install.sh"
}

# ─── detect_os ──────────────────────────────────────────────────────────────

@test "detect_os sets OS_TYPE based on uname" {
  detect_os
  # We're running on macOS or Linux — either way OS_TYPE should be set
  [[ "$OS_TYPE" == "linux" || "$OS_TYPE" == "macos" ]]
}

@test "detect_os sets IS_WSL to false on non-WSL systems" {
  detect_os
  # On macOS and native Linux, IS_WSL should be false
  # (WSL detection checks /proc/version for 'microsoft')
  if [[ "$(uname -s)" == "Darwin" ]]; then
    [ "$IS_WSL" = "false" ]
  fi
}

@test "detect_os detects macOS correctly" {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    skip "Only runs on macOS"
  fi
  detect_os
  [ "$OS_TYPE" = "macos" ]
  [ "$OS_DISTRO" = "macos" ]
}

@test "detect_os detects Linux correctly" {
  if [[ "$(uname -s)" != "Linux" ]]; then
    skip "Only runs on Linux"
  fi
  detect_os
  [ "$OS_TYPE" = "linux" ]
  [ -n "$PKG_MANAGER" ]
}

@test "detect_os identifies apt-get on Debian/Ubuntu" {
  if [[ "$(uname -s)" != "Linux" ]] || ! command -v apt-get &>/dev/null; then
    skip "Only runs on Debian/Ubuntu"
  fi
  detect_os
  [ "$OS_DISTRO" = "debian" ]
  [ "$PKG_MANAGER" = "apt-get" ]
}

# ─── show_wsl_hints ────────────────────────────────────────────────────────

@test "show_wsl_hints produces no output when not WSL" {
  IS_WSL=false
  run show_wsl_hints
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

@test "show_wsl_hints shows hints when WSL is detected" {
  IS_WSL=true
  run show_wsl_hints
  [ "$status" -eq 0 ]
  [[ "$output" == *"WSL Detected"* ]]
  [[ "$output" == *"aws configure"* ]]
}

# ─── auto_install_deps ─────────────────────────────────────────────────────

@test "auto_install_deps reports all present when deps exist" {
  create_mock "node" "v20.10.0"
  create_mock "aws" "aws-cli/2.0.0"
  create_mock "pulumi" "v3.100.0"
  OS_TYPE="linux"
  run auto_install_deps
  [ "$status" -eq 0 ]
  [[ "$output" == *"All dependencies already installed"* ]]
}

@test "auto_install_deps detects missing node" {
  export PATH="$MOCK_BIN:/usr/bin:/bin"
  create_mock "aws" "aws-cli/2.0.0"
  create_mock "pulumi" "v3.100.0"
  OS_TYPE="macos"
  run auto_install_deps
  [ "$status" -eq 1 ]
  [[ "$output" == *"Missing dependencies: node"* ]]
  [[ "$output" == *"Auto-install is only supported on Linux"* ]]
}

@test "auto_install_deps detects outdated node" {
  create_mock "node" "v18.19.0"
  create_mock "aws" "aws-cli/2.0.0"
  create_mock "pulumi" "v3.100.0"
  OS_TYPE="macos"
  run auto_install_deps
  [ "$status" -eq 1 ]
  [[ "$output" == *"Missing dependencies: node"* ]]
}

# ─── --auto-deps flag ──────────────────────────────────────────────────────

@test "AUTO_DEPS defaults to false" {
  [ "$AUTO_DEPS" = "false" ]
}
