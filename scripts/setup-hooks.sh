#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Grimoires Hooks Setup Script
# Configures Claude Code to use Grimoires hooks
# ============================================================

GRIMOIRES_HOME="${GRIMOIRES_HOME:-$HOME/.grimoires}"
CLAUDE_DIR="$HOME/.claude"
HOOKS_CONFIG="$CLAUDE_DIR/hooks.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

print_banner() {
    echo -e "${CYAN}"
    echo "  ╔═══════════════════════════════════════════╗"
    echo "  ║       🔗 GRIMOIRES HOOKS SETUP 🔗         ║"
    echo "  ╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_grimoires() {
    if [ ! -d "$GRIMOIRES_HOME" ]; then
        error "Grimoires not installed at $GRIMOIRES_HOME"
        echo "Run the installer first: curl -fsSL https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.sh | bash"
        exit 1
    fi

    if [ ! -f "$GRIMOIRES_HOME/bin/grimoires-hooks" ]; then
        error "Grimoires hooks CLI not found"
        echo "Please update Grimoires: grimoires update"
        exit 1
    fi

    success "Grimoires installation found"
}

check_claude() {
    if ! command -v claude &> /dev/null; then
        warning "Claude Code CLI not found"
        echo "  Install: npm install -g @anthropic-ai/claude-code"
        echo ""
        echo "Continuing setup - hooks will work once Claude Code is installed."
    else
        success "Claude Code CLI found"
    fi
}

setup_claude_dir() {
    if [ ! -d "$CLAUDE_DIR" ]; then
        mkdir -p "$CLAUDE_DIR"
        success "Created $CLAUDE_DIR"
    fi
}

backup_existing_hooks() {
    if [ -f "$HOOKS_CONFIG" ]; then
        local backup="$HOOKS_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$HOOKS_CONFIG" "$backup"
        info "Backed up existing hooks to $backup"
    fi
}

generate_hooks_config() {
    local grimoires_hooks="$GRIMOIRES_HOME/bin/grimoires-hooks"

    cat > "$HOOKS_CONFIG" << EOF
{
  "\$schema": "https://json-schema.org/draft/2020-12/schema",
  "description": "Claude Code hooks configuration for Grimoires integration",
  "version": "0.3.0",

  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool == 'Bash' || tool == 'Write' || tool == 'Edit'",
        "hooks": [
          {
            "type": "command",
            "command": "$grimoires_hooks pre-tool-use --tool \$TOOL_NAME --command \"\$TOOL_INPUT\" --json",
            "timeout": 5000,
            "blocking": true
          }
        ]
      }
    ],

    "PostToolUse": [
      {
        "matcher": "tool == 'Write' || tool == 'Edit'",
        "hooks": [
          {
            "type": "command",
            "command": "$grimoires_hooks post-tool-use --tool \$TOOL_NAME --path \"\$TOOL_OUTPUT\" --success \$TOOL_SUCCESS --json",
            "timeout": 30000,
            "blocking": false
          }
        ]
      }
    ],

    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$grimoires_hooks session-start --json",
            "timeout": 5000,
            "blocking": false
          }
        ]
      }
    ],

    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$grimoires_hooks session-end --json",
            "timeout": 5000,
            "blocking": false
          }
        ]
      }
    ],

    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$grimoires_hooks pre-compact --json",
            "timeout": 5000,
            "blocking": false
          }
        ]
      }
    ],

    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$grimoires_hooks stop --json",
            "timeout": 5000,
            "blocking": false
          }
        ]
      }
    ]
  },

  "settings": {
    "enabled": true,
    "debug": false
  }
}
EOF

    success "Generated hooks configuration at $HOOKS_CONFIG"
}

