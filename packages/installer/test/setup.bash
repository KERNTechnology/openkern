#!/usr/bin/env bash
# Common test setup — sourced by each .bats file via setup()

INSTALLER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Save the original PATH so tests can restore system commands
export ORIGINAL_PATH="$PATH"

# Create a temp directory for mock binaries
export MOCK_BIN
MOCK_BIN="$(mktemp -d)"

# Prepend mock bin to PATH so mocked commands take precedence
export PATH="$MOCK_BIN:$PATH"

# Create a mock command that succeeds with optional stdout
# Usage: create_mock <command> [stdout_output]
create_mock() {
  local cmd="$1"
  local output="${2:-}"
  # Write output to a data file to avoid heredoc quoting issues
  printf '%s\n' "$output" > "$MOCK_BIN/${cmd}.out"
  cat > "$MOCK_BIN/$cmd" <<'SCRIPT'
#!/usr/bin/env bash
cat "$(dirname "$0")/$(basename "$0").out"
SCRIPT
  chmod +x "$MOCK_BIN/$cmd"
}

# Create a mock command that fails with optional stderr
# Usage: create_failing_mock <command> [exit_code] [stderr_output]
create_failing_mock() {
  local cmd="$1"
  local code="${2:-1}"
  local output="${3:-}"
  printf '%s\n' "$output" > "$MOCK_BIN/${cmd}.err"
  printf '%s\n' "$code" > "$MOCK_BIN/${cmd}.exitcode"
  cat > "$MOCK_BIN/$cmd" <<'SCRIPT'
#!/usr/bin/env bash
cat "$(dirname "$0")/$(basename "$0").err" >&2
exit "$(cat "$(dirname "$0")/$(basename "$0").exitcode")"
SCRIPT
  chmod +x "$MOCK_BIN/$cmd"
}

# Remove a command from the test PATH (makes it "not found")
# Usage: remove_from_path <command>
remove_from_path() {
  local cmd="$1"
  rm -f "$MOCK_BIN/$cmd" "$MOCK_BIN/${cmd}.out" "$MOCK_BIN/${cmd}.err" "$MOCK_BIN/${cmd}.exitcode"
}

# Create a mock that records its arguments to a file
# Usage: create_recording_mock <command> [stdout_output]
create_recording_mock() {
  local cmd="$1"
  local output="${2:-}"
  printf '%s\n' "$output" > "$MOCK_BIN/${cmd}.out"
  local record_file="$MOCK_BIN/${cmd}.calls"
  cat > "$MOCK_BIN/$cmd" <<SCRIPT
#!/usr/bin/env bash
echo "\$@" >> "$record_file"
cat "$(dirname "\$0")/$(basename "\$0").out"
SCRIPT
  chmod +x "$MOCK_BIN/$cmd"
}

# Read recorded calls for a mock
# Usage: get_mock_calls <command>
get_mock_calls() {
  local cmd="$1"
  cat "$MOCK_BIN/${cmd}.calls" 2>/dev/null || true
}

teardown() {
  rm -rf "$MOCK_BIN"
}