create_simple_hooks_config() {
    # Alternative: Create minimal hooks config that points to Grimoires
    local grimoires_hooks="$GRIMOIRES_HOME/bin/grimoires-hooks"

    cat > "$HOOKS_CONFIG" << EOF
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "$grimoires_hooks pre-tool-use"
      }
    ],
    "PostToolUse": [
      {
        "type": "command",
        "command": "$grimoires_hooks post-tool-use"
      }
    ],
    "SessionStart": [
      {
        "type": "command",
        "command": "$grimoires_hooks session-start"
      }
    ]
  }
}
EOF

    success "Generated simple hooks configuration"
}

verify_setup() {
    echo ""
    info "Verifying setup..."

    # Test hooks CLI
    if "$GRIMOIRES_HOME/bin/grimoires-hooks" --help > /dev/null 2>&1; then
        success "Hooks CLI is functional"
    else
        warning "Hooks CLI may have issues - check Node.js installation"
    fi

    # Verify hooks.json syntax
    if command -v node &> /dev/null; then
        if node -e "JSON.parse(require('fs').readFileSync('$HOOKS_CONFIG'))" 2>/dev/null; then
            success "Hooks configuration is valid JSON"
        else
            error "Hooks configuration has invalid JSON"
            exit 1
        fi
    fi
}

print_success() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✨ Grimoires Hooks Setup Complete! ✨${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Configuration:${NC}"
    echo "    Claude hooks: $HOOKS_CONFIG"
    echo "    Grimoires hooks: $GRIMOIRES_HOME/core/hooks/hooks.json"
    echo ""
    echo -e "  ${CYAN}How it works:${NC}"
    echo "    - Claude Code events trigger Grimoires hooks"
    echo "    - Pre-tool checks prevent dangerous operations"
    echo "    - Post-tool actions run formatters & linters"
    echo "    - Session events manage context & memory"
    echo ""
    echo -e "  ${CYAN}Customize:${NC}"
    echo "    Edit: $GRIMOIRES_HOME/core/hooks/hooks.json"
    echo "    Add handlers: $GRIMOIRES_HOME/core/hooks/handlers/"
    echo ""
    echo -e "  ${CYAN}Test:${NC}"
    echo "    grimoires-hooks pre-tool-use --tool Bash --command 'git push' --json"
    echo ""
}

uninstall_hooks() {
    echo ""
    info "Removing Grimoires hooks configuration..."

    if [ -f "$HOOKS_CONFIG" ]; then
        rm -f "$HOOKS_CONFIG"
        success "Removed $HOOKS_CONFIG"
    else
        info "No hooks configuration found"
    fi

    echo ""
    echo "Hooks uninstalled. Claude Code will use its default behavior."
}

show_help() {
    cat << EOF
Grimoires Hooks Setup Script

Usage:
    setup-hooks.sh [command]

Commands:
    install     Install/update hooks configuration (default)
    uninstall   Remove hooks configuration
    verify      Verify current setup
    help        Show this help

Options:
    --simple    Use simple configuration without matchers
    --force     Overwrite without backup

Examples:
    ./setup-hooks.sh                    # Install hooks
    ./setup-hooks.sh install            # Install hooks
    ./setup-hooks.sh uninstall          # Remove hooks
    ./setup-hooks.sh verify             # Check setup
    ./setup-hooks.sh install --simple   # Simple config

EOF
}

# Parse arguments
COMMAND="${1:-install}"
USE_SIMPLE=false
FORCE=false

for arg in "$@"; do
    case $arg in
        --simple)
            USE_SIMPLE=true
            ;;
        --force)
            FORCE=true
            ;;
    esac
done

# Main
main() {
    print_banner

    case "$COMMAND" in
        install)
            check_grimoires
            check_claude
            setup_claude_dir

            if [ "$FORCE" != "true" ]; then
                backup_existing_hooks
            fi

            if [ "$USE_SIMPLE" = "true" ]; then
                create_simple_hooks_config
            else
                generate_hooks_config
            fi

            verify_setup
            print_success
            ;;

        uninstall)
            uninstall_hooks
            ;;

        verify)
            check_grimoires
            check_claude
            verify_setup
            success "Setup verified"
            ;;

        help|--help|-h)
            show_help
            ;;

        *)
            error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

main
